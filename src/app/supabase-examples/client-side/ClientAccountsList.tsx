'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Account = Database['public']['Tables']['accounts']['Row']

export default function ClientAccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'Active' | 'Inactive'>('all')
  const supabase = createClient()

  // Fetch accounts based on filter
  useEffect(() => {
    async function fetchAccounts() {
      setIsLoading(true)
      setError(null)

      try {
        let query = supabase
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: false })

        if (filter !== 'all') {
          query = query.eq('status', filter)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        setAccounts(data || [])
      } catch (err) {
        console.error('Error fetching accounts:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [filter, supabase])

  // Handle account deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'Inactive' 
        })
        .eq('id', id)

      if (error) {
        throw error
      }

      // Remove from local state
      setAccounts(prev => prev.filter(account => account.id !== id))
    } catch (err) {
      console.error('Error deleting account:', err)
      alert('Failed to delete account')
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setAccounts([])
    // The useEffect will trigger automatically due to the dependency
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error Loading Accounts</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('Active')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'Active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('Inactive')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'Inactive'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inactive
          </button>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex justify-between items-center p-3 border rounded">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>
      )}

      {/* Accounts list */}
      {!isLoading && (
        <div className="space-y-3">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                <div>
                  <h3 className="font-medium text-gray-900">{account.account_name}</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Status: {account.status}</span>
                    <span>Type: {account.account_type}</span>
                    {account.billing_city && <span>City: {account.billing_city}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No accounts found {filter !== 'all' && `with status "${filter}"`}
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      {!isLoading && accounts.length > 0 && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          Showing {accounts.length} account{accounts.length !== 1 ? 's' : ''} 
          {filter !== 'all' && ` with status "${filter}"`}
        </div>
      )}
    </div>
  )
}
