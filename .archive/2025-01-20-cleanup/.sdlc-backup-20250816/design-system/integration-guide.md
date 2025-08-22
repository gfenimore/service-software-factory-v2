# Design System Integration Guide

## Date: August 16, 2025

## Overview

This guide documents how the design system integrates with our development pipeline and provides rules for processors and developers.

## Core Design System Components

### 1. Design Tokens (`src/styles/design-tokens.ts`)

Central source of truth for all design values:

- **Colors**: Semantic colors (primary, success, warning, danger)
- **Status Colors**: Mapped to work order statuses
- **Priority Colors**: Mapped to priority levels
- **Typography**: Systematic type scale
- **Spacing**: 4px base unit system
- **Shadows & Transitions**: Consistent effects

### 2. Utility Functions (`src/utils/status-colors.ts`)

Shared functions for consistent color mappings:

- `getStatusColor(status)` - Returns Tailwind classes for status
- `getPriorityColor(priority)` - Returns Tailwind classes for priority
- `getStatusBadgeClasses(status, variant)` - Full badge styling
- `getPriorityBadgeClasses(priority, variant)` - Full badge styling

### 3. UI Components

- **Card** (`src/components/ui/Card.tsx`) - Standard card container
- **StatusBadge** (`src/components/ui/StatusBadge.tsx`) - Status display
- **PriorityBadge** - Priority display component

## Rules for Processors

### SCAFFOLD-PROCESSOR Rules

1. **MUST** import Card component for all card layouts:

   ```typescript
   import { Card } from '@/components/ui/Card'
   ```

   Never create custom card divs with inline styles.

2. **MUST** use status/priority utilities:

   ```typescript
   import { getStatusColor, getPriorityColor } from '@/utils/status-colors'
   ```

   Never hardcode color mappings.

3. **MUST** use StatusBadge for status displays:
   ```typescript
   import { StatusBadge } from '@/components/ui/StatusBadge'
   ```

### Component Generation Rules

1. **Card Components**: Always wrap in `<Card>` with appropriate variant
2. **Status Display**: Always use `<StatusBadge>` component
3. **Priority Display**: Always use `<PriorityBadge>` component
4. **Selection States**: Use Card variant="selected" (never custom classes)

## Design Token Usage

### When to Use Semantic Colors

- **Primary**: Main actions, selected states, links
- **Success**: Completed states, success messages
- **Warning**: Warnings, high priority items
- **Danger**: Errors, emergency priority, destructive actions

### When to Use Status Colors

- Work order status badges
- Status indicators in lists
- Dashboard status summaries

### Spacing Values for Common Patterns

- **Card padding**: Use size prop (sm, md, lg) on Card component
- **Between sections**: Use `space-y-4` (16px)
- **Between items**: Use `space-y-2` (8px)
- **Inline gaps**: Use `gap-2` (8px) or `gap-4` (16px)

### Typography Scale Usage

- **Page titles**: `text-xl font-semibold`
- **Section headers**: `text-lg font-medium`
- **Card titles**: `font-medium text-gray-900`
- **Body text**: Default (no classes needed)
- **Small text**: `text-sm`
- **Caption/metadata**: `text-xs text-gray-600`

## Component Patterns

### Card Usage

```typescript
// Default card (not selected, not interactive)
<Card variant="default">Content</Card>

// Selected card
<Card variant="selected">Content</Card>

// Interactive card (clickable)
<Card interactive={true} onClick={handleClick}>Content</Card>

// Selected interactive card
<Card variant="selected" interactive={true} onClick={handleClick}>
  Content
</Card>
```

### Status Display Patterns

```typescript
// Subtle badge (default)
<StatusBadge status={workOrder.status} />

// Solid badge
<StatusBadge status={workOrder.status} variant="solid" />

// Different sizes
<StatusBadge status={workOrder.status} size="xs" />  // Extra small
<StatusBadge status={workOrder.status} size="sm" />  // Small (default)
<StatusBadge status={workOrder.status} size="md" />  // Medium
```

### Selection State Standards

All selectable cards across the application use the same pattern:

- **Unselected**: Default border, white background
- **Selected**: Blue border, blue background tint, ring effect
- **Hover**: Darker border, shadow increase

## Migration Checklist

When updating existing components:

- [ ] Replace custom card divs with Card component
- [ ] Remove duplicate color mapping functions
- [ ] Import shared utilities from `@/utils/status-colors`
- [ ] Replace custom status badges with StatusBadge component
- [ ] Ensure consistent selection states using Card variants
- [ ] Remove hardcoded Tailwind color classes
- [ ] Use design token spacing values

## Benefits Achieved

1. **No Duplicate Code**: Color mappings defined once
2. **Consistent UI**: All cards/badges look the same
3. **Easier Maintenance**: Change colors in one place
4. **Better Developer Experience**: Clear patterns to follow
5. **Reduced Cognitive Load**: No color/spacing decisions needed

## Lines of Code Removed

- **WorkOrderCard.tsx**: Removed 20 lines (color mapping functions)
- **WorkOrderDetailModal.tsx**: Removed 18 lines (duplicate functions)
- **Total Duplicate Code Removed**: ~38 lines

## Future Enhancements

- [ ] Add dark mode support via design tokens
- [ ] Create Button component with variants
- [ ] Add Form input components with consistent styling
- [ ] Create Table component with standard patterns
- [ ] Add animation/transition utilities
