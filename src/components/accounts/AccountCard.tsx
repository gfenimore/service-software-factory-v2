'use client'

import type { Account } from '@/types/accountDetails.types'
import { DetailActionIcons } from './DetailActionIcons'

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
  onNotesClick
}: AccountCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(account)
    }
  }

  return (
    <div 
      data-testid="account-card"
      onClick={handleClick}
      className={`
        bg-white border rounded-lg p-4 mb-3 cursor-pointer transition-all duration-200
        hover:shadow-md hover:bg-gray-50
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200'
        }
      `}
    >
      <div className="flex flex-col space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm truncate">
          {account.company_name}
        </h3>
        
        <div className="text-xs text-gray-600">
          <div className="truncate">
            Contact: {account.contact_name || 'No contact'}
          </div>
          <div className="truncate">
            Location: {account.billing_city || 'No location'}
          </div>
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
  )
}
