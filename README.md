# Relive.ai

**Bring Your Loved Ones' Memories Back to Life**

Transform faded photographs into living, breathing moments. Help grandparents see their wedding day dance again.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://relivemoments.co)

## Project Goals

1. **Photo Enhancement** — Restore and colorize old, faded photographs using AI (Kie.ai Nano Banana Pro).
2. **Video Generation** — Bring still photos to life with subtle, natural motion using AI video generation.
3. **Service Orders** — Users purchase direct service tiers via Stripe (Standard/Premium/Biography) and complete a director interview.
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key (use publishable default key in new Supabase UI) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase publishable key (fallback in clients) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for webhooks, storage uploads) |
| `SUPABASE_SECRET_KEY` | Supabase secret (optional; service role covers admin needs) |
| `KIE_API_KEY` | Kie.ai API key |
| `KIE_WEBHOOK_SECRET` | Shared secret for verifying Kie webhooks (optional but recommended) |
| `KIE_WEBHOOK_IP_ALLOWLIST` | Comma-separated IPs allowed to call the webhook (optional) |
| `STRIPE_SECRET_KEY` | Stripe secret key (match test/live mode with the price IDs) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STANDARD` | Stripe Price ID for the Standard gift tier ($49) |
| `STRIPE_PRICE_PREMIUM` | Stripe Price ID for the Premium gift tier ($149) |
| `STRIPE_PRICE_BIO` | Stripe Price ID for the Biography gift tier ($299) |
| `NEXT_PUBLIC_APP_URL` | Your deployed app URL |

## Kie.ai Integration (current)

- Image (Nano Banana Pro): `model: "nano-banana-pro"` via `POST /api/v1/jobs/createTask` with `prompt`, `image_input` (public URL), optional `aspect_ratio` (e.g., 1:1), `resolution` (1K/2K/4K), `output_format` (png/jpg), and optional `callBackUrl`.
- Video (Wan 2.5 image-to-video): `model: "wan/2-5-image-to-video"` via `POST /api/v1/jobs/createTask` with `prompt`, `image_url` (public URL), optional `duration` ("5"|"10"), `resolution` ("720p"|"1080p"), `negative_prompt`, `enable_prompt_expansion`, `seed`, and optional `callBackUrl`.
- Status: `GET /api/v1/jobs/recordInfo?taskId=...` returns `state` (waiting/queuing/generating/success/fail) and `resultJson.resultUrls`.
- Webhooks: same shape as recordInfo; optional verification via `KIE_WEBHOOK_SECRET` or `KIE_WEBHOOK_IP_ALLOWLIST`.
- Uploads: data-URL images are uploaded to Supabase Storage (`user-uploads` bucket, public) before calling Kie to ensure publicly accessible URLs.

## Stripe Prices (test/live)

- Set `STRIPE_PRICE_STANDARD`, `STRIPE_PRICE_PREMIUM`, and `STRIPE_PRICE_BIO` to the Price IDs for the three service tiers (Standard $49, Premium $149, Biography $299).
- Keep secret key and price IDs aligned to the same mode (both test or both live) to avoid 500s at checkout.

## Development Checks

- Lint: `pnpm lint`
- Build: `pnpm build` (warnings: multiple lockfiles root inference; middleware convention deprecated)

## License

MIT
