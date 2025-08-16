/**
 * Zod Validation Schemas for API Routes
 *
 * SECURITY: Input validation to prevent SQL injection and data corruption
 * As per security audit recommendations (CWE-20, CWE-89)
 *
 * All API routes MUST validate input using these schemas before processing
 */

import { z } from 'zod'

// ============================================
// Contact Schemas
// ============================================

/**
 * Schema for creating a new contact
 * Validates all required fields and enforces type safety
 */
export const createContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  title: z.string().max(100).nullable().optional(),
  email_address: z.string().email('Invalid email format').nullable().optional(),
  phone_number: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .max(20)
    .nullable()
    .optional(),
  is_primary_contact: z.boolean().default(false),
  communication_preference: z.enum(['Voice', 'Text', 'Email']).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export type CreateContactInput = z.infer<typeof createContactSchema>

/**
 * Schema for updating an existing contact
 * All fields are optional for partial updates
 */
export const updateContactSchema = createContactSchema.partial()

export type UpdateContactInput = z.infer<typeof updateContactSchema>

// ============================================
// Account Schemas
// ============================================

/**
 * Schema for creating a new account
 */
export const createAccountSchema = z.object({
  account_number: z.string().min(1, 'Account number is required').max(50),
  account_name: z.string().min(1, 'Account name is required').max(255),
  contact_name: z.string().max(255).nullable().optional(),
  contact_email: z.string().email('Invalid email format').nullable().optional(),
  contact_phone: z.string().max(50).nullable().optional(),
  account_type: z.string().max(50).nullable().optional(),
  status: z.string().max(50).default('Active'),
  billing_address_1: z.string().max(255).nullable().optional(),
  billing_address_2: z.string().max(255).nullable().optional(),
  billing_city: z.string().max(100).nullable().optional(),
  billing_state: z.string().max(50).nullable().optional(),
  billing_zip: z.string().max(20).nullable().optional(),
  billing_country: z.string().max(100).default('USA').nullable().optional(),
  service_address_1: z.string().max(255).nullable().optional(),
  service_address_2: z.string().max(255).nullable().optional(),
  service_city: z.string().max(100).nullable().optional(),
  service_state: z.string().max(50).nullable().optional(),
  service_zip: z.string().max(20).nullable().optional(),
  service_country: z.string().max(100).default('USA').nullable().optional(),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>

/**
 * Schema for updating an account
 */
export const updateAccountSchema = createAccountSchema.partial()

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>

// ============================================
// Common Schemas
// ============================================

/**
 * UUID validation for IDs
 */
export const uuidSchema = z.string().uuid('Invalid ID format')

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationParams = z.infer<typeof paginationSchema>

/**
 * Search query parameters
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type SearchParams = z.infer<typeof searchSchema>

// ============================================
// Error Handling
// ============================================

/**
 * Format Zod validation errors for API responses
 * Returns user-friendly error messages without exposing internals
 */
export function formatZodError(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}

  // Access issues array which is the correct property name in Zod
  error.issues.forEach((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'general'
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  })

  return formatted
}

/**
 * Validates input and returns typed data or throws formatted error
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = formatZodError(error)
      throw new ValidationError('Validation failed', formatted)
    }
    throw error
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
