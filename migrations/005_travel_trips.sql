-- Migration: Create Travel Trips Table
-- Created: 2025-11-22
-- Description: Creates the travel_trips table for managing trip itineraries with departure/destination details

-- Create travel_trips table
CREATE TABLE IF NOT EXISTS travel_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  departure_city TEXT NOT NULL,
  departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  destination_city TEXT NOT NULL,
  destination_date TIMESTAMP WITH TIME ZONE NOT NULL,
  airline TEXT,
  flight_number TEXT,
  pnr_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_travel_trips_client ON travel_trips(client_id);
CREATE INDEX IF NOT EXISTS idx_travel_trips_departure ON travel_trips(departure_date);
CREATE INDEX IF NOT EXISTS idx_travel_trips_created_by ON travel_trips(created_by);

-- Enable Row Level Security
ALTER TABLE travel_trips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own trips" ON travel_trips;
DROP POLICY IF EXISTS "Users can insert their own trips" ON travel_trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON travel_trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON travel_trips;

-- Create RLS policies
CREATE POLICY "Users can view their own trips"
  ON travel_trips FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own trips"
  ON travel_trips FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own trips"
  ON travel_trips FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own trips"
  ON travel_trips FOR DELETE
  USING (auth.uid() = created_by);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_travel_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS travel_trips_updated_at ON travel_trips;
CREATE TRIGGER travel_trips_updated_at
  BEFORE UPDATE ON travel_trips
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_trips_updated_at();
