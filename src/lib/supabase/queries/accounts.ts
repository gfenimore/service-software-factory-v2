import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type Client = SupabaseClient<Database>
type Account = Database['public']['Tables']['accounts']['Row']
type AccountInsert = Database['public']['Tables']['accounts']['Insert']
type AccountUpdate = Database['public']['Tables']['accounts']['Update']

/**
 * Account-related queries for Supabase
 * These functions encapsulate database operations and provide type safety
 */

export const accountQueries = {
  /**
   * Get all active accounts
   */
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

  /**
   * Get account by ID
   */
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

  /**
   * Get accounts by type with pagination
   */
  getAccountsByType: async (
    supabase: Client,
    accountType: 'Residential' | 'Commercial',
    limit = 10,
    offset = 0
  ): Promise<{ accounts: Account[]; total: number }> => {
    // Get paginated accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_type', accountType)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (accountsError) {
      throw new Error(`Failed to fetch accounts by type: ${accountsError.message}`)
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('account_type', accountType)
      .is('deleted_at', null)

    if (countError) {
      throw new Error(`Failed to count accounts: ${countError.message}`)
    }

    return {
      accounts: accounts || [],
      total: count || 0
    }
  },

  /**
   * Search accounts by name
   */
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
      .order('account_name')
      .limit(limit)

    if (error) {
      throw new Error(`Failed to search accounts: ${error.message}`)
    }

    return data || []
  },

  /**
   * Get accounts with filters
   */
  getAccountsWithFilters: async (
    supabase: Client,
    filters: {
      status?: 'Active' | 'Inactive'
      accountType?: 'Residential' | 'Commercial'
      city?: string
      limit?: number
    } = {}
  ): Promise<Account[]> => {
    let query = supabase
      .from('accounts')
      .select('*')
      .is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.accountType) {
      query = query.eq('account_type', filters.accountType)
    }

    if (filters.city) {
      query = query.eq('billing_city', filters.city)
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(filters.limit || 50)

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch filtered accounts: ${error.message}`)
    }

    return data || []
  },

  /**
   * Create a new account
   */
  createAccount: async (
    supabase: Client,
    account: AccountInsert
  ): Promise<Account> => {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create account: ${error.message}`)
    }

    return data
  },

  /**
   * Update an account
   */
  updateAccount: async (
    supabase: Client,
    id: string,
    updates: AccountUpdate
  ): Promise<Account> => {
    const { data, error } = await supabase
      .from('accounts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update account: ${error.message}`)
    }

    return data
  },

  /**
   * Soft delete an account
   */
  deleteAccount: async (supabase: Client, id: string): Promise<void> => {
    const { error } = await supabase
      .from('accounts')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'Inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`)
    }
  },

  /**
   * Get account statistics
   */
  getAccountStats: async (supabase: Client) => {
    const { data, error } = await supabase
      .from('accounts')
      .select('status, account_type')
      .is('deleted_at', null)

    if (error) {
      throw new Error(`Failed to fetch account stats: ${error.message}`)
    }

    const stats = data || []
    
    return {
      total: stats.length,
      active: stats.filter(a => a.status === 'Active').length,
      inactive: stats.filter(a => a.status === 'Inactive').length,
      residential: stats.filter(a => a.account_type === 'Residential').length,
      commercial: stats.filter(a => a.account_type === 'Commercial').length
    }
  }
}
