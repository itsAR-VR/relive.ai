import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

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
      const credits = parseInt(session.metadata?.credits || "0", 10)

      if (!userId || !credits) break

      await supabaseAdmin.rpc("add_credits", { user_uuid: userId, amount: credits })

      await supabaseAdmin
        .from("transactions")
        .update({
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("stripe_checkout_session_id", session.id)

      console.log(\`Added \${credits} credits to user \${userId}\`)
      break
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session
      await supabaseAdmin
        .from("transactions")
        .update({ status: "failed" })
        .eq("stripe_checkout_session_id", session.id)
      break
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = charge.payment_intent as string

      if (!paymentIntentId) break

      const { data: transaction } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .single()

      if (transaction) {
        await supabaseAdmin.rpc("deduct_credits", {
          user_uuid: transaction.user_id,
          amount: transaction.credits_purchased,
        })

        await supabaseAdmin
          .from("transactions")
          .update({ status: "refunded" })
          .eq("id", transaction.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
