import AccountCard from '@/components/accounts/AccountCard';
import AccountsList from '@/components/accounts/accounts-list';

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Customer Accounts</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your customer accounts
        </p>
      </div>
      
      {/* Reports Section */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Reports</h2>
        <AccountsList />
      </div>

      {/* T-002 Integration Test - AccountCard Component */}
      <div className="p-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Cards (T-002 Test)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AccountCard 
            account={{
              id: 'test-1',
              name: 'Acme Corporation',
              status: 'Active',
              type: 'Commercial',
              city: 'Miami'
            }}
            onViewDetails={() => console.log('View Details clicked for Acme!')}
          />
          <AccountCard 
            account={{
              id: 'test-2',
              name: 'Beta Services LLC',
              status: 'Inactive',
              type: 'Residential',
              city: 'Orlando'
            }}
            onViewDetails={() => console.log('View Details clicked for Beta!')}
          />
        </div>
      </div>
    </div>
  );
}
