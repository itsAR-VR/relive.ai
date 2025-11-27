import { createClient } from "@/lib/supabase/server"
import { createKieClient } from "@/lib/kie"
import { NextResponse } from "next/server"

const CREDITS_REQUIRED = 5

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single()

    if (!profile || profile.credits < CREDITS_REQUIRED) {
      return NextResponse.json(
        { error: "Insufficient credits. Video generation requires 5 credits." },
        { status: 402 }
      )
    }

    const body = await request.json()
    const { imageUrl, prompt = "gentle natural movement", motionStrength = 50, duration = 4 } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        type: "video_generate",
        status: "processing",
        original_image_url: imageUrl,
        prompt,
        settings: { motionStrength, duration },
        credits_used: CREDITS_REQUIRED,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: "Failed to create generation" }, { status: 500 })
    }

    const { error: creditError } = await supabase.rpc("deduct_credits", {
      user_uuid: user.id,
      amount: CREDITS_REQUIRED,
    })

    if (creditError) {
      await supabase.from("generations").delete().eq("id", generation.id)
      return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
    }

    try {
      const kie = createKieClient()
      const webhookUrl = process.env.VERCEL_URL
        ? \`https://\${process.env.VERCEL_URL}/api/webhooks/kie\`
        : \`\${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/kie\`

      const result = await kie.generateVideo({
        imageUrl,
        prompt,
        motionStrength,
        duration,
        webhookUrl,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || "Kie.ai API failed")
      }

      await supabase
        .from("generations")
        .update({ replicate_prediction_id: result.data.id })
        .eq("id", generation.id)

      return NextResponse.json({
        success: true,
        generationId: generation.id,
        jobId: result.data.id,
        status: "processing",
      })
    } catch (kieError) {
      console.error("Kie.ai API error:", kieError)
      await supabase.rpc("add_credits", { user_uuid: user.id, amount: CREDITS_REQUIRED })
      await supabase
        .from("generations")
        .update({ status: "failed", error_message: "AI processing failed" })
        .eq("id", generation.id)

      return NextResponse.json({ error: "AI processing failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Generate API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const generationId = searchParams.get("id")

  if (!generationId) {
    return NextResponse.json({ error: "Generation ID required" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: generation } = await supabase
    .from("generations")
    .select("*")
    .eq("id", generationId)
    .eq("user_id", user.id)
    .single()

  if (!generation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (generation.status === "processing" && generation.replicate_prediction_id) {
    try {
      const kie = createKieClient()
      const status = await kie.getVideoStatus(generation.replicate_prediction_id)
      
      if (status.success && status.data) {
        if (status.data.status === "completed" && status.data.result_url) {
          await supabase
            .from("generations")
            .update({
              status: "completed",
              result_url: status.data.result_url,
              completed_at: new Date().toISOString(),
            })
            .eq("id", generationId)
          
          generation.status = "completed"
          generation.result_url = status.data.result_url
        } else if (status.data.status === "failed") {
          await supabase
            .from("generations")
            .update({ status: "failed" })
            .eq("id", generationId)
          
          generation.status = "failed"
        }
      }
    } catch (err) {
      console.error("Failed to check Kie.ai status:", err)
    }
  }

  return NextResponse.json(generation)
}
