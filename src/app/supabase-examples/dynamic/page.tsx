import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

// Generate static params for dynamic routes (ISR)
export async function generateStaticParams() {
  const supabase = await createClient()
  
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .limit(10) // Generate static pages for first 10 accounts
  
  return accounts?.map((account) => ({
    id: account.id,
  })) ?? []
}

// Fetch account with error handling
async function getAccount(id: string) {
  const supabase = await createClient()
  
  const { data: account, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching account:', error)
    return null
  }

  return account
}

// Related accounts component
async function RelatedAccounts({ currentAccountId, accountType }: { 
  currentAccountId: string
  accountType: string 
}) {
  const supabase = await createClient()
  
  const { data: relatedAccounts, error } = await supabase
    .from('accounts')
    .select('id, account_name, account_type')
    .eq('account_type', accountType)
    .neq('id', currentAccountId)
    .limit(3)

  if (error || !relatedAccounts?.length) {
    return (
      <div className="text-gray-500 text-sm">
        No related accounts found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {relatedAccounts.map((account) => (
        <Link
          key={account.id}
          href={`/supabase-examples/account/${account.id}`}
          className="block p-3 border rounded hover:bg-gray-50 transition-colors"
        >
          <h4 className="font-medium text-gray-900">{account.account_name}</h4>
          <p className="text-sm text-gray-600">{account.account_type}</p>
        </Link>
      ))}
    </div>
  )
}

// Account stats component with different caching
async function AccountStats() {
  const supabase = await createClient()
  
  // This could represent real-time stats that change frequently
  const { data: stats } = await supabase
    .from('accounts')
    .select('status, account_type')
  
  if (!stats) return null

  const totalAccounts = stats.length
  const activeAccounts = stats.filter(a => a.status === 'Active').length
  const commercialAccounts = stats.filter(a => a.account_type === 'Commercial').length
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">{totalAccounts}</div>
        <div className="text-sm text-blue-800">Total Accounts</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600">{activeAccounts}</div>
        <div className="text-sm text-green-800">Active Accounts</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-purple-600">{commercialAccounts}</div>
        <div className="text-sm text-purple-800">Commercial</div>
      </div>
    </div>
  )
}

// Force this page to be dynamic (no caching)
export const dynamic = 'force-dynamic'

// Opt out of caching for fetch requests
export const fetchCache = 'force-no-store'

export default async function DynamicExamplePage() {
  // This could come from a URL parameter in a real dynamic route
  const accountId = '1' // In a real app, this would be from params
  
  const account = await getAccount(accountId)

  if (!account) {
    notFound()
  }

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
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dynamic Data Fetching Example
        </h1>
        <p className="text-gray-600">
          This page demonstrates dynamic data fetching with no caching, 
          parallel data loading, and streaming with Suspense.
        </p>
      </header>

      {/* Account Stats with Suspense */}
      <Suspense fallback={
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      }>
        <AccountStats />
      </Suspense>

      {/* Main account details */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
            
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="font-medium text-gray-900">Account Name</dt>
                <dd className="mt-1 text-gray-600">{account.account_name}</dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-900">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    account.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {account.status}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-900">Account Type</dt>
                <dd className="mt-1 text-gray-600">{account.account_type}</dd>
              </div>
              
              {account.billing_city && (
                <div>
                  <dt className="font-medium text-gray-900">Billing City</dt>
                  <dd className="mt-1 text-gray-600">{account.billing_city}</dd>
                </div>
              )}
              
              <div>
                <dt className="font-medium text-gray-900">Created</dt>
                <dd className="mt-1 text-gray-600">
                  {new Date(account.created_at).toLocaleDateString()}
                </dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-900">Last Updated</dt>
                <dd className="mt-1 text-gray-600">
                  {new Date(account.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Related accounts sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Related {account.account_type} Accounts
            </h3>
            
            <Suspense fallback={
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            }>
              <RelatedAccounts 
                currentAccountId={account.id} 
                accountType={account.account_type} 
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Technical details */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          🔧 Implementation Highlights
        </h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>• <strong>Dynamic Rendering:</strong> `dynamic = 'force-dynamic'` ensures fresh data</li>
          <li>• <strong>No Fetch Caching:</strong> `fetchCache = 'force-no-store'` disables HTTP cache</li>
          <li>• <strong>Parallel Loading:</strong> Multiple Suspense boundaries for independent data streams</li>
          <li>• <strong>Error Handling:</strong> Graceful fallbacks and not-found handling</li>
          <li>• <strong>Server Components:</strong> All data fetching happens server-side</li>
          <li>• <strong>Streaming:</strong> Components render as soon as their data is ready</li>
        </ul>
      </div>
    </div>
  )
}
