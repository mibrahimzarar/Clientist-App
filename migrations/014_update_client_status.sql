-- Migration 014: Update client status enum
-- Change client status to: pending, in_progress, rejected, completed

-- IMPORTANT: This migration must be run in separate steps in Supabase SQL Editor
-- Because new enum values must be committed before use

-- ============================================================
-- STEP 1: Run this FIRST (copy and run, then wait a moment)
-- ============================================================
ALTER TYPE client_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE client_status ADD VALUE IF NOT EXISTS 'in_progress';

-- ============================================================
-- STEP 2: Run this SECOND (after step 1 completes)
-- ============================================================
-- Update existing data to use new statuses
UPDATE clients SET status = 'pending' WHERE status = 'new';
UPDATE clients SET status = 'in_progress' WHERE status IN ('in_process', 'documents_pending', 'submitted', 'approved');

-- ============================================================
-- STEP 3: Run this THIRD (after step 2 completes)
-- ============================================================

-- Create a new enum type with only the values we want
CREATE TYPE client_status_new AS ENUM ('pending', 'in_progress', 'rejected', 'completed');

-- Drop views that depend on the client_status enum
DROP VIEW IF EXISTS client_analytics CASCADE;
DROP VIEW IF EXISTS todays_follow_ups CASCADE;
DROP VIEW IF EXISTS upcoming_follow_ups CASCADE;
DROP VIEW IF EXISTS pending_tasks_view CASCADE;
DROP VIEW IF EXISTS upcoming_travels_view CASCADE;

-- Alter the column to use the new type
ALTER TABLE clients 
ALTER COLUMN status TYPE client_status_new 
USING (
    CASE status::text
        WHEN 'new' THEN 'pending'::client_status_new
        WHEN 'in_process' THEN 'in_progress'::client_status_new
        WHEN 'documents_pending' THEN 'in_progress'::client_status_new
        WHEN 'submitted' THEN 'in_progress'::client_status_new
        WHEN 'approved' THEN 'in_progress'::client_status_new
        WHEN 'rejected' THEN 'rejected'::client_status_new
        WHEN 'completed' THEN 'completed'::client_status_new
        WHEN 'pending' THEN 'pending'::client_status_new
        WHEN 'in_progress' THEN 'in_progress'::client_status_new
        ELSE 'pending'::client_status_new
    END
);

-- Drop old enum and rename new one
DROP TYPE client_status;
ALTER TYPE client_status_new RENAME TO client_status;

-- Recreate the client_analytics view
CREATE OR REPLACE VIEW client_analytics AS
SELECT 
    status,
    package_type,
    priority_tag,
    lead_source,
    COUNT(*) as client_count,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_clients,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_clients
FROM clients
WHERE created_by IS NOT NULL
GROUP BY status, package_type, priority_tag, lead_source;

-- Recreate other views

-- Todays follow-ups view (for leads)
CREATE OR REPLACE VIEW todays_follow_ups AS
SELECT 
    l.*
FROM leads l
WHERE l.follow_up_date = CURRENT_DATE
    AND l.lead_status NOT IN ('converted', 'not_interested')
ORDER BY l.priority_tag DESC, l.created_at DESC;

-- Upcoming follow-ups view (for leads)
CREATE OR REPLACE VIEW upcoming_follow_ups AS
SELECT 
    l.*
FROM leads l
WHERE l.follow_up_date > CURRENT_DATE
    AND l.follow_up_date <= CURRENT_DATE + INTERVAL '30 days'
    AND l.lead_status NOT IN ('converted', 'not_interested')
ORDER BY l.follow_up_date ASC, l.priority_tag DESC;

-- Pending tasks view
CREATE OR REPLACE VIEW pending_tasks_view AS
SELECT 
    ct.*,
    c.full_name,
    c.phone_number,
    c.email
FROM client_tasks ct
JOIN clients c ON ct.client_id = c.id
WHERE ct.status = 'pending'
    AND ct.due_date IS NOT NULL
ORDER BY ct.due_date ASC;

-- Upcoming travels view
CREATE OR REPLACE VIEW upcoming_travels_view AS
SELECT 
    t.*,
    c.full_name,
    c.phone_number,
    c.email,
    c.status as client_status
FROM travels t
JOIN clients c ON t.client_id = c.id
WHERE t.departure_date >= CURRENT_DATE
    AND t.departure_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY t.departure_date ASC;

-- Update default value for new clients
ALTER TABLE clients 
ALTER COLUMN status SET DEFAULT 'pending'::client_status;

-- Add comment
COMMENT ON TYPE client_status IS 'Client status: pending (new/initial), in_progress (being processed), rejected (not approved), completed (finished)';
