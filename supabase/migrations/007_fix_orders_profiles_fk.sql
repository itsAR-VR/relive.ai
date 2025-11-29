-- =============================================
-- FIX: Add Foreign Key from orders to profiles
-- =============================================
-- This enables the Supabase join syntax: profiles(email, full_name)
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop the existing FK to auth.users (if it exists)
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Add new FK to profiles table
-- This allows the admin dashboard query to join orders with profiles
ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- =============================================
-- VERIFICATION
-- =============================================
-- After running, verify the FK exists:
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'orders'
  AND kcu.column_name = 'user_id';

-- =============================================
-- TEST: Verify join works
-- =============================================
SELECT 
  o.id,
  o.tier,
  o.status,
  p.email,
  p.full_name
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
LIMIT 5;
