"use client";

import { NavigationProvider } from './NavigationContext';
import LeftNavigation from './LeftNavigation';
import { LeftNavigationProps } from './types';

/**
 * LeftNavigation component wrapped with NavigationProvider
 * This ensures the component has access to navigation state management
 * For T-003: Navigation State Management implementation
 */
export default function LeftNavigationWithProvider(props: LeftNavigationProps) {
  return (
    <NavigationProvider>
      <LeftNavigation {...props} />
    </NavigationProvider>
  );
}