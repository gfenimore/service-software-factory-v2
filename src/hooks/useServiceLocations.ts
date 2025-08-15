import { useState, useEffect } from 'react'
import {
  ServiceLocation,
  UseServiceLocationsResult,
  UseServiceLocationsOptions,
} from '@/types/serviceLocation.types'
import { createClient } from '@/lib/supabase/client'

export function useServiceLocations(
  options: UseServiceLocationsOptions
): UseServiceLocationsResult {
  const { accountId, enabled = true } = options
  const [locations, setLocations] = useState<ServiceLocation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = async () => {
    if (!accountId || !enabled) {
      setLocations([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Query service_locations table for active locations by account_id
      const { data, error: queryError } = await supabase
        .from('service_locations')
        .select('*')
        .eq('account_id', accountId)
        .eq('status', 'Active')
        .order('is_primary', { ascending: false })
        .order('location_name', { ascending: true })

      if (queryError) {
        console.error('Supabase query error:', queryError)
        throw new Error(queryError.message)
      }

      // Map database fields to our interface (handle any naming differences)
      const mappedLocations: ServiceLocation[] = (data || []).map((loc) => ({
        id: loc.id,
        account_id: loc.account_id,
        location_name: loc.location_name,
        street_address: loc.street_address,
        city: loc.city,
        state: loc.state,
        postal_code: loc.postal_code,
        access_information: loc.access_information,
        is_primary: loc.is_primary || false,
        status: loc.status as 'Active' | 'Inactive' | 'On-Hold',
        created_at: loc.created_at,
        updated_at: loc.updated_at,
      }))

      setLocations(mappedLocations)
    } catch (err) {
      console.error('Error fetching service locations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch locations')
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchLocations()
  }

  useEffect(() => {
    fetchLocations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, enabled])

  return {
    locations,
    loading,
    error,
    refetch,
  }
}
