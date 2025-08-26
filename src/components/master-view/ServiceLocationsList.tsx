'use client'

import React from 'react'
import { ServiceLocationsListProps } from '@/types/serviceLocation.types'
import { useServiceLocations } from '@/hooks/useServiceLocations'
import { ServiceLocationCard } from './ServiceLocationCard'

// Loading skeleton component
const LocationsLoadingSkeleton: React.FC = () => (
  <div className="p-4 space-y-3">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Error state component
const LocationsErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="p-4">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-700 mb-2">Failed to load locations</p>
      <p className="text-sm text-red-600 mb-3">{message}</p>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
      >
        Retry
      </button>
    </div>
  </div>
)

// Empty state component
const LocationsEmptyState: React.FC<{ accountName: string }> = ({ accountName }) => (
  <div className="p-4">
    <div className="text-center py-8 text-gray-500">
      <svg
        className="mx-auto h-12 w-12 text-gray-400 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      <p className="text-sm">No service locations found for {accountName}</p>
    </div>
  </div>
)

export const ServiceLocationsList: React.FC<ServiceLocationsListProps> = ({
  accountId,
  accountName,
  onLocationSelect,
  className,
}) => {
  const { locations, loading, error, refetch } = useServiceLocations({
    accountId,
    enabled: !!accountId,
  })

  // Track selected location for visual feedback
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(null)

  // Clear selection when account changes
  React.useEffect(() => {
    setSelectedLocationId(null)
  }, [accountId])

  // No account selected
  if (!accountId) {
    return (
      <div className={`${className} p-4 text-center text-gray-500`}>
        Select an account to view service locations
      </div>
    )
  }

  // Loading state
  if (loading) {
    return <LocationsLoadingSkeleton />
  }

  // Error state
  if (error) {
    return <LocationsErrorState message={error} onRetry={refetch} />
  }

  // Empty state
  if (locations.length === 0) {
    return <LocationsEmptyState accountName={accountName} />
  }

  // Render location cards
  return (
    <div className={className} data-testid="service-locations-list">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          {locations.length} location{locations.length !== 1 ? 's' : ''} for {accountName}
        </h3>
        <div className="space-y-2">
          {locations.map((location) => (
            <div
              key={location.id}
              onClick={() => {
                setSelectedLocationId(location.id)
                onLocationSelect?.({ id: location.id, name: location.location_name })
              }}
              className={`cursor-pointer rounded-lg transition-all ${
                selectedLocationId === location.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <ServiceLocationCard location={location} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
