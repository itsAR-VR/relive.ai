"use client"

import { Clock, Film, RefreshCw, Star } from "lucide-react"

interface TrustedStripProps {
  onStartGift: () => void
}

const TRUST_STATS = [
  {
    icon: Film,
    value: "500+",
    label: "films created",
    description: "Made for families around the world.",
  },
  {
    icon: Clock,
    value: "24h",
    label: "delivery",
    description: "On most gifts, even during peaks.",
  },
  {
    icon: RefreshCw,
    value: "∞",
    label: "revisions",
    description: "Keep iterating until it feels right.",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "from gifters",
    description: "Early feedback from customers.",
  },
]

const AS_SEEN_IN: Array<{ label: string; href?: string }> = []

export function TrustedStrip({ onStartGift }: TrustedStripProps) {
  return (
    <section className="bg-muted/30 border-y border-border/60">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Trusted memory makers
          </p>
          <p className="mt-2 font-serif text-lg md:text-xl text-foreground">
            Built for busy gifters who want the emotional win — without the faff.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {TRUST_STATS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="bg-card border border-border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-2xl md:text-3xl text-foreground leading-none">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {item.label}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          Numbers shown reflect early internal tracking and customer feedback.
        </p>

        {AS_SEEN_IN.length > 0 ? (
          <div className="mt-6">
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase text-center">
              As seen in
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {AS_SEEN_IN.map((logo) => (
                <a
                  key={logo.label}
                  href={logo.href || "#"}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {logo.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onStartGift}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Create Their Gift →
          </button>
        </div>
      </div>
    </section>
  )
}
