import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
})

export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: 5,
    priceId: process.env.STRIPE_PRICE_STARTER,
    popular: false,
  },
  {
    id: "popular",
    name: "Popular Pack",
    credits: 50,
    price: 20,
    priceId: process.env.STRIPE_PRICE_POPULAR,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 150,
    price: 50,
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
