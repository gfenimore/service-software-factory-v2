'use client'

import React from 'react'
import { MasterViewLayout } from '@/components/master-view/MasterViewLayout'
import { AccountMasterView } from '@/components/accounts/AccountMasterView'
import { ServiceLocationsList } from '@/components/master-view/ServiceLocationsList'
import { WorkOrdersList } from '@/components/work-orders/WorkOrdersList'
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

  // Location selection state for Column 3
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(null)
  const [selectedLocationName, setSelectedLocationName] = React.useState<string | null>(null)

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
    // Clear location selection when account changes
    setSelectedLocationId(null)
    setSelectedLocationName(null)
  }, [selectedAccountId, selectedAccount, setSelectedAccount]) // setSelectedAccount is now stable from useCallback

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
          onLocationSelect={(location) => {
            // Only update if actually changing
            if (selectedLocationId !== location.id) {
              setSelectedLocationId(location.id)
              setSelectedLocationName(location.name)
              setSelectedLocation(location.id)
            }
          }}
          className="h-full"
        />
      </div>

      {/* Column 3: Work Orders */}
      <div className="h-full flex flex-col bg-gray-50">
        <WorkOrdersList
          locationId={selectedLocationId || ''}
          locationName={selectedLocationName || ''}
          onWorkOrderSelect={(workOrderId) => {
            console.log('Work order selected:', workOrderId)
            // Future enhancement: Could trigger actions or updates
          }}
          className="h-full"
        />
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
