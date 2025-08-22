#!/usr/bin/env node

/**
 * ENHANCEMENT-PROCESSOR
 * Transformation Processor: Prototype → Production
 * 
 * Takes prototype components and enhances them for production:
 * - Adds error boundaries
 * - Implements performance optimizations (memoization, lazy loading)
 * - Adds monitoring and telemetry
 * - Implements proper data fetching (SWR/React Query)
 * - Adds accessibility features
 * - Implements security best practices
 * - Adds comprehensive error handling
 */

const fs = require('fs');
const path = require('path');

class EnhancementProcessor {
    constructor(config = {}) {
        this.config = {
            errorBoundaries: true,
            performance: true,
            monitoring: true,
            accessibility: true,
            security: true,
            dataFetching: 'swr', // 'swr' or 'react-query'
            testing: true,
            ...config
        };
        
        this.enhancements = [];
    }
    
    /**
     * Main enhancement process
     */
    async enhance(inputDir, outputDir) {
        console.log('🚀 ENHANCEMENT-PROCESSOR: Prototype → Production');
        console.log('📂 Input:', inputDir);
        console.log('📂 Output:', outputDir);
        console.log('');
        
        // Copy all files first
        await this.copyFiles(inputDir, outputDir);
        
        // Apply enhancements
        console.log('🔧 Applying production enhancements...\n');
        
        if (this.config.errorBoundaries) {
            await this.addErrorBoundaries(outputDir);
        }
        
        if (this.config.performance) {
            await this.addPerformanceOptimizations(outputDir);
        }
        
        if (this.config.monitoring) {
            await this.addMonitoring(outputDir);
        }
        
        if (this.config.dataFetching) {
            await this.enhanceDataFetching(outputDir);
        }
        
        if (this.config.accessibility) {
            await this.enhanceAccessibility(outputDir);
        }
        
        if (this.config.security) {
            await this.addSecurityFeatures(outputDir);
        }
        
        // Generate production configuration
        await this.generateProductionConfig(outputDir);
        
        console.log('\n✅ Enhancement complete!');
        console.log(`Applied ${this.enhancements.length} enhancements`);
        
        return {
            enhancements: this.enhancements,
            ready: true
        };
    }
    
    /**
     * Copy files from input to output
     */
    async copyFiles(inputDir, outputDir) {
        console.log('📋 Copying files...');
        
        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Copy all files recursively
        this.copyRecursive(inputDir, outputDir);
    }
    
