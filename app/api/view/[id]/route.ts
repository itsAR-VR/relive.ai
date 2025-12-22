import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Use service role client for updating first_viewed_at
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// POST - Record first view of a gift
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: orderId } = await params
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch order and verify token
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, view_token, first_viewed_at, status")
      .eq("id", orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify token matches
    if (order.view_token !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }

    // Check order is viewable
    if (!["ready", "delivered"].includes(order.status)) {
      return NextResponse.json({ error: "Order not ready for viewing" }, { status: 400 })
    }

    // If already viewed, just return success
    if (order.first_viewed_at) {
      return NextResponse.json({
        recorded: false,
        message: "Already viewed",
        first_viewed_at: order.first_viewed_at
      })
    }

    // Record first view
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from("orders")
      .update({ first_viewed_at: now })
      .eq("id", orderId)

    if (updateError) {
      console.error("Failed to record view:", updateError)
      return NextResponse.json({ error: "Failed to record view" }, { status: 500 })
    }

    return NextResponse.json({
      recorded: true,
      message: "First view recorded",
      first_viewed_at: now
    })
  } catch (error) {
    console.error("Failed to record view:", error)
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 })
  }
}

// GET - Validate token and get order for viewing
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: orderId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    const supabase = createServiceClient()

    // Fetch order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, view_token, status, tier, final_video_url, interview_data, created_at, recipient_name")
      .eq("id", orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.tier === "custom") {
      return NextResponse.json({ error: "Order not viewable" }, { status: 404 })
    }

    // Check order is viewable
    if (!["ready", "delivered"].includes(order.status)) {
      return NextResponse.json({ error: "Order not ready for viewing" }, { status: 400 })
    }

    // If token provided, validate it
    if (token && order.view_token !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }

    // Return order data (excluding view_token for security)
    const { view_token: _, ...safeOrder } = order
    return NextResponse.json({ order: safeOrder, valid: true })
  } catch (error) {
    console.error("Failed to validate view:", error)
    return NextResponse.json({ error: "Failed to validate" }, { status: 500 })
  }
}
