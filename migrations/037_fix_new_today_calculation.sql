-- Migration to fix "New Today" calculation for admin dashboard
-- This ensures only users created on today's date (in UTC) are counted

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
  today_start timestamp with time zone;
  today_end timestamp with time zone;
BEGIN
  -- Set today's date boundaries in UTC
  today_start := date_trunc('day', now() AT TIME ZONE 'UTC');
  today_end := today_start + interval '1 day';

  -- Count total users
  SELECT count(*) INTO total_users_count
  FROM profiles;

  -- Count active users
  BEGIN
    SELECT count(*) INTO active_users_count
    FROM profiles
    WHERE status = 'active';
  EXCEPTION WHEN undefined_column THEN
    active_users_count := total_users_count;
  END;

  -- Count new users created today (UTC timezone)
  SELECT count(*) INTO new_users_today_count
  FROM profiles
  WHERE created_at >= today_start 
    AND created_at < today_end;

  -- Placeholder for revenue
  BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue_amount
    FROM payments;
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_admin_dashboard_summary() TO authenticated;
