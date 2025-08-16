import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  console.log('=== Server-side Service Role Test ===')

  // Log what we have on the server
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Server env check:')
  console.log('- Has URL:', hasUrl)
  console.log('- Has Anon Key:', hasAnonKey)
  console.log('- Has Service Role Key:', hasServiceKey)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(
      {
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL',
        env: { hasUrl, hasAnonKey, hasServiceKey },
      },
      { status: 500 }
    )
  }

  // Test with service role key if available
  const keyToUse =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon'

  if (!keyToUse) {
    return NextResponse.json(
      {
        error: 'No Supabase keys found',
        env: { hasUrl, hasAnonKey, hasServiceKey },
      },
      { status: 500 }
    )
  }

  console.log(`Using ${keyType} key:`, keyToUse?.substring(0, 20), '...')

  try {
    // Create Supabase client with the appropriate key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, keyToUse, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Test 1: Fetch accounts
    const {
      data: accounts,
      error: accountsError,
      count,
    } = await supabase.from('accounts').select('*', { count: 'exact' }).limit(3)

    // Test 2: Fetch contacts
    const {
      data: contacts,
      error: contactsError,
      count: contactCount,
    } = await supabase.from('contacts').select('*', { count: 'exact' }).limit(3)

    // Test 3: Try to join contacts with a specific account
    let joinTest = null
    if (accounts && accounts.length > 0) {
      const testAccountNumber = accounts[0].account_number
      const { data: accountContacts, error: joinError } = await supabase
        .from('contacts')
        .select('*')
        .eq('account_id', testAccountNumber)

      joinTest = {
        account_number: testAccountNumber,
        contacts_found: accountContacts?.length || 0,
        error: joinError?.message,
      }
    }

    return NextResponse.json({
      success: true,
      keyType,
      keyPreview: keyToUse.substring(0, 20) + '...',
      tests: {
        accounts: {
          success: !accountsError,
          error: accountsError?.message,
          count: count || 0,
          sample: accounts?.slice(0, 2).map((a) => ({
            id: a.id,
            account_number: a.account_number,
            company_name: a.company_name,
          })),
        },
        contacts: {
          success: !contactsError,
          error: contactsError?.message,
          count: contactCount || 0,
          sample: contacts?.slice(0, 2).map((c) => ({
            id: c.id,
            account_id: c.account_id,
            name: `${c.first_name} ${c.last_name}`,
          })),
        },
        joinTest,
      },
      env: {
        hasUrl,
        hasAnonKey,
        hasServiceKey,
      },
    })
  } catch (error) {
    console.error('Server test error:', error)
    return NextResponse.json(
      {
        error: 'Service test failed', // SECURITY: Never expose error details
        keyType,
        env: { hasUrl, hasAnonKey, hasServiceKey },
      },
      { status: 500 }
    )
  }
}
