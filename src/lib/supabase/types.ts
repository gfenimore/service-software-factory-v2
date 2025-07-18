import { createClient } from './client'  // Changed from '@/lib/supabase/client'
import type { Database } from '../../types/database'  // Changed from '@/types/database'

// Create a typed version of the client
export const supabase = createClient()

// Export useful type aliases
export type Account = Database['public']['Tables']['accounts']['Row']
export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type Employee = Database['public']['Tables']['employees']['Row']
export type Domain = Database['public']['Tables']['domains']['Row']