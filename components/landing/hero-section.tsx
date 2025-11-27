"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowDown, Play } from "lucide-react"

import { useAuthUser } from "./use-auth-user"

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user, isLoading } = useAuthUser()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-[#3d3632] px-4 py-12 md:py-16">
      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('/paper-texture.jpg')] bg-repeat" />

      <div className="container relative mx-auto max-w-5xl">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left: Copy and CTA */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-[#a67c52]/20 text-[#d4b896] text-sm font-medium tracking-wide">
              For those who treasure their memories
            </span>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#f5f1e6] leading-tight tracking-tight">
              Bring Your Loved Ones'
              <span className="block mt-1 text-[#d4b896]">Memories Back to Life</span>
            </h1>

            <p className="mt-4 text-base md:text-lg text-[#c4b8a8] max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Transform faded photographs into living, breathing moments. Help grandparents see their wedding day dance
              again.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#a67c52] hover:bg-[#8a6642] text-[#f5f1e6] font-medium px-8 py-5 text-base rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <Link href="/login">Try It Free</Link>
              </Button>
              {!isLoading && user && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border border-[#d4c9b8] bg-[#2a2522] hover:bg-[#3d3632] text-[#f5f1e6] font-medium px-8 py-5 text-base rounded-lg shadow-lg transition-all hover:shadow-xl"
                >
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#d4b896]/30 via-[#a67c52]/20 to-[#8a6642]/30 rounded-2xl blur-lg opacity-60" />
              <div className="relative bg-[#2a2522] p-1.5 rounded-xl shadow-2xl">
                <video
                  ref={videoRef}
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wealth%20Video%20Crop-ZuwydYNC0E3xso5q3g1vtPBv2CoHS4.mp4"
                  className="w-full h-auto rounded-lg"
                  loop
                  muted
                  playsInline
                  autoPlay
                />
              </div>
              <button
                onClick={() => document.getElementById("live-demo")?.scrollIntoView({ behavior: "smooth" })}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#2a2522] rounded-full shadow-lg cursor-pointer hover:bg-[#3d3632] transition-colors"
              >
                <span className="text-[#d4b896] text-xs font-medium flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" />
                  See the magic
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 animate-bounce text-center">
          <ArrowDown className="mx-auto h-5 w-5 text-[#8a7e72]" />
        </div>
      </div>
    </section>
  )
}
