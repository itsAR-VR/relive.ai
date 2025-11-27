import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { job_id, status, result_url, error } = body

    if (!job_id) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: generation, error: findError } = await supabase
      .from("generations")
      .select("*")
      .eq("replicate_prediction_id", job_id)
      .single()

    if (findError || !generation) {
      console.error("Generation not found for job:", job_id)
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    if (status === "completed" && result_url) {
      await supabase
        .from("generations")
        .update({
          status: "completed",
          result_url,
          completed_at: new Date().toISOString(),
        })
        .eq("id", generation.id)
    } else if (status === "failed") {
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
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" })
}
