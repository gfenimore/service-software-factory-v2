import { Suspense } from 'react'
import AccountsTable from '@/components/accounts/AccountsTable'

export default async function AccountsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await the searchParams Promise (Next.js 15 requirement)
  const params = await searchParams
  
  // Helper function to get first value
  const getParam = (param: string | string[] | undefined): string | undefined => {
    return Array.isArray(param) ? param[0] : param
  }

  // Convert to single values
  const cleanParams = {
    page: getParam(params.page),
    search: getParam(params.search),
    status: getParam(params.status),
    accountType: getParam(params.accountType),
    pageSize: getParam(params.pageSize),
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Accounts Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your service accounts</p>
      </div>
      
      <Suspense fallback={<AccountsLoadingSkeleton />}>
        <AccountsContent params={cleanParams} />
      </Suspense>
    </div>
  )
}

async function AccountsContent({
  params
}: {
  params: { 
    page?: string
    search?: string 
    status?: string
    accountType?: string
    pageSize?: string
  }
}) {
  try {
    // For now, use the AccountsTable with default mock data
    // Later we'll connect to the API using these params
    return (
      <AccountsErrorBoundary>
        <div className="space-y-6">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <strong>Development Note:</strong> Currently showing mock data. 
            Search params: {JSON.stringify(params, null, 2)}
          </div>
          
          <AccountsTable />
        </div>
      </AccountsErrorBoundary>
    )
  } catch (error) {
    return <AccountsErrorState error={error} onRetry={() => window.location.reload()} />
  }
}

function AccountsLoadingSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
}

function AccountsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[400px]">
      {children}
    </div>
  )
}

function AccountsErrorState({ 
  error, 
  onRetry 
}: { 
  error: unknown
  onRetry: () => void 
}) {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Accounts</h3>
      <p className="text-red-700 mb-4">{errorMessage}</p>
      <div className="flex justify-center gap-3">
        <button 
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}