"use client"

import Image from "next/image"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, Minus, X as XIcon } from "lucide-react"

type Tone = "yes" | "no" | "maybe"

const COLUMNS = [
  { key: "regular", label: "Regular gifts", sublabel: "Luxury items" },
  { key: "apps", label: "Generic apps", sublabel: "Slideshow & memory apps" },
  { key: "gm", label: "Gifting Moments", sublabel: "Best" },
] as const

const ROWS: Array<{
  label: string
  values: Record<(typeof COLUMNS)[number]["key"], Tone>
}> = [
  {
    label: "Made to make them cry (happy tears)",
    values: { regular: "maybe", apps: "no", gm: "yes" },
  },
  {
    label: "Rewatchable for years",
    values: { regular: "no", apps: "maybe", gm: "yes" },
  },
  {
    label: "Recreate a life moment from 1+ photos",
    values: { regular: "no", apps: "no", gm: "yes" },
  },
  {
    label: "Human editors guide the story",
    values: { regular: "no", apps: "no", gm: "yes" },
  },
  {
    label: "Minutes for the giver",
    values: { regular: "no", apps: "no", gm: "yes" },
  },
  {
    label: "Delivered in 24 hours (holiday guaranteed)",
    values: { regular: "no", apps: "maybe", gm: "yes" },
  },
  {
    label: "Unlimited revisions",
    values: { regular: "no", apps: "maybe", gm: "yes" },
  },
  {
    label: "More valuable than a luxury gift",
    values: { regular: "no", apps: "no", gm: "yes" },
  },
  {
    label: "Gift-wrapped film link",
    values: { regular: "no", apps: "maybe", gm: "yes" },
  },
]

const toneIcon = (tone: Tone) => {
  if (tone === "yes") return Check
  if (tone === "maybe") return Minus
  return XIcon
}

const toneStyles = (tone: Tone, isPrimary: boolean) => {
  if (tone === "yes") {
    return isPrimary
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-foreground text-background border-foreground"
  }
  if (tone === "maybe") {
    return "bg-transparent text-muted-foreground border-border"
  }
  return "bg-transparent text-muted-foreground border-border"
}

