'use client'

import { AccountMasterView } from '@/components/accounts/AccountMasterView'
import { useAccounts } from '@/hooks/useAccounts'
import type { Account } from '@/types/accountDetails.types'

// Fallback mock data if database is not available
const fallbackAccounts: Account[] = [
  {
    id: '1',
    account_number: 'ACC-001234',
    company_name: 'ABC Manufacturing Co',
    contact_name: 'John Smith',
    contact_email: 'john@abcmfg.com',
    contact_phone: '(555) 123-4567',
    billing_address_1: '123 Industrial Way',
    billing_address_2: 'Suite 100',
    billing_city: 'Portland',
    billing_state: 'OR',
    billing_zip: '97201',
    billing_country: 'USA',
    service_address_1: '123 Industrial Way',
    service_address_2: 'Suite 100',
    service_city: 'Portland',
    service_state: 'OR',
    service_zip: '97201',
    service_country: 'USA',
    account_type: 'Commercial',
    status: 'Active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-19T15:30:00Z'
  },
  {
    id: '2',
    account_number: 'ACC-001235',
    company_name: 'XYZ Services LLC',
    contact_name: 'Jane Doe',
    contact_email: 'jane@xyzservices.com',
    contact_phone: '(555) 987-6543',
    billing_address_1: '456 Commerce St',
    billing_city: 'Seattle',
    billing_state: 'WA',
    billing_zip: '98101',
    billing_country: 'USA',
    service_address_1: '456 Commerce St',
    service_city: 'Seattle',
    service_state: 'WA',
    service_zip: '98101',
    service_country: 'USA',
    account_type: 'Commercial',
    status: 'Active',
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-12-18T14:20:00Z'
  },
  {
    id: '3',
    account_number: 'ACC-001236',
    company_name: 'Tech Innovations Inc',
    contact_name: 'Bob Johnson',
    contact_email: 'bob@techinnovations.com',
    contact_phone: '(555) 246-8135',
    billing_address_1: '789 Digital Drive',
    billing_city: 'San Francisco',
    billing_state: 'CA',
    billing_zip: '94105',
    billing_country: 'USA',
    service_address_1: '789 Digital Drive',
    service_city: 'San Francisco',
    service_state: 'CA',
    service_zip: '94105',
    service_country: 'USA',
    account_type: 'Commercial',
    status: 'Active',
    created_at: '2024-03-10T11:30:00Z',
    updated_at: '2024-12-17T16:45:00Z'
  }
]

export default function US005Slice1TestPage() {
  const { accounts, loading, error } = useAccounts()
  
  // Use real accounts if available, otherwise use fallback
  const displayAccounts = accounts.length > 0 ? accounts : fallbackAccounts
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            US-005 Slice 1: Account Selection with Details Modal
          </h1>
          <p className="text-gray-600 mt-2">
            Test implementation of T-001 through T-004
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">How to test:</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Click on any account card to select it</li>
              <li>When selected, detail action icons will appear at the bottom of the card</li>
              <li>Click the phone icon to open the Contact Details modal</li>
              <li>Press ESC or click outside the modal to close it</li>
              <li>Try selecting different accounts and opening their contact details</li>
            </ol>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading accounts from Supabase...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
            <p className="font-bold">Database Connection Issue</p>
            <p className="text-sm">Using fallback data. Error: {error}</p>
            <p className="text-xs mt-2">Make sure accounts table exists in Supabase</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Accounts Column</h2>
            <span className="text-sm text-gray-500">
              Data: {accounts.length > 0 ? '✅ Supabase' : '⚠️ Fallback'}
            </span>
          </div>
          <div className="h-[600px]" data-testid="t004-integration">
            <AccountMasterView
              accounts={displayAccounts}
              isLoading={loading}
              error={error}
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">✅ Tasks Completed:</h3>
          <ul className="space-y-1 text-sm text-green-800">
            <li>T-001: Enhanced AccountCard with detail action icons</li>
            <li>T-002: Created ContactDetailsModal component</li>
            <li>T-003: Implemented useContactModal hook</li>
            <li>T-004: Connected contact icon to modal display</li>
          </ul>
        </div>
      </div>
    </div>
  )
}