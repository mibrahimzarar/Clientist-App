-- Migration 034: Populate missing full_name from email
-- Since users sign up without metadata, full_name is likely null.
-- We will use the part of the email before @ as the default full_name.

UPDATE profiles
SET full_name = split_part(email, '@', 1)
WHERE full_name IS NULL OR full_name = '';

-- Also ensure avatar_url is null if empty so the UI uses the fallback
UPDATE profiles
SET avatar_url = NULL
WHERE avatar_url = '';

-- Update the handle_new_user trigger to also do this for future users if they have no metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_name text;
BEGIN
  -- Extract name from email as fallback
  extracted_name := COALESCE(
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  INSERT INTO public.profiles (id, full_name, avatar_url, email, role, status, created_at)
  VALUES (
    new.id,
    extracted_name,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    'active',
    new.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name, extracted_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
