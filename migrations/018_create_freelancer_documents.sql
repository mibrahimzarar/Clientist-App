-- Create freelancer_documents table
CREATE TABLE IF NOT EXISTS freelancer_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES freelancer_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL, -- 'pdf', 'image', 'doc', etc.
    size_bytes BIGINT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE freelancer_documents ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Enable all access for authenticated users" ON freelancer_documents
    FOR ALL USING (auth.role() = 'authenticated');
