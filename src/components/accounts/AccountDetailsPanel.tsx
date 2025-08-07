import React from 'react';
import { AccountListItem } from '@/types/account';

// Interface from architecture document - Account with flexible properties
export interface Account {
  id: string;
  company_name: string;
  [key: string]: unknown;
}

// Props interface for AccountDetailsPanel component
export interface AccountDetailsPanelProps {
  account: Account | AccountListItem | null;
  isOpen: boolean;
  onClose: () => void;
  debug?: boolean;
}

/**
 * AccountDetailsPanel - T-001: Component shell for displaying account details
 * 
 * This is the minimal implementation for Value Slice 1.
 * Provides foundational container with close functionality.
 * 
 * Current capabilities:
 * - Renders when isOpen is true
 * - Shows "Panel Works!" proof of life message
 * - Has close button functionality
 * - Includes basic accessibility attributes
 */
export const AccountDetailsPanel: React.FC<AccountDetailsPanelProps> = ({
  account,
  isOpen,
  onClose,
  debug = false
}) => {
  // Debug logging when enabled
  React.useEffect(() => {
    if (debug) {
      console.log(`[AccountDetailsPanel] Mounted with:`, { account, isOpen });
      (window as unknown as Record<string, unknown>).__DEBUG_PANEL__ = { 
        account, 
        isOpen, 
        props: { account, isOpen, onClose } 
      };
    }
  }, [account, isOpen, onClose, debug]);

  // Don't render anything if panel is closed
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="details-title"
      aria-describedby="details-content"
      data-testid="details-panel"
      className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-lg border-l border-gray-200 z-50"
    >
      {/* Panel Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 id="details-title" className="text-lg font-semibold text-gray-900">
          Account Details
        </h2>
        <button
          aria-label="Close account details"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <span className="text-gray-500 text-xl font-light">×</span>
        </button>
      </div>

      {/* Panel Content - Minimal "Panel Works!" implementation */}
      <div id="details-content" className="p-4">
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Panel Works!</p>
          {account && (
            <div className="mt-4 text-sm text-gray-500">
              <p>Account loaded: {(account as Account).company_name || (account as AccountListItem).name || account.id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsPanel;
