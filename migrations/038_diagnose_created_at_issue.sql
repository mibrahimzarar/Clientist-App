-- Migration to investigate and display user creation dates
-- This helps diagnose why all users might show the same created_at timestamp

-- First, let's check if users actually have different created_at times
SELECT 
    id,
    email,
    company_name,
    created_at,
    updated_at,
    DATE(created_at) as creation_date,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as formatted_created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- Check for users with identical timestamps (potential issue)
SELECT 
    created_at,
    COUNT(*) as user_count,
    STRING_AGG(email, ', ') as users
FROM profiles
GROUP BY created_at
HAVING COUNT(*) > 1
ORDER BY user_count DESC;

-- If all users have the same created_at, it means there was a migration issue
-- We can't retroactively fix this without knowing the actual signup dates
-- However, we can check auth.users table which might have the original data

SELECT 
    p.email,
    p.created_at as profile_created_at,
    au.created_at as auth_created_at,
    au.created_at != p.created_at as dates_mismatch
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY au.created_at DESC
LIMIT 20;

-- If auth.users has correct dates, we can fix profiles table:
-- ONLY RUN THIS IF THE ABOVE QUERY CONFIRMS auth.users HAS CORRECT DATES
/*
UPDATE profiles p
SET created_at = au.created_at
FROM auth.users au
WHERE p.id = au.id
  AND p.created_at != au.created_at;
*/
