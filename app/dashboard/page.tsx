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

  // If admin, fetch ALL orders with customer info
  if (profile?.is_admin) {
    const { data: allOrders, error: ordersError } = await supabase
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
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Admin orders fetch error:", ordersError)
    }

    console.log("Admin fetched orders count:", allOrders?.length || 0)

    return (
      <AdminDashboardContent
        user={user}
        profile={profile as Profile}
        orders={(allOrders as OrderWithProfile[]) || []}
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
