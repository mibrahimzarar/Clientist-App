-- Migration 032: Fix profiles schema and sync with auth.users
-- This ensures 'profiles' has all columns needed for Admin Dashboard and is populated.

-- 1. Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
        ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at') THEN
        ALTER TABLE profiles ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Ensure created_at exists (it was in 004, but just to be safe if this runs on raw table)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- 2. Update the handle_new_user function to include email and metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, role, status, created_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    'active',
    new.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill/Sync existing users from auth.users to public.profiles
-- This inserts missing profiles and updates existing ones with email if missing
INSERT INTO public.profiles (id, email, created_at, role, status, last_sign_in_at)
SELECT 
    id, 
    email, 
    created_at, 
    COALESCE(raw_user_meta_data->>'role', 'user'), 
    'active',
    last_sign_in_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    last_sign_in_at = EXCLUDED.last_sign_in_at;

-- 4. Re-create the get_admin_dashboard_summary to be strictly correct now that columns exist
CREATE OR REPLACE FUNCTION get_admin_dashboard_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users_count integer;
  active_users_count integer;
  total_revenue_amount numeric;
  new_users_today_count integer;
BEGIN
  -- Count total users
  SELECT count(*) INTO total_users_count FROM profiles;

  -- Count active users
  SELECT count(*) INTO active_users_count FROM profiles WHERE status = 'active';

  -- Count new users today
  SELECT count(*) INTO new_users_today_count FROM profiles WHERE created_at >= current_date::timestamp;

  -- Calculate revenue (safe placeholder)
  BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue_amount FROM payments;
  EXCEPTION WHEN undefined_table THEN
    total_revenue_amount := 0;
  END;

  RETURN json_build_object(
    'total_users', total_users_count,
    'active_users', active_users_count,
    'total_revenue', total_revenue_amount,
    'new_users_today', new_users_today_count
  );
END;
$$;
