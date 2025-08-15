-- Create service_locations table for US-006
-- This table stores service location information for accounts

CREATE TABLE IF NOT EXISTS public.service_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
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
CREATE INDEX idx_service_locations_account_id ON public.service_locations(account_id);
CREATE INDEX idx_service_locations_status ON public.service_locations(status);
CREATE INDEX idx_service_locations_is_primary ON public.service_locations(is_primary);

-- Enable Row Level Security
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
CREATE POLICY "Service locations are viewable by authenticated users" 
  ON public.service_locations FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Service locations are insertable by authenticated users" 
  ON public.service_locations FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Service locations are updatable by authenticated users" 
  ON public.service_locations FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Service locations are deletable by authenticated users" 
  ON public.service_locations FOR DELETE 
  TO authenticated 
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_locations_updated_at 
  BEFORE UPDATE ON public.service_locations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some test data (optional - comment out in production)
-- Note: Using generic test data since accounts table structure may vary
INSERT INTO public.service_locations (account_id, location_name, street_address, city, state, postal_code, access_information, is_primary, status)
SELECT 
  a.id,
  'Main Office' AS location_name,
  '123 Main Street' AS street_address,
  'Springfield' AS city,
  'IL' AS state,
  '62701' AS postal_code,
  'Use main entrance during business hours' AS access_information,
  true AS is_primary,
  'Active' AS status
FROM public.accounts a
LIMIT 5;

-- Add secondary locations for some accounts
INSERT INTO public.service_locations (account_id, location_name, street_address, city, state, postal_code, access_information, is_primary, status)
SELECT 
  a.id,
  'Warehouse' AS location_name,
  '456 Industrial Blvd' AS street_address,
  'Springfield' AS city,
  'IL' AS state,
  '62702' AS postal_code,
  NULL AS access_information,
  false AS is_primary,
  'Active' AS status
FROM public.accounts a
LIMIT 3;

COMMENT ON TABLE public.service_locations IS 'Service locations for customer accounts';
COMMENT ON COLUMN public.service_locations.account_id IS 'Reference to the parent account';
COMMENT ON COLUMN public.service_locations.location_name IS 'Friendly name for the location';
COMMENT ON COLUMN public.service_locations.is_primary IS 'Whether this is the primary service location';
COMMENT ON COLUMN public.service_locations.access_information IS 'Special instructions for accessing this location';