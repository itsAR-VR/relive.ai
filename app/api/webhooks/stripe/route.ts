import { getServiceTierById, getStripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import Stripe from "stripe"

// Lazy-load supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  const stripe = getStripe()
  const supabaseAdmin = getSupabaseAdmin()

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const tierId = session.metadata?.tier
      const tier = tierId ? getServiceTierById(tierId) : null

      if (!userId || !tier) break

      const { error } = await supabaseAdmin
        .from("orders")
        .upsert(
          {
            user_id: userId,
            tier: tier.id,
            status: "pending_interview",
            stripe_checkout_session_id: session.id,
          },
          { onConflict: "stripe_checkout_session_id" }
        )

      if (error) {
        console.error("Failed to create order from checkout.session.completed", error)
      }

      break
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      break
    }
  }

  return NextResponse.json({ received: true })
}
