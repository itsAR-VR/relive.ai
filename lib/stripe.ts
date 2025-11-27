import Stripe from "stripe"

// Lazy-load Stripe to avoid build-time errors when env vars aren't set
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured")
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil",
      typescript: true,
    })
  }
  return _stripe
}

// Credit packages configuration
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: 5, // $5
    priceId: process.env.STRIPE_PRICE_STARTER,
    popular: false,
  },
  {
    id: "popular",
    name: "Popular Pack",
    credits: 50,
    price: 20, // $20
    priceId: process.env.STRIPE_PRICE_POPULAR,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 150,
    price: 50, // $50
    priceId: process.env.STRIPE_PRICE_PRO,
    popular: false,
  },
] as const

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"]

export function getPackageById(id: string) {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id)
}

export function getPackageByPriceId(priceId: string) {
  return CREDIT_PACKAGES.find((pkg) => pkg.priceId === priceId)
}
