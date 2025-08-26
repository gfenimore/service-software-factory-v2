-- QUICK FIX: Add account_name as an alias without breaking existing column
-- Run this if you can't rename the column right now

-- Option 1: Create a generated column (if your Postgres version supports it)
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS account_name VARCHAR(255) 
GENERATED ALWAYS AS (company_name) STORED;

-- Option 2: If generated columns aren't supported, create a view
-- DROP VIEW IF EXISTS accounts_view;
-- CREATE VIEW accounts_view AS
-- SELECT 
--     *,
--     company_name AS account_name
-- FROM public.accounts;

-- Option 3: Just update your existing data to have both columns
-- ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS account_name VARCHAR(255);
-- UPDATE public.accounts SET account_name = company_name WHERE account_name IS NULL;