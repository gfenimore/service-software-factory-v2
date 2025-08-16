import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import {
  createContactSchema,
  updateContactSchema,
  uuidSchema,
  formatZodError,
} from '@/lib/validation/schemas'

/**
 * GET /api/accounts/[accountId]/contacts
 * Fetches all contacts for a specific account
 *
 * SECURITY: Input validation added for accountId parameter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    // Use service role key on server for full access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { accountId } = await params

    // Validate accountId format
    try {
      uuidSchema.parse(accountId)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 })
    }

    // Fetch contacts for the account
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('account_id', accountId)
      .order('last_name', { ascending: true })

    if (error) {
      console.error('Error fetching contacts:', error)
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }

    return NextResponse.json({ contacts: contacts || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

/**
 * POST /api/accounts/[accountId]/contacts
 * Creates a new contact for a specific account
 *
 * SECURITY: Full input validation prevents SQL injection and data corruption
 * Replaces dangerous ...body spread with validated fields only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    // Use service role key on server for full access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { accountId } = await params

    // Validate accountId format
    try {
      uuidSchema.parse(accountId)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()

    // CRITICAL SECURITY FIX: Validate all input fields
    let validatedData
    try {
      validatedData = createContactSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: formatZodError(error),
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Insert new contact with ONLY validated data
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        account_id: accountId,
        ...validatedData, // Only validated fields, no arbitrary data
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

/**
 * PATCH /api/accounts/[accountId]/contacts/[contactId]
 * Updates an existing contact
 *
 * SECURITY: Validates partial updates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string; contactId: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { accountId, contactId } = await params

    // Validate IDs
    try {
      uuidSchema.parse(accountId)
      uuidSchema.parse(contactId)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()

    let validatedData
    try {
      validatedData = updateContactSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: formatZodError(error),
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Update contact with validated data
    const { data: contact, error } = await supabase
      .from('contacts')
      .update(validatedData)
      .eq('id', contactId)
      .eq('account_id', accountId)
      .select()
      .single()

    if (error) {
      console.error('Error updating contact:', error)
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
