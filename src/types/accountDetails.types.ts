export interface AccountDetailsPanelProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
}

export interface Account {
  id: string
  company_name: string
  contact_name?: string
  billing_city?: string | null
  status?: 'Active' | 'Inactive'
  account_type?: 'Residential' | 'Commercial'
  // Additional props for extensibility
  [key: string]: unknown
}

export interface AccountCardProps {
  onViewDetails?: () => void
}

export interface UseAccountDetailsReturn {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
  openDetailsFor: (account: Account) => void
  closeDetails: () => void
}

export interface MasterViewState {
  detailsState: UseAccountDetailsReturn
  // existing state...
}

export interface AccountDetailsState {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
}

export interface DebugProps {
  debug?: boolean
}
