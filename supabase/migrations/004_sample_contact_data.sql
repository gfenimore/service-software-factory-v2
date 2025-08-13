-- Migration: Insert sample contact data for testing
-- Purpose: Provide test data for ContactDetailsModal integration

-- Sample contacts for various accounts
INSERT INTO public.contacts (
    account_id,
    first_name,
    last_name,
    title,
    email,
    phone,
    mobile,
    is_primary,
    is_billing,
    is_technical,
    notes
) VALUES 
    -- Contacts for account ACC-001234
    (
        'ACC-001234',
        'John',
        'Smith',
        'Operations Manager',
        'john.smith@acmecorp.com',
        '(555) 123-4567',
        '(555) 987-6543',
        true,
        true,
        false,
        'Primary contact for all operational matters. Prefers email communication.'
    ),
    (
        'ACC-001234',
        'Sarah',
        'Johnson',
        'Technical Lead',
        'sarah.johnson@acmecorp.com',
        '(555) 123-4568',
        '(555) 987-6544',
        false,
        false,
        true,
        'Technical escalation contact. Available M-F 9-5 EST.'
    ),
    
    -- Contacts for account ACC-001235
    (
        'ACC-001235',
        'Michael',
        'Brown',
        'Facilities Director',
        'mbrown@globalmfg.com',
        '(555) 234-5678',
        '(555) 876-5432',
        true,
        false,
        false,
        'Decision maker for all service contracts.'
    ),
    (
        'ACC-001235',
        'Lisa',
        'Davis',
        'Accounts Payable',
        'lisa.davis@globalmfg.com',
        '(555) 234-5679',
        null,
        false,
        true,
        false,
        'All invoices should be sent to this contact.'
    ),
    
    -- Contacts for account ACC-001236
    (
        'ACC-001236',
        'Robert',
        'Wilson',
        'CEO',
        'rwilson@techstart.io',
        '(555) 345-6789',
        '(555) 765-4321',
        true,
        true,
        false,
        'Executive sponsor. Include in quarterly reviews.'
    ),
    (
        'ACC-001236',
        'Emily',
        'Martinez',
        'IT Manager',
        'emily.martinez@techstart.io',
        '(555) 345-6790',
        '(555) 765-4322',
        false,
        false,
        true,
        'Primary technical contact. Expert in network infrastructure.'
    ),
    
    -- Contacts for account ACC-001237
    (
        'ACC-001237',
        'David',
        'Anderson',
        'Property Manager',
        'danderson@retailchain.com',
        '(555) 456-7890',
        null,
        true,
        true,
        true,
        'Single point of contact for all matters.'
    ),
    
    -- Contacts for account ACC-001238
    (
        'ACC-001238',
        'Jennifer',
        'Taylor',
        'Regional Manager',
        'jtaylor@healthsys.org',
        '(555) 567-8901',
        '(555) 654-3210',
        true,
        false,
        false,
        'Manages multiple locations. Requires 24hr notice for meetings.'
    ),
    (
        'ACC-001238',
        'Mark',
        'Thompson',
        'Maintenance Supervisor',
        'mark.thompson@healthsys.org',
        '(555) 567-8902',
        '(555) 654-3211',
        false,
        false,
        true,
        'On-site contact for service delivery.'
    ),
    (
        'ACC-001238',
        'Nancy',
        'White',
        'Finance Director',
        'nwhite@healthsys.org',
        '(555) 567-8903',
        null,
        false,
        true,
        false,
        'Approves all purchases over $10,000.'
    );

-- Add sample service locations
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
    ('ACC-001238', 'Medical Center', '999 Healthcare Way', 'Boston', 'MA', '02108', true, true, 'Visitor parking in Lot B', 'active');

-- Add sample work orders
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
) VALUES
    (
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
    ),
    (
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
    );