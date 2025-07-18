// src/app/api/accounts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { 
  createApiHandler, 
  successResponse,
  validateRequired 
} from '@/lib/api/base-handler'
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors/custom-errors'
import { Database } from '@/types/database'

type Account = Database['public']['Tables']['accounts']['Row']
type AccountUpdate = Database['public']['Tables']['accounts']['Update']
type Contact = Database['public']['Tables']['contacts']['Row']

interface AccountWithContacts extends Account {
  contacts: Contact[]
}

// GET /api/accounts/[id] - Get single account with contacts
export const GET = createApiHandler<AccountWithContacts>(
  async (request, { supabase }) => {
    const id = request.nextUrl.pathname.split('/').pop()
    
    if (!id) {
      throw new ValidationError('Account ID is required', 'id', 'REQUIRED')
    }
    
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        contacts (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Account not found')
      }
      throw new DatabaseError(error.message, error)
    }
    
    return successResponse(data)
  },
  { 
    allowedMethods: ['GET', 'PATCH', 'DELETE'],
    logEvent: 'account_retrieved' 
  }
)

// PATCH /api/accounts/[id] - Update account
export const PATCH = createApiHandler<Account>(
  async (request, { supabase }) => {
    const id = request.nextUrl.pathname.split('/').pop()
    const body: AccountUpdate = await request.json()
    
    if (!id) {
      throw new ValidationError('Account ID is required', 'id', 'REQUIRED')
    }
    
    // Validate account type if provided
    if (body.account_type !== undefined) {
      const validTypes = ['Commercial', 'Residential']
      if (!validTypes.includes(body.account_type)) {
        throw new ValidationError(
          `Invalid account type. Must be one of: ${validTypes.join(', ')}`,
          'account_type',
          'INVALID_TYPE'
        )
      }
    }
    
    // Validate status if provided
    if (body.status !== undefined) {
      const validStatuses = ['Active', 'Inactive']
      if (!validStatuses.includes(body.status)) {
        throw new ValidationError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          'status',
          'INVALID_STATUS'
        )
      }
    }
    
    // Don't allow empty account name
    if (body.account_name !== undefined && !body.account_name?.trim()) {
      throw new ValidationError(
        'Account name cannot be empty',
        'account_name',
        'REQUIRED'
      )
    }
    
    const { data, error } = await supabase
      .from('accounts')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Account not found')
      }
      if (error.code === '23505') {
        throw new ValidationError(
          'An account with this name already exists',
          'account_name',
          'DUPLICATE'
        )
      }
      throw new DatabaseError(error.message, error)
    }
    
    return successResponse(data)
  },
  { 
    allowedMethods: ['GET', 'PATCH', 'DELETE'],
    logEvent: 'account_updated' 
  }
)

// DELETE /api/accounts/[id] - Delete account (cascades to contacts)
export const DELETE = createApiHandler(
  async (request, { supabase }) => {
    const id = request.nextUrl.pathname.split('/').pop()
    
    if (!id) {
      throw new ValidationError('Account ID is required', 'id', 'REQUIRED')
    }
    
    // Check if account exists
    const { data: account, error: checkError } = await supabase
      .from('accounts')
      .select('id, account_name')
      .eq('id', id)
      .single()
    
    if (checkError || !account) {
      throw new NotFoundError('Account not found')
    }
    
    // Delete account (contacts will cascade delete due to FK constraint)
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new DatabaseError(error.message, error)
    }
    
    // Return 204 No Content on successful delete
    return new NextResponse(null, { status: 204 })
  },
  { 
    allowedMethods: ['GET', 'PATCH', 'DELETE'],
    logEvent: 'account_deleted' 
  }
)