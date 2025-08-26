-- Migration: Create work_orders table for US-007
-- Date: 2025-01-16
-- Purpose: Store work orders for service locations

-- Create the work_orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_location_id UUID REFERENCES service_locations(id) ON DELETE CASCADE,
  work_order_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('Maintenance', 'Repair', 'Installation', 'Inspection')),
  status VARCHAR(20) CHECK (status IN ('Scheduled', 'Assigned', 'In-Progress', 'Completed', 'Invoiced')),
  priority VARCHAR(10) CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
  scheduled_date DATE NOT NULL,
  scheduled_time_slot VARCHAR(50),
  technician_id UUID,
  technician_name VARCHAR(100),
  description TEXT,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_work_orders_location ON work_orders(service_location_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_scheduled ON work_orders(scheduled_date);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);

-- Enable Row Level Security (optional - uncomment if needed)
-- ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Create update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_orders_updated_at 
  BEFORE UPDATE ON work_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO work_orders (
  service_location_id,
  work_order_number,
  type,
  status,
  priority,
  scheduled_date,
  scheduled_time_slot,
  technician_name,
  description
) 
SELECT 
  sl.id,
  'WO-2025-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0'),
  (ARRAY['Maintenance', 'Repair', 'Installation', 'Inspection'])[1 + FLOOR(RANDOM() * 4)::INT],
  (ARRAY['Scheduled', 'Assigned', 'In-Progress', 'Completed'])[1 + FLOOR(RANDOM() * 4)::INT],
  (ARRAY['Low', 'Medium', 'High', 'Emergency'])[1 + FLOOR(RANDOM() * 4)::INT],
  CURRENT_DATE + (FLOOR(RANDOM() * 30 - 15)::INT || ' days')::INTERVAL,
  CASE WHEN RANDOM() > 0.5 THEN 'Morning (8AM-12PM)' ELSE 'Afternoon (12PM-5PM)' END,
  CASE WHEN RANDOM() > 0.3 THEN 
    (ARRAY['John Smith', 'Sarah Johnson', 'Mike Williams', 'Emily Davis', 'Robert Brown'])[1 + FLOOR(RANDOM() * 5)::INT]
  ELSE NULL END,
  CASE 
    WHEN RANDOM() < 0.25 THEN 'Routine HVAC system maintenance and filter replacement'
    WHEN RANDOM() < 0.5 THEN 'Repair malfunctioning equipment in main office'
    WHEN RANDOM() < 0.75 THEN 'Install new security system components'
    ELSE 'Annual safety inspection and compliance check'
  END
FROM service_locations sl
CROSS JOIN generate_series(1, 3) -- Create 3 work orders per location
LIMIT 100; -- Maximum 100 sample work orders

-- Add some completed work orders with completion notes
UPDATE work_orders 
SET 
  status = 'Completed',
  completion_notes = 'Work completed successfully. All systems tested and operational.'
WHERE status = 'Completed';

-- Add some emergency priority items
UPDATE work_orders 
SET priority = 'Emergency'
WHERE RANDOM() < 0.1 AND status IN ('Scheduled', 'Assigned', 'In-Progress');

-- Verify the table was created
SELECT 
  'Work orders table created successfully!' as message,
  COUNT(*) as total_work_orders,
  COUNT(DISTINCT service_location_id) as locations_with_orders
FROM work_orders;