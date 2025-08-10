import { createClient } from '@/lib/supabase/server'
import { accountQueries } from '@/lib/supabase/queries/accounts'
import Link from 'next/link'
import { Suspense } from 'react'

// Advanced example using query utilities
async function AccountStatsDisplay() {
  const supabase = await createClient()
  
  try {
    const stats = await accountQueries.getAccountStats(supabase)
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-800">Total</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-green-800">Active</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          <div className="text-sm text-red-800">Inactive</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.residential}</div>
          <div className="text-sm text-purple-800">Residential</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.commercial}</div>
          <div className="text-sm text-amber-800">Commercial</div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching stats:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-800">Failed to load account statistics</p>
      </div>
    )
  }
}

async function CommercialAccountsList() {
  const supabase = await createClient()
  
  try {
    const { accounts } = await accountQueries.getAccountsByType(
      supabase, 
      'Commercial', 
      5
    )
    
    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Commercial Accounts</h3>
        {accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <h4 className="font-medium">{account.account_name}</h4>
                  <p className="text-sm text-gray-600">
                    Status: {account.status} | City: {account.billing_city || 'N/A'}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(account.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No commercial accounts found</p>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching commercial accounts:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load commercial accounts</p>
      </div>
    )
  }
}

async function ActiveAccountsList() {
  const supabase = await createClient()
  
  try {
    const accounts = await accountQueries.getActiveAccounts(supabase)
    
    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Active Accounts</h3>
        {accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.slice(0, 8).map((account) => (
              <div key={account.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span className="font-medium">{account.account_name}</span>
                <span className="text-sm text-gray-600">{account.account_type}</span>
              </div>
            ))}
            {accounts.length > 8 && (
              <p className="text-sm text-gray-500 pt-2">
                And {accounts.length - 8} more...
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No active accounts found</p>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching active accounts:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load active accounts</p>
      </div>
    )
  }
}

// Configure revalidation for this page
export const revalidate = 30

export default function AdvancedExamplePage() {
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
          Advanced Query Patterns
        </h1>
        <p className="text-gray-600">
          This page demonstrates advanced data fetching patterns using reusable 
          query utilities and proper error handling.
        </p>
      </header>

      {/* Account Statistics */}
      <Suspense fallback={
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      }>
        <AccountStatsDisplay />
      </Suspense>

      {/* Account Lists */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Suspense fallback={
          <div className="bg-gray-100 border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        }>
          <CommercialAccountsList />
        </Suspense>

        <Suspense fallback={
          <div className="bg-gray-100 border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        }>
          <ActiveAccountsList />
        </Suspense>
      </div>

      {/* Implementation details */}
      <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-indigo-900 mb-3">
          🚀 Advanced Patterns Demonstrated
        </h2>
        <ul className="space-y-2 text-sm text-indigo-800">
          <li>• <strong>Query Utilities:</strong> Centralized, reusable query functions</li>
          <li>• <strong>Type Safety:</strong> Full TypeScript support with generated types</li>
          <li>• <strong>Error Boundaries:</strong> Graceful error handling for each component</li>
          <li>• <strong>Loading States:</strong> Suspense boundaries with skeleton loading</li>
          <li>• <strong>Parallel Fetching:</strong> Multiple data sources loading independently</li>
          <li>• <strong>Caching Strategy:</strong> 30-second revalidation with ISR</li>
          <li>• <strong>Performance:</strong> Server-side rendering with minimal client JavaScript</li>
        </ul>
      </div>
    </div>
  )
}
