-- Migration to add CASCADE delete for user notifications when announcements are deleted
-- This ensures that when an admin deletes an announcement, all related user notifications are also removed

-- First, let's add a foreign key relationship from user_notifications to app_announcements if it doesn't exist
-- We'll add an announcement_id column to track which announcement created each notification

-- Add announcement_id column if it doesn't exist
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS announcement_id uuid REFERENCES app_announcements(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_announcement_id 
ON user_notifications(announcement_id);

-- Update RLS policy to allow deletion when announcement is deleted
-- This is handled automatically by CASCADE, but we document it here for clarity

COMMENT ON COLUMN user_notifications.announcement_id IS 'References the announcement that created this notification. NULL for system-generated notifications.';
