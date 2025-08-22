# Navigation Generator Requirements
*Created: January 20, 2025*
*Status: DRAFT - Brainstorming Session*

## 1. Overview

### 1.1 Purpose
A special-purpose generator that creates navigation menus from configuration, working in harmony with ViewForge-generated views.

### 1.2 The Problem
- ViewForge creates individual views (list, detail, forms)
- But how do users navigate between them?
- How do we organize entities into logical groups?
- How do we handle different navigation patterns (sidebar, top nav, breadcrumbs)?

### 1.3 The Vision
A navigation configuration system that:
- Knows about all ViewForge configurations
- Groups related entities logically
- Generates consistent navigation across all three lines
- Supports multiple navigation patterns

---

## 2. Navigation Patterns (Brainstorming)

### 2.1 Left Sidebar (Primary Pattern)
```
┌─────────────┬────────────────────┐
│   Logo      │    Header Bar      │
├─────────────┼────────────────────┤
│             │                    │
│  Navigation │   Main Content     │
│    Menu     │     (Views)        │
│             │                    │
│             │                    │
└─────────────┴────────────────────┘
```

### 2.2 Top Navigation
```
┌─────────────────────────────────┐
│     Logo | Menu Items | User     │
├─────────────────────────────────┤
│                                  │
│         Main Content             │
│                                  │
└─────────────────────────────────┘
```

### 2.3 Hybrid (Top + Left)
```
┌─────────────────────────────────┐
│    Main Modules (Top Nav)        │
├─────────────┬───────────────────┤
│  Sub-Nav    │   Content         │
└─────────────┴───────────────────┘
```

---

## 3. Configuration Schema (Draft)

### 3.1 Navigation Configuration
```json
{
  "version": "1.0.0",
  "pattern": "left-sidebar", // or "top-nav", "hybrid"
  "theme": "light", // or "dark"
  "modules": [
    {
      "id": "accounts",
      "label": "Accounts",
      "icon": "user", // or emoji "👤"
      "description": "Customer account management",
      "priority": 1, // sort order
      "items": [
        {
          "id": "all-accounts",
          "label": "All Accounts",
          "viewConfig": "account-list-view", // References ViewForge config
          "badge": "dynamic", // Shows count
          "permissions": ["view_accounts"]
        },
        {
          "id": "add-account",
          "label": "Add Account",
          "viewConfig": "account-form-create",
          "permissions": ["create_accounts"]
        },
        {
          "type": "divider"
        },
        {
          "id": "account-reports",
          "label": "Reports",
          "children": [ // Nested submenu
            {
              "id": "aging-report",
              "label": "Aging Report",
              "viewConfig": "account-aging-report"
            }
          ]
        }
      ]
    }
  ],
  "quickActions": [
    {
      "label": "New Work Order",
      "viewConfig": "workorder-quick-create",
      "icon": "plus",
      "hotkey": "cmd+n"
    }
  ],
  "userMenu": {
    "items": [
      { "label": "Profile", "action": "profile" },
      { "label": "Settings", "action": "settings" },
      { "label": "Logout", "action": "logout" }
    ]
  }
}
```

---

## 4. Functional Requirements

### 4.1 Core Navigation Features
- **Module Grouping**: Organize related entities/views into modules
- **Multi-Level Menus**: Support for nested navigation items
- **Active State Tracking**: Highlight current location
- **Breadcrumbs**: Auto-generate from navigation hierarchy
- **Quick Actions**: Floating action buttons or quick access items
- **Search Integration**: Global search in navigation

### 4.2 Dynamic Features
- **Badge Counts**: Show counts (e.g., "5 new work orders")
- **Conditional Display**: Show/hide based on permissions or context
- **Recent Items**: Track and display recently viewed items
- **Favorites**: User-defined favorite views

### 4.3 Mobile Responsiveness
- **Hamburger Menu**: Collapse to hamburger on mobile
- **Touch Gestures**: Swipe to open/close
- **Bottom Navigation**: Optional bottom nav for mobile

