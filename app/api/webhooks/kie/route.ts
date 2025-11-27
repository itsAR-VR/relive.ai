import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createHmac, timingSafeEqual } from "crypto"

type KieWebhookResultJson = {
  resultUrls?: string[]
}

type KieWebhookData = {
  taskId?: string
  task_id?: string
  id?: string
  state?: string
  resultJson?: string | KieWebhookResultJson | null
  resultUrls?: string[]
  param?: unknown
  failCode?: string | number | null
  failMsg?: string | null
}

type KieWebhookPayload = {
  code?: number
  message?: string
  data?: KieWebhookData
  job_id?: string
  jobId?: string
  id?: string
  status?: string
  result_url?: string
  output_url?: string
  error?: string
  error_message?: string
  type?: string
}

const TERMINAL_STATUSES = new Set(["completed", "failed"])

const STATUS_MAP: Record<string, "processing" | "completed" | "failed"> = {
  completed: "completed",
  succeeded: "completed",
  success: "completed",
  done: "completed",
  finished: "completed",
  failed: "failed",
  fail: "failed",
  error: "failed",
  errored: "failed",
  cancelled: "failed",
  canceled: "failed",
  processing: "processing",
  pending: "processing",
  running: "processing",
  queued: "processing",
  waiting: "processing",
  queuing: "processing",
  generating: "processing",
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are missing for webhook handling")
  }

  return createClient(url, serviceRoleKey)
}

function normalizeStatus(status?: string | null): "processing" | "completed" | "failed" {
  if (!status) return "processing"
  const normalized = STATUS_MAP[String(status).toLowerCase()]
  return normalized || "processing"
}

function safeCompare(a?: string | null, b?: string | null) {
  if (!a || !b) return false
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

function verifySignature(rawBody: string, headers: Headers) {
  const secret = process.env.KIE_WEBHOOK_SECRET
  if (!secret) return true

  const signature =
    headers.get("x-kie-signature") || headers.get("x-kie-signature-sha256")
  const sharedSecretHeader =
    headers.get("x-kie-secret") || headers.get("x-kie-webhook-secret")

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")

  const signatureMatches = safeCompare(signature, expected)
  const sharedSecretMatches = safeCompare(sharedSecretHeader, secret)

  return signatureMatches || sharedSecretMatches
}

function isIpAllowlisted(headers: Headers) {
  const allowlist = process.env.KIE_WEBHOOK_IP_ALLOWLIST
  if (!allowlist) return true

  const allowed = allowlist
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean)

  if (!allowed.length) return true

  const requestIp =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim()

  if (!requestIp) return false
  return allowed.includes(requestIp)
}

function extractJobId(payload: KieWebhookPayload) {
  return (
    payload.data?.taskId ||
    payload.data?.task_id ||
    payload.data?.id ||
    payload.job_id ||
    payload.jobId ||
    payload.id
  )
}

function parseResultUrls(resultJson?: KieWebhookData["resultJson"], jobId?: string) {
  if (!resultJson) return undefined

  if (typeof resultJson === "object") {
    const urls = resultJson.resultUrls
    if (Array.isArray(urls)) {
      return urls.filter(Boolean)
    }
    return undefined
  }

  if (typeof resultJson === "string") {
    try {
      const parsed = JSON.parse(resultJson) as KieWebhookResultJson
      if (parsed && Array.isArray(parsed.resultUrls)) {
        return parsed.resultUrls.filter(Boolean)
      }
    } catch (error) {
      console.warn("Failed to parse Kie resultJson", {
        jobId,
        error,
      })
    }
  }

  return undefined
}

function extractResultUrl(payload: KieWebhookPayload, jobId?: string) {
  const resultUrls =
    (payload.data?.resultUrls && payload.data.resultUrls.filter(Boolean)) ||
    parseResultUrls(payload.data?.resultJson, jobId)

  if (resultUrls?.length) {
    return resultUrls[0]
  }

  return payload.result_url || payload.output_url
}

