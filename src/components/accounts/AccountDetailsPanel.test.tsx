import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountDetailsPanel, Account, AccountDetailsPanelProps } from './AccountDetailsPanel';
import { AccountListItem } from '@/types/account';

// Mock account data for testing
const mockAccount: Account = {
  id: 'test-account-1',
  company_name: 'Test Company Inc.',
  status: 'Active',
  type: 'Commercial'
};

const mockAccountListItem: AccountListItem = {
  id: 'test-account-2',
  name: 'Test Company LLC',
  status: 'Active',
  type: 'Residential',
  city: 'Test City'
};

// Default props for testing
const defaultProps: AccountDetailsPanelProps = {
  account: null,
  isOpen: false,
  onClose: jest.fn()
};

describe('AccountDetailsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // T-001 Proof of Life Test - Component renders without error
  it('renders without error when closed', () => {
    render(<AccountDetailsPanel {...defaultProps} />);
    // Should not render anything when closed
    expect(screen.queryByTestId('details-panel')).not.toBeInTheDocument();
  });

  // T-001 Proof of Life Test - Panel shows when open
  it('renders details panel when open', () => {
    render(<AccountDetailsPanel {...defaultProps} isOpen={true} />);
    expect(screen.getByTestId('details-panel')).toBeInTheDocument();
  });

  // T-001 Core requirement - Shows "Panel Works!" message
  it('displays "Panel Works!" message when open', () => {
    render(<AccountDetailsPanel {...defaultProps} isOpen={true} />);
    expect(screen.getByText('Panel Works!')).toBeInTheDocument();
  });

  // T-001 Close functionality test
  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <AccountDetailsPanel 
        {...defaultProps} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );

    const closeButton = screen.getByLabelText('Close account details');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // T-001 Accessibility test - Basic ARIA attributes
  it('has proper accessibility attributes', () => {
    render(<AccountDetailsPanel {...defaultProps} isOpen={true} />);
    
    const panel = screen.getByTestId('details-panel');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-labelledby', 'details-title');
    expect(panel).toHaveAttribute('aria-describedby', 'details-content');
  });

  // T-001 Props validation - Account with company_name
  it('displays account company name when Account type provided', () => {
    render(
      <AccountDetailsPanel 
        {...defaultProps} 
        account={mockAccount} 
        isOpen={true} 
      />
    );

    expect(screen.getByText(/Test Company Inc\./)).toBeInTheDocument();
  });

  // T-001 Props validation - AccountListItem with name
  it('displays account name when AccountListItem type provided', () => {
    render(
      <AccountDetailsPanel 
        {...defaultProps} 
        account={mockAccountListItem} 
        isOpen={true} 
      />
    );

    expect(screen.getByText(/Test Company LLC/)).toBeInTheDocument();
  });

  // T-001 Debug functionality test
  it('logs debug information when debug is enabled', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(
      <AccountDetailsPanel 
        {...defaultProps} 
        account={mockAccount}
        isOpen={true} 
        debug={true}
      />
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      '[AccountDetailsPanel] Mounted with:',
      expect.objectContaining({
        account: mockAccount,
        isOpen: true
      })
    );

    consoleSpy.mockRestore();
  });

  // T-001 Window debug object test
  it('sets window debug object when debug enabled', () => {
    render(
      <AccountDetailsPanel 
        {...defaultProps} 
        account={mockAccount}
        isOpen={true} 
        debug={true}
      />
    );

    const windowWithDebug = window as unknown as Record<string, unknown>;
    expect(windowWithDebug.__DEBUG_PANEL__).toBeDefined();
    expect((windowWithDebug.__DEBUG_PANEL__ as Record<string, unknown>).account).toBe(mockAccount);
    expect((windowWithDebug.__DEBUG_PANEL__ as Record<string, unknown>).isOpen).toBe(true);
  });
});
