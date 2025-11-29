-- =============================================
-- VERIFICATION SCRIPT FOR GIFTINGMOMENTS/RELIVE.AI
-- =============================================
-- Run this in Supabase SQL Editor to verify your setup
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =============================================

-- 1. CHECK TABLES EXIST
SELECT 
  '✓ Tables Check' as check_type,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'orders', 'pending_checkouts')
ORDER BY table_name;

-- 2. CHECK RLS IS ENABLED
SELECT 
  '✓ RLS Check' as check_type,
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'orders', 'pending_checkouts');

-- 3. CHECK STORAGE BUCKET EXISTS
SELECT 
  '✓ Storage Bucket Check' as check_type,
  id as bucket_name,
  CASE WHEN public THEN '✅ PUBLIC' ELSE '⚠️ PRIVATE' END as visibility,
  created_at
FROM storage.buckets 
WHERE id = 'order-assets';

-- 4. CHECK STORAGE POLICIES
SELECT 
  '✓ Storage Policies Check' as check_type,
  policyname as policy_name,
  permissive,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- 5. CHECK TABLE POLICIES
SELECT 
  '✓ Table Policies Check' as check_type,
  tablename,
  policyname as policy_name,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. CHECK ORDERS TABLE COLUMNS
SELECT 
  '✓ Orders Table Schema' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'orders'
ORDER BY ordinal_position;

-- 7. CHECK PROFILES TABLE COLUMNS
SELECT 
  '✓ Profiles Table Schema' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =============================================
-- QUICK SUMMARY (Run separately if needed)
-- =============================================
-- SELECT 
--   (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'orders', 'pending_checkouts')) as tables_count,
--   (SELECT COUNT(*) FROM storage.buckets WHERE id = 'order-assets') as bucket_exists,
--   (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') as storage_policies_count,
--   (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as table_policies_count;
