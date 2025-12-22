import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GiftViewContent } from "./gift-view-content"

type OrderStatus = "pending" | "pending_interview" | "interview_in_progress" | "in_production" | "ready" | "delivered" | "cancelled"

interface Order {
  id: string
  status: OrderStatus
  tier: string
  final_video_url: string | null
  interview_data: Record<string, unknown> | null
  created_at: string
  view_token: string | null
  first_viewed_at: string | null
  recipient_name: string | null
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

async function getOrder(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, tier, final_video_url, interview_data, created_at, view_token, first_viewed_at, recipient_name")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to fetch order for view page", error)
  }

  return data as Order | null
}

export default async function ViewGiftPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { token } = await searchParams

  const order = await getOrder(id)

  // Order must exist and be ready or delivered
  if (!order || !["ready", "delivered"].includes(order.status) || order.tier === "custom") {
    notFound()
  }

  // If token is provided, validate it
  const isTokenValid = !!(token && order.view_token && token === order.view_token)
  const isFirstView = isTokenValid && !order.first_viewed_at

  return (
    <GiftViewContent
      order={order}
      isTokenValid={isTokenValid}
      isFirstView={isFirstView}
      token={token}
    />
  )
}
