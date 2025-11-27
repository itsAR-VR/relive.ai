import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Kie.ai Webhook Handler
 * Receives callbacks when image/video processing completes
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Verify webhook (in production, you'd verify a signature here)
    const { job_id, status, result_url, error } = body

    if (!job_id) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the generation by Kie job ID
    const { data: generation, error: findError } = await supabase
      .from("generations")
      .select("*")
      .eq("replicate_prediction_id", job_id) // We're reusing this column for Kie job ID
      .single()

    if (findError || !generation) {
      console.error("Generation not found for job:", job_id)
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    // Update generation based on status
    if (status === "completed" && result_url) {
      await supabase
        .from("generations")
        .update({
          status: "completed",
          result_url,
          completed_at: new Date().toISOString(),
        })
        .eq("id", generation.id)

      console.log(`Generation ${generation.id} completed successfully`)
    } else if (status === "failed") {
      // Refund credits on failure
      await supabase.rpc("add_credits", {
        user_uuid: generation.user_id,
        amount: generation.credits_used,
      })

      await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message: error || "Processing failed",
        })
        .eq("id", generation.id)

      console.log(`Generation ${generation.id} failed, credits refunded`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Kie.ai may use GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "ok" })
}

