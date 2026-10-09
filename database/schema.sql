-- ====================================================================
-- SafeRide AI: Supabase PostgreSQL Database Schema with PgVector
-- Run this script in your Supabase SQL Editor (https://app.supabase.com)
-- ====================================================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USERS TABLE (School Admins, Bus Drivers, Parents)
CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'PARENT');

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    fcm_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BUSES TABLE
CREATE TABLE IF NOT EXISTS public.buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    bus_number VARCHAR(50) NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 40,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'IN_TRANSIT',
    current_lat DOUBLE PRECISION DEFAULT 12.9750,
    current_lng DOUBLE PRECISION DEFAULT 77.5890,
    speed VARCHAR(20) DEFAULT '24 km/h'
);

-- 5. ROUTES & STOPS TABLE
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    route_name VARCHAR(255) NOT NULL,
    start_time TIME,
    end_time TIME
);

CREATE TABLE IF NOT EXISTS public.stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(255) NOT NULL,
    sequence_order INT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geofence_radius_meters INT DEFAULT 75
);

-- 6. STUDENTS TABLE WITH 512-D FACE EMBEDDINGS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_official_id VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grade_section VARCHAR(50),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_bus_id UUID REFERENCES buses(id),
    pickup_stop_id UUID REFERENCES stops(id),
    face_embedding vector(512), -- 512-dimensional normalized face vector
    face_registered BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, BOARDED, DROPPED_OFF, MISMATCH
    boarding_time VARCHAR(50),
    verification_status VARCHAR(50),
    confidence_score FLOAT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TRANSPORTATION EVENTS TABLE
CREATE TYPE event_type AS ENUM ('BOARDING_PICKUP', 'DROP_OFF');

CREATE TABLE IF NOT EXISTS public.transportation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id),
    stop_id UUID REFERENCES stops(id),
    type event_type NOT NULL DEFAULT 'BOARDING_PICKUP',
    status VARCHAR(50) NOT NULL, -- VERIFIED_FACE, VERIFIED_MANUAL, MISMATCH_FLAGGED
    confidence_score FLOAT,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PUSH NOTIFICATIONS / SAFETY ALERTS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- BUS_ARRIVED, STUDENT_BOARDED, STUDENT_DROPPED
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PGVECTOR SIMILARITY MATCH FUNCTION
CREATE OR REPLACE FUNCTION match_student_face(
    query_embedding vector(512),
    match_threshold FLOAT DEFAULT 0.65,
    match_count INT DEFAULT 1
)
RETURNS TABLE (
    student_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS student_id,
        s.first_name,
        s.last_name,
        1 - (s.face_embedding <=> query_embedding) AS similarity
    FROM students s
    WHERE s.face_embedding IS NOT NULL
      AND 1 - (s.face_embedding <=> query_embedding) >= match_threshold
    ORDER BY s.face_embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES (ENABLE PUBLIC READ FOR DEMO)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public insert access" ON public.students FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.notifications FOR INSERT WITH CHECK (true);

-- 11. SAMPLE SEED DATA
INSERT INTO public.schools (id, name, address, contact_email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Central City High School', '100 Education Way, City Center', 'admin@centralcityschool.edu')
ON CONFLICT DO NOTHING;

INSERT INTO public.buses (id, school_id, bus_number, license_plate, capacity, status)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Bus 01', 'KA-01-EA-4920', 32, 'IN_TRANSIT')
ON CONFLICT DO NOTHING;
