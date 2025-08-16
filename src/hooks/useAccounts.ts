import { useState, useEffect } from 'react'
import type { Account } from '@/types/accountDetails.types'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔍 Fetching accounts via API route...')

        // Use API route which runs on server with proper keys
        const response = await fetch('/api/accounts')
        const data = await response.json()

        console.log('API response:', data)

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch accounts')
        }

        // Transform to match Account type
        const transformedAccounts: Account[] = (data.accounts || []).map((acc: any) => ({
          id: acc.id,
          account_number: acc.account_number,
          company_name: acc.account_name, // Map account_name to company_name for UI compatibility
          account_name: acc.account_name,
          contact_name: acc.contact_name,
          contact_email: acc.contact_email,
          contact_phone: acc.contact_phone,
          billing_address_1: acc.billing_address_1,
          billing_address_2: acc.billing_address_2,
          billing_city: acc.billing_city,
          billing_state: acc.billing_state,
          billing_zip: acc.billing_zip,
          billing_country: acc.billing_country,
          service_address_1: acc.service_address_1,
          service_address_2: acc.service_address_2,
          service_city: acc.service_city,
          service_state: acc.service_state,
          service_zip: acc.service_zip,
          service_country: acc.service_country,
          account_type: acc.account_type,
          status: acc.status,
          created_at: acc.created_at,
          updated_at: acc.updated_at,
        }))

        console.log('✅ Successfully fetched', transformedAccounts.length, 'accounts')
        setAccounts(transformedAccounts)
      } catch (err) {
        console.error('❌ Error fetching accounts:', err)
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
              ? String((err as any).message)
              : 'Failed to fetch accounts'
        setError(errorMessage)

        // Fallback to mock data if database not ready
        setAccounts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  return { accounts, loading, error }
}
