-- =============================================
-- Pending Checkouts: Links email to Stripe session
-- This enables cross-device authentication flows
-- =============================================

create table if not exists public.pending_checkouts (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  stripe_session_id text not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '24 hours') not null
);

-- Index for fast email lookups
create index if not exists pending_checkouts_email_idx on public.pending_checkouts(email);
create index if not exists pending_checkouts_session_idx on public.pending_checkouts(stripe_session_id);

-- Allow service role to manage this table (no RLS needed - managed by API)
-- This table is ephemeral - entries are created at magic link send time
-- and deleted after successful order claim

-- Cleanup old entries (optional scheduled job)
-- delete from pending_checkouts where expires_at < now();
