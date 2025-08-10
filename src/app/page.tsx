'use client'

import { MasterViewLayout } from '@/components/master-view/MasterViewLayout'
import { AccountsColumnHeader } from '@/components/accounts/AccountsColumnHeader'
import { AccountsList } from '@/components/accounts/AccountsList'
import { AccountDetailsPanel } from '@/components/accounts/AccountDetailsPanel'
import { useAccountSelection } from '@/hooks/useAccountSelection'
import Link from 'next/link'

// Mock accounts for testing
const mockAccounts = [
  {
    id: '1',
    company_name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '555-0100',
    address: '123 Business Ave',
    city: 'New York',
    state: 'NY',
    zip: '10001'
  },
  {
    id: '2',
    company_name: 'TechStart Inc',
    email: 'info@techstart.com',
    phone: '555-0200',
    address: '456 Innovation Blvd',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105'
  },
  {
    id: '3',
    company_name: 'Global Solutions',
    email: 'hello@global.com',
    phone: '555-0300',
    address: '789 Enterprise Way',
    city: 'Chicago',
    state: 'IL',
    zip: '60601'
  }
]

export default function Home() {
  const { selectedAccountId, toggleSelection } = useAccountSelection()
  
  const handleAccountSelect = (account: any) => {
    toggleSelection(account.id)
  }
  
  const selectedAccount = mockAccounts.find(a => a.id === selectedAccountId)
  
  return (
    <MasterViewLayout>
      <div>
        <AccountsColumnHeader accountCount={mockAccounts.length} />
        <AccountsList 
          accounts={mockAccounts}
          selectedAccountId={selectedAccountId}
          onAccountSelect={handleAccountSelect}
        />
      </div>
      
      <div>
        <h2 className="p-4 text-lg font-semibold border-b">Column Two</h2>
        <div className="p-4 space-y-4">
          <p>Content for middle column</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🚀 Next.js 15 + Supabase Examples</h3>
            <p className="text-blue-800 text-sm mb-3">
              Explore comprehensive data fetching patterns with Next.js 15 App Router and Supabase
            </p>
            <Link 
              href="/supabase-examples" 
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              View Examples →
            </Link>
          </div>
        </div>
      </div>
      
      <AccountDetailsPanel 
        account={selectedAccount || mockAccounts[0]} 
        isOpen={!!selectedAccountId} 
        onClose={() => toggleSelection(selectedAccountId || '')} 
      />
    </MasterViewLayout>
  );
}
// test comment
