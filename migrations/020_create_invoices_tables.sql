-- Create freelancer_invoices table
CREATE TABLE IF NOT EXISTS freelancer_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES freelancer_clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES freelancer_projects(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    currency TEXT NOT NULL DEFAULT 'USD',
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freelancer_invoice_items table
CREATE TABLE IF NOT EXISTS freelancer_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES freelancer_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_freelancer_invoices_client_id ON freelancer_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_invoices_project_id ON freelancer_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_invoice_items_invoice_id ON freelancer_invoice_items(invoice_id);

-- Enable Row Level Security (RLS)
ALTER TABLE freelancer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for now, assuming authenticated users can access all data in their vertical context)
-- In a real multi-tenant app, you'd filter by user_id or organization_id
CREATE POLICY "Enable all access for authenticated users" ON freelancer_invoices
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON freelancer_invoice_items
    FOR ALL USING (auth.role() = 'authenticated');
