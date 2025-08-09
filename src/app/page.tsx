'use client'

import { MasterViewLayout } from '@/components/master-view/MasterViewLayout'
import { AccountsColumnHeader } from '@/components/accounts/AccountsColumnHeader'
import { AccountCard } from '@/components/accounts/AccountCard'
import { AccountDetailsPanel } from '@/components/accounts/AccountDetailsPanel'

const mockAccount = {
  id: '1',
  company_name: 'Sample Company',
  email: 'contact@sample.com'
}

export default function Home() {
  return (
    <MasterViewLayout>
      <div>
        <AccountsColumnHeader accountCount={1} />
        <AccountCard account={mockAccount} />
      </div>
      
      <div>
        <h2 className="p-4 text-lg font-semibold border-b">Column Two</h2>
        <p className="p-4">Content for middle column</p>
      </div>
      
      <AccountDetailsPanel 
        account={mockAccount} 
        isOpen={true} 
        onClose={() => {}} 
      />
    </MasterViewLayout>
  );
}
// test comment
