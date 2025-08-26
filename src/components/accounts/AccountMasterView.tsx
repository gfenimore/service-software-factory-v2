'use client'

import { useState } from 'react'
import type { Account } from '@/types/accountDetails.types'
import { AccountCard } from './AccountCard'
import { ContactDetailsModal } from './ContactDetailsModal'
import { useContactModal } from './useContactModal'

export interface AccountMasterViewProps {
  accounts: Account[]
  isLoading?: boolean
  error?: string | null
  selectedAccountId?: string | null
  onAccountSelect?: (account: Account) => void
}

export function AccountMasterView({
  accounts,
  isLoading,
  error,
  selectedAccountId: externalSelectedId,
  onAccountSelect,
}: AccountMasterViewProps) {
  // Use internal state if no external control provided
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)
  const selectedAccountId =
    externalSelectedId !== undefined ? externalSelectedId : internalSelectedId

  const { isOpen, currentAccount, openModal, closeModal } = useContactModal()

  const handleAccountSelect = (account: Account) => {
    if (onAccountSelect) {
      onAccountSelect(account)
    } else {
      setInternalSelectedId(account.id)
    }
  }

  const handleContactClick = (account: Account) => {
    openModal(account)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 text-sm">Loading accounts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500 text-sm">Error loading accounts: {error}</div>
      </div>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 text-sm">No accounts found</div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-y-auto flex-1 px-3 pb-3" data-testid="accounts-master-view">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isSelected={selectedAccountId === account.id}
            onSelect={handleAccountSelect}
            onContactClick={() => handleContactClick(account)}
            onServiceAgreementClick={() =>
              console.log('Service Agreement clicked for', account.company_name)
            }
            onFinancialClick={() => console.log('Financial clicked for', account.company_name)}
            onNotesClick={() => console.log('Notes clicked for', account.company_name)}
          />
        ))}
      </div>

      {/* Contact Details Modal */}
      <ContactDetailsModal isOpen={isOpen} onClose={closeModal} account={currentAccount} />
    </>
  )
}
