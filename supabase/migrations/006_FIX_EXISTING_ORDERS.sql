-- =============================================
-- FIX EXISTING ORDERS & DIAGNOSE ISSUES
-- =============================================
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. DIAGNOSE: How many orders exist?
SELECT 
  'Total orders in database' as info,
  COUNT(*) as count
FROM public.orders;

-- 2. DIAGNOSE: Orders by status
SELECT 
  status,
  COUNT(*) as count
FROM public.orders
GROUP BY status
ORDER BY count DESC;

-- 3. DIAGNOSE: Orders by tier
SELECT 
  tier,
  COUNT(*) as count
FROM public.orders
GROUP BY tier
ORDER BY count DESC;

-- 4. DIAGNOSE: Check if view_token is populated
SELECT 
  'Orders missing view_token' as info,
  COUNT(*) as count
FROM public.orders
WHERE view_token IS NULL;

-- 5. FIX: Populate view_token for existing orders that don't have one
UPDATE public.orders
SET view_token = uuid_generate_v4()
WHERE view_token IS NULL;

-- 6. DIAGNOSE: Check orders with their user info
SELECT 
  o.id,
  o.tier,
  o.status,
  o.created_at,
  o.user_id,
  p.email as user_email,
  p.full_name as user_name,
  o.view_token,
  o.amount_paid
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 20;

-- 7. DIAGNOSE: Check if there are orders with NULL user_id
SELECT 
  'Orders with NULL user_id' as info,
  COUNT(*) as count
FROM public.orders
WHERE user_id IS NULL;

-- 8. VERIFY: Check admin can see orders (test the policy)
-- This simulates what the admin sees
SELECT 
  'Orders visible to admin' as info,
  COUNT(*) as count
FROM public.orders;

-- =============================================
-- RESULTS EXPLANATION:
-- =============================================
-- If orders exist but admin can't see them, run this:
-- 
-- DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
-- CREATE POLICY "Admins can view all orders" ON public.orders
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE profiles.id = auth.uid() 
--       AND profiles.is_admin = true
--     )
--   );
-- =============================================
