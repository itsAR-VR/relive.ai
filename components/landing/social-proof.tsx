"use client"

import { useState, useEffect, useRef } from "react"
import { Quote, Star, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SocialProofProps {
  onStartGift: () => void
}

const TESTIMONIALS = [
  {
    quote: "My dad hasn't seen his mother in 40 years. He watched this loop for an hour. Best $150 I ever spent.",
    author: "Sarah M.",
    role: "Daughter",
    rating: 5,
  },
  {
    quote: "I didn't know how to use AI, so I just told them the story. They handled the rest perfectly. The red bike detail made him cry immediately.",
    author: "Michael R.",
    role: "Son",
    rating: 5,
  },
  {
    quote: "Mom hasn't spoken much in years. She watched this video 50 times in a row. That smile was worth everything.",
    author: "Jennifer L.",
    role: "Daughter",
    rating: 5,
  },
]

export function SocialProof({ onStartGift }: SocialProofProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const videoContainer = videoContainerRef.current
    if (!videoContainer) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Play when 60% visible
            desktopVideoRef.current?.play().catch(() => {})
            mobileVideoRef.current?.play().catch(() => {})
          } else {
            // Pause when out of view
            desktopVideoRef.current?.pause()
            mobileVideoRef.current?.pause()
          }
        })
      },
      { threshold: 0.6 }
    )

    observer.observe(videoContainer)
    return () => observer.disconnect()
  }, [])

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section className="py-8 md:py-14 bg-muted/30 relative">
      <div className="container relative mx-auto px-4">
        {/* Video Demo Section */}
        <div className="text-center mb-8 md:mb-12">
          {/* Title */}
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground mb-6 md:mb-8 max-w-3xl mx-auto leading-tight">
            We turn old photos and memories into short nostalgic films—handcrafted to make them cry
          </h2>

          {/* Video Container */}
          <div ref={videoContainerRef} className="max-w-4xl mx-auto mb-4">
            {/* Desktop Video */}
            <div className="hidden md:block relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <video
                ref={desktopVideoRef}
                src="/demo-desktop.mov"
                className="w-full h-auto"
                loop
                muted
                playsInline
                preload="auto"
              />
            </div>

            {/* Mobile Video */}
            <div className="md:hidden relative rounded-xl overflow-hidden shadow-xl border border-border/50">
              <video
                ref={mobileVideoRef}
                src="/demo-mobile.mov"
                className="w-full h-auto"
                loop
                muted
                playsInline
                preload="auto"
              />
            </div>
          </div>

          {/* Disclaimer Note */}
          <p className="text-xs text-muted-foreground italic max-w-2xl mx-auto leading-relaxed mb-6">
            Note: This demo shows a simplified preview of our process. Your actual experience includes a personalized director interview, 
            longer custom films, private viewing pages with gift-wrapping, and a fully tailored storytelling approach.
          </p>

          {/* CTA Button */}
          <Button
            onClick={onStartGift}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-5 md:px-8 md:py-6 text-base md:text-lg rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Restore Their Moment
          </Button>
        </div>

        {/* Section Header - Compact */}
        <div className="text-center mb-6 md:mb-8">
          <h3 className="font-serif text-xl md:text-2xl lg:text-3xl text-foreground mb-2">
            The Gift of Tears
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            We measure success in moments that take their breath away.
          </p>
        </div>

        {/* Mini Stats Row */}
        <div className="flex justify-center gap-4 md:gap-8 mb-6 md:mb-10">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-serif text-foreground">50+</p>
            <p className="text-xs text-muted-foreground">Films Created</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-xl md:text-2xl font-serif text-foreground">Same-day</p>
            <p className="text-xs text-muted-foreground">Delivery</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-xl md:text-2xl font-serif text-foreground">100%</p>
            <p className="text-xs text-muted-foreground">Guarantee</p>
          </div>
        </div>

        {/* Mobile: Simple Carousel | Desktop: Grid */}
        {/* Mobile Carousel - Simple fade transition */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <div className="relative min-h-[280px]">
              {TESTIMONIALS.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-300 ease-out ${
                    index === currentIndex
                      ? "opacity-100 translate-x-0"
                      : index < currentIndex
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                  }`}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors active:scale-95"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-border hover:bg-muted-foreground w-2"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors active:scale-95"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) {
  return (
    <div className="relative bg-card rounded-xl p-6 md:p-7 border border-border shadow-sm h-full">
      {/* Quote icon - positioned inside card at top-left */}
      <div className="absolute top-4 left-4 md:top-5 md:left-5 w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Quote className="w-4 h-4 text-primary" />
      </div>

      {/* Rating - with top margin to clear the quote icon */}
      <div className="flex gap-0.5 mb-3 mt-12 md:mt-14">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-foreground text-sm md:text-base leading-relaxed mb-4 font-serif italic">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">
            {testimonial.author.split(" ").map(n => n[0]).join("")}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  )
}
