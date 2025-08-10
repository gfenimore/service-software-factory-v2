import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// This demonstrates different caching strategies for Next.js 15 App Router

// Static data fetching (cached until manually invalidated)
async function getStaticAccounts() {
  const supabase = await createClient()
  
  // Default behavior: { cache: 'force-cache' }
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('status', 'Active')
    .limit(5)

  if (error) {
    console.error('Error fetching static accounts:', error)
    return []
  }

  return accounts
}

// Dynamic data fetching (refetched on every request)
async function getDynamicAccounts() {
  const supabase = await createClient()
  
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error fetching dynamic accounts:', error)
    return []
  }

  return accounts
}

// Data with revalidation (cached for 60 seconds)
async function getRevalidatedAccounts() {
  const supabase = await createClient()
  
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('account_type', 'Commercial')
    .limit(3)

  if (error) {
    console.error('Error fetching revalidated accounts:', error)
    return []
  }

  return accounts
}

// This component will be rendered on the server
async function StaticAccountsSection() {
  const accounts = await getStaticAccounts()

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        📊 Static Data Fetching (Cached)
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        This data is fetched once and cached until manually invalidated. 
        Perfect for content that doesn't change often.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <div key={account.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium text-gray-900">{account.account_name}</h3>
              <p className="text-sm text-gray-600">Status: {account.status}</p>
              <p className="text-sm text-gray-600">Type: {account.account_type}</p>
              {account.billing_city && (
                <p className="text-sm text-gray-600">City: {account.billing_city}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No accounts found</p>
        )}
      </div>
    </section>
  )
}

// This component demonstrates dynamic fetching with Suspense
async function DynamicAccountsSection() {
  const accounts = await getDynamicAccounts()

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        🔄 Dynamic Data Fetching (Every Request)
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        This data is fetched on every request, ensuring it's always fresh.
        Useful for real-time data or user-specific content.
      </p>
      <div className="space-y-3">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <div key={account.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="font-medium text-gray-900">{account.account_name}</h3>
              <p className="text-sm text-gray-600">
                Created: {new Date(account.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No recent accounts found</p>
        )}
      </div>
    </section>
  )
}

// Loading component for Suspense fallback
function LoadingSection({ title }: { title: string }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <div className="animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 bg-gray-100">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Configure this page to revalidate every 60 seconds for the revalidated section
export const revalidate = 60

// Force dynamic rendering for demonstration
export const dynamic = 'force-dynamic'

// Main page component
export default async function SupabaseExamplesPage() {
  // Fetch revalidated data at page level
  const revalidatedAccounts = await getRevalidatedAccounts()

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Next.js 15 + Supabase Data Fetching Examples
        </h1>
        <p className="text-gray-600 mb-4">
          This page demonstrates various data fetching patterns using Next.js 15 App Router 
          with Supabase. Each section shows different caching strategies and approaches.
        </p>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Home
          </Link>
          <Link href="/supabase-examples/dynamic" className="text-blue-600 hover:text-blue-800 underline">
            Dynamic Example →
          </Link>
        </nav>
      </header>

      {/* Static data fetching with Suspense */}
      <Suspense fallback={<LoadingSection title="📊 Static Data Fetching (Loading...)" />}>
        <StaticAccountsSection />
      </Suspense>

      {/* Dynamic data fetching with Suspense */}
      <Suspense fallback={<LoadingSection title="🔄 Dynamic Data Fetching (Loading...)" />}>
        <DynamicAccountsSection />
      </Suspense>

      {/* Revalidated data (already fetched at page level) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          ⏰ Revalidated Data (60s Cache)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          This data is cached for 60 seconds and then revalidated in the background.
          It provides a balance between performance and freshness.
        </p>
        <div className="space-y-2">
          {revalidatedAccounts.length > 0 ? (
            revalidatedAccounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                <span className="font-medium">{account.account_name}</span>
                <span className="text-sm text-gray-600">{account.account_type}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No commercial accounts found</p>
          )}
        </div>
      </section>

      {/* Information section */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          🔧 Implementation Details
        </h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Static Section:</strong> Uses default caching (force-cache)</li>
          <li>• <strong>Dynamic Section:</strong> Uses Suspense for streaming</li>
          <li>• <strong>Revalidated Section:</strong> Page-level revalidate = 60 seconds</li>
          <li>• <strong>Server Components:</strong> All data fetching happens on the server</li>
          <li>• <strong>Error Handling:</strong> Built-in error boundaries and fallbacks</li>
        </ul>
      </section>
    </div>
  )
}
