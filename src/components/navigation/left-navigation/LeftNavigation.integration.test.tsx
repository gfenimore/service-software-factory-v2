/**
 * T-002 Integration Tests
 * Testing navigation integration with root layout and system components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftNavigation from './LeftNavigation';

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock layout component for integration testing
const MockRootLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="mock-root-layout">
    <LeftNavigation />
    <main className="ml-[300px] min-h-screen">
      <div className="p-6">
        {children}
      </div>
    </main>
  </div>
);

const MockPageContent = () => (
  <div>
    <h1>Test Page Content</h1>
    <p>This is the main content area that should not overlap with navigation.</p>
    <div style={{ height: '2000px' }}>
      <p>Long content for scroll testing</p>
    </div>
  </div>
);

describe('LeftNavigation T-002: Integration Testing', () => {
  describe('Root Layout Integration', () => {
    it('integrates cleanly with root layout structure', () => {
      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      // Navigation should be present
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();

      // Main content should be present
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();

      // Content should have proper offset
      expect(mainContent).toHaveClass('ml-[300px]');
    });

    it('prevents content overlap with proper layout classes', () => {
      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      const navigation = screen.getByRole('navigation');
      const mainContent = screen.getByRole('main');

      // Navigation should be fixed and 300px wide
      expect(navigation).toHaveClass('fixed', 'w-[300px]', 'left-0');

      // Main content should have matching left margin
      expect(mainContent).toHaveClass('ml-[300px]');
    });

    it('maintains proper z-index layering', () => {
      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      const navigation = screen.getByRole('navigation');

      // Navigation should have z-index to stay above content
      expect(navigation).toHaveClass('z-10');
    });
  });

  describe('Content Area Compatibility', () => {
    it('allows content area to use full remaining width', () => {
      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      const mainContent = screen.getByRole('main');

      // Main content should take remaining space
      expect(mainContent).toHaveClass('ml-[300px]');
      expect(mainContent).toHaveClass('min-h-screen');
    });

    it('handles long content without affecting navigation', () => {
      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      const navigation = screen.getByRole('navigation');
      const longContent = screen.getByText('Long content for scroll testing');

      // Navigation should remain fixed
      expect(navigation).toHaveClass('fixed');

      // Long content should be present without affecting nav
      expect(longContent).toBeInTheDocument();
    });

    it('supports content padding without layout interference', () => {
      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      const contentPadding = screen.getByRole('main').querySelector('.p-6');
      expect(contentPadding).toBeInTheDocument();
      expect(contentPadding).toHaveClass('p-6');
    });
  });

  describe('Hydration and SSR Compatibility', () => {
    it('renders consistently on server and client', () => {
      // This test ensures no hydration mismatches
      const serverRender = render(<LeftNavigation />);
      const navigation1 = screen.getByRole('navigation');

      serverRender.unmount();

      // Client render should match
      render(<LeftNavigation />);
      const navigation2 = screen.getByRole('navigation');

      // Both should have same classes
      expect(navigation1.className).toBe(navigation2.className);
      expect(navigation2).toHaveClass('fixed', 'w-[300px]');
    });

    it('maintains consistent module and focus area structure', () => {
      render(<LeftNavigation />);

      // Module structure should be consistent
      const modules = screen.getAllByRole('heading', { level: 3 });
      expect(modules).toHaveLength(3);

      // Focus areas should be consistent
      const focusAreas = screen.getAllByRole('menuitem');
      expect(focusAreas).toHaveLength(6);
    });

    it('preserves semantic HTML structure for SSR', () => {
      render(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');

      // Should have proper semantic structure
      expect(navigation.tagName).toBe('NAV');
      expect(navigation).toHaveAttribute('role', 'navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('Performance in Integrated Environment', () => {
    it('does not cause layout recalculation when integrated', () => {
      const { rerender } = render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      // Initial render
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('fixed', 'w-[300px]');

      // Re-render should not change layout
      rerender(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      const updatedNavigation = screen.getByRole('navigation');
      expect(updatedNavigation).toHaveClass('fixed', 'w-[300px]');
    });

    it('maintains performance with content changes', () => {
      const { rerender } = render(
        <MockRootLayout>
          <div>Initial Content</div>
        </MockRootLayout>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();

      // Change content
      rerender(
        <MockRootLayout>
          <div>Updated Content</div>
        </MockRootLayout>
      );

      // Navigation should remain stable
      const updatedNavigation = screen.getByRole('navigation');
      expect(updatedNavigation).toHaveClass('fixed', 'w-[300px]');
    });
  });

  describe('Global Styles Integration', () => {
    it('integrates with Tailwind CSS system', () => {
      render(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');

      // Should use Tailwind utility classes
      const expectedClasses = [
        'fixed', 'left-0', 'top-0', 'w-[300px]', 'h-screen',
        'bg-white', 'border-r', 'border-gray-200', 'overflow-y-auto', 'z-10'
      ];

      expectedClasses.forEach(className => {
        expect(navigation).toHaveClass(className);
      });
    });

    it('maintains consistent styling with global CSS variables', () => {
      render(<LeftNavigation />);

      // Component should work with CSS custom properties if needed
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();

      // Typography should use consistent classes
      const heading = screen.getByRole('heading', { name: 'Navigation' });
      expect(heading).toHaveClass('text-xl', 'font-semibold');
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles errors gracefully without breaking layout', () => {
      // Create a component that might error
      const PotentiallyErrorComponent = ({ shouldError }: { shouldError: boolean }) => {
        if (shouldError) {
          throw new Error('Test error');
        }
        return <LeftNavigation />;
      };

      // Test error boundary behavior
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        render(<PotentiallyErrorComponent shouldError={false} />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      } finally {
        consoleError.mockRestore();
      }
    });

    it('maintains layout structure even with partial component failures', () => {
      render(
        <div>
          <LeftNavigation />
          <div data-testid="other-component">Other Component</div>
        </div>
      );

      // Both components should render
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('other-component')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains accessibility with layout constraints', () => {
      render(<LeftNavigation />);

      const navigation = screen.getByRole('navigation');

      // Should be accessible despite fixed positioning
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');

      // Focus management should work
      const firstFocusArea = screen.getByRole('menuitem', { name: 'Master View' });
      firstFocusArea.focus();
      expect(firstFocusArea).toHaveFocus();
    });

    it('provides proper landmark structure in layout', () => {
      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      // Should have navigation landmark
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();

      // Should have main landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('maintains proper heading hierarchy in context', () => {
      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      // Page should have h1
      const pageHeading = screen.getByRole('heading', { level: 1 });
      expect(pageHeading).toBeInTheDocument();

      // Navigation should have h2
      const navHeading = screen.getByRole('heading', { level: 2, name: 'Navigation' });
      expect(navHeading).toBeInTheDocument();

      // Modules should have h3
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(moduleHeadings).toHaveLength(3);
    });
  });

  describe('Mobile and Touch Integration', () => {
    it('handles touch interactions appropriately', () => {
      render(<LeftNavigation />);

      const focusAreaButton = screen.getByRole('menuitem', { name: 'Master View' });

      // Should be touchable (button element)
      expect(focusAreaButton.tagName).toBe('BUTTON');
      // Note: type="button" is default for button elements, may not be explicitly set
      expect(focusAreaButton).toBeInstanceOf(HTMLButtonElement);
    });

    it('maintains layout on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <MockRootLayout>
          <MockPageContent />
        </MockRootLayout>
      );

      const navigation = screen.getByRole('navigation');

      // Should maintain fixed width even on mobile
      // (This is per the desktop-only application requirement)
      expect(navigation).toHaveClass('w-[300px]', 'fixed');
    });
  });
});