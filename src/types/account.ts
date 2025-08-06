// Type definitions for Account-related data structures

export interface AccountListItem {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  type: 'Residential' | 'Commercial';
  city: string | null;
}

export interface AccountsResponse {
  data: AccountListItem[];
  error: string | null;
  count: number;
}

export interface AccountQueryParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}