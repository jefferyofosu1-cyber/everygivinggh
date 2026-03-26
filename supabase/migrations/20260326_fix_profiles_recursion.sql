-- ============================================================================
-- FIX: INFINITE RECURSION IN PROFILES RLS POLICIES
-- Date: 2026-03-26
-- ============================================================================

-- 1. Create a security definer function to check admin status
-- This breaks the recursion because the SELECT inside the function
-- bypasses the RLS on the profiles table (it runs as the db owner).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing recursive policies (comprehensive list from screenshot)
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Owner can view own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Owner can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owner can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;

-- Already handled in previous run but good to keep
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- 4. Create safe, non-recursive policies

-- Any authenticated or anonymous user can view profiles
-- Needed for the campaign details page to show fundraiser info
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can do anything utilizing the non-recursive function
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.is_admin());

-- 5. Update other tables that were recursive (optional but safer)
-- Many policies in 20240318_all_tables.sql use: 
-- (exists (select 1 from profiles where id = auth.uid() and is_admin = true))
-- These are now technically safe if profiles SELECT policy is true, 
-- but it's cleaner to use the function.

DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage support tickets" ON public.support_tickets
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can read audit logs" ON public.admin_audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage roles" ON public.admin_roles;
CREATE POLICY "Admins can manage roles" ON public.admin_roles
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (public.is_admin());
