import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftNavigation from './LeftNavigation';

// Mock data for testing - matches implementation
const EXPECTED_MODULES = [
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

describe('LeftNavigation Component', () => {
  // Test Setup
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<LeftNavigation />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders the main navigation heading', () => {
      render(<LeftNavigation />);
      expect(screen.getByRole('heading', { name: 'Navigation', level: 2 })).toBeInTheDocument();
    });

    it('renders as a semantic nav element', () => {
      render(<LeftNavigation />);
      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();
      expect(navElement.tagName).toBe('NAV');
    });
  });

  describe('Module Display - Business Rule Verification', () => {
    it('displays all 3 required modules', () => {
      render(<LeftNavigation />);
      
      EXPECTED_MODULES.forEach(module => {
        expect(screen.getByRole('heading', { name: module.name, level: 3 })).toBeInTheDocument();
      });
    });

    it('displays modules in correct order', () => {
      render(<LeftNavigation />);
      
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      const moduleNames = moduleHeadings.map(heading => heading.textContent);
      
      expect(moduleNames).toEqual(['Accounts', 'Operations', 'Administration']);
    });

    it('displays exactly 3 modules (no more, no less)', () => {
      render(<LeftNavigation />);
      
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(moduleHeadings).toHaveLength(3);
    });
  });

  describe('Focus Areas Display - Flat List Format', () => {
    it('displays correct number of focus areas per module', () => {
      render(<LeftNavigation />);
      
      EXPECTED_MODULES.forEach(module => {
        module.focusAreas.forEach(focusArea => {
          expect(screen.getByRole('menuitem', { name: focusArea })).toBeInTheDocument();
        });
      });
    });

    it('displays exactly 6 focus area menu items total', () => {
      render(<LeftNavigation />);
      
      const focusAreaButtons = screen.getAllByRole('menuitem');
      expect(focusAreaButtons).toHaveLength(6);
    });

    it('displays focus areas in flat list format with proper structure', () => {
      render(<LeftNavigation />);
      
      // Check that each module has a list
      const lists = screen.getAllByRole('menu');
      expect(lists).toHaveLength(3); // One list per module
      
      // Check list items per module
      const accountsList = lists[0];
      const operationsList = lists[1];
      const adminList = lists[2];
      
      expect(accountsList.querySelectorAll('li')).toHaveLength(2);
      expect(operationsList.querySelectorAll('li')).toHaveLength(2);
      expect(adminList.querySelectorAll('li')).toHaveLength(2);
    });

    it('displays focus areas with correct labels', () => {
      render(<LeftNavigation />);
      
      // Verify all expected focus areas are present
      const expectedFocusAreas = [
        'Master View', 'Reports', // Accounts
        'Work Orders', 'Scheduling', // Operations  
        'User Management', 'System Settings' // Administration
      ];
      
      expectedFocusAreas.forEach(focusArea => {
        expect(screen.getByRole('menuitem', { name: focusArea })).toBeInTheDocument();
      });
    });
  });

  describe('Props Functionality', () => {
    it('applies custom className when provided', () => {
      const customClass = 'custom-navigation-class';
      render(<LeftNavigation className={customClass} />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('fixed', 'left-0', 'top-0', 'w-[300px]', customClass);
    });

    it('applies default className when no custom className provided', () => {
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('fixed', 'left-0', 'top-0', 'w-[300px]');
    });

    it('handles undefined className gracefully', () => {
      render(<LeftNavigation className={undefined} />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('fixed', 'left-0', 'top-0', 'w-[300px]');
    });

    it('works without onNavigate callback', () => {
      render(<LeftNavigation />);
      
      const firstButton = screen.getByRole('menuitem', { name: 'Master View' });
      expect(() => fireEvent.click(firstButton)).not.toThrow();
    });
  });

  describe('Click Interactions and onNavigate Callback', () => {
    it('calls onNavigate with correct format when focus area clicked', () => {
      render(<LeftNavigation onNavigate={mockOnNavigate} />);
      
      const masterViewButton = screen.getByRole('menuitem', { name: 'Master View' });
      fireEvent.click(masterViewButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('Accounts > Master View');
      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigate with correct format for all focus areas', () => {
      render(<LeftNavigation onNavigate={mockOnNavigate} />);
      
      const testCases = [
        { buttonName: 'Master View', expectedCall: 'Accounts > Master View' },
        { buttonName: 'Reports', expectedCall: 'Accounts > Reports' },
        { buttonName: 'Work Orders', expectedCall: 'Operations > Work Orders' },
        { buttonName: 'Scheduling', expectedCall: 'Operations > Scheduling' },
        { buttonName: 'User Management', expectedCall: 'Administration > User Management' },
        { buttonName: 'System Settings', expectedCall: 'Administration > System Settings' }
      ];
      
      testCases.forEach(({ buttonName, expectedCall }, index) => {
        const button = screen.getByRole('menuitem', { name: buttonName });
        fireEvent.click(button);
        
        expect(mockOnNavigate).toHaveBeenNthCalledWith(index + 1, expectedCall);
      });
      
      expect(mockOnNavigate).toHaveBeenCalledTimes(6);
    });

    it('handles multiple clicks on same focus area', () => {
      render(<LeftNavigation onNavigate={mockOnNavigate} />);
      
      const masterViewButton = screen.getByRole('menuitem', { name: 'Master View' });
      
      fireEvent.click(masterViewButton);
      fireEvent.click(masterViewButton);
      fireEvent.click(masterViewButton);
      
      expect(mockOnNavigate).toHaveBeenCalledTimes(3);
      expect(mockOnNavigate).toHaveBeenNthCalledWith(1, 'Accounts > Master View');
      expect(mockOnNavigate).toHaveBeenNthCalledWith(2, 'Accounts > Master View');
      expect(mockOnNavigate).toHaveBeenNthCalledWith(3, 'Accounts > Master View');
    });

    it('handles clicks on different focus areas in sequence', () => {
      render(<LeftNavigation onNavigate={mockOnNavigate} />);
      
      const accountsButton = screen.getByRole('menuitem', { name: 'Master View' });
      const operationsButton = screen.getByRole('menuitem', { name: 'Work Orders' });
      
      fireEvent.click(accountsButton);
      fireEvent.click(operationsButton);
      
      expect(mockOnNavigate).toHaveBeenNthCalledWith(1, 'Accounts > Master View');
      expect(mockOnNavigate).toHaveBeenNthCalledWith(2, 'Operations > Work Orders');
      expect(mockOnNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Business Rules Compliance', () => {
    it('enforces all 3 modules are visible', () => {
      render(<LeftNavigation />);
      
      // Business rule: Must display all 3 required modules
      expect(screen.getByText('Accounts')).toBeVisible();
      expect(screen.getByText('Operations')).toBeVisible();
      expect(screen.getByText('Administration')).toBeVisible();
    });

    it('enforces all 6 focus areas are visible', () => {
      render(<LeftNavigation />);
      
      // Business rule: All focus areas must be visible
      const allFocusAreas = [
        'Master View', 'Reports',
        'Work Orders', 'Scheduling',
        'User Management', 'System Settings'
      ];
      
      allFocusAreas.forEach(focusArea => {
        expect(screen.getByRole('menuitem', { name: focusArea })).toBeVisible();
      });
    });

    it('enforces flat list structure (no nested hierarchies)', () => {
      render(<LeftNavigation />);
      
      // Business rule: Focus areas should be in flat list format
      // Check that buttons are direct children of list items, not nested
      const buttons = screen.getAllByRole('menuitem');
      
      buttons.forEach(button => {
        const listItem = button.closest('li');
        expect(listItem).toBeInTheDocument();
        
        // Ensure no nested lists within this list item
        const nestedLists = listItem?.querySelectorAll('ul, ol');
        expect(nestedLists).toHaveLength(0);
      });
    });

    it('enforces correct number of focus areas per module', () => {
      render(<LeftNavigation />);
      
      // Business rule: Accounts has 2, Operations has 2, Administration has 2
      const moduleTests = [
        { name: 'Accounts', expectedCount: 2 },
        { name: 'Operations', expectedCount: 2 },
        { name: 'Administration', expectedCount: 2 }
      ];
      
      moduleTests.forEach(({ name, expectedCount }) => {
        const moduleHeading = screen.getByRole('heading', { name });
        const moduleContainer = moduleHeading.closest('div');
        const buttonsInModule = moduleContainer?.querySelectorAll('[role="menuitem"]');
        expect(buttonsInModule).toHaveLength(expectedCount);
      });
    });
  });

  describe('Accessibility and Semantic Structure', () => {
    it('uses proper semantic HTML structure', () => {
      render(<LeftNavigation />);
      
      // Should have navigation landmark
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Should have proper heading hierarchy
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
      
      // Should have lists for focus areas
      expect(screen.getAllByRole('menu')).toHaveLength(3);
      
      // Should have menu items for interactions
      expect(screen.getAllByRole('menuitem')).toHaveLength(6);
    });

    it('provides accessible button labels', () => {
      render(<LeftNavigation />);
      
      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach(menuItem => {
        expect(menuItem).toHaveAccessibleName();
        expect(menuItem.textContent).toBeTruthy();
      });
    });

    it('maintains proper focus management', () => {
      render(<LeftNavigation />);
      
      const firstMenuItem = screen.getByRole('menuitem', { name: 'Master View' });
      firstMenuItem.focus();
      
      expect(firstMenuItem).toHaveFocus();
    });
  });

  describe('Styling Integration', () => {
    it('applies expected Tailwind CSS classes', () => {
      render(<LeftNavigation />);
      
      // Check main container Tailwind classes
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('fixed', 'left-0', 'top-0', 'w-[300px]', 'h-screen');
      
      // Check module groups exist (using div structure instead of class)
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(moduleHeadings).toHaveLength(3);
      
      // Check focus area menu items
      const focusAreaItems = screen.getAllByRole('menuitem');
      expect(focusAreaItems).toHaveLength(6); // 2+2+2 focus areas
    });

    it('applies proper semantic structure with Tailwind', () => {
      render(<LeftNavigation />);
      
      // The component uses Tailwind classes and semantic HTML
      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();
      expect(navElement).toHaveAttribute('aria-label', 'Main navigation');
      
      // Verify semantic menu structure
      const menus = screen.getAllByRole('menu');
      expect(menus).toHaveLength(3);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles undefined props gracefully', () => {
      expect(() => render(<LeftNavigation />)).not.toThrow();
    });

    it('handles missing onNavigate gracefully', () => {
      render(<LeftNavigation />);
      
      const menuItem = screen.getByRole('menuitem', { name: 'Master View' });
      expect(() => fireEvent.click(menuItem)).not.toThrow();
    });

    it('handles empty string className', () => {
      render(<LeftNavigation className="" />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('fixed', 'left-0', 'top-0', 'w-[300px]');
    });
  });

  describe('T-001 Requirements Verification', () => {
    it('creates base LeftNavigation component with module/focus area hierarchy', () => {
      render(<LeftNavigation />);
      
      // Verify component exists and has proper structure
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Verify hierarchy: nav > modules > focus areas
      const navElement = screen.getByRole('navigation');
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(moduleHeadings).toHaveLength(3);
      
      // Verify each module has menu structure
      const menus = screen.getAllByRole('menu');
      expect(menus).toHaveLength(3);
      
      menus.forEach(menu => {
        const menuItems = menu.querySelectorAll('[role="menuitem"]');
        expect(menuItems.length).toBeGreaterThanOrEqual(2); // At least 2 focus areas per module
      });
    });

    it('displays 3 modules (Accounts, Operations, Administration) with focus areas in flat list format', () => {
      render(<LeftNavigation />);
      
      // Verify 3 modules requirement
      const moduleNames = ['Accounts', 'Operations', 'Administration'];
      moduleNames.forEach(moduleName => {
        expect(screen.getByRole('heading', { name: moduleName })).toBeInTheDocument();
      });
      
      // Verify flat list format (6 total menu items)
      const allMenuItems = screen.getAllByRole('menuitem');
      expect(allMenuItems).toHaveLength(6);
      
      // Verify each module has correct number of focus areas in menu format
      const menus = screen.getAllByRole('menu');
      expect(menus).toHaveLength(3);
    });

    it('satisfies T-001 depends on none requirement', () => {
      // This test verifies the component works independently
      // without requiring external dependencies or state
      
      expect(() => render(<LeftNavigation />)).not.toThrow();
      
      // Component should render and function with no external dependencies
      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();
      
      // All functionality should work without external state or props
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(6);
      
      // Clicking should not cause errors even without onNavigate
      expect(() => fireEvent.click(menuItems[0])).not.toThrow();
    });
  });
});