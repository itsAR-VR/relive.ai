# Relive.ai

**Bring Your Loved Ones' Memories Back to Life**

Transform faded photographs into living, breathing moments. Help grandparents see their wedding day dance again.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://relivemoments.co)

## Project Goals

1. **Photo Enhancement** — Restore and colorize old, faded photographs using AI (Kie.ai Nano Banana Pro).
2. **Video Generation** — Bring still photos to life with subtle, natural motion using AI video generation.
3. **Credit System** — Users purchase credits via Stripe to use the AI features.
4. **User Accounts** — Secure authentication with Supabase (email/password and Google OAuth).

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, PostgreSQL Database)
- **AI:** Kie.ai (Image Enhancement, Video Generation)
- **Payments:** Stripe (Checkout, Webhooks)
- **Hosting:** Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.local.example` to `.env.local` and fill in your keys
4. Run the development server: `pnpm dev`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for webhooks) |
| `KIE_API_KEY` | Kie.ai API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STARTER` | Stripe Price ID for Starter pack |
| `STRIPE_PRICE_POPULAR` | Stripe Price ID for Popular pack |
| `STRIPE_PRICE_PRO` | Stripe Price ID for Pro pack |
| `NEXT_PUBLIC_APP_URL` | Your deployed app URL |

## Credit Costs

- **Photo Enhancement:** 1 credit
- **Video Generation:** 5 credits
- **New users:** 10 free credits on signup

## Documentation

- See `AGENTS.md` for architecture, conventions, and contributor guidelines.
- See `supabase/migrations/` for database schema.

## License

MIT
