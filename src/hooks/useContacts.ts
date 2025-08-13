import { useState, useEffect } from 'react'
import type { Database } from '@/lib/supabase/database.types'

type Contact = Database['public']['Tables']['contacts']['Row']

export function useContacts(accountId: string | undefined) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accountId) {
      setContacts([])
      setLoading(false)
      return
    }

    const fetchContacts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use API route for server-side data fetching
        console.log('🔍 Fetching contacts for account:', accountId)
        const response = await fetch(`/api/accounts/${accountId}/contacts`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch contacts')
        }
        
        const data = await response.json()
        console.log('✅ Found', data.contacts?.length || 0, 'contacts')
        setContacts(data.contacts || [])
      } catch (err) {
        console.error('Error fetching contacts:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setContacts([])
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [accountId])

  return { contacts, loading, error }
}