/**
 * T-002 Visual and Responsive Testing
 * Comprehensive testing for visual appearance, hover states, and responsive behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
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
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock matchMedia for responsive testing
const createMatchMedia = () => {
  return jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe('LeftNavigation T-002: Visual and Responsive Testing', () => {
  beforeEach(() => {
    // Reset any viewport mocks
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  describe('Visual Styling Verification', () => {
    it('applies correct background and border styling', () => {
      renderWithProvider(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');

      // T-002: Background and border requirements
      expect(navigation).toHaveClass('bg-white');
      expect(navigation).toHaveClass('border-r');
      expect(navigation).toHaveClass('border-gray-200');
    });

    it('implements proper typography hierarchy', () => {
      renderWithProvider(<LeftNavigation />);

      // Main navigation heading (H2)
      const mainHeading = screen.getByRole('heading', { name: 'Navigation', level: 2 });
      expect(mainHeading).toHaveClass('text-xl', 'font-semibold', 'text-gray-900', 'mb-6');

      // Module headings (H3)
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(moduleHeadings).toHaveLength(3);

      moduleHeadings.forEach(heading => {
        expect(heading).toHaveClass(
          'text-sm',
          'font-semibold', 
          'text-gray-700',
          'mb-3',
          'uppercase',
          'tracking-wider'
        );
      });
    });

    it('applies consistent spacing and layout classes', () => {
      renderWithProvider(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');
      
      // Container padding
      const paddingContainer = navigation.querySelector('.p-6');
      expect(paddingContainer).toBeInTheDocument();

      // Module spacing
      const moduleContainers = navigation.querySelectorAll('.mb-6');
      expect(moduleContainers.length).toBeGreaterThan(0);

      // List spacing
      const lists = screen.getAllByRole('menu');
      lists.forEach(list => {
        expect(list).toHaveClass('space-y-1');
      });
    });

    it('implements proper button styling for focus areas', () => {
      renderWithProvider(<LeftNavigation />);

      const focusAreaButtons = screen.getAllByRole('menuitem');

      focusAreaButtons.forEach(button => {
        // Base button styling
        expect(button).toHaveClass(
          'w-full',
          'text-left',
          'px-3',
          'py-2',
          'text-sm',
          'text-gray-700',
          'rounded-md'
        );

        // Interactive states
        expect(button).toHaveClass(
          'hover:bg-gray-100',
          'hover:text-gray-900'
        );

        // Focus states
        expect(button).toHaveClass(
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-blue-500',
          'focus:ring-offset-2'
        );

        // Transitions
        expect(button).toHaveClass(
          'transition-colors',
          'duration-200'
        );
      });
    });
  });

  describe('Module and Focus Area Visual Structure', () => {
    it('renders all 3 modules with correct visual hierarchy', () => {
      renderWithProvider(<LeftNavigation />);

      const expectedModules = ['Accounts', 'Operations', 'Administration'];

      expectedModules.forEach((moduleName) => {
        const moduleHeading = screen.getByRole('heading', { name: moduleName, level: 3 });
        expect(moduleHeading).toBeInTheDocument();
        expect(moduleHeading).toBeVisible();

        // Check visual styling
        expect(moduleHeading).toHaveClass('text-sm', 'font-semibold', 'text-gray-700');
      });
    });

    it('displays focus areas with consistent visual formatting', () => {
      renderWithProvider(<LeftNavigation />);

      const expectedFocusAreas = [
        'Master View', 'Reports', // Accounts
        'Work Orders', 'Scheduling', // Operations
        'User Management', 'System Settings' // Administration
      ];

      expectedFocusAreas.forEach(focusAreaName => {
        const focusAreaButton = screen.getByRole('menuitem', { name: `${focusAreaName} focus area` });
        expect(focusAreaButton).toBeInTheDocument();
        expect(focusAreaButton).toBeVisible();

        // Consistent button styling
        expect(focusAreaButton).toHaveClass('text-sm', 'text-gray-700');
      });
    });

    it('maintains proper visual spacing between modules', () => {
      renderWithProvider(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');
      const moduleContainers = navigation.querySelectorAll('div.mb-6');

      // Should have spacing containers for modules
      expect(moduleContainers.length).toBeGreaterThanOrEqual(3);
    });

    it('provides visual distinction between modules and focus areas', () => {
      renderWithProvider(<LeftNavigation />);

      // Module headings should have different styling than focus areas
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      const focusAreaButtons = screen.getAllByRole('menuitem');

      // Module headings: uppercase, different color
      moduleHeadings.forEach(heading => {
        expect(heading).toHaveClass('uppercase', 'text-gray-700');
      });

      // Focus area buttons: normal case, button styling
      focusAreaButtons.forEach(button => {
        expect(button).toHaveClass('text-gray-700', 'rounded-md');
        expect(button).not.toHaveClass('uppercase');
      });
    });
  });

  describe('Interactive State Visual Feedback', () => {
    it('provides visual hover feedback on focus area buttons', () => {
      renderWithProvider(<LeftNavigation />);

      const focusAreaButtons = screen.getAllByRole('menuitem');

      focusAreaButtons.forEach(button => {
        // Hover state classes should be present
        expect(button).toHaveClass('hover:bg-gray-100');
        expect(button).toHaveClass('hover:text-gray-900');
      });
    });

    it('implements accessible focus indicators', () => {
      renderWithProvider(<LeftNavigation />);

      const focusAreaButtons = screen.getAllByRole('menuitem');

      focusAreaButtons.forEach(button => {
        // Focus ring for accessibility
        expect(button).toHaveClass('focus:ring-2');
        expect(button).toHaveClass('focus:ring-blue-500');
        expect(button).toHaveClass('focus:ring-offset-2');
        expect(button).toHaveClass('focus:outline-none');
      });
    });

    it('includes smooth transition animations', () => {
      renderWithProvider(<LeftNavigation />);

      const focusAreaButtons = screen.getAllByRole('menuitem');

      focusAreaButtons.forEach(button => {
        expect(button).toHaveClass('transition-colors');
        expect(button).toHaveClass('duration-200');
      });
    });

    it('maintains visual consistency during interaction', () => {
      renderWithProvider(<LeftNavigation />);

      const firstButton = screen.getByRole('menuitem', { name: 'Master View focus area' });
        
        // Before interaction
        expect(firstButton).toHaveClass('text-gray-700');

        // Focus interaction
        firstButton.focus();
        expect(firstButton).toHaveFocus();
        expect(firstButton).toHaveClass('text-gray-700'); // Base color unchanged

        // Click interaction
        fireEvent.click(firstButton);
      expect(firstButton).toHaveClass('text-white'); // Active state color updated
    });
  });

  describe('Responsive Behavior Testing', () => {
    const viewportSizes = [
      { width: 1920, height: 1080, name: 'Large Desktop', shouldShowNav: true },
      { width: 1440, height: 900, name: 'Standard Desktop', shouldShowNav: true },
      { width: 1024, height: 768, name: 'Small Desktop', shouldShowNav: true },
      { width: 768, height: 1024, name: 'Tablet Portrait', shouldShowNav: true },
      { width: 375, height: 667, name: 'Mobile', shouldShowNav: true }, // Desktop-only app
    ];

    viewportSizes.forEach(({ width, height, name, shouldShowNav }) => {
      it(`maintains navigation visibility and 300px width at ${name} (${width}x${height})`, () => {
        // Mock viewport
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

        window.matchMedia = createMatchMedia();

        renderWithProvider(<LeftNavigation />);

        const navigation = screen.getByRole('navigation');

        if (shouldShowNav) {
          // Navigation should be visible and maintain 300px width
          expect(navigation).toBeInTheDocument();
          expect(navigation).toHaveClass('w-[300px]');
          expect(navigation).toHaveClass('fixed');
        }
      });
    });

    it('handles viewport width smaller than navigation width', () => {
      // Test very narrow viewport (320px)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      renderWithProvider(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');

      // Should still maintain 300px width (business decision for desktop-only)
      expect(navigation).toHaveClass('w-[300px]');
      expect(navigation).toHaveClass('fixed');
    });

    it('maintains visual hierarchy at all viewport sizes', () => {
      const testSizes = [1920, 1024, 768, 375];

      testSizes.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = renderWithProvider(<LeftNavigation />);

        // All modules should be visible
        expect(screen.getByText('Accounts')).toBeVisible();
        expect(screen.getByText('Operations')).toBeVisible();
        expect(screen.getByText('Administration')).toBeVisible();

        // All focus areas should be accessible
        const focusAreas = screen.getAllByRole('menuitem');
        expect(focusAreas).toHaveLength(6);

        focusAreas.forEach(button => {
          expect(button).toBeVisible();
        });

        unmount();
      });
    });

    it('handles orientation changes gracefully', () => {
      // Start in landscape
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderWithProvider(<LeftNavigation />);

      let navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('w-[300px]', 'h-screen');

      // Change to portrait
      cleanup();
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      renderWithProvider(<LeftNavigation />);

      navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('w-[300px]', 'h-screen');
    });
  });

  describe('Visual Consistency and Layout Stability', () => {
    it('prevents layout shifts during content loading', () => {
      renderWithProvider(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');
      const initialClasses = navigation.className;

      // Re-render (simulate content update)
      renderWithProvider(<LeftNavigation />);

      // FIRST EDIT: verify all rendered navigation elements maintain initial classes
      const navigations = screen.getAllByRole('navigation');
      navigations.forEach(nav => {
        expect(nav.className).toBe(initialClasses);
      });
    });

    it('maintains consistent styling with prop changes', () => {
      renderWithProvider(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('w-[300px]', 'fixed');

      // Re-render with custom className
      renderWithProvider(<LeftNavigation className="custom-class" />);

      // SECOND EDIT: target the newly added navigation element for class assertion
      const updatedNavigation = screen.getAllByRole('navigation')[1];
      expect(updatedNavigation).toHaveClass('w-[300px]', 'fixed', 'custom-class');
    });

    it('preserves visual state during interaction', () => {
      const mockOnNavigate = jest.fn();
      renderWithProvider(<LeftNavigation onNavigate={mockOnNavigate} />);

      const navigation = screen.getByRole('navigation');
      const initialClasses = navigation.className;

      // Interact with multiple focus areas
      const buttons = screen.getAllByRole('menuitem');
      buttons.forEach(button => fireEvent.click(button));

      // Navigation should maintain visual consistency
      const finalNavigation = screen.getByRole('navigation');
      expect(finalNavigation.className).toBe(initialClasses);
    });
  });

  describe('Performance Visual Testing', () => {
    it('renders visual elements efficiently', () => {
      const startTime = performance.now();
      
      renderWithProvider(<LeftNavigation />);

      // All visual elements should be present
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
      expect(screen.getAllByRole('menuitem')).toHaveLength(6);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render reasonably quickly (arbitrary threshold for testing)
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });

    it('handles rapid visual state changes efficiently', async () => {
      const mockOnNavigate = jest.fn();
      renderWithProvider(<LeftNavigation onNavigate={mockOnNavigate} />);
      const buttons = screen.getAllByRole('menuitem');

      // Rapid clicking simulation
      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        buttons.forEach(button => fireEvent.click(button));
      }
      const endTime = performance.now();
      const interactionTime = endTime - startTime;

      // Should handle interactions efficiently
      expect(interactionTime).toBeLessThan(50); // 50ms threshold for 60 interactions
      // THIRD EDIT: wait for the onNavigate callback invocations
      await waitFor(() => expect(mockOnNavigate).toHaveBeenCalledTimes(60)); // 6 buttons × 10 iterations
    });
  });

  describe('Visual Accessibility and Contrast', () => {
    it('provides sufficient color contrast for text elements', () => {
      renderWithProvider(<LeftNavigation />);

      // Main heading should have high contrast
      const mainHeading = screen.getByRole('heading', { name: 'Navigation' });
      expect(mainHeading).toHaveClass('text-gray-900'); // High contrast text

      // Module headings should have good contrast  
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      moduleHeadings.forEach(heading => {
        expect(heading).toHaveClass('text-gray-700'); // Medium contrast text
      });

      // Focus area buttons should have readable contrast
      const focusAreaButtons = screen.getAllByRole('menuitem');
      focusAreaButtons.forEach(button => {
        // FOURTH EDIT: differentiate active vs inactive contrast
        if (button.getAttribute('aria-current') === 'page') {
          expect(button).toHaveClass('text-white'); // Readable contrast for active
        } else {
          expect(button).toHaveClass('text-gray-700'); // Readable contrast for inactive
        }
      });
    });

    it('provides clear visual focus indicators', () => {
      renderWithProvider(<LeftNavigation />);

      const focusAreaButtons = screen.getAllByRole('menuitem');

      focusAreaButtons.forEach(button => {
        // Should have visible focus ring
        expect(button).toHaveClass('focus:ring-2');
        expect(button).toHaveClass('focus:ring-blue-500'); // Blue focus ring
        expect(button).toHaveClass('focus:ring-offset-2'); // Offset for visibility
      });
    });

    it('maintains visual clarity with background and borders', () => {
      renderWithProvider(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');

      // Should have clear background
      expect(navigation).toHaveClass('bg-white');

      // Should have visible border
      expect(navigation).toHaveClass('border-r', 'border-gray-200');
    });
  });
});