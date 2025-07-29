import { Database } from '@/types/database'

// Base Account type from database
export type Account = Database['public']['Tables']['accounts']['Row']

// Account with additional display data (contact count)
export interface AccountDisplayData extends Account {
  contactCount: number
}

// Filter state for account dashboard
export interface AccountFilters {
  search: string
  status: 'All' | 'Active' | 'Inactive'
  accountType: 'All' | 'Commercial' | 'Residential'
}

// Pagination state for account dashboard
export interface PaginationState {
  page: number
  pageSize: 10 | 20 | 50
  total: number
}

// API response structure for accounts
export interface AccountsResponse {
  data: AccountDisplayData[]
  metadata: {
    total: number
    page: number
    pageSize: number
  }
}

// Component prop interfaces
export interface AccountsTableProps {
  data?: AccountDisplayData[]  // Made optional since component has defaults
  loading?: boolean
  error?: string | null
}

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export interface FilterDropdownsProps {
  filters: AccountFilters
  onFiltersChange: (filters: AccountFilters) => void
}

export interface PaginationProps {
  currentPage: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: 10 | 20 | 50) => void
}

// Custom hook return type
export interface UseAccountsDataReturn {
  data: AccountDisplayData[]
  loading: boolean
  error: string | null
  filters: AccountFilters
  pagination: PaginationState
  setFilters: (filters: Partial<AccountFilters>) => void
  setPagination: (pagination: Partial<PaginationState>) => void
  refetch: () => Promise<void>
}