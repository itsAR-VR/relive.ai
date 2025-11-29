import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role for this endpoint since it's called before auth
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin env vars missing")
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// POST - Store email → session_id mapping before magic link
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, session_id } = body

    if (!email || !session_id) {
      return NextResponse.json(
        { error: "email and session_id are required" },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Upsert to handle retries (user might send multiple magic links)
    const { error } = await admin
      .from("pending_checkouts")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          stripe_session_id: session_id,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "email" }
      )

    if (error) {
      // Table might not exist yet - non-fatal, continue anyway
      console.error("Failed to store pending checkout:", error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Pending checkout error:", error)
    // Non-fatal - don't break the magic link flow
    return NextResponse.json({ success: false })
  }
}

// GET - Lookup session_id by email (called after auth)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const { data, error } = await admin
      .from("pending_checkouts")
      .select("stripe_session_id")
      .eq("email", email.toLowerCase().trim())
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ session_id: null })
    }

    return NextResponse.json({ session_id: data.stripe_session_id })
  } catch (error) {
    console.error("Pending checkout lookup error:", error)
    return NextResponse.json({ session_id: null })
  }
}

// DELETE - Remove pending checkout after successful claim
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    await admin
      .from("pending_checkouts")
      .delete()
      .eq("email", email.toLowerCase().trim())

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Pending checkout delete error:", error)
    return NextResponse.json({ success: false })
  }
}
