-- Migration to remove 'new' and 'scheduled' statuses from sp_jobs
-- All jobs will start as 'in_progress'

-- Step 1: Update existing jobs with 'new' or 'scheduled' status to 'in_progress'
UPDATE sp_jobs 
SET status = 'in_progress' 
WHERE status IN ('new', 'scheduled');

-- Step 2: Drop the old constraint
ALTER TABLE sp_jobs DROP CONSTRAINT IF EXISTS valid_status;

-- Step 3: Add new constraint without 'new' and 'scheduled'
ALTER TABLE sp_jobs 
ADD CONSTRAINT valid_status 
CHECK (status IN ('in_progress', 'completed', 'pending_payment', 'cancelled'));

-- Step 4: Update default status
ALTER TABLE sp_jobs 
ALTER COLUMN status SET DEFAULT 'in_progress';
