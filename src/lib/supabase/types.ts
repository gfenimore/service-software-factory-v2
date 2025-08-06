// This file contains the TypeScript types for your Supabase database
// In a full implementation, this would be generated from your database schema
// For now, we'll create a minimal version

export type Database = {
    public: {
      Tables: {
        accounts: {
          Row: {
            id: string
            account_name: string
            status: 'Active' | 'Inactive'
            account_type: 'Residential' | 'Commercial'
            billing_city: string | null
            deleted_at: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            account_name: string
            status?: 'Active' | 'Inactive'
            account_type?: 'Residential' | 'Commercial'
            billing_city?: string | null
            deleted_at?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            account_name?: string
            status?: 'Active' | 'Inactive'
            account_type?: 'Residential' | 'Commercial'
            billing_city?: string | null
            deleted_at?: string | null
            created_at?: string
            updated_at?: string
          }
        }
      }
    }
  }