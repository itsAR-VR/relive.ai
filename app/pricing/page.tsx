"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Heart, Clapperboard, Film, Sparkles, Shield, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Force dynamic rendering to avoid SSG issues with searchParams
export const dynamic = "force-dynamic"

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
      "1 Restored Memory Film",
      "Super 8 Vintage Style",
      "Delivered by Email",
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
      "We generate up to 20 scenes and select the most emotional one",
      "Sound Design + Music",
      "Private Viewing Page (your own shareable link)",
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
    duration: "3 mins",
    features: [
      "3 Connected Restored Memory Scenes",
      "30-Min Story Consultation Call (we guide the narrative)",
      "Documentary-style editing",
      "Optional Custom Narration",
      "Priority support & updates throughout the process",
    ],
    bonus: "🎁 Black Friday Bonus: Include additional people (both parents, grandparents, or family pet)",
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

  const handlePurchase = async (tierId: string) => {
    setLoading(tierId)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, quizData }),
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
            Black Friday — Up to 67% Off
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
            return (
              <div
                key={pkg.id}
                ref={pkg.tierId === "premium" ? premiumRef : undefined}
                className={`relative bg-card rounded-xl border-2 p-4 md:p-5 transition-all flex flex-col ${
                  showBadge
                    ? "border-primary shadow-lg md:scale-[1.02] ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
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
                    ${pkg.price} <span className="text-muted-foreground line-through">(from ${pkg.originalPrice})</span>
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

                {/* Black Friday Bonus */}
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
                  onClick={() => handlePurchase(pkg.tierId)}
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
        </div>

        {/* Trust Section - Improved 3 bullets */}
        <div className="mt-8 md:mt-10">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs md:text-sm text-foreground font-medium">100% Money-Back</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm text-foreground font-medium">24hr Delivery</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <RefreshCw className="w-4 h-4 text-accent" />
              <span className="text-xs md:text-sm text-foreground font-medium">Unlimited Revisions</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4 max-w-sm mx-auto">
            We work until you cry. 500+ memories restored.
          </p>
        </div>
      </main>
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