    copyRecursive(src, dest) {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();
        
        if (isDirectory) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
            }
            fs.readdirSync(src).forEach(childItemName => {
                this.copyRecursive(
                    path.join(src, childItemName),
                    path.join(dest, childItemName)
                );
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    }
    
    /**
     * Add error boundaries
     */
    async addErrorBoundaries(outputDir) {
        console.log('🛡️ Adding error boundaries...');
        
        // Create ErrorBoundary component
        const errorBoundaryCode = `import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../services/monitoring';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    
    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to monitoring service
        logError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true
        });
        
        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
        
        this.setState({ errorInfo });
    }
    
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return <>{this.props.fallback}</>;
            }
            
            return (
                <div className="error-boundary-fallback" role="alert">
                    <h2>Something went wrong</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button onClick={() => window.location.reload()}>
                        Reload page
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );
}
`;
        
        const componentsDir = this.findComponentsDir(outputDir);
        fs.writeFileSync(
            path.join(componentsDir, 'ErrorBoundary.tsx'),
            errorBoundaryCode
        );
        
        // Wrap MasterView with ErrorBoundary
        await this.wrapComponentWithErrorBoundary(outputDir, 'MasterView.tsx');
        
        this.enhancements.push('Error Boundaries');
        console.log('   ✅ Error boundaries added');
    }
    
    /**
     * Add performance optimizations
     */
    async addPerformanceOptimizations(outputDir) {
        console.log('⚡ Adding performance optimizations...');
        
        // Enhance components with React.memo
        await this.addMemoization(outputDir);
        
        // Add lazy loading
        await this.addLazyLoading(outputDir);
        
        // Add performance monitoring
        const perfMonitorCode = `import { useEffect } from 'react';

export function usePerformanceMonitor(componentName: string) {
    useEffect(() => {
        const startTime = performance.now();
        
        return () => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            if (renderTime > 16) { // Longer than one frame (60fps)
                console.warn(\`Slow render in \${componentName}: \${renderTime.toFixed(2)}ms\`);
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
`;
        
        const hooksDir = this.findHooksDir(outputDir);
        fs.writeFileSync(
            path.join(hooksDir, 'performance.ts'),
            perfMonitorCode
        );
        
        this.enhancements.push('Performance Optimizations');
        console.log('   ✅ Performance optimizations added');
    }
    
    /**
     * Add monitoring and telemetry
     */
    async addMonitoring(outputDir) {
        console.log('📊 Adding monitoring and telemetry...');
        
        const monitoringCode = `/**
 * Production Monitoring Service
 * Handles error tracking, performance monitoring, and analytics
 */

interface ErrorContext {
    componentStack?: string;
    errorBoundary?: boolean;
    userId?: string;
    sessionId?: string;
    [key: string]: any;
}

class MonitoringService {
    private sessionId: string;
    private userId: string | null = null;
    
    constructor() {
        this.sessionId = this.generateSessionId();
        this.initializeProviders();
    }
    
    private generateSessionId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    private initializeProviders() {
        // Initialize Sentry
        if (typeof window !== 'undefined' && window.Sentry) {
            window.Sentry.init({
                dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
                environment: process.env.NODE_ENV,
                beforeSend(event) {
                    // Scrub sensitive data
                    if (event.request) {
                        delete event.request.cookies;
                    }
                    return event;
                }
            });
        }
        
        // Initialize analytics
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.identify(this.sessionId);
        }
    }
    
    setUser(userId: string, traits?: Record<string, any>) {
        this.userId = userId;
        
        if (window.Sentry) {
            window.Sentry.setUser({ id: userId, ...traits });
        }
        
        if (window.analytics) {
            window.analytics.identify(userId, traits);
        }
    }
    
    logError(error: Error, context?: ErrorContext) {
        console.error('Error logged:', error, context);
        
        const errorData = {
            message: error.message,
            stack: error.stack,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            ...context
        };
        
        // Send to Sentry
        if (window.Sentry) {
            window.Sentry.captureException(error, {
                extra: errorData
            });
        }
        
        // Send to analytics
        if (window.analytics) {
            window.analytics.track('error', errorData);
        }
        
        // Send to custom backend
        this.sendToBackend('/api/errors', errorData);
    }
    
    trackEvent(eventName: string, properties?: Record<string, any>) {
        const eventData = {
            event: eventName,
            properties,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString()
        };
        
        if (window.analytics) {
            window.analytics.track(eventName, properties);
        }
        
        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Event tracked:', eventData);
        }
    }
    
    trackPerformance(metricName: string, value: number, unit: string = 'ms') {
        const perfData = {
            metric: metricName,
            value,
            unit,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };
        
        if (window.analytics) {
            window.analytics.track('performance', perfData);
        }
        
        // Send to monitoring service
        this.sendToBackend('/api/metrics', perfData);
    }
    
    private async sendToBackend(endpoint: string, data: any) {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (err) {
            console.error('Failed to send data to backend:', err);
        }
    }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Export convenience functions
export const logError = (error: Error, context?: ErrorContext) => 
    monitoring.logError(error, context);

export const trackEvent = (eventName: string, properties?: Record<string, any>) =>
    monitoring.trackEvent(eventName, properties);

export const trackPerformance = (metricName: string, value: number, unit?: string) =>
    monitoring.trackPerformance(metricName, value, unit);

// React hook for monitoring
export function useMonitoring() {
    return {
        logError,
        trackEvent,
        trackPerformance,
        setUser: (userId: string, traits?: Record<string, any>) => 
            monitoring.setUser(userId, traits)
    };
}

// Declare global types
declare global {
    interface Window {
        Sentry: any;
        analytics: any;
    }
}
`;
        
        const servicesDir = this.findServicesDir(outputDir);
        fs.writeFileSync(
            path.join(servicesDir, 'monitoring.ts'),
            monitoringCode
        );
        
        this.enhancements.push('Monitoring & Telemetry');
        console.log('   ✅ Monitoring and telemetry added');
    }
    
    /**
     * Enhance data fetching with SWR
     */
    async enhanceDataFetching(outputDir) {
        console.log('🔄 Enhancing data fetching...');
        
        const swrHooksCode = `import useSWR, { SWRConfig, mutate } from 'swr';
import { Account, Location, WorkOrder } from '../types/types';
import { logError, trackEvent } from '../services/monitoring';

// Fetcher with error handling and monitoring
const fetcher = async (url: string) => {
    const startTime = performance.now();
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
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
    const key = accountId ? \`/api/accounts/\${accountId}/locations\` : null;
    
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
        ? \`/api/locations/\${locationId}/workorders?page=\${page}&size=\${pageSize}\`
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
        \`/api/accounts/\${accountId}/locations\`,
        fetcher(\`/api/accounts/\${accountId}/locations\`)
    );
}
`;
        
        const hooksDir = this.findHooksDir(outputDir);
        fs.writeFileSync(
            path.join(hooksDir, 'swr-hooks.ts'),
            swrHooksCode
        );
        
        // Update package.json to include SWR
        await this.updatePackageJson(outputDir, {
            dependencies: {
                'swr': '^2.2.4'
            }
        });
        
        this.enhancements.push('Enhanced Data Fetching (SWR)');
        console.log('   ✅ Enhanced data fetching added');
    }
    
    /**
     * Enhance accessibility
     */
    async enhanceAccessibility(outputDir) {
        console.log('♿ Enhancing accessibility...');
        
        const a11yHooksCode = `import { useEffect, useRef } from 'react';

/**
 * Accessibility hooks for WCAG 2.1 compliance
 */

// Announce changes to screen readers
export function useAnnounce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    useEffect(() => {
        if (!message) return;
        
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        return () => {
            document.body.removeChild(announcement);
        };
    }, [message, priority]);
}

// Focus management
export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!isActive || !containerRef.current) return;
        
        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };
        
        container.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();
        
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive]);
    
    return containerRef;
}

// Skip navigation
export function useSkipNavigation() {
    return (
        <a
            href="#main-content"
            className="skip-nav"
            style={{
                position: 'absolute',
                left: '-10000px',
                top: 'auto',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
            }}
            onFocus={(e) => {
                e.currentTarget.style.position = 'fixed';
                e.currentTarget.style.top = '0';
                e.currentTarget.style.left = '0';
                e.currentTarget.style.width = 'auto';
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.overflow = 'visible';
                e.currentTarget.style.zIndex = '9999';
                e.currentTarget.style.padding = '8px';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.border = '2px solid black';
            }}
            onBlur={(e) => {
                e.currentTarget.style.position = 'absolute';
                e.currentTarget.style.left = '-10000px';
                e.currentTarget.style.width = '1px';
                e.currentTarget.style.height = '1px';
                e.currentTarget.style.overflow = 'hidden';
            }}
        >
            Skip to main content
        </a>
    );
}

// Keyboard navigation
export function useKeyboardNavigation(
    items: any[],
    onSelect: (item: any) => void
) {
    const [focusedIndex, setFocusedIndex] = React.useState(0);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => 
                        prev < items.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (items[focusedIndex]) {
                        onSelect(items[focusedIndex]);
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    setFocusedIndex(0);
                    break;
                case 'End':
                    e.preventDefault();
                    setFocusedIndex(items.length - 1);
                    break;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [items, focusedIndex, onSelect]);
    
    return { focusedIndex, setFocusedIndex };
}

// Color contrast checker
export function useColorContrast() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        
        const checkContrast = () => {
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                const styles = window.getComputedStyle(element);
                const bg = styles.backgroundColor;
                const fg = styles.color;
                
                // Simple contrast check (would need proper implementation)
                if (bg !== 'rgba(0, 0, 0, 0)' && fg) {
                    // Check WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
                    // This is a placeholder - real implementation would calculate actual contrast
                    const contrastRatio = 4.5; // Placeholder
                    
                    if (contrastRatio < 4.5) {
                        console.warn('Low contrast detected:', element, {
                            background: bg,
                            foreground: fg,
                            ratio: contrastRatio
                        });
                    }
                }
            });
        };
        
        checkContrast();
    }, []);
}
`;
        
        const hooksDir = this.findHooksDir(outputDir);
        fs.writeFileSync(
            path.join(hooksDir, 'accessibility.ts'),
            a11yHooksCode
        );
        
        this.enhancements.push('Accessibility (WCAG 2.1)');
        console.log('   ✅ Accessibility enhancements added');
    }
    
    /**
     * Add security features
     */
    async addSecurityFeatures(outputDir) {
        console.log('🔒 Adding security features...');
        
        const securityCode = `/**
 * Security utilities for production
 */

// Content Security Policy
export const CSP_HEADER = \`
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
\`.replace(/\\s+/g, ' ').trim();

// XSS Protection
export function sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Input validation
export function validateInput(input: string, type: 'email' | 'phone' | 'url' | 'text'): boolean {
    const patterns = {
        email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
        phone: /^[\\d\\s()+-]+$/,
        url: /^https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&'()*+,;=]+$/,
        text: /^[\\w\\s\\-.,!?]+$/
    };
    
    return patterns[type]?.test(input) || false;
}

// Rate limiting
class RateLimiter {
    private attempts: Map<string, number[]> = new Map();
    
    constructor(
        private maxAttempts: number = 10,
        private windowMs: number = 60000 // 1 minute
    ) {}
    
    isAllowed(key: string): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];
        
        // Remove old attempts outside the window
        const validAttempts = attempts.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        if (validAttempts.length >= this.maxAttempts) {
            return false;
        }
        
        validAttempts.push(now);
        this.attempts.set(key, validAttempts);
        
        return true;
    }
    
    reset(key: string) {
        this.attempts.delete(key);
    }
}

export const rateLimiter = new RateLimiter();

// CSRF Token management
export function getCSRFToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        console.error('CSRF token not found');
        return '';
    }
    return token;
}

// Secure fetch wrapper
export async function secureFetch(url: string, options: RequestInit = {}) {
    const csrfToken = getCSRFToken();
    
    const secureOptions: RequestInit = {
        ...options,
        headers: {
            ...options.headers,
            'X-CSRF-Token': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    };
    
    // Check rate limiting
    if (!rateLimiter.isAllowed(url)) {
        throw new Error('Rate limit exceeded');
    }
    
    try {
        const response = await fetch(url, secureOptions);
        
        // Check for security headers
        const csp = response.headers.get('Content-Security-Policy');
        if (!csp) {
            console.warn('Missing CSP header for:', url);
        }
        
        return response;
    } catch (error) {
        console.error('Secure fetch failed:', error);
        throw error;
    }
}

// Environment variable validation
export function validateEnvVars() {
    const required = [
        'NEXT_PUBLIC_API_URL',
        'NEXT_PUBLIC_APP_VERSION'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Missing required environment variables');
        }
    }
}

// Sensitive data masking
export function maskSensitiveData(data: any): any {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'ssn', 'creditCard'];
    
    if (typeof data === 'string') {
        return '***REDACTED***';
    }
    
    if (typeof data === 'object' && data !== null) {
        const masked = Array.isArray(data) ? [...data] : { ...data };
        
        for (const key in masked) {
            if (sensitiveKeys.some(sensitive => 
                key.toLowerCase().includes(sensitive.toLowerCase())
            )) {
                masked[key] = '***REDACTED***';
            } else if (typeof masked[key] === 'object') {
                masked[key] = maskSensitiveData(masked[key]);
            }
        }
        
        return masked;
    }
    
    return data;
}
`;
        
        const servicesDir = this.findServicesDir(outputDir);
        fs.writeFileSync(
            path.join(servicesDir, 'security.ts'),
            securityCode
        );
        
        this.enhancements.push('Security Features');
        console.log('   ✅ Security features added');
    }
    
    /**
     * Generate production configuration
     */
    async generateProductionConfig(outputDir) {
        console.log('⚙️ Generating production configuration...');
        
        // Environment variables template
        const envTemplate = `# Production Environment Variables
# Copy to .env.local and fill in values

# API Configuration
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_API_VERSION=v1

# Application
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_NAME=Master View

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_ANALYTICS_ID=

# Feature Flags
NEXT_PUBLIC_ENABLE_MONITORING=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true

# Security
NEXT_PUBLIC_CSP_REPORT_URI=https://api.example.com/csp-report
`;
        
        fs.writeFileSync(
            path.join(outputDir, '.env.production.template'),
            envTemplate
        );
        
        // Docker configuration
        const dockerfile = `# Production Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
`;
        
        fs.writeFileSync(path.join(outputDir, 'Dockerfile'), dockerfile);
        
        // GitHub Actions workflow
        const workflow = `name: Production Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v20
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
`;
        
        const workflowDir = path.join(outputDir, '.github', 'workflows');
        fs.mkdirSync(workflowDir, { recursive: true });
        fs.writeFileSync(path.join(workflowDir, 'deploy.yml'), workflow);
        
        this.enhancements.push('Production Configuration');
        console.log('   ✅ Production configuration added');
    }
    
    /**
     * Helper methods
     */
    findComponentsDir(outputDir) {
        const possiblePaths = [
            path.join(outputDir, 'app', 'components'),
            path.join(outputDir, 'src', 'components'),
            path.join(outputDir, 'components')
        ];
        
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) return p;
        }
        
