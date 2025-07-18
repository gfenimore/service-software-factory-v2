# Phase 1 Migration: Core Tables
**Filename**: `/docs/database/migrations/001-phase1-core.sql`
**Version**: 1.0
**Generated From**: BUSM-02-current.mmd
**Date**: 2025-01-17

```sql
-- =============================================
-- Migration: 001-phase1-core
-- Description: Create core tables for BUSM v2
-- Author: Team
-- Date: 2025-01-17
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ACCOUNT table
-- =============================================
CREATE TABLE accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_name TEXT NOT NULL,
    account_type TEXT,
    billing_street_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_zip_code TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger for accounts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE
    ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CONTACT table
-- =============================================
CREATE TABLE contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    email_address TEXT,
    is_primary_contact BOOLEAN DEFAULT false,
    communication_preference TEXT CHECK (communication_preference IN ('Voice', 'Text', 'Email')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure only one primary contact per account
CREATE UNIQUE INDEX idx_one_primary_per_account 
    ON contacts(account_id) 
    WHERE is_primary_contact = true;

-- Create updated_at trigger for contacts
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE
    ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- EMPLOYEE table
-- =============================================
CREATE TABLE employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    employee_type TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger for employees
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE
    ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DOMAIN table
-- =============================================
CREATE TABLE domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger for domains
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE
    ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default domains
INSERT INTO domains (name, description) VALUES
    ('Boat', 'Marine services and maintenance'),
    ('Pest Control', 'Pest control and extermination services');

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_account_type ON accounts(account_type);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_contacts_is_primary ON contacts(is_primary_contact);

-- =============================================
-- Comments for documentation
-- =============================================
COMMENT ON TABLE accounts IS 'Core customer/business accounts';
COMMENT ON TABLE contacts IS 'Contact persons for accounts';
COMMENT ON TABLE employees IS 'Company employees/technicians';
COMMENT ON TABLE domains IS 'Business/industry domains (boat, pool, lawn)';

COMMENT ON COLUMN accounts.account_type IS 'Segmentation/category for the account';
COMMENT ON COLUMN contacts.is_primary_contact IS 'Only one primary contact allowed per account';
COMMENT ON COLUMN contacts.communication_preference IS 'Preferred method of communication';
```

## Key Changes from Original ERD

Based on your updated BUSM 02, I've:
1. Used UUID for all primary keys (better for distributed systems)
2. Made all table names plural (PostgreSQL convention)
3. Used snake_case for all column names (SQL convention)
4. Added automatic updated_at triggers
5. Added indexes for common queries
6. Added table/column comments for documentation

## Next Steps

1. Save this as `/docs/database/migrations/001-phase1-core.sql`
2. Also save your current ERD as `/docs/database/erd/BUSM-02-current.mmd`
3. Run this migration in Supabase
4. Generate TypeScript types
5. Test the health check!

Ready to apply this migration?