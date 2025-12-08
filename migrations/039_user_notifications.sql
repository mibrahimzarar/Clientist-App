-- Migration to create user_notifications table for individual user notifications
-- This allows admin broadcasts to be delivered to users as in-app notifications

CREATE TABLE IF NOT EXISTS user_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'announcement', -- 'announcement', 'alert', 'reminder', etc.
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    read_at timestamptz
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- Row Level Security
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
ON user_notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON user_notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only admins or system can insert notifications
-- For now, allow authenticated (admin check should be in application layer)
CREATE POLICY "Allow insert for authenticated users"
ON user_notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON user_notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_notifications TO authenticated;
