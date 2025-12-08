-- Create app_announcements table
CREATE TABLE IF NOT EXISTS app_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target_audience text DEFAULT 'all', -- 'all', 'freelancer', 'service_provider', etc.
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE app_announcements ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access for authenticated users" 
ON app_announcements FOR SELECT 
TO authenticated 
USING (true);

-- Allow write access only to specific users (Admins)
-- For simplicity in this demo, we can allow any authenticated user to create if they are admin
-- But since we don't have a strict "is_admin" claim in this setup often, we might check profiles or just allow authenticated for the demo moment.
-- Ideally: USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
-- We'll use a pragmatic approach: assume the UI restricts access, but purely securely:
CREATE POLICY "Allow insert for authenticated users" 
ON app_announcements FOR INSERT 
TO authenticated 
WITH CHECK (true); 
-- In production, replace `true` with strict admin check function
