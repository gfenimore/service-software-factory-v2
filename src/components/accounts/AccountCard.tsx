import React from 'react';
import { AccountListItem } from '@/types/account';

// Props interface for AccountCard component  
export interface AccountCardProps {
  account: AccountListItem;
  onViewDetails?: () => void;
}

/**
 * AccountCard - T-002: Individual account card component with View Details button
 * 
 * This is the minimal implementation for Value Slice 1.
 * Displays basic account information with "View Details" trigger.
 * 
 * Current capabilities:
 * - Shows account name, status, type, city
 * - Has "View Details" button that calls onViewDetails callback
 * - Uses existing design patterns from accounts-list
 */
export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onViewDetails
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Account Name */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {account.name}
        </h3>
        
        {/* Status Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            account.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {account.status}
        </span>
      </div>

      {/* Account Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Type:</span>
          <span className="text-gray-900">{account.type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">City:</span>
          <span className="text-gray-900">{account.city}</span>
        </div>
      </div>

      {/* View Details Button - T-002 Implementation */}
      <button
        onClick={onViewDetails}
        aria-label={`View details for ${account.name}`}
        className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        type="button"
      >
        View Details
      </button>
    </div>
  );
};

export default AccountCard;
