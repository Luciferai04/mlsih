-- NATPAC Travel Data Collection - Database Schema
-- PostgreSQL with PostGIS extension for spatial data

-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table for app users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL, -- UUID
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(255),
    age_group VARCHAR(20), -- '18-25', '26-35', '36-45', '46-60', '60+'
    gender VARCHAR(20), -- 'male', 'female', 'other', 'prefer_not_to_say'
    occupation VARCHAR(100),
    household_size INTEGER,
    income_bracket VARCHAR(30),
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    consent_timestamp TIMESTAMP,
    privacy_settings JSONB DEFAULT '{}',
    device_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Transport modes reference table
CREATE TABLE transport_modes (
    id SERIAL PRIMARY KEY,
    mode_name VARCHAR(50) NOT NULL UNIQUE, -- 'walk', 'bicycle', 'bus', 'car', 'train', 'auto', 'bike'
    category VARCHAR(30), -- 'motorized', 'non_motorized', 'public_transport'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Trip purposes reference table
CREATE TABLE trip_purposes (
    id SERIAL PRIMARY KEY,
    purpose_name VARCHAR(50) NOT NULL UNIQUE, -- 'work', 'education', 'shopping', 'leisure', 'medical', 'social'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Locations table for frequently visited places
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    location_id VARCHAR(36) UNIQUE NOT NULL, -- UUID
    name VARCHAR(255),
    address TEXT,
    coordinates GEOMETRY(POINT, 4326), -- PostGIS point (longitude, latitude)
    place_type VARCHAR(50), -- 'home', 'work', 'school', 'mall', 'hospital', 'bus_stop', 'other'
    verified BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for locations
CREATE INDEX idx_locations_coordinates ON locations USING GIST (coordinates);

-- Trips table - main trip data
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    trip_id VARCHAR(36) UNIQUE NOT NULL, -- UUID
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trip_date DATE NOT NULL,
    trip_number INTEGER NOT NULL, -- Sequential number for the day
    
    -- Origin information
    origin_name VARCHAR(255),
    origin_address TEXT,
    origin_coordinates GEOMETRY(POINT, 4326),
    origin_location_id INTEGER REFERENCES locations(id),
    
    -- Destination information
    destination_name VARCHAR(255),
    destination_address TEXT,
    destination_coordinates GEOMETRY(POINT, 4326),
    destination_location_id INTEGER REFERENCES locations(id),
    
    -- Timing
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time))/60
    ) STORED,
    
    -- Trip details
    transport_mode_id INTEGER REFERENCES transport_modes(id),
    trip_purpose_id INTEGER REFERENCES trip_purposes(id),
    distance_km DECIMAL(8,2),
    
    -- Data collection method
    detection_method VARCHAR(20), -- 'automatic', 'manual', 'assisted'
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00 for automatic detection confidence
    
    -- Trip chain information
    is_part_of_chain BOOLEAN DEFAULT FALSE,
    chain_id VARCHAR(36), -- Groups related trips together
    chain_sequence INTEGER, -- Order in the chain
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for trips
CREATE INDEX idx_trips_user_date ON trips(user_id, trip_date);
CREATE INDEX idx_trips_origin_coords ON trips USING GIST (origin_coordinates);
CREATE INDEX idx_trips_dest_coords ON trips USING GIST (destination_coordinates);
CREATE INDEX idx_trips_chain ON trips(chain_id, chain_sequence) WHERE chain_id IS NOT NULL;

-- Accompanying travelers table
CREATE TABLE trip_companions (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    age_group VARCHAR(20), -- Same as users table
    gender VARCHAR(20), -- Same as users table
    relationship VARCHAR(30), -- 'family', 'friend', 'colleague', 'other'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GPS tracking points for detailed trip analysis (optional)
CREATE TABLE trip_tracking_points (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    coordinates GEOMETRY(POINT, 4326),
    timestamp TIMESTAMP NOT NULL,
    accuracy_meters DECIMAL(6,2),
    speed_kmh DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracking_trip_time ON trip_tracking_points(trip_id, timestamp);
CREATE INDEX idx_tracking_coordinates ON trip_tracking_points USING GIST (coordinates);

-- User sessions for app usage tracking
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(36) UNIQUE NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    device_info JSONB,
    app_version VARCHAR(20)
);

-- Data export logs for NATPAC scientists
CREATE TABLE data_exports (
    id SERIAL PRIMARY KEY,
    export_id VARCHAR(36) UNIQUE NOT NULL,
    exported_by VARCHAR(100), -- NATPAC scientist identifier
    export_type VARCHAR(30), -- 'csv', 'json', 'xml', 'geojson'
    date_range_start DATE,
    date_range_end DATE,
    filters_applied JSONB,
    record_count INTEGER,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default transport modes
INSERT INTO transport_modes (mode_name, category, description) VALUES
('walk', 'non_motorized', 'Walking'),
('bicycle', 'non_motorized', 'Bicycle/Cycle'),
('bus', 'public_transport', 'Public Bus'),
('train', 'public_transport', 'Train/Metro'),
('auto', 'motorized', 'Auto Rickshaw'),
('car', 'motorized', 'Private Car'),
('bike', 'motorized', 'Motorcycle/Scooter'),
('taxi', 'motorized', 'Taxi/Cab'),
('other', 'other', 'Other mode of transport');

-- Insert default trip purposes
INSERT INTO trip_purposes (purpose_name, description) VALUES
('work', 'Work-related trip'),
('education', 'School/College/Training'),
('shopping', 'Shopping and errands'),
('leisure', 'Recreation and entertainment'),
('medical', 'Healthcare visits'),
('social', 'Visiting friends/family'),
('business', 'Business meetings'),
('religious', 'Religious activities'),
('other', 'Other purpose');

-- Views for common queries

-- Daily trip summary by user
CREATE VIEW daily_trip_summary AS
SELECT 
    u.user_id,
    t.trip_date,
    COUNT(*) as total_trips,
    SUM(t.distance_km) as total_distance_km,
    SUM(t.duration_minutes) as total_duration_minutes,
    ARRAY_AGG(DISTINCT tm.mode_name ORDER BY tm.mode_name) as modes_used
FROM trips t
JOIN users u ON t.user_id = u.id
JOIN transport_modes tm ON t.transport_mode_id = tm.id
WHERE t.is_deleted = FALSE
GROUP BY u.user_id, t.trip_date;

-- Popular routes
CREATE VIEW popular_routes AS
SELECT 
    origin_name,
    destination_name,
    COUNT(*) as trip_count,
    AVG(distance_km) as avg_distance_km,
    AVG(duration_minutes) as avg_duration_minutes,
    ARRAY_AGG(DISTINCT tm.mode_name ORDER BY tm.mode_name) as common_modes
FROM trips t
JOIN transport_modes tm ON t.transport_mode_id = tm.id
WHERE t.is_deleted = FALSE 
    AND origin_name IS NOT NULL 
    AND destination_name IS NOT NULL
GROUP BY origin_name, destination_name
HAVING COUNT(*) >= 5
ORDER BY trip_count DESC;