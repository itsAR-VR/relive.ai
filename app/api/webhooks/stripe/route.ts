import { getServiceTierById, getStripe } from "@/lib/stripe"
import { sendConversionEvent } from "@/lib/meta"
import { sendOrderConfirmationEmail } from "@/lib/resend"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const testEventCode = process.env.TEST_EVENT_CODE || process.env.META_CAPI_TEST_EVENT_CODE

// Lazy-load supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function parseMetadataJson(value?: string | null) {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

async function getOrCreateUserIdFromSession(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  session: Stripe.Checkout.Session
) {
  const email = session.customer_details?.email || session.customer_email || null
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : null
  const fullName = session.customer_details?.name || undefined

  if (!email) return null

  // Existing profile by email
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("email", email)
    .maybeSingle()

  if (existingProfile?.id) {
    if (!existingProfile.stripe_customer_id && stripeCustomerId) {
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", existingProfile.id)
    }
    return existingProfile.id
  }

  // Invite creates a user and emails them to set a password
  const redirectTo = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : undefined

  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      stripe_customer_id: stripeCustomerId,
      source: "stripe_checkout",
    },
    redirectTo,
  })

  if (inviteError || !inviteData?.user?.id) {
    console.error("Failed to create user from Stripe checkout", { email, inviteError })
    return null
  }

  const newUserId = inviteData.user.id

  // CRITICAL: Create profile for the new user
  // The orders table has FK to profiles, so profile must exist before order can be created
  const { error: profileCreateError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: newUserId,
      email: email,
      full_name: fullName || null,
      stripe_customer_id: stripeCustomerId || null,
    }, { onConflict: "id" })

  if (profileCreateError) {
    console.error("Failed to create profile for new user", {
      userId: newUserId,
      email,
      profileCreateError,
    })
  }

  return newUserId
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  const stripe = getStripe()
  const supabaseAdmin = getSupabaseAdmin()

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const tierId = session.metadata?.tier
      const quizData = parseMetadataJson(session.metadata?.quiz_data)
      const customQuantityRaw = session.metadata?.custom_quantity
      const customQuantity = customQuantityRaw ? Number.parseInt(customQuantityRaw, 10) : null
      const tier = tierId ? getServiceTierById(tierId) : null
      const customerEmail =
        session.customer_details?.email || session.customer_email || undefined
      let resolvedUserId = userId

      if (!resolvedUserId) {
        resolvedUserId = await getOrCreateUserIdFromSession(supabaseAdmin, session)
      }

      if (!resolvedUserId || !tier) {
        console.error("Missing user or tier for checkout.session.completed", {
          sessionId: session.id,
          userId: resolvedUserId,
          tierId,
        })
        break
      }

      const isCustom = tier.id === "custom"
      const enrichedQuizData = isCustom && customQuantity && Number.isFinite(customQuantity)
        ? { ...quizData, expected_photo_count: customQuantity }
        : quizData
      const effectiveQuantity = isCustom && customQuantity && Number.isFinite(customQuantity) ? customQuantity : 1
      const fallbackAmountPaid = Math.round(tier.price * 100 * effectiveQuantity)

      const { data: orderData, error } = await supabaseAdmin
        .from("orders")
        .upsert(
          {
            user_id: resolvedUserId,
            tier: tier.id,
            status: "pending_interview",
            quiz_data: enrichedQuizData,
            stripe_checkout_session_id: session.id,
            amount_paid: session.amount_total || fallbackAmountPaid,
            ...(isCustom ? { view_token: null, recipient_email: null, recipient_name: null } : {}),
          },
          { onConflict: "stripe_checkout_session_id" }
        )
        .select("id")
        .single()

      if (error) {
        console.error("Failed to create order from checkout.session.completed", error)
      }

      // Send order confirmation email with order ID
      if (orderData?.id && customerEmail) {
        const amount = session.amount_total ? session.amount_total / 100 : tier.price
        sendOrderConfirmationEmail({
          orderId: orderData.id,
          customerName: session.customer_details?.name || "",
          customerEmail,
          tierName: tier.name,
          tierPrice: amount,
          currency: session.currency?.toUpperCase() || "USD",
        }).catch((emailError) => {
          console.error("Failed to send order confirmation email:", emailError)
        })
      }

      const amount = session.amount_total ? session.amount_total / 100 : (fallbackAmountPaid / 100)
      const currency = session.currency ? session.currency.toUpperCase() : "USD"

      sendConversionEvent({
        eventName: "Purchase",
        eventTime: event.created,
        eventId: session.id,
        eventSourceUrl: session.success_url || process.env.NEXT_PUBLIC_APP_URL,
        userData: {
          email: customerEmail,
          externalId: resolvedUserId || undefined,
        },
        customData: {
          currency,
          value: amount,
          content_category: "gift_package",
          content_ids: [tier.id],
          content_name: tier.name,
        },
        testEventCode: testEventCode || undefined,
      }).catch((metaError) => {
        console.error("Failed to send Purchase to Meta", metaError)
      })

      break
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      break
    }
  }

  return NextResponse.json({ received: true })
}
