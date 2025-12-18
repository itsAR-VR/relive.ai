"use client"

import { Button } from "@/components/ui/button"
import { Check, X as XIcon } from "lucide-react"
import Link from "next/link"

interface ComparisonProps {
  onStartGift: () => void
}

const COMPARISON = [
  {
    title: "DIY slideshow",
    badge: "DIY",
    tone: "muted",
    items: [
      { text: "Hours of sorting & editing", ok: false },
      { text: "No storytelling support", ok: false },
      { text: "Often never finished", ok: false },
    ],
  },
  {
    title: "Generic apps",
    badge: "Apps",
    tone: "muted",
    items: [
      { text: "One-size-fits-all templates", ok: false },
      { text: "Limited support & revisions", ok: false },
      { text: "Feels like a tech demo", ok: false },
    ],
  },
  {
    title: "Gifting Moments",
    badge: "Best",
    tone: "primary",
    items: [
      { text: "Human editors shape the story", ok: true },
      { text: "AI enhances — never replaces emotion", ok: true },
      { text: "Delivered in 24 hours with unlimited revisions", ok: true },
    ],
    highlight: "✅ Made to make them cry (happy tears).",
  },
]

export function Comparison({ onStartGift }: ComparisonProps) {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Why Gifting Moments
          </p>
          <h2 className="mt-3 font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
            The easiest way to give the most emotional gift they’ve ever received.
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            You bring the photos and stories. We bring the direction, pacing, music, and the “this feels like them”
            magic.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {COMPARISON.map((col) => {
            const isPrimary = col.tone === "primary"
            return (
              <div
                key={col.title}
                className={`relative rounded-2xl border p-6 ${
                  isPrimary
                    ? "bg-card border-primary/40 shadow-lg ring-2 ring-primary/15"
                    : "bg-card border-border shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-serif text-xl text-foreground">{col.title}</p>
                    {"highlight" in col && col.highlight ? (
                      <p className="mt-2 text-xs font-semibold text-primary">{col.highlight}</p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                      isPrimary
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-muted-foreground border-border"
                    }`}
                  >
                    {col.badge}
                  </span>
                </div>

                <div className="space-y-3">
                  {col.items.map((item) => (
                    <div key={item.text} className="flex items-start gap-2">
                      {item.ok ? (
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      ) : (
                        <XIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      )}
                      <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={onStartGift} className="px-6">
              Create Their Gift
            </Button>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              See packages & pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
