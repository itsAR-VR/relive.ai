"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { VideoUploader } from "@/components/admin/video-uploader"
import {
  LogOut,
  Shield,
  Package,
  Clock3,
  CheckCircle2,
  Loader2,
  Video,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Play,
  Check,
  Send,
  Eye,
  Filter,
  Upload,
} from "lucide-react"

type OrderStatus = "pending" | "pending_interview" | "interview_in_progress" | "in_production" | "ready" | "delivered" | "cancelled"
type OrderTier = "standard" | "premium" | "biography"

interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin?: boolean
}

interface OrderWithProfile {
  id: string
  user_id: string | null
  status: OrderStatus
  tier: OrderTier
  created_at: string
  stripe_checkout_session_id: string | null
  final_video_url: string | null
  interview_data: Record<string, unknown> | null
  quiz_data: Record<string, unknown> | null
  view_token: string | null
  first_viewed_at: string | null
  recipient_email: string | null
  recipient_name: string | null
  amount_paid: number | null
  profiles: {
    email: string
    full_name: string | null
  } | null
}

interface AdminDashboardContentProps {
  user: User
  profile: Profile
  orders: OrderWithProfile[]
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: <Clock3 className="w-3.5 h-3.5" />,
  },
  pending_interview: {
    label: "Awaiting Interview",
    color: "bg-amber-50 text-amber-700 border-amber-300",
    icon: <ClipboardList className="w-3.5 h-3.5" />,
  },
  interview_in_progress: {
    label: "Interview Started",
    color: "bg-blue-50 text-blue-700 border-blue-300",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  in_production: {
    label: "In Production",
    color: "bg-purple-50 text-purple-700 border-purple-300",
    icon: <Video className="w-3.5 h-3.5" />,
  },
  ready: {
    label: "Ready",
    color: "bg-green-50 text-green-700 border-green-300",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-emerald-50 text-emerald-700 border-emerald-300",
    icon: <Check className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-300",
    icon: <Clock3 className="w-3.5 h-3.5" />,
  },
}

const tierLabels: Record<OrderTier, string> = {
  standard: "Standard",
  premium: "Premium",
  biography: "Biography",
}

// Tier priority for sorting (higher = more important, shows first)
const tierPriority: Record<OrderTier, number> = {
  biography: 3,
  premium: 2,
  standard: 1,
}

