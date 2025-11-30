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

const priceIds = {
  standard: process.env.STRIPE_PRICE_STANDARD,
  premium: process.env.STRIPE_PRICE_PREMIUM,
  bio: process.env.STRIPE_PRICE_BIO,
}

export const SERVICE_TIERS = [
  {
    id: "standard",
    name: "Digital Keepsake",
    price: 29, // $29 (Black Friday price)
    priceId: priceIds.standard,
  },
  {
    id: "premium",
    name: "Director's Cut",
    price: 89, // $89 (Black Friday price)
    priceId: priceIds.premium,
  },
  {
    id: "biography",
    name: "The Biography",
    price: 139, // $139 (Black Friday price)
    priceId: priceIds.bio,
  },
] as const

export type ServiceTierId = (typeof SERVICE_TIERS)[number]["id"]

export function getServiceTierById(id: string) {
  return SERVICE_TIERS.find((tier) => tier.id === id)
}

export function getServiceTierByPriceId(priceId: string) {
  return SERVICE_TIERS.find((tier) => tier.priceId === priceId)
}
