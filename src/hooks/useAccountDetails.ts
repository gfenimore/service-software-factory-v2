'use client'
import { useState, useCallback } from 'react'

export interface UseAccountDetailsReturn {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
  openDetailsFor: (account: Account) => void
  closeDetails: () => void
}

interface Account {
  id: string
  company_name: string
  [key: string]: unknown
}

export function useAccountDetails(): UseAccountDetailsReturn {
  const [selectedAccountForDetails, setSelectedAccountForDetails] = useState<Account | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const openDetailsFor = useCallback((account: Account) => {
    setSelectedAccountForDetails(account)
    setIsDetailsOpen(true)
  }, [])

  const closeDetails = useCallback(() => {
    setSelectedAccountForDetails(null)
    setIsDetailsOpen(false)
  }, [])

  return {
    selectedAccountForDetails,
    isDetailsOpen,
    openDetailsFor,
    closeDetails
  }
}
