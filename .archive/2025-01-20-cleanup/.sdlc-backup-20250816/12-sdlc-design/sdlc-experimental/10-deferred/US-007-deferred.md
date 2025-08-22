# US-007 Deferred Tasks

**Story**: Work Orders for Selected Service Location  
**Created**: January 16, 2025  
**Purpose**: Track deferred tasks that need completion before production

---

## Deferred Task: T-001 - Create work_orders Database Table

### Status

**Current**: DEFERRED  
**Required By**: Before Stage 7 (Integration) or Stage 8 (Deployment)  
**Blocker For**: Production deployment

### Task Details

Create the work_orders table in Supabase with proper schema, constraints, and indexes.

### SQL Migration Required

```sql
-- Migration: create_work_orders_table.sql
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

-- Indexes for performance
CREATE INDEX idx_work_orders_location ON work_orders(service_location_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_scheduled ON work_orders(scheduled_date);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);

-- RLS Policies (if needed)
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Sample data (optional)
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
  (ARRAY['Maintenance', 'Repair', 'Installation', 'Inspection'])[1 + FLOOR(RANDOM() * 4)],
  (ARRAY['Scheduled', 'Assigned', 'In-Progress', 'Completed'])[1 + FLOOR(RANDOM() * 4)],
  (ARRAY['Low', 'Medium', 'High', 'Emergency'])[1 + FLOOR(RANDOM() * 4)],
  CURRENT_DATE + (FLOOR(RANDOM() * 30) || ' days')::INTERVAL,
  CASE WHEN RANDOM() > 0.5 THEN 'Morning (8AM-12PM)' ELSE 'Afternoon (12PM-5PM)' END,
  CASE WHEN RANDOM() > 0.3 THEN 'Tech ' || FLOOR(RANDOM() * 10 + 1)::TEXT ELSE NULL END,
  'Sample work order for testing'
FROM service_locations sl
LIMIT 50;
```

### Current Workaround

Using mock data generator at `src/lib/mock/workOrderMocks.ts` which provides:

- 15 sample work orders per location
- All status types represented
- Various priorities and types
- Realistic scheduling patterns

### Completion Checklist

- [ ] Run migration script in Supabase
- [ ] Verify table creation
- [ ] Load sample data (optional)
- [ ] Update useWorkOrders hook to use real data
- [ ] Remove mock data generator
- [ ] Test with production data
- [ ] Update TypeScript types if schema changes

### Notes

- Mock data allows full UI development without database
- Schema is designed to match TypeScript interfaces exactly
- Foreign key to service_locations ensures referential integrity
- Indexes optimize common query patterns

---

## Tracking Method

This deferred task will be:

1. Developed with mock data through Stages 3-6
2. Executed during Stage 6 (Developer) or Stage 7 (Integration)
3. Verified before Stage 8 (Deployment)

The system will work fully in development with mock data, then seamlessly switch to real data once the table is created.
