"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Heart, Clapperboard, Film, Sparkles, Shield, Clock, RefreshCw, Minus, Plus, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"

// Force dynamic rendering to avoid SSG issues with searchParams
export const dynamic = "force-dynamic"

function percentOff(price: number, originalPrice: number) {
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100)
  return Number.isFinite(pct) && pct > 0 ? pct : null
}

// Service packages for Moments
const SERVICE_PACKAGES = [
  {
    id: "keepsake",
    tierId: "standard",
    name: "Digital Keepsake",
    subtitle: "A single restored memory",
    price: 29,
    originalPrice: 75,
    duration: "15 secs",
    features: [
      "1 Restored Memory Scene (up to 5 generations; we pick the most emotional & accurate cut)",
      "Pick your favorite style (incl. Super 8 vintage)",
      "Sound Design + Music",
      "Unlimited Revisions",
      "Delivered via private gift-wrapped page (shareable link)",
    ],
    includedFrom: null,
    perfectFor: "Perfect for small gestures or thinking of you moments.",
    icon: Heart,
    popular: false,
  },
  {
    id: "directors",
    tierId: "premium",
    name: "Director's Cut",
    subtitle: "A fully crafted emotional film",
    price: 89,
    originalPrice: 239,
    duration: "60 secs",
    features: [
      "1 Restored Memory Scene (up to 20 generations; we pick the most emotional & accurate cut)",
      "Sound Design + Music",
      "Private gift-wrapped page (your own shareable link)",
      "Unlimited Revisions",
      "Option to add a voice note intro",
    ],
    includedFrom: "Everything in Digital Keepsake",
    perfectFor: "Perfect for milestone birthdays, holidays, and big gifts.",
    icon: Clapperboard,
    popular: true,
  },
  {
    id: "biography",
    tierId: "biography",
    name: "The Biography",
    subtitle: "A multi-scene legacy documentary",
    price: 139,
    originalPrice: 419,
    duration: "180 secs",
    features: [
      "3 connected Restored Memory Scenes (25 generations per scene; we pick the most emotional & accurate cuts)",
      "30-Min Story Consultation Call (we guide the narrative)",
      "Documentary-style editing",
      "Optional Custom Narration",
      "Unlimited revisions with priority support & updates throughout the process",
    ],
    bonus: "🎁 Holiday Bonus: Include additional people (both parents, grandparents, or family pet)",
    includedFrom: "Everything in Director's Cut",
    perfectFor: "Ideal for group gifts, parents, grandparents, or legacy keepsakes.",
    icon: Film,
    popular: false,
  },
]

