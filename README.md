# Relive.ai (Moments)

**Bring Your Loved Ones' Memories Back to Life**

Transform faded photographs into living, breathing moments. Help grandparents see their wedding day dance again.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://relivemoments.co)
[![Last Updated](https://img.shields.io/badge/Last%20Updated-Nov%2029%2C%202025-blue?style=for-the-badge)]()

---

## Recent Updates (Nov 29, 2025)

✅ **Cross-Device Authentication Fixed** - Magic link flow now works across devices  
✅ **Database Schema Complete** - All required tables and RLS policies in place  
✅ **Interview Flow Working** - Users can complete director interview after checkout  

See [docs/CROSS_DEVICE_AUTH_FIX.md](docs/CROSS_DEVICE_AUTH_FIX.md) for full technical documentation.

---

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

### Quick Setup (New Installations)

Run the comprehensive migration script in Supabase SQL Editor:

**File:** `supabase/migrations/FULL_MIGRATION_RUN_THIS.sql`

This creates all required tables:
- `profiles` - User profile data
- `orders` - Service purchases with quiz/interview data  
- `pending_checkouts` - Email → session_id mapping for cross-device auth

### Individual Migrations

| Migration | Description |
|-----------|-------------|
| `001_initial_schema.sql` | Profiles table |
| `002_orders_table.sql` | Orders table for service purchases |
| `003_orders_public_access.sql` | RLS policies for orders |
| `004_pending_checkouts.sql` | Cross-device auth support |
| `FULL_MIGRATION_RUN_THIS.sql` | **Complete setup (run this for new installs)** |

### Verifying Tables Exist

Run this in Supabase SQL Editor to verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('orders', 'pending_checkouts', 'profiles');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('orders', 'pending_checkouts');

-- Check policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

### Required Policies

**orders table:**
- `Users can view own orders`
- `Users can update own orders`
- `Service role full access`
- `Users can claim unclaimed orders`
- `Allow order creation`

**pending_checkouts table:**
- `Service role access pending_checkouts`
- `Users can read own pending checkout`

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

## Project Structure

```
relive.ai/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── orders/
│   │   │   ├── claim/route.ts    # Claim order for authenticated user
│   │   │   ├── pending/route.ts  # Get user's pending order
│   │   │   └── [id]/interview/   # Save/load interview progress
│   │   ├── checkout/
│   │   │   └── pending/route.ts  # Cross-device session mapping
│   │   ├── stripe/
│   │   │   └── checkout/route.ts # Create Stripe checkout session
│   │   └── webhooks/
│   │       └── stripe/route.ts   # Handle Stripe webhooks
│   ├── auth/
│   │   ├── callback/page.tsx     # OAuth callback
│   │   └── confirm/page.tsx      # Magic link confirmation
│   ├── director-interview/       # Post-purchase interview flow
│   ├── pricing/                  # Service tier selection
│   └── dashboard/                # User's orders dashboard
├── components/
│   ├── hash-auth-listener.tsx    # Global auth token handler
│   ├── director-interview-form.tsx
│   └── landing/                  # Landing page components
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   └── stripe.ts                 # Stripe helpers
├── supabase/
│   └── migrations/               # SQL migration scripts
│       └── FULL_MIGRATION_RUN_THIS.sql
└── docs/
    └── CROSS_DEVICE_AUTH_FIX.md  # Auth flow documentation
```

## Key Components

### HashAuthListener (`components/hash-auth-listener.tsx`)
Global component that handles magic link tokens in URL hash. Imported in `app/layout.tsx`.

**Responsibilities:**
1. Detect `#access_token=...` in URL
2. Set Supabase session
3. Recover session_id (URL → localStorage → database lookup)
4. Claim order
5. Redirect to interview page

### Director Interview Flow
1. User lands on `/director-interview?session_id=xxx`
2. Enters email, sends magic link
3. `pending_checkouts` table stores `(email, session_id)`
4. User clicks email link
5. `HashAuthListener` recovers session_id, claims order
6. Interview form loads with order data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `pnpm lint` before committing
4. Submit a pull request

## License

MIT

---

*Built with ❤️ for preserving family memories*
