-- =============================================
-- AUTO-CREATE PROFILE TRIGGER
-- =============================================
-- This ensures a profile is created whenever a new user is created in auth.users
-- Critical because orders.user_id has FK constraint to profiles.id
-- =============================================

-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- BACKFILL: Create profiles for existing users without one
-- =============================================
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================
-- Check the trigger exists:
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_auth_user_created';

-- Check profiles were created:
-- SELECT COUNT(*) FROM public.profiles;
-- SELECT COUNT(*) FROM auth.users;
