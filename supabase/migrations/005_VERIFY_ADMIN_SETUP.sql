-- =============================================
-- VERIFICATION SCRIPT FOR ADMIN DASHBOARD SETUP
-- =============================================
-- Run this in Supabase SQL Editor to verify
-- the admin dashboard migration was successful
-- =============================================

-- 1. CHECK: is_admin column exists in profiles
SELECT 
  '1. is_admin column' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'is_admin'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- 2. CHECK: ar@soramedia.co is set as admin
SELECT 
  '2. Admin user (ar@soramedia.co)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE email = 'ar@soramedia.co' 
      AND is_admin = true
    ) THEN '✅ CONFIGURED' 
    ELSE '❌ NOT SET (user may not exist yet or is_admin is false)' 
  END as status;

-- 3. CHECK: New order columns exist
SELECT 
  '3. view_token column' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'view_token'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
UNION ALL
SELECT 
  '4. first_viewed_at column' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'first_viewed_at'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
UNION ALL
SELECT 
  '5. recipient_email column' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'recipient_email'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
UNION ALL
SELECT 
  '6. recipient_name column' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'recipient_name'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- 4. CHECK: Admin RLS policies exist
SELECT 
  '7. Admin SELECT policy on orders' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'orders' 
      AND policyname = 'Admins can view all orders'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
UNION ALL
SELECT 
  '8. Admin UPDATE policy on orders' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'orders' 
      AND policyname = 'Admins can update all orders'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- 5. CHECK: view_token index exists
SELECT 
  '9. view_token index' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'orders' 
      AND indexname = 'orders_view_token_idx'
    ) THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- =============================================
-- SUMMARY: Show all admin users
-- =============================================
SELECT 
  '--- ADMIN USERS ---' as info,
  '' as email,
  '' as full_name,
  '' as is_admin
UNION ALL
SELECT 
  '' as info,
  email,
  COALESCE(full_name, '(no name)') as full_name,
  CASE WHEN is_admin THEN 'YES' ELSE 'NO' END as is_admin
FROM public.profiles
WHERE is_admin = true;

-- =============================================
-- SUMMARY: Show all RLS policies on orders table
-- =============================================
SELECT 
  policyname as policy_name,
  cmd as operation,
  CASE WHEN permissive = 'PERMISSIVE' THEN 'Allow' ELSE 'Deny' END as type
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'orders'
ORDER BY policyname;

-- =============================================
-- VERIFICATION COMPLETE
-- =============================================
-- All checks should show ✅
-- If any show ❌, re-run the migration script
-- =============================================
