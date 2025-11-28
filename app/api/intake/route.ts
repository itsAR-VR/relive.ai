import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { extractMetaCookies, sendConversionEvent } from "@/lib/meta"

const BUCKET = "order-assets"

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

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File
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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("*")
      .eq(lookupColumn, identifier)
      .single()

    if (orderError || !order) {
      console.error("Order not found for intake", { identifier, orderError })
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const quizPayload = parseJsonField(formData.get("quiz_data") || formData.get("quizData"))
    const interviewPayload = parseJsonField(formData.get("interview_data") || formData.get("interviewData"))

    const referencePhotoFile = formData.get("reference_photo") || formData.get("referencePhoto")
    const audioNoteFile = formData.get("audio_note") || formData.get("audioNote")

    let referencePhotoUrl: string | undefined
    let audioNoteUrl: string | undefined

    if (isFile(referencePhotoFile)) {
      referencePhotoUrl = await uploadAsset(admin, referencePhotoFile, user.id, order.id)
    }

    if (isFile(audioNoteFile)) {
      audioNoteUrl = await uploadAsset(admin, audioNoteFile, user.id, order.id)
    }

    const mergedQuiz = { ...(order.quiz_data || {}), ...quizPayload }
    const mergedInterview = {
      ...(order.interview_data || {}),
      ...interviewPayload,
      ...(referencePhotoUrl ? { reference_photo_url: referencePhotoUrl } : {}),
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
        email: user.email,
        externalId: user.id,
        clientIpAddress,
        clientUserAgent,
        fbp: metaCookies.fbp,
        fbc: metaCookies.fbc,
      },
      customData: {
        content_category: "director_interview",
        content_ids: [order.id],
      },
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
