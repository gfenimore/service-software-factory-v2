# Theme Engine - Product Requirements Document
*Safe Styling Without TypeScript Hell*

## 1. Purpose

The Theme Engine provides a conflict-free system for managing visual styling across all generated components, ensuring consistent appearance without triggering TypeScript or ESLint errors.

## 2. Problem Statement

**Current State:**
- Styling mixed with component logic
- TypeScript conflicts from style changes
- ESLint errors from formatting
- "Death by thousand cuts" when adjusting appearance

**Future State:**
- Complete separation of styling from logic
- Theme changes never break compilation
- Consistent styling across all components
- Hot-swappable themes

## 3. Core Functionality

### 3.1 Theme Management
```javascript
class ThemeEngine {
  // Load theme
  loadTheme(themePath: string): Theme
  
  // Apply theme to component
  applyTheme(component: string, theme: Theme): ThemedComponent
  
  // Get theme value
  getThemeValue(path: string): any
  
  // Validate theme
  validateTheme(theme: Theme): ValidationResult
  
  // Merge themes
  mergeThemes(base: Theme, override: Theme): Theme
}
```

### 3.2 Style Generation
```javascript
  // Generate CSS classes
  generateClasses(element: string, variant?: string): string
  
  // Generate inline styles
  generateInlineStyles(styles: StyleObject): string
  
  // Generate CSS variables
  generateCSSVariables(theme: Theme): string
  
  // Generate Tailwind config
  generateTailwindConfig(theme: Theme): TailwindConfig
```

### 3.3 Component Integration
```javascript
  // Get component styles
  getComponentStyles(componentType: string): ComponentStyles
  
  // Apply responsive styles
  applyResponsive(styles: StyleObject, breakpoints: Breakpoints): ResponsiveStyles
  
  // Handle dark mode
  applyDarkMode(styles: StyleObject): DarkModeStyles
```

## 4. Theme Structure

### 4.1 Theme Schema
```json
{
  "name": "default",
  "version": "1.0.0",
  
  "colors": {
    "primary": "#007bff",
    "secondary": "#6c757d",
    "success": "#28a745",
    "danger": "#dc3545",
    "warning": "#ffc107",
    "info": "#17a2b8",
    "light": "#f8f9fa",
    "dark": "#343a40"
  },
  
  "typography": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem"
  },
  
  "components": {
    "button": {
      "base": "px-4 py-2 rounded font-medium transition-colors",
      "variants": {
        "primary": "bg-primary text-white hover:bg-primary-dark",
        "secondary": "bg-secondary text-white hover:bg-secondary-dark",
        "outline": "border-2 border-primary text-primary hover:bg-primary hover:text-white"
      },
      "sizes": {
        "sm": "px-3 py-1 text-sm",
        "md": "px-4 py-2",
        "lg": "px-6 py-3 text-lg"
      }
    },
    
    "table": {
      "wrapper": "overflow-x-auto shadow-sm rounded-lg",
      "table": "min-w-full divide-y divide-gray-200",
      "thead": "bg-gray-50",
      "th": "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
      "tbody": "bg-white divide-y divide-gray-200",
      "td": "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
      "hover": "hover:bg-gray-50"
    },
    
    "form": {
      "group": "mb-4",
      "label": "block text-sm font-medium text-gray-700 mb-1",
      "input": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
      "error": "mt-1 text-sm text-danger"
    }
  },
  
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  }
}
```

### 4.2 Healthcare Theme Example
```json
{
  "name": "healthcare",
  "extends": "default",
  
  "colors": {
    "primary": "#0077b6",
    "secondary": "#00b4d8",
    "accent": "#90e0ef",
    "success": "#06ffa5",
    "warning": "#ffb700",
    "danger": "#ff006e"
  },
  
  "components": {
    "patientCard": {
      "wrapper": "bg-white rounded-lg shadow-md p-6 border-l-4 border-primary",
      "header": "flex justify-between items-center mb-4",
      "title": "text-xl font-semibold text-gray-800",
      "badge": {
        "base": "px-2 py-1 rounded-full text-xs font-medium",
        "critical": "bg-danger text-white",
        "stable": "bg-success text-white",
        "observation": "bg-warning text-gray-800"
      }
    }
  }
}
```

## 5. Implementation Strategy

### 5.1 Isolation Approach
```javascript
// Component generates with theme classes
const button = `
  <button className={theme.button.primary}>
    Click Me
  </button>
`;

// Theme provides the actual styles
theme.button.primary = "bg-blue-500 text-white px-4 py-2 rounded";
```

### 5.2 No Direct Style Coupling
```javascript
// WRONG - Styles in component
<div style={{ backgroundColor: '#007bff', padding: '10px' }}>

// RIGHT - Theme reference
<div className={theme.components.card.wrapper}>
```

### 5.3 Runtime Theme Switching
```javascript
const ThemeProvider = ({ theme, children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      <style>{generateCSSVariables(theme)}</style>
      {children}
    </ThemeContext.Provider>
  );
};
```

## 6. Integration Points

### 6.1 Prototype Generator
```javascript
const theme = themeEngine.loadTheme('healthcare');
const styles = theme.components.table;

const component = `
  <table className="${styles.table}">
    <thead className="${styles.thead}">
      ...
    </thead>
  </table>
`;
```

### 6.2 Concept Generator
```javascript
const theme = themeEngine.loadTheme('default');
const css = themeEngine.generateCSS(theme);

const html = `
  <style>${css}</style>
  <div class="container">
    ...
  </div>
`;
```

## 7. Benefits

### 7.1 No TypeScript Conflicts
- Styles are strings, not code
- No type checking on style values
- Changes don't affect compilation

### 7.2 No ESLint Errors
- Styles in separate files
- No inline style objects
- Clean component code

### 7.3 Easy Customization
- Change theme file
- Regenerate components
- Instant new look

## 8. Success Metrics

- Zero TypeScript errors from styling
- Zero ESLint warnings from themes
- 100% theme coverage for components
- < 1 second theme switching

## 9. Testing Strategy

### 9.1 Theme Validation
```javascript
describe('Theme Engine', () => {
  it('validates theme structure', () => {
    const theme = loadTheme('default');
    expect(validateTheme(theme)).toBe(true);
  });
  
  it('applies theme without errors', () => {
    const component = generateComponent();
    const themed = applyTheme(component, theme);
    expect(compile(themed)).toHaveNoErrors();
  });
});
```

### 9.2 Visual Regression
- Snapshot testing for each theme
- Visual diff on theme changes
- Responsive breakpoint testing

## 10. Future Enhancements

### Phase 2
- Theme editor UI
- Live preview
- Theme marketplace
- Custom theme builder

### Phase 3
- AI-powered theme generation
- Accessibility checking
- Performance optimization
- Animation system

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Theme breaks layout | Medium | Visual regression testing |
| Missing theme values | Low | Fallback to defaults |
| Performance impact | Low | CSS variable optimization |

---

*PRD Version: 1.0.0*
*Status: Partially implemented*
*Priority: HIGH - Prevents TypeScript hell*