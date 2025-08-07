import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountCard } from './AccountCard';
import { AccountListItem } from '@/types/account';

// Mock account data for testing
const mockAccount: AccountListItem = {
  id: 'test-account-1',
  name: 'Test Company Inc.',
  status: 'Active',
  type: 'Commercial',
  city: 'Test City'
};

describe('AccountCard', () => {
  it('renders without error', () => {
    render(<AccountCard account={mockAccount} />);
    expect(screen.getByText('Test Company Inc.')).toBeInTheDocument();
  });

  it('displays account information correctly', () => {
    render(<AccountCard account={mockAccount} />);
    
    // Check account name
    expect(screen.getByText('Test Company Inc.')).toBeInTheDocument();
    
    // Check status badge
    expect(screen.getByText('Active')).toBeInTheDocument();
    
    // Check type
    expect(screen.getByText('Commercial')).toBeInTheDocument();
    
    // Check city
    expect(screen.getByText('Test City')).toBeInTheDocument();
  });

  it('shows View Details button', () => {
    render(<AccountCard account={mockAccount} />);
    
    const viewDetailsButton = screen.getByRole('button', { name: /view details for test company inc/i });
    expect(viewDetailsButton).toBeInTheDocument();
    expect(viewDetailsButton).toHaveTextContent('View Details');
  });

  it('calls onViewDetails when View Details button is clicked', () => {
    const mockOnViewDetails = jest.fn();
    render(<AccountCard account={mockAccount} onViewDetails={mockOnViewDetails} />);
    
    const viewDetailsButton = screen.getByRole('button', { name: /view details for test company inc/i });
    fireEvent.click(viewDetailsButton);
    
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('handles missing onViewDetails prop gracefully', () => {
    render(<AccountCard account={mockAccount} />);
    
    const viewDetailsButton = screen.getByRole('button', { name: /view details for test company inc/i });
    
    // Should not throw error when clicked without onViewDetails
    expect(() => fireEvent.click(viewDetailsButton)).not.toThrow();
  });

  it('shows inactive status styling', () => {
    const inactiveAccount = { ...mockAccount, status: 'Inactive' as const };
    render(<AccountCard account={inactiveAccount} />);
    
    const statusBadge = screen.getByText('Inactive');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('shows active status styling', () => {
    render(<AccountCard account={mockAccount} />);
    
    const statusBadge = screen.getByText('Active');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('has proper accessibility attributes', () => {
    render(<AccountCard account={mockAccount} />);
    
    const viewDetailsButton = screen.getByRole('button', { name: /view details for test company inc/i });
    expect(viewDetailsButton).toHaveAttribute('aria-label', 'View details for Test Company Inc.');
    expect(viewDetailsButton).toHaveAttribute('type', 'button');
  });
});