function extractErrorMessage(payload: KieWebhookPayload) {
  const failMsg = payload.data?.failMsg
  if (failMsg) return failMsg

  const failCode = payload.data?.failCode
  if (failCode !== undefined && failCode !== null) {
    return `Kie error ${failCode}`
  }

  return payload.error || payload.error_message || payload.message || "Processing failed"
}

/**
 * Kie.ai Webhook Handler
 * Processes callbacks for both enhance and generate jobs
 */
export async function POST(request: Request) {
  const rawBody = await request.text()

  if (!isIpAllowlisted(request.headers)) {
    console.warn("Kie webhook blocked: IP not allowlisted")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (process.env.KIE_WEBHOOK_SECRET && !verifySignature(rawBody, request.headers)) {
    console.warn("Kie webhook blocked: signature/shared secret mismatch")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  } else if (!process.env.KIE_WEBHOOK_SECRET && !process.env.KIE_WEBHOOK_IP_ALLOWLIST) {
    console.warn("Kie webhook received without any verification configured")
  }

  let body: KieWebhookPayload

  try {
    body = JSON.parse(rawBody || "{}")
  } catch (err) {
    console.error("Invalid webhook payload:", err)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const jobId = extractJobId(body)
  const resultUrl = extractResultUrl(body, jobId || undefined)
  const incomingStatus = normalizeStatus(body.data?.state || body.status)
  const errorMessage = extractErrorMessage(body)

  if (!jobId) {
    return NextResponse.json({ error: "Missing job identifier" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: generation, error: findError } = await supabase
    .from("generations")
    .select("id, status, user_id, credits_used, result_url, error_message, completed_at, type")
    .eq("replicate_prediction_id", jobId)
    .single()

  if (findError || !generation) {
    console.warn("Kie webhook received for unknown job ID", {
      jobId,
      status: body.status,
      state: body.data?.state,
    })
    return NextResponse.json({ success: true })
  }

  if (TERMINAL_STATUSES.has(generation.status)) {
    console.log("Webhook received for already finalized job", {
      jobId,
      existingStatus: generation.status,
    })
    return NextResponse.json({ success: true })
  }

  const updates: Record<string, unknown> = {}
  let shouldRefund = false

  if (incomingStatus === "completed") {
    updates.status = "completed"
    if (resultUrl && resultUrl !== generation.result_url) {
      updates.result_url = resultUrl
    }
    if (!generation.completed_at) {
      updates.completed_at = new Date().toISOString()
    }
  } else if (incomingStatus === "failed") {
    updates.status = "failed"
    const errorToSet =
      errorMessage || generation.error_message || "Processing failed"
    if (errorToSet !== generation.error_message) {
      updates.error_message = errorToSet
    }
    if (!generation.completed_at) {
      updates.completed_at = new Date().toISOString()
    }
    shouldRefund = true
  } else if (generation.status !== "processing") {
    updates.status = "processing"
  }

  if (Object.keys(updates).length) {
    const { error: updateError } = await supabase
      .from("generations")
      .update(updates)
      .eq("id", generation.id)

    if (updateError) {
      console.error("Failed to update generation from webhook", {
        jobId,
        error: updateError,
      })
      return NextResponse.json(
        { error: "Failed to update generation" },
        { status: 500 }
      )
    }
  }

  if (incomingStatus === "failed" && shouldRefund) {
    const creditsToRefund = generation.credits_used || 0
    if (creditsToRefund > 0) {
      const { error: refundError } = await supabase.rpc("add_credits", {
        user_uuid: generation.user_id,
        amount: creditsToRefund,
      })

      if (refundError) {
        console.error("Failed to refund credits after webhook failure", {
          jobId,
          generationId: generation.id,
          error: refundError,
        })
      }
    }
  }

  console.log("Kie webhook processed", {
    jobId,
    status: incomingStatus,
    generationId: generation.id,
    type: generation.type,
  })

  return NextResponse.json({ success: true })
}

// Kie.ai may use GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "ok" })
}
