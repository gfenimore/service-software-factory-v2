# ⚡ DeepSeek Coder Analysis - Priority 1 Database Operations

## **PROMPT FOR DEEPSEEK CODER:**

---

**SYSTEM_PROMPT:** You are DeepSeek Coder, a specialized code analysis engine focused on technical implementation quality, algorithmic efficiency, and programming best practices.

**ANALYSIS_TARGET:** Review these database operation code segments for efficiency, optimization opportunities, and implementation quality:

### **CODE_SEGMENT_1: Query Implementation Efficiency**

```typescript
// File: src/lib/supabase/queries/accounts.ts
export const accountQueries = {
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

### **CODE_SEGMENT_2: API Performance Patterns**

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

### **CODE_SEGMENT_3: Client Connection Management**

```typescript
// File: src/lib/supabase/client-direct.ts
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

### **CODE_SEGMENT_4: Resource Management and Error Handling**

```typescript
// File: src/app/api/accounts/[accountId]/contacts/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
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

    const { accountId } = await params

    // Fetch contacts for the account
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('account_id', accountId)
      .order('last_name', { ascending: true })

    if (error) {
      console.error('Error fetching contacts:', error)
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }

    return NextResponse.json({ contacts: contacts || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    // ... similar client creation pattern ...

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

    if (error) {
      console.error('Error creating contact:', error)
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
```

**TECHNICAL_EVALUATION_MATRIX:**

1. **ALGORITHMIC EFFICIENCY**
   - Time Complexity: O(?)
   - Space Complexity: O(?)
   - Algorithm appropriateness for use case
   - Data structure optimization opportunities

2. **CODE IMPLEMENTATION QUALITY**
   - Variable naming and clarity
   - Function decomposition appropriateness
   - Control flow optimization
   - Edge case handling completeness

3. **LANGUAGE-SPECIFIC BEST PRACTICES**
   - TypeScript/JavaScript idiom usage
   - Standard library utilization
   - Memory management patterns
   - Async/await optimization

4. **TESTABILITY AND DEBUGGING**
   - Unit test feasibility
   - Debugging complexity
   - Logging implementation quality
   - Error propagation clarity

5. **PERFORMANCE OPTIMIZATION**
   - Database query efficiency
   - Connection pooling and management
   - Caching opportunities
   - Resource cleanup patterns

**REQUIRED_OUTPUT:**

- EFFICIENCY_GRADE: [A+/A/B/C/D/F]
- ALGORITHM_ANALYSIS: [Detailed complexity breakdown]
- OPTIMIZATION_OPPORTUNITIES: [Specific code improvements]
- REFACTORING_SUGGESTIONS: [Step-by-step improvements]
- BEST_PRACTICE_VIOLATIONS: [TypeScript/Node.js specific issues]
- PERFORMANCE_BOTTLENECKS: [Database and API performance issues]

---

## **SAVE THE COMPLETE RESPONSE TO:**

`code_quality_audits/01_Current_Audit/Code_Quality_Metrics/deepseek-db-efficiency.md`
