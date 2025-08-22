import { lazy, Suspense } from 'react';

// Lazy load heavy components
export const MasterView = lazy(() => import('./MasterView'));
export const AccountsColumn = lazy(() => import('./AccountsColumn'));
export const LocationsColumn = lazy(() => import('./LocationsColumn'));
export const WorkOrdersColumn = lazy(() => import('./WorkOrdersColumn'));

// Regular exports for light components
export { SearchBox } from './SearchBox';
export { Card } from './Card';
export * from './types';
export * from './hooks';

// Loading component
export const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
    }}>
        <div>Loading...</div>
    </div>
);

// Wrapper for lazy components
export const withSuspense = (Component: React.ComponentType) => {
    return (props: any) => (
        <Suspense fallback={<LoadingFallback />}>
            <Component {...props} />
        </Suspense>
    );
};
