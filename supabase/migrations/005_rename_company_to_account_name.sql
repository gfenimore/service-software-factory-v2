-- Migration: Rename company_name to account_name
-- Purpose: Make column name more generic since accounts can be residential or commercial

-- Check if the column exists and rename it
DO $$ 
BEGIN
    -- Only rename if company_name exists and account_name doesn't
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'accounts' 
        AND column_name = 'company_name'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'accounts' 
        AND column_name = 'account_name'
    ) THEN
        ALTER TABLE public.accounts 
        RENAME COLUMN company_name TO account_name;
        
        -- Also update the index
        DROP INDEX IF EXISTS idx_accounts_company_name;
        CREATE INDEX idx_accounts_account_name ON public.accounts(account_name);
        
        RAISE NOTICE 'Column renamed from company_name to account_name';
    ELSE
        RAISE NOTICE 'Column already named correctly or does not exist';
    END IF;
END $$;