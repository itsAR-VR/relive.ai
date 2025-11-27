"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CREDIT_PACKAGES } from "@/lib/stripe"
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react"
import Link from "next/link"

const PACKAGE_ICONS = { starter: Zap, popular: Sparkles, pro: Crown }

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)

    try {
      const { data: { user } } = await supabase.auth.getUser()

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
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e2d8c3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#a67c52] to-[#8d6e4c] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#3d3632]">Relive</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-[#7d6b56] hover:text-[#a67c52] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#3d3632] mb-4">Get More Credits</h1>
          <p className="text-lg text-[#7d6b56] max-w-2xl mx-auto">Choose a credit pack to continue bringing your memories to life. Credits never expire.</p>
        </div>

        <div className="flex justify-center gap-8 mb-12 text-sm text-[#7d6b56]">
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#a67c52] rounded-full" /><span>1 credit = 1 photo enhancement</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#3d3632] rounded-full" /><span>5 credits = 1 video generation</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => {
            const Icon = PACKAGE_ICONS[pkg.id as keyof typeof PACKAGE_ICONS]
            return (
              <div key={pkg.id} className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${pkg.popular ? "border-[#a67c52] shadow-lg scale-105" : "border-[#e2d8c3]"}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#a67c52] text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${pkg.popular ? "bg-gradient-to-br from-[#a67c52] to-[#8d6e4c]" : "bg-[#f5f1e6]"}`}>
                    <Icon className={`w-7 h-7 ${pkg.popular ? "text-white" : "text-[#a67c52]"}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3d3632] mb-1">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-[#3d3632]">${pkg.price}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-[#5c4d3f]"><Check className="w-5 h-5 text-[#a67c52]" /><span><strong>{pkg.credits}</strong> credits</span></div>
                  <div className="flex items-center gap-2 text-[#5c4d3f]"><Check className="w-5 h-5 text-[#a67c52]" /><span>{pkg.credits} photo restorations</span></div>
                  <div className="flex items-center gap-2 text-[#5c4d3f]"><Check className="w-5 h-5 text-[#a67c52]" /><span>{Math.floor(pkg.credits / 5)} video generations</span></div>
                  <div className="flex items-center gap-2 text-[#5c4d3f]"><Check className="w-5 h-5 text-[#a67c52]" /><span>Credits never expire</span></div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full h-12 font-medium ${pkg.popular ? "bg-gradient-to-r from-[#a67c52] to-[#8d6e4c] hover:from-[#8d6e4c] hover:to-[#735a3a] text-white" : "bg-[#3d3632] hover:bg-[#2a2522] text-white"}`}
                >
                  {loading === pkg.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `Buy ${pkg.credits} Credits`}
                </Button>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[#8a7e72] mb-4">Secure payment powered by Stripe</p>
        </div>
      </main>
    </div>
  )
}
