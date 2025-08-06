import AccountsList from '@/components/accounts/accounts-list';

export default function AccountsReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Customer Accounts</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your customer accounts
        </p>
      </div>
      <AccountsList />
    </div>
  );
}