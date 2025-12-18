"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, HeartHandshake, MessageCircleHeart } from "lucide-react"

interface GiftOfTearsProps {
  onStartGift: () => void
}

const STATS = [
  {
    icon: MessageCircleHeart,
    value: "98%",
    label: "say the gift made their loved one tear up (in a good way)",
  },
  {
    icon: HeartHandshake,
    value: "92%",
    label: "say they felt closer as a family after watching together",
  },
  {
    icon: Clock,
    value: "24h",
    label: "average delivery time, even during peak season",
  },
]

export function GiftOfTears({ onStartGift }: GiftOfTearsProps) {
  return (
    <section className="bg-secondary/60 py-12 md:py-16 border-y border-border/60">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              The gift of tears
            </p>
            <h2 className="mt-3 font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-tight">
              The Gift of Tears (and stories they haven’t told in years).
            </h2>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
              When someone presses play on a Gifting Moments film, something special happens. They don’t just see
              photos — they remember the jokes, the smells, the little details. Families tell us these films start
              conversations they thought were lost forever.
            </p>

            <div className="mt-6">
              <Button onClick={onStartGift} size="lg" className="px-8">
                Create a film for someone you love <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Unlimited revisions guarantee · Delivered in 24 hours
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-serif text-3xl text-foreground leading-none">{stat.value}</p>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <p className="text-[11px] text-muted-foreground text-center">
              Stats shown are illustrative — replace with your own data as you collect it.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

