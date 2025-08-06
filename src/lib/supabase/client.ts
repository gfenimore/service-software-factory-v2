import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Creates a Supabase client for browser/client-side usage
 * This client is used in React components and API functions
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}