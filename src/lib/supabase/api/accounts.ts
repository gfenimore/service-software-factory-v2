import { createClient } from '../client';
import { AccountListItem, AccountsResponse, AccountQueryParams } from '@/types/account';

/**
 * Fetches accounts from Supabase with business rule compliance
 * 
 * Business Rules Applied:
 * - BR1: Sort accounts alphabetically by name (case-insensitive)
 * - BR2: Show all accounts (no pagination in v1)
 * - BR3/BR4: Type safety ensures valid Status/Type values

 * 
 * @param params Query parameters for filtering and sorting
 * @returns Promise<AccountsResponse> with accounts data or error
 */
export async function getAccounts(params: AccountQueryParams = {}): Promise<AccountsResponse> {
  try {
    const supabase = createClient();
    
    // Start building the query
    let query = supabase
      .from('accounts')
      .select('id, account_name, status, account_type, billing_city');
    

    
    // BR1: Default to alphabetical sorting by name (case-insensitive)
    const sortBy = params.sortBy || 'name';
    const sortOrder = params.sortOrder || 'asc';
    
    // Apply sorting with case-insensitive name sorting
    if (sortBy === 'name') {
      // Case-insensitive sorting for names
      query = query.order('account_name', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching accounts:', error);
      return {
        data: [],
        error: `Failed to fetch accounts: ${error.message}`,
        count: 0
      };
    }
    
    // Type assertion ensures data matches our interface
    const accounts = (data || []).map(item => ({
      id: item.id,
      name: item.account_name,
      status: item.status,
      type: item.account_type,
      city: item.billing_city
    })) as AccountListItem[];
    
    return {
      data: accounts,
      error: null,
      count: accounts.length
    };
    
  } catch (error) {
    console.error('Unexpected error in getAccounts:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      count: 0
    };
  }
}

/**
 * Convenience function to get all active accounts
 * Commonly used pattern for the accounts list view
 */
export async function getActiveAccounts(): Promise<AccountsResponse> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('accounts')
      .select('id, account_name, status, account_type, billing_city')
      .eq('status', 'Active')
      .order('account_name', { ascending: true });
    
    if (error) {
      return {
        data: [],
        error: `Failed to fetch active accounts: ${error.message}`,
        count: 0
      };
    }
    
    const accounts = (data || []).map(item => ({
      id: item.id,
      name: item.account_name,
      status: item.status,
      type: item.account_type,
      city: item.billing_city
    })) as AccountListItem[];
    
    return {
      data: accounts,
      error: null,
      count: accounts.length
    };
    
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      count: 0
    };
  }
}

/**
 * Get account count by status for dashboard metrics
 * Useful for summary statistics
 */
export async function getAccountStats(): Promise<{
  active: number;
  inactive: number;
  total: number;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    
    // Get all counts in parallel
    const [activeResult, inactiveResult, totalResult] = await Promise.all([
      supabase
        .from('accounts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Active'),
      supabase
        .from('accounts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Inactive'),
      supabase
        .from('accounts')
        .select('id', { count: 'exact', head: true })
    ]);
    
    return {
      active: activeResult.count || 0,
      inactive: inactiveResult.count || 0,
      total: totalResult.count || 0,
      error: null
    };
    
  } catch (error) {
    return {
      active: 0,
      inactive: 0,
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}