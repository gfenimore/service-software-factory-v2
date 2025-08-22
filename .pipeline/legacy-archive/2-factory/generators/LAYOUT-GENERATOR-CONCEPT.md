# Layout Generator - The Context-Aware Container
*Where Components Come Together with Purpose*

## The Core Insight

**Layouts ARE Context!**

The same ViewForge-generated account list needs different layouts for:
- **Morning Review Context** → Dashboard layout with metrics on top
- **Investigation Context** → Three-column with details panel
- **Data Entry Context** → Two-column with form on right
- **Mobile Context** → Single column, stacked
- **Print Context** → Compact table, no navigation

---

## Layout as Context Expression

### Context Drives Layout:
```javascript
context = {
  userIntent: "reviewing",     // vs "editing", "analyzing", "monitoring"
  deviceType: "desktop",       // vs "tablet", "mobile"
  userRole: "dispatcher",      // vs "technician", "manager"
  timeContext: "morning",      // vs "afternoon", "end-of-day"
  taskContext: "route-planning" // vs "customer-service", "reporting"
}

// Layout Generator responds:
if (context.userIntent === "reviewing" && context.timeContext === "morning") {
  return "dashboard-layout-with-alerts-prominent"
}
```

---

## The Layout Generator's Job

### 1. **Container Management**
- Define regions (header, nav, main, sidebar, footer)
- Set proportions (fixed, flexible, responsive)
- Handle collapse/expand states
- Manage focus and attention

### 2. **Component Orchestration**
```javascript
layout = {
  regions: {
    nav: NavigationGenerator.output(),
    main: ViewForge.output(),
    details: DetailsGenerator.output(),
    alerts: AlertsWidget.output()
  }
}
```

### 3. **Context Flow**
- Receive global context
- Pass relevant context to each component
- Coordinate inter-component communication
- Maintain state across regions

---

## Layout Patterns by Context

### "Daily Operations" Context
```
┌─────────────────────────────────────┐
│         Alerts & Metrics Bar         │
├──────┬────────────────────┬─────────┤
│ Nav  │   Today's Routes    │ Map View│
│      │   (List View)       │         │
└──────┴────────────────────┴─────────┘
```

### "Customer Service" Context  
```
┌─────────────────────────────────────┐
│         Customer Search Bar          │
├──────┬────────────────────┬─────────┤
│ Nav  │  Customer Details   │ History │
│      │                     │ Timeline│
└──────┴────────────────────┴─────────┘
```

### "Analysis" Context
```
┌─────────────────────────────────────┐
│           Filters & Tools            │
├──────┬───────────────────────────────┤
│ Nav  │     Data Grid/Charts          │
│      │     (Full Width)               │
└──────┴───────────────────────────────┘
```

---

## The Composition Model

### Level 1: Layout defines STRUCTURE
```javascript
{
  pattern: "three-column",
  proportions: "240px 1fr 320px",
  breakpoints: {
    tablet: "collapse-right",
    mobile: "stack-all"
  }
}
```

### Level 2: Layout assigns COMPONENTS
```javascript
{
  regions: {
    left: { 
      component: "navigation",
      config: "main-nav.json"
    },
    center: {
      component: "viewforge-view",
      config: "account-list.json"
    },
    right: {
      component: "context-panel",
      config: "dynamic"  // Based on selection
    }
  }
}
```

### Level 3: Layout manages RELATIONSHIPS
```javascript
{
  interactions: {
    "when": "center.item.selected",
    "then": "right.show(item.details)"
  },
  "when": "nav.item.clicked",
  "then": "center.load(nav.item.view)"
}
```

---

## Context Inheritance

### Global Context flows down:
```
App Context
  ↓
Layout Context (adds layout-specific context)
  ↓
Component Context (each component gets relevant slice)
```

### Example:
```javascript
globalContext = {
  user: "John",
  role: "dispatcher",
  time: "morning"
}

layoutContext = {
  ...globalContext,
  layout: "operations-dashboard",
  activeRegion: "center"
}

navigationContext = {
  ...layoutContext,
  expanded: true,
  activeItem: "routes"
}
```

---

## The Power of Context-Aware Layouts

### Scenario 1: Viewing Account List
**Default**: Three-column (nav + list + empty)
**With Selection**: Three-column (nav + list + details)
**On Mobile**: Single column (list only, nav hidden)
**In Crisis Mode**: Two-column (list + alerts sidebar)

### Scenario 2: Same ViewForge Config, Different Layouts
```
Morning: Dashboard layout (metrics prominent)
Midday: Standard three-column  
Evening: Report layout (printable)
Mobile: Stacked cards
```

### Scenario 3: Role-Based Layout
```
Dispatcher: Map-centric layout
Technician: Route list layout
Manager: Dashboard layout
Customer Service: Search-centric layout
```

---

## Building for Evolution

### Crawl (Now): Static Layout Generator
```javascript
// Simple, predefined layouts
generateLayout("three-column", {
  nav: "navigation.html",
  main: "account-list.html",
  details: "empty.html"
})
```

### Walk (Next): Context-Aware Layouts
```javascript
// Layout responds to context
generateLayout(context, components) {
  const pattern = selectPattern(context);
  const regions = assignComponents(context, components);
  return compose(pattern, regions);
}
```

### Run (Future): Adaptive Layouts
```javascript
// AI-driven layout optimization
generateLayout(context, components, userHistory) {
  const pattern = AI.predictBestLayout(context, userHistory);
  const arrangement = AI.optimizeForTask(components);
  return compose(pattern, arrangement);
}
```

---

## The Critical Design Decision

### Should layouts be:

**Option A: Template-Based**
- Predefined templates
- Components slot into regions
- Limited but reliable

**Option B: Rule-Based**
- Rules determine layout
- if context.X then layout.Y
- Flexible but complex

**Option C: Compositional**
- Atomic layout units
- Compose based on need
- Maximum flexibility

---

## The Vision

The Layout Generator becomes the **conductor** of the user experience:

1. **Receives context** (who, what, when, where, why)
2. **Selects appropriate pattern** (structure)
3. **Assigns components** (from other generators)
4. **Manages relationships** (inter-component communication)
5. **Adapts to changes** (responsive to context shifts)

Not just arranging components, but **orchestrating an experience** based on context!

---

*Is this the framework you're envisioning? Layout as the context-aware container for all generated components?*