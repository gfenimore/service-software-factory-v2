'use client'

import { MasterViewLayout } from '@/components/master-view/MasterViewLayout'
import { AccountMasterView } from '@/components/accounts/AccountMasterView'
import { useAccounts } from '@/hooks/useAccounts'
import { useAccountSelection } from '@/hooks/useAccountSelection'

export default function AccountsMasterViewPage() {
  // Fetch real accounts from Supabase
  const { accounts, loading, error } = useAccounts()
  
  // Account selection state for column interactions
  const { selectedAccountId, toggleSelection } = useAccountSelection()
  
  // Find the selected account for details panels
  const selectedAccount = accounts.find(a => a.id === selectedAccountId)
  
  return (
    <MasterViewLayout>
      {/* Column 1: Accounts with Contact Details Modal */}
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Accounts</h2>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading...' : `${accounts.length} accounts`}
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <AccountMasterView
            accounts={accounts}
            isLoading={loading}
            error={error}
          />
        </div>
      </div>
      
      {/* Column 2: Placeholder for future features */}
      <div className="h-full flex flex-col bg-gray-50">
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedAccount ? selectedAccount.company_name : 'Select an account'}
          </p>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {selectedAccount ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Account Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="text-sm text-gray-900">{selectedAccount.company_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                  <dd className="text-sm text-gray-900">{selectedAccount.account_type || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedAccount.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedAccount.status || 'Unknown'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="text-sm text-gray-900">{selectedAccount.billing_city || 'Not specified'}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
              <p>Select an account from the list to view details</p>
              <p className="text-sm mt-2">Click the contact icon to view contact information</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Column 3: Placeholder for additional context/actions */}
      <div className="h-full flex flex-col bg-gray-50">
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
          <p className="text-sm text-gray-500 mt-1">Quick actions and tools</p>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                📊 Generate Report
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                📧 Send Email
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                📅 Schedule Meeting
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                📝 Add Note
              </button>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Contact Details Available</h4>
            <p className="text-xs text-blue-700">
              Click the phone icon on any account card to view detailed contact information including names, emails, and phone numbers.
            </p>
          </div>
        </div>
      </div>
    </MasterViewLayout>
  )
}