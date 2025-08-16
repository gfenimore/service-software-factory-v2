'use client'

import type { Account } from '@/types/accountDetails.types'
import { DetailActionIcons } from './DetailActionIcons'
import { Card } from '@/components/ui/Card'

export interface AccountCardProps {
  account: Account
  isSelected?: boolean
  onSelect?: (account: Account) => void
  onViewDetails?: () => void
  onContactClick?: () => void
  onServiceAgreementClick?: () => void
  onFinancialClick?: () => void
  onNotesClick?: () => void
}

export function AccountCard({
  account,
  isSelected,
  onSelect,
  onViewDetails,
  onContactClick,
  onServiceAgreementClick,
  onFinancialClick,
  onNotesClick,
}: AccountCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(account)
    }
  }

  return (
    <Card
      variant={isSelected ? 'selected' : 'default'}
      interactive={true}
      onClick={handleClick}
      className="mb-3"
    >
      <div data-testid="account-card">
        <div className="flex flex-col space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{account.company_name}</h3>

          <div className="text-xs text-gray-600">
            <div className="truncate">Contact: {account.contact_name || 'No contact'}</div>
            <div className="truncate">Location: {account.billing_city || 'No location'}</div>
          </div>
        </div>

        {/* Show detail action icons only when card is selected */}
        {isSelected && (
          <DetailActionIcons
            onContactClick={onContactClick}
            onServiceAgreementClick={onServiceAgreementClick}
            onFinancialClick={onFinancialClick}
            onNotesClick={onNotesClick}
          />
        )}
      </div>
    </Card>
  )
}
