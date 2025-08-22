'use client'

import { useState } from 'react'

export default function ValidationTestPage() {
  const [count, setCount] = useState(0)

  // Test 1: Console.log should be allowed now
  console.log('Testing console.log - this should NOT cause an error!')
  console.warn('Warnings should work too')
  console.error('Even console.error is fine')

  // Test 2: Apostrophes should work without escaping
  const message = "This isn't a problem anymore! We've fixed it!"
  const anotherMessage = "Can't stop, won't stop! It's working!"

  // Test 3: Unused variable (should only warn, not error)
  const unusedVariable = 'I am not used anywhere'

  // Test 4: This would be a REAL error (missing key in map)
  const items = ['apple', 'banana', 'orange']

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Validation Rules Test Page</h1>

        {/* Test apostrophes in JSX */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 1: Apostrophes</h2>
          <p>This page tests that we don't get errors for apostrophes.</p>
          <p>It's working! Can't believe we've finally fixed this!</p>
          <p>{message}</p>
          <p>{anotherMessage}</p>
        </div>

        {/* Test console.log */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 2: Console Logging</h2>
          <p>Open browser console - you should see our test logs!</p>
          <button
            onClick={() => {
              console.log('Button clicked!', { count })
              setCount(count + 1)
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Click me (logs to console)
          </button>
          <p className="mt-2">Clicked {count} times</p>
        </div>

        {/* Test that real errors are still caught */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 3: Real Errors Still Caught</h2>
          <p>The map below correctly includes keys (no error):</p>
          <ul className="list-disc list-inside">
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          {/* If we removed the key prop above, we'd get an error - that's good! */}
        </div>

        {/* Test the dev modes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test 4: Dev Mode Commands</h2>
          <div className="space-y-2">
            <p className="font-mono bg-gray-100 p-2">npm run dev - Normal mode</p>
            <p className="font-mono bg-gray-100 p-2">npm run dev:quiet - No warnings</p>
            <p className="font-mono bg-gray-100 p-2">npm run dev:yolo - NOTHING blocks!</p>
            <p className="font-mono bg-gray-100 p-2">npm run fix - Auto-fix issues</p>
          </div>
        </div>

        {/* Validation status */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">
            ✅ If you're seeing this page without errors:
          </h3>
          <ul className="list-disc list-inside text-green-800">
            <li>Apostrophes are working!</li>
            <li>Console.log is allowed!</li>
            <li>Only real bugs cause errors!</li>
            <li>The validation madness is FIXED!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
