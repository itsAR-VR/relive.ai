"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
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
  final_video_url: string | null
  interview_data: Record<string, unknown> | null
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
  orders: Order[]
}

const lifecycleSteps: { key: OrderStatus; label: string; helper: string }[] = [
  {
    key: "pending_interview",
    label: "Booked",
    helper: "Waiting for your interview",
  },
  {
    key: "in_production",
    label: "In Production",
    helper: "We are working on it — delivery in 24h",
  },
  {
    key: "ready",
    label: "Ready",
    helper: "View and share the gift",
  },
]

function getStepIndex(status: OrderStatus) {
  switch (status) {
    case "pending_interview":
      return 0
    case "in_production":
      return 1
    case "ready":
    default:
      return 2
  }
}

function getStepState(orderStatus: OrderStatus, stepKey: OrderStatus) {
  const currentIndex = getStepIndex(orderStatus)
  const stepIndex = getStepIndex(stepKey)

  if (stepIndex < currentIndex) return "complete" as const
  if (stepIndex === currentIndex) return "current" as const
  return "upcoming" as const
}

function statusMeta(status: OrderStatus) {
  switch (status) {
    case "pending_interview":
      return {
        label: "Booked",
        description: "We need your Director Interview to start crafting the gift.",
        tone: "bg-secondary border-border text-muted-foreground",
        icon: <ClipboardList className="w-4 h-4" />,
      }
    case "in_production":
      return {
        label: "In Production",
        description: "Our directors are working on it now. Delivery ETA: 24 hours.",
        tone: "bg-primary/10 border-primary/30 text-primary",
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
      }
    case "ready":
    default:
      return {
        label: "Ready",
        description: "Your gift is ready. Open, review, and share the link.",
        tone: "bg-accent/20 border-accent/40 text-accent-foreground",
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
  const viewLink = (order: Order) => `/view/${order.id}`

  return (
    <div className="min-h-screen bg-background text-foreground font-serif">
      <header className="sticky top-0 z-50 bg-secondary backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/gifting-moments-logo.svg"
              alt="Gifting Moments"
              width={240}
              height={80}
              className="h-16 md:h-20 w-auto"
            />
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.full_name || user.email}
            </span>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="font-sans border-border text-foreground hover:bg-secondary"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="relative overflow-hidden bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-70 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary">Order workspace</p>
              <h1 className="text-3xl font-semibold mt-2">
                Welcome back,
                <br />
                <span className="text-primary">{profile?.full_name?.split(" ")[0] || "Friend"}</span>.
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Follow every order through Booked → In Production → Ready. Interviews unlock production.
              </p>
            </div>
            <Link href="/pricing">
              <Button className="font-sans bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Gift className="w-4 h-4 mr-2" />
                Start a new gift
              </Button>
            </Link>
          </div>
        </section>

        {orders.length === 0 ? (
          <section className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Book a gift to start the journey. We&apos;ll guide you from interview to delivery.
            </p>
            <Link href="/pricing">
              <Button className="font-sans bg-primary hover:bg-primary/90 text-primary-foreground">
                Choose a gift tier
              </Button>
            </Link>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-primary">Orders</p>
                <h2 className="text-2xl font-semibold">Order lifecycle</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => {
                const meta = statusMeta(order.status)
                const progressIndex = getStepIndex(order.status)
                return (
                  <div
                    key={order.id}
                    className="relative overflow-hidden bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
                  >
                    <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_left,var(--primary)/0.1,transparent_45%)]" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-primary">Gift tier</p>
                        <p className="text-xl font-semibold">
                          {tierLabel(order.tier)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Booked {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border font-sans ${meta.tone}`}>
                        {meta.icon}
                        <span className="font-semibold">{meta.label}</span>
                      </div>
                    </div>

                    <p className="relative text-sm text-muted-foreground">{meta.description}</p>

                    <div className="relative bg-secondary border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
                        <Clock3 className="w-4 h-4" />
                        <span>Order lifecycle</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {lifecycleSteps.map((step, index) => {
                          const state = getStepState(order.status, step.key)
                          const isLast = index === lifecycleSteps.length - 1
                          const connectionComplete = progressIndex > index

                          const icon =
                            step.key === "pending_interview" ? (
                              <ClipboardList className="w-5 h-5" />
                            ) : step.key === "in_production" ? (
                              <Loader2 className={`w-5 h-5 ${state === "current" ? "animate-spin" : ""}`} />
                            ) : (
                              <CheckCircle2 className="w-5 h-5" />
                            )

                          return (
                            <div key={step.key} className="flex items-center w-full">
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-sm ${
                                    state === "complete"
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : state === "current"
                                        ? "bg-accent/20 border-accent text-accent-foreground"
                                        : "bg-card border-border text-muted-foreground"
                                  }`}
                                >
                                  {icon}
                                </div>
                                <div className="space-y-0.5 text-center">
                                  <p className="text-sm font-semibold">{step.label}</p>
                                  <p className="text-xs text-muted-foreground leading-snug max-w-[170px]">
                                    {step.helper}
                                  </p>
                                </div>
                              </div>
                              {!isLast && (
                                <div
                                  className={`h-px flex-1 mx-3 ${
                                    connectionComplete ? "bg-primary" : "bg-border"
                                  }`}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="relative flex flex-col sm:flex-row gap-3">
                      {order.status === "pending_interview" && (
                        <Link href={interviewLink(order)} className="flex-1">
                          <Button className="w-full font-sans bg-primary hover:bg-primary/90 text-primary-foreground">
                            Complete Director Interview
                          </Button>
                        </Link>
                      )}

                      {order.status === "in_production" && (
                        <Button
                          variant="outline"
                          disabled
                          className="flex-1 font-sans border-border text-muted-foreground bg-secondary"
                        >
                          <Clock3 className="w-4 h-4 mr-2" />
                          In production — almost there
                        </Button>
                      )}

                      {order.status === "ready" && (
                        <>
                          <Link href={viewLink(order)} className="flex-1">
                            <Button className="w-full font-sans bg-primary hover:bg-primary/90 text-primary-foreground">
                              View gift
                            </Button>
                          </Link>
                          {order.final_video_url && (
                            <p className="text-xs text-muted-foreground sm:self-center">
                              Final video attached to this order.
                            </p>
                          )}
                        </>
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
