"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles } from "lucide-react"

interface SplitHeroProps {
  onStartGift: () => void
}

export function SplitHero({ onStartGift }: SplitHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's okay
      })
    }
    // Trigger fade-in animation after mount
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('/paper-texture.jpg')] bg-repeat pointer-events-none" />
      
      {/* Warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Copy */}
          <div 
            className={`text-center lg:text-left transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide border border-primary/20">
              <Gift className="w-4 h-4" />
              The Hardest Person to Buy For
            </span>

            {/* Main Headline - Serif */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] tracking-tight">
              They have everything they need.
              <span className="block mt-2 text-primary">
                Except their childhood.
              </span>
            </h1>

            {/* Subheadline - Sans */}
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Give the gift of a relived memory. Tell us the story, and our directors will bring it back to life.
            </p>

            {/* Value Proposition */}
            <p className="mt-4 text-base text-muted-foreground/80 max-w-lg mx-auto lg:mx-0 font-sans">
              We don&apos;t sell video generation. We act as your personal memory directors. You don&apos;t need to know how to use AI—you just need to know the story. We handle the rest.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Button
                onClick={onStartGift}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-10 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Their Gift
              </Button>
              <p className="text-sm text-muted-foreground">
                From $49 · Ready in 24 hours
              </p>
            </div>

            {/* Trust Signal */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>100% Money-Back Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column - Split Screen Visual */}
          <div 
            className={`relative transition-all duration-1000 delay-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative max-w-lg mx-auto">
              {/* Decorative frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 rounded-2xl blur-xl opacity-60" />
              
              {/* Split screen container */}
              <div className="relative bg-card rounded-xl shadow-2xl overflow-hidden border border-border">
                {/* Top label */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-3 py-1.5 bg-foreground/90 text-background text-xs font-medium rounded-full backdrop-blur-sm">
                    Before & After
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  {/* Left - B&W Photo */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 z-10" />
                    <img
                      src="/vintage-sepia-old-wedding-photograph-1950s-couple.jpg"
                      alt="Original vintage photograph"
                      className="w-full h-full object-cover grayscale contrast-110"
                    />
                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm z-20">
                      Original
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent z-10" />

                  {/* Right - Colorized/Moving */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10 z-10" />
                    <video
                      ref={videoRef}
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wealth%20Video%20Crop-ZuwydYNC0E3xso5q3g1vtPBv2CoHS4.mp4"
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      autoPlay
                      poster="/restored-colorized-vintage-wedding-photograph-high.jpg"
                    />
                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded backdrop-blur-sm z-20">
                      Restored
                    </span>
                  </div>
                </div>

                {/* Bottom caption */}
                <div className="p-4 bg-muted/50 border-t border-border">
                  <p className="text-center text-sm text-muted-foreground font-serif italic">
                    &ldquo;It looks like a memory feels—slightly blurry, but warm.&rdquo;
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 px-4 py-2 bg-card rounded-lg shadow-lg border border-border">
                <p className="text-xs font-medium text-foreground">Restored by</p>
                <p className="text-sm font-serif text-primary">GiftingMoments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
