-- Migration 021: Create client earnings table
-- This table stores earnings/profit information for completed clients

-- Create earnings table
CREATE TABLE IF NOT EXISTS client_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_client_earnings_user_id ON client_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_client_earnings_client_id ON client_earnings(client_id);
CREATE INDEX IF NOT EXISTS idx_client_earnings_earned_date ON client_earnings(earned_date);
CREATE INDEX IF NOT EXISTS idx_client_earnings_created_at ON client_earnings(created_at);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_client_earnings_updated_at ON client_earnings;
CREATE TRIGGER update_client_earnings_updated_at BEFORE UPDATE ON client_earnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE client_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own earnings" ON client_earnings;
CREATE POLICY "Users can view their own earnings" ON client_earnings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own earnings" ON client_earnings;
CREATE POLICY "Users can insert their own earnings" ON client_earnings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own earnings" ON client_earnings;
CREATE POLICY "Users can update their own earnings" ON client_earnings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own earnings" ON client_earnings;
CREATE POLICY "Users can delete their own earnings" ON client_earnings
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE client_earnings IS 'Stores earnings and profit information for completed clients in travel agent management system';
COMMENT ON COLUMN client_earnings.user_id IS 'Reference to the user who owns this earning record';
COMMENT ON COLUMN client_earnings.amount IS 'Profit/earning amount from the client';
COMMENT ON COLUMN client_earnings.currency IS 'Currency code (ISO 4217)';
COMMENT ON COLUMN client_earnings.earned_date IS 'Date when the earnings were received/realized';
