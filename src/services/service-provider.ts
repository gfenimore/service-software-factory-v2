/**
 * Service Provider - Dependency Injection Container
 *
 * ARCHITECTURE: Implements dependency injection pattern
 * As per audit recommendations for loose coupling and testability
 * Provides singleton instances of services
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { SupabaseAccountService, type AccountService } from './account.service'
import { SupabaseContactService, type ContactService } from './contact.service'

/**
 * Service container interface
 */
export interface ServiceContainer {
  accountService: AccountService
  contactService: ContactService
}

/**
 * Service provider singleton
 */
export class ServiceProvider {
  private static instance: ServiceProvider | null = null
  private services: ServiceContainer | null = null

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider()
    }
    return ServiceProvider.instance
  }

  /**
   * Initialize services with Supabase client
   */
  initialize(supabase: SupabaseClient<Database>): ServiceContainer {
    if (!this.services) {
      this.services = {
        accountService: new SupabaseAccountService(supabase),
        contactService: new SupabaseContactService(supabase),
      }
    }
    return this.services
  }

  /**
   * Get services (must be initialized first)
   */
  getServices(): ServiceContainer {
    if (!this.services) {
      throw new Error('ServiceProvider not initialized. Call initialize() first.')
    }
    return this.services
  }

  /**
   * Reset services (useful for testing)
   */
  reset(): void {
    this.services = null
  }
}

/**
 * Factory function to create services for API routes
 */
export function createServices(supabase: SupabaseClient<Database>): ServiceContainer {
  return ServiceProvider.getInstance().initialize(supabase)
}
