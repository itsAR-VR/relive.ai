"use client"

import { Check, Minus, X as XIcon } from "lucide-react"

const COLUMNS = [
  { key: "regular", label: "Regular gifts", sublabel: "Luxury items" },
  { key: "apps", label: "Generic apps", sublabel: "Slideshow & memory apps" },
  { key: "gm", label: "Gifting Moments", sublabel: "Best" },
]

const ROWS = [
  {
    label: "Emotional impact",
    regular: { tone: "maybe", text: "Sometimes" },
    apps: { tone: "no", text: "Rarely" },
    gm: { tone: "yes", text: "Happy tears" },
  },
  {
    label: "Gift lasts",
    regular: { tone: "no", text: "Fades fast" },
    apps: { tone: "maybe", text: "Just a file" },
    gm: { tone: "yes", text: "Rewatch for years" },
  },
  {
    label: "First-of-its-kind reliving",
    regular: { tone: "no", text: "Not possible" },
    apps: { tone: "no", text: "Not possible" },
    gm: { tone: "yes", text: "Yes, from 1+ photos" },
  },
  {
    label: "Guided storytelling",
    regular: { tone: "no", text: "No guidance" },
    apps: { tone: "no", text: "Template-only" },
    gm: { tone: "yes", text: "Human editors" },
  },
  {
    label: "Effort for giver",
    regular: { tone: "no", text: "Shop & guess" },
    apps: { tone: "no", text: "Hours of editing" },
    gm: { tone: "yes", text: "Minutes via quiz" },
  },
  {
    label: "Feels like them",
    regular: { tone: "maybe", text: "Hit or miss" },
    apps: { tone: "no", text: "Generic" },
    gm: { tone: "yes", text: "Built from their story" },
  },
  {
    label: "Delivery certainty",
    regular: { tone: "no", text: "Shipping delays" },
    apps: { tone: "maybe", text: "DIY timeline" },
    gm: { tone: "yes", text: "24h guaranteed" },
  },
  {
    label: "Revisions",
    regular: { tone: "no", text: "No revisions" },
    apps: { tone: "maybe", text: "Limited" },
    gm: { tone: "yes", text: "Unlimited" },
  },
  {
    label: "Price vs value",
    regular: { tone: "no", text: "High cost, short-lived" },
    apps: { tone: "maybe", text: "Low cost, low impact" },
    gm: { tone: "yes", text: "Less cost, more value" },
  },
  {
    label: "Gift format",
    regular: { tone: "maybe", text: "Physical item" },
    apps: { tone: "maybe", text: "App link" },
    gm: { tone: "yes", text: "Gift-wrapped film link" },
  },
  {
    label: "Hard-to-shop-for parents",
    regular: { tone: "no", text: "Often misses" },
    apps: { tone: "no", text: "Feels generic" },
    gm: { tone: "yes", text: "Designed for parents" },
  },
]

const toneIcon = (tone: "yes" | "no" | "maybe") => {
  if (tone === "yes") return Check
  if (tone === "maybe") return Minus
  return XIcon
}

const toneColor = (tone: "yes" | "no" | "maybe") => {
  if (tone === "yes") return "text-emerald-600"
  if (tone === "maybe") return "text-amber-500"
  return "text-muted-foreground"
}

export function Comparison() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Why Gifting Moments
          </p>
          <h2 className="mt-3 font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
            The easiest way to give the most emotional gift they&apos;ve ever received.
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            It&apos;s always the thoughtful gifts that make us smile, so skip the designer handbag and save 10,000% by
            giving the gift of a lifetime.
          </p>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            Using old photos and the story of your loved one, we recreate the key moments in their life and add a
            digital gift wrap.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="md:hidden space-y-4">
            {ROWS.map((row) => (
              <div key={row.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-sm font-semibold text-foreground">{row.label}</p>
                <div className="mt-3 space-y-3">
                  {COLUMNS.map((col) => {
                    const cell = row[col.key as "regular" | "apps" | "gm"]
                    const Icon = toneIcon(cell.tone)
                    const isBest = col.key === "gm"
                    return (
                      <div
                        key={`${row.label}-${col.key}`}
                        className={`rounded-xl border px-3 py-2 ${
                          isBest ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-foreground">
                              {isBest ? "Gifting Moments" : col.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isBest ? "First of its kind" : col.sublabel}
                            </p>
                          </div>
                          {isBest ? (
                            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                              Best
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                          <Icon className={`h-4 w-4 ${toneColor(cell.tone)}`} />
                          <span>{cell.text}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-4 text-xs uppercase tracking-wide text-muted-foreground sticky left-0 z-10 bg-card">
                      Comparison
                    </th>
                    {COLUMNS.map((col) => {
                      const isBest = col.key === "gm"
                      return (
                        <th
                          key={col.key}
                          className={`px-5 py-4 text-sm font-semibold text-foreground border-b border-border ${
                            isBest ? "bg-primary/5 border-l border-primary/20 border-r border-primary/20" : ""
                          }`}
                          scope="col"
                        >
                          {isBest ? (
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-serif text-base">Gifting Moments</p>
                                <p className="text-xs text-muted-foreground">First of its kind</p>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                Best
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-serif text-base">{col.label}</p>
                              <p className="text-xs text-muted-foreground">{col.sublabel}</p>
                            </div>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, index) => (
                    <tr key={row.label} className="border-b border-border">
                      <th
                        scope="row"
                        className={`px-5 py-4 text-sm font-semibold text-foreground border-b border-border bg-card sticky left-0 z-10 ${
                          index === ROWS.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        {row.label}
                      </th>
                      {(["regular", "apps", "gm"] as const).map((key) => {
                        const cell = row[key]
                        const Icon = toneIcon(cell.tone)
                        const isBest = key === "gm"
                        return (
                          <td
                            key={`${row.label}-${key}`}
                            className={`px-5 py-4 text-sm text-foreground border-b border-border ${
                              isBest ? "bg-primary/5 border-l border-primary/20 border-r border-primary/20" : ""
                            } ${index === ROWS.length - 1 ? "border-b-0" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${toneColor(cell.tone)}`} />
                              <span>{cell.text}</span>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
