# DeepSeek Direct Prompt - Code Efficiency Analysis

**Copy the text below and paste directly into DeepSeek:**

---

You are DeepSeek Coder, a specialized code analysis engine. Analyze these database operation code segments for efficiency, performance, and optimization opportunities:

## CODE SEGMENT 1: Query Patterns

```typescript
// File: src/lib/supabase/queries/accounts.ts
export const accountQueries = {
  getActiveAccounts: async (supabase: Client): Promise<Account[]> => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*') // Selecting all columns
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
      .ilike('account_name', `%${searchTerm}%`) // Full text search without indexes
      .is('deleted_at', null)
      .limit(limit)

    if (error) {
      throw new Error(`Failed to search accounts: ${error.message}`)
    }
    return data || []
  },
}
```

## CODE SEGMENT 2: API Performance

```typescript
// File: src/app/api/accounts/route.ts
export async function GET() {
  try {
    // Creating new client connection for each request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Fetch all accounts without pagination
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
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
```

## CODE SEGMENT 3: Resource Management

```typescript
// File: src/app/api/accounts/[accountId]/contacts/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    // Duplicate client creation pattern
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { accountId } = await params
    const body = await request.json() // No validation or size limits

    // Direct insert without batching or transaction
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        account_id: accountId,
        ...body, // Spread all user input without filtering
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
```

**ANALYZE FOR:**

1. **ALGORITHMIC EFFICIENCY**
   - Time/Space Complexity of operations
   - Database query optimization opportunities
   - Data structure usage appropriateness

2. **PERFORMANCE BOTTLENECKS**
   - Connection management issues
   - Query performance problems
   - Resource usage inefficiencies

3. **TYPESCRIPT BEST PRACTICES**
   - Language-specific optimizations
   - Error handling patterns
   - Type safety improvements

4. **OPTIMIZATION OPPORTUNITIES**
   - Caching strategies
   - Query optimization
   - Resource pooling
   - Batch operations

## CODE SEGMENT 4: Automated Code Generation (CRITICAL)

```typescript
// File: .sdlc/01-core/BUSM-DEVELOPMENT-PROCESS.md - API Development Phase
### 4. API Development Phase
- [ ] Create server-side API routes
- [ ] Use service role key for full access  // SAME SECURITY ISSUE!
- [ ] Implement proper error handling
- [ ] Add request validation

// File: .sdlc/scripts/run-processor-pipeline.sh - API Processor
case $PROCESSOR in
    "API-PROCESSOR")
        log "Adding API integration"
        $CLAUDE_PATH -p "You are API-PROCESSOR. Add Supabase integration to $TARGET based on $INPUT" \
            --allowedTools "Read" "Write" "Edit"
        ;;
```

**CRITICAL ANALYSIS NEEDED:**

- Does the code generation system create the same security/architecture flaws we found in manual code?
- Are processors generating hardcoded credentials, unvalidated input, tight coupling?
- Is the automation system the SOURCE of the problems we identified?

**PROVIDE SPECIFIC OUTPUT:**

- EFFICIENCY_GRADE: [A+/A/B/C/D/F]
- ALGORITHM_ANALYSIS: [Detailed complexity breakdown]
- PERFORMANCE_BOTTLENECKS: [Specific slow operations]
- OPTIMIZATION_OPPORTUNITIES: [Concrete improvements]
- REFACTORING_SUGGESTIONS: [Step-by-step fixes]
- BEST_PRACTICE_VIOLATIONS: [TypeScript/Node.js issues]
- CODE_GENERATION_RISKS: [Issues with automated processors creating flawed patterns]
