import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Creates a direct Supabase client for debugging/testing purposes
 *
 * SECURITY: This function now properly loads credentials from environment variables
 * as per security audit recommendations (CWE-798 remediation)
 *
 * @deprecated Use createClient() from './client' for production code
 */
export function createDirectClient(useServiceRole = false) {
  // Load from environment variables - NEVER hardcode credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
    )
  }

  // Log for debugging (without exposing sensitive data)
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating direct Supabase client...')
    console.log('URL:', supabaseUrl)
    console.log('Key type: anon (public)')
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        apikey: supabaseAnonKey,
      },
    },
  })
}
