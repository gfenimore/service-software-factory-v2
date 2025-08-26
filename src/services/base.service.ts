/**
 * Base Service Abstract Class
 *
 * ARCHITECTURE: Service layer abstraction as per audit recommendations
 * Provides common functionality for all services
 * Enables testing, logging, and error handling in one place
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

export interface ServiceError {
  code: string
  message: string
  details?: unknown
}

export class ServiceException extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ServiceException'
  }
}

/**
 * Base service class providing common functionality
 */
export abstract class BaseService {
  protected supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Handle database errors consistently
   */
  protected handleError(error: unknown, operation: string): never {
    console.error(`Service error in ${operation}:`, error)

    if (error instanceof ServiceException) {
      throw error
    }

    // Never expose database details
    throw new ServiceException(
      'SERVICE_ERROR',
      `Operation failed: ${operation}`,
      process.env.NODE_ENV === 'development' ? error : undefined
    )
  }

  /**
   * Log operations for debugging (only in development)
   */
  protected log(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.constructor.name}] ${message}`, data || '')
    }
  }
}
