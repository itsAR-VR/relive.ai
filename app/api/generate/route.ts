import { createClient } from "@/lib/supabase/server"
import { createKieClient } from "@/lib/kie"
import { NextResponse } from "next/server"

const CREDITS_REQUIRED = 5
const WEBHOOK_PATH = "/api/webhooks/kie"

function getWebhookUrl() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) return null
  return `${baseUrl}${WEBHOOK_PATH}`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
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
    const {
      imageUrl,
      prompt = "gentle natural movement",
      duration = 5,
      resolution = "1080p",
      motionStrength = 50,
      negativePrompt,
      enablePromptExpansion,
      seed,
    } = body
    const webhookUrl = getWebhookUrl()

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    if (!webhookUrl) {
      console.error("Generate webhook URL is not configured")
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 500 }
      )
    }

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        type: "video_generate",
        status: "processing",
        original_image_url: imageUrl,
        prompt,
        settings: { duration, resolution, motionStrength, negativePrompt, enablePromptExpansion, seed },
        credits_used: CREDITS_REQUIRED,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Failed to create generation record:", insertError)
      return NextResponse.json(
        { error: "Failed to create generation" },
        { status: 500 }
      )
    }

    console.info("Generate job created", {
      generationId: generation.id,
      userId: user.id,
      imageUrl,
      settings: { prompt, duration, resolution, motionStrength, negativePrompt, enablePromptExpansion, seed },
    })

    // Deduct credits
    const { data: creditUsed, error: creditError } = await supabase.rpc("deduct_credits", {
      user_uuid: user.id,
      amount: CREDITS_REQUIRED,
    })

    if (creditError || creditUsed !== true) {
      console.error("Failed to deduct credits:", {
        error: creditError,
        creditUsed,
      })
      // Rollback generation
      await supabase.from("generations").delete().eq("id", generation.id)
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      )
    }

    // Call Kie.ai API for video generation
    try {
      const kie = createKieClient()
      
      const result = await kie.generateVideo({
        imageUrl,
        prompt,
        duration,
        resolution,
        negativePrompt,
        enablePromptExpansion,
        seed,
        webhookUrl,
      })

      if (!result.success || !result.data) {
        console.error("Kie.ai generate response error", {
          generationId: generation.id,
          userId: user.id,
          response: result,
        })
        throw new Error(result.error || "Kie.ai API failed")
      }

      // Update generation with Kie job ID
      const { error: jobUpdateError } = await supabase
        .from("generations")
        .update({ replicate_prediction_id: result.data.id })
        .eq("id", generation.id)

      if (jobUpdateError) {
        console.error("Failed to persist Kie job ID", {
          generationId: generation.id,
          userId: user.id,
          jobId: result.data.id,
          error: jobUpdateError,
        })

        await supabase.rpc("add_credits", {
          user_uuid: user.id,
          amount: CREDITS_REQUIRED,
        })

        await supabase
          .from("generations")
          .update({
            status: "failed",
            error_message: "Failed to track AI job",
          })
          .eq("id", generation.id)

        return NextResponse.json(
          { error: "Failed to track AI job" },
          { status: 500 }
        )
      }

      console.info("Generate job submitted to Kie", {
        generationId: generation.id,
        userId: user.id,
        jobId: result.data.id,
      })

      return NextResponse.json({
        success: true,
        generationId: generation.id,
        jobId: result.data.id,
        status: "processing",
      })
    } catch (kieError) {
      console.error("Kie.ai API error:", kieError)

      // Refund credits on API failure
      const { error: refundError } = await supabase.rpc("add_credits", {
        user_uuid: user.id,
        amount: CREDITS_REQUIRED,
      })

      if (refundError) {
        console.error("Failed to refund credits after Kie error", {
          generationId: generation.id,
          userId: user.id,
          error: refundError,
        })
      }

      // Mark generation as failed
      await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message:
            kieError instanceof Error ? kieError.message : "AI processing failed",
        })
        .eq("id", generation.id)

      return NextResponse.json(
        { error: "AI processing failed" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Generate API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to check generation status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const generationId = searchParams.get("id")

  if (!generationId) {
    return NextResponse.json(
      { error: "Generation ID required" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // If still processing, check status with Kie.ai
  if (generation.status === "processing" && generation.replicate_prediction_id) {
    try {
      const kie = createKieClient()
      const status = await kie.getJobStatus(generation.replicate_prediction_id)
      
      if (status.success && status.data) {
        if (status.data.status === "completed" && status.data.result_url) {
          // Update our record
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
          const errorMessage =
            status.data.error ||
            status.error ||
            "Processing failed"

          const shouldRefund =
            generation.status !== "failed" &&
            generation.status !== "completed" &&
            (generation.credits_used || 0) > 0

          if (shouldRefund) {
            const { error: refundError } = await supabase.rpc("add_credits", {
              user_uuid: generation.user_id,
              amount: generation.credits_used || CREDITS_REQUIRED,
            })

            if (refundError) {
              console.error("Failed to refund credits after generation failure", {
                generationId,
                userId: generation.user_id,
                error: refundError,
              })
            }
          }

          await supabase
            .from("generations")
            .update({
              status: "failed",
              error_message: errorMessage,
              completed_at: new Date().toISOString(),
            })
            .eq("id", generationId)
          
          generation.status = "failed"
          generation.error_message = errorMessage
        }
      } else if (!status.success) {
        console.error("Failed to check Kie.ai status", {
          generationId,
          userId: generation.user_id,
          response: status,
        })
      }
    } catch (err) {
      console.error("Failed to check Kie.ai status:", err)
    }
  }

  return NextResponse.json(generation)
}
