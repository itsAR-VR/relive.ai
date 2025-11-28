-- =============================================
-- Orders table for service-based purchases
-- =============================================

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending_interview' check (status in ('pending_interview', 'in_production', 'ready')),
  tier text not null check (tier in ('standard', 'premium', 'bio')),
  quiz_data jsonb default '{}'::jsonb,
  interview_data jsonb default '{}'::jsonb,
  final_video_url text,
  stripe_checkout_session_id text unique,
  created_at timestamptz default now() not null
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

-- =============================================
-- Profiles credit column is now legacy-only
-- =============================================
alter table public.profiles
  alter column credits set default 0;

comment on column public.profiles.credits is 'Legacy credit balance (deprecated in favor of direct orders)';
