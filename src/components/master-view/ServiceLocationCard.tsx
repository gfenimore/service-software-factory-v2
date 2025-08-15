import React from 'react'
import { ServiceLocationCardProps } from '@/types/serviceLocation.types'

// Key icon component for access information
const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
)

export const ServiceLocationCard: React.FC<ServiceLocationCardProps> = ({
  location,
  className,
}) => {
  return (
    <div
      className={`border rounded-lg p-4 hover:border-gray-400 transition-colors ${className || ''}`}
      data-testid={`location-card-${location.id}`}
    >
      {/* Location Name - Prominent with Primary Badge */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{location.location_name}</h4>
        {location.is_primary && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-medium">
            PRIMARY
          </span>
        )}
      </div>

      {/* Address Block */}
      <div className="text-sm text-gray-600 space-y-1">
        <div>{location.street_address}</div>
        <div>
          {location.city}, {location.state} {location.postal_code}
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Status badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
            ${location.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
            ${location.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : ''}
            ${location.status === 'On-Hold' ? 'bg-yellow-100 text-yellow-800' : ''}
          `}
          >
            {location.status}
          </span>

          {/* Access Info Indicator */}
          {location.access_information && (
            <div className="flex items-center text-xs text-gray-500">
              <KeyIcon className="w-3 h-3 mr-1" />
              <span>Access info available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
