import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "./dashboard-content"
import { AdminDashboardContent } from "./admin-dashboard-content"

interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin?: boolean
}

interface OrderWithProfile {
  id: string
  user_id: string | null
  status: string
  tier: string
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

interface SupportTicket {
  id: string
  user_id: string | null
  name: string
  email: string
  subject: string
  message: string
  status: string
  order_id: string | null
  created_at: string
  updated_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile with admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", user.id)
    .single()

  // If admin, fetch ALL orders with customer info AND support tickets
  if (profile?.is_admin) {
    const [ordersResult, ticketsResult] = await Promise.all([
      supabase
        .from("orders")
        .select(`
          id,
          user_id,
          status,
          tier,
          created_at,
          stripe_checkout_session_id,
          final_video_url,
          interview_data,
          quiz_data,
          view_token,
          first_viewed_at,
          recipient_email,
          recipient_name,
          amount_paid,
          profiles(email, full_name)
        `)
        .order("created_at", { ascending: false }),
      supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
    ])

    if (ordersResult.error) {
      console.error("Admin orders fetch error:", ordersResult.error)
    }
    if (ticketsResult.error) {
      console.error("Admin support tickets fetch error:", ticketsResult.error)
    }

    console.log("Admin fetched orders count:", ordersResult.data?.length || 0)
    console.log("Admin fetched support tickets count:", ticketsResult.data?.length || 0)

    return (
      <AdminDashboardContent
        user={user}
        profile={profile as Profile}
        orders={(ordersResult.data as OrderWithProfile[]) || []}
        supportTickets={(ticketsResult.data as SupportTicket[]) || []}
      />
    )
  }

  // Regular user: get only their orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, tier, created_at, stripe_checkout_session_id, final_video_url, interview_data")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardContent
      user={user}
      profile={profile}
      orders={orders || []}
    />
  )
}
