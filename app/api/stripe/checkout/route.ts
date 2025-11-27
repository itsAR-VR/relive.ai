import { createClient } from "@/lib/supabase/server"
import { getStripe, getPackageById } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    const creditPackage = getPackageById(packageId)

    if (!creditPackage) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 })
    }

    if (!creditPackage.priceId) {
      console.error("Stripe checkout error: missing priceId", {
        packageId,
        expectedEnv: {
          starter: ["STRIPE_PRICE_STARTER", "STRIPE_PRICE_CAPSULE", "STRIPE_PRICE_SNAPSHOT"],
          popular: ["STRIPE_PRICE_POPULAR", "STRIPE_PRICE_MEMORY"],
          pro: ["STRIPE_PRICE_PRO", "STRIPE_PRICE_LEGACY"],
        }[packageId as "starter" | "popular" | "pro"],
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
      line_items: [{ price: creditPackage.priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/dashboard?success=true&credits=${creditPackage.credits}`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
        package_id: creditPackage.id,
        credits: creditPackage.credits.toString(),
      },
    })

    await supabase.from("transactions").insert({
      user_id: user.id,
      stripe_checkout_session_id: session.id,
      amount_cents: creditPackage.price * 100,
      credits_purchased: creditPackage.credits,
      status: "pending",
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session"
    console.error("Stripe checkout error:", message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
