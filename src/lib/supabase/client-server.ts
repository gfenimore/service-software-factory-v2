import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Server-side client using the sb_secret key
// This should only be used in server-side code (API routes, server components)
const SUPABASE_URL = 'https://gketbzzsevhgxhnlcjzu.supabase.co'
const SUPABASE_SECRET_KEY = 'sb_secret_uhdqxf2WbtxgzqHOYkFWAw_LwBYWRlp'

export function createServerClient() {
  console.log('Creating server Supabase client with sb_secret key...')
  
  return createSupabaseClient<Database>(
    SUPABASE_URL, 
    SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`
        }
      }
    }
  )
}