// Tier configuration with interview requirements
const tierInterviewConfig: Record<OrderTier, { hasInterview: boolean; description: string; color: string }> = {
  standard: {
    hasInterview: false,
    description: "No consultation required",
    color: "bg-slate-100 text-slate-700",
  },
  premium: {
    hasInterview: false,
    description: "No consultation required",
    color: "bg-blue-100 text-blue-700",
  },
  biography: {
    hasInterview: true,
    description: "30-min consultation required",
    color: "bg-amber-100 text-amber-700",
  },
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function formatCurrency(cents: number | null) {
  if (!cents) return "—"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

// Helper to check if consultation is completed for biography tier
function isConsultationCompleted(interviewData: Record<string, unknown> | null): boolean {
  if (!interviewData) return false
  
  // Check for consultation_completed flag or substantial interview data
  if (interviewData.consultation_completed === true) return true
  
  // Fallback: check if interview has any substantial data
  const hasData = Object.keys(interviewData).some(key => 
    key !== "last_step" && key !== "last_saved_at" && interviewData[key]
  )
  return hasData
}

export function AdminDashboardContent({ user, profile, orders: initialOrders }: AdminDashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [tierFilter, setTierFilter] = useState<OrderTier | "all">("all")
  const [sortBy, setSortBy] = useState<"date" | "tier">("tier")
  const [updating, setUpdating] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.remove("christmas-theme")
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Filter orders by status and tier
  const filteredOrders = orders
    .filter(o => statusFilter === "all" || o.status === statusFilter)
    .filter(o => tierFilter === "all" || o.tier === tierFilter)
    .sort((a, b) => {
      if (sortBy === "tier") {
        // Sort by tier priority first, then by date
        const tierDiff = tierPriority[b.tier] - tierPriority[a.tier]
        if (tierDiff !== 0) return tierDiff
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      // Sort by date only
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const tierCounts = orders.reduce((acc, order) => {
    acc[order.tier] = (acc[order.tier] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, additionalData?: Partial<OrderWithProfile>) => {
    setUpdating(orderId)
    try {
      const updatePayload: Record<string, unknown> = { status: newStatus, ...additionalData }
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update order")
      }

      const { order: updatedOrder } = await response.json()
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o))
    } catch (error) {
      console.error("Failed to update order:", error)
      alert(error instanceof Error ? error.message : "Failed to update order")
    } finally {
      setUpdating(null)
    }
  }

  const copyViewLink = async (order: OrderWithProfile) => {
    const baseUrl = window.location.origin
    const viewUrl = `${baseUrl}/view/${order.id}?token=${order.view_token}`
    await navigator.clipboard.writeText(viewUrl)
    setCopiedId(order.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/gifting-moments-logo.svg"
                alt="Gifting Moments"
                width={180}
                height={60}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300 hidden sm:block">
              {profile?.full_name || user.email}
            </span>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="font-sans border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tier Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["biography", "premium", "standard"] as OrderTier[]).map(tier => {
            const config = tierInterviewConfig[tier]
            const count = tierCounts[tier] || 0
            const isActive = tierFilter === tier
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(tierFilter === tier ? "all" : tier)}
                className={`p-5 rounded-2xl border-2 transition-all text-left ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${isActive ? "bg-white/20" : config.color}`}>
                    {tierLabels[tier]}
                  </span>
                  <span className="text-3xl font-bold">{count}</span>
                </div>
                <div className={`text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                  {config.description}
                </div>
              </button>
            )
          })}
        </section>

        {/* Status Filter Pills */}
        <section className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === "all" 
                ? "bg-slate-900 text-white" 
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            All ({orders.length})
          </button>
          {(Object.keys(statusConfig) as OrderStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === status 
                  ? "bg-slate-900 text-white" 
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {statusConfig[status].label} ({statusCounts[status] || 0})
            </button>
          ))}
        </section>

        {/* Sort Toggle */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Sort by:</span>
          <button
            onClick={() => setSortBy("tier")}
            className={`px-3 py-1 rounded ${sortBy === "tier" ? "bg-slate-200 text-slate-900 font-medium" : "hover:bg-slate-100"}`}
          >
            Priority (Tier)
          </button>
          <button
            onClick={() => setSortBy("date")}
            className={`px-3 py-1 rounded ${sortBy === "date" ? "bg-slate-200 text-slate-900 font-medium" : "hover:bg-slate-100"}`}
          >
            Date
          </button>
        </div>

        {/* Orders Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Orders</h2>
              <span className="text-sm text-slate-500">({filteredOrders.length})</span>
            </div>
            {(statusFilter !== "all" || tierFilter !== "all") && (
              <button
                onClick={() => { setStatusFilter("all"); setTierFilter("all"); }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <Filter className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrder === order.id
                const config = statusConfig[order.status]
                const isUpdating = updating === order.id

                return (
                  <div key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Order Row */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Expand Icon */}
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>

                        {/* Order ID */}
                        <div className="w-24 shrink-0">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">Order</div>
                          <div className="font-mono text-sm text-slate-700">{order.id.slice(0, 8)}...</div>
                        </div>

                        {/* Customer */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">Customer</div>
                          <div className="text-sm text-slate-900 truncate">
                            {order.profiles?.full_name || order.profiles?.email || "Unknown"}
                          </div>
                          {order.profiles?.email && order.profiles?.full_name && (
                            <div className="text-xs text-slate-500 truncate">{order.profiles.email}</div>
                          )}
                        </div>

                        {/* Tier with Consultation Info */}
                        <div className="w-32 shrink-0 hidden sm:block">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">Tier</div>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tierInterviewConfig[order.tier].color}`}>
                            {tierLabels[order.tier]}
                          </div>
                          {order.tier === "biography" && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              30-min consultation
                            </div>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="w-20 shrink-0 hidden md:block">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">Paid</div>
                          <div className="text-sm font-medium text-slate-700">{formatCurrency(order.amount_paid)}</div>
                        </div>

                        {/* Status */}
                        <div className="w-36 shrink-0">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                            {config.icon}
                            {config.label}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="w-40 shrink-0 hidden lg:block text-right">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">Created</div>
                          <div className="text-sm text-slate-600">{formatDate(order.created_at)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-100">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left Column: Order Details */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Order Details</h3>
                            
                            <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                              <div>
                                <div className="text-xs text-slate-400">Full Order ID</div>
                                <div className="font-mono text-xs text-slate-700 break-all">{order.id}</div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400">Stripe Session</div>
                                <div className="font-mono text-xs text-slate-700 break-all">
                                  {order.stripe_checkout_session_id || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400">View Token</div>
                                <div className="font-mono text-xs text-slate-700 break-all">
                                  {order.view_token || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400">First Viewed</div>
                                <div className="text-sm text-slate-700">
                                  {order.first_viewed_at ? formatDate(order.first_viewed_at) : "Not yet viewed"}
                                </div>
                              </div>
                              {order.recipient_name && (
                                <div>
                                  <div className="text-xs text-slate-400">Recipient</div>
                                  <div className="text-sm text-slate-700">{order.recipient_name}</div>
                                  {order.recipient_email && (
                                    <div className="text-xs text-slate-500">{order.recipient_email}</div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* View Link */}
                            {order.view_token && (
                              <button
                                onClick={(e) => { e.stopPropagation(); copyViewLink(order); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                              >
                                {copiedId === order.id ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    Copy View Link
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Middle Column: Interview/Quiz Data */}
                          <div className="space-y-4">
                            {/* Consultation Status (Biography only) */}
                            {order.tier === "biography" && (
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-sm font-semibold text-slate-700">Consultation Status</h3>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierInterviewConfig.biography.color}`}>
                                    Biography
                                  </span>
                                </div>
                                {isConsultationCompleted(order.interview_data) ? (
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">30-min consultation completed</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-amber-600">
                                    <Clock3 className="w-5 h-5" />
                                    <span className="text-sm font-medium">30-min consultation pending</span>
                                  </div>
                                )}
                                <div className="text-xs text-slate-400 mt-2">
                                  Biography tier requires a personal consultation
                                </div>
                              </div>
                            )}

                            {/* Tier Info (Standard/Premium) */}
                            {order.tier !== "biography" && (
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-sm font-semibold text-slate-700">Tier Info</h3>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierInterviewConfig[order.tier].color}`}>
                                    {tierLabels[order.tier]}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-600">
                                  {tierInterviewConfig[order.tier].description}
                                </div>
                              </div>
                            )}

                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Director Interview Data</h3>
                            
                            <div className="bg-white rounded-lg p-4 border border-slate-200 max-h-64 overflow-y-auto">
                              {order.interview_data && Object.keys(order.interview_data).length > 0 ? (
                                <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                                  {JSON.stringify(order.interview_data, null, 2)}
                                </pre>
                              ) : (
                                <p className="text-sm text-slate-400 italic">No interview data yet</p>
                              )}
                            </div>

                            {order.quiz_data && Object.keys(order.quiz_data).length > 0 && (
                              <>
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Quiz Data</h3>
                                <div className="bg-white rounded-lg p-4 border border-slate-200 max-h-40 overflow-y-auto">
                                  <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                                    {JSON.stringify(order.quiz_data, null, 2)}
                                  </pre>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Right Column: Actions */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Fulfillment Actions</h3>
                            
                            <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                              {/* Current Status */}
                              <div className="pb-3 border-b border-slate-100">
                                <div className="text-xs text-slate-400 mb-1">Current Status</div>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                                  {config.icon}
                                  {config.label}
                                </div>
                              </div>

                              {/* Action Buttons based on status */}
                              {order.status === "pending_interview" && (
                                <Button
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "in_production"); }}
                                  disabled={isUpdating}
                                  className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                                  Start Production
                                </Button>
                              )}

                              {order.status === "in_production" && (
                                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                  <div className="text-xs text-slate-500 font-medium">Upload Final Video</div>
                                  <VideoUploader
                                    orderId={order.id}
                                    currentVideoUrl={order.final_video_url}
                                    onUploadComplete={async (url) => {
                                      // Update local state immediately
                                      setOrders(prev => prev.map(o => 
                                        o.id === order.id ? { ...o, final_video_url: url } : o
                                      ))
                                      // Persist to database
                                      await updateOrderStatus(order.id, order.status, { final_video_url: url })
                                    }}
                                  />
                                  {order.final_video_url && (
                                    <Button
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        updateOrderStatus(order.id, "ready"); 
                                      }}
                                      disabled={isUpdating}
                                      className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                      {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                      Mark Ready
                                    </Button>
                                  )}
                                </div>
                              )}

                              {order.status === "ready" && (
                                <div className="space-y-2">
                                  <Button
                                    onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "delivered"); }}
                                    disabled={isUpdating}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Mark Delivered
                                  </Button>
                                  
                                  {order.final_video_url && (
                                    <a
                                      href={order.final_video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      View Final Video
                                    </a>
                                  )}
                                </div>
                              )}

                              {order.status === "delivered" && (
                                <div className="text-center py-4">
                                  <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                                  <p className="text-sm text-slate-600">Order completed</p>
                                  {order.first_viewed_at && (
                                    <p className="text-xs text-slate-400 mt-1">
                                      Viewed: {formatDate(order.first_viewed_at)}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* View Gift Page Link */}
                              {(order.status === "ready" || order.status === "delivered") && (
                                <Link
                                  href={`/view/${order.id}`}
                                  target="_blank"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  Preview Gift Page
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
