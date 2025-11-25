-- Create Leads Management System
-- Migration 013: Leads table for potential clients

-- Create lead status enum
CREATE TYPE lead_status AS ENUM (
    'potential',
    'call_later',
    'interested',
    'not_interested',
    'converted'
);

-- Extend lead_source enum (safe way - add new values to existing enum)
DO $$ 
BEGIN
    -- Add new values to existing enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'whatsapp' AND enumtypid = 'lead_source'::regtype) THEN
        ALTER TYPE lead_source ADD VALUE 'whatsapp';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'instagram' AND enumtypid = 'lead_source'::regtype) THEN
        ALTER TYPE lead_source ADD VALUE 'instagram';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'website' AND enumtypid = 'lead_source'::regtype) THEN
        ALTER TYPE lead_source ADD VALUE 'website';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'google' AND enumtypid = 'lead_source'::regtype) THEN
        ALTER TYPE lead_source ADD VALUE 'google';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'other' AND enumtypid = 'lead_source'::regtype) THEN
        ALTER TYPE lead_source ADD VALUE 'other';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- If lead_source type doesn't exist, create it with all values
        CREATE TYPE lead_source AS ENUM (
            'facebook',
            'referral',
            'walk_in',
            'whatsapp',
            'instagram',
            'website',
            'google',
            'other'
        );
END $$;

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    country VARCHAR(100),
    lead_status lead_status DEFAULT 'potential',
    lead_source lead_source NOT NULL,
    follow_up_date DATE,
    notes TEXT,
    tags TEXT[], -- Array of tags
    priority_tag priority_tag DEFAULT 'normal',
    interested_package package_type,
    profile_picture_url TEXT,
    converted_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create lead_notes table for detailed note history
CREATE TABLE IF NOT EXISTS lead_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up_date ON leads(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Users can view their own leads" ON leads FOR SELECT
    USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Users can insert their own leads" ON leads FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own leads" ON leads FOR UPDATE
    USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Users can delete their own leads" ON leads FOR DELETE
    USING (auth.uid() = created_by);

-- Create RLS policies for lead_notes
CREATE POLICY "Users can manage their lead notes" ON lead_notes FOR ALL
    USING (EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_notes.lead_id 
    AND (leads.created_by = auth.uid() OR leads.updated_by = auth.uid())));

-- Create view for today's follow-ups
CREATE OR REPLACE VIEW todays_follow_ups AS
SELECT 
    l.id,
    l.full_name,
    l.phone_number,
    l.email,
    l.lead_status,
    l.lead_source,
    l.follow_up_date,
    l.notes,
    l.tags,
    l.priority_tag,
    l.interested_package,
    l.created_by
FROM leads l
WHERE l.follow_up_date = CURRENT_DATE
AND l.lead_status NOT IN ('converted', 'not_interested')
ORDER BY l.priority_tag DESC, l.created_at ASC;

-- Create view for upcoming follow-ups
CREATE OR REPLACE VIEW upcoming_follow_ups AS
SELECT 
    l.id,
    l.full_name,
    l.phone_number,
    l.email,
    l.lead_status,
    l.lead_source,
    l.follow_up_date,
    l.notes,
    l.tags,
    l.priority_tag,
    l.interested_package,
    l.created_by,
    CASE
        WHEN l.follow_up_date = CURRENT_DATE THEN 'today'
        WHEN l.follow_up_date = CURRENT_DATE + 1 THEN 'tomorrow'
        WHEN l.follow_up_date <= CURRENT_DATE + 7 THEN 'this_week'
        ELSE 'later'
    END as urgency
FROM leads l
WHERE l.follow_up_date >= CURRENT_DATE
AND l.lead_status NOT IN ('converted', 'not_interested')
ORDER BY l.follow_up_date ASC, l.priority_tag DESC;

-- Create function to get lead statistics
CREATE OR REPLACE FUNCTION get_lead_statistics(user_id UUID)
RETURNS TABLE (
    total_leads BIGINT,
    potential_leads BIGINT,
    interested_leads BIGINT,
    converted_leads BIGINT,
    todays_followups BIGINT,
    overdue_followups BIGINT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE lead_status != 'converted') as total_leads,
        COUNT(*) FILTER (WHERE lead_status = 'potential') as potential_leads,
        COUNT(*) FILTER (WHERE lead_status = 'interested') as interested_leads,
        COUNT(*) FILTER (WHERE lead_status = 'converted') as converted_leads,
        COUNT(*) FILTER (WHERE follow_up_date = CURRENT_DATE AND lead_status NOT IN ('converted', 'not_interested')) as todays_followups,
        COUNT(*) FILTER (WHERE follow_up_date < CURRENT_DATE AND lead_status NOT IN ('converted', 'not_interested')) as overdue_followups
    FROM leads
    WHERE created_by = user_id;
END;
$$ LANGUAGE plpgsql;
