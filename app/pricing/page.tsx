"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Check, Gift, ArrowLeft, Heart, Clapperboard, Film, Sparkles } from "lucide-react"
import Link from "next/link"

// Service packages for GiftingMoments
const SERVICE_PACKAGES = [
  {
    id: "keepsake",
    name: "The Digital Keepsake",
    tagline: "Just thinking of you",
    price: 49,
    originalPrice: 99,
    description: "Perfect for smaller budgets or a thoughtful gesture.",
    features: [
      "1 Restored Memory Video",
      "Super 8 Vintage Style",
      "High-Resolution Download",
      "Email Delivery",
      "24-Hour Turnaround",
    ],
    icon: Heart,
    popular: false,
  },
  {
    id: "directors",
    name: "The Director's Cut",
    tagline: "Concierge Service & Sound Design",
    price: 149,
    originalPrice: 299,
    description: "Our most popular package. Perfect for milestone birthdays.",
    features: [
      "Concierge Curation (20 versions, best 1 delivered)",
      "Professional Sound Design & Music",
      "Private Viewing Page",
      "Unlimited Revisions",
      "Optional Voice Note Introduction",
      "24-Hour Priority Delivery",
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
    description: "Perfect for group gifts. Siblings can split the cost.",
    features: [
      "3 Connected Memory Scenes",
      "30-Minute Consultation Call",
      "Mini-Documentary Format",
      "Custom Narration",
      "Private Family Viewing Page",
      "Unlimited Revisions",
      "Physical \"Digital Ticket\" PDF",
    ],
    icon: Film,
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type?: "error" | "success" } | null>(null)
  const [quizData, setQuizData] = useState<{ honoree?: string; memory?: string; feeling?: string } | null>(null)
  const supabase = createClient()

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
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Store the package selection before redirecting
        sessionStorage.setItem("giftingmoments_package", packageId)
        window.location.href = "/login?redirect=/pricing"
        return
      }

      // For now, redirect to director-interview with package info
      // In production, this would go to Stripe checkout first
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

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <Gift className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-serif text-foreground">GiftingMoments</span>
              <p className="text-xs text-muted-foreground">Memory Restoration Studio</p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Quiz Summary (if available) */}
        {quizData && quizData.memory && (
          <div className="mb-12 p-6 bg-muted/50 rounded-2xl border border-border max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Creating a memory for:</p>
            <p className="font-serif text-lg text-foreground capitalize mb-3">
              {quizData.honoree || "Someone Special"}
            </p>
            <p className="text-sm text-muted-foreground italic">
              &ldquo;{quizData.memory.slice(0, 150)}{quizData.memory.length > 150 ? "..." : ""}&rdquo;
            </p>
          </div>
        )}

        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium border border-accent/30">
            <Sparkles className="w-4 h-4" />
            Black Friday Special — Up to 60% Off
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            Choose Your Memory Package
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every package includes our &ldquo;Memory Haze&rdquo; aesthetic—warm, nostalgic, and designed to feel like a cherished memory.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {SERVICE_PACKAGES.map((pkg) => {
            const Icon = pkg.icon
            return (
              <div
                key={pkg.id}
                className={`relative bg-card rounded-2xl border-2 p-6 lg:p-8 transition-all hover:shadow-xl ${
                  pkg.popular
                    ? "border-primary shadow-lg md:scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      pkg.popular
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 ${
                        pkg.popular ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-4">
                    {pkg.tagline}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-serif text-foreground">
                      ${pkg.price}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ${pkg.originalPrice}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {pkg.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 text-foreground">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full h-12 font-medium text-base ${
                    pkg.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                      : "bg-foreground hover:bg-foreground/90 text-background"
                  }`}
                >
                  {loading === pkg.id ? (
                    <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    "Book This Package"
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              100% Money-Back Guarantee
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Secure Payment via Stripe
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent" />
              500+ Memories Restored
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            &ldquo;We work until you cry.&rdquo; — Our promise to deliver a memory that truly moves them.
          </p>
        </div>
      </main>
    </div>
  )
}
