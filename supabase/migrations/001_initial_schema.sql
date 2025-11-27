-- Relive.ai Database Schema

create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  credits integer default 10 not null,
  tier text default 'free' check (tier in ('free', 'pro', 'enterprise')),
  stripe_customer_id text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

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

-- GENERATIONS TABLE
create table public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('image_enhance', 'video_generate')),
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  original_image_url text,
  prompt text,
  settings jsonb default '{}'::jsonb,
  result_url text,
  replicate_prediction_id text,
  credits_used integer default 0,
  error_message text,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table public.generations enable row level security;

create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own generations"
  on public.generations for update
  using (auth.uid() = user_id);

create index generations_user_id_idx on public.generations(user_id);
create index generations_status_idx on public.generations(status);

-- TRANSACTIONS TABLE
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

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create index transactions_user_id_idx on public.transactions(user_id);

-- HELPER FUNCTIONS
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

create or replace function public.add_credits(user_uuid uuid, amount integer)
returns void as $$
begin
  update public.profiles set credits = credits + amount, updated_at = now() where id = user_uuid;
end;
$$ language plpgsql security definer;
