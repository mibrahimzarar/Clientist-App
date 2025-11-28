-- Migration: Update freelancer_leads table
-- Description: Add created_by column and RLS policies to freelancer_leads

-- Add created_by column if it doesn't exist
alter table freelancer_leads 
add column if not exists created_by uuid references auth.users(id) on delete cascade;

-- Rename phone to phone_number for consistency
alter table freelancer_leads 
rename column phone to phone_number;

-- Update next_follow_up to be DATE instead of TIMESTAMPTZ
alter table freelancer_leads 
alter column next_follow_up type date;

-- Create index for created_by for faster queries
create index if not exists idx_freelancer_leads_created_by on freelancer_leads(created_by);

-- Create index for status for filtering
create index if not exists idx_freelancer_leads_status on freelancer_leads(status);

-- Enable Row Level Security (if not already enabled)
alter table freelancer_leads enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own leads" on freelancer_leads;
drop policy if exists "Users can insert their own leads" on freelancer_leads;
drop policy if exists "Users can update their own leads" on freelancer_leads;
drop policy if exists "Users can delete their own leads" on freelancer_leads;

-- Create policies for users to access only their own leads
create policy "Users can view their own leads"
    on freelancer_leads for select
    using (auth.uid() = created_by);

create policy "Users can insert their own leads"
    on freelancer_leads for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own leads"
    on freelancer_leads for update
    using (auth.uid() = created_by);

create policy "Users can delete their own leads"
    on freelancer_leads for delete
    using (auth.uid() = created_by);
