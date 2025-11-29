import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { extractMetaCookies, sendConversionEvent } from "@/lib/meta"
import { getServiceTierById, getServiceTierByPriceId, getStripe } from "@/lib/stripe"
import Stripe from "stripe"

const BUCKET = "order-assets"
const testEventCode = process.env.TEST_EVENT_CODE || process.env.META_CAPI_TEST_EVENT_CODE

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin env vars missing")
  }

  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function ensureBucketExists(admin: ReturnType<typeof createSupabaseAdminClient>) {
  try {
    await admin.storage.createBucket(BUCKET, { public: true })
  } catch {
    // bucket already exists
  }
}

function parseJsonField(value: FormDataEntryValue | null): Record<string, unknown> {
  if (!value || typeof value !== "string") return {}
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
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

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File
}

async function getOrCreateUserIdFromSession(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  session: Stripe.Checkout.Session
) {
  const email = session.customer_details?.email || session.customer_email || null
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : null
  const fullName = session.customer_details?.name || undefined

  if (!email) return null

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("email", email)
    .maybeSingle()

  if (existingProfile?.id) {
    if (!existingProfile.stripe_customer_id && stripeCustomerId) {
      await admin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", existingProfile.id)
    }
    return existingProfile.id
  }

  const redirectTo = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : undefined

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      stripe_customer_id: stripeCustomerId,
      source: "stripe_checkout",
    },
    redirectTo,
  })

  if (inviteError || !inviteData?.user?.id) {
    console.error("Intake: Failed to create user from Stripe checkout session", { email, inviteError })
    return null
  }

  const newUserId = inviteData.user.id

  if (stripeCustomerId) {
    const { error: profileUpdateError } = await admin
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", newUserId)

    if (profileUpdateError) {
      console.error("Intake: Failed to attach stripe_customer_id to profile", {
        userId: newUserId,
        stripeCustomerId,
        profileUpdateError,
      })
    }
  }

  return newUserId
}

