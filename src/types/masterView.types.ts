/**
 * Master View Layout Types
 * Generated from US-004 Architecture Document
 */

import { ReactNode } from 'react';

// Master View Layout Component Types
export interface MasterViewLayoutProps {
  children: ReactNode;
  className?: string;
}

export interface LayoutGridAreas {
  columnOne: ReactNode;
  columnTwo: ReactNode;
  columnThree: ReactNode;
}

// Column Container Component Types
export interface ColumnContainerProps {
  children: ReactNode;
  width: 'fixed-300' | 'fixed-400' | 'flexible';
  header?: ReactNode;
  className?: string;
}

// Accounts Column Header Component Types
export interface AccountsColumnHeaderProps {
  accountCount: number;
  isLoading?: boolean;
  className?: string;
}

// Page Integration Types
export interface PageLayoutIntegration {
  masterView: MasterViewLayoutProps;
  columnOne: ColumnContainerProps & AccountsColumnHeaderProps;
  columnTwo: ColumnContainerProps;
  columnThree: ColumnContainerProps;
}

// Layout State Types
export interface LayoutState {
  // No state needed for this slice - pure presentation
  // Layout is static with fixed column widths
}

// CSS Grid Configuration Types
export interface GridConfiguration {
  columns: '300px 400px 1fr';
  rows: '100vh';
  gap: number;
  overflow: 'hidden';
}

export interface ColumnConfiguration {
  display: 'flex';
  flexDirection: 'column';
  overflowY: 'auto';
  height: '100vh';
  padding: string;
}