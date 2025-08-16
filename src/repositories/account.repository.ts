/**
 * Account Repository
 *
 * ARCHITECTURE: Repository pattern implementation for accounts
 * Provides data access abstraction independent of database technology
 * As per audit recommendations for testability and maintainability
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository, QueryOptions } from './base.repository'
import type { Database } from '@/lib/supabase/database.types'

type Account = Database['public']['Tables']['accounts']['Row']
type AccountInsert = Database['public']['Tables']['accounts']['Insert']
type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export interface AccountRepository extends BaseRepository<Account, AccountInsert, AccountUpdate> {
  findByStatus(status: string): Promise<Account[]>
  findByType(type: string): Promise<Account[]>
  search(term: string): Promise<Account[]>
}

/**
 * Supabase implementation of AccountRepository
 */
export class SupabaseAccountRepository
  extends BaseRepository<Account, AccountInsert, AccountUpdate>
  implements AccountRepository
{
  protected tableName = 'accounts'
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    super()
    this.supabase = supabase
  }

  /**
   * Find all accounts
   */
  async findAll(options: QueryOptions = {}): Promise<Account[]> {
    this.log('findAll', options)

    let query = this.supabase.from(this.tableName).select('*')

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.orderDirection === 'asc',
      })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    if (options.limit) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Find account by ID
   */
  async findById(id: string): Promise<Account | null> {
    this.log('findById', { id })

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  /**
   * Find one account matching conditions
   */
  async findOne(conditions: Partial<Account>): Promise<Account | null> {
    this.log('findOne', conditions)

    let query = this.supabase.from(this.tableName).select('*')

    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query.limit(1).single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  /**
   * Find many accounts matching conditions
   */
  async findMany(conditions: Partial<Account>, options: QueryOptions = {}): Promise<Account[]> {
    this.log('findMany', { conditions, options })

    let query = this.supabase.from(this.tableName).select('*')

    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.orderDirection === 'asc',
      })
    }

    // Apply pagination
    if (options.limit) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Create a new account
   */
  async create(data: AccountInsert): Promise<Account> {
    this.log('create', data)

    const { data: account, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    if (!account) throw new Error('Failed to create account')

    return account
  }

  /**
   * Update an account
   */
  async update(id: string, data: AccountUpdate): Promise<Account> {
    this.log('update', { id, data })

    const { data: account, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!account) throw new Error('Account not found')

    return account
  }

  /**
   * Delete an account (soft delete)
   */
  async delete(id: string): Promise<void> {
    this.log('delete', { id })

    const { error } = await this.supabase
      .from(this.tableName)
      .update({
        status: 'Inactive',
        deleted_at: new Date().toISOString(),
      } as AccountUpdate)
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Count accounts matching conditions
   */
  async count(conditions: Partial<Account> = {}): Promise<number> {
    this.log('count', conditions)

    let query = this.supabase.from(this.tableName).select('*', { count: 'exact', head: true })

    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { count, error } = await query

    if (error) throw error
    return count || 0
  }

  /**
   * Find accounts by status
   */
  async findByStatus(status: string): Promise<Account[]> {
    return this.findMany({ status } as Partial<Account>)
  }

  /**
   * Find accounts by type
   */
  async findByType(type: string): Promise<Account[]> {
    return this.findMany({ account_type: type } as Partial<Account>)
  }

  /**
   * Search accounts by name
   */
  async search(term: string): Promise<Account[]> {
    this.log('search', { term })

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .ilike('account_name', `%${term}%`)
      .order('account_name')

    if (error) throw error
    return data || []
  }
}
