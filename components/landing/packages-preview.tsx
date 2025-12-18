"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, Clock, RefreshCw, Shield, Sparkles } from "lucide-react"

interface PackagesPreviewProps {
  onStartGift: () => void
}

const PACKAGES = [
  {
    tierId: "standard",
    name: "Digital Keepsake",
    subtitle: "A single restored memory",
    price: 29,
    originalPrice: 75,
    duration: "15 sec film",
    highlights: [
      "1 Restored Memory Scene",
      "Pick your favorite style (incl. Super 8 vintage)",
      "Delivered via private gift-wrapped page (shareable link)",
    ],
    cta: "Start Digital Keepsake",
    popular: false,
  },
  {
    tierId: "premium",
    name: "Director’s Cut",
    subtitle: "A fully crafted emotional film",
    price: 89,
    originalPrice: 239,
    duration: "60 sec film",
    highlights: [
      "Sound design + music",
      "Unlimited revisions included",
      "Option to add a voice note intro",
    ],
    cta: "Start Director’s Cut",
    popular: true,
  },
  {
    tierId: "biography",
    name: "The Biography",
    subtitle: "A multi-scene legacy documentary",
    price: 139,
    originalPrice: 419,
    duration: "3 min film",
    highlights: [
      "3 connected memory scenes",
      "30-min story consultation call",
      "Priority support & updates throughout",
    ],
    cta: "Talk to a Memory Director",
    popular: false,
  },
]

function percentOff(price: number, originalPrice: number) {
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100)
  return Number.isFinite(pct) && pct > 0 ? pct : null
}

export function PackagesPreview({ onStartGift }: PackagesPreviewProps) {
  const featured = PACKAGES.find((p) => p.tierId === "premium")!
  const otherPackages = PACKAGES.filter((p) => p.tierId !== "premium")
  const featuredPct = percentOff(featured.price, featured.originalPrice)

  return (
    <section className="bg-muted/20 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Packages
          </p>
          <h2 className="mt-3 font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
            Choose the film that fits your moment
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            Clear options. Clear perks. Unlimited revisions on every tier.
          </p>
        </div>

        {/* Trial-box style feature */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-10 items-center max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/10 rounded-3xl blur-2xl opacity-60" />
            <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/restored-colorized-vintage-wedding-photograph-high.jpg"
                  alt="A restored family photograph"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
              </div>
              <div className="p-5 border-t border-border">
                <p className="font-serif text-xl text-foreground">A gift‑wrapped film — ready to send</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload photos and clips. We restore, direct, and deliver a private viewing page with a shareable link.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
                <Clock className="h-4 w-4 text-primary mx-auto" />
                <p className="mt-1 text-xs font-semibold text-foreground">24-hour delivery</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
                <RefreshCw className="h-4 w-4 text-primary mx-auto" />
                <p className="mt-1 text-xs font-semibold text-foreground">Unlimited revisions</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
                <Shield className="h-4 w-4 text-primary mx-auto" />
                <p className="mt-1 text-xs font-semibold text-foreground">Private link</p>
              </div>
            </div>
          </div>

          <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                Most Popular
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-serif text-2xl text-foreground">{featured.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{featured.subtitle}</p>
                <p className="mt-2 text-xs text-muted-foreground">{featured.duration} · Delivered in 24 hours</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">
                  ${featured.price}{" "}
                  <span className="text-muted-foreground line-through font-medium">
                    ${featured.originalPrice}
                  </span>
                </p>
                {featuredPct ? (
                  <p className="mt-1 text-xs font-semibold text-primary">Save {featuredPct}% today</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <p className="text-sm font-semibold text-foreground">The perks:</p>
              <div className="mt-3 space-y-2">
                {featured.highlights.map((perk) => (
                  <div key={perk} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">{perk}</p>
                  </div>
                ))}
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    Unlimited revisions guarantee (all tiers)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    Private gift‑wrapped sharing link (all tiers)
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={onStartGift} size="lg" className="w-full">
                  Start Director’s Cut
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Takes 2 minutes to start · No editing skills needed
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Secure checkout</span>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  See all packages →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Other packages */}
        <div className="mt-8 grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {otherPackages.map((pkg) => {
            const pct = percentOff(pkg.price, pkg.originalPrice)
            return (
              <div key={pkg.tierId} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-xl text-foreground">{pkg.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{pkg.subtitle}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{pkg.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${pkg.price}{" "}
                      <span className="text-muted-foreground line-through font-medium">${pkg.originalPrice}</span>
                    </p>
                    {pct ? (
                      <p className="mt-1 text-xs font-semibold text-primary">Save {pct}% today</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {pkg.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">{h}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Button onClick={onStartGift} className="sm:flex-1">
                    {pkg.cta}
                  </Button>
                  <Link
                    href={`/pricing?recommended=${encodeURIComponent(pkg.tierId)}`}
                    className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-xs text-muted-foreground text-center max-w-3xl mx-auto">
          All packages include AI-enhanced restoration, a private sharing link, and unlimited revisions.
        </p>
      </div>
    </section>
  )
}
