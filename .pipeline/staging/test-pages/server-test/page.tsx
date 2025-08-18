'use client'

import { useState } from 'react'

export default function ServerTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testServerConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-service')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to fetch' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Server-Side Supabase Test</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="mb-4">
            This tests the Supabase connection from the server-side (API route), where we can safely
            use the service role key.
          </p>

          <button
            onClick={testServerConnection}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Server Connection'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Results:</h2>

            {result.success ? (
              <>
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 font-semibold">✅ Server connection successful!</p>
                  <p className="text-sm text-green-600 mt-1">Using: {result.keyType} key</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Environment:</h3>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>Has URL: {result.env?.hasUrl ? '✅' : '❌'}</li>
                      <li>Has Anon Key: {result.env?.hasAnonKey ? '✅' : '❌'}</li>
                      <li>Has Service Role Key: {result.env?.hasServiceKey ? '✅' : '❌'}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold">Accounts Test:</h3>
                    <p className="text-sm">
                      Status: {result.tests?.accounts?.success ? '✅' : '❌'}
                      {' | '}
                      Count: {result.tests?.accounts?.count || 0}
                    </p>
                    {result.tests?.accounts?.error && (
                      <p className="text-sm text-red-600">Error: {result.tests.accounts.error}</p>
                    )}
                    {result.tests?.accounts?.sample && (
                      <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-auto">
                        {JSON.stringify(result.tests.accounts.sample, null, 2)}
                      </pre>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold">Contacts Test:</h3>
                    <p className="text-sm">
                      Status: {result.tests?.contacts?.success ? '✅' : '❌'}
                      {' | '}
                      Count: {result.tests?.contacts?.count || 0}
                    </p>
                    {result.tests?.contacts?.error && (
                      <p className="text-sm text-red-600">Error: {result.tests.contacts.error}</p>
                    )}
                  </div>

                  {result.tests?.joinTest && (
                    <div>
                      <h3 className="font-semibold">Join Test (Account → Contacts):</h3>
                      <p className="text-sm">
                        Account: {result.tests.joinTest.account_number}
                        {' | '}
                        Contacts Found: {result.tests.joinTest.contacts_found}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-semibold">❌ Server test failed</p>
                <p className="text-sm text-red-600 mt-2">{result.error}</p>
                {result.env && (
                  <div className="mt-3 text-sm">
                    <p>Environment check:</p>
                    <ul className="ml-4">
                      <li>Has URL: {result.env.hasUrl ? '✅' : '❌'}</li>
                      <li>Has Anon Key: {result.env.hasAnonKey ? '✅' : '❌'}</li>
                      <li>Has Service Role Key: {result.env.hasServiceKey ? '✅' : '❌'}</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                View raw response
              </summary>
              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How this works:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Click the button to call `/api/test-service`</li>
            <li>The API route runs on the server (not in browser)</li>
            <li>Server can access `SUPABASE_SERVICE_ROLE_KEY` env var</li>
            <li>Tests connection with appropriate key (service or anon)</li>
            <li>Returns results showing what's working</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
