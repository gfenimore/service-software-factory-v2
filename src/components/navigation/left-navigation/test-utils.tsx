/**
 * Test utilities for LeftNavigation component with T-003 state management
 * Provides utilities to test navigation components with proper context
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { NavigationProvider } from './NavigationContext';

// Test wrapper that provides NavigationProvider context
function NavigationTestWrapper({ children }: { children: ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}

// Custom render function that includes NavigationProvider
export function renderWithNavigationProvider(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: NavigationTestWrapper, ...options });
}

// For backward compatibility with existing tests that don't need state management
// This creates a mock version of the old LeftNavigation component
export function createLegacyNavigationMock() {
  return function LegacyLeftNavigation({ className, onNavigate }: { className?: string; onNavigate?: (area: string) => void }) {
    // Hardcoded modules and focus areas for backward compatibility
    const modules = [
      {
        name: 'Accounts',
        focusAreas: ['Master View', 'Reports']
      },
      {
        name: 'Operations',
        focusAreas: ['Work Orders', 'Scheduling']
      },
      {
        name: 'Administration',
        focusAreas: ['User Management', 'System Settings']
      }
    ];

    return (
      <nav
        className={`fixed left-0 top-0 w-[300px] h-screen bg-white border-r border-gray-200 overflow-y-auto z-10 ${className || ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Navigation</h2>
          {modules.map((module) => (
            <div key={module.name} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                {module.name}
              </h3>
              <ul className="space-y-1" role="menu">
                {module.focusAreas.map((focusArea) => (
                  <li key={focusArea} role="none">
                    <button
                      onClick={() => onNavigate?.(`${module.name} > ${focusArea}`)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                      role="menuitem"
                      tabIndex={0}
                    >
                      {focusArea}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    );
  };
}

// Re-export common testing utilities
export * from '@testing-library/react';