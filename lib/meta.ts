import crypto from "crypto"

type BaseUserData = {
  email?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  country?: string | null
  externalId?: string | null
  fbp?: string | null
  fbc?: string | null
  clientUserAgent?: string | null
  clientIpAddress?: string | null
}

export type ConversionEventInput = {
  eventName: string
  eventTime?: number
  eventSourceUrl?: string
  actionSource?: "email" | "website" | "app" | "phone_call" | "chat" | "physical_store" | "system_generated"
  eventId?: string
  userData?: BaseUserData
  customData?: Record<string, unknown>
  testEventCode?: string
  dataProcessingOptions?: {
    options: string[]
    country?: number
    state?: number
  }
}

const META_PIXEL_ID = process.env.META_PIXEL_ID
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const META_CAPI_API_VERSION = process.env.META_CAPI_API_VERSION || "v20.0"

const sha256 = (value?: string | null) => {
  if (!value) return null
  return crypto.createHash("sha256").update(value).digest("hex")
}

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || null
const normalizePhone = (phone?: string | null) => {
  if (!phone) return null
  const digits = phone.replace(/\D+/g, "")
  return digits.length ? digits : null
}
const normalizeName = (name?: string | null) => name?.trim().toLowerCase() || null
const normalizeText = (text?: string | null) => text?.trim().toLowerCase() || null

export function extractMetaCookies(cookieHeader?: string | null) {
  if (!cookieHeader) return { fbp: null as string | null, fbc: null as string | null }
  const parts = cookieHeader.split(";").map((c) => c.trim())
  const findValue = (key: string) => {
    const match = parts.find((c) => c.startsWith(`${key}=`))
    return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
  }
  return {
    fbp: findValue("_fbp"),
    fbc: findValue("_fbc"),
  }
}

function buildUserData(userData?: BaseUserData) {
  const safeData = userData || {}

  const user_data: Record<string, unknown> = {}

  const email = normalizeEmail(safeData.email)
  if (email) user_data.em = [sha256(email)]

  const phone = normalizePhone(safeData.phone)
  if (phone) user_data.ph = [sha256(phone)]

  const fn = normalizeName(safeData.firstName)
  if (fn) user_data.fn = sha256(fn)

  const ln = normalizeName(safeData.lastName)
  if (ln) user_data.ln = sha256(ln)

  const ct = normalizeText(safeData.city)
  if (ct) user_data.ct = sha256(ct)

  const st = normalizeText(safeData.state)
  if (st) user_data.st = sha256(st)

  const zip = normalizeText(safeData.zip)
  if (zip) user_data.zp = sha256(zip)

  const country = normalizeText(safeData.country)
  if (country) user_data.country = sha256(country)

  if (safeData.externalId) user_data.external_id = [sha256(safeData.externalId)]

  if (safeData.fbp) user_data.fbp = safeData.fbp
  if (safeData.fbc) user_data.fbc = safeData.fbc
  if (safeData.clientUserAgent) user_data.client_user_agent = safeData.clientUserAgent
  if (safeData.clientIpAddress) user_data.client_ip_address = safeData.clientIpAddress

  return user_data
}

export async function sendConversionEvent(event: ConversionEventInput) {
  if (!META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) {
    const error = "Missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN"
    console.error(error)
    return { ok: false, error }
  }

  const user_data = buildUserData(event.userData)

  const dataEntry: Record<string, unknown> = {
    event_name: event.eventName,
    event_time: event.eventTime || Math.floor(Date.now() / 1000),
    action_source: event.actionSource || "website",
    event_id: event.eventId,
    user_data,
  }

  if (event.eventSourceUrl) dataEntry.event_source_url = event.eventSourceUrl
  if (event.customData) dataEntry.custom_data = event.customData
  if (event.dataProcessingOptions?.options) {
    dataEntry.data_processing_options = event.dataProcessingOptions.options
    if (typeof event.dataProcessingOptions.country === "number") {
      dataEntry.data_processing_options_country = event.dataProcessingOptions.country
    }
    if (typeof event.dataProcessingOptions.state === "number") {
      dataEntry.data_processing_options_state = event.dataProcessingOptions.state
    }
  }

  const payload: Record<string, unknown> = {
    data: [dataEntry],
  }

  if (event.testEventCode) {
    payload.test_event_code = event.testEventCode
  }

  const url = `https://graph.facebook.com/${META_CAPI_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error")
      console.error("Meta Conversions API error", text)
      return { ok: false, error: text }
    }

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Meta Conversions API network error", message)
    return { ok: false, error: message }
  }
}
