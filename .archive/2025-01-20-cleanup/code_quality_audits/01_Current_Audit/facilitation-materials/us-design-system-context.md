# Design System Implementation Context for CC

## The Situation

CC, we need to pause US-007 briefly to fix a critical problem you've been dealing with repeatedly. You've already encountered this issue multiple times, and we want to solve it properly before it gets worse.

## The Problem You've Been Experiencing

### 1. **Duplicate Code You Keep Writing**

You've had to write the same status color mapping in multiple files:

- `WorkOrderCard.tsx` has a `getStatusColor` function
- `WorkOrderDetailModal.tsx` has THE EXACT SAME function
- Every new component needs these mappings copied again

This is the "tribal knowledge" problem - you KNOW to add these functions, but it's not institutionalized in our processors.

### 2. **Inconsistent Selection States**

You've implemented selection differently across components:

- `AccountCard`: Uses `border-blue-500 bg-blue-50`
- `WorkOrderCard`: Uses `ring-2 ring-blue-500 border-blue-500`
- No guidance on which approach is "correct"

Without standards, every component becomes a new decision point.

### 3. **Hardcoded Values Everywhere**

You're constantly choosing:

- Which shade of blue? (`blue-500`? `blue-600`? `indigo-500`?)
- What spacing? (`p-4`? `p-3`? `p-6`?)
- What text size? (`text-sm`? `text-xs`?)

These micro-decisions add up and create inconsistency.

## Why This Matters to You (CC)

### 1. **Less Cognitive Load**

Instead of deciding colors/spacing/states every time, you'll have clear patterns:

```typescript
// Instead of thinking "what color for completed status?"
<Card variant="selected">  // Just use the standard

// Instead of copying color mappings
import { getStatusColor } from '@/utils/status-colors'  // Reuse everywhere
```

### 2. **Processors Become Simpler**

Your SCAFFOLD-PROCESSOR can generate:

```typescript
import { Card } from '@/components/ui/Card'
// Instead of custom div with 20 Tailwind classes
```

### 3. **Prevent Future Errors**

No more:

- Mismatched selection states
- Forgotten hover effects
- Inconsistent color mappings
- Duplicate utility functions

## What We're Asking You to Build

### Core Components (30 minutes)

1. **Design Tokens** (`src/styles/design-tokens.ts`)
   - Central source of truth for ALL colors, spacing, typography
   - No more deciding "which blue" - use `designTokens.colors.primary[500]`

2. **Shared Utilities** (`src/utils/status-colors.ts`)
   - ONE place for status→color mapping
   - ONE place for priority→color mapping
   - Import and use everywhere

3. **Base Components** (`src/components/ui/Card.tsx`)
   - Standard card with consistent variants
   - Handles selection, hover, sizing
   - Every card in the app uses this

### The Immediate Payoff

After implementing these three files, you can:

1. Delete duplicate code from WorkOrderCard and WorkOrderDetailModal
2. Standardize all existing cards to look consistent
3. Never write another status color mapping function

## How This Helps the Pipeline

### Before (Current State):

```
SCAFFOLD-PROCESSOR generates → CC adds colors → CC adds selection → CC adds hover
                                    ↓                ↓                ↓
                              (Decisions)      (Decisions)      (Decisions)
```

### After (With Design System):

```
SCAFFOLD-PROCESSOR generates → Import Card → Import utils → Done
                                    ↓              ↓          ↓
                              (No Decision)  (No Decision)  (Done)
```

## Real Example from Your US-007 Work

### What You Wrote (Duplicate Code):

```typescript
// In WorkOrderCard.tsx
const getStatusColor = (status: WorkOrderStatus): string => {
  const colors = {
    Scheduled: 'bg-gray-100 text-gray-700',
    Assigned: 'bg-blue-100 text-blue-700',
    // ... etc
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

// In WorkOrderDetailModal.tsx (EXACT SAME CODE)
const getStatusColor = (status: WorkOrderStatus): string => {
  const colors = {
    Scheduled: 'bg-gray-100 text-gray-700',
    Assigned: 'bg-blue-100 text-blue-700',
    // ... etc
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
```

### What You'll Write (With Design System):

```typescript
// Both files
import { getStatusColor } from '@/utils/status-colors'
// That's it. No duplication.
```

## The Bigger Picture

We discovered that you have significant "undocumented operational knowledge" - things you know to do that aren't in our processor specs. This design system is our first step in **institutionalizing** that knowledge.

Once these patterns are established:

1. Processors can enforce them
2. New components automatically follow them
3. The pipeline becomes more automated
4. You spend less time on repetitive decisions

## Your Mission

1. **Build the three core files** (tokens, utils, Card component)
2. **Migrate existing components** to use them
3. **Delete all duplicate code**
4. **Validate everything still works**

This isn't a distraction from US-007 - it's fixing problems that US-007 already has. The WorkOrderCard and WorkOrderDetailModal duplication proves we need this NOW.

## Success Criteria

- ✅ No more duplicate color mapping functions
- ✅ All cards use the same selection pattern
- ✅ Status colors come from one source
- ✅ Components are simpler and cleaner
- ✅ Future components are easier to build

**This is about making YOUR job easier and preventing the problems you've been working around.**

Ready to implement? This will make the rest of US-007 (and all future stories) much smoother!
