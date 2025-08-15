'use client'

import React from 'react'
import { MasterViewLayout } from '@/components/master-view/MasterViewLayout'
import { AccountMasterView } from '@/components/accounts/AccountMasterView'
import { ServiceLocationsList } from '@/components/master-view/ServiceLocationsList'
import { MasterViewProvider, useMasterView } from '@/contexts/MasterViewContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useAccountSelection } from '@/hooks/useAccountSelection'

function AccountsMasterViewContent() {
  // Fetch real accounts from Supabase
  const { accounts, loading, error } = useAccounts()

  // Account selection state for column interactions
  const { selectedAccountId, toggleSelection } = useAccountSelection()

  // Get context functions for location selection
  const { setSelectedAccount, setSelectedLocation } = useMasterView()

  // Find the selected account for details panels
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)

  // Update context when account selection changes
  React.useEffect(() => {
    if (selectedAccount) {
      setSelectedAccount(
        selectedAccount.id,
        selectedAccount.company_name || selectedAccount.account_name || null
      )
    }
  }, [selectedAccountId, selectedAccount, setSelectedAccount])

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
            selectedAccountId={selectedAccountId}
            onAccountSelect={(account) => toggleSelection(account.id)}
          />
        </div>
      </div>

      {/* Column 2: Service Locations */}
      <div className="h-full flex flex-col bg-gray-50">
        <ServiceLocationsList
          accountId={selectedAccountId || ''}
          accountName={selectedAccount?.company_name || selectedAccount?.account_name || ''}
          onLocationSelect={(locationId) => {
            console.log('Location selected:', locationId)
            // Location selection will be fully implemented in Value Slice 2
          }}
          className="h-full"
        />
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
              Click the phone icon on any account card to view detailed contact information
              including names, emails, and phone numbers.
            </p>
          </div>
        </div>
      </div>
    </MasterViewLayout>
  )
}

export default function AccountsMasterViewPage() {
  return (
    <MasterViewProvider>
      <AccountsMasterViewContent />
    </MasterViewProvider>
  )
}
