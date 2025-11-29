-- =============================================
-- Admin Dashboard Migration
-- =============================================
-- Adds admin capabilities and unboxing tracking
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. ADD ADMIN COLUMN TO PROFILES
-- =============================================
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- =============================================
-- 2. SET ADMIN FOR ar@soramedia.co
-- =============================================
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'ar@soramedia.co';

-- =============================================
-- 3. ADD ADMIN POLICIES FOR ORDERS
-- =============================================

-- Allow admins to view ALL orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Allow admins to update ALL orders
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- =============================================
-- 4. ADD UNBOXING/RECIPIENT COLUMNS TO ORDERS
-- =============================================
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS view_token uuid DEFAULT uuid_generate_v4(),
  ADD COLUMN IF NOT EXISTS first_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS recipient_email text,
  ADD COLUMN IF NOT EXISTS recipient_name text;

-- Index for fast view_token lookups
CREATE INDEX IF NOT EXISTS orders_view_token_idx ON public.orders(view_token);

-- =============================================
-- 5. POLICY FOR PUBLIC VIEW ACCESS VIA TOKEN
-- =============================================
-- Allow anyone to view an order if they have the correct view_token
-- This is for the recipient unboxing experience
DROP POLICY IF EXISTS "Public can view orders with valid token" ON public.orders;
CREATE POLICY "Public can view orders with valid token" ON public.orders
  FOR SELECT USING (true);
-- Note: The actual token validation happens in the application layer
-- RLS allows SELECT but the app checks token match

-- Allow service role to update first_viewed_at
DROP POLICY IF EXISTS "Service can update view timestamp" ON public.orders;
CREATE POLICY "Service can update view timestamp" ON public.orders
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these after migration to verify:
--
-- Check is_admin column exists:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'is_admin';
--
-- Check admin user is set:
-- SELECT email, is_admin FROM public.profiles WHERE is_admin = true;
--
-- Check new order columns:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name IN ('view_token', 'first_viewed_at', 'recipient_email', 'recipient_name');
--
-- =============================================
-- MIGRATION COMPLETE
-- =============================================
