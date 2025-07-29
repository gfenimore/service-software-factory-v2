import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AccountsTable from './AccountsTable'
import { AccountDisplayData } from '@/types/accounts'

// Mock data for testing
const mockAccounts: AccountDisplayData[] = [
  {
    id: '1',
    account_name: 'Test Account 1',
    account_type: 'Commercial',
    status: 'Active',
    billing_city: 'Miami',
    billing_state: 'FL',
    billing_street_address: '123 Main St',
    billing_zip_code: '33101',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    contactCount: 3
  },
  {
    id: '2',
    account_name: 'Test Account 2',
    account_type: 'Residential',
    status: 'Inactive',
    billing_city: 'Orlando',
    billing_state: 'FL',
    billing_street_address: '456 Oak Ave',
    billing_zip_code: '32801',
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:20:00Z',
    contactCount: 1
  }
]

describe('AccountsTable', () => {
  describe('Rendering with data', () => {
    it('renders without crashing', () => {
      render(<AccountsTable data={mockAccounts} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('displays all column headers correctly', () => {
      render(<AccountsTable data={mockAccounts} />)
      
      expect(screen.getByText('Account Name')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('City')).toBeInTheDocument()
      expect(screen.getByText('Contacts')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
    })

    it('displays account data correctly', () => {
      render(<AccountsTable data={mockAccounts} />)
      
      // Check first account
      expect(screen.getByText('Test Account 1')).toBeInTheDocument()
      expect(screen.getByText('Commercial')).toBeInTheDocument()
      expect(screen.getByText('Miami')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      
      // Check second account
      expect(screen.getByText('Test Account 2')).toBeInTheDocument()
      expect(screen.getByText('Residential')).toBeInTheDocument()
      expect(screen.getByText('Orlando')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('displays status badges with correct styling', () => {
      render(<AccountsTable data={mockAccounts} />)
      
      const activeStatus = screen.getByText('Active')
      const inactiveStatus = screen.getByText('Inactive')
      
      expect(activeStatus).toBeInTheDocument()
      expect(activeStatus).toHaveClass('bg-green-100', 'text-green-800')
      
      expect(inactiveStatus).toBeInTheDocument()
      expect(inactiveStatus).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('formats dates correctly', () => {
      render(<AccountsTable data={mockAccounts} />)
      
      // Check that dates are formatted as locale strings
      expect(screen.getByText('1/15/2024')).toBeInTheDocument()
      expect(screen.getByText('1/10/2024')).toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<AccountsTable data={[]} loading={true} />)
      
      const skeleton = screen.getByTestId('accounts-skeleton')
      expect(skeleton).toBeInTheDocument()
      
      // Check for animate-pulse class on skeleton rows, not the outer container
      const animatedRows = skeleton.querySelectorAll('.animate-pulse')
      expect(animatedRows.length).toBeGreaterThan(0)
    })

    it('does not show table when loading', () => {
      render(<AccountsTable data={mockAccounts} loading={true} />)
      
      // Should not see actual data when loading
      expect(screen.queryByText('Test Account 1')).not.toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('displays error message when error is provided', () => {
      const errorMessage = 'Failed to load accounts'
      render(<AccountsTable data={[]} error={errorMessage} />)
      
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
      expect(screen.getByText(`Error: ${errorMessage}`)).toHaveClass('text-red-700')
    })

    it('does not show table when error is present', () => {
      render(<AccountsTable data={mockAccounts} error="Something went wrong" />)
      
      // Should not see table data when error
      expect(screen.queryByText('Test Account 1')).not.toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('displays "No accounts found" when data is empty', () => {
      render(<AccountsTable data={[]} />)
      
      expect(screen.getByText('No accounts found')).toBeInTheDocument()
    })

    it('still shows table headers when data is empty', () => {
      render(<AccountsTable data={[]} />)
      
      expect(screen.getByText('Account Name')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
    })
  })

  describe('Default behavior (no props)', () => {
    it('renders with mock data when no props provided', () => {
      render(<AccountsTable />)
      
      // Should show the built-in mock data
      expect(screen.getByText('ABC Pest Control')).toBeInTheDocument()
      expect(screen.getByText('XYZ Services Inc')).toBeInTheDocument()
    })
  })

  describe('Null/undefined handling', () => {
    it('handles null values gracefully', () => {
      const accountWithNulls: AccountDisplayData = {
        id: '3',
        account_name: 'Test Null Account',
        account_type: null,
        status: null,
        billing_city: null,
        billing_state: null,
        billing_street_address: null,
        billing_zip_code: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        contactCount: 0
      }

      render(<AccountsTable data={[accountWithNulls]} />)
      
      expect(screen.getByText('Test Null Account')).toBeInTheDocument()
      
      // Use getAllByText since there are multiple N/A elements
      const naElements = screen.getAllByText('N/A')
      expect(naElements.length).toBeGreaterThan(0) // For null account_type and billing_city
      
      expect(screen.getByText('Unknown')).toBeInTheDocument() // For null status
      expect(screen.getByText('0')).toBeInTheDocument() // For contactCount
    })
  })

  describe('Accessibility', () => {
    it('has proper table structure for screen readers', () => {
      render(<AccountsTable data={mockAccounts} />)
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      
      // Check for proper table headers
      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(6)
      
      // Check for table rows
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(2) // Header row + data rows
    })
  })

  describe('Responsive design', () => {
    it('has overflow-x-auto class for horizontal scrolling on small screens', () => {
      render(<AccountsTable data={mockAccounts} />)
      
      const scrollContainer = screen.getByRole('table').parentElement
      expect(scrollContainer).toHaveClass('overflow-x-auto')
    })

    it('uses whitespace-nowrap to prevent text wrapping in cells', () => {
      render(<AccountsTable data={mockAccounts} />)
      
      const cells = screen.getAllByRole('cell')
      cells.forEach(cell => {
        expect(cell).toHaveClass('whitespace-nowrap')
      })
    })
  })
}) 