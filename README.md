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
| `META_PIXEL_ID` | Meta Pixel ID used for server-side Conversions API calls |
| `META_CAPI_ACCESS_TOKEN` | Meta Conversions API access token |
| `META_CAPI_API_VERSION` | Optional, defaults to `v20.0` |
| `META_CAPI_TEST_EVENT_CODE` | Optional test event code for QA events |

## Meta Conversions API

- Server helper: `lib/meta.ts` handles hashing and posting to the Meta Graph `/events` edge.
- Proxy endpoint: `POST /api/meta/conversions` lets the client send structured events; it auto-attaches `_fbp`/`_fbc`, IP, and UA from the request.
- Wired events:
  - `InitiateCheckout` (server) on Stripe checkout session creation with event_id = session id for deduping.
  - `Purchase` (server) on `checkout.session.completed` webhook with value/currency from Stripe.
  - `SubmitApplication` (server) when the director interview is submitted.
- Add other events (Lead, ViewContent, etc.) by calling the proxy with `event_name`, `event_source_url`, and `user_data` (email/phone optional) from the relevant UI interactions.

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

## Magic Link Authentication Flow

The app uses Supabase magic links for passwordless authentication after Stripe checkout:

### Flow Overview

```
1. User completes Stripe checkout
2. Lands on /director-interview?session_id=cs_test_xxx
3. User enters email → sends magic link
4. Email → session_id mapping stored in pending_checkouts table
5. User clicks magic link in email → redirected to /#access_token=...
6. HashAuthListener sets session, looks up session_id by email
7. Redirects to /director-interview?session_id=xxx&auth_complete=true
8. Interview form loads, order is claimed
```

### Cross-Device Support

When a user starts checkout on one device (desktop) but clicks the magic link on another (mobile):

1. Desktop: `sendMagicLink` stores `(email, session_id)` in `pending_checkouts` table
2. Mobile: `HashAuthListener` looks up `session_id` by email after auth
3. Mobile: Redirects with correct `session_id`, order is claimed

**Important:** The `pending_checkouts` table must have a UNIQUE constraint on email for upserts to work.

## Database Migrations

The following migrations must be run in Supabase:

| Migration | Description |
|-----------|-------------|
| `001_initial_schema.sql` | Profiles table |
| `002_orders_table.sql` | Orders table for service purchases |
| `003_orders_public_access.sql` | RLS policies for orders |
| `004_pending_checkouts.sql` | Cross-device auth support |

### Running Migrations

Run in Supabase SQL Editor or via CLI:

```sql
-- 004_pending_checkouts.sql (required for cross-device auth)
create table if not exists public.pending_checkouts (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  stripe_session_id text not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '24 hours') not null
);
create index if not exists pending_checkouts_session_idx on public.pending_checkouts(stripe_session_id);
```

## Troubleshooting

### "No pending order found" after magic link verification

**Causes:**
1. `pending_checkouts` table doesn't exist in Supabase
2. Email lookup failed (check Supabase logs)
3. Stripe webhook hasn't created the order yet (race condition)

**Fix:**
1. Run `004_pending_checkouts.sql` migration
2. Ensure the email used matches the one from Stripe checkout
3. Check Vercel logs for API errors

### "Still waiting for login" on desktop after verifying on mobile

**Cause:** Desktop doesn't have a Supabase session (session is device-specific)

**Solution:** Continue on the device where you clicked the email link, or send a new magic link on the current device.

### Magic link lands on root URL with access_token hash

**This is expected behavior.** The `HashAuthListener` component (in `app/layout.tsx`) handles this:
1. Detects `#access_token=...` in URL
2. Sets Supabase session
3. Looks up `session_id` by email
4. Redirects to `/director-interview?session_id=xxx&auth_complete=true`

### Interview progress lost

Interview progress is saved to the `orders.interview_data` column. If lost:
1. Check if user is authenticated (Dashboard shows orders)
2. Verify order exists in Supabase `orders` table
3. Check `/api/orders/[id]/interview` endpoint for errors

### Debugging Tips

1. **Supabase Auth Logs:** Dashboard → Authentication → Logs
2. **Vercel Function Logs:** Vercel Dashboard → Functions tab
3. **Browser Console:** Check for `HashAuthListener:` prefixed messages
4. **Network Tab:** Monitor `/api/orders/claim` and `/api/checkout/pending` responses

## License

MIT
