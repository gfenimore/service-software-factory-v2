"use client";

import { useRouter } from 'next/navigation';
import { useNavigationRouting } from './NavigationContext';
import { NAVIGATION_CONFIG, FOCUS_AREA_ROUTES } from './config';
import { LeftNavigationProps, FocusAreaId } from './types';

export default function LeftNavigation({ className, onNavigate }: LeftNavigationProps) {
  const router = useRouter();
  const { 
    activeFocusArea, 
    selectFocusArea, 
    handleError 
  } = useNavigationRouting();

  // T-003: Navigation state management with single active focus area enforcement
  const handleFocusAreaSelection = async (focusAreaId: FocusAreaId) => {
    try {
      // BR-001: Single Active Focus Area Constraint - automatically enforced by state management
      selectFocusArea(focusAreaId);
      
      // Navigate to the route
      const route = FOCUS_AREA_ROUTES[focusAreaId];
      await router.push(route);
      
      // Backward compatibility - call legacy onNavigate callback
      onNavigate?.(focusAreaId);
    } catch (error) {
      handleError({
        type: 'ROUTING_ERROR',
        message: `Failed to navigate to ${focusAreaId}`,
        originalError: error
      });
    }
  };

  return (
    <nav 
      className={`fixed left-0 top-0 w-[300px] h-screen bg-white border-r border-gray-200 overflow-y-auto z-10 ${className || ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Navigation</h2>
        {NAVIGATION_CONFIG.map((module) => (
          <div key={module.id} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              {module.name}
            </h3>
            <ul className="space-y-1" role="menu">
              {module.focusAreas.map((focusArea) => {
                const isActive = activeFocusArea === focusArea.id;
                return (
                  <li key={focusArea.id} role="none">
                    <button 
                      onClick={() => handleFocusAreaSelection(focusArea.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
                        isActive 
                          ? 'bg-blue-600 text-white font-semibold' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      role="menuitem"
                      tabIndex={0}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={`${focusArea.name} focus area`}
                    >
                      {focusArea.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}