export function Comparison() {
  const competitorKeys = ["regular", "apps"] as const
  const [activeCompetitorIndex, setActiveCompetitorIndex] = useState(0)
  const activeCompetitorKey = competitorKeys[activeCompetitorIndex]
  const activeCompetitor =
    activeCompetitorKey === "regular" ? COLUMNS[0] : COLUMNS[1]
  const isLeftDisabled = activeCompetitorIndex === 0
  const isRightDisabled = activeCompetitorIndex === competitorKeys.length - 1

  return (
    <section className="bg-background py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Why Gifting Moments
          </p>
          <h2 className="mt-3 font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
            The most emotional gift, made easy.
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            It&apos;s always the thoughtful gifts that make us smile, so skip the designer handbag and save 10,000% by
            giving the gift of a lifetime.
          </p>
        </div>

        <div className="max-w-[920px] mx-auto relative">
          <div className="pointer-events-none absolute right-[-21rem] bottom-[-2rem] hidden lg:block z-30 animate-float-medium">
            <Image
              src="/graphics/ribbon-filmstrip.png"
              alt=""
              width={380}
              height={260}
              className="opacity-90"
            />
          </div>

          <div className="relative z-10 px-8 py-10 lg:px-12 lg:py-12">
            <div className="relative rounded-[28px] border-2 border-border bg-secondary shadow-sm overflow-hidden">
              <div className="pointer-events-none absolute -left-[calc(1.75rem+10px)] -top-[calc(1.75rem+6px)] hidden lg:block z-20">
                <Image
                  src="/graphics/wax-seal.png"
                  alt=""
                  width={230}
                  height={230}
                  className="opacity-95"
                />
              </div>
            <div className="md:hidden">
              <table className="w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-[11px] uppercase tracking-wide text-muted-foreground bg-secondary">
                      Comparison
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-foreground bg-primary/10 border-l-2 border-r-2 border-primary/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="font-serif text-sm">Gifting Moments</p>
                          <p className="text-[11px] text-muted-foreground">First of its kind</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                          Best
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-foreground border-l border-border">
                      <div className="space-y-0.5">
                        <p className="font-serif text-sm">{activeCompetitor.label}</p>
                        <p className="text-[11px] text-muted-foreground">{activeCompetitor.sublabel}</p>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, index) => (
                    <tr key={row.label} className="border-b border-border">
                      <th
                        scope="row"
                        className={`px-4 py-3 text-sm font-semibold text-foreground border-b border-border bg-secondary ${
                          index === ROWS.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        {row.label}
                      </th>
                      {(["gm", activeCompetitorKey] as const).map((key) => {
                        const tone = row.values[key]
                        const Icon = toneIcon(tone)
                        const isPrimary = key === "gm"
                        return (
                          <td
                            key={`${row.label}-${key}`}
                            className={`px-4 py-3 text-sm text-foreground border-b border-border text-center ${
                              isPrimary
                                ? "bg-primary/10 border-l-2 border-r-2 border-primary/40"
                                : "border-l border-border"
                            } ${index === ROWS.length - 1 ? "border-b-0" : ""}`}
                            aria-label={`${key} ${tone}`}
                          >
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${toneStyles(
                                tone,
                                isPrimary,
                              )}`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-center gap-6 py-4">
                <button
                  type="button"
                  aria-label="Show luxury gifts comparison"
                  disabled={isLeftDisabled}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isLeftDisabled
                      ? "border-border text-muted-foreground/60"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setActiveCompetitorIndex(0)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  {competitorKeys.map((_, idx) => (
                    <span
                      key={`dot-${idx}`}
                      className={`h-2.5 w-2.5 rounded-full border ${
                        idx === activeCompetitorIndex ? "bg-foreground border-foreground" : "border-border"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Show generic apps comparison"
                  disabled={isRightDisabled}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isRightDisabled
                      ? "border-border text-muted-foreground/60"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setActiveCompetitorIndex(1)}
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="hidden md:block">
              <table className="w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-[11px] uppercase tracking-wide text-muted-foreground bg-secondary">
                      Comparison
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-foreground bg-primary/10 border-l-2 border-r-2 border-primary/40 rounded-t-2xl">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="font-serif text-base">Gifting Moments</p>
                          <p className="text-xs text-muted-foreground">First of its kind</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Best
                        </span>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-foreground border-l border-border">
                      <div className="space-y-0.5">
                        <p className="font-serif text-base">Regular gifts</p>
                        <p className="text-xs text-muted-foreground">Luxury items</p>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-foreground border-l border-border">
                      <div className="space-y-0.5">
                        <p className="font-serif text-base">Generic apps</p>
                        <p className="text-xs text-muted-foreground">Slideshow & memory apps</p>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, index) => (
                    <tr key={row.label} className="border-b border-border">
                      <th
                        scope="row"
                        className={`px-5 py-3 text-sm font-semibold text-foreground border-b border-border bg-secondary ${
                          index === ROWS.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        {row.label}
                      </th>
                      {(["gm", "regular", "apps"] as const).map((key) => {
                        const tone = row.values[key]
                        const Icon = toneIcon(tone)
                        const isPrimary = key === "gm"
                        const isLastRow = index === ROWS.length - 1
                        return (
                          <td
                            key={`${row.label}-${key}`}
                            className={`px-5 py-3 text-sm text-foreground border-b border-border text-center ${
                              isPrimary
                                ? "bg-primary/10 border-l-2 border-r-2 border-primary/40"
                                : "border-l border-border"
                            } ${isLastRow ? "border-b-0" : ""} ${
                              isPrimary && isLastRow ? "rounded-b-2xl" : ""
                            }`}
                            aria-label={`${key} ${tone}`}
                          >
                            <span
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${toneStyles(
                                tone,
                                isPrimary,
                              )}`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
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
      </div>
    </section>
  )
}
