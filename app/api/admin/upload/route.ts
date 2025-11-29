import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"]

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Verify admin status
    const isAdmin = await verifyAdmin(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const orderId = formData.get("orderId") as string | null

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    if (!orderId) {
      return NextResponse.json({ message: "No order ID provided" }, { status: 400 })
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Accepted: MP4, MOV, WebM, AVI" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "mp4"
    const timestamp = Date.now()
    const fileName = `${orderId}/${timestamp}.${fileExtension}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("gift-videos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError)
      return NextResponse.json(
        { message: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("gift-videos")
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    // Update the order with the new video URL
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        final_video_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Failed to update order with video URL:", updateError)
      // Don't fail the request - the video is uploaded, just the order update failed
    }

    return NextResponse.json({
      url: publicUrl,
      fileName: fileName,
      message: "Video uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
