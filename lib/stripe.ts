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

// Resolve price IDs with backward-compatibility for renamed env vars.
const priceIds = {
  starter:
    process.env.STRIPE_PRICE_STARTER ||
    process.env.STRIPE_PRICE_CAPSULE ||
    process.env.STRIPE_PRICE_SNAPSHOT,
  popular:
    process.env.STRIPE_PRICE_POPULAR ||
    process.env.STRIPE_PRICE_MEMORY,
  pro:
    process.env.STRIPE_PRICE_PRO ||
    process.env.STRIPE_PRICE_LEGACY,
}

// Credit packages configuration
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Time Capsule",
    credits: 10,
    price: 5, // $5
    priceId: priceIds.starter,
    popular: false,
  },
  {
    id: "popular",
    name: "Memory Bank",
    credits: 50,
    price: 20, // $20
    priceId: priceIds.popular,
    popular: true,
  },
  {
    id: "pro",
    name: "Legacy",
    credits: 150,
    price: 50, // $50
    priceId: priceIds.pro,
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
