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

export function AccountDetailsPanel({ account, isOpen, onClose }: AccountDetailsPanelProps) {
  return (
    <div data-testid="account-details-panel">
      Component Works!
    </div>
  )
}
