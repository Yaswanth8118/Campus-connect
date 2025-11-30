/*
  # Create Profiles Table with Auth Integration

  ## Overview
  This migration sets up the user profiles system that syncs with Supabase Auth.

  ## 1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users(id)
      - `email` (text, unique, required) - User's email address
      - `name` (text) - User's full name
      - `role` (text) - User role: admin, coordinator, faculty, or candidate
      - `profile_image` (text) - URL to profile image
      - `phone` (text) - Phone number
      - `department` (text) - Department name
      - `is_verified` (boolean, default true) - Email verification status
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
    - Enable RLS on `profiles` table
    - Policy: Users can read their own profile
    - Policy: Users can update their own profile
    - Policy: Authenticated users can view other users' basic info

  ## 3. Triggers
    - Automatic profile creation when a new user signs up via auth.users
    - Automatic timestamp updates on profile changes

  ## 4. Important Notes
    - Profile IDs match auth.users IDs for seamless integration
    - RLS policies ensure users can only modify their own data
    - Trigger handles automatic profile creation on signup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'candidate' CHECK (role IN ('admin', 'coordinator', 'faculty', 'candidate')),
  profile_image text,
  phone text,
  department text,
  is_verified boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Authenticated users can view basic info of other users
CREATE POLICY "Authenticated users can view other profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, is_verified, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'candidate'),
    true,
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);