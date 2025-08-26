import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Creates a server-side Supabase client with service role key
 *
 * SECURITY: This function now properly loads credentials from environment variables
 * as per security audit recommendations (CWE-798 remediation)
 *
 * WARNING: This should ONLY be used in server-side code (API routes, server components)
 * Never expose the service role key to client-side code!
 */
export function createServerClient() {
  // Load from environment variables - NEVER hardcode credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase server environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.'
    )
  }

  // Only log in development, never expose keys
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating server Supabase client with service role key...')
    console.log('URL:', supabaseUrl)
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    },
  })
}
