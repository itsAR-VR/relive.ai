-- Newsletter signups (marketing footer)
create table if not exists public.newsletter_signups (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  source text,
  created_at timestamptz default now() not null
);

alter table public.newsletter_signups enable row level security;

