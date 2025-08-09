'use client'

import type { Account } from '@/types/accountDetails.types'

export interface AccountCardProps {
  account: Account
  isSelected?: boolean
  onSelect?: (account: Account) => void
  onViewDetails?: () => void
}

export function AccountCard({ account, isSelected, onSelect, onViewDetails }: AccountCardProps) {
  return (
    <div data-testid="account-card">
      Component Works!
    </div>
  )
}
