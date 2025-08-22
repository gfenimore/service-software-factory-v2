# 🏛️ GPT-4o Architecture Analysis - Priority 1 Database Operations

## **PROMPT FOR GPT-4o:**

---

**ROLE:** Senior Software Architect and Code Quality Analyst

**TASK:** Conduct comprehensive architectural review of this code segment:

### **CODE_SEGMENT_1: Database Client Configuration Architecture**

```typescript
// File: src/lib/supabase/client-direct.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Temporary direct client for debugging
// These values are from your .env.local file
const SUPABASE_URL = 'https://gketbzzsevhgxhnlcjzu.supabase.co'

// Using SERVICE ROLE KEY for direct backend access (bypasses RLS)
// This key should NEVER be exposed in production client-side code!
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZXRienpzZXZoZ3hobmxjanp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjYxNjQwNCwiZXhwIjoyMDY4MTkyNDA0fQ.9UNV6nGJ6AMVX1l-hRqVT0K0rnzWhEUZ0S42CTgqbMU'

export function createDirectClient(useServiceRole = false) {
  // For client-side, we MUST use the anon key
  const key = SUPABASE_ANON_KEY
  console.log(`Creating direct Supabase client with ANON key...`)
  console.log('Key starts with:', key.substring(0, 20))

  return createSupabaseClient<Database>(SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        apikey: key,
      },
    },
  })
}
```

### **CODE_SEGMENT_2: Query Layer Architecture**

```typescript
// File: src/lib/supabase/queries/accounts.ts
export const accountQueries = {
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

  getAccountsWithFilters: async (
    supabase: Client,
    filters: {
      status?: 'Active' | 'Inactive'
      accountType?: 'Residential' | 'Commercial'
      city?: string
      limit?: number
    } = {}
  ): Promise<Account[]> => {
    let query = supabase.from('accounts').select('*').is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.accountType) {
      query = query.eq('account_type', filters.accountType)
    }

    if (filters.city) {
      query = query.eq('billing_city', filters.city)
    }

    query = query.order('created_at', { ascending: false }).limit(filters.limit || 50)

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch filtered accounts: ${error.message}`)
    }

    return data || []
  },
}
```

### **CODE_SEGMENT_3: API Layer Architecture**

```typescript
// File: src/app/api/accounts/route.ts
export async function GET() {
  try {
    // Use service role key on server for full access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

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
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
```

### **CODE_SEGMENT_4: Error Handling Architecture**

```typescript
// File: src/lib/errors/supabase-error-handler.ts
import { PostgrestError } from '@supabase/supabase-js'
import { DatabaseError, ValidationError, NotFoundError } from './custom-errors'

/**
 * Converts Supabase errors to our custom errors
 */
export function handleSupabaseError(error: PostgrestError): never {
  // Handle common Postgres error codes
  switch (error.code) {
    case '23505': // unique_violation
      throw new ValidationError('This record already exists', error.details)

    case '23503': // foreign_key_violation
      throw new ValidationError('Related record not found', error.details)

    case '23502': // not_null_violation
      throw new ValidationError('Required field is missing', error.details)

    case '22P02': // invalid_text_representation
      throw new ValidationError('Invalid data format', 'data')

    case 'PGRST116': // not found
      throw new NotFoundError()

    default:
      throw new DatabaseError(error.message || 'Database operation failed', error.code)
  }
}
```

**ANALYSIS FRAMEWORK:**

1. **SOLID Principles Compliance**
   - Single Responsibility Principle violations
   - Open/Closed Principle adherence
   - Liskov Substitution Principle issues
   - Interface Segregation problems
   - Dependency Inversion implementation

2. **Design Pattern Implementation**
   - Appropriate pattern usage
   - Anti-pattern identification
   - Coupling and cohesion analysis

3. **Architectural Consistency**
   - Layer separation violations
   - Cross-cutting concern handling
   - Dependency management

**OUTPUT REQUIREMENTS:**

- ARCHITECTURAL_GRADE: [A/B/C/D/F]
- SOLID_COMPLIANCE: [Detailed assessment for each principle]
- PATTERN_ANALYSIS: [Appropriate/inappropriate pattern usage]
- COUPLING_ASSESSMENT: [Tight/Loose coupling identification]
- IMPROVEMENT_ROADMAP: [Prioritized architectural improvements]

---

## **SAVE THE COMPLETE RESPONSE TO:**

`code_quality_audits/01_Current_Audit/Architecture_Assessment/gpt4o-db-architecture.md`
