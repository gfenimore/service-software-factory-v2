-- Add test service locations data
-- Run this AFTER creating the service_locations table
-- This script adds sample locations for testing

-- First, let's check if we have any accounts to work with
DO $$
DECLARE
  account_ids UUID[];
  account_id UUID;
BEGIN
  -- Get up to 5 account IDs
  SELECT ARRAY_AGG(id) INTO account_ids
  FROM (SELECT id FROM public.accounts LIMIT 5) AS a;
  
  -- If we have accounts, create test locations
  IF array_length(account_ids, 1) > 0 THEN
    -- Add primary locations
    FOREACH account_id IN ARRAY account_ids[1:3]
    LOOP
      INSERT INTO public.service_locations (
        account_id, 
        location_name, 
        street_address, 
        city, 
        state, 
        postal_code, 
        access_information, 
        is_primary, 
        status
      ) VALUES (
        account_id,
        'Main Office',
        '123 Main Street',
        'Springfield',
        'IL',
        '62701',
        'Use main entrance during business hours. Check in at reception.',
        true,
        'Active'
      );
    END LOOP;
    
    -- Add secondary locations for first 2 accounts
    FOREACH account_id IN ARRAY account_ids[1:2]
    LOOP
      INSERT INTO public.service_locations (
        account_id, 
        location_name, 
        street_address, 
        city, 
        state, 
        postal_code, 
        access_information, 
        is_primary, 
        status
      ) VALUES (
        account_id,
        'Warehouse',
        '456 Industrial Blvd',
        'Springfield',
        'IL',
        '62702',
        'Gate code: 1234. Delivery hours: 7am-3pm weekdays only.',
        false,
        'Active'
      );
    END LOOP;
    
    -- Add a third location for the first account
    IF array_length(account_ids, 1) >= 1 THEN
      INSERT INTO public.service_locations (
        account_id, 
        location_name, 
        street_address, 
        city, 
        state, 
        postal_code, 
        access_information, 
        is_primary, 
        status
      ) VALUES (
        account_ids[1],
        'Remote Office',
        '789 Business Park Dr',
        'Chicago',
        'IL',
        '60601',
        NULL,
        false,
        'Active'
      );
    END IF;
    
    RAISE NOTICE 'Test service locations added successfully';
  ELSE
    RAISE NOTICE 'No accounts found. Please create accounts first before adding service locations.';
  END IF;
END $$;

-- Verify the data was inserted
SELECT 
  sl.location_name,
  sl.city,
  sl.state,
  sl.is_primary,
  sl.status,
  a.account_name
FROM public.service_locations sl
LEFT JOIN public.accounts a ON sl.account_id = a.id
ORDER BY a.account_name, sl.is_primary DESC, sl.location_name;