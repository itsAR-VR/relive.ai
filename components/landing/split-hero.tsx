"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles } from "lucide-react"
import Link from "next/link"
import { BeforeAfterScrubber } from "@/components/landing/before-after-scrubber"

interface SplitHeroProps {
  onStartGift: () => void
}

export function SplitHero({ onStartGift }: SplitHeroProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setIsVisible(true))
    return () => window.cancelAnimationFrame(raf)
  }, [])

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('/paper-texture.jpg')] bg-repeat pointer-events-none" />

      <div className="container relative mx-auto px-4 py-6 md:py-10 lg:py-16">
        {/* Mobile: Compact layout with CTA above fold */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-10 items-center">
          
          {/* Badge - Above media on mobile */}
          <div className="w-full text-center lg:hidden mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-sm font-medium text-foreground border border-border shadow-sm">
              Restored by <span className="text-primary">Moments</span>
            </span>
          </div>

          {/* Media Section - Side-by-side Before/After (always horizontal) */}
          <div 
            className={`w-full lg:order-2 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="relative max-w-xl mx-auto lg:max-w-none">
              {/* Badge - Above image on desktop */}
              <div className="hidden lg:flex justify-center mb-3">
                <span className="inline-flex items-center bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-lg text-sm font-medium text-foreground">
                  Restored by <span className="text-primary ml-1">Moments</span>
                </span>
              </div>

              {/* Glow effect - reduced on mobile */}
              <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 rounded-2xl blur-xl opacity-50" />
              
              {/* Split container - horizontal on all screens */}
              <BeforeAfterScrubber
                beforeImageSrc="/vintage-sepia-old-wedding-photograph-1950s-couple.jpg"
                afterVideoSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wealth%20Video%20Crop-ZuwydYNC0E3xso5q3g1vtPBv2CoHS4.mp4"
                beforeAlt="Original vintage photograph"
              />
            </div>
          </div>

          {/* Copy and CTA Section */}
          <div 
            className={`w-full lg:order-1 text-center lg:text-left transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Badge - Desktop */}
            <span className="hidden lg:inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide border border-primary/20">
              <Gift className="w-4 h-4" />
              The perfect gift for grandparents, parents & family.
            </span>

            {/* Trust line */}
            <p className="text-sm text-foreground/90 max-w-xl mx-auto lg:mx-0 mb-3 md:mb-4">
              <span className="text-accent font-semibold">★★★★★</span>{" "}
              <span className="text-muted-foreground">
                “She cried the moment it started.” – Sarah, made a film for her Nana
              </span>
            </p>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-[1.15] tracking-tight mb-3 md:mb-4">
              Create a film that{" "}
              <span className="block sm:inline text-primary">brings them to tears.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-5 md:mb-7">
              We turn your old photos and clips into a cinematic, AI‑enhanced family film — directed by real editors,
              delivered in 24 hours, with unlimited revisions until it feels just right.
            </p>

            {/* CTA Button - Prominent, above fold */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full">
                <Button
                  onClick={onStartGift}
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-5 md:px-8 md:py-6 text-base md:text-lg rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
                >
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Create Their Gift
                </Button>

                <Link
                  href="/examples"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-4 md:px-7 md:py-5 text-sm md:text-base font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Watch a 30‑second sample
                </Link>
              </div>
            </div>

            {/* Trust Signals - Compact */}
            <div className="mt-5 md:mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                No AI skills needed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                Delivered in 24 hours
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                Unlimited revisions included
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Gift-wrapped sharing link included
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