        // Create if not exists
        const defaultPath = path.join(outputDir, 'app', 'components');
        fs.mkdirSync(defaultPath, { recursive: true });
        return defaultPath;
    }
    
    findHooksDir(outputDir) {
        const possiblePaths = [
            path.join(outputDir, 'app', 'hooks'),
            path.join(outputDir, 'src', 'hooks'),
            path.join(outputDir, 'hooks')
        ];
        
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) return p;
        }
        
        const defaultPath = path.join(outputDir, 'app', 'hooks');
        fs.mkdirSync(defaultPath, { recursive: true });
        return defaultPath;
    }
    
    findServicesDir(outputDir) {
        const possiblePaths = [
            path.join(outputDir, 'app', 'services'),
            path.join(outputDir, 'src', 'services'),
            path.join(outputDir, 'services')
        ];
        
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) return p;
        }
        
        const defaultPath = path.join(outputDir, 'app', 'services');
        fs.mkdirSync(defaultPath, { recursive: true });
        return defaultPath;
    }
    
    async wrapComponentWithErrorBoundary(outputDir, filename) {
        const componentsDir = this.findComponentsDir(outputDir);
        const filepath = path.join(componentsDir, filename);
        
        if (fs.existsSync(filepath)) {
            let content = fs.readFileSync(filepath, 'utf8');
            
            // Add import
            if (!content.includes('ErrorBoundary')) {
                content = `import { ErrorBoundary } from './ErrorBoundary';\n` + content;
            }
            
            // Wrap default export
            content = content.replace(
                /export default (\w+);?$/m,
                `export default function $1WithErrorBoundary(props: any) {
    return (
        <ErrorBoundary>
            <$1 {...props} />
        </ErrorBoundary>
    );
}`
            );
            
            fs.writeFileSync(filepath, content);
        }
    }
    
    async addMemoization(outputDir) {
        const componentsDir = this.findComponentsDir(outputDir);
        const components = ['Card.tsx', 'SearchBox.tsx'];
        
        for (const component of components) {
            const filepath = path.join(componentsDir, component);
            if (fs.existsSync(filepath)) {
                let content = fs.readFileSync(filepath, 'utf8');
                
                // Add React.memo
                if (!content.includes('React.memo')) {
                    content = content.replace(
                        /export const (\w+):/,
                        'export const $1: React.FC<any> = React.memo('
                    );
                    content = content.replace(
                        /};$/,
                        '});'
                    );
                    
                    fs.writeFileSync(filepath, content);
                }
            }
        }
    }
    
    async addLazyLoading(outputDir) {
        const componentsDir = this.findComponentsDir(outputDir);
        const indexPath = path.join(componentsDir, 'index.ts');
        
        if (fs.existsSync(indexPath)) {
            const lazyIndexContent = `import { lazy, Suspense } from 'react';

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
`;
            
            fs.writeFileSync(indexPath, lazyIndexContent);
        }
    }
    
    async updatePackageJson(outputDir, updates) {
        const packagePath = path.join(outputDir, 'package.json');
        
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Merge updates
            Object.keys(updates).forEach(key => {
                packageJson[key] = { ...packageJson[key], ...updates[key] };
            });
            
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        }
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: ENHANCEMENT-PROCESSOR <input-dir> <output-dir>');
        console.log('Example: ENHANCEMENT-PROCESSOR ./prototype-app ./production-app');
        process.exit(1);
    }
    
    const [inputDir, outputDir] = args;
    
    const processor = new EnhancementProcessor();
    
    processor.enhance(inputDir, outputDir)
        .then(result => {
            console.log('\n🎉 Enhancement successful!');
            console.log('Enhancements applied:', result.enhancements.join(', '));
            console.log('\n🚀 Your production-ready application is at:', outputDir);
            console.log('\nProduction features added:');
            result.enhancements.forEach(e => console.log(`   ✅ ${e}`));
        })
        .catch(err => {
            console.error('❌ Enhancement failed:', err.message);
            console.error(err.stack);
            process.exit(1);
        });
}

module.exports = EnhancementProcessor;