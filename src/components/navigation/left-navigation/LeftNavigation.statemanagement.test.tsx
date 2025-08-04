/**
 * T-003 State Management Integration Tests
 * Tests specifically for the navigation state management functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavigationProvider, useNavigationContext } from './NavigationContext';
import LeftNavigation from './LeftNavigation';

// Define the NavigationState type to match your context
interface NavigationState {
  activeFocusArea: string | null;
  error: Error | null;
  isLoading: boolean;
}

// Enhanced router mock that returns promises
const mockPush = jest.fn(() => Promise.resolve());
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
}));

// Test wrapper for navigation context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}

// Helper function to render with navigation provider
function renderWithProvider(component: React.ReactElement) {
  return render(component, { wrapper: TestWrapper });
}

// Test component to expose navigation state
function NavigationStateInspector({ onStateChange }: { onStateChange: (state: NavigationState) => void }) {
  const { state } = useNavigationContext();
  
  React.useEffect(() => {
    onStateChange(state as NavigationState);
  }, [state, onStateChange]);

  return null;
}

describe('T-003: Navigation State Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  describe('Single Active Focus Area Enforcement (BR-001)', () => {
    it('should enforce only one active focus area at a time', async () => {
      const stateChanges: NavigationState[] = [];
      const captureState = (state: NavigationState) => stateChanges.push(state);

      renderWithProvider(
        <>
          <LeftNavigation />
          <NavigationStateInspector onStateChange={captureState} />
        </>
      );

      // Click first focus area
      const masterViewButton = screen.getByRole('menuitem', { name: 'Master View focus area' });
      fireEvent.click(masterViewButton);

      await waitFor(() => {
        const latestState = stateChanges[stateChanges.length - 1];
        expect(latestState.activeFocusArea).toBe('accounts-master');
      });

      // Click different focus area
      const workOrdersButton = screen.getByRole('menuitem', { name: 'Work Orders focus area' });
      fireEvent.click(workOrdersButton);

      await waitFor(() => {
        const latestState = stateChanges[stateChanges.length - 1];
        expect(latestState.activeFocusArea).toBe('operations-work-orders');
      });

      // Verify only one is active
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.activeFocusArea).toBe('operations-work-orders');
    });

    it('should show visual active state for selected focus area', async () => {
      renderWithProvider(<LeftNavigation />);

      const masterViewButton = screen.getByRole('menuitem', { name: 'Master View focus area' });
      const workOrdersButton = screen.getByRole('menuitem', { name: 'Work Orders focus area' });

      // Initially no active state
      expect(masterViewButton).not.toHaveClass('bg-blue-600');
      expect(workOrdersButton).not.toHaveClass('bg-blue-600');

      // Click Master View
      fireEvent.click(masterViewButton);

      await waitFor(() => {
        expect(masterViewButton).toHaveClass('bg-blue-600', 'text-white', 'font-semibold');
        expect(workOrdersButton).not.toHaveClass('bg-blue-600');
      });

      // Click Work Orders
      fireEvent.click(workOrdersButton);

      await waitFor(() => {
        expect(workOrdersButton).toHaveClass('bg-blue-600', 'text-white', 'font-semibold');
        expect(masterViewButton).not.toHaveClass('bg-blue-600');
      });
    });
  });

  describe('Navigation State Updates', () => {
    it('should update state correctly on navigation', async () => {
      const stateChanges: NavigationState[] = [];
      const captureState = (state: NavigationState) => stateChanges.push(state);

      renderWithProvider(
        <>
          <LeftNavigation />
          <NavigationStateInspector onStateChange={captureState} />
        </>
      );

      const reportsButton = screen.getByRole('menuitem', { name: 'Reports focus area' });
      fireEvent.click(reportsButton);

      await waitFor(() => {
        const latestState = stateChanges[stateChanges.length - 1];
        expect(latestState.activeFocusArea).toBe('accounts-reports');
        expect(latestState.error).toBeNull();
        expect(latestState.isLoading).toBe(false);
      });
    });

    it('should call router.push with correct route', async () => {
      renderWithProvider(<LeftNavigation />);

      const schedulingButton = screen.getByRole('menuitem', { name: 'Scheduling focus area' });
      fireEvent.click(schedulingButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/operations/scheduling');
      });
    });
  });

  describe('Callback Integration', () => {
    it('should call onNavigate callback with FocusAreaId after state update', async () => {
      const mockOnNavigate = jest.fn();
      
      renderWithProvider(<LeftNavigation onNavigate={mockOnNavigate} />);

      const settingsButton = screen.getByRole('menuitem', { name: 'System Settings focus area' });
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('admin-settings');
      });
    });

    it('should handle multiple sequential navigation calls', async () => {
      const mockOnNavigate = jest.fn();
      
      renderWithProvider(<LeftNavigation onNavigate={mockOnNavigate} />);

      // Navigate to different areas
      const masterViewButton = screen.getByRole('menuitem', { name: 'Master View focus area' });
      const userMgmtButton = screen.getByRole('menuitem', { name: 'User Management focus area' });

      fireEvent.click(masterViewButton);
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('accounts-master');
      });

      fireEvent.click(userMgmtButton);
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('admin-users');
      });

      expect(mockOnNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle router errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockPush.mockRejectedValueOnce(new Error('Navigation failed'));

      renderWithProvider(<LeftNavigation />);

      const masterViewButton = screen.getByRole('menuitem', { name: 'Master View focus area' });
      
      // Should not throw even if router fails
      expect(() => fireEvent.click(masterViewButton)).not.toThrow();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain proper aria-current for active focus area', async () => {
      renderWithProvider(<LeftNavigation />);

      const masterViewButton = screen.getByRole('menuitem', { name: 'Master View focus area' });
      const reportsButton = screen.getByRole('menuitem', { name: 'Reports focus area' });

      // Initially no aria-current
      expect(masterViewButton).not.toHaveAttribute('aria-current');
      expect(reportsButton).not.toHaveAttribute('aria-current');

      // Click Master View
      fireEvent.click(masterViewButton);

      await waitFor(() => {
        expect(masterViewButton).toHaveAttribute('aria-current', 'page');
        expect(reportsButton).not.toHaveAttribute('aria-current');
      });

      // Click Reports  
      fireEvent.click(reportsButton);

      await waitFor(() => {
        expect(reportsButton).toHaveAttribute('aria-current', 'page');
        expect(masterViewButton).not.toHaveAttribute('aria-current');
      });
    });
  });
});