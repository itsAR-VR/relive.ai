import { createClient } from "@/lib/supabase/server"
import { extractMetaCookies, sendConversionEvent } from "@/lib/meta"
import { getServiceTierById, getStripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE

export async function POST(request: Request) {
  try {
    let supabase: Awaited<ReturnType<typeof createClient>> | null = null
    let user: { id: string; email?: string | null } | null = null

    try {
      supabase = await createClient()
      const {
        data: { user: supabaseUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.warn("Supabase auth lookup failed, proceeding as guest", authError)
      } else {
        user = supabaseUser
      }
    } catch (authInitError) {
      console.warn("Supabase client unavailable, proceeding as guest", authInitError)
    }

    const body = await request.json()
    const { tierId, tier, packageId, quizData } = body
    const serviceTierId: string | undefined = tierId || tier || packageId

    if (!serviceTierId) {
      return NextResponse.json({ error: "Service tier is required" }, { status: 400 })
    }

    const serviceTier = getServiceTierById(serviceTierId)

    if (!serviceTier) {
      return NextResponse.json({ error: "Invalid service tier" }, { status: 400 })
    }

    const stripe = getStripe()
    let stripeCustomerId: string | undefined
    let customerEmail: string | undefined

    if (user && supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single()

      if (profile?.stripe_customer_id) {
        stripeCustomerId = profile.stripe_customer_id
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_user_id: user.id },
        })
        stripeCustomerId = customer.id

        await supabase
          .from("profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("id", user.id)
      }

      customerEmail = user.email || undefined
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL

    const metadata: Record<string, string> = { tier: serviceTier.id }

    if (user?.id) {
      metadata.user_id = user.id
    }

    if (quizData) {
      try {
        metadata.quiz_data =
          typeof quizData === "string" ? quizData : JSON.stringify(quizData)
      } catch {
        // ignore serialization errors; omit quiz data if it can't be stringified
      }
    }

    const lineItem = serviceTier.priceId
      ? { price: serviceTier.priceId, quantity: 1 }
      : {
          price_data: {
            currency: "USD",
            unit_amount: Math.round(serviceTier.price * 100),
            product_data: {
              name: serviceTier.name,
              metadata: { tier: serviceTier.id },
            },
          },
          quantity: 1,
        }

    if (!serviceTier.priceId) {
      metadata.price_fallback = "inline_price_data"
    }

    const session = await stripe.checkout.sessions.create({
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
      line_items: [lineItem],
      mode: "payment",
      success_url: `${origin}/director-interview?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata,
    })

    const referer = request.headers.get("referer") || origin
    const forwardedFor = request.headers.get("x-forwarded-for")
    const clientIpAddress = forwardedFor?.split(",")[0]?.trim()
    const clientUserAgent = request.headers.get("user-agent") || undefined
    const metaCookies = extractMetaCookies(request.headers.get("cookie"))

    sendConversionEvent({
      eventName: "InitiateCheckout",
      eventSourceUrl: referer,
      eventId: session.id,
      userData: {
        email: customerEmail,
        externalId: user?.id || undefined,
        clientIpAddress,
        clientUserAgent,
        fbp: metaCookies.fbp,
        fbc: metaCookies.fbc,
      },
      customData: {
        currency: "USD",
        value: serviceTier.price,
        content_category: "gift_package",
        content_ids: [serviceTier.id],
        content_name: serviceTier.name,
      },
      testEventCode: testEventCode || undefined,
    }).catch((error) => {
      console.error("Failed to send InitiateCheckout to Meta", error)
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session"
    console.error("Stripe checkout error:", message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
