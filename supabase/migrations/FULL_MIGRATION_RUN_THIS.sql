-- =============================================
-- FULL MIGRATION SCRIPT FOR GIFTINGMOMENTS/RELIVE.AI
-- =============================================
-- Run this entire script in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (for user data)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. ORDERS TABLE (for service purchases)
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending_interview' 
    CHECK (status IN ('pending', 'pending_interview', 'interview_in_progress', 'in_production', 'ready', 'delivered', 'cancelled')),
  tier text NOT NULL DEFAULT 'standard'
    CHECK (tier IN ('standard', 'premium', 'biography')),
  quiz_data jsonb DEFAULT '{}'::jsonb,
  interview_data jsonb DEFAULT '{}'::jsonb,
  final_video_url text,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text,
  amount_paid integer,
  currency text DEFAULT 'usd',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_stripe_session_idx ON public.orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

-- Orders policies

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own orders (for interview data)
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks and API routes)
DROP POLICY IF EXISTS "Service role full access" ON public.orders;
CREATE POLICY "Service role full access" ON public.orders
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Allow authenticated users to claim unclaimed orders
DROP POLICY IF EXISTS "Users can claim unclaimed orders" ON public.orders;
CREATE POLICY "Users can claim unclaimed orders" ON public.orders
  FOR UPDATE USING (
    user_id IS NULL 
    AND auth.uid() IS NOT NULL
  );

-- Allow inserts for order creation (service role via webhooks)
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
CREATE POLICY "Allow order creation" ON public.orders
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 3. PENDING_CHECKOUTS TABLE (for cross-device auth)
-- =============================================
CREATE TABLE IF NOT EXISTS public.pending_checkouts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  stripe_session_id text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours') NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS pending_checkouts_session_idx ON public.pending_checkouts(stripe_session_id);

-- Enable RLS
ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS "Service role access pending_checkouts" ON public.pending_checkouts;
CREATE POLICY "Service role access pending_checkouts" ON public.pending_checkouts
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Allow authenticated users to read their own pending checkout
DROP POLICY IF EXISTS "Users can read own pending checkout" ON public.pending_checkouts;
CREATE POLICY "Users can read own pending checkout" ON public.pending_checkouts
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- =============================================
-- 4. GRANT PERMISSIONS
-- =============================================

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT ON public.pending_checkouts TO authenticated;
GRANT ALL ON public.pending_checkouts TO service_role;

-- =============================================
-- 5. VERIFICATION QUERIES (check results)
-- =============================================

-- After running, verify tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- =============================================
-- MIGRATION COMPLETE!
-- =============================================
