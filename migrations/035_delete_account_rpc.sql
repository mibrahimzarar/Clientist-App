-- Migration 035: Delete User Account RPC
-- Provides a secure way for a user to delete their own account.

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Prevent deletion if no user is logged in
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Optional: Prevent admins from deleting themselves via this RPC if you want extra safety
  -- IF EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id AND (role = 'admin' OR email ILIKE '%admin%')) THEN
  --   RAISE EXCEPTION 'Admins cannot delete their account via app';
  -- END IF;

  -- Delete from auth.users
  -- This will cascade to profiles and other tables due to Foreign Key constraints (ON DELETE CASCADE)
  -- assuming they are set up correctly.
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;