async function uploadAsset(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  file: File,
  userId: string,
  orderId: string
) {
  await ensureBucketExists(admin)

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined
  const path = `orders/${userId}/${orderId}/${Date.now()}-${randomUUID()}${extension ? `.${extension}` : ""}`

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: false })

  if (uploadError) {
    console.error("Failed to upload order asset", uploadError)
    throw new Error("Failed to upload file")
  }

  const { data: publicUrl } = admin.storage.from(BUCKET).getPublicUrl(path)
  if (!publicUrl?.publicUrl) {
    throw new Error("Failed to resolve uploaded file URL")
  }

  return publicUrl.publicUrl
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL
    const referer = request.headers.get("referer") || origin || undefined
    const forwardedFor = request.headers.get("x-forwarded-for")
    const clientIpAddress = forwardedFor?.split(",")[0]?.trim()
    const clientUserAgent = request.headers.get("user-agent") || undefined
    const metaCookies = extractMetaCookies(request.headers.get("cookie"))

    const formData = await request.formData()
    const orderIdentifier =
      formData.get("order_id") ||
      formData.get("orderId") ||
      formData.get("checkout_session_id") ||
      formData.get("session_id")

    if (!orderIdentifier) {
      return NextResponse.json({ error: "order_id or checkout_session_id is required" }, { status: 400 })
    }

    const identifier = orderIdentifier.toString()
    const lookupColumn = identifier.startsWith("cs_") ? "stripe_checkout_session_id" : "id"

    const admin = getSupabaseAdmin()

    const stripe = getStripe()

    let { data: order, error: orderError } = await admin
      .from("orders")
      .select("*")
      .eq(lookupColumn, identifier)
      .single()

    if ((orderError || !order) && lookupColumn === "stripe_checkout_session_id") {
      try {
        const session = await stripe.checkout.sessions.retrieve(identifier, {
          expand: ["customer", "customer_details", "line_items.data.price"],
        })
        const lineItems = session.line_items?.data || []
        const firstLine = lineItems[0]
        const priceId = (firstLine?.price && typeof firstLine.price === "object" ? firstLine.price.id : undefined) ||
          (typeof firstLine?.price === "string" ? firstLine.price : undefined)
        const tierFromMetadata = session.metadata?.tier ? getServiceTierById(session.metadata.tier) : null
        const tierFromPrice = priceId ? getServiceTierByPriceId(priceId) : null
        const tier = tierFromMetadata || tierFromPrice
        const quizData = parseMetadataJson(session.metadata?.quiz_data)
        let orderUserId = session.metadata?.user_id
        const sessionEmail = session.customer_details?.email || session.customer_email || undefined

        if (!tier) {
          console.error("Intake fallback: Missing tier; metadata and price lookup failed", {
            identifier,
            metadataTier: session.metadata?.tier,
            priceId,
          })
          return NextResponse.json({ error: "Order not found", code: "missing_tier" }, { status: 404 })
        }

        if (!orderUserId) {
          orderUserId = await getOrCreateUserIdFromSession(admin, session)
          if (!orderUserId) {
            console.error("Intake fallback: Could not resolve user from Stripe session", {
              identifier,
              email: sessionEmail,
            })
            return NextResponse.json({ error: "Order not found", code: "missing_user" }, { status: 404 })
          }
        }

        const upsertResult = await admin
          .from("orders")
          .upsert(
            {
              user_id: orderUserId,
              tier: tier.id,
              status: "pending_interview",
              quiz_data: quizData,
              stripe_checkout_session_id: session.id,
            },
            { onConflict: "stripe_checkout_session_id" }
          )
          .select()
          .single()

        if (upsertResult.error) {
          console.error("Intake fallback: Failed to create order from Stripe session", upsertResult.error)
          return NextResponse.json({ error: "Order not found", code: "upsert_failed" }, { status: 404 })
        }

        order = upsertResult.data
      } catch (stripeError) {
        console.error("Intake fallback: Failed to retrieve Stripe session for intake", stripeError)
        return NextResponse.json({ error: "Order not found", code: "stripe_session_lookup_failed" }, { status: 404 })
      }
    }

    if (orderError || !order) {
      console.error("Order not found for intake", { identifier, orderError })
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderUserId = order.user_id

    if (user && orderUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If no authenticated user (guest checkout), continue using the order's user_id
    const actingUserId = user?.id || orderUserId

    const quizPayload = parseJsonField(formData.get("quiz_data") || formData.get("quizData"))
    const interviewPayload = parseJsonField(formData.get("interview_data") || formData.get("interviewData"))

    const audioNoteFile = formData.get("audio_note") || formData.get("audioNote")

    // Handle multiple reference photos
    const referencePhotoUrls: string[] = []

    // Check for indexed photos (reference_photo_0, reference_photo_1, etc.)
    for (let i = 0; i < 20; i++) {
      const photoFile = formData.get(`reference_photo_${i}`)
      if (isFile(photoFile)) {
        const url = await uploadAsset(admin, photoFile, actingUserId, order.id)
        referencePhotoUrls.push(url)
      }
    }

    // Also check for single reference_photo for backwards compatibility
    const singlePhoto = formData.get("reference_photo") || formData.get("referencePhoto")
    if (isFile(singlePhoto)) {
      const url = await uploadAsset(admin, singlePhoto, actingUserId, order.id)
      referencePhotoUrls.push(url)
    }

    let audioNoteUrl: string | undefined

    if (isFile(audioNoteFile)) {
      audioNoteUrl = await uploadAsset(admin, audioNoteFile, actingUserId, order.id)
    }

    const mergedQuiz = { ...(order.quiz_data || {}), ...quizPayload }
    const mergedInterview = {
      ...(order.interview_data || {}),
      ...interviewPayload,
      ...(referencePhotoUrls.length > 0 ? { reference_photo_urls: referencePhotoUrls } : {}),
      // Keep single URL for backwards compatibility (use first photo)
      ...(referencePhotoUrls.length > 0 ? { reference_photo_url: referencePhotoUrls[0] } : {}),
      ...(audioNoteUrl ? { audio_note_url: audioNoteUrl } : {}),
    }

    const nextStatus = order.status === "ready" ? "ready" : "in_production"

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: nextStatus,
        quiz_data: mergedQuiz,
        interview_data: mergedInterview,
      })
      .eq("id", order.id)

    if (updateError) {
      console.error("Failed to update order intake", updateError)
      return NextResponse.json({ error: "Failed to save interview" }, { status: 500 })
    }

    sendConversionEvent({
      eventName: "SubmitApplication",
      eventSourceUrl: referer,
      eventId: `interview-${order.id}`,
      userData: {
        email: user?.email || undefined,
        externalId: actingUserId,
        clientIpAddress,
        clientUserAgent,
        fbp: metaCookies.fbp,
        fbc: metaCookies.fbc,
      },
      customData: {
        content_category: "director_interview",
        content_ids: [order.id],
      },
      testEventCode: testEventCode || undefined,
    }).catch((error) => {
      console.error("Failed to send SubmitApplication to Meta", error)
    })

    return NextResponse.json({
      success: true,
      order_id: order.id,
      status: nextStatus,
      interview_data: mergedInterview,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save interview"
    console.error("Intake API error:", message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
