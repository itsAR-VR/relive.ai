import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Fetch interview progress for an order
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, interview_data, quiz_data, status, tier")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Failed to get interview progress:", error)
    return NextResponse.json({ error: "Failed to get interview" }, { status: 500 })
  }
}

// PATCH - Save interview progress (partial update)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: orderId } = await params
    const body = await request.json()
    const { interview_data, step } = body

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify order belongs to user and is in correct status
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("id, interview_data, status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (existingOrder.status !== "pending_interview") {
      return NextResponse.json(
        { error: "Interview already completed for this order" },
        { status: 400 }
      )
    }

    // Merge new interview data with existing
    const mergedInterviewData = {
      ...(existingOrder.interview_data || {}),
      ...interview_data,
      last_step: step,
      last_saved_at: new Date().toISOString(),
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ interview_data: mergedInterviewData })
      .eq("id", orderId)
      .select("id, interview_data, status")
      .single()

    if (updateError) {
      console.error("Failed to save interview progress:", updateError)
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
    }

    return NextResponse.json({ order: updatedOrder, saved: true })
  } catch (error) {
    console.error("Failed to save interview progress:", error)
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
  }
}
