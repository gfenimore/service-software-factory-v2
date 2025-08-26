-- Migration: Create accounts table (prerequisite for contacts)
-- Purpose: Store account/company information

CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    billing_address_1 VARCHAR(255),
    billing_address_2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(50),
    billing_zip VARCHAR(20),
    billing_country VARCHAR(100) DEFAULT 'USA',
    service_address_1 VARCHAR(255),
    service_address_2 VARCHAR(255),
    service_city VARCHAR(100),
    service_state VARCHAR(50),
    service_zip VARCHAR(20),
    service_country VARCHAR(100) DEFAULT 'USA',
    account_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_accounts_account_number ON public.accounts(account_number);
CREATE INDEX idx_accounts_company_name ON public.accounts(company_name);
CREATE INDEX idx_accounts_status ON public.accounts(status);

-- RLS (Row Level Security) policies
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read accounts
CREATE POLICY "Allow authenticated read access" ON public.accounts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert accounts
CREATE POLICY "Allow authenticated insert access" ON public.accounts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update accounts
CREATE POLICY "Allow authenticated update access" ON public.accounts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample accounts that match our contact data
INSERT INTO public.accounts (
    account_number,
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    billing_address_1,
    billing_city,
    billing_state,
    billing_zip,
    service_address_1,
    service_city,
    service_state,
    service_zip,
    account_type,
    status
) VALUES 
    ('ACC-001234', 'Acme Corporation', 'John Smith', 'john.smith@acmecorp.com', '(555) 123-4567', 
     '123 Business Ave', 'New York', 'NY', '10001',
     '123 Business Ave', 'New York', 'NY', '10001',
     'Commercial', 'Active'),
    
    ('ACC-001235', 'Global Manufacturing Inc', 'Michael Brown', 'mbrown@globalmfg.com', '(555) 234-5678',
     '789 Factory Rd', 'Detroit', 'MI', '48201',
     '789 Factory Rd', 'Detroit', 'MI', '48201',
     'Industrial', 'Active'),
    
    ('ACC-001236', 'TechStart Solutions', 'Robert Wilson', 'rwilson@techstart.io', '(555) 345-6789',
     '321 Innovation Dr', 'San Francisco', 'CA', '94102',
     '321 Innovation Dr', 'San Francisco', 'CA', '94102',
     'Technology', 'Active'),
    
    ('ACC-001237', 'Retail Chain Corp', 'David Anderson', 'danderson@retailchain.com', '(555) 456-7890',
     '555 Retail Blvd', 'Chicago', 'IL', '60601',
     '555 Retail Blvd', 'Chicago', 'IL', '60601',
     'Retail', 'Active'),
    
    ('ACC-001238', 'Healthcare Systems', 'Jennifer Taylor', 'jtaylor@healthsys.org', '(555) 567-8901',
     '999 Healthcare Way', 'Boston', 'MA', '02108',
     '999 Healthcare Way', 'Boston', 'MA', '02108',
     'Healthcare', 'Active')
ON CONFLICT (account_number) DO NOTHING;