import { Suspense } from 'react'

export default async function AccountsPage({
  searchParams
}: {
  searchParams: { 
    page?: string
    search?: string 
    status?: string
    accountType?: string
    pageSize?: string
  }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Accounts Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your service accounts</p>
      </div>
      
      <Suspense fallback={<AccountsLoadingSkeleton />}>
        <AccountsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function AccountsContent({
  searchParams
}: {
  searchParams: { 
    page?: string
    search?: string 
    status?: string
    accountType?: string
    pageSize?: string
  }
}) {
  // For now, just show the parameters - we'll connect to API in later tasks
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Accounts Table (Coming Soon)</h2>
      <div className="text-sm text-gray-600">
        <p>Current search params:</p>
        <pre className="mt-2 bg-gray-100 p-3 rounded">
          {JSON.stringify(searchParams, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function AccountsLoadingSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}