import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "./dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile for greeting
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get orders for this gifter
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
