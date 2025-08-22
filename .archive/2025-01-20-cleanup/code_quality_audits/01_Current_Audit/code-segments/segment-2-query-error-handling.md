# Code Segment 2: Database Query Error Handling Patterns

## **File:** `src/lib/supabase/queries/accounts.ts` (Lines 18-53)

```typescript
/**
 * Get all active accounts
 */
getActiveAccounts: async (supabase: Client): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('status', 'Active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch active accounts: ${error.message}`)
  }

  return data || []
},

/**
 * Get account by ID
 */
getAccountById: async (supabase: Client, id: string): Promise<Account | null> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch account: ${error.message}`)
  }

  return data
},
```

## **File:** `src/app/api/accounts/route.ts` (Lines 24-38)

```typescript
// Fetch all accounts ordered by account_name
const { data: accounts, error } = await supabase
  .from('accounts')
  .select('*')
  .order('account_name', { ascending: true })

if (error) {
  console.error('Error fetching accounts:', error)
  return NextResponse.json(
    { error: 'Failed to fetch accounts', details: error.message },
    { status: 500 }
  )
}

return NextResponse.json({ accounts: accounts || [] })
```

## **File:** `src/app/api/accounts/[accountId]/contacts/route.ts` (Lines 80-98)

```typescript
// Insert new contact
const { data: contact, error } = await supabase
  .from('contacts')
  .insert({
    account_id: accountId,
    ...body,
  })
  .select()
  .single()

if (error) {
  console.error('Error creating contact:', error)
  return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
}

return NextResponse.json({ contact })
```

## **Business Context:**

Multiple different error handling patterns across database operations - some throw errors, some return null, some return HTTP responses. Inconsistent validation and security controls.

## **Business Risk Level:**

🟡 **HIGH** - Inconsistent error handling could lead to security gaps and poor user experience
