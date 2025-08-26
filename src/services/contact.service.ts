/**
 * Contact Service
 *
 * ARCHITECTURE: Service layer implementation for contact operations
 * Provides business logic abstraction over database operations
 * As per audit recommendations for separation of concerns
 */

import { BaseService, ServiceException } from './base.service'
import type { Database } from '@/lib/supabase/database.types'
import {
  createContactSchema,
  updateContactSchema,
  type CreateContactInput,
  type UpdateContactInput,
  type PaginationParams,
} from '@/lib/validation/schemas'

type Contact = Database['public']['Tables']['contacts']['Row']
type ContactInsert = Database['public']['Tables']['contacts']['Insert']
type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export interface ContactFilters {
  account_id?: string
  is_primary_contact?: boolean
  communication_preference?: string
  search?: string
}

export interface ContactService {
  findAll(filters?: ContactFilters, pagination?: PaginationParams): Promise<Contact[]>
  findById(id: string): Promise<Contact | null>
  findByAccountId(accountId: string, pagination?: PaginationParams): Promise<Contact[]>
  create(accountId: string, data: CreateContactInput): Promise<Contact>
  update(id: string, data: UpdateContactInput): Promise<Contact>
  delete(id: string): Promise<void>
  setPrimaryContact(accountId: string, contactId: string): Promise<void>
}

/**
 * Concrete implementation of ContactService using Supabase
 */
export class SupabaseContactService extends BaseService implements ContactService {
  /**
   * Find all contacts with optional filters and pagination
   */
  async findAll(
    filters: ContactFilters = {},
    pagination: PaginationParams = { page: 0, limit: 20 }
  ): Promise<Contact[]> {
    try {
      this.log('Finding contacts', { filters, pagination })

      // Using select(*) for now - specific columns would require type modifications
      let query = this.supabase
        .from('contacts')
        .select('*')
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      // Apply filters
      if (filters.account_id) {
        query = query.eq('account_id', filters.account_id)
      }

      if (filters.is_primary_contact !== undefined) {
        query = query.eq('is_primary_contact', filters.is_primary_contact)
      }

      if (filters.communication_preference) {
        query = query.eq('communication_preference', filters.communication_preference)
      }

      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email_address.ilike.%${filters.search}%`
        )
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
   * Find contact by ID
   */
  async findById(id: string): Promise<Contact | null> {
    try {
      this.log('Finding contact by ID', { id })

      const { data, error } = await this.supabase.from('contacts').select('*').eq('id', id).single()

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
   * Find all contacts for a specific account
   */
  async findByAccountId(
    accountId: string,
    pagination: PaginationParams = { page: 0, limit: 20 }
  ): Promise<Contact[]> {
    return this.findAll({ account_id: accountId }, pagination)
  }

  /**
   * Create a new contact for an account
   */
  async create(accountId: string, data: CreateContactInput): Promise<Contact> {
    try {
      this.log('Creating contact', { accountId, data })

      // Validate input
      const validated = createContactSchema.parse(data)

      // If this is marked as primary, unset other primary contacts
      if (validated.is_primary_contact) {
        await this.clearPrimaryContacts(accountId)
      }

      const insertData: ContactInsert = {
        ...validated,
        account_id: accountId,
      }

      const { data: contact, error } = await this.supabase
        .from('contacts')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!contact) {
        throw new ServiceException('CREATE_FAILED', 'Failed to create contact')
      }

      return contact
    } catch (error) {
      this.handleError(error, 'create')
    }
  }

  /**
   * Update an existing contact
   */
  async update(id: string, data: UpdateContactInput): Promise<Contact> {
    try {
      this.log('Updating contact', { id, data })

      // Validate input
      const validated = updateContactSchema.parse(data)

      // If setting as primary, need to get account_id first
      if (validated.is_primary_contact) {
        const existing = await this.findById(id)
        if (existing) {
          await this.clearPrimaryContacts(existing.account_id)
        }
      }

      const { data: contact, error } = await this.supabase
        .from('contacts')
        .update(validated as ContactUpdate)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!contact) {
        throw new ServiceException('NOT_FOUND', 'Contact not found')
      }

      return contact
    } catch (error) {
      this.handleError(error, 'update')
    }
  }

  /**
   * Delete a contact
   */
  async delete(id: string): Promise<void> {
    try {
      this.log('Deleting contact', { id })

      const { error } = await this.supabase.from('contacts').delete().eq('id', id)

      if (error) {
        throw error
      }
    } catch (error) {
      this.handleError(error, 'delete')
    }
  }

  /**
   * Set a contact as the primary contact for an account
   */
  async setPrimaryContact(accountId: string, contactId: string): Promise<void> {
    try {
      this.log('Setting primary contact', { accountId, contactId })

      // Clear existing primary contacts
      await this.clearPrimaryContacts(accountId)

      // Set new primary contact
      const { error } = await this.supabase
        .from('contacts')
        .update({ is_primary_contact: true } as ContactUpdate)
        .eq('id', contactId)
        .eq('account_id', accountId)

      if (error) {
        throw error
      }
    } catch (error) {
      this.handleError(error, 'setPrimaryContact')
    }
  }

  /**
   * Clear all primary contact flags for an account
   */
  private async clearPrimaryContacts(accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from('contacts')
      .update({ is_primary_contact: false } as ContactUpdate)
      .eq('account_id', accountId)
      .eq('is_primary_contact', true)

    if (error) {
      throw error
    }
  }
}
