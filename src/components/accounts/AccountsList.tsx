'use client'

import type { Account } from '@/types/accountDetails.types'
import { AccountCard } from './AccountCard'

export interface AccountsListProps {
  accounts: Account[]
  isLoading?: boolean
  error?: string | null
  selectedAccountId?: string | null
  onAccountSelect?: (account: Account) => void
}

export function AccountsList({ 
  accounts, 
  isLoading, 
  error, 
  selectedAccountId, 
  onAccountSelect 
}: AccountsListProps) {
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
    <div className="overflow-y-auto flex-1 px-3 pb-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          isSelected={selectedAccountId === account.id}
          onSelect={onAccountSelect}
        />
      ))}
    </div>
  )
}