-- Quick script to verify service_locations data
-- Run this in Supabase SQL Editor to check if you have data

-- Check if table exists and has data
SELECT COUNT(*) as total_locations FROM service_locations;

-- Show first 5 locations with account names
SELECT 
  sl.id,
  sl.location_name,
  sl.city,
  sl.state,
  sl.is_primary,
  sl.status,
  a.account_name,
  a.id as account_id
FROM service_locations sl
JOIN accounts a ON sl.account_id = a.id
LIMIT 5;

-- If no data, run this to add test locations for all accounts:
/*
INSERT INTO service_locations (account_id, location_name, street_address, city, state, postal_code, is_primary, status)
SELECT 
  id,
  'Main Office',
  '123 Main St',
  'Springfield',
  'IL', 
  '62701',
  true,
  'Active'
FROM accounts
WHERE NOT EXISTS (
  SELECT 1 FROM service_locations WHERE account_id = accounts.id
)
LIMIT 10;
*/