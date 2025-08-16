/**
 * Account Service
 *
 * ARCHITECTURE: Service layer implementation for account operations
 * Decouples API routes from direct database access
 * As per audit recommendations for SOLID principles compliance
 */

import { BaseService, ServiceException } from './base.service'
import type { Database } from '@/lib/supabase/database.types'
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
  type PaginationParams,
} from '@/lib/validation/schemas'

type Account = Database['public']['Tables']['accounts']['Row']
type AccountInsert = Database['public']['Tables']['accounts']['Insert']
type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export interface AccountFilters {
  status?: 'Active' | 'Inactive' | 'Pending'
  account_type?: string
  search?: string
}

export interface AccountService {
  findAll(filters?: AccountFilters, pagination?: PaginationParams): Promise<Account[]>
  findById(id: string): Promise<Account | null>
  findActive(pagination?: PaginationParams): Promise<Account[]>
  create(data: CreateAccountInput): Promise<Account>
  update(id: string, data: UpdateAccountInput): Promise<Account>
  delete(id: string): Promise<void>
  count(filters?: AccountFilters): Promise<number>
}

/**
 * Concrete implementation of AccountService using Supabase
 */
export class SupabaseAccountService extends BaseService implements AccountService {
  /**
   * Find all accounts with optional filters and pagination
   */
  async findAll(
    filters: AccountFilters = {},
    pagination: PaginationParams = { page: 0, limit: 20 }
  ): Promise<Account[]> {
    try {
      this.log('Finding accounts', { filters, pagination })

      // Using select(*) for now - specific columns would require type modifications
      let query = this.supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.account_type) {
        query = query.eq('account_type', filters.account_type)
      }

      if (filters.search) {
        query = query.ilike('account_name', `%${filters.search}%`)
      }

      // Apply pagination
      const start = pagination.page * pagination.limit
      const end = start + pagination.limit - 1
      query = query.range(start, end)

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      this.handleError(error, 'findAll')
    }
  }

  /**
   * Find account by ID
   */
  async findById(id: string): Promise<Account | null> {
    try {
      this.log('Finding account by ID', { id })

      const { data, error } = await this.supabase.from('accounts').select('*').eq('id', id).single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw error
      }

      return data
    } catch (error) {
      this.handleError(error, 'findById')
    }
  }

  /**
   * Find only active accounts
   */
  async findActive(pagination: PaginationParams = { page: 0, limit: 20 }): Promise<Account[]> {
    return this.findAll({ status: 'Active' }, pagination)
  }

  /**
   * Create a new account
   */
  async create(data: CreateAccountInput): Promise<Account> {
    try {
      this.log('Creating account', { data })

      // Validate input
      const validated = createAccountSchema.parse(data)

      const { data: account, error } = await this.supabase
        .from('accounts')
        .insert(validated as AccountInsert)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!account) {
        throw new ServiceException('CREATE_FAILED', 'Failed to create account')
      }

      return account
    } catch (error) {
      this.handleError(error, 'create')
    }
  }

  /**
   * Update an existing account
   */
  async update(id: string, data: UpdateAccountInput): Promise<Account> {
    try {
      this.log('Updating account', { id, data })

      // Validate input
      const validated = updateAccountSchema.parse(data)

      const { data: account, error } = await this.supabase
        .from('accounts')
        .update(validated as AccountUpdate)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!account) {
        throw new ServiceException('NOT_FOUND', 'Account not found')
      }

      return account
    } catch (error) {
      this.handleError(error, 'update')
    }
  }

  /**
   * Soft delete an account
   */
  async delete(id: string): Promise<void> {
    try {
      this.log('Deleting account', { id })

      const { error } = await this.supabase
        .from('accounts')
        .update({
          status: 'Inactive',
          deleted_at: new Date().toISOString(),
        } as AccountUpdate)
        .eq('id', id)

      if (error) {
        throw error
      }
    } catch (error) {
      this.handleError(error, 'delete')
    }
  }

  /**
   * Count accounts with optional filters
   */
  async count(filters: AccountFilters = {}): Promise<number> {
    try {
      this.log('Counting accounts', { filters })

      let query = this.supabase.from('accounts').select('*', { count: 'exact', head: true })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.account_type) {
        query = query.eq('account_type', filters.account_type)
      }

      const { count, error } = await query

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'count')
    }
  }
}
