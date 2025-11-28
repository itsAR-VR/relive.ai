import { extractMetaCookies, sendConversionEvent } from "@/lib/meta"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      event_name,
      event_time,
      event_source_url,
      action_source = "website",
      event_id,
      custom_data,
      user_data = {},
      test_event_code,
    } = body

    if (!event_name || !event_source_url) {
      return NextResponse.json(
        { error: "event_name and event_source_url are required" },
        { status: 400 }
      )
    }

    const forwardedFor = request.headers.get("x-forwarded-for")
    const clientIpAddress = forwardedFor?.split(",")[0]?.trim() || request.ip || undefined
    const clientUserAgent = request.headers.get("user-agent") || undefined

    const cookies = extractMetaCookies(request.headers.get("cookie"))

    const result = await sendConversionEvent({
      eventName: event_name,
      eventTime: typeof event_time === "number" ? event_time : undefined,
      eventSourceUrl: event_source_url,
      actionSource: action_source,
      eventId: event_id,
      customData: custom_data,
      testEventCode: test_event_code,
      userData: {
        email: user_data.email,
        phone: user_data.phone,
        firstName: user_data.first_name,
        lastName: user_data.last_name,
        city: user_data.city,
        state: user_data.state,
        zip: user_data.zip,
        country: user_data.country,
        externalId: user_data.external_id,
        clientUserAgent,
        clientIpAddress,
        fbp: user_data.fbp || cookies.fbp,
        fbc: user_data.fbc || cookies.fbc,
      },
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Failed to send event" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Meta Conversions API proxy error", error)
    return NextResponse.json({ error: "Failed to forward event" }, { status: 500 })
  }
}
