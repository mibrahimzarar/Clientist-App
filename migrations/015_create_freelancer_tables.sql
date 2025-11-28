-- Create freelancer_clients table
CREATE TABLE IF NOT EXISTS freelancer_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    company_name TEXT,
    role TEXT,
    email TEXT,
    phone_number TEXT,
    whatsapp TEXT,
    country TEXT,
    timezone TEXT,
    tags TEXT[],
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    profile_picture_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create freelancer_projects table
CREATE TABLE IF NOT EXISTS freelancer_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES freelancer_clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT,
    category TEXT,
    tags TEXT[],
    status TEXT NOT NULL DEFAULT 'draft',
    priority TEXT NOT NULL DEFAULT 'medium',
    start_date DATE,
    deadline DATE,
    expected_delivery_date DATE,
    budget NUMERIC,
    currency TEXT DEFAULT 'USD',
    total_revisions_allowed INTEGER DEFAULT 0,
    revisions_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create freelancer_tasks table
CREATE TABLE IF NOT EXISTS freelancer_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES freelancer_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    estimated_hours NUMERIC,
    actual_hours NUMERIC,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create freelancer_leads table
CREATE TABLE IF NOT EXISTS freelancer_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'potential',
    notes TEXT,
    next_follow_up TIMESTAMPTZ,
    converted_client_id UUID REFERENCES freelancer_clients(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create freelancer_meetings table
CREATE TABLE IF NOT EXISTS freelancer_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    client_id UUID REFERENCES freelancer_clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES freelancer_projects(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'client_meeting',
    location TEXT,
    meeting_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create freelancer_reminders table
CREATE TABLE IF NOT EXISTS freelancer_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL DEFAULT 'custom',
    priority TEXT NOT NULL DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT FALSE,
    client_id UUID REFERENCES freelancer_clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES freelancer_projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE freelancer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for now, assuming authenticated users can access everything)
-- In a real app, you'd likely filter by created_by or organization_id

CREATE POLICY "Enable all access for authenticated users" ON freelancer_clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON freelancer_projects
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON freelancer_tasks
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON freelancer_leads
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON freelancer_meetings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON freelancer_reminders
    FOR ALL USING (auth.role() = 'authenticated');
