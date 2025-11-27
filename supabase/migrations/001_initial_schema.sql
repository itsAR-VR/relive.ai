-- =============================================
-- Relive.ai Database Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  credits integer default 10 not null, -- Free credits on signup
  tier text default 'free' check (tier in ('free', 'pro', 'enterprise')),
  stripe_customer_id text unique, -- Stripe customer ID for payments
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: Users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- 2. GENERATIONS TABLE (images and videos)
-- =============================================
create table public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('image_enhance', 'video_generate')),
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  
  -- Input data
  original_image_url text,
  prompt text,
  settings jsonb default '{}'::jsonb,
  
  -- Output data
  result_url text,
  
  -- Replicate tracking
  replicate_prediction_id text,
  
  -- Metadata
  credits_used integer default 0,
  error_message text,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

-- Enable Row Level Security
alter table public.generations enable row level security;

-- Policies: Users can only see their own generations
create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own generations"
  on public.generations for update
  using (auth.uid() = user_id);

-- Index for faster queries
create index generations_user_id_idx on public.generations(user_id);
create index generations_status_idx on public.generations(status);

-- =============================================
-- 3. TRANSACTIONS TABLE (credit purchases)
-- =============================================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_payment_intent_id text unique,
  stripe_checkout_session_id text,
  amount_cents integer not null,
  credits_purchased integer not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.transactions enable row level security;

-- Policies: Users can only see their own transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- Index for faster queries
create index transactions_user_id_idx on public.transactions(user_id);

-- =============================================
-- 4. HELPER FUNCTION: Deduct credits
-- =============================================
create or replace function public.deduct_credits(user_uuid uuid, amount integer)
returns boolean as $$
declare
  current_credits integer;
begin
  select credits into current_credits from public.profiles where id = user_uuid for update;
  
  if current_credits >= amount then
    update public.profiles set credits = credits - amount, updated_at = now() where id = user_uuid;
    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql security definer;

-- =============================================
-- 5. HELPER FUNCTION: Add credits
-- =============================================
create or replace function public.add_credits(user_uuid uuid, amount integer)
returns void as $$
begin
  update public.profiles set credits = credits + amount, updated_at = now() where id = user_uuid;
end;
$$ language plpgsql security definer;

