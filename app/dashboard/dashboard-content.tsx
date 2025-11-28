"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  Sparkles,
  LogOut,
  Gift,
  Clock3,
  CheckCircle2,
  Loader2,
  Video,
  ClipboardList,
} from "lucide-react"

type OrderStatus = "pending_interview" | "in_production" | "ready"
type OrderTier = "standard" | "premium" | "bio"

interface Profile {
  id: string
  email: string
  full_name: string | null
}

interface Order {
  id: string
  status: OrderStatus
  tier: OrderTier
  created_at: string
  stripe_checkout_session_id?: string | null
  final_video_url?: string | null
  interview_data?: Record<string, unknown> | null
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
  orders: Order[]
}

function statusMeta(status: OrderStatus) {
  switch (status) {
    case "pending_interview":
      return {
        label: "Action Required",
        description: "Complete your Director's Interview so we can start production.",
        tone: "bg-amber-50 border-amber-200 text-amber-800",
        icon: <ClipboardList className="w-4 h-4" />,
      }
    case "in_production":
      return {
        label: "In Production",
        description: "Our directors are working on your memory.",
        tone: "bg-blue-50 border-blue-200 text-blue-800",
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
      }
    case "ready":
    default:
      return {
        label: "Ready",
        description: "Your gift is ready to share.",
        tone: "bg-green-50 border-green-200 text-green-800",
        icon: <CheckCircle2 className="w-4 h-4" />,
      }
  }
}

function tierLabel(tier: OrderTier) {
  switch (tier) {
    case "premium":
      return "Premium Gift"
    case "bio":
      return "Biography Gift"
    default:
      return "Standard Gift"
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function DashboardContent({ user, profile, orders }: DashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    document.documentElement.classList.remove("christmas-theme")
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const interviewLink = (order: Order) =>
    `/director-interview?order_id=${order.stripe_checkout_session_id || order.id}`

  return (
    <div className="min-h-screen bg-[#f5f1e6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e2d8c3] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#a67c52] to-[#8d6e4c] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#3d3632]">Relive</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#7d6b56] hidden sm:block">
              {profile?.full_name || user.email}
            </span>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-[#dbd0ba] text-[#7d6b56] hover:bg-[#f5f1e6]"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="bg-white/70 border border-[#e2d8c3] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-[#8a7e72]">Gifter dashboard</p>
              <h1 className="text-3xl font-bold text-[#3d3632] mt-1">
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
              </h1>
              <p className="text-[#7d6b56] mt-2">
                Track your gifts and finish any Director Interviews to start production.
              </p>
            </div>
            <Link href="/pricing">
              <Button className="bg-[#a67c52] hover:bg-[#8d6e4c] text-white">
                <Gift className="w-4 h-4 mr-2" />
                Start a new gift
              </Button>
            </Link>
          </div>
        </section>

        {orders.length === 0 ? (
          <section className="bg-white/70 border border-dashed border-[#e2d8c3] rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-[#f5f1e6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-7 h-7 text-[#8a7e72]" />
            </div>
            <h3 className="text-xl font-semibold text-[#3d3632] mb-2">No gifts yet</h3>
            <p className="text-[#7d6b56] mb-6">
              Purchase a gift tier to begin and complete the Director&apos;s Interview when prompted.
            </p>
            <Link href="/pricing">
              <Button className="bg-[#3d3632] hover:bg-[#2a2522] text-white">
                Choose a gift tier
              </Button>
            </Link>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-[#8a7e72]">Your gifts</p>
                <h2 className="text-2xl font-semibold text-[#3d3632]">Order status</h2>
              </div>
              <div className="text-sm text-[#7d6b56]">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => {
                const meta = statusMeta(order.status)
                return (
                  <div
                    key={order.id}
                    className="bg-white/80 border border-[#e2d8c3] rounded-xl p-5 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#8a7e72]">Tier</p>
                        <p className="text-lg font-semibold text-[#3d3632]">
                          {tierLabel(order.tier)}
                        </p>
                        <p className="text-xs text-[#8a7e72] mt-0.5">
                          Created {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${meta.tone}`}>
                        {meta.icon}
                        <span>{meta.label}</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#5c4d3f]">{meta.description}</p>

                    <div className="flex items-center gap-3">
                      {order.status === "pending_interview" && (
                        <Link href={interviewLink(order)} className="flex-1">
                          <Button className="w-full bg-[#a67c52] hover:bg-[#8d6e4c] text-white">
                            Complete Director Interview
                          </Button>
                        </Link>
                      )}

                      {order.status === "in_production" && (
                        <Button
                          variant="outline"
                          disabled
                          className="flex-1 border-[#dbd0ba] text-[#7d6b56]"
                        >
                          <Clock3 className="w-4 h-4 mr-2" />
                          In production
                        </Button>
                      )}

                      {order.status === "ready" && (
                        <Link href={`/view/${order.id}`} className="flex-1">
                          <Button className="w-full bg-[#3d3632] hover:bg-[#2a2522] text-white">
                            View gift
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
