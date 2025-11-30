import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { sendCustomerConfirmationEmail, sendAdminNotificationEmail } from "@/lib/resend"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseAdminClient(supabaseUrl, supabaseServiceKey)
}

interface SupportTicketBody {
  name: string
  email: string
  subject: string
  message: string
  orderId?: string
}

const VALID_SUBJECTS = [
  "General Inquiry",
  "Order Issue",
  "Technical Problem",
  "Billing",
  "Other",
]

export async function POST(request: NextRequest) {
  try {
    const body: SupportTicketBody = await request.json()
    const { name, email, subject, message, orderId } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, subject, and message are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate subject
    if (!VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json(
        { error: `Invalid subject. Must be one of: ${VALID_SUBJECTS.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long" },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be less than 5000 characters" },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Validate order ID if provided
    if (orderId) {
      const { data: order, error: orderError } = await admin
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .single()

      if (orderError || !order) {
        return NextResponse.json(
          { error: "Invalid order ID" },
          { status: 400 }
        )
      }
    }

    // Create the support ticket
    const { data: ticket, error: ticketError } = await admin
      .from("support_tickets")
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject,
        message: message.trim(),
        order_id: orderId || null,
        status: "open",
      })
      .select()
      .single()

    if (ticketError) {
      console.error("Failed to create support ticket:", ticketError)
      return NextResponse.json(
        { error: "Failed to create support ticket" },
        { status: 500 }
      )
    }

    // Send emails (don't fail the request if emails fail)
    const emailData = {
      ticketId: ticket.id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      orderId: ticket.order_id,
    }

    // Send both emails in parallel
    const [customerEmailResult, adminEmailResult] = await Promise.allSettled([
      sendCustomerConfirmationEmail(emailData),
      sendAdminNotificationEmail(emailData),
    ])

    // Log email results but don't fail the request
    if (customerEmailResult.status === "rejected") {
      console.error("Customer confirmation email failed:", customerEmailResult.reason)
    }
    if (adminEmailResult.status === "rejected") {
      console.error("Admin notification email failed:", adminEmailResult.reason)
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        created_at: ticket.created_at,
      },
      message: "Support ticket created successfully. We'll get back to you within 24-48 hours.",
    })
  } catch (error) {
    console.error("Support ticket API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
