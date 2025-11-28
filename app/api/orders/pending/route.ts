import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's most recent pending order with all relevant data
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, tier, status, quiz_data, interview_data, stripe_checkout_session_id, created_at")
      .eq("user_id", user.id)
      .in("status", ["pending_interview", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !order) {
      // No pending order found - might be normal
      return NextResponse.json({ order: null })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Failed to get pending order:", error)
    return NextResponse.json({ error: "Failed to get order" }, { status: 500 })
  }
}
