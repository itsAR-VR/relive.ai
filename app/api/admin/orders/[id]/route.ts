import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Helper to verify admin status
async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single()

  if (error || !profile?.is_admin) {
    return false
  }
  return true
}

// GET - Fetch single order details (admin only)
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

    // Verify admin
    const isAdmin = await verifyAdmin(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles(email, full_name)
      `)
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Failed to get order:", error)
    return NextResponse.json({ error: "Failed to get order" }, { status: 500 })
  }
}

// PATCH - Update order (admin only)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: orderId } = await params
    const body = await request.json()
    
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin
    const isAdmin = await verifyAdmin(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Validate status if provided
    const validStatuses = ["pending", "pending_interview", "interview_in_progress", "in_production", "ready", "delivered", "cancelled"]
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Build update payload - only include fields that are provided
    const updatePayload: Record<string, unknown> = {}
    
    if (body.status !== undefined) updatePayload.status = body.status
    if (body.final_video_url !== undefined) updatePayload.final_video_url = body.final_video_url
    if (body.recipient_email !== undefined) updatePayload.recipient_email = body.recipient_email
    if (body.recipient_name !== undefined) updatePayload.recipient_name = body.recipient_name
    if (body.interview_data !== undefined) updatePayload.interview_data = body.interview_data
    if (body.quiz_data !== undefined) updatePayload.quiz_data = body.quiz_data

    // Add updated_at timestamp
    updatePayload.updated_at = new Date().toISOString()

    if (Object.keys(updatePayload).length === 1) {
      // Only updated_at, nothing else to update
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select(`
        id,
        user_id,
        status,
        tier,
        created_at,
        updated_at,
        stripe_checkout_session_id,
        final_video_url,
        interview_data,
        quiz_data,
        view_token,
        first_viewed_at,
        recipient_email,
        recipient_name,
        amount_paid
      `)
      .single()

    if (updateError) {
      console.error("Failed to update order:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ 
      order: updatedOrder, 
      message: "Order updated successfully" 
    })
  } catch (error) {
    console.error("Failed to update order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

// DELETE - Cancel/delete order (admin only)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin
    const isAdmin = await verifyAdmin(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Soft delete by setting status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "cancelled",
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)
      .select("id, status")
      .single()

    if (updateError) {
      console.error("Failed to cancel order:", updateError)
      return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
    }

    return NextResponse.json({ 
      order: updatedOrder, 
      message: "Order cancelled successfully" 
    })
  } catch (error) {
    console.error("Failed to cancel order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
