// src/app/api/accounts/route.ts
import { NextRequest } from 'next/server'
import { 
  createApiHandler, 
  getPaginationParams, 
  successResponse, 
  validateRequired,
  buildQuery 
} from '@/lib/api/base-handler'
import { DatabaseError, ValidationError } from '@/lib/errors/custom-errors'
import { Database } from '@/types/database'

type Account = Database['public']['Tables']['accounts']['Row']
type AccountInsert = Database['public']['Tables']['accounts']['Insert']

// GET /api/accounts - List all accounts with pagination
export const GET = createApiHandler<Account[]>(
  async (request, { supabase }) => {
    const pagination = getPaginationParams(request)
    const searchParams = request.nextUrl.searchParams
    
    // Build query with filters
    let query = supabase
      .from('accounts')
      .select('*, contacts:contacts(count)', { count: 'exact' })
    
    // Apply filters
    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }
    
    const accountType = searchParams.get('accountType')
    if (accountType) {
      query = query.eq('account_type', accountType)
    }
    
    const search = searchParams.get('search')
    if (search) {
      query = query.ilike('account_name', `%${search}%`)
    }
    
    // Apply pagination
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    query = query
      .order(sortBy as keyof Account, { ascending: sortOrder === 'asc' })
      .range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      throw new DatabaseError(error.message, error)
    }
    
    // Transform data to include contact count
    const accountsWithCount = data?.map(account => ({
      ...account,
      contactCount: Array.isArray(account.contacts) ? account.contacts[0]?.count || 0 : 0
    })) || []
    
    return successResponse(accountsWithCount, {
      total: count || 0,
      page,
      pageSize
    })
  },
  { 
    allowedMethods: ['GET', 'POST'],
    logEvent: 'accounts_listed' 
  }
)

// POST /api/accounts - Create new account
export const POST = createApiHandler<Account>(
  async (request, { supabase }) => {
    const body: AccountInsert = await request.json()
    
    // Validate required fields
    validateRequired(body.account_name, 'account_name')
    
    // Validate account type if provided
    if (body.account_type) {
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
    if (body.status) {
      const validStatuses = ['Active', 'Inactive']
      if (!validStatuses.includes(body.status)) {
        throw new ValidationError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          'status',
          'INVALID_STATUS'
        )
      }
    }
    
    // Create account with defaults
    const accountData: AccountInsert = {
      account_name: body.account_name,
      account_type: body.account_type || 'Commercial',
      status: body.status || 'Active',
      billing_street_address: body.billing_street_address || null,
      billing_city: body.billing_city || null,
      billing_state: body.billing_state || null,
      billing_zip_code: body.billing_zip_code || null
    }
    
    const { data, error } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new ValidationError(
          'An account with this name already exists',
          'account_name',
          'DUPLICATE'
        )
      }
      throw new DatabaseError(error.message, error)
    }
    
    return successResponse(data, undefined, 201)
  },
  { 
    allowedMethods: ['GET', 'POST'],
    logEvent: 'account_created' 
  }
)