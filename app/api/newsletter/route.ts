import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseAdminClient(supabaseUrl, supabaseServiceKey)
}

interface NewsletterBody {
  email?: string
  source?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterBody = await request.json()
    const emailRaw = body.email || ""
    const sourceRaw = body.source || "footer"

    const email = emailRaw.toLowerCase().trim()
    const source = sourceRaw.trim().slice(0, 100)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { error } = await admin.from("newsletter_signups").insert({ email, source })

    // Treat duplicates as success (already subscribed)
    if (error) {
      const code = (error as { code?: string }).code
      if (code === "23505") {
        return NextResponse.json({ success: true, alreadySubscribed: true })
      }

      console.error("Newsletter signup failed:", error)
      return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Newsletter API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

