'use client'

import { useState, useCallback } from 'react'
import type { Account } from '@/types/accountDetails.types'

export interface UseContactModalReturn {
  isOpen: boolean
  currentAccount: Account | null
  openModal: (account: Account) => void
  closeModal: () => void
  toggleModal: (account?: Account) => void
}

export function useContactModal(): UseContactModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)

  const openModal = useCallback((account: Account) => {
    setCurrentAccount(account)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    // Keep account data briefly for exit animation if needed
    setTimeout(() => {
      setCurrentAccount(null)
    }, 200)
  }, [])

  const toggleModal = useCallback((account?: Account) => {
    if (isOpen) {
      closeModal()
    } else if (account) {
      openModal(account)
    }
  }, [isOpen, openModal, closeModal])

  return {
    isOpen,
    currentAccount,
    openModal,
    closeModal,
    toggleModal
  }
}

// Additional hook for managing multiple modal types
export interface UseModalManagerReturn {
  activeModal: 'contact' | 'service' | 'financial' | 'notes' | null
  currentAccount: Account | null
  openModal: (type: 'contact' | 'service' | 'financial' | 'notes', account: Account) => void
  closeModal: () => void
  isModalOpen: (type?: 'contact' | 'service' | 'financial' | 'notes') => boolean
}

export function useModalManager(): UseModalManagerReturn {
  const [activeModal, setActiveModal] = useState<'contact' | 'service' | 'financial' | 'notes' | null>(null)
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)

  const openModal = useCallback((type: 'contact' | 'service' | 'financial' | 'notes', account: Account) => {
    // Close any existing modal first (only one modal at a time)
    if (activeModal) {
      setActiveModal(null)
      // Small delay to allow for transition
      setTimeout(() => {
        setActiveModal(type)
        setCurrentAccount(account)
      }, 100)
    } else {
      setActiveModal(type)
      setCurrentAccount(account)
    }
  }, [activeModal])

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setTimeout(() => {
      setCurrentAccount(null)
    }, 200)
  }, [])

  const isModalOpen = useCallback((type?: 'contact' | 'service' | 'financial' | 'notes') => {
    if (type) {
      return activeModal === type
    }
    return activeModal !== null
  }, [activeModal])

  return {
    activeModal,
    currentAccount,
    openModal,
    closeModal,
    isModalOpen
  }
}