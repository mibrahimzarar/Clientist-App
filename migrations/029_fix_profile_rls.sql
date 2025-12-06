-- Fix RLS on profiles to ensure users can see their own admin status
-- Usually authenticated users can see their own profile, but let's be explicit

-- Drop existing policy if needed (names might vary, so this is a best guess or we just add a new one)
-- DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Ensure policy exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" 
        ON profiles FOR SELECT 
        USING ( auth.uid() = id );
    END IF;
END $$;

-- Also allow updates to is_admin? No, only manual SQL should update is_admin usually.
-- But users should be able to read it.
