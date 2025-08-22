'use client'

import { useState, useEffect } from 'react'

export default function FieldVerificationPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/verify-field-names')
      .then((res) => res.json())
      .then((data) => {
        setResults(data)
        setLoading(false)
      })
      .catch((err) => {
        setResults({ error: err.message })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Field Name Verification</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  const allPassed = results?.status?.includes('✅')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Field Name Verification Results</h1>

        {/* Overall Status */}
        <div
          className={`p-6 rounded-lg mb-6 ${allPassed ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} border-2`}
        >
          <h2 className="text-xl font-semibold mb-2">{results?.status}</h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <span className="font-medium">Correct Fields Exist:</span>
              <span className="ml-2">{results?.summary?.correctFieldsExist ? '✅' : '❌'}</span>
            </div>
            <div>
              <span className="font-medium">Old Fields Gone:</span>
              <span className="ml-2">{results?.summary?.oldFieldsGone ? '✅' : '❌'}</span>
            </div>
            <div>
              <span className="font-medium">Data Displayable:</span>
              <span className="ml-2">{results?.summary?.dataDisplayable ? '✅' : '❌'}</span>
            </div>
          </div>
        </div>

        {/* Field Tests */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Field Name Tests</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">email_address</span>
              <div className="flex items-center gap-4">
                <span
                  className={
                    results?.fieldTests?.email_address?.exists ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {results?.fieldTests?.email_address?.exists ? '✅ Exists' : '❌ Missing'}
                </span>
                <span className="text-sm text-gray-600">
                  Value: {results?.fieldTests?.email_address?.value || 'null'}
                </span>
                {results?.fieldTests?.email_address?.oldFieldExists && (
                  <span className="text-red-600 text-sm">⚠️ Old "email" field still exists!</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">phone_number</span>
              <div className="flex items-center gap-4">
                <span
                  className={
                    results?.fieldTests?.phone_number?.exists ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {results?.fieldTests?.phone_number?.exists ? '✅ Exists' : '❌ Missing'}
                </span>
                <span className="text-sm text-gray-600">
                  Value: {results?.fieldTests?.phone_number?.value || 'null'}
                </span>
                {results?.fieldTests?.phone_number?.oldFieldExists && (
                  <span className="text-red-600 text-sm">⚠️ Old "phone" field still exists!</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">is_primary_contact</span>
              <div className="flex items-center gap-4">
                <span
                  className={
                    results?.fieldTests?.is_primary_contact?.exists
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {results?.fieldTests?.is_primary_contact?.exists ? '✅ Exists' : '❌ Missing'}
                </span>
                <span className="text-sm text-gray-600">
                  Value: {results?.fieldTests?.is_primary_contact?.value ? 'true' : 'false'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">communication_preference</span>
              <div className="flex items-center gap-4">
                <span
                  className={
                    results?.fieldTests?.communication_preference?.exists
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {results?.fieldTests?.communication_preference?.exists
                    ? '✅ Exists'
                    : '❌ Missing'}
                </span>
                <span className="text-sm text-gray-600">
                  Value: {results?.fieldTests?.communication_preference?.value || 'null'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Data */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Sample Contact Data</h3>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm">{JSON.stringify(results?.sampleData, null, 2)}</pre>
          </div>
        </div>

        {/* All Fields */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">All Database Fields</h3>
          <div className="flex flex-wrap gap-2">
            {results?.typeScriptTest?.allFields?.map((field: string) => (
              <span
                key={field}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Manual Verification Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>
              Go to{' '}
              <a href="/accounts/master" className="underline">
                Master View
              </a>
            </li>
            <li>Click on any account card to select it</li>
            <li>Click the phone icon to open Contact Details Modal</li>
            <li>Verify that email addresses and phone numbers are displayed</li>
            <li>Check that no "undefined" values appear</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
