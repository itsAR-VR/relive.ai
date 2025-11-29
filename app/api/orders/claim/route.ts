import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { getServiceTierById, getServiceTierByPriceId, getStripe } from "@/lib/stripe"
import Stripe from "stripe"

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin env vars missing")
  }

    return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { order_id: orderId, session_id: sessionId } = body

    if (!orderId && !sessionId) {
      return NextResponse.json({ error: "order_id or session_id is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    const stripe = getStripe()

    const lookupColumn = sessionId ? "stripe_checkout_session_id" : "id"
    const lookupValue = sessionId || orderId

    let { data: order, error: orderError } = await admin
      .from("orders")
      .select("*")
      .eq(lookupColumn, lookupValue)
      .single()

    if (orderError || !order) {
      if (!sessionId) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      // Create order from Stripe session if missing
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["line_items.data.price", "customer", "customer_details"],
        })

        const lineItems = session.line_items?.data || []
        const firstLine = lineItems[0]
        const priceId = (firstLine?.price && typeof firstLine.price === "object" ? firstLine.price.id : undefined) ||
          (typeof firstLine?.price === "string" ? firstLine.price : undefined)
        const tierFromMetadata = session.metadata?.tier ? getServiceTierById(session.metadata.tier) : null
        const tierFromPrice = priceId ? getServiceTierByPriceId(priceId) : null
        const tier = tierFromMetadata || tierFromPrice
        const quizData = parseMetadataJson(session.metadata?.quiz_data)

        if (!tier) {
          console.error("Order claim fallback: Missing tier for session", { sessionId, priceId, tierMeta: session.metadata?.tier })
          return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Ensure profile exists before creating order (FK constraint)
        const customerEmail = session.customer_details?.email || session.customer_email
        await admin
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email || customerEmail || null,
            full_name: session.customer_details?.name || null,
          }, { onConflict: "id" })

        const upsertResult = await admin
          .from("orders")
          .upsert(
            {
              user_id: user.id,
              tier: tier.id,
              status: "pending_interview",
              quiz_data: quizData,
              stripe_checkout_session_id: session.id,
            },
            { onConflict: "stripe_checkout_session_id" }
          )
          .select()
          .single()

        if (upsertResult.error || !upsertResult.data) {
          console.error("Order claim fallback: upsert failed", upsertResult.error)
          return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        order = upsertResult.data
      } catch (stripeError) {
        console.error("Order claim fallback: Stripe session lookup failed", stripeError)
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
    }

    if (order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: "Order is already claimed" }, { status: 403 })
    }

    const { error: updateError, data: updated } = await admin
      .from("orders")
      .update({ user_id: user.id })
      .eq("id", order.id)
      .select()
      .single()

    if (updateError) {
      console.error("Order claim failed", updateError)
      return NextResponse.json({ error: "Failed to claim order" }, { status: 500 })
    }

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error("Order claim error", error)
    return NextResponse.json({ error: "Failed to claim order" }, { status: 500 })
  }
}
