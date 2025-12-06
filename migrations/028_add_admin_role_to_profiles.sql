-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Example: Set a specific user as admin (Replace 'user@example.com' with the actual email)
-- UPDATE profiles 
-- SET is_admin = TRUE 
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'user@example.com'
-- );
