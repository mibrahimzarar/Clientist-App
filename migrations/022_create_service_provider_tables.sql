-- ========================================
-- Service Provider Vertical - Complete Schema
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. SERVICE PROVIDER CLIENTS
-- ========================================
CREATE TABLE IF NOT EXISTS sp_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    is_vip BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. JOB CATEGORIES
-- ========================================
CREATE TABLE IF NOT EXISTS sp_job_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- ========================================
-- 3. JOBS (WORK ORDERS)
-- ========================================
CREATE TABLE IF NOT EXISTS sp_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES sp_clients(id) ON DELETE CASCADE,
    category_id UUID REFERENCES sp_job_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_address TEXT,
    status VARCHAR(50) DEFAULT 'in_progress',
    priority VARCHAR(20) DEFAULT 'normal',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    job_price DECIMAL(12, 2),
    parts_cost DECIMAL(12, 2) DEFAULT 0,
    labor_cost DECIMAL(12, 2) DEFAULT 0,
    total_cost DECIMAL(12, 2),
    is_urgent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('in_progress', 'completed', 'pending_payment', 'cancelled')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- ========================================
-- 4. JOB ATTACHMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS sp_job_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES sp_jobs(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. INVOICES
-- ========================================
CREATE TABLE IF NOT EXISTS sp_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES sp_clients(id) ON DELETE CASCADE,
    job_id UUID REFERENCES sp_jobs(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'))
);

-- ========================================
-- 6. INVOICE ITEMS
-- ========================================
CREATE TABLE IF NOT EXISTS sp_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES sp_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. PAYMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS sp_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES sp_clients(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES sp_invoices(id) ON DELETE SET NULL,
    job_id UUID REFERENCES sp_jobs(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_payment_method CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'cheque', 'other'))
);

-- ========================================
-- 8. LEADS
-- ========================================
CREATE TABLE IF NOT EXISTS sp_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    service_interest TEXT,
    status VARCHAR(50) DEFAULT 'new',
    source VARCHAR(100),
    next_follow_up TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_lead_status CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'))
);

-- ========================================
-- 9. REPEAT SERVICES
-- ========================================
CREATE TABLE IF NOT EXISTS sp_repeat_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES sp_clients(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    last_service_date DATE,
    next_service_date DATE NOT NULL,
    service_price DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_frequency CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'))
);

-- ========================================
-- INDEXES
-- ========================================

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_sp_clients_user_id ON sp_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_sp_clients_phone ON sp_clients(phone_number);
CREATE INDEX IF NOT EXISTS idx_sp_clients_is_vip ON sp_clients(is_vip);

-- Job categories indexes
CREATE INDEX IF NOT EXISTS idx_sp_job_categories_user_id ON sp_job_categories(user_id);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_sp_jobs_user_id ON sp_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_sp_jobs_client_id ON sp_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_sp_jobs_status ON sp_jobs(status);
CREATE INDEX IF NOT EXISTS idx_sp_jobs_scheduled_date ON sp_jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_sp_jobs_is_urgent ON sp_jobs(is_urgent);

-- Job attachments indexes
CREATE INDEX IF NOT EXISTS idx_sp_job_attachments_job_id ON sp_job_attachments(job_id);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_sp_invoices_user_id ON sp_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_sp_invoices_client_id ON sp_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_sp_invoices_job_id ON sp_invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_sp_invoices_status ON sp_invoices(status);
CREATE INDEX IF NOT EXISTS idx_sp_invoices_due_date ON sp_invoices(due_date);

-- Invoice items indexes
CREATE INDEX IF NOT EXISTS idx_sp_invoice_items_invoice_id ON sp_invoice_items(invoice_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_sp_payments_user_id ON sp_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_sp_payments_client_id ON sp_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_sp_payments_invoice_id ON sp_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_sp_payments_payment_date ON sp_payments(payment_date);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_sp_leads_user_id ON sp_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_sp_leads_status ON sp_leads(status);
CREATE INDEX IF NOT EXISTS idx_sp_leads_next_follow_up ON sp_leads(next_follow_up);

-- Repeat services indexes
CREATE INDEX IF NOT EXISTS idx_sp_repeat_services_user_id ON sp_repeat_services(user_id);
CREATE INDEX IF NOT EXISTS idx_sp_repeat_services_client_id ON sp_repeat_services(client_id);
CREATE INDEX IF NOT EXISTS idx_sp_repeat_services_next_date ON sp_repeat_services(next_service_date);
CREATE INDEX IF NOT EXISTS idx_sp_repeat_services_active ON sp_repeat_services(is_active);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_sp_clients_updated_at BEFORE UPDATE ON sp_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sp_jobs_updated_at BEFORE UPDATE ON sp_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sp_invoices_updated_at BEFORE UPDATE ON sp_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sp_leads_updated_at BEFORE UPDATE ON sp_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sp_repeat_services_updated_at BEFORE UPDATE ON sp_repeat_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE sp_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_job_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_repeat_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sp_clients
CREATE POLICY "Users can view their own clients" ON sp_clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON sp_clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON sp_clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON sp_clients
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sp_job_categories
CREATE POLICY "Users can view their own job categories" ON sp_job_categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job categories" ON sp_job_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job categories" ON sp_job_categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job categories" ON sp_job_categories
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sp_jobs
CREATE POLICY "Users can view their own jobs" ON sp_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs" ON sp_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON sp_jobs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" ON sp_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sp_job_attachments
CREATE POLICY "Users can view job attachments" ON sp_job_attachments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM sp_jobs WHERE sp_jobs.id = sp_job_attachments.job_id AND sp_jobs.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert job attachments" ON sp_job_attachments
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM sp_jobs WHERE sp_jobs.id = sp_job_attachments.job_id AND sp_jobs.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete job attachments" ON sp_job_attachments
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM sp_jobs WHERE sp_jobs.id = sp_job_attachments.job_id AND sp_jobs.user_id = auth.uid()
    ));

-- RLS Policies for sp_invoices
CREATE POLICY "Users can view their own invoices" ON sp_invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON sp_invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON sp_invoices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON sp_invoices
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sp_invoice_items
CREATE POLICY "Users can view invoice items" ON sp_invoice_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM sp_invoices WHERE sp_invoices.id = sp_invoice_items.invoice_id AND sp_invoices.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert invoice items" ON sp_invoice_items
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM sp_invoices WHERE sp_invoices.id = sp_invoice_items.invoice_id AND sp_invoices.user_id = auth.uid()
    ));

CREATE POLICY "Users can update invoice items" ON sp_invoice_items
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM sp_invoices WHERE sp_invoices.id = sp_invoice_items.invoice_id AND sp_invoices.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete invoice items" ON sp_invoice_items
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM sp_invoices WHERE sp_invoices.id = sp_invoice_items.invoice_id AND sp_invoices.user_id = auth.uid()
    ));

-- RLS Policies for sp_payments
CREATE POLICY "Users can view their own payments" ON sp_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON sp_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON sp_payments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" ON sp_payments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sp_leads
CREATE POLICY "Users can view their own leads" ON sp_leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON sp_leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON sp_leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON sp_leads
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sp_repeat_services
CREATE POLICY "Users can view their own repeat services" ON sp_repeat_services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repeat services" ON sp_repeat_services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repeat services" ON sp_repeat_services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repeat services" ON sp_repeat_services
    FOR DELETE USING (auth.uid() = user_id);
