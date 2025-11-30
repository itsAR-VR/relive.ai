-- =============================================
-- VERIFY SUPPORT TICKETS SETUP
-- =============================================
-- Run this in Supabase SQL Editor to verify the migration worked
-- Each query should return results confirming the setup
-- =============================================

-- 1. Check support_tickets table exists with correct columns
SELECT 
  '1. TABLE STRUCTURE' as check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'support_tickets'
ORDER BY ordinal_position;

-- 2. Check RLS is enabled
SELECT 
  '2. RLS ENABLED' as check_name,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'support_tickets';

-- 3. Check policies exist
SELECT 
  '3. RLS POLICIES' as check_name,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'support_tickets';

-- 4. Check indexes exist
SELECT 
  '4. INDEXES' as check_name,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'support_tickets';

-- 5. Check the status CHECK constraint
SELECT 
  '5. CHECK CONSTRAINTS' as check_name,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.support_tickets'::regclass
  AND contype = 'c';

-- 6. Check foreign key constraints
SELECT 
  '6. FOREIGN KEYS' as check_name,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.support_tickets'::regclass
  AND contype = 'f';

-- 7. Verify grants are in place (check if anon/authenticated can select/insert)
SELECT 
  '7. TABLE GRANTS' as check_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'support_tickets'
  AND grantee IN ('anon', 'authenticated', 'service_role');

-- 8. Test insert (will rollback - just a syntax check)
-- Uncomment to test, then rollback
/*
BEGIN;
INSERT INTO public.support_tickets (name, email, subject, message)
VALUES ('Test User', 'test@example.com', 'General Inquiry', 'This is a test message');
SELECT * FROM public.support_tickets WHERE email = 'test@example.com';
ROLLBACK;
*/

-- 9. Verify existing tables still work (orders table check)
SELECT 
  '9. ORDERS TABLE OK' as check_name,
  COUNT(*) as order_count
FROM public.orders;

-- 10. Verify profiles table still works
SELECT 
  '10. PROFILES TABLE OK' as check_name,
  COUNT(*) as profile_count
FROM public.profiles;

-- =============================================
-- EXPECTED RESULTS:
-- =============================================
-- 1. Should show: id, user_id, name, email, subject, message, status, order_id, created_at, updated_at
-- 2. Should show: rls_enabled = true
-- 3. Should show 3 policies: "Users can view own tickets", "Anyone can create tickets", "Service role full access"
-- 4. Should show 4 indexes: email, status, user_id, created_at
-- 5. Should show status CHECK constraint with: open, in_progress, resolved, closed
-- 6. Should show 2 foreign keys: user_id -> auth.users, order_id -> orders
-- 7. Should show SELECT, INSERT for anon/authenticated; ALL for service_role
-- 9 & 10. Should return counts without errors (confirms other tables not broken)
-- =============================================
