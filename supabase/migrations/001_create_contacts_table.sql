-- Migration: Create contacts table for US-005
-- Purpose: Store contact information for accounts

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    is_billing BOOLEAN DEFAULT false,
    is_technical BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_contacts_account_id ON public.contacts(account_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_is_primary ON public.contacts(is_primary) WHERE is_primary = true;

-- RLS (Row Level Security) policies
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read contacts
CREATE POLICY "Allow authenticated read access" ON public.contacts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert contacts
CREATE POLICY "Allow authenticated insert access" ON public.contacts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update contacts
CREATE POLICY "Allow authenticated update access" ON public.contacts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();