function PricingContent() {
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type?: "error" | "success" } | null>(null)
  const [quizData, setQuizData] = useState<{ honoree?: string; memory?: string; vibe?: string } | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [customCount, setCustomCount] = useState(1)
  const searchParams = useSearchParams()
  const recommendedTier = searchParams.get("recommended")
  const premiumRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDraft = () => {
      const sources = [
        typeof localStorage !== "undefined" ? localStorage.getItem("gifter_draft") : null,
        typeof sessionStorage !== "undefined" ? sessionStorage.getItem("giftingmoments_quiz") : null,
      ]
      for (const raw of sources) {
        if (!raw) continue
        try {
          const parsed = JSON.parse(raw)
          setQuizData({
            honoree: parsed.who || parsed.honoree,
            memory: parsed.memory,
            vibe: parsed.vibe || parsed.feeling,
          })
          break
        } catch {
          // ignore
        }
      }
    }

    loadDraft()
  }, [])

  // Track desktop viewport so only desktop clicks trigger card-level checkout
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const updateMatch = () => setIsDesktop(mediaQuery.matches)
    updateMatch()
    mediaQuery.addEventListener("change", updateMatch)
    return () => mediaQuery.removeEventListener("change", updateMatch)
  }, [])

  // Scroll to recommended package after a short delay
  useEffect(() => {
    if (recommendedTier === "premium" && premiumRef.current) {
      const timer = setTimeout(() => {
        premiumRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [recommendedTier])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const handlePurchase = async (tierId: string, options?: { quantity?: number }) => {
    setLoading(tierId)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, quizData, quantity: options?.quantity }),
      })

      const data = await response.json()

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start checkout. Please try again.")
      }

      window.location.href = data.url
    } catch (error) {
      console.error("Purchase error:", error)
      const message = error instanceof Error ? error.message : "Failed to start checkout. Please try again."
      setToast({ message, type: "error" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-3 shadow-lg border ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header - Compact */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/gifting-moments-logo.svg"
              alt="Gifting Moments"
              width={220}
              height={75}
              className="h-16 md:h-20 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      {/* Pricing Content - Condensed */}
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {/* Quiz Summary (if available) - Compact */}
        {quizData && quizData.memory && (
          <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border max-w-lg mx-auto">
            <p className="text-xs text-muted-foreground">Creating a memory for:</p>
            <p className="font-serif text-base text-foreground capitalize">
              {quizData.honoree || "Someone Special"}
            </p>
          </div>
        )}

        {/* Header - Compact */}
        <div className="text-center mb-6 md:mb-8">
          <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium border border-accent/30">
            <Sparkles className="w-3 h-3" />
            Holiday season — Up to 67% Off
          </span>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
            Choose Your Package
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Warm, nostalgic memories. Designed to make them cry.
          </p>
        </div>

        {/* Pricing Cards - Condensed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {SERVICE_PACKAGES.map((pkg) => {
            const Icon = pkg.icon
            const isRecommended = recommendedTier === pkg.tierId
            const showBadge = pkg.popular || isRecommended
            const pct = percentOff(pkg.price, pkg.originalPrice)
            return (
              <div
                key={pkg.id}
                ref={pkg.tierId === "premium" ? premiumRef : undefined}
                className={`relative bg-card rounded-xl border-2 p-4 md:p-5 transition-all flex flex-col ${
                  showBadge
                    ? "border-primary shadow-lg md:scale-[1.02] ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                } ${isDesktop ? "cursor-pointer" : ""}`}
                role={isDesktop ? "button" : undefined}
                tabIndex={isDesktop ? 0 : -1}
                onClick={() => {
                  if (isDesktop) {
                    handlePurchase(pkg.tierId)
                  }
                }}
                onKeyDown={(event) => {
                  if (!isDesktop) return
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handlePurchase(pkg.tierId)
                  }
                }}
              >
                {showBadge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                      {isRecommended ? "Recommended for You" : "Most Popular"}
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                      showBadge ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${showBadge ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl text-foreground mb-0.5">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-primary font-medium mb-1">
                    ${pkg.price}{" "}
                    <span className="text-muted-foreground line-through">(from ${pkg.originalPrice})</span>
                    {pct ? (
                      <span className="ml-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        Save {pct}%
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    {pkg.duration}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pkg.subtitle}
                  </p>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  {/* Included from previous tier */}
                  {pkg.includedFrom && (
                    <div className="flex items-start gap-2 text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm font-medium">{pkg.includedFrom}</span>
                    </div>
                  )}
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Holiday Bonus */}
                {"bonus" in pkg && pkg.bonus && (
                  <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-xs text-accent-foreground font-medium">{pkg.bonus}</p>
                  </div>
                )}

                {/* Perfect For */}
                <p className="text-xs text-muted-foreground italic mb-4 text-center">
                  {pkg.perfectFor}
                </p>

                <Button
                  onClick={(event) => {
                    event.stopPropagation()
                    handlePurchase(pkg.tierId)
                  }}
                  disabled={loading === pkg.tierId}
                  className={`w-full h-10 md:h-11 font-medium text-sm mt-auto ${
                    showBadge
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                      : "bg-foreground hover:bg-foreground/90 text-background"
                  }`}
                >
                  {loading === pkg.tierId ? (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    "Book Now"
                  )}
                </Button>
              </div>
            )
          })}

          {/* Custom package - full width */}
          <div className="md:col-span-3 bg-card rounded-xl border-2 border-border p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl text-foreground">Revive Clips (Custom)</h3>
                    <p className="text-sm text-muted-foreground">Animate photos into 5‑second video clips</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "1 photo → 1 5‑second clip",
                    "Bulk upload your photos after checkout",
                    "No sound design + music",
                    "No gift‑wrapped viewing page",
                    "No revisions",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-muted-foreground italic">
                  Perfect for quickly reviving multiple moments — delivered within 24 hours.
                </p>
              </div>

              <div className="w-full md:w-[320px] border border-border rounded-xl p-4 bg-muted/20">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Price</p>
                    <p className="text-sm text-foreground font-semibold">$8 per clip</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-medium">Total</p>
                    <p className="text-lg font-semibold text-foreground">${customCount * 8}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-muted-foreground font-medium mb-2">How many photos do you want revived?</p>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomCount((c) => Math.max(1, c - 1))}
                      className="h-10 w-10 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={customCount}
                        onChange={(e) => setCustomCount(Number(e.target.value))}
                        className="w-full"
                        aria-label="Custom clip quantity"
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>1</span>
                        <span>20</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomCount((c) => Math.min(20, c + 1))}
                      className="h-10 w-10 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium text-foreground">{customCount}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total runtime</span>
                    <span className="font-medium text-foreground">{customCount * 5}s</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase("custom", { quantity: customCount })}
                  disabled={loading === "custom"}
                  className="w-full h-10 md:h-11 font-medium text-sm mt-5 bg-foreground hover:bg-foreground/90 text-background"
                >
                  {loading === "custom" ? (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    "Checkout"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section - Improved 3 bullets */}
        <div className="mt-8 md:mt-10">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <RefreshCw className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm text-foreground font-medium">Unlimited revisions (gift packages)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm text-foreground font-medium">24-hour Delivery</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-xs md:text-sm text-foreground font-medium">Private sharing link (gift packages)</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4 max-w-sm mx-auto">
            We work until you cry. 500+ memories restored.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
