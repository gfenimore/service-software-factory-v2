# Code Segment 1: API Key Exposure Risk

## **File:** `src/lib/supabase/client-direct.ts`

```typescript
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

## **Business Context:**

This file contains hardcoded Supabase API keys that provide direct database access. These keys are currently exposed in the client-side code bundle.

## **Business Risk Level:**

🔴 **CRITICAL** - Exposed API keys could lead to unauthorized database access
