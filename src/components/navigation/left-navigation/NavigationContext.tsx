"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { 
  NavigationState, 
  NavigationAction, 
  NavigationContextValue,
  NavigationError,
  FocusAreaId 
} from './types';
import { DEFAULT_NAVIGATION_STATE, getFocusAreaFromPath } from './config';

// State Reducer Implementation - Enforces single active state business rule
function navigationReducer(
  state: NavigationState, 
  action: NavigationAction
): NavigationState {
  switch (action.type) {
    case 'SELECT_FOCUS_AREA':
      // BR-001: Single Active Focus Area Constraint
      return {
        ...state,
        activeFocusArea: action.payload,
        error: null,
        isLoading: false
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        activeFocusArea: null,
        error: null
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload,
        isLoading: false
      };
      
    default:
      return state;
  }
}

// Navigation Context
const NavigationContext = createContext<NavigationContextValue | null>(null);

// Context Provider Props
interface NavigationProviderProps {
  children: ReactNode;
  initialState?: Partial<NavigationState>;
}

// Navigation Provider Component
export function NavigationProvider({ children, initialState }: NavigationProviderProps) {
  const pathname = usePathname();
  const [state, dispatch] = useReducer(
    navigationReducer, 
    { ...DEFAULT_NAVIGATION_STATE, ...initialState }
  );

  // Action Creators - Encapsulate business logic
  const selectFocusArea = useCallback((focusAreaId: FocusAreaId) => {
    dispatch({ type: 'SELECT_FOCUS_AREA', payload: focusAreaId });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const handleNavigationError = useCallback((error: NavigationError) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const restoreFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('navigation-state-v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate stored state age (24 hour expiry)
        if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('navigation-state-v1');
          return;
        }
        
        dispatch({ 
          type: 'RESTORE_STATE', 
          payload: { 
            activeFocusArea: parsed.activeFocusArea 
          } 
        });
      }
    } catch (error) {
      console.warn('Navigation state restoration failed:', error);
      // Graceful degradation - continue without restored state
    }
  }, []);

  // Save state to localStorage whenever active focus area changes
  const saveToStorage = useCallback((activeFocusArea: FocusAreaId | null) => {
    try {
      if (activeFocusArea) {
        const persistableState = {
          activeFocusArea,
          timestamp: Date.now()
        };
        localStorage.setItem('navigation-state-v1', JSON.stringify(persistableState));
      } else {
        localStorage.removeItem('navigation-state-v1');
      }
    } catch (error) {
      console.warn('Navigation state persistence failed:', error);
      // Graceful degradation - continue without persistence
    }
  }, []);

  // T-005: Auto-restore state on mount with URL priority and fallback chain
  useEffect(() => {
    // Priority 1: Restore from current URL if it matches a focus area
    const focusAreaFromUrl = getFocusAreaFromPath(pathname);
    if (focusAreaFromUrl) {
      dispatch({ type: 'SELECT_FOCUS_AREA', payload: focusAreaFromUrl });
      return;
    }

    // Priority 2: Restore from localStorage
    restoreFromStorage();
    
    // Priority 3: Default fallback is handled by DEFAULT_NAVIGATION_STATE (null)
    // This allows the UI to show no active selection, which is appropriate
  }, [pathname, restoreFromStorage]);

  // Auto-save when active focus area changes
  const actions = {
    selectFocusArea: useCallback((focusAreaId: FocusAreaId) => {
      selectFocusArea(focusAreaId);
      saveToStorage(focusAreaId);
    }, [selectFocusArea, saveToStorage]),
    clearSelection: useCallback(() => {
      clearSelection();
      saveToStorage(null);
    }, [clearSelection, saveToStorage]),
    restoreFromStorage,
    handleNavigationError
  };

  const contextValue: NavigationContextValue = {
    state,
    actions
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// Custom Hook for using Navigation Context
export function useNavigationContext(): NavigationContextValue {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  
  return context;
}

// Hook for navigation routing integration
export function useNavigationRouting() {
  const { state, actions } = useNavigationContext();
  
  return {
    activeFocusArea: state.activeFocusArea,
    isLoading: state.isLoading,
    error: state.error,
    selectFocusArea: actions.selectFocusArea,
    clearSelection: actions.clearSelection,
    handleError: actions.handleNavigationError
  };
}