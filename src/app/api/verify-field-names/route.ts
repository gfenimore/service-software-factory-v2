import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
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

    // Test 1: Fetch a contact and verify field names
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1)

    if (contactsError) {
      return NextResponse.json(
        {
          test: 'FAILED',
          error: 'Could not fetch contacts',
          details: contactsError,
        },
        { status: 500 }
      )
    }

    const contact = contacts?.[0]
    if (!contact) {
      return NextResponse.json({
        test: 'INCONCLUSIVE',
        message: 'No contacts in database to test',
      })
    }

    // Test 2: Verify expected fields exist
    const fieldTests = {
      email_address: {
        exists: 'email_address' in contact,
        value: contact.email_address,
        oldFieldExists: 'email' in contact,
      },
      phone_number: {
        exists: 'phone_number' in contact,
        value: contact.phone_number,
        oldFieldExists: 'phone' in contact,
      },
      is_primary_contact: {
        exists: 'is_primary_contact' in contact,
        value: contact.is_primary_contact,
        oldFieldExists: 'is_primary' in contact,
      },
      communication_preference: {
        exists: 'communication_preference' in contact,
        value: contact.communication_preference,
      },
    }

    // Test 3: Check our TypeScript types match
    const typeScriptTest = {
      canAccessEmailAddress: contact.email_address !== undefined || contact.email_address === null,
      canAccessPhoneNumber: contact.phone_number !== undefined || contact.phone_number === null,
      fieldCount: Object.keys(contact).length,
      allFields: Object.keys(contact),
    }

    // Test 4: Verify data can be displayed
    const displayTest = {
      formattedName: `${contact.first_name} ${contact.last_name}`,
      hasValidEmail: typeof contact.email_address === 'string' || contact.email_address === null,
      hasValidPhone: typeof contact.phone_number === 'string' || contact.phone_number === null,
    }

    // Summary
    const allTestsPassed =
      fieldTests.email_address.exists &&
      fieldTests.phone_number.exists &&
      !fieldTests.email_address.oldFieldExists &&
      !fieldTests.phone_number.oldFieldExists

    return NextResponse.json({
      status: allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED',
      summary: {
        correctFieldsExist: fieldTests.email_address.exists && fieldTests.phone_number.exists,
        oldFieldsGone:
          !fieldTests.email_address.oldFieldExists && !fieldTests.phone_number.oldFieldExists,
        dataDisplayable: displayTest.hasValidEmail && displayTest.hasValidPhone,
      },
      fieldTests,
      typeScriptTest,
      displayTest,
      sampleData: {
        id: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        email_address: contact.email_address,
        phone_number: contact.phone_number,
        is_primary_contact: contact.is_primary_contact,
      },
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 }) // SECURITY: Never expose error details
  }
}
