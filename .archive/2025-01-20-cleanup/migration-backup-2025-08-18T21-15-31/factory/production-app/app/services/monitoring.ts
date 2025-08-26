/**
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
