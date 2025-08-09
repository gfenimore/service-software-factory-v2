import React from 'react';

interface AccountsColumnHeaderProps {
  accountCount: number;
  isLoading?: boolean;
  hasError?: boolean;
  className?: string;
  onRefresh?: () => void;
}

export const AccountsColumnHeader: React.FC<AccountsColumnHeaderProps> = ({
  accountCount,
  isLoading = false,
  hasError = false,
  className = '',
  onRefresh
}) => {
  const getDisplayText = () => {
    if (hasError) return 'Accounts (Error)';
    if (isLoading) return 'Accounts (Loading...)';
    return `Accounts (${accountCount})`;
  };

  const getStatusIcon = () => {
    if (hasError) return '⚠️';
    if (isLoading) return '⏳';
    if (accountCount === 0) return '📭';
    return '📊';
  };

  const headerClasses = [
    'accounts-header',
    isLoading && 'accounts-header--loading',
    hasError && 'accounts-header--error',
    accountCount === 0 && !isLoading && !hasError && 'accounts-header--empty',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      <h2 className="accounts-header__title">
        <span className="accounts-header__icon" role="img" aria-label="status">
          {getStatusIcon()}
        </span>
        <span className="accounts-header__text">
          {getDisplayText()}
        </span>
      </h2>
      {hasError && onRefresh && (
        <button 
          className="accounts-header__refresh-btn"
          onClick={onRefresh}
          aria-label="Refresh accounts"
          type="button"
        >
          🔄 Retry
        </button>
      )}
      {!isLoading && !hasError && accountCount === 0 && (
        <p className="accounts-header__empty-message">
          No accounts found
        </p>
      )}
    </div>
  );
};

export default AccountsColumnHeader;