-- Add indexes for better performance on freelancer_tasks
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_project_id ON freelancer_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_status ON freelancer_tasks(status);
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_due_date ON freelancer_tasks(due_date);

-- Ensure RLS is enabled (redundant if 015 was run, but good for safety)
ALTER TABLE freelancer_tasks ENABLE ROW LEVEL SECURITY;

-- Policy to allow all access for authenticated users (if not already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'freelancer_tasks' 
        AND policyname = 'Enable all access for authenticated users'
    ) THEN
        CREATE POLICY "Enable all access for authenticated users" ON freelancer_tasks
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;
