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
    name: 'Inventory',
    focusAreas: ['Parts Management', 'Asset Tracking']
  },
  {
    name: 'Admin',
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
    it('displays all 4 required modules', () => {
      render(<LeftNavigation />);
      
      EXPECTED_MODULES.forEach(module => {
        expect(screen.getByRole('heading', { name: module.name, level: 3 })).toBeInTheDocument();
      });
    });

    it('displays modules in correct order', () => {
      render(<LeftNavigation />);
      
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      const moduleNames = moduleHeadings.map(heading => heading.textContent);
      
      expect(moduleNames).toEqual(['Accounts', 'Operations', 'Inventory', 'Admin']);
    });

    it('displays exactly 4 modules (no more, no less)', () => {
      render(<LeftNavigation />);
      
      const moduleHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(moduleHeadings).toHaveLength(4);
    });
  });

  describe('Focus Areas Display - Flat List Format', () => {
    it('displays 2 focus areas per module', () => {
      render(<LeftNavigation />);
      
      EXPECTED_MODULES.forEach(module => {
        module.focusAreas.forEach(focusArea => {
          expect(screen.getByRole('button', { name: focusArea })).toBeInTheDocument();
        });
      });
    });

    it('displays exactly 8 focus area buttons total', () => {
      render(<LeftNavigation />);
      
      const focusAreaButtons = screen.getAllByRole('button');
      expect(focusAreaButtons).toHaveLength(8);
    });

    it('displays focus areas in flat list format with proper structure', () => {
      render(<LeftNavigation />);
      
      // Check that each module has a list
      const lists = screen.getAllByRole('list');
      expect(lists).toHaveLength(4); // One list per module
      
      // Check that each list contains 2 list items
      lists.forEach(list => {
        const listItems = list.querySelectorAll('li');
        expect(listItems).toHaveLength(2);
      });
    });

    it('displays focus areas with correct labels', () => {
      render(<LeftNavigation />);
      
      // Verify all expected focus areas are present
      const expectedFocusAreas = [
        'Master View', 'Reports', // Accounts
        'Work Orders', 'Scheduling', // Operations  
        'Parts Management', 'Asset Tracking', // Inventory
        'User Management', 'System Settings' // Admin
      ];
      
      expectedFocusAreas.forEach(focusArea => {
        expect(screen.getByRole('button', { name: focusArea })).toBeInTheDocument();
      });
    });
  });

  describe('Props Functionality', () => {
    it('applies custom className when provided', () => {
      const customClass = 'custom-navigation-class';
      render(<LeftNavigation className={customClass} />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('navigation-container', customClass);
    });

    it('applies default className when no custom className provided', () => {
      render(<LeftNavigation />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('navigation-container');
    });

    it('handles undefined className gracefully', () => {
      render(<LeftNavigation className={undefined} />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('navigation-container');
    });

    it('works without onNavigate callback', () => {
      render(<LeftNavigation />);
      
      const firstButton = screen.getByRole('button', { name: 'Master View' });
      expect(() => fireEvent.click(firstButton)).not.toThrow();
    });
  });

  describe('Click Interactions and onNavigate Callback', () => {
    it('calls onNavigate with correct format when focus area clicked', () => {
      render(<LeftNavigation onNavigate={mockOnNavigate} />);
      
      const masterViewButton = screen.getByRole('button', { name: 'Master View' });
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
        { buttonName: 'Parts Management', expectedCall: 'Inventory > Parts Management' },
        { buttonName: 'Asset Tracking', expectedCall: 'Inventory > Asset Tracking' },
        { buttonName: 'User Management', expectedCall: 'Admin > User Management' },
        { buttonName: 'System Settings', expectedCall: 'Admin > System Settings' }
      ];
      
      testCases.forEach(({ buttonName, expectedCall }, index) => {
        const button = screen.getByRole('button', { name: buttonName });
        fireEvent.click(button);
        
        expect(mockOnNavigate).toHaveBeenNthCalledWith(index + 1, expectedCall);
      });
      
      expect(mockOnNavigate).toHaveBeenCalledTimes(8);
    });

    it('handles multiple clicks on same focus area', () => {
      render(<LeftNavigation onNavigate={mockOnNavigate} />);
      
      const masterViewButton = screen.getByRole('button', { name: 'Master View' });
      
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
      
      const accountsButton = screen.getByRole('button', { name: 'Master View' });
      const operationsButton = screen.getByRole('button', { name: 'Work Orders' });
      
      fireEvent.click(accountsButton);
      fireEvent.click(operationsButton);
      
      expect(mockOnNavigate).toHaveBeenNthCalledWith(1, 'Accounts > Master View');
      expect(mockOnNavigate).toHaveBeenNthCalledWith(2, 'Operations > Work Orders');
      expect(mockOnNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Business Rules Compliance', () => {
    it('enforces all 4 modules are visible', () => {
      render(<LeftNavigation />);
      
      // Business rule: Must display all 4 required modules
      expect(screen.getByText('Accounts')).toBeVisible();
      expect(screen.getByText('Operations')).toBeVisible();
      expect(screen.getByText('Inventory')).toBeVisible();
      expect(screen.getByText('Admin')).toBeVisible();
    });

    it('enforces all 8 focus areas are visible', () => {
      render(<LeftNavigation />);
      
      // Business rule: All focus areas must be visible
      const allFocusAreas = [
        'Master View', 'Reports',
        'Work Orders', 'Scheduling',
        'Parts Management', 'Asset Tracking',
        'User Management', 'System Settings'
      ];
      
      allFocusAreas.forEach(focusArea => {
        expect(screen.getByRole('button', { name: focusArea })).toBeVisible();
      });
    });

    it('enforces flat list structure (no nested hierarchies)', () => {
      render(<LeftNavigation />);
      
      // Business rule: Focus areas should be in flat list format
      // Check that buttons are direct children of list items, not nested
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const listItem = button.closest('li');
        expect(listItem).toBeInTheDocument();
        
        // Ensure no nested lists within this list item
        const nestedLists = listItem?.querySelectorAll('ul, ol');
        expect(nestedLists).toHaveLength(0);
      });
    });

    it('enforces exactly 2 focus areas per module', () => {
      render(<LeftNavigation />);
      
      // Business rule: Each module must have exactly 2 focus areas
      EXPECTED_MODULES.forEach(module => {
        // Find the module heading
        const moduleHeading = screen.getByRole('heading', { name: module.name });
        const moduleContainer = moduleHeading.closest('.module-group');
        
        // Count buttons within this module
        const buttonsInModule = moduleContainer?.querySelectorAll('button');
        expect(buttonsInModule).toHaveLength(2);
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
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
      
      // Should have lists for focus areas
      expect(screen.getAllByRole('list')).toHaveLength(4);
      
      // Should have buttons for interactions
      expect(screen.getAllByRole('button')).toHaveLength(8);
    });

    it('provides accessible button labels', () => {
      render(<LeftNavigation />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
        expect(button.textContent).toBeTruthy();
      });
    });

    it('maintains proper focus management', () => {
      render(<LeftNavigation />);
      
      const firstButton = screen.getByRole('button', { name: 'Master View' });
      firstButton.focus();
      
      expect(firstButton).toHaveFocus();
    });
  });

  describe('Styling Integration', () => {
    it('applies expected CSS classes', () => {
      render(<LeftNavigation />);
      
      // Check main container class
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('navigation-container');
      
      // Check module group classes
      const moduleGroups = navElement.querySelectorAll('.module-group');
      expect(moduleGroups).toHaveLength(4);
      
      // Check focus area button classes
      const focusAreaButtons = navElement.querySelectorAll('.focus-area-item');
      expect(focusAreaButtons).toHaveLength(8);
    });

    it('applies inline styles via JSX styling', () => {
      render(<LeftNavigation />);
      
      // The component uses JSX styles, which should be applied
      // We can verify the style tag exists (though testing actual computed styles is complex)
      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();
      
      // Verify classes that would receive the JSX styles
      expect(navElement).toHaveClass('navigation-container');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles undefined props gracefully', () => {
      expect(() => render(<LeftNavigation />)).not.toThrow();
    });

    it('handles missing onNavigate gracefully', () => {
      render(<LeftNavigation />);
      
      const button = screen.getByRole('button', { name: 'Master View' });
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('handles empty string className', () => {
      render(<LeftNavigation className="" />);
      
      const navElement = screen.getByRole('navigation');
      expect(navElement).toHaveClass('navigation-container');
    });
  });

  describe('T-001 Requirements Verification', () => {
    it('creates base LeftNavigation component with module/focus area hierarchy', () => {
      render(<LeftNavigation />);
      
      // Verify component exists and has proper structure
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Verify hierarchy: nav > modules > focus areas
      const navElement = screen.getByRole('navigation');
      const moduleGroups = navElement.querySelectorAll('.module-group');
      expect(moduleGroups).toHaveLength(4);
      
      moduleGroups.forEach(moduleGroup => {
        const heading = moduleGroup.querySelector('h3');
        const list = moduleGroup.querySelector('ul');
        const buttons = moduleGroup.querySelectorAll('button');
        
        expect(heading).toBeInTheDocument();
        expect(list).toBeInTheDocument();
        expect(buttons).toHaveLength(2);
      });
    });

    it('displays 4 modules (Accounts, Operations, Inventory, Admin) with focus areas in flat list format', () => {
      render(<LeftNavigation />);
      
      // Verify 4 modules requirement
      const moduleNames = ['Accounts', 'Operations', 'Inventory', 'Admin'];
      moduleNames.forEach(moduleName => {
        expect(screen.getByRole('heading', { name: moduleName })).toBeInTheDocument();
      });
      
      // Verify flat list format (8 total buttons, 2 per module)
      const allButtons = screen.getAllByRole('button');
      expect(allButtons).toHaveLength(8);
      
      // Verify each module has exactly 2 focus areas in list format
      const lists = screen.getAllByRole('list');
      expect(lists).toHaveLength(4);
      
      lists.forEach(list => {
        const listItems = list.querySelectorAll('li');
        expect(listItems).toHaveLength(2);
        
        listItems.forEach(li => {
          const button = li.querySelector('button');
          expect(button).toBeInTheDocument();
        });
      });
    });

    it('satisfies T-001 depends on none requirement', () => {
      // This test verifies the component works independently
      // without requiring external dependencies or state
      
      expect(() => render(<LeftNavigation />)).not.toThrow();
      
      // Component should render and function with no external dependencies
      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();
      
      // All functionality should work without external state or props
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(8);
      
      // Clicking should not cause errors even without onNavigate
      expect(() => fireEvent.click(buttons[0])).not.toThrow();
    });
  });
});