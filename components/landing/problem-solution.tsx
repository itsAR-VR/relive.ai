"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Image as ImageIcon, Wand2 } from "lucide-react"

interface ProblemSolutionProps {
  onStartGift: () => void
}

const PAIN_STATS = [
  { icon: Gift, value: "68%", label: "of gifts are returned or unused within 6 months" },
  { icon: ImageIcon, value: "84%", label: "say their favourite photos are scattered across devices" },
  { icon: Wand2, value: "74%", label: "say most “AI” tools feel cold or templated" },
]

const PROBLEM_POINTS = [
  {
    icon: Gift,
    title: "Most gifts fade fast",
    description: "A nice moment… then it ends up in a drawer or gets forgotten.",
  },
  {
    icon: ImageIcon,
    title: "Memories get scattered",
    description: "Old photos live across phones, clouds, boxes — rarely seen again.",
  },
  {
    icon: Wand2,
    title: "Most “AI” feels cold",
    description: "Templates can look impressive, but they don’t feel like them.",
  },
]

export function ProblemSolution({ onStartGift }: ProblemSolutionProps) {
  return (
    <section className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-background/80">
              Why normal gifts fall short
            </p>
            <h2 className="mt-3 font-serif text-2xl md:text-3xl lg:text-4xl leading-tight">
              Most gifts are forgotten. This one becomes family canon.
            </h2>
            <p className="mt-4 text-sm md:text-base text-background/80 leading-relaxed max-w-xl">
              Flowers wilt, gift cards get lost and gadgets end up in drawers. But the stories in your old photos
              and home videos are priceless — they just need a stage. Gifting Moments turns those forgotten files
              into a film they’ll rewatch for years.
            </p>

            <div className="mt-6">
              <Button
                onClick={onStartGift}
                className="bg-background text-foreground hover:bg-background/90"
              >
                Create Their Gift
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="mt-3 text-xs text-background/70">
                24-hour delivery · Unlimited revisions · Private gift-wrapped link
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {PROBLEM_POINTS.map((point) => {
              const Icon = point.icon
              return (
                <div
                  key={point.title}
                  className="bg-background/5 border border-background/15 rounded-xl p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-background/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <p className="font-serif text-lg">{point.title}</p>
                      <p className="mt-1 text-sm text-background/80 leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10 border-t border-background/15 pt-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {PAIN_STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="bg-background/5 border border-background/15 rounded-xl p-5 text-center"
                >
                  <div className="mx-auto mb-3 h-10 w-10 rounded-lg bg-background/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-background" />
                  </div>
                  <p className="font-serif text-3xl md:text-4xl">{stat.value}</p>
                  <p className="mt-2 text-xs md:text-sm text-background/80 leading-relaxed">
                    {stat.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
