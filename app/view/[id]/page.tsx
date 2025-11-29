import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type OrderStatus = "pending_interview" | "in_production" | "ready"

interface Order {
  id: string
  status: OrderStatus
  tier: string
  final_video_url: string | null
  interview_data: Record<string, unknown> | null
  created_at: string
}

async function getOrder(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, tier, final_video_url, interview_data, created_at")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to fetch order for view page", error)
  }

  return data as Order | null
}

export default async function ViewGiftPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)

  if (!order || order.status !== "ready") {
    notFound()
  }

  const interviewData = (order.interview_data || {}) as Record<string, unknown>
  const audioUrl = typeof interviewData.audio_note_url === "string" ? interviewData.audio_note_url : null
  const referencePhotoUrl =
    typeof interviewData.reference_photo_url === "string" ? interviewData.reference_photo_url : null

  return (
    <div className="min-h-screen bg-[#f5f1e6]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e2d8c3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/gifting-moments-logo.svg"
              alt="Gifting Moments"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <div className="text-sm text-[#7d6b56]">
            Gift ready — {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-white/80 border border-[#e2d8c3] rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#3d3632] mb-2">Your memory film</h1>
          <p className="text-[#7d6b56] mb-4">
            Share this page with your loved one so they can view the gift without logging in.
          </p>
          {order.final_video_url ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-md">
              <video
                src={order.final_video_url}
                controls
                className="w-full h-full object-contain bg-black"
                poster={referencePhotoUrl || undefined}
              />
            </div>
          ) : (
            <div className="bg-[#f5f1e6] border border-dashed border-[#e2d8c3] rounded-xl p-10 text-center text-[#7d6b56]">
              Final video is not available yet.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 border border-[#e2d8c3] rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#3d3632] mb-2">Director&apos;s audio note</h2>
            {audioUrl ? (
              <audio controls className="w-full">
                <source src={audioUrl} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="text-[#7d6b56]">No audio note provided.</p>
            )}
          </div>

          <div className="bg-white/80 border border-[#e2d8c3] rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#3d3632] mb-2">Reference photo</h2>
            {referencePhotoUrl ? (
              <img
                src={referencePhotoUrl}
                alt="Reference"
                className="w-full h-64 object-cover rounded-lg border border-[#e2d8c3]"
              />
            ) : (
              <p className="text-[#7d6b56]">No reference photo uploaded.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
