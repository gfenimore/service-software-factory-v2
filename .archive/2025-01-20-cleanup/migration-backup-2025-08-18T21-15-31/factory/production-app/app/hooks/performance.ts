import { useEffect } from 'react';

export function usePerformanceMonitor(componentName: string) {
    useEffect(() => {
        const startTime = performance.now();
        
        return () => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            if (renderTime > 16) { // Longer than one frame (60fps)
                console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
            }
            
            // Send metrics to monitoring service
            if (window.analytics) {
                window.analytics.track('component.render', {
                    component: componentName,
                    renderTime
                });
            }
        };
    }, [componentName]);
}

export function useLazyLoad<T>(
    loadFn: () => Promise<T>,
    deps: React.DependencyList = []
) {
    const [data, setData] = React.useState<T | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);
    
    React.useEffect(() => {
        let cancelled = false;
        
        const load = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const result = await loadFn();
                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err as Error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        
        load();
        
        return () => {
            cancelled = true;
        };
    }, deps);
    
    return { data, loading, error };
}