---

## 5. Integration Requirements

### 5.1 ViewForge Integration
- **Auto-Discovery**: Find all ViewForge configurations
- **Config Validation**: Ensure referenced configs exist
- **Route Generation**: Create routes for each view
- **Parameter Passing**: Handle view parameters (filters, IDs)

### 5.2 Three-Line Evolution
- **Concept Line**: Static HTML with JavaScript navigation
- **Prototype Line**: React Router integration
- **Production Line**: Full routing with guards and lazy loading

---

## 6. Technical Requirements

### 6.1 Generated Output Structure
```
/navigation/
  ├── components/
  │   ├── NavSidebar.html/.tsx/.vue
  │   ├── NavHeader.html/.tsx/.vue
  │   ├── Breadcrumbs.html/.tsx/.vue
  │   └── QuickActions.html/.tsx/.vue
  ├── config/
  │   ├── navigation.json
  │   └── routes.json
  └── styles/
      └── navigation.css
```

### 6.2 State Management
- Current active view
- Expanded/collapsed menu sections
- User preferences (pinned items, collapsed state)
- Navigation history

---

## 7. User Experience Requirements

### 7.1 Visual Design
- **Consistent Icons**: Icon library or emoji support
- **Clear Hierarchy**: Visual distinction between levels
- **Hover States**: Clear interactive feedback
- **Accessibility**: Keyboard navigation, ARIA labels

### 7.2 Performance
- **Lazy Loading**: Load menu sections as needed
- **Cache State**: Remember user's navigation preferences
- **Fast Switching**: Instant view changes

---

## 8. Questions to Answer

### Configuration Questions
1. Should navigation config be separate or part of ViewForge?
2. How do we handle views that don't fit standard patterns?
3. Should modules be based on entities or business functions?

### Technical Questions
1. How do we handle routing in static HTML (Concept Line)?
2. Should we generate a router config file?
3. How do we manage navigation state across page refreshes?

### UX Questions
1. Fixed or collapsible sidebar?
2. How many levels of nesting to support?
3. Should search be part of navigation or separate?

---

## 9. Success Criteria

### Must Have (Crawl)
- ✅ Generate left sidebar from configuration
- ✅ Link to ViewForge-generated views
- ✅ Active state highlighting
- ✅ Module grouping

### Should Have (Walk)
- ✅ Nested menus
- ✅ Badge counts
- ✅ User menu
- ✅ Mobile responsive

### Could Have (Run)
- ✅ Search integration
- ✅ Favorites
- ✅ Recent items
- ✅ Keyboard shortcuts

---

## 10. Example Use Case

```javascript
// Step 1: Configure navigation
const navConfig = {
  pattern: "left-sidebar",
  modules: [
    {
      label: "Accounts",
      items: [
        { label: "All Accounts", viewConfig: "account-list-view" }
      ]
    }
  ]
};

// Step 2: Run generator
navigationGenerator.generate(navConfig);

// Step 3: Output
// - Generated HTML/React/Vue navigation component
// - Routes configuration
// - Integrated with ViewForge views
```

---

## 11. Open Questions for Discussion

1. **Integration Pattern**: Should navigation be a wrapper around ViewForge views or a separate layer?

2. **Configuration Management**: One big nav config or distributed configs per module?

3. **Dynamic Updates**: How do we handle navigation that changes based on user role/context?

4. **Performance**: Preload all navigation or lazy load sections?

5. **State Persistence**: LocalStorage, SessionStorage, or backend?

---

## 12. Next Steps

1. [ ] Finalize navigation configuration schema
2. [ ] Build proof-of-concept generator
3. [ ] Test with existing ViewForge configurations
4. [ ] Create 3-column master layout
5. [ ] Integrate navigation + views

---

*What patterns excite you most? What concerns do you have?*