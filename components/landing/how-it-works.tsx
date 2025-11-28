"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { MessageSquare, Clapperboard, Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const STEPS = [
  {
    number: "01",
    icon: MessageSquare,
    title: "You Tell the Story",
    description: "Answer a few simple questions. What did it smell like? What colors do you remember? We translate feelings into visuals.",
  },
  {
    number: "02",
    icon: Clapperboard,
    title: "We Direct the Scene",
    description: "Our team curates, edits, and adds sound design. We generate 20 versions and pick the best one. You never see the failures.",
  },
  {
    number: "03",
    icon: Heart,
    title: "They Relive the Moment",
    description: "Receive a private viewing page to share at the birthday or holiday. Watch as they're transported back in time.",
  },
]

interface HowItWorksProps {
  onStartGift: () => void
}

export function HowItWorks({ onStartGift }: HowItWorksProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    onSelect()
    return () => { emblaApi.off("select", onSelect) }
  }, [emblaApi])

  return (
    <section className="py-8 md:py-14 bg-background relative">
      <div className="container relative mx-auto px-4">
        {/* Section Header - Compact */}
        <div className="text-center mb-6 md:mb-10">
          <span className="inline-block mb-3 px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-xs md:text-sm font-medium border border-accent/30">
            The Concierge Promise
          </span>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
            We Are Your Memory Directors
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            You just need to know the story. We handle everything else.
          </p>
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex-[0_0_85%] min-w-0 pl-4 first:pl-0">
                    <StepCard step={step} Icon={Icon} />
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Carousel Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button 
              onClick={scrollPrev}
              className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex gap-1.5">
              {STEPS.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedIndex ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={scrollNext}
              className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] right-0 h-px bg-gradient-to-r from-border to-transparent" />
                  )}
                  <StepCard step={step} Icon={Icon} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 md:mt-12">
          <Button
            onClick={onStartGift}
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-5 md:py-6 text-base md:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all group"
          >
            Start Their Gift
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Value Props - Compact */}
        <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-3 md:gap-6">
          {[
            { label: "24hr Delivery", icon: "⚡" },
            { label: "Unlimited Revisions", icon: "🔄" },
            { label: "100% Guarantee", icon: "✓" },
          ].map((prop, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border"
            >
              <span className="text-base">{prop.icon}</span>
              <p className="text-xs md:text-sm text-muted-foreground">{prop.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, Icon }: { step: typeof STEPS[0], Icon: typeof MessageSquare }) {
  return (
    <div className="relative bg-card rounded-xl p-5 md:p-6 border border-border shadow-sm h-full">
      {/* Step number */}
      <span className="absolute -top-2.5 -left-1 md:-top-3 md:-left-3 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bold flex items-center justify-center shadow-lg">
        {step.number}
      </span>

      {/* Icon */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
      </div>

      {/* Content */}
      <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
        {step.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>
    </div>
  )
}
