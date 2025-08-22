# 🔒 Claude Sonnet Security Analysis - Priority 1 Database Operations

## **PROMPT FOR CLAUDE SONNET:**

---

**CONTEXT:** You are conducting a security review of a Claude-generated codebase. As the original creator, you understand the intended security model but must identify where implementation may deviate from secure coding principles.

**TASK:** Analyze these code segments for security vulnerabilities:

### **CODE_SEGMENT_1: API Key Exposure Risk**

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

// Fallback to anon key if needed
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZXRienpzZXZoZ3hobmxjanp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTY0MDQsImV4cCI6MjA2ODE5MjQwNH0.Z5xUBHWouvUBj_DO2IBvCqFooi961x9L-DZudNYa0Ss'

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

### **CODE_SEGMENT_2: Database Query Error Handling**

```typescript
// File: src/lib/supabase/queries/accounts.ts
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

### **CODE_SEGMENT_3: Input Validation Risks**

```typescript
// File: src/lib/supabase/queries/accounts.ts
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

// File: src/app/api/accounts/[accountId]/contacts/route.ts
const { accountId } = await params
const body = await request.json()

// Insert new contact
const { data: contact, error } = await supabase
  .from('contacts')
  .insert({
    account_id: accountId,
    ...body
  })
  .select()
  .single()
```

**EVALUATION CRITERIA:**

1. Input validation and sanitization gaps (CWE-20, CWE-79, CWE-89)
2. Authentication/authorization bypass opportunities (CWE-306, CWE-284)
3. Hard-coded credentials or sensitive data exposure (CWE-798, CWE-200)
4. Injection vulnerabilities (SQL, Command, LDAP) (CWE-89, CWE-78, CWE-90)
5. Improper error handling revealing system information (CWE-209)

**RESPONSE FORMAT:**

- VULNERABILITY_FOUND: [Yes/No]
- VULNERABILITY_TYPE: [CWE classification]
- SEVERITY: [Critical/High/Medium/Low]
- LOCATION: [Specific line numbers/functions]
- DESCRIPTION: [Technical explanation]
- REMEDIATION: [Specific fix recommendations]
- CONFIDENCE_LEVEL: [High/Medium/Low]

---

## **SAVE THE COMPLETE RESPONSE TO:**

`code_quality_audits/01_Current_Audit/Security_Analysis/claude-sonnet-db-security.md`
