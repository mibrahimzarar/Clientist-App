-- Migration 033: Fix RLS to allow Admins (and authenticated users) to view all profiles

-- The previous policy "Users can view their own profile" restricted visibility to own data only.
-- This caused the Admin Users Widget to show empty results or only the current user.
-- We will replace it with a policy allowing authenticated users to read all profiles.

-- 1. Drop existing restrictive policies to avoid conflicts or confusion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles; -- In case it exists

-- 2. Create a new permissive policy for SELECT
CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- 3. (Optional) Ensure the current user (you) is an admin if you want to test specific admin roles later
-- UPDATE profiles SET role = 'admin' WHERE id = auth.uid(); 
-- (Commented out as auth.uid() is not available in migration context directly without a session)
