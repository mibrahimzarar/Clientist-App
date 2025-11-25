-- Migration to add leg column to trip_stops table
-- This migration adds the leg column to differentiate outbound and return stops

BEGIN;

ALTER TABLE trip_stops
    ADD COLUMN leg VARCHAR(20) NOT NULL DEFAULT 'outbound';

-- Ensure leg has only allowed values
ALTER TABLE trip_stops
    ADD CONSTRAINT trip_stops_leg_check CHECK (leg IN ('outbound', 'return'));

-- Drop the old unique constraint if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_stops_trip_stop_unique') THEN
        ALTER TABLE trip_stops DROP CONSTRAINT trip_stops_trip_stop_unique;
    END IF;
END $$;

-- Add new unique constraint on (trip_id, leg, stop_number)
ALTER TABLE trip_stops
    ADD CONSTRAINT trip_stops_trip_leg_stop_unique UNIQUE (trip_id, leg, stop_number);

COMMIT;
