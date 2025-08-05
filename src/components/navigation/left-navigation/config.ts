// Navigation Configuration - UPDATED FOR 3 MODULES

import { ModuleDefinition, FocusAreaId, NavigationRoute } from './types';

// Navigation Configuration - Centralized source of truth
export const NAVIGATION_CONFIG: ModuleDefinition[] = [
  {
    id: 'accounts',
    name: 'Accounts',
    focusAreas: [
      { 
        id: 'accounts-master', 
        moduleId: 'accounts',
        name: 'Master View', 
        route: '/accounts/master', 
        placeholder: 'accounts-3column' 
      },
      { 
        id: 'accounts-reports', 
        moduleId: 'accounts',
        name: 'Reports', 
        route: '/accounts/reports', 
        placeholder: 'coming-soon' 
      }
    ]
  },
  {
    id: 'operations', 
    name: 'Operations',
    focusAreas: [
      { 
        id: 'operations-work-orders', 
        moduleId: 'operations',
        name: 'Work Orders', 
        route: '/operations/work-orders', 
        placeholder: 'coming-soon' 
      },
      { 
        id: 'operations-scheduling', 
        moduleId: 'operations',
        name: 'Scheduling', 
        route: '/operations/scheduling', 
        placeholder: 'coming-soon' 
      }
    ]
  },
  {
    id: 'admin',
    name: 'Administration',
    focusAreas: [
      { 
        id: 'admin-users', 
        moduleId: 'admin',
        name: 'User Management', 
        route: '/admin/users', 
        placeholder: 'coming-soon' 
      },
      { 
        id: 'admin-settings', 
        moduleId: 'admin',
        name: 'System Settings', 
        route: '/admin/settings', 
        placeholder: 'coming-soon' 
      }
    ]
  }
];

// Route Mapping - For quick lookups
export const FOCUS_AREA_ROUTES: Record<FocusAreaId, NavigationRoute> = {
  'accounts-master': '/accounts/master',
  'accounts-reports': '/accounts/reports',
  'operations-work-orders': '/operations/work-orders',
  'operations-scheduling': '/operations/scheduling',
  'admin-users': '/admin/users',
  'admin-settings': '/admin/settings'
} as const;

// Reverse mapping for path to focus area lookup
export const ROUTE_TO_FOCUS_AREA: Record<string, FocusAreaId> = {
  '/accounts/master': 'accounts-master',
  '/accounts/reports': 'accounts-reports',
  '/operations/work-orders': 'operations-work-orders',
  '/operations/scheduling': 'operations-scheduling',
  '/admin/users': 'admin-users',
  '/admin/settings': 'admin-settings'
} as const;

// Default navigation state
export const DEFAULT_NAVIGATION_STATE = {
  activeFocusArea: null,
  modules: NAVIGATION_CONFIG,
  isLoading: false,
  error: null
} as const;

// Validation utilities
export function validateFocusAreaId(input: unknown): FocusAreaId | null {
  const validFocusAreas: FocusAreaId[] = [
    'accounts-master', 'accounts-reports',
    'operations-work-orders', 'operations-scheduling',
    'admin-users', 'admin-settings'
  ];
  
  if (typeof input === 'string' && validFocusAreas.includes(input as FocusAreaId)) {
    return input as FocusAreaId;
  }
  
  return null;
}

export function getFocusAreaFromPath(pathname: string): FocusAreaId | null {
  return ROUTE_TO_FOCUS_AREA[pathname] || null;
}