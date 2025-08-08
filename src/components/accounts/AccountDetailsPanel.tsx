'use client'

export interface AccountDetailsPanelProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
}

export interface Account {
  id: string
  company_name: string
  [key: string]: unknown
}

export function AccountDetailsPanel({ account, isOpen = false, onClose }: AccountDetailsPanelProps) {
  // Early return for closed state
  if (!isOpen) return null

  return (
    <div data-testid="account-details-panel">
      {/* Header with close button if onClose exists */}
      {onClose && (
        <div className="flex justify-between items-center p-4 border-b">
          <h2>Account Details</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Content area */}
      <div className="p-4">
        {account ? (
          <div>
            {/* Display account data */}
            <pre>{JSON.stringify(account, null, 2)}</pre>
          </div>
        ) : (
          <div>No account data available</div>
        )}
      </div>
    </div>
  )
}
