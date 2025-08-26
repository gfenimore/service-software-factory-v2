-- Migration: Create service_locations table
-- Purpose: Store service location information for accounts

CREATE TABLE IF NOT EXISTS public.service_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id VARCHAR(255) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_primary BOOLEAN DEFAULT false,
    is_billing_address BOOLEAN DEFAULT false,
    site_contact_id UUID REFERENCES public.contacts(id),
    access_instructions TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_service_locations_account_id ON public.service_locations(account_id);
CREATE INDEX idx_service_locations_status ON public.service_locations(status);
CREATE INDEX idx_service_locations_is_primary ON public.service_locations(is_primary) WHERE is_primary = true;
CREATE INDEX idx_service_locations_zip ON public.service_locations(zip_code);

-- RLS (Row Level Security) policies
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read service locations
CREATE POLICY "Allow authenticated read access" ON public.service_locations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert service locations
CREATE POLICY "Allow authenticated insert access" ON public.service_locations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update service locations
CREATE POLICY "Allow authenticated update access" ON public.service_locations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
CREATE TRIGGER update_service_locations_updated_at BEFORE UPDATE ON public.service_locations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();