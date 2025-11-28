"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Gift, ArrowDown, Sparkles } from "lucide-react"

interface SplitHeroProps {
  onStartGift: () => void
}

export function SplitHero({ onStartGift }: SplitHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animations after mount
    setIsVisible(true)
    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [])

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-background">
      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('/paper-texture.jpg')] bg-repeat pointer-events-none" />
      
      {/* Warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />

      <div className="container relative mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
          
          {/* Left: Copy and CTA */}
          <div 
            className={`order-2 lg:order-1 text-center lg:text-left transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide border border-primary/20">
              <Gift className="w-4 h-4" />
              The hardest person to buy for
            </span>

            {/* Main Headline - Serif */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] tracking-tight mb-6">
              They have everything they need.
              <span className="block mt-2 text-primary">Except their childhood.</span>
            </h1>

            {/* Subheadline - Sans */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
              Give the gift of a relived memory. Tell us the story, and our directors will bring it back to life.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Button
                onClick={onStartGift}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-6 text-lg rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Their Gift
              </Button>
              <p className="text-sm text-muted-foreground">
                50% off Black Friday Special
              </p>
            </div>

            {/* Trust Signal */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                No AI skills needed
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                Delivered in 24 hours
              </span>
            </div>
          </div>

          {/* Right: Split Screen Visual - Before/After */}
          <div 
            className={`order-1 lg:order-2 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative max-w-lg mx-auto">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 rounded-3xl blur-2xl opacity-60" />
              
              {/* Split container */}
              <div className="relative bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/50">
                {/* Before/After Split */}
                <div className="grid grid-cols-2 aspect-[4/3]">
                  {/* Left: B&W Photo */}
                  <div className="relative overflow-hidden">
                    <img
                      src="/vintage-sepia-old-wedding-photograph-1950s-couple.jpg"
                      alt="Original vintage photograph"
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                    <span className="absolute bottom-3 left-3 text-xs font-medium text-white/80 bg-black/40 px-2 py-1 rounded">
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
                    <span className="absolute bottom-3 right-3 text-xs font-medium text-white/80 bg-primary/80 px-2 py-1 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Restored
                    </span>
                  </div>
                </div>

                {/* Badge overlay */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-lg">
                  <span className="text-sm font-medium text-foreground">
                    Restored by <span className="text-primary">GiftingMoments</span>
                  </span>
                </div>
              </div>

              {/* Caption */}
              <p className="text-center text-sm text-muted-foreground mt-4 italic">
                "It looks like a memory feels—slightly blurry, but warm."
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  )
}
