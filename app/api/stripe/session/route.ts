import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "customer_details"],
    })

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      (typeof session.customer === "object" ? session.customer?.email : undefined)

    const name =
      session.customer_details?.name ||
      (typeof session.customer === "object" ? session.customer?.name : undefined)

    return NextResponse.json({
      id: session.id,
      email,
      name,
      metadata: session.metadata || {},
    })
  } catch (error) {
    console.error("Stripe session lookup failed", error)
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 })
  }
}
