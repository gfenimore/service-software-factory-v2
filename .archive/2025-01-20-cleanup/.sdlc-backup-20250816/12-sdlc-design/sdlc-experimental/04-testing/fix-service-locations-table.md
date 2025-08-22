# Fix for Service Locations Table Error

## Problem

The error "relation 'public.service_locations' does not exist" means the table hasn't been created in your Supabase database yet.

## Solution Options

### Option 1: Use Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL from: `supabase/migrations/20250114_create_service_locations.sql`
4. Click "Run" to execute the migration
5. Refresh the test page

### Option 2: Use Supabase CLI

Run one of these commands from the project root:

**PowerShell (Windows):**

```powershell
.\scripts\apply-service-locations-migration.ps1
```

**Bash (Git Bash/WSL):**

```bash
./scripts/apply-service-locations-migration.sh
```

### Option 3: Manual SQL Execution

If you prefer to run the SQL directly, here's the minimal version:

```sql
-- Create the service_locations table
CREATE TABLE IF NOT EXISTS public.service_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  location_name VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  access_information TEXT,
  is_primary BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_service_locations_account_id ON public.service_locations(account_id);

-- Enable RLS
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy
CREATE POLICY "Enable read access for all users" ON public.service_locations
  FOR SELECT USING (true);
```

## Verification

After creating the table, reload: http://localhost:3000/test/us-006-integrated

The error should be gone and you should see:

- "No service locations found" message when an account is selected (since the table is empty)
- Or test data if you included the INSERT statements

## Adding Test Data

To add some test locations, run this after creating the table:

```sql
-- Add test locations for existing accounts
INSERT INTO public.service_locations (account_id, location_name, street_address, city, state, postal_code, is_primary)
SELECT
  id,
  'Main Office',
  '123 Main St',
  'Springfield',
  'IL',
  '62701',
  true
FROM public.accounts
LIMIT 3;
```
