# AGENTS.md — Relive.ai Path Guide

Scope: This file governs the Relive.ai codebase (Next.js App Router, Supabase Auth/DB, Kie.ai integration, Stripe payments).

Read this first if you're contributing, reviewing, or acting as an automated coding agent.

## Reading Order

1. `README.md` — Product overview, goals, and environment setup
2. `supabase/migrations/001_initial_schema.sql` — Database schema and RLS policies
3. This file (`AGENTS.md`) — Architecture, conventions, and workflow

## Project Goals

1. **Photo Enhancement** — Restore and colorize old photographs using Kie.ai (Nano Banana Pro).
2. **Video Generation** — Bring still photos to life with AI-generated motion.
3. **Credit System** — Users purchase credits via Stripe to use AI features.
4. **User Accounts** — Secure authentication with Supabase (email/password, Google OAuth).

## Intent & Principles

- Keep it simple: Next.js App Router conventions, minimal abstraction layers.
- User-first: Every feature should serve the core use case of restoring family memories.
- Security by default: Use Supabase RLS, validate all inputs, never expose secrets client-side.
- Testability: Isolate API routes, use server/client Supabase clients appropriately.
- Clarity: TypeScript everywhere, descriptive variable names, co-located components.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, shadcn/ui |
| Auth & DB | Supabase (Auth, PostgreSQL, Row Level Security) |
| AI | Kie.ai (Image Enhancement, Video Generation) |
| Payments | Stripe (Checkout Sessions, Webhooks) |
| Hosting | Vercel |

## Code Organization

```
app/
├── api/                    # API Routes (server-side)
│   ├── enhance/route.ts    # Image enhancement endpoint
│   ├── generate/route.ts   # Video generation endpoint
│   ├── stripe/checkout/    # Stripe checkout session creation
│   └── webhooks/           # Stripe & Kie.ai webhook handlers
├── auth/callback/          # OAuth callback handler
├── dashboard/              # Protected user dashboard
├── login/                  # Authentication UI
├── pricing/                # Credit purchase UI
├── layout.tsx              # Root layout
└── page.tsx                # Landing page

components/
├── landing/                # Landing page sections
│   ├── hero-section.tsx
│   ├── feature-selector.tsx
│   └── ...
└── ui/                     # shadcn/ui components

lib/
├── supabase/
│   ├── client.ts           # Browser Supabase client
│   ├── server.ts           # Server Supabase client
│   └── middleware.ts       # Auth middleware helper
├── stripe.ts               # Stripe client & package config
└── kie.ts                  # Kie.ai API client

supabase/
└── migrations/             # SQL migration files
```

## Key Patterns

### Supabase Client Usage

- **Client Components (`"use client"`):** Use `lib/supabase/client.ts` via `useState(() => createClient())` to avoid SSR issues.
- **Server Components / API Routes:** Use `lib/supabase/server.ts` directly.
- **Middleware:** Use `lib/supabase/middleware.ts` for session refresh.

### API Route Structure

All API routes follow this pattern:
1. Authenticate user via Supabase
2. Validate request body
3. Check credits (if applicable)
4. Call external API (Kie.ai, Stripe)
5. Update database
6. Return JSON response

### Environment Variables

| Variable | Context | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin access for webhooks |
| `KIE_API_KEY` | Server only | Kie.ai API key |
| `STRIPE_SECRET_KEY` | Server only | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Server only | Stripe webhook signing secret |
| `STRIPE_PRICE_*` | Server only | Stripe Price IDs |
| `NEXT_PUBLIC_APP_URL` | Client + Server | Deployed app URL |

## Workflow & Quality

### User Flow

```
Landing Page → Login/Signup → Dashboard → Upload Photo → Enhance → Generate Video → Download
                                ↓
                           Buy Credits (Stripe) → Webhook adds credits → Dashboard updates
```

### Database Tables

- `profiles` — User data, credit balance, Stripe customer ID
- `generations` — AI job history (type, status, URLs, credits used)
- `transactions` — Payment history (Stripe session ID, amount, status)

### Credit Costs

- Image Enhancement: 1 credit
- Video Generation: 5 credits
- New users start with 10 free credits

## Expectations for Agents/Contributors

- Read `README.md` and this file before making changes.
- Use TypeScript; avoid `any` types.
- Keep components small and focused.
- Co-locate related files (e.g., `dashboard/page.tsx` + `dashboard/dashboard-content.tsx`).
- Test auth flows manually after changes to middleware or Supabase clients.
- Commit with conventional commit messages (e.g., `feat:`, `fix:`, `docs:`).

## Common Tasks

### Adding a New API Route

1. Create `app/api/[feature]/route.ts`
2. Import `createClient` from `@/lib/supabase/server`
3. Authenticate: `const { data: { user } } = await supabase.auth.getUser()`
4. Return `NextResponse.json(...)` with appropriate status codes

### Adding a New Protected Page

1. Create `app/[page]/page.tsx`
2. The middleware at `middleware.ts` already protects `/dashboard/*`
3. For new protected routes, update the middleware matcher

### Updating Database Schema

1. Add SQL to `supabase/migrations/` with incremented number
2. Run in Supabase SQL Editor
3. Update TypeScript types if needed

## Debugging

- **500 MIDDLEWARE_INVOCATION_FAILED:** Check if Supabase env vars are set in Vercel.
- **Auth redirect loops:** Clear cookies, check `middleware.ts` logic.
- **Stripe webhook failures:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard.
- **"Insufficient credits":** Check `profiles.credits` in Supabase Table Editor.

## Ambiguity

- Default to the simplest solution that works.
- When in doubt, follow Next.js App Router conventions.
- Document non-obvious decisions in code comments or PR descriptions.

