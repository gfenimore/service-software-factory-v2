import { useEffect, useRef } from 'react';

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
