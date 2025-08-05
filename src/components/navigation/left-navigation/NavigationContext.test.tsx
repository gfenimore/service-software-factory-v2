/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { NavigationProvider, useNavigationContext, useNavigationRouting } from './NavigationContext';
import { DEFAULT_NAVIGATION_STATE } from './config';

// Mock Next.js usePathname hook
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
}));

// Test wrapper component
function TestWrapper({ children }: { children: ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('NavigationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockUsePathname.mockReturnValue('/');
  });

  describe('useNavigationContext', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useNavigationContext());
      }).toThrow('useNavigationContext must be used within a NavigationProvider');

      console.error = originalError;
    });

    it('should provide navigation context when used within provider', () => {
      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });
      act(() => {});

      expect(result.current.state).toEqual(DEFAULT_NAVIGATION_STATE);
      expect(result.current.actions).toHaveProperty('selectFocusArea');
      expect(result.current.actions).toHaveProperty('clearSelection');
      expect(result.current.actions).toHaveProperty('restoreFromStorage');
      expect(result.current.actions).toHaveProperty('handleNavigationError');
    });
  });

  describe('Navigation State Management', () => {
    it('should enforce single active focus area constraint (BR-001)', () => {
      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });

      // Initially no active focus area
      expect(result.current.state.activeFocusArea).toBeNull();

      // Select first focus area
      act(() => {
        result.current.actions.selectFocusArea('accounts-master');
      });

      expect(result.current.state.activeFocusArea).toBe('accounts-master');

      // Select different focus area - should replace the previous one
      act(() => {
        result.current.actions.selectFocusArea('operations-work-orders');
      });

      expect(result.current.state.activeFocusArea).toBe('operations-work-orders');
    });

    it('should clear selection when clearSelection is called', () => {
      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });

      // Set an active focus area
      act(() => {
        result.current.actions.selectFocusArea('accounts-master');
      });

      expect(result.current.state.activeFocusArea).toBe('accounts-master');

      // Clear selection
      act(() => {
        result.current.actions.clearSelection();
      });

      expect(result.current.state.activeFocusArea).toBeNull();
    });

    it('should handle navigation errors', () => {
      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });

      const error = {
        type: 'ROUTING_ERROR' as const,
        message: 'Test error',
        originalError: new Error('Original error')
      };

      act(() => {
        result.current.actions.handleNavigationError(error);
      });

      expect(result.current.state.error).toEqual(error);
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  describe('Session Persistence', () => {
    it('should save state to localStorage when focus area is selected', () => {
      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.actions.selectFocusArea('accounts-master');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'navigation-state-v1',
        expect.stringContaining('"activeFocusArea":"accounts-master"')
      );
    });

    it('should remove localStorage entry when selection is cleared', () => {
      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });

      // First select something
      act(() => {
        result.current.actions.selectFocusArea('accounts-master');
      });

      // Then clear it
      act(() => {
        result.current.actions.clearSelection();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('navigation-state-v1');
    });

    it('should restore state from localStorage', () => {
      const storedState = {
        activeFocusArea: 'operations-scheduling',
        timestamp: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedState));

      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.actions.restoreFromStorage();
      });

      expect(result.current.state.activeFocusArea).toBe('operations-scheduling');
    });

    it('should ignore expired localStorage data', () => {
      const expiredState = {
        activeFocusArea: 'accounts-master',
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredState));

      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.actions.restoreFromStorage();
      });

      expect(result.current.state.activeFocusArea).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('navigation-state-v1');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });

      // Should not throw
      expect(() => {
        act(() => {
          result.current.actions.restoreFromStorage();
        });
      }).not.toThrow();

      expect(result.current.state.activeFocusArea).toBeNull();
    });
  });

  describe('T-005: Auto-Restore Functionality', () => {
    it('should auto-restore from URL on mount when pathname matches focus area', () => {
      mockUsePathname.mockReturnValue('/accounts/master');

      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });
      act(() => {});

      expect(result.current.state.activeFocusArea).toBe('accounts-master');
    });

    it('should auto-restore from localStorage when no URL match', () => {
      const storedState = {
        activeFocusArea: 'operations-scheduling',
        timestamp: Date.now()
      };

      mockUsePathname.mockReturnValue('/');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedState));

      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });
      act(() => {});

      // Wait for useEffect to complete
      expect(result.current.state.activeFocusArea).toBe('operations-scheduling');
    });

    it('should prioritize URL over localStorage', () => {
      const storedState = {
        activeFocusArea: 'admin-users',
        timestamp: Date.now()
      };

      mockUsePathname.mockReturnValue('/accounts/reports');
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedState));

      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });
      act(() => {});

      // URL should take priority
      expect(result.current.state.activeFocusArea).toBe('accounts-reports');
    });

    it('should fallback to null when no URL match and no localStorage', () => {
      mockUsePathname.mockReturnValue('/some/unknown/path');
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });
      act(() => {});

      expect(result.current.state.activeFocusArea).toBeNull();
    });

    it('should update when pathname changes', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result, rerender } = renderHook(() => useNavigationContext(), {
        wrapper: TestWrapper,
      });
      act(() => {});

      expect(result.current.state.activeFocusArea).toBeNull();

      // Change pathname
      mockUsePathname.mockReturnValue('/operations/work-orders');
      
      // Rerender to trigger useEffect
      rerender();

      expect(result.current.state.activeFocusArea).toBe('operations-work-orders');
    });
  });

  describe('useNavigationRouting hook', () => {
    it('should provide navigation routing functionality', () => {
      const { result } = renderHook(() => useNavigationRouting(), {
        wrapper: TestWrapper,
      });

      expect(result.current).toHaveProperty('activeFocusArea');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('selectFocusArea');
      expect(result.current).toHaveProperty('clearSelection');
      expect(result.current).toHaveProperty('handleError');
    });

    it('should reflect state changes in routing hook', () => {
      const { result } = renderHook(() => useNavigationRouting(), {
        wrapper: TestWrapper,
      });

      expect(result.current.activeFocusArea).toBeNull();

      act(() => {
        result.current.selectFocusArea('admin-settings');
      });

      expect(result.current.activeFocusArea).toBe('admin-settings');
    });
  });
});