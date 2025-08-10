import React from 'react';
import { ColumnContainer } from './ColumnContainer';

interface AccountsColumnHeaderProps {
  accountCount: number;
  isLoading?: boolean;
  hasError?: boolean;
  className?: string;
  onRefresh?: () => void;
  children?: React.ReactNode;
  width?: 'fixed-300' | 'fixed-400' | 'flexible';
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  scrollToTop?: boolean;
}

export const AccountsColumnHeader: React.FC<AccountsColumnHeaderProps> = ({
  accountCount,
  isLoading = false,
  hasError = false,
  className = '',
  onRefresh,
  children,
  width = 'fixed-300',
  onScroll,
  scrollToTop = false
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
    accountCount === 0 && !isLoading && !hasError && 'accounts-header--empty'
  ].filter(Boolean).join(' ');

  const headerComponent = (
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

  return (
    <ColumnContainer 
      width={width}
      header={headerComponent}
      className={className}
      onScroll={onScroll}
      scrollToTop={scrollToTop}
    >
      {children}
    </ColumnContainer>
  );
};

export default AccountsColumnHeader;