"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles } from "lucide-react"

interface SplitHeroProps {
  onStartGift: () => void
}

export function SplitHero({ onStartGift }: SplitHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    if (videoRef.current) {
      videoRef.current.play()
    }
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
              {/* Glow effect - reduced on mobile */}
              <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 rounded-2xl blur-xl opacity-50" />
              
              {/* Split container - horizontal on all screens */}
              <div className="relative bg-card rounded-xl md:rounded-2xl shadow-xl overflow-hidden border border-border/50">
                {/* Before/After Split - Always side-by-side */}
                <div className="grid grid-cols-2 aspect-[16/9] md:aspect-[4/3]">
                  {/* Left: B&W Photo */}
                  <div className="relative overflow-hidden">
                    <img
                      src="/vintage-sepia-old-wedding-photograph-1950s-couple.jpg"
                      alt="Original vintage photograph"
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                    <span className="absolute bottom-2 left-2 md:bottom-3 md:left-3 text-[10px] md:text-xs font-medium text-white/80 bg-black/40 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                      Before
                    </span>
                  </div>
                  
                  {/* Right: Colorized/Animated Video */}
                  <div className="relative overflow-hidden">
                    <video
                      ref={videoRef}
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wealth%20Video%20Crop-ZuwydYNC0E3xso5q3g1vtPBv2CoHS4.mp4"
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10" />
                    <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 text-[10px] md:text-xs font-medium text-white/80 bg-primary/80 px-1.5 py-0.5 md:px-2 md:py-1 rounded flex items-center gap-1">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-pulse" />
                      Restored
                    </span>
                  </div>
                </div>

                {/* Badge overlay - Desktop only */}
                <div className="hidden lg:block absolute top-2 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-lg">
                  <span className="text-sm font-medium text-foreground">
                    Restored by <span className="text-primary">Moments</span>
                  </span>
                </div>
              </div>
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
              The hardest person to buy for
            </span>

            {/* Main Headline */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-[1.15] tracking-tight mb-3 md:mb-4">
              They have everything they need.
              <span className="block mt-1 text-primary">Except their childhood.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-4 md:mb-6">
              Give the gift of a relived memory. Tell us the story, and our directors will bring it back to life.
            </p>

            {/* CTA Button - Prominent, above fold */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Button
                onClick={onStartGift}
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-5 md:px-8 md:py-6 text-base md:text-lg rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Restore a Memory
              </Button>
              <span className="text-xs md:text-sm text-primary font-medium">
                50% off Black Friday
              </span>
            </div>

            {/* Trust Signals - Compact */}
            <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                No AI skills needed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                24hr delivery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                98% said it moved them to tears
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
