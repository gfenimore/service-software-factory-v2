/**
 * Security utilities for production
 */

// Content Security Policy
export const CSP_HEADER = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
`.replace(/\s+/g, ' ').trim();

// XSS Protection
export function sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Input validation
export function validateInput(input: string, type: 'email' | 'phone' | 'url' | 'text'): boolean {
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\d\s()+-]+$/,
        url: /^https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=]+$/,
        text: /^[\w\s\-.,!?]+$/
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
