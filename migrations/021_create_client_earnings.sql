-- Migration 021: Create client earnings table
-- This table stores earnings/profit information for completed clients

-- Create earnings table
CREATE TABLE client_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    earned_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_client_earnings_client_id ON client_earnings(client_id);
CREATE INDEX idx_client_earnings_earned_date ON client_earnings(earned_date);
CREATE INDEX idx_client_earnings_created_at ON client_earnings(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_client_earnings_updated_at BEFORE UPDATE ON client_earnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE client_earnings IS 'Stores earnings and profit information for completed clients in travel agent management system';
COMMENT ON COLUMN client_earnings.amount IS 'Profit/earning amount from the client';
COMMENT ON COLUMN client_earnings.currency IS 'Currency code (ISO 4217)';
COMMENT ON COLUMN client_earnings.earned_date IS 'Date when the earnings were received/realized';
