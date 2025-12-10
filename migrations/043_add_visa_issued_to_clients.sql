-- Add is_visa_issued column to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_visa_issued BOOLEAN DEFAULT FALSE;
