import { Suspense } from 'react'
import Link from 'next/link'
import ClientAccountsList from './ClientAccountsList'

export default function ClientSidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <nav className="flex gap-4 text-sm mb-4">
          <Link href="/supabase-examples" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Examples
          </Link>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            Home
          </Link>
        </nav>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Client-Side Data Fetching
        </h1>
        <p className="text-gray-600">
          This page demonstrates client-side data fetching using React hooks 
          and the Supabase client, contrasting with server-side approaches.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">🖥️ Client-Side Fetching</h2>
          <p className="text-gray-600 mb-4">
            This component uses React hooks to fetch data on the client side.
            It provides interactivity and real-time updates.
          </p>
          
          <Suspense fallback={<div>Loading client component...</div>}>
            <ClientAccountsList />
          </Suspense>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">When to Use Client-Side Fetching</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              User interactions that require immediate feedback
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              Real-time data that updates frequently
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              Data that depends on user input or state
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              Progressive enhancement scenarios
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-4 mt-6">When to Use Server-Side Fetching</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Initial page load performance is critical
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              SEO and social media previews are important
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Data doesn't change frequently
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Reducing client-side JavaScript bundle size
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
