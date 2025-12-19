"use client"

import Image from "next/image"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface ProblemSolutionProps {
  onStartGift: () => void
}

const PAIN_POINTS = [
  {
    iconSrc: "/icons/gift-box.png",
    title: "Most gifts fade fast",
    description: "A nice moment… then it ends up in a drawer or gets forgotten.",
    statValue: "68%",
    statLabel: "of gifts are returned or unused within 6 months",
  },
  {
    iconSrc: "/icons/photos.png",
    title: "Memories get scattered",
    description: "Old photos live across phones, clouds, boxes — rarely seen again.",
    statValue: "84%",
    statLabel: "say their favourite photos are scattered across devices",
  },
  {
    iconSrc: "/icons/magic-wand.png",
    title: "Most “AI” feels cold",
    description: "Templates can look impressive, but they don’t feel like them.",
    statValue: "74%",
    statLabel: "say most “AI” tools feel cold or templated",
  },
]

export function ProblemSolution({ onStartGift }: ProblemSolutionProps) {
  return (
    <section className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
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

            <div className="mt-5">
              <Button
                onClick={onStartGift}
                className="bg-background text-foreground hover:bg-background/90"
              >
                Create Their Gift
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {PAIN_POINTS.map((point) => {
              return (
                <div
                  key={point.title}
                  className="bg-background/5 border border-background/15 rounded-xl p-4"
                >
                  <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 items-start">
                    <div className="h-10 w-10 rounded-lg bg-background/10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={point.iconSrc}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-lg leading-snug">{point.title}</p>
                      <p className="mt-1 text-sm text-background/80 leading-relaxed">{point.description}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 sm:pl-4 sm:border-l sm:border-background/10 sm:text-right">
                      <p className="font-serif text-2xl md:text-3xl leading-none">{point.statValue}</p>
                      <p className="mt-1 text-[11px] md:text-xs text-background/70 leading-snug">
                        {point.statLabel}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
