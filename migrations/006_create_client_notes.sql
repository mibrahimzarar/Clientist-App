-- Create client_notes table for timeline and comprehensive notes
CREATE TABLE client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'note', -- 'note', 'status_change', 'creation', 'follow_up', 'system'
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Create index for performance
CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX idx_client_notes_created_at ON client_notes(created_at);

-- Enable RLS
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view notes for their clients" ON client_notes FOR SELECT
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_notes.client_id 
    AND (clients.created_by = auth.uid() OR clients.updated_by = auth.uid())));

CREATE POLICY "Users can insert notes for their clients" ON client_notes FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_notes.client_id 
    AND (clients.created_by = auth.uid() OR clients.updated_by = auth.uid())));

CREATE POLICY "Users can update their own notes" ON client_notes FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own notes" ON client_notes FOR DELETE
    USING (created_by = auth.uid());
