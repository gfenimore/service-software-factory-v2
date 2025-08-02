/**
 * T-002 Layout and Styling Tests
 * Comprehensive testing for fixed positioning, width constraints, and layout integration
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftNavigation from './LeftNavigation';

// Mock Next.js router if needed
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

describe('LeftNavigation T-002: Layout and Styling', () => {
  describe('Fixed Positioning Requirements', () => {
    it('maintains fixed position with correct positioning properties', () => {
      render(<LeftNavigation />);
      
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
      render(<LeftNavigation />);
      
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
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Full height requirement
      expect(navElement).toHaveClass('h-screen');
    });

    it('provides scroll capability when content overflows', () => {
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Overflow handling
      expect(navElement).toHaveClass('overflow-y-auto');
    });

    it('maintains proper z-index for layering above content', () => {
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Z-index requirement
      expect(navElement).toHaveClass('z-10');
    });
  });

  describe('Content Area Integration', () => {
    it('provides structure that allows content area offset', () => {
      // This test ensures the navigation structure supports ml-[300px] offset
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // Navigation should be positioned to allow content offset
      expect(navElement).toHaveClass('fixed', 'left-0');
      
      // Width should match the expected content margin
      expect(navElement).toHaveClass('w-[300px]');
    });

    it('does not interfere with document flow due to fixed positioning', () => {
      render(
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
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // T-002: Visual styling requirements
      expect(navElement).toHaveClass('bg-white');
      expect(navElement).toHaveClass('border-r');
      expect(navElement).toHaveClass('border-gray-200');
    });

    it('provides proper padding and spacing', () => {
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      const contentContainer = navElement.querySelector('.p-6');
      
      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveClass('p-6');
    });

    it('applies consistent typography hierarchy', () => {
      render(<LeftNavigation />);
      
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
      render(<LeftNavigation />);
      
      const moduleContainers = screen.getByRole('navigation').querySelectorAll('.mb-6');
      
      // Should have proper spacing classes
      expect(moduleContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Interactive State Styling', () => {
    it('applies hover state styling to focus area buttons', () => {
      render(<LeftNavigation />);
      
      const focusAreaButtons = screen.getAllByRole('menuitem');
      
      focusAreaButtons.forEach(button => {
        // T-002: Hover state styling
        expect(button).toHaveClass('hover:bg-gray-100');
        expect(button).toHaveClass('hover:text-gray-900');
      });
    });

    it('provides focus state styling for accessibility', () => {
      render(<LeftNavigation />);
      
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
      render(<LeftNavigation />);
      
      const focusAreaButtons = screen.getAllByRole('menuitem');
      
      focusAreaButtons.forEach(button => {
        // T-002: Transition animations
        expect(button).toHaveClass('transition-colors');
        expect(button).toHaveClass('duration-200');
      });
    });

    it('maintains interactive states during user interaction', () => {
      render(<LeftNavigation />);
      
      const firstButton = screen.getByRole('menuitem', { name: 'Master View' });
      
      // Test focus interaction
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Test click interaction (should not change styling classes)
      fireEvent.click(firstButton);
      expect(firstButton).toHaveClass('hover:bg-gray-100');
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
        
        render(<LeftNavigation />);
        
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
      
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // Navigation should maintain its width even on very small screens
      // (Business decision: 300px is maintained for desktop-only app)
      expect(navElement).toHaveClass('w-[300px]');
    });
  });

  describe('Layout Integration with Root Layout', () => {
    it('provides correct class structure for layout integration', () => {
      render(<LeftNavigation />);
      
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
      render(<LeftNavigation />);
      
      // Should be a semantic nav element
      const navElement = screen.getByRole('navigation');
      expect(navElement.tagName).toBe('NAV');
      
      // Should have proper aria-label
      expect(navElement).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('Performance and Optimization', () => {
    it('renders efficiently without unnecessary re-renders', () => {
      const { rerender } = render(<LeftNavigation />);
      
      // Initial render should work
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Re-render with same props should not cause issues
      rerender(<LeftNavigation />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Focus areas should still be clickable
      const firstButton = screen.getByRole('menuitem', { name: 'Master View' });
      expect(() => fireEvent.click(firstButton)).not.toThrow();
    });

    it('handles rapid state changes without layout shifts', () => {
      const mockOnNavigate = jest.fn();
      render(<LeftNavigation onNavigate={mockOnNavigate} />);
      
      const buttons = screen.getAllByRole('menuitem');
      
      // Rapid clicking should not cause layout issues
      buttons.forEach(button => {
        fireEvent.click(button);
      });
      
      expect(mockOnNavigate).toHaveBeenCalledTimes(6);
      
      // Navigation should still be properly positioned
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('fixed', 'w-[300px]');
    });
  });

  describe('CSS Class Integration', () => {
    it('combines custom className with layout classes correctly', () => {
      const customClass = 'custom-nav-styling';
      render(<LeftNavigation className={customClass} />);
      
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
      render(<LeftNavigation className={customClasses} />);
      
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
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // Should still have proper layout classes
      expect(navElement).toHaveClass('fixed', 'w-[300px]', 'h-screen');
    });

    it('handles undefined className without layout issues', () => {
      render(<LeftNavigation className={undefined} />);
      
      const navElement = screen.getByRole('navigation');
      
      // Should maintain layout classes
      expect(navElement).toHaveClass('fixed', 'w-[300px]');
    });

    it('prevents layout breaks with extreme content', () => {
      // This tests what happens if someone modifies the component with long text
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      
      // Should have overflow handling
      expect(navElement).toHaveClass('overflow-y-auto');
      
      // Width should be constrained
      expect(navElement).toHaveClass('w-[300px]');
    });
  });
});