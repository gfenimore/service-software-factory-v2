/**
 * Supabase Client Singleton
 *
 * PERFORMANCE: Implements singleton pattern for connection pooling
 * Prevents creating multiple clients and connection overhead
 * As per audit recommendations for performance optimization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Singleton instance holders
 */
let browserClient: SupabaseClient<Database> | null = null
let serverClient: SupabaseClient<Database> | null = null

/**
 * Get or create browser client (uses anon key)
 *
 * PERFORMANCE: Reuses single client instance per application lifecycle
 */
export function getBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
    }

    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('[Singleton] Browser client created')
    }
  }

  return browserClient
}

/**
 * Get or create server client (uses service role key)
 *
 * PERFORMANCE: Reuses single client instance for all server requests
 * SECURITY: Only for server-side use, never expose to client
 */
export function getServerClient(): SupabaseClient<Database> {
  if (!serverClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Determine service key or fall back to anon key for read-only operations
    let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      console.warn(
        '[Singleton] SUPABASE_SERVICE_ROLE_KEY not set, falling back to anon key for server client'
      )
      supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing Supabase server environment variables. Please check your .env.local file.'
      )
    }

    serverClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('[Singleton] Server client created')
    }
  }

  return serverClient
}

/**
 * Reset clients (useful for testing)
 */
export function resetClients(): void {
  browserClient = null
  serverClient = null

  if (process.env.NODE_ENV === 'development') {
    console.log('[Singleton] Clients reset')
  }
}

/**
 * Get appropriate client based on environment
 */
export function getSupabaseClient(isServer = false): SupabaseClient<Database> {
  return isServer ? getServerClient() : getBrowserClient()
}
