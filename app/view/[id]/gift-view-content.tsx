"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { GiftWrapOverlay } from "@/components/gift/gift-wrap-overlay"

interface Order {
  id: string
  status: string
  tier: string
  final_video_url: string | null
  interview_data: Record<string, unknown> | null
  created_at: string
  view_token: string | null
  first_viewed_at: string | null
  recipient_name: string | null
}

interface GiftViewContentProps {
  order: Order
  isTokenValid: boolean
  isFirstView: boolean
  token?: string
}

export function GiftViewContent({ order, isTokenValid, isFirstView, token }: GiftViewContentProps) {
  const [isUnwrapped, setIsUnwrapped] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // If it's NOT the first view (already been opened), skip the unwrap animation
  useEffect(() => {
    if (!isFirstView || !isTokenValid) {
      setIsUnwrapped(true)
      setShowContent(true)
    }
  }, [isFirstView, isTokenValid])

  const handleUnwrap = async () => {
    setIsUnwrapped(true)
    
    // Record the first view
    if (isFirstView && token) {
      try {
        await fetch(`/api/view/${order.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
      } catch (error) {
        console.error("Failed to record view:", error)
      }
    }

    // Delay showing content for smooth transition
    setTimeout(() => {
      setShowContent(true)
    }, 800)
  }

  const interviewData = (order.interview_data || {}) as Record<string, unknown>
  const audioUrl = typeof interviewData.audio_note_url === "string" ? interviewData.audio_note_url : null
  const referencePhotoUrl =
    typeof interviewData.reference_photo_url === "string" ? interviewData.reference_photo_url : null

  const recipientGreeting = order.recipient_name 
    ? `A special gift for ${order.recipient_name}` 
    : "Your memory film"

  return (
    <>
      {/* Gift wrap overlay - show only on first view with valid token */}
      {!isUnwrapped && isTokenValid && isFirstView && (
        <GiftWrapOverlay 
          recipientName={order.recipient_name}
          onUnwrap={handleUnwrap}
        />
      )}

      {/* Main content - with fade in animation */}
      <div 
        className={`min-h-screen bg-gradient-to-b from-[#faf8f5] to-[#f0ebe3] transition-opacity duration-1000 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <header className="bg-white/90 backdrop-blur-md border-b border-[#e2d8c3] sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/gifting-moments-logo.svg"
                alt="Gifting Moments"
                width={220}
                height={75}
                className="h-14 md:h-16 w-auto"
              />
            </Link>
            <div className="text-sm text-[#7d6b56] font-medium">
              {new Date(order.created_at).toLocaleDateString(undefined, { 
                month: "long", 
                day: "numeric", 
                year: "numeric" 
              })}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* Hero section with video */}
          <section className="relative">
            {/* Decorative background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-100/50 via-rose-100/50 to-amber-100/50 rounded-3xl blur-2xl" />
            
            <div className="relative bg-white border border-[#e2d8c3] rounded-3xl p-8 shadow-xl">
              {/* Title with decorative elements */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Memory Film
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3d3632] mb-3">
                  {recipientGreeting}
                </h1>
                <p className="text-[#7d6b56] text-lg max-w-md mx-auto">
                  {isTokenValid 
                    ? "Someone special created this memory film just for you."
                    : "A treasured moment, preserved forever."
                  }
                </p>
              </div>

              {/* Video player */}
              {order.final_video_url ? (
                <div className="relative">
                  {/* Video frame decoration */}
                  <div className="absolute -inset-2 bg-gradient-to-b from-[#3d3632] to-[#2a2420] rounded-2xl" />
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <video
                      src={order.final_video_url}
                      controls
                      autoPlay={isUnwrapped && showContent}
                      className="w-full h-full object-contain bg-black"
                      poster={referencePhotoUrl || undefined}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[#f5f1e6] border-2 border-dashed border-[#e2d8c3] rounded-2xl p-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e2d8c3] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#7d6b56]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[#7d6b56] text-lg">Your video is being prepared...</p>
                  <p className="text-[#9d8b76] text-sm mt-1">Check back soon!</p>
                </div>
              )}
            </div>
          </section>

          {/* Additional content */}
          {(audioUrl || referencePhotoUrl) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Audio note */}
              <div className="bg-white border border-[#e2d8c3] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-[#3d3632]">Director&apos;s Note</h2>
                </div>
                {audioUrl ? (
                  <audio controls className="w-full">
                    <source src={audioUrl} />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p className="text-[#9d8b76] italic">No audio note included.</p>
                )}
              </div>

              {/* Reference photo */}
              <div className="bg-white border border-[#e2d8c3] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-[#3d3632]">Reference Photo</h2>
                </div>
                {referencePhotoUrl ? (
                  <img
                    src={referencePhotoUrl}
                    alt="Reference"
                    className="w-full h-48 object-cover rounded-xl border border-[#e2d8c3]"
                  />
                ) : (
                  <div className="w-full h-48 bg-[#f5f1e6] rounded-xl flex items-center justify-center">
                    <p className="text-[#9d8b76] italic">No reference photo included.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Footer message */}
          <section className="text-center py-8">
            <p className="text-[#9d8b76] text-sm">
              Made with love by{" "}
              <Link href="/" className="text-amber-700 hover:text-amber-800 font-medium">
                Gifting Moments
              </Link>
            </p>
          </section>
        </main>
      </div>
    </>
  )
}
