"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Gift, ArrowLeft, Heart, Clapperboard, Film, Sparkles, Shield, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"

// Service packages for GiftingMoments - condensed features
const SERVICE_PACKAGES = [
  {
    id: "keepsake",
    name: "Digital Keepsake",
    tagline: "Just thinking of you",
    price: 49,
    originalPrice: 99,
    description: "A thoughtful gesture.",
    features: [
      "1 Restored Memory Video",
      "Super 8 Vintage Style",
      "Email Delivery",
    ],
    icon: Heart,
    popular: false,
  },
  {
    id: "directors",
    name: "Director's Cut",
    tagline: "The Big Gift",
    price: 149,
    originalPrice: 299,
    description: "Our most popular. Perfect for milestones.",
    features: [
      "Concierge Curation (20 versions)",
      "Sound Design & Music",
      "Private Viewing Page",
      "Unlimited Revisions",
      "Voice Note Intro",
    ],
    icon: Clapperboard,
    popular: true,
  },
  {
    id: "biography",
    name: "The Biography",
    tagline: "Mini-Documentary",
    price: 299,
    originalPrice: 800,
    description: "Group gift. Split with siblings.",
    features: [
      "3 Connected Memory Scenes",
      "30-Min Consultation Call",
      "Mini-Doc Format",
      "Custom Narration",
    ],
    icon: Film,
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type?: "error" | "success" } | null>(null)
  const [quizData, setQuizData] = useState<{ honoree?: string; memory?: string; feeling?: string } | null>(null)

  useEffect(() => {
    // Check for quiz data from session storage
    const stored = sessionStorage.getItem("giftingmoments_quiz")
    if (stored) {
      try {
        setQuizData(JSON.parse(stored))
      } catch {
        // Ignore parsing errors
      }
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)

    try {
      // Store the package selection and go directly to intake (Stripe integration later)
      // No sign-in check - account created via Stripe email matching
      sessionStorage.setItem("giftingmoments_package", packageId)
      window.location.href = "/director-interview"
      
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
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Gift className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-serif text-foreground">GiftingMoments</span>
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
            Black Friday — Up to 60% Off
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
            return (
              <div
                key={pkg.id}
                className={`relative bg-card rounded-xl border-2 p-4 md:p-5 transition-all ${
                  pkg.popular
                    ? "border-primary shadow-lg md:scale-[1.02] ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                      pkg.popular ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${pkg.popular ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl text-foreground mb-0.5">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-primary font-medium mb-2">
                    {pkg.tagline}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-serif text-foreground">${pkg.price}</span>
                    <span className="text-sm text-muted-foreground line-through">${pkg.originalPrice}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full h-10 md:h-11 font-medium text-sm ${
                    pkg.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                      : "bg-foreground hover:bg-foreground/90 text-background"
                  }`}
                >
                  {loading === pkg.id ? (
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
