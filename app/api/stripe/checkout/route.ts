import { createClient } from "@/lib/supabase/server"
import { getServiceTierById, getStripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tierId, tier, packageId } = body
    const serviceTierId: string | undefined = tierId || tier || packageId

    if (!serviceTierId) {
      return NextResponse.json({ error: "Service tier is required" }, { status: 400 })
    }

    const serviceTier = getServiceTierById(serviceTierId)

    if (!serviceTier) {
      return NextResponse.json({ error: "Invalid service tier" }, { status: 400 })
    }

    if (!serviceTier.priceId) {
      console.error("Stripe checkout error: missing priceId", {
        tier: serviceTierId,
        expectedEnv: ["STRIPE_PRICE_STANDARD", "STRIPE_PRICE_PREMIUM", "STRIPE_PRICE_BIO"],
      })
      return NextResponse.json({ error: "Price not configured for this package" }, { status: 500 })
    }

    const stripe = getStripe()
    let stripeCustomerId: string | undefined

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      stripeCustomerId = customer.id

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id)
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: serviceTier.priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/director-interview?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
        tier: serviceTier.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session"
    console.error("Stripe checkout error:", message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
