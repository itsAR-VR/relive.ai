import { createClient } from "@/lib/supabase/server"
import { createKieClient } from "@/lib/kie"
import { NextResponse } from "next/server"

const CREDITS_REQUIRED = 1

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
        { error: "Insufficient credits" },
        { status: 402 }
      )
    }

    const body = await request.json()
    const { imageUrl, faceRestoration = true, colorCorrection = true } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        type: "image_enhance",
        status: "processing",
        original_image_url: imageUrl,
        settings: { faceRestoration, colorCorrection },
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

    // Deduct credits
    const { error: creditError } = await supabase.rpc("deduct_credits", {
      user_uuid: user.id,
      amount: CREDITS_REQUIRED,
    })

    if (creditError) {
      console.error("Failed to deduct credits:", creditError)
      // Rollback generation
      await supabase.from("generations").delete().eq("id", generation.id)
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      )
    }

    // Call Kie.ai API - Nano Banana Pro for photo restoration
    try {
      const kie = createKieClient()
      
      const webhookUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/webhooks/kie`
        : `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/kie`

      const result = await kie.enhanceImage({
        imageUrl,
        faceRestoration,
        colorCorrection,
        upscale: 2,
        webhookUrl,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || "Kie.ai API failed")
      }

      // Update generation with Kie job ID
      await supabase
        .from("generations")
        .update({ replicate_prediction_id: result.data.id }) // reusing column for Kie job ID
        .eq("id", generation.id)

      return NextResponse.json({
        success: true,
        generationId: generation.id,
        jobId: result.data.id,
        status: "processing",
      })
    } catch (kieError) {
      console.error("Kie.ai API error:", kieError)

      // Refund credits on API failure
      await supabase.rpc("add_credits", {
        user_uuid: user.id,
        amount: CREDITS_REQUIRED,
      })

      // Mark generation as failed
      await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message: "AI processing failed",
        })
        .eq("id", generation.id)

      return NextResponse.json(
        { error: "AI processing failed" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Enhance API error:", error)
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
      const status = await kie.getEnhanceStatus(generation.replicate_prediction_id)
      
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
