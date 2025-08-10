'use client'
import { useState, useCallback } from 'react'

export interface UseAccountSelectionReturn {
  selectedAccountId: string | null
  isSelected: (accountId: string) => boolean
  selectAccount: (accountId: string) => void
  deselectAccount: () => void
  toggleSelection: (accountId: string) => void
}

export function useAccountSelection(): UseAccountSelectionReturn {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const isSelected = useCallback((accountId: string): boolean => {
    return selectedAccountId === accountId
  }, [selectedAccountId])

  const selectAccount = useCallback((accountId: string) => {
    setSelectedAccountId(accountId)
  }, [])

  const deselectAccount = useCallback(() => {
    setSelectedAccountId(null)
  }, [])

  const toggleSelection = useCallback((accountId: string) => {
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null)
    } else {
      setSelectedAccountId(accountId)
    }
  }, [selectedAccountId])

  return {
    selectedAccountId,
    isSelected,
    selectAccount,
    deselectAccount,
    toggleSelection
  }
}