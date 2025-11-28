"use client"

import { MessageSquare, Clapperboard, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const STEPS = [
  {
    number: "01",
    icon: MessageSquare,
    title: "You Tell the Story",
    description: "Answer a few simple questions about the memory. What did it smell like? What was the weather? What colors do you remember? We translate your feelings into visuals.",
  },
  {
    number: "02",
    icon: Clapperboard,
    title: "We Direct the Scene",
    description: "Our team curates, edits, and adds sound design. We generate 20 versions and pick the one that captures the soul of the memory. You never see the failures.",
  },
  {
    number: "03",
    icon: Heart,
    title: "They Relive the Moment",
    description: "Receive a private viewing page to share at the birthday or holiday. Watch as they are transported back to a time they thought was lost forever.",
  },
]

interface HowItWorksProps {
  onStartGift: () => void
}

export function HowItWorks({ onStartGift }: HowItWorksProps) {
  return (
    <section className="py-20 md:py-28 bg-background relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block mb-4 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium border border-accent/30">
            The Concierge Promise
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            We Are Your Memory Directors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You don&apos;t need to know how to use AI. You don&apos;t need to learn complex tools. 
            You just need to know the story. We handle everything else.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-12">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div 
                  key={index}
                  className="relative group"
                >
                  {/* Connector line (hidden on mobile and last item) */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] right-0 h-px bg-gradient-to-r from-border to-transparent" />
                  )}

                  <div className="relative bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/30">
                    {/* Step number */}
                    <span className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                      {step.number}
                    </span>

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="font-serif text-xl text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-foreground mb-6 font-serif">
            Ready to give the gift that says &ldquo;I listened&rdquo;?
          </p>
          <Button
            onClick={onStartGift}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-10 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all group"
          >
            Start Their Gift
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Value Props */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "Delivered in 24 Hours", icon: "⚡" },
            { label: "Unlimited Revisions", icon: "🔄" },
            { label: "Money-Back Guarantee", icon: "✓" },
            { label: "Private Viewing Page", icon: "🎬" },
          ].map((prop, index) => (
            <div 
              key={index}
              className="text-center p-4 rounded-xl bg-muted/50 border border-border"
            >
              <span className="text-2xl mb-2 block">{prop.icon}</span>
              <p className="text-sm text-muted-foreground">{prop.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
