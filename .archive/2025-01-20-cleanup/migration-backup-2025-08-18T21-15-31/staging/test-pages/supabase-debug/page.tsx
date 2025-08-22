'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createDirectClient } from '@/lib/supabase/client-direct'

export default function SupabaseDebugPage() {
  const [status, setStatus] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testConnection() {
      const results: any = {}

      try {
        // 1. Check environment variables
        console.log('=== Environment Variable Check ===')
        console.log(
          'Anon key in client:',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10),
          '...'
        )
        console.log('Service role key in client:', process.env.SUPABASE_SERVICE_ROLE_KEY)
        console.log('Should be undefined ☝️ (not prefixed with NEXT_PUBLIC_)')

        results.env = {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        }

        // 2. Create client (using direct client with hardcoded values)
        const supabase = createDirectClient()
        results.clientCreated = true
        results.clientType = 'Direct client with hardcoded values'

        // 3. Test accounts table
        console.log('Testing accounts table...')
        const {
          data: accounts,
          error: accountsError,
          count: accountsCount,
        } = await supabase.from('accounts').select('*', { count: 'exact', head: true })

        results.accounts = {
          success: !accountsError,
          error: accountsError?.message,
          count: accountsCount,
        }

        // 4. Test contacts table
        console.log('Testing contacts table...')
        const {
          data: contacts,
          error: contactsError,
          count: contactsCount,
        } = await supabase.from('contacts').select('*', { count: 'exact', head: true })

        results.contacts = {
          success: !contactsError,
          error: contactsError?.message,
          count: contactsCount,
        }

        // 5. Try to fetch one account
        const { data: sampleAccount, error: sampleError } = await supabase
          .from('accounts')
          .select('*')
          .limit(1)
          .single()

        results.sampleAccount = {
          success: !sampleError,
          error: sampleError?.message,
          data: sampleAccount,
        }

        // 5b. Check if we can find contacts for a specific account
        if (sampleAccount?.account_number) {
          const { data: accountContacts, error: contactError } = await supabase
            .from('contacts')
            .select('*')
            .eq('account_id', sampleAccount.account_number)

          results.contactsForAccount = {
            account_number: sampleAccount.account_number,
            success: !contactError,
            error: contactError?.message,
            count: accountContacts?.length || 0,
          }
        }

        // 6. Check auth status
        const {
          data: { session },
        } = await supabase.auth.getSession()
        results.auth = {
          hasSession: !!session,
          user: session?.user?.email,
        }
      } catch (err) {
        results.error = err instanceof Error ? err.message : 'Unknown error'
      }

      setStatus(results)
      setLoading(false)
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase Connection Debug</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Testing connection...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Environment Variables */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">1. Environment Variables</h2>
              <div className="space-y-2 text-sm">
                <div>URL exists: {status.env?.hasUrl ? '✅' : '❌'}</div>
                <div>Key exists: {status.env?.hasKey ? '✅' : '❌'}</div>
                <div className="text-xs text-gray-600">URL: {status.env?.url}</div>
                <div className="text-xs text-gray-600">Key preview: {status.env?.keyPreview}</div>
              </div>
            </div>

            {/* Client Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">2. Supabase Client</h2>
              <div>Client created: {status.clientCreated ? '✅' : '❌'}</div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">3. Accounts Table</h2>
              <div className="space-y-2 text-sm">
                <div>Status: {status.accounts?.success ? '✅ Connected' : '❌ Failed'}</div>
                {status.accounts?.error && (
                  <div className="text-red-600">Error: {status.accounts.error}</div>
                )}
                {status.accounts?.count !== undefined && (
                  <div>Record count: {status.accounts.count}</div>
                )}
              </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">4. Contacts Table</h2>
              <div className="space-y-2 text-sm">
                <div>Status: {status.contacts?.success ? '✅ Connected' : '❌ Failed'}</div>
                {status.contacts?.error && (
                  <div className="text-red-600">Error: {status.contacts.error}</div>
                )}
                {status.contacts?.count !== undefined && (
                  <div>Record count: {status.contacts.count}</div>
                )}
              </div>
            </div>

            {/* Sample Account */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">5. Sample Account Fetch</h2>
              <div className="space-y-2 text-sm">
                <div>Status: {status.sampleAccount?.success ? '✅ Success' : '❌ Failed'}</div>
                {status.sampleAccount?.error && (
                  <div className="text-red-600">Error: {status.sampleAccount.error}</div>
                )}
                {status.sampleAccount?.data && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <pre>{JSON.stringify(status.sampleAccount.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Contacts for Account Test */}
            {status.contactsForAccount && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">5b. Contacts for Account Test</h2>
                <div className="space-y-2 text-sm">
                  <div>Account: {status.contactsForAccount.account_number}</div>
                  <div>
                    Status: {status.contactsForAccount.success ? '✅ Success' : '❌ Failed'}
                  </div>
                  {status.contactsForAccount.error && (
                    <div className="text-red-600">Error: {status.contactsForAccount.error}</div>
                  )}
                  <div>Contacts found: {status.contactsForAccount.count}</div>
                </div>
              </div>
            )}

            {/* Auth Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">6. Authentication</h2>
              <div className="space-y-2 text-sm">
                <div>Has session: {status.auth?.hasSession ? '✅' : '❌ No (using anon key)'}</div>
                {status.auth?.user && <div>User: {status.auth.user}</div>}
              </div>
            </div>

            {/* Overall Error */}
            {status.error && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Critical Error</h2>
                <div className="text-red-600">{status.error}</div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Check browser console (F12) for detailed errors</li>
            <li>Verify .env.local file exists and has correct values</li>
            <li>Restart Next.js server after changing .env.local</li>
            <li>Check Supabase Dashboard that tables exist</li>
            <li>Verify RLS policies allow access</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
