-- =============================================
-- VIDEO STORAGE SETUP
-- =============================================
-- Creates Supabase Storage bucket for gift videos
-- Run this in Supabase SQL Editor
-- =============================================

-- Create storage bucket for gift videos (500MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gift-videos', 
  'gift-videos', 
  true, 
  524288000,
  ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Allow admins to upload videos
DROP POLICY IF EXISTS "Admins can upload videos" ON storage.objects;
CREATE POLICY "Admins can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gift-videos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to update/replace videos
DROP POLICY IF EXISTS "Admins can update videos" ON storage.objects;
CREATE POLICY "Admins can update videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gift-videos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to delete videos
DROP POLICY IF EXISTS "Admins can delete videos" ON storage.objects;
CREATE POLICY "Admins can delete videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gift-videos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow public read access for gift recipients
DROP POLICY IF EXISTS "Public can view gift videos" ON storage.objects;
CREATE POLICY "Public can view gift videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'gift-videos');

-- =============================================
-- VERIFICATION
-- =============================================
-- After running, verify bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'gift-videos';
--
-- Verify policies:
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
-- =============================================
