"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CREDIT_PACKAGES } from "@/lib/stripe"
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react"
import Link from "next/link"

const PACKAGE_ICONS = {
  starter: Zap,
  popular: Sparkles,
  pro: Crown,
}

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)

    try {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login?redirect=/pricing"
        return
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout")
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Failed to start checkout. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1e6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e2d8c3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#a67c52] to-[#8d6e4c] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#3d3632]">Relive</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-[#7d6b56] hover:text-[#a67c52] flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#3d3632] mb-4">
            Get More Credits
          </h1>
          <p className="text-lg text-[#7d6b56] max-w-2xl mx-auto">
            Choose a credit pack to continue bringing your memories to life.
            Credits never expire.
          </p>
        </div>

        {/* Credit Usage Info */}
        <div className="flex justify-center gap-8 mb-12 text-sm text-[#7d6b56]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#a67c52] rounded-full" />
            <span>1 credit = 1 photo enhancement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#3d3632] rounded-full" />
            <span>5 credits = 1 video generation</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => {
            const Icon = PACKAGE_ICONS[pkg.id as keyof typeof PACKAGE_ICONS]
            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                  pkg.popular
                    ? "border-[#a67c52] shadow-lg scale-105"
                    : "border-[#e2d8c3]"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#a67c52] text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                      pkg.popular
                        ? "bg-gradient-to-br from-[#a67c52] to-[#8d6e4c]"
                        : "bg-[#f5f1e6]"
                    }`}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        pkg.popular ? "text-white" : "text-[#a67c52]"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3d3632] mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-3xl font-bold text-[#3d3632]">
                    ${pkg.price}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-[#5c4d3f]">
                    <Check className="w-5 h-5 text-[#a67c52]" />
                    <span>
                      <strong>{pkg.credits}</strong> credits
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5c4d3f]">
                    <Check className="w-5 h-5 text-[#a67c52]" />
                    <span>
                      {pkg.credits} photo restorations
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5c4d3f]">
                    <Check className="w-5 h-5 text-[#a67c52]" />
                    <span>
                      {Math.floor(pkg.credits / 5)} video generations
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5c4d3f]">
                    <Check className="w-5 h-5 text-[#a67c52]" />
                    <span>Credits never expire</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full h-12 font-medium ${
                    pkg.popular
                      ? "bg-gradient-to-r from-[#a67c52] to-[#8d6e4c] hover:from-[#8d6e4c] hover:to-[#735a3a] text-white"
                      : "bg-[#3d3632] hover:bg-[#2a2522] text-white"
                  }`}
                >
                  {loading === pkg.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    `Buy ${pkg.credits} Credits`
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#8a7e72] mb-4">
            Secure payment powered by Stripe
          </p>
          <div className="flex justify-center items-center gap-4 opacity-50">
            <svg className="h-8" viewBox="0 0 60 25" fill="currentColor">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a12.5 12.5 0 01-4.73.94c-4.44 0-7.27-2.42-7.27-7.13 0-4.22 2.5-7.13 6.52-7.13 4.34 0 6.29 3.17 6.29 7.13v1.27zm-4.77-5.57c-1.13 0-2.12.7-2.12 2.48h4.05c0-1.61-.72-2.48-1.93-2.48z" />
              <path d="M42.84 3.16l4.56-.62v4.72h4.78v3.47h-4.78v5.88c0 1.8.76 2.52 2.03 2.52.7 0 1.53-.17 2.17-.4v3.3c-.87.35-2.13.61-3.68.61-3.6 0-5.08-2.04-5.08-5.48V10.73h-2.47V7.26h2.47V3.16z" />
              <path d="M29.53 20.64c-4.56 0-7.1-2.83-7.1-7.16 0-4.34 2.54-7.16 7.1-7.16s7.1 2.82 7.1 7.16c0 4.33-2.54 7.16-7.1 7.16zm0-10.87c-1.86 0-2.51 1.58-2.51 3.71 0 2.12.65 3.71 2.51 3.71 1.85 0 2.5-1.59 2.5-3.71 0-2.13-.65-3.71-2.5-3.71z" />
              <path d="M18.43 11.98c1.33-.7 2.27-1.86 2.27-3.58 0-2.82-2.38-4.02-5.57-4.02H8.26v15.91h7.1c3.47 0 5.8-1.46 5.8-4.73 0-1.95-1.08-3.22-2.73-3.58zm-5.95-4.63h2.49c1.21 0 1.94.53 1.94 1.53 0 1.05-.73 1.67-1.94 1.67h-2.49V7.35zm2.72 9.5h-2.72v-3.68h2.72c1.39 0 2.24.64 2.24 1.84 0 1.19-.85 1.84-2.24 1.84z" />
              <path d="M0 4.37h4.56v15.92H0z" />
            </svg>
          </div>
        </div>
      </main>
    </div>
  )
}

