-- Create service_locations table for US-006 (Simple version without test data)
-- This table stores service location information for accounts

-- Drop table if you need to recreate it
-- DROP TABLE IF EXISTS public.service_locations;

CREATE TABLE IF NOT EXISTS public.service_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  access_information TEXT,
  is_primary BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On-Hold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_locations_account_id ON public.service_locations(account_id);
CREATE INDEX IF NOT EXISTS idx_service_locations_status ON public.service_locations(status);
CREATE INDEX IF NOT EXISTS idx_service_locations_is_primary ON public.service_locations(is_primary);

-- Enable Row Level Security
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - adjust based on your auth requirements)
DROP POLICY IF EXISTS "Service locations are viewable by all" ON public.service_locations;
CREATE POLICY "Service locations are viewable by all" 
  ON public.service_locations FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Service locations are insertable by all" ON public.service_locations;
CREATE POLICY "Service locations are insertable by all" 
  ON public.service_locations FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service locations are updatable by all" ON public.service_locations;
CREATE POLICY "Service locations are updatable by all" 
  ON public.service_locations FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Service locations are deletable by all" ON public.service_locations;
CREATE POLICY "Service locations are deletable by all" 
  ON public.service_locations FOR DELETE 
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_service_locations_updated_at ON public.service_locations;
CREATE TRIGGER update_service_locations_updated_at 
  BEFORE UPDATE ON public.service_locations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add table comments
COMMENT ON TABLE public.service_locations IS 'Service locations for customer accounts';
COMMENT ON COLUMN public.service_locations.account_id IS 'Reference to the parent account';
COMMENT ON COLUMN public.service_locations.location_name IS 'Friendly name for the location';
COMMENT ON COLUMN public.service_locations.is_primary IS 'Whether this is the primary service location';
COMMENT ON COLUMN public.service_locations.access_information IS 'Special instructions for accessing this location';