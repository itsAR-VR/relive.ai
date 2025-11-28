import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin env vars missing")
  }

  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
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

    const lookupColumn = sessionId ? "stripe_checkout_session_id" : "id"
    const lookupValue = sessionId || orderId

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("*")
      .eq(lookupColumn, lookupValue)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
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
