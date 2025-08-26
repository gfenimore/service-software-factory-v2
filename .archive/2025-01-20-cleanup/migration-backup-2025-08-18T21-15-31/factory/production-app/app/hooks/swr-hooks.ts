import useSWR, { SWRConfig, mutate } from 'swr';
import { Account, Location, WorkOrder } from '../types/types';
import { logError, trackEvent } from '../services/monitoring';

// Fetcher with error handling and monitoring
const fetcher = async (url: string) => {
    const startTime = performance.now();
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Track successful fetch
        trackEvent('data.fetch.success', {
            url,
            duration: performance.now() - startTime,
            size: JSON.stringify(data).length
        });
        
        return data;
    } catch (error) {
        // Track fetch error
        trackEvent('data.fetch.error', {
            url,
            error: error.message,
            duration: performance.now() - startTime
        });
        
        logError(error as Error, { url, component: 'fetcher' });
        throw error;
    }
};

// Enhanced hook for accounts
export function useAccounts() {
    const { data, error, isLoading, isValidating, mutate } = useSWR<Account[]>(
        '/api/accounts',
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 2000,
            errorRetryCount: 3,
            errorRetryInterval: 5000,
            onError: (error) => {
                logError(error, { hook: 'useAccounts' });
            },
            onSuccess: (data) => {
                trackEvent('accounts.loaded', { count: data.length });
            }
        }
    );
    
    return {
        accounts: data || [],
        isLoading,
        isError: error,
        isValidating,
        refresh: () => mutate()
    };
}

// Enhanced hook for locations with optimistic updates
export function useLocations(accountId?: number) {
    const key = accountId ? `/api/accounts/${accountId}/locations` : null;
    
    const { data, error, isLoading, isValidating, mutate } = useSWR<Location[]>(
        key,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000,
            onError: (error) => {
                logError(error, { hook: 'useLocations', accountId });
            }
        }
    );
    
    const addLocation = async (newLocation: Partial<Location>) => {
        // Optimistic update
        const optimisticData = [...(data || []), { ...newLocation, id: Date.now() }];
        
        try {
            await mutate(
                fetch(key!, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newLocation)
                }).then(res => res.json()),
                {
                    optimisticData,
                    rollbackOnError: true,
                    populateCache: true,
                    revalidate: true
                }
            );
            
            trackEvent('location.added', { accountId });
        } catch (error) {
            logError(error as Error, { hook: 'useLocations.addLocation' });
            throw error;
        }
    };
    
    return {
        locations: data || [],
        isLoading,
        isError: error,
        isValidating,
        addLocation,
        refresh: () => mutate()
    };
}

// Enhanced hook for work orders with pagination
export function useWorkOrders(locationId?: number, page: number = 1, pageSize: number = 20) {
    const key = locationId 
        ? `/api/locations/${locationId}/workorders?page=${page}&size=${pageSize}`
        : null;
    
    const { data, error, isLoading, isValidating, mutate } = useSWR<{
        items: WorkOrder[];
        total: number;
        page: number;
        pageSize: number;
    }>(key, fetcher, {
        keepPreviousData: true, // Keep previous data while fetching new page
        revalidateOnFocus: false,
        onError: (error) => {
            logError(error, { hook: 'useWorkOrders', locationId, page });
        }
    });
    
    return {
        workOrders: data?.items || [],
        totalCount: data?.total || 0,
        currentPage: data?.page || page,
        pageSize: data?.pageSize || pageSize,
        isLoading,
        isError: error,
        isValidating,
        refresh: () => mutate()
    };
}

// Global SWR configuration provider
export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                onError: (error) => {
                    console.error('SWR Error:', error);
                    logError(error, { provider: 'SWR' });
                },
                shouldRetryOnError: (error) => {
                    // Don't retry on 4xx errors
                    if (error?.status >= 400 && error?.status < 500) {
                        return false;
                    }
                    return true;
                }
            }}
        >
            {children}
        </SWRConfig>
    );
}

// Prefetch data for better UX
export async function prefetchAccounts() {
    await mutate('/api/accounts', fetcher('/api/accounts'));
}

export async function prefetchLocations(accountId: number) {
    await mutate(
        `/api/accounts/${accountId}/locations`,
        fetcher(`/api/accounts/${accountId}/locations`)
    );
}
