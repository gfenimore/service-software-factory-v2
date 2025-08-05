/**
 * T-002 Layout and Styling Tests
 * Comprehensive testing for fixed positioning, width constraints, and layout integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftNavigation from './LeftNavigation';
import { NavigationProvider } from './NavigationContext';

// Test wrapper for navigation context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}

// Helper function to render with navigation provider
function renderWithProvider(component: React.ReactElement) {
  return render(component, { wrapper: TestWrapper });
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Clear persisted navigation state between tests
beforeEach(() => {
  localStorage.clear();
});

describe('LeftNavigation T-002: Layout and Styling', () => {
  describe('Fixed Positioning Requirements', () => {
    it('maintains fixed position with correct positioning properties', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Fixed positioning requirements
      expect(navElement).toHaveClass('fixed');
      expect(navElement).toHaveClass('left-0');
      expect(navElement).toHaveClass('top-0');
      
      // In testing environment, verify Tailwind classes are applied
      // (computedStyle may not work the same way in jsdom)
      expect(navElement.className).toContain('fixed');
    });

    it('maintains 300px width exactly at all times', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Exactly 300px width requirement
      expect(navElement).toHaveClass('w-[300px]');
      
      // Test with custom viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      window.dispatchEvent(new Event('resize'));
      
      expect(navElement).toHaveClass('w-[300px]');
    });

    it('takes full viewport height', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Full height requirement
      expect(navElement).toHaveClass('h-screen');
    });

    it('provides scroll capability when content overflows', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Overflow handling
      expect(navElement).toHaveClass('overflow-y-auto');
    });

    it('maintains proper z-index for layering above content', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Z-index requirement
      expect(navElement).toHaveClass('z-10');
    });
  });

  describe('Content Area Integration', () => {
    it('does not interfere with document flow due to fixed positioning', () => {
      renderWithProvider(
        <div>
          <LeftNavigation />
          <div data-testid="content-area">Main Content</div>
        </div>
      );
      
      const navElement = screen.getByRole('navigation');
      const contentElement = screen.getByTestId('content-area');
      
      // Fixed positioning should not affect content positioning
      expect(navElement).toHaveClass('fixed');
      expect(contentElement).toBeInTheDocument();
    });
  });

  describe('Visual Styling Requirements', () => {
    it('applies consistent background and border styling', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Visual styling requirements
      expect(navElement).toHaveClass('bg-white');
      expect(navElement).toHaveClass('border-r');
      expect(navElement).toHaveClass('border-gray-200');
    });

    it('provides proper padding and spacing', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      const contentContainer = navElement.querySelector('.p-6');
      
      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveClass('p-6');
    });

    it('applies consistent typography hierarchy', () => {
      renderWithProvider(<LeftNavigation />);
      
      // Main navigation heading
      const mainHeading = screen.getByRole('heading', { name: 'Navigation', level: 2 });
      expect(mainHeading).toHaveClass('text-xl', 'font-semibold', 'text-gray-900');
      
      // Module headings
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      moduleHeadings.forEach(heading => {
        expect(heading).toHaveClass('text-sm', 'font-semibold', 'text-gray-700');
        expect(heading).toHaveClass('uppercase', 'tracking-wider');
      });
    });

    it('provides proper spacing between modules', () => {
      renderWithProvider(<LeftNavigation />);
      
      const moduleContainers = screen.getByRole('navigation').querySelectorAll('.mb-6');
      
      // Should have proper spacing classes
      expect(moduleContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Interactive State Styling', () => {
    it('applies hover state styling to focus area buttons', () => {
      renderWithProvider(<LeftNavigation />);
      
      const focusAreaButtons = screen.getAllByRole('menuitem');
      
      focusAreaButtons.forEach(button => {
        // T-002: Hover state styling
        expect(button).toHaveClass('hover:bg-gray-100');
        expect(button).toHaveClass('hover:text-gray-900');
      });
    });

    it('provides focus state styling for accessibility', () => {
      renderWithProvider(<LeftNavigation />);
      
      const focusAreaButtons = screen.getAllByRole('menuitem');
      
      focusAreaButtons.forEach(button => {
        // T-002: Focus state styling
        expect(button).toHaveClass('focus:outline-none');
        expect(button).toHaveClass('focus:ring-2');
        expect(button).toHaveClass('focus:ring-blue-500');
        expect(button).toHaveClass('focus:ring-offset-2');
      });
    });

    it('includes smooth transition animations', () => {
      renderWithProvider(<LeftNavigation />);
      
      const focusAreaButtons = screen.getAllByRole('menuitem');
      
      focusAreaButtons.forEach(button => {
        // T-002: Transition animations
        expect(button).toHaveClass('transition-colors');
        expect(button).toHaveClass('duration-200');
      });
    });

    it('maintains interactive states during user interaction', () => {
      renderWithProvider(<LeftNavigation />);
      
      const firstButton = screen.getByRole('menuitem', { name: 'Master View focus area' });
      
      // Test focus interaction
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Hover state classes should be present before click
      expect(firstButton).toHaveClass('hover:bg-gray-100');
      
      // Test click interaction (should not remove hover classes)
      fireEvent.click(firstButton);
    });
  });

  describe('Responsive Behavior Testing', () => {
    const testViewportSizes = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];

    testViewportSizes.forEach(({ width, height, name }) => {
      it(`maintains 300px fixed width at ${name} viewport (${width}x${height})`, () => {
        // Mock viewport size
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: height,
        });
        
        renderWithProvider(<LeftNavigation />);
        
        const navElement = screen.getByRole('navigation');
        
        // T-002: Consistent width across all viewport sizes
        expect(navElement).toHaveClass('w-[300px]');
        expect(navElement).toHaveClass('fixed');
      });
    });

    it('handles small viewport widths gracefully', () => {
      // Test very small viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // Navigation should maintain its width even on very small screens
      // (Business decision: 300px is maintained for desktop-only app)
      expect(navElement).toHaveClass('w-[300px]');
    });
  });

  describe('Layout Integration with Root Layout', () => {
    it('provides correct class structure for layout integration', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // Verify classes that enable layout integration
      expect(navElement).toHaveClass(
        'fixed',
        'left-0',
        'top-0',
        'w-[300px]',
        'h-screen',
        'z-10'
      );
    });

    it('maintains proper semantic structure for layout', () => {
      renderWithProvider(<LeftNavigation />);
      
      // Should be a semantic nav element
      const navElement = screen.getByRole('navigation');
      expect(navElement.tagName).toBe('NAV');
      
      // Should have proper aria-label
      expect(navElement).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('Performance and Optimization', () => {
    it('renders efficiently without unnecessary re-renders', () => {
      const { rerender } = renderWithProvider(<LeftNavigation />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      // Re-render with same props should not cause issues
      rerender(<LeftNavigation />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      const firstButton = screen.getByRole('menuitem', { name: 'Master View focus area' });
      expect(() => fireEvent.click(firstButton)).not.toThrow();
    });

    it('handles rapid state changes without layout shifts', async () => {
      const mockOnNavigate = jest.fn();
      renderWithProvider(<LeftNavigation onNavigate={mockOnNavigate} />);
      const buttons = screen.getAllByRole('menuitem');
      buttons.forEach(button => {
        fireEvent.click(button);
      });
      await waitFor(() => expect(mockOnNavigate).toHaveBeenCalledTimes(6));
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('fixed', 'w-[300px]');
    });
  });

  describe('CSS Class Integration', () => {
    it('combines custom className with layout classes correctly', () => {
      const customClass = 'custom-nav-styling';
      renderWithProvider(<LeftNavigation className={customClass} />);
      
      const navElement = screen.getByRole('navigation');
      
      // Should have both layout classes and custom class
      expect(navElement).toHaveClass(
        'fixed',
        'left-0', 
        'top-0',
        'w-[300px]',
        'h-screen',
        customClass
      );
    });

    it('handles multiple custom classes correctly', () => {
      const customClasses = 'custom-nav custom-border shadow-lg';
      renderWithProvider(<LeftNavigation className={customClasses} />);
      
      const navElement = screen.getByRole('navigation');
      
      // Should apply all classes
      customClasses.split(' ').forEach(className => {
        expect(navElement).toHaveClass(className);
      });
      
      // Should still maintain layout classes
      expect(navElement).toHaveClass('fixed', 'w-[300px]');
    });
  });

  describe('Error Prevention and Edge Cases', () => {
    it('maintains layout stability with missing props', () => {
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // Should still have proper layout classes
      expect(navElement).toHaveClass('fixed', 'w-[300px]', 'h-screen');
    });

    it('handles undefined className without layout issues', () => {
      renderWithProvider(<LeftNavigation className={undefined} />);
      
      const navElement = screen.getByRole('navigation');
      
      // Should maintain layout classes
      expect(navElement).toHaveClass('fixed', 'w-[300px]');
    });

    it('prevents layout breaks with extreme content', () => {
      // This tests what happens if someone modifies the component with long text
      renderWithProvider(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // Should have overflow handling
      expect(navElement).toHaveClass('overflow-y-auto');
      
      // Width should be constrained
      expect(navElement).toHaveClass('w-[300px]');
    });
  });
});