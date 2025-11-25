-- Migration: Add Trip Types System
-- Description: Adds support for three trip types: one-way, with stays (multi-stop), and return trips
-- Author: Travel Agent System
-- Date: 2025-11-25

-- Step 1: Create trip_type enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_type_enum') THEN
        CREATE TYPE trip_type_enum AS ENUM ('one_way', 'return');
    END IF;
END $$;

-- Step 2: Add trip_type column to travel_trips table
ALTER TABLE travel_trips 
ADD COLUMN IF NOT EXISTS trip_type trip_type_enum DEFAULT 'one_way' NOT NULL;

-- Step 3: Add return flight fields for round trips
ALTER TABLE travel_trips
ADD COLUMN IF NOT EXISTS return_departure_city VARCHAR(255),
ADD COLUMN IF NOT EXISTS return_departure_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS return_destination_city VARCHAR(255),
ADD COLUMN IF NOT EXISTS return_destination_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS return_airline VARCHAR(255),
ADD COLUMN IF NOT EXISTS return_flight_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS return_pnr_number VARCHAR(100);

-- Step 4: Create trip_stops table for multi-stop itineraries
CREATE TABLE IF NOT EXISTS trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES travel_trips(id) ON DELETE CASCADE,
    leg VARCHAR(20) NOT NULL DEFAULT 'outbound', -- 'outbound' or 'return'
    stop_number INTEGER NOT NULL,
    city VARCHAR(255) NOT NULL,
    arrival_date TIMESTAMP WITH TIME ZONE NOT NULL,
    departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
    hotel_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT trip_stops_trip_leg_stop_unique UNIQUE (trip_id, leg, stop_number),
    CONSTRAINT trip_stops_dates_check CHECK (departure_date > arrival_date),
    CONSTRAINT trip_stops_leg_check CHECK (leg IN ('outbound', 'return'))
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_travel_trips_trip_type ON travel_trips(trip_type);
CREATE INDEX IF NOT EXISTS idx_trip_stops_leg ON trip_stops(trip_id, leg, stop_number);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN travel_trips.trip_type IS 'Type of trip: one_way (single direction) or return (round trip). Both types can optionally have intermediate stops.';
COMMENT ON COLUMN travel_trips.return_departure_city IS 'Starting city for return journey (used when trip_type = return)';
COMMENT ON COLUMN travel_trips.return_departure_date IS 'Departure date/time for return journey';
COMMENT ON COLUMN travel_trips.return_destination_city IS 'Arrival city for return journey (typically same as original departure_city)';
COMMENT ON COLUMN travel_trips.return_destination_date IS 'Arrival date/time for return journey';
COMMENT ON TABLE trip_stops IS 'Stores intermediate stops for trips (both one-way and return trips can have stops; round trips can have separate outbound and return stops, max 2 per leg)';
COMMENT ON COLUMN trip_stops.leg IS 'Journey leg: outbound (departure to destination) or return (return journey back)';
COMMENT ON COLUMN trip_stops.stop_number IS 'Sequential order of the stop in the itinerary for this leg (1, 2)';
COMMENT ON COLUMN trip_stops.city IS 'City/destination name for this stop';
COMMENT ON COLUMN trip_stops.arrival_date IS 'When the traveler arrives at this stop';
COMMENT ON COLUMN trip_stops.departure_date IS 'When the traveler leaves this stop';
COMMENT ON COLUMN trip_stops.hotel_name IS 'Optional hotel/accommodation name for this stop';

-- Step 7: Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trip_stops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for trip_stops updated_at
DROP TRIGGER IF EXISTS trigger_update_trip_stops_timestamp ON trip_stops;
CREATE TRIGGER trigger_update_trip_stops_timestamp
    BEFORE UPDATE ON trip_stops
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_stops_updated_at();

-- Step 9: Grant permissions (adjust based on your RLS policies)
-- Note: Modify these based on your actual role/permission structure
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for trip_stops (users can only see/edit their own trip stops)
CREATE POLICY trip_stops_select_policy ON trip_stops
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM travel_trips t
            WHERE t.id = trip_stops.trip_id
            AND t.created_by = auth.uid()
        )
    );

CREATE POLICY trip_stops_insert_policy ON trip_stops
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM travel_trips t
            WHERE t.id = trip_stops.trip_id
            AND t.created_by = auth.uid()
        )
    );

CREATE POLICY trip_stops_update_policy ON trip_stops
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM travel_trips t
            WHERE t.id = trip_stops.trip_id
            AND t.created_by = auth.uid()
        )
    );

CREATE POLICY trip_stops_delete_policy ON trip_stops
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM travel_trips t
            WHERE t.id = trip_stops.trip_id
            AND t.created_by = auth.uid()
        )
    );

-- Step 10: Update existing trips to set default trip_type (already done with DEFAULT in ALTER TABLE, but this is a safety check)
UPDATE travel_trips 
SET trip_type = 'one_way' 
WHERE trip_type IS NULL;

-- Verification Queries (run these separately to verify migration success)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'travel_trips' AND column_name LIKE '%trip_type%';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'travel_trips' AND column_name LIKE 'return%';
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'trip_stops';
-- SELECT * FROM trip_stops LIMIT 1;
