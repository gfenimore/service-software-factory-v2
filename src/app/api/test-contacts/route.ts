import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    // First, get all accounts - using actual column names
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .limit(5)

    if (accountsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch accounts', 
        details: accountsError 
      }, { status: 500 })
    }

    // Then, get all contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(10)

    if (contactsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch contacts', 
        details: contactsError 
      }, { status: 500 })
    }

    // Check if account_ids in contacts match account_numbers in accounts
    const results: any = {
      accounts: accounts?.map((a: any) => ({
        account_number: a.account_number,
        company_name: a.company_name
      })),
      contacts: contacts?.map((c: any) => ({
        id: c.id,
        account_id: c.account_id,
        first_name: c.first_name,
        last_name: c.last_name
      })),
      matches: []
    }

    // Find matching contacts for each account
    if (accounts && contacts) {
      for (const account of accounts) {
        const matchingContacts = contacts.filter((c: any) => c.account_id === (account as any).account_number)
        if (matchingContacts.length > 0) {
          results.matches.push({
            account_number: (account as any).account_number,
            company_name: (account as any).company_name,
            contact_count: matchingContacts.length
          })
        }
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    )
  }
}