# Code Segment 3: Input Validation and SQL Injection Risk

## **File:** `src/lib/supabase/queries/accounts.ts` (Lines 96-115)

```typescript
searchAccountsByName: async (
  supabase: Client,
  searchTerm: string,
  limit = 10
): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .ilike('account_name', `%${searchTerm}%`)
    .is('deleted_at', null)
    .limit(limit)

  if (error) {
    throw new Error(`Failed to search accounts: ${error.message}`)
  }

  return data || []
},
```

## **File:** `src/app/api/accounts/[accountId]/contacts/route.ts` (Lines 77-88)

```typescript
const { accountId } = await params
const body = await request.json()

// Insert new contact
const { data: contact, error } = await supabase
  .from('contacts')
  .insert({
    account_id: accountId,
    ...body,
  })
  .select()
  .single()
```

## **File:** `src/lib/supabase/queries/accounts.ts` (Lines 120-157)

```typescript
getAccountsWithFilters: async (
  supabase: Client,
  filters: {
    status?: 'Active' | 'Inactive'
    accountType?: 'Residential' | 'Commercial'
    city?: string
    limit?: number
  } = {}
): Promise<Account[]> => {
  let query = supabase
    .from('accounts')
    .select('*')
    .is('deleted_at', null)

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.accountType) {
    query = query.eq('account_type', filters.accountType)
  }

  if (filters.city) {
    query = query.eq('billing_city', filters.city)
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(filters.limit || 50)

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch filtered accounts: ${error.message}`)
  }

  return data || []
},
```

## **Business Context:**

User input is directly used in database queries with minimal validation. The spread operator `...body` accepts any user input without sanitization or validation against expected schema.

## **Business Risk Level:**

🟡 **HIGH** - Potential for injection attacks and data corruption through unvalidated input
