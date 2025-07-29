import { AccountsTableProps, AccountDisplayData } from '@/types/accounts'

// Mock data for initial development
const mockAccounts: AccountDisplayData[] = [
  {
    id: '1',
    account_name: 'ABC Pest Control',
    account_type: 'Commercial',
    status: 'Active',
    billing_city: 'Miami',
    billing_state: 'FL',
    billing_street_address: '123 Main St',
    billing_zip_code: '33101',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    contactCount: 3
  },
  {
    id: '2',
    account_name: 'XYZ Services Inc',
    account_type: 'Residential',
    status: 'Inactive',
    billing_city: 'Orlando',
    billing_state: 'FL',
    billing_street_address: '456 Oak Ave',
    billing_zip_code: '32801',
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:20:00Z',
    contactCount: 1
  }
]

export default function AccountsTable({ 
  data = mockAccounts, 
  loading = false, 
  error = null 
}: AccountsTableProps) {
  
  if (loading) {
    return <AccountsTableSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="polite">
        <p className="text-red-700">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table 
          className="min-w-full divide-y divide-gray-200" 
          role="table" 
          aria-label="Accounts listing"
          aria-describedby="accounts-description"
        >
          <caption className="sr-only" id="accounts-description">
            List of service accounts with their details including name, type, status, location, contact count, and creation date
          </caption>
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
                aria-sort="none"
              >
                Account Name
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
                aria-sort="none"
              >
                Type
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
                aria-sort="none"
              >
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
                aria-sort="none"
              >
                City
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
                aria-sort="none"
              >
                Contacts
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
                aria-sort="none"
              >
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((account) => (
              <AccountTableRow key={account.id} account={account} />
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12" role="status" aria-live="polite">
          <p className="text-gray-500">No accounts found</p>
        </div>
      )}
    </div>
  )
}

function AccountTableRow({ account }: { account: AccountDisplayData }) {
  return (
    <tr className="hover:bg-gray-50 focus-within:bg-gray-50" tabIndex={0}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900" role="gridcell">
          {account.account_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900" role="gridcell">
          {account.account_type || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span 
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            account.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
          role="gridcell"
          aria-label={`Account status: ${account.status || 'Unknown'}`}
        >
          {account.status || 'Unknown'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900" role="gridcell">
          {account.billing_city || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div 
          className="text-sm text-gray-900" 
          role="gridcell"
          aria-label={`${account.contactCount} contacts`}
        >
          {account.contactCount}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div 
          className="text-sm text-gray-900" 
          role="gridcell"
          aria-label={`Created on ${new Date(account.created_at).toLocaleDateString()}`}
        >
          {new Date(account.created_at).toLocaleDateString()}
        </div>
      </td>
    </tr>
  )
}

function AccountsTableSkeleton() {
  return (
    <div 
      data-testid="accounts-skeleton" 
      className="bg-white rounded-lg shadow overflow-hidden"
      role="status"
      aria-label="Loading accounts"
      aria-live="polite"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" aria-hidden="true">
          <thead className="bg-gray-50">
            <tr>
              {['Account Name', 'Type', 'Status', 'City', 'Contacts', 'Created'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[1, 2, 3].map((index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sr-only">Loading accounts data, please wait...</div>
    </div>
  )
}