-- Fix for client_earnings table
-- This migration adds the missing user_id column and enables RLS

-- Step 1: Add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_earnings' AND column_name = 'user_id'
    ) THEN
        -- Add the column
        ALTER TABLE client_earnings ADD COLUMN user_id UUID;
        
        -- Set user_id to the authenticated user for existing records
        -- This assumes you want to set it based on the client's created_by
        UPDATE client_earnings ce
        SET user_id = (
            SELECT c.created_by 
            FROM clients c 
            WHERE c.id = ce.client_id 
            LIMIT 1
        )
        WHERE user_id IS NULL;
        
        -- Make it NOT NULL after populating existing data
        ALTER TABLE client_earnings ALTER COLUMN user_id SET NOT NULL;
        
        -- Add foreign key constraint
        ALTER TABLE client_earnings 
        ADD CONSTRAINT client_earnings_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 2: Create index if not exists
CREATE INDEX IF NOT EXISTS idx_client_earnings_user_id ON client_earnings(user_id);

-- Step 3: Enable RLS if not already enabled
ALTER TABLE client_earnings ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own earnings" ON client_earnings;
DROP POLICY IF EXISTS "Users can insert their own earnings" ON client_earnings;
DROP POLICY IF EXISTS "Users can update their own earnings" ON client_earnings;
DROP POLICY IF EXISTS "Users can delete their own earnings" ON client_earnings;

-- Recreate policies
CREATE POLICY "Users can view their own earnings" ON client_earnings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own earnings" ON client_earnings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own earnings" ON client_earnings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own earnings" ON client_earnings
    FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Add comment
COMMENT ON COLUMN client_earnings.user_id IS 'Reference to the user who owns this earning record';
