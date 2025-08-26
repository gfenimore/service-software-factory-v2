-- Combined migration for remaining tables
-- Run this in Supabase SQL Editor

-- ================================================
-- Table: service_locations
-- ================================================

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
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_locations_account_id ON public.service_locations(account_id);
CREATE INDEX IF NOT EXISTS idx_service_locations_status ON public.service_locations(status);
CREATE INDEX IF NOT EXISTS idx_service_locations_is_primary ON public.service_locations(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_service_locations_zip ON public.service_locations(zip_code);

-- RLS policies
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access" ON public.service_locations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access" ON public.service_locations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access" ON public.service_locations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_service_locations_updated_at BEFORE UPDATE ON public.service_locations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- Table: work_orders
-- ================================================

CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    service_location_id UUID REFERENCES public.service_locations(id),
    contact_id UUID REFERENCES public.contacts(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_date DATE,
    scheduled_time TIME,
    estimated_duration_hours DECIMAL(5,2),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    assigned_to VARCHAR(255),
    assigned_team VARCHAR(100),
    completion_notes TEXT,
    customer_signature TEXT,
    technician_signature TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_account_id ON public.work_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority ON public.work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled_date ON public.work_orders(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_service_location_id ON public.work_orders(service_location_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_work_order_number ON public.work_orders(work_order_number);

-- RLS policies
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access" ON public.work_orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access" ON public.work_orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access" ON public.work_orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Work order number generation
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    SELECT 'WO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
           LPAD(COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1, 4, '0')
    INTO new_number
    FROM public.work_orders
    WHERE work_order_number LIKE 'WO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%';
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_work_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.work_order_number IS NULL THEN
        NEW.work_order_number := public.generate_work_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_work_order_number_trigger
    BEFORE INSERT ON public.work_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_work_order_number();

-- ================================================
-- Sample Data
-- ================================================

-- Sample service locations
INSERT INTO public.service_locations (
    account_id,
    location_name,
    street_address,
    city,
    state,
    zip_code,
    is_primary,
    is_billing_address,
    notes,
    status
) VALUES
    ('ACC-001234', 'Main Office', '123 Business Ave', 'New York', 'NY', '10001', true, true, 'Main headquarters', 'active'),
    ('ACC-001234', 'Warehouse', '456 Industrial Pkwy', 'Newark', 'NJ', '07102', false, false, '24/7 access available', 'active'),
    ('ACC-001235', 'Manufacturing Plant', '789 Factory Rd', 'Detroit', 'MI', '48201', true, false, 'Security clearance required', 'active'),
    ('ACC-001236', 'Tech Campus', '321 Innovation Dr', 'San Francisco', 'CA', '94102', true, true, 'Badge access required', 'active'),
    ('ACC-001237', 'Store #001', '555 Retail Blvd', 'Chicago', 'IL', '60601', true, false, 'Mall location', 'active'),
    ('ACC-001238', 'Medical Center', '999 Healthcare Way', 'Boston', 'MA', '02108', true, true, 'Visitor parking in Lot B', 'active')
ON CONFLICT DO NOTHING;

-- Sample work orders
INSERT INTO public.work_orders (
    account_id,
    service_location_id,
    contact_id,
    title,
    description,
    type,
    priority,
    status,
    scheduled_date,
    estimated_duration_hours
) 
SELECT 
    'ACC-001234',
    (SELECT id FROM public.service_locations WHERE account_id = 'ACC-001234' AND is_primary = true LIMIT 1),
    (SELECT id FROM public.contacts WHERE account_id = 'ACC-001234' AND is_primary = true LIMIT 1),
    'Quarterly HVAC Maintenance',
    'Routine quarterly maintenance of HVAC systems',
    'maintenance',
    'normal',
    'scheduled',
    CURRENT_DATE + INTERVAL '7 days',
    4.0
WHERE EXISTS (SELECT 1 FROM public.service_locations WHERE account_id = 'ACC-001234')
  AND EXISTS (SELECT 1 FROM public.contacts WHERE account_id = 'ACC-001234');

INSERT INTO public.work_orders (
    account_id,
    service_location_id,
    contact_id,
    title,
    description,
    type,
    priority,
    status,
    scheduled_date,
    estimated_duration_hours
)
SELECT 
    'ACC-001235',
    (SELECT id FROM public.service_locations WHERE account_id = 'ACC-001235' AND is_primary = true LIMIT 1),
    (SELECT id FROM public.contacts WHERE account_id = 'ACC-001235' AND is_technical = true LIMIT 1),
    'Emergency Repair - Production Line',
    'Critical equipment failure on production line 3',
    'emergency',
    'urgent',
    'in_progress',
    CURRENT_DATE,
    2.5
WHERE EXISTS (SELECT 1 FROM public.service_locations WHERE account_id = 'ACC-001235')
  AND EXISTS (SELECT 1 FROM public.contacts WHERE account_id = 'ACC-001235');