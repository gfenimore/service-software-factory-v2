// Navigation Type Definitions for T-003 State Management

// Core Domain Types - UPDATED FOR 3 MODULES
export type ModuleId = 'accounts' | 'operations' | 'admin';

export type FocusAreaId = 
  | 'accounts-master' | 'accounts-reports'
  | 'operations-work-orders' | 'operations-scheduling'  
  | 'admin-users' | 'admin-settings';

export type PlaceholderType = 'accounts-3column' | 'coming-soon';

export type NavigationRoute = 
  | '/accounts/master' | '/accounts/reports' 
  | '/operations/work-orders' | '/operations/scheduling' 
  | '/admin/users' | '/admin/settings';

// Data Models
export interface FocusAreaDefinition {
  id: FocusAreaId;
  moduleId: ModuleId;
  name: string;
  route: NavigationRoute;
  placeholder: PlaceholderType;
}

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  icon?: string;
  focusAreas: FocusAreaDefinition[];
}

// State Management Types
export interface NavigationState {
  activeFocusArea: FocusAreaId | null;
  modules: ModuleDefinition[];
  isLoading: boolean;
  error: NavigationError | null;
}

export interface NavigationError {
  type: 'ROUTING_ERROR' | 'PERSISTENCE_ERROR' | 'VALIDATION_ERROR';
  message: string;
  originalError?: unknown;
}

// Action Types for useReducer
export type NavigationAction = 
  | { type: 'SELECT_FOCUS_AREA'; payload: FocusAreaId }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_ERROR'; payload: NavigationError }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESTORE_STATE'; payload: Partial<NavigationState> };

// Context Types
export interface NavigationActions {
  selectFocusArea: (focusAreaId: FocusAreaId) => void;
  clearSelection: () => void;
  restoreFromStorage: () => void;
  handleNavigationError: (error: NavigationError) => void;
}

export interface NavigationContextValue {
  state: NavigationState;
  actions: NavigationActions;
}

// Component Props Types
export interface LeftNavigationProps {
  className?: string;
  onNavigate?: (focusArea: FocusAreaId) => void;
}

export interface NavigationModuleProps {
  module: ModuleDefinition;
  activeFocusArea: FocusAreaId | null;
  onItemSelect: (focusArea: FocusAreaId) => void;
}

export interface NavigationItemProps {
  focusArea: FocusAreaDefinition;
  isActive: boolean;
  onSelect: () => void;
  tabIndex: number;
}