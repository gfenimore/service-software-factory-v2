'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react'

interface MasterViewContextType {
  selectedAccountId: string | null
  selectedAccountName: string | null
  selectedLocationId: string | null
  setSelectedAccount: (id: string | null, name: string | null) => void
  setSelectedLocation: (id: string | null) => void
}

const MasterViewContext = createContext<MasterViewContextType | undefined>(undefined)

export function MasterViewProvider({ children }: { children: ReactNode }) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

  // Stabilize function references with useCallback
  const setSelectedAccount = useCallback((id: string | null, name: string | null) => {
    setSelectedAccountId(id)
    setSelectedAccountName(name)
    // Clear location selection when account changes
    setSelectedLocationId(null)
  }, [])

  const setSelectedLocation = useCallback((id: string | null) => {
    setSelectedLocationId(id)
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      selectedAccountId,
      selectedAccountName,
      selectedLocationId,
      setSelectedAccount,
      setSelectedLocation,
    }),
    [
      selectedAccountId,
      selectedAccountName,
      selectedLocationId,
      setSelectedAccount,
      setSelectedLocation,
    ]
  )

  return <MasterViewContext.Provider value={value}>{children}</MasterViewContext.Provider>
}

export function useMasterView() {
  const context = useContext(MasterViewContext)
  if (context === undefined) {
    throw new Error('useMasterView must be used within a MasterViewProvider')
  }
  return context
}
