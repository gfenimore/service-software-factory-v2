// src/lib/api/base-handler.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { handleApiError } from '@/lib/errors/error-handler'
import { withRequestLogging } from '@/lib/logger/middleware'
import { logBusinessEvent } from '@/lib/logger'
import { AppError, ValidationError } from '@/lib/errors/custom-errors'
import { Database } from '@/types/database'

// Standard API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: {
    message: string
    code: string
  }
  metadata?: {
    total?: number
    page?: number
    pageSize?: number
  }
}

// Pagination parameters
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Base handler configuration
export interface HandlerConfig {
  requireAuth?: boolean
  allowedMethods?: string[]
  logEvent?: string
}

// Extract pagination from request
export function getPaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams
  
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    pageSize: Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20'))),
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  }
}

// Standard success response
export function successResponse<T>(
  data: T,
  metadata?: ApiResponse['metadata'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, metadata }, { status })
}

// Standard error response
export function errorResponse(
  error: AppError,
  status?: number
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      error: {
        message: error.message,
        code: error.code
      }
    },
    { status: status || error.statusCode || 500 }
  )
}

// Create a base handler with common functionality
export function createApiHandler<T = any>(
  handler: (request: NextRequest, context: { supabase: ReturnType<typeof createClient> }) => Promise<NextResponse<ApiResponse<T>>>,
  config: HandlerConfig = {}
) {
  return withRequestLogging(async (request: NextRequest) => {
    try {
      // Check allowed methods
      if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
        throw new AppError(
          `Method ${request.method} not allowed`,
          'METHOD_NOT_ALLOWED',
          405
        )
      }

      // Initialize Supabase client
      const supabase = createClient()

      // Check authentication if required
      if (config.requireAuth) {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          throw new AppError(
            'Authentication required',
            'UNAUTHORIZED',
            401
          )
        }
      }

      // Execute the handler
      const response = await handler(request, { supabase })

      // Log business event if configured
      if (config.logEvent && response.status >= 200 && response.status < 300) {
        const responseData = await response.clone().json()
        logBusinessEvent(config.logEvent, {
          method: request.method,
          path: request.nextUrl.pathname,
          dataCount: Array.isArray(responseData.data) ? responseData.data.length : 1
        })
      }

      return response
    } catch (error) {
      const { error: appError, statusCode } = await handleApiError(error, request)
      return errorResponse(appError, statusCode)
    }
  })
}

// Validation helper
export function validateRequired(value: unknown, fieldName: string): void {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new ValidationError(
      `${fieldName} is required`,
      fieldName,
      'REQUIRED'
    )
  }
}

// Type-safe query builder helpers
export function buildQuery<T extends keyof Database['public']['Tables']>(
  supabase: ReturnType<typeof createClient>,
  table: T,
  pagination?: PaginationParams
) {
  let query = supabase.from(table).select('*', { count: 'exact' })
  
  if (pagination) {
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    query = query
      .order(sortBy as any, { ascending: sortOrder === 'asc' })
      .range(from, to)
  }
  
  return query
}