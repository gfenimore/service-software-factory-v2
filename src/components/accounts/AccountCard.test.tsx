import { render, screen, fireEvent } from '@testing-library/react'
import { AccountCard } from './AccountCard'
import type { Account } from '@/types/accountDetails.types'

const mockAccount: Account = {
  id: '1',
  company_name: 'Test Company',
  contact_name: 'John Doe',
  billing_city: 'New York'
}

describe('AccountCard Functionality', () => {
  test('renders account company name', () => {
    render(<AccountCard account={mockAccount} />)
    expect(screen.getByText('Test Company')).toBeInTheDocument()
  })

  test('renders contact information', () => {
    render(<AccountCard account={mockAccount} />)
    expect(screen.getByText('Contact: John Doe')).toBeInTheDocument()
  })

  test('renders location information', () => {
    render(<AccountCard account={mockAccount} />)
    expect(screen.getByText('Location: New York')).toBeInTheDocument()
  })

  test('handles missing contact name', () => {
    const accountWithoutContact = { ...mockAccount, contact_name: undefined }
    render(<AccountCard account={accountWithoutContact} />)
    expect(screen.getByText('Contact: No contact')).toBeInTheDocument()
  })

  test('handles missing billing city', () => {
    const accountWithoutCity = { ...mockAccount, billing_city: null }
    render(<AccountCard account={accountWithoutCity} />)
    expect(screen.getByText('Location: No location')).toBeInTheDocument()
  })

  test('calls onSelect when clicked', () => {
    const mockOnSelect = jest.fn()
    render(<AccountCard account={mockAccount} onSelect={mockOnSelect} />)
    
    fireEvent.click(screen.getByTestId('account-card'))
    expect(mockOnSelect).toHaveBeenCalledWith(mockAccount)
  })

  test('applies selected styling when isSelected is true', () => {
    render(<AccountCard account={mockAccount} isSelected={true} />)
    const card = screen.getByTestId('account-card')
    expect(card).toHaveClass('border-blue-500', 'bg-blue-50')
  })

  test('applies default styling when isSelected is false', () => {
    render(<AccountCard account={mockAccount} isSelected={false} />)
    const card = screen.getByTestId('account-card')
    expect(card).toHaveClass('border-gray-200')
    expect(card).not.toHaveClass('border-blue-500', 'bg-blue-50')
  })
})