-- Travel Agent Management System Database Schema
-- Migration 001: Initial schema creation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE client_status AS ENUM (
    'new',
    'in_process',
    'documents_pending',
    'submitted',
    'approved',
    'rejected',
    'completed'
);

CREATE TYPE package_type AS ENUM (
    'umrah_package',
    'tourist_visa',
    'ticketing',
    'visit_visa'
);

CREATE TYPE lead_source AS ENUM (
    'facebook',
    'referral',
    'walk_in'
);

CREATE TYPE priority_tag AS ENUM (
    'normal',
    'priority',
    'urgent',
    'vip'
);

CREATE TYPE reminder_type AS ENUM (
    'follow_up',
    'payment',
    'document_submission',
    'travel_date',
    'visa_expiry'
);

CREATE TYPE file_type AS ENUM (
    'passport_scan',
    'visa_scan',
    'payment_receipt',
    'ticket_pdf',
    'hotel_confirmation',
    'cnic_scan',
    'other'
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    package_type package_type NOT NULL,
    lead_source lead_source NOT NULL,
    status client_status DEFAULT 'new',
    priority_tag priority_tag DEFAULT 'normal',
    profile_picture_url TEXT,
    passport_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create travel_information table
CREATE TABLE travel_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    departure_date DATE,
    return_date DATE,
    airline VARCHAR(100),
    pnr_number VARCHAR(50),
    hotel_name VARCHAR(255),
    hotel_address TEXT,
    room_type VARCHAR(100),
    transport_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create visa_applications table
CREATE TABLE visa_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    visa_type VARCHAR(100) NOT NULL,
    application_date DATE,
    submission_date DATE,
    approval_date DATE,
    rejection_date DATE,
    rejection_reason TEXT,
    visa_number VARCHAR(100),
    expiry_date DATE,
    status client_status DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_type reminder_type NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create client_files table
CREATE TABLE client_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type file_type NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create follow_ups table
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    follow_up_date DATE NOT NULL,
    follow_up_type VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_package_type ON clients(package_type);
CREATE INDEX idx_clients_created_at ON clients(created_at);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_travel_information_client_id ON travel_information(client_id);
CREATE INDEX idx_visa_applications_client_id ON visa_applications(client_id);
CREATE INDEX idx_visa_applications_status ON visa_applications(status);
CREATE INDEX idx_reminders_client_id ON reminders(client_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_is_completed ON reminders(is_completed);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_client_files_client_id ON client_files(client_id);
CREATE INDEX idx_client_files_file_type ON client_files(file_type);
CREATE INDEX idx_follow_ups_client_id ON follow_ups(client_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_information_updated_at BEFORE UPDATE ON travel_information
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visa_applications_updated_at BEFORE UPDATE ON visa_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON follow_ups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view their own clients" ON clients FOR SELECT
    USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Users can insert their own clients" ON clients FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own clients" ON clients FOR UPDATE
    USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Users can delete their own clients" ON clients FOR DELETE
    USING (auth.uid() = created_by);

-- Similar policies for other tables (simplified for brevity)
CREATE POLICY "Users can manage their travel info" ON travel_information FOR ALL
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = travel_information.client_id 
    AND (clients.created_by = auth.uid() OR clients.updated_by = auth.uid())));

CREATE POLICY "Users can manage their visa applications" ON visa_applications FOR ALL
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = visa_applications.client_id 
    AND (clients.created_by = auth.uid() OR clients.updated_by = auth.uid())));

CREATE POLICY "Users can manage their reminders" ON reminders FOR ALL
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = reminders.client_id 
    AND (clients.created_by = auth.uid() OR clients.updated_by = auth.uid())));

CREATE POLICY "Users can manage their payments" ON payments FOR ALL
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = payments.client_id 
    AND (clients.created_by = auth.uid() OR clients.updated_by = auth.uid())));

CREATE POLICY "Users can manage their files" ON client_files FOR ALL
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_files.client_id 
    AND (clients.created_by = auth.uid() OR clients.updated_by = auth.uid())));

CREATE POLICY "Users can manage their follow ups" ON follow_ups FOR ALL
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = follow_ups.client_id 
    AND (clients.created_by = auth.uid() OR clients.updated_by = auth.uid())));