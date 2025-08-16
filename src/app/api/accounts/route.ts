import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/singleton'
import { createServices } from '@/services/service-provider'
import { paginationSchema } from '@/lib/validation/schemas'
import { z } from 'zod'

/**
 * GET /api/accounts
 * Fetches all accounts with optional pagination
 *
 * ARCHITECTURE: Now uses service layer instead of direct database access
 * PERFORMANCE: Uses singleton client for connection pooling
 * As per audit recommendations for separation of concerns and performance
 */
export async function GET(request: NextRequest) {
  try {
    // PERFORMANCE: Use singleton client instead of creating new instance
    const supabase = getServerClient()

    // Initialize services with dependency injection
    const { accountService } = createServices(supabase)

    // Parse and validate query parameters
    // Convert null to undefined so Zod can apply defaults
    const searchParams = request.nextUrl.searchParams
    // Build an object from search params and let Zod apply defaults
    const params = Object.fromEntries(searchParams.entries())
    const pagination = paginationSchema.parse(params)

    // Use service layer to fetch accounts
    const accounts = await accountService.findAll({}, pagination)

    return NextResponse.json({ accounts })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }

    console.error('API Route Error - Unexpected error:', error)
    console.error('Error type:', typeof error)
    console.error('Error constructor:', error?.constructor?.name)

    // SECURITY: Never expose database error details to client
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}
