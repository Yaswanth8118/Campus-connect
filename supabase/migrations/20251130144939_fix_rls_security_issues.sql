/*
  # Fix RLS Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance issues identified in the profiles table RLS policies.

  ## 1. Performance Optimizations
    - Wrap auth.uid() calls in SELECT to prevent re-evaluation per row
    - This significantly improves query performance at scale

  ## 2. Policy Consolidation
    - Remove duplicate SELECT policies
    - Consolidate into a single permissive policy for SELECT operations
    - Maintains security while simplifying policy management

  ## 3. Index Cleanup
    - Remove unused indexes (profiles_email_idx, profiles_role_idx)
    - Email is already unique and has implicit index
    - Role filtering not currently used at scale

  ## 4. Function Security
    - Fix search_path mutability in trigger functions
    - Set explicit search_path to prevent security vulnerabilities
    - Use SECURITY DEFINER with proper schema qualification

  ## Changes Applied
    - Drop and recreate all RLS policies with optimized auth.uid() calls
    - Drop unused indexes
    - Recreate trigger functions with fixed search_path
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view other profiles" ON profiles;

-- Create optimized RLS policies with SELECT wrapper for auth.uid()
-- This prevents re-evaluation per row and improves performance

-- Policy: Authenticated users can view all profiles (consolidated SELECT policy)
CREATE POLICY "Authenticated users can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Drop unused indexes
DROP INDEX IF EXISTS profiles_email_idx;
DROP INDEX IF EXISTS profiles_role_idx;

-- Recreate trigger functions with fixed search_path
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Create function to handle profile creation on signup with fixed search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, is_verified, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate'),
    true,
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- Create function to handle updated_at timestamp with fixed search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add helpful comment
COMMENT ON POLICY "Authenticated users can view profiles" ON profiles IS 
  'Allows all authenticated users to view profile information. Optimized with SELECT wrapper for auth functions.';