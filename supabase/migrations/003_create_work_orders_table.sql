-- Migration: Create work_orders table
-- Purpose: Store work order information for service requests

CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    service_location_id UUID REFERENCES public.service_locations(id),
    contact_id UUID REFERENCES public.contacts(id),
    
    -- Work order details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- service, installation, maintenance, emergency
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(50) DEFAULT 'pending', -- pending, scheduled, in_progress, completed, cancelled
    
    -- Scheduling
    scheduled_date DATE,
    scheduled_time TIME,
    estimated_duration_hours DECIMAL(5,2),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_to VARCHAR(255), -- technician ID or name
    assigned_team VARCHAR(100),
    
    -- Completion details
    completion_notes TEXT,
    customer_signature TEXT, -- Base64 encoded signature
    technician_signature TEXT, -- Base64 encoded signature
    
    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_work_orders_account_id ON public.work_orders(account_id);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_work_orders_priority ON public.work_orders(priority);
CREATE INDEX idx_work_orders_scheduled_date ON public.work_orders(scheduled_date);
CREATE INDEX idx_work_orders_service_location_id ON public.work_orders(service_location_id);
CREATE INDEX idx_work_orders_work_order_number ON public.work_orders(work_order_number);

-- RLS (Row Level Security) policies
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read work orders
CREATE POLICY "Allow authenticated read access" ON public.work_orders
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert work orders
CREATE POLICY "Allow authenticated insert access" ON public.work_orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update work orders
CREATE POLICY "Allow authenticated update access" ON public.work_orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate work order numbers
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    -- Generate format: WO-YYYYMMDD-XXXX
    SELECT 'WO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
           LPAD(COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1, 4, '0')
    INTO new_number
    FROM public.work_orders
    WHERE work_order_number LIKE 'WO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%';
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate work order number if not provided
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