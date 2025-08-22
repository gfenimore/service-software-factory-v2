# hook-processor-01

_Exported on 8/8/2025 at 11:02:29 EDT from Cursor (1.4.2)_

---

**User**

@hook-processor process-t003

You are HOOK-PROCESSOR. Your prompt is in:
.sdlc/01-core/A-agents/processors/hook-processor.md

Process this input:
.sdlc/05-backlog/A-accounts/master-view/us-005-architecture.md
Hook: useAccountDetails (T-003)

Output your result to:
src/hooks/useAccountDetails.ts

Follow your prompt EXACTLY. Apply deterministic transformation rules only.

---

**Cursor**

I'll process the hook using the HOOK-PROCESSOR. Let me start by reading the processor prompt and the input specification.

```typescript
interface UseAccountDetailsReturn {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
  openDetailsFor: (account: Account) => void
  closeDetails: () => void
}
```

```typescript
interface UseAccountDetailsReturn {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
  openDetailsFor: (account: Account) => void
  closeDetails: () => void
}
```

Now I'll extract the hook interface specification and process it according to the HOOK-PROCESSOR transformation rules.

```typescript
interface UseAccountDetailsReturn {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
  openDetailsFor: (account: Account) => void
  closeDetails: () => void
}
```

Now I'll apply the deterministic transformation rules to generate the hook implementation. According to the processor, this follows the "Selection with State Pattern":

```typescript
'use client'
import { useState, useCallback } from 'react'

export interface UseAccountDetailsReturn {
  selectedAccountForDetails: Account | null
  isDetailsOpen: boolean
  openDetailsFor: (account: Account) => void
  closeDetails: () => void
}

interface Account {
  id: string
  company_name: string
  [key: string]: any
}

export function useAccountDetails(): UseAccountDetailsReturn {
  const [selectedAccountForDetails, setSelectedAccountForDetails] = useState<Account | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const openDetailsFor = useCallback((account: Account) => {
    setSelectedAccountForDetails(account)
    setIsDetailsOpen(true)
  }, [])

  const closeDetails = useCallback(() => {
    setSelectedAccountForDetails(null)
    setIsDetailsOpen(false)
  }, [])

  return {
    selectedAccountForDetails,
    isDetailsOpen,
    openDetailsFor,
    closeDetails,
  }
}
```

```yaml
HOOK-PROCESSOR COMPLETE
Hook Name: [useHookName]
State Variables: [count]
Functions: [count]
Client Hook: YES
Next Processor: TEST-PROCESSOR or INTEGRATION-PROCESSOR
```

```yaml
HOOK-PROCESSOR COMPLETE
Hook Name: useAccountDetails
State Variables: 2
Functions: 2
Client Hook: YES
Next Processor: TEST-PROCESSOR or INTEGRATION-PROCESSOR
```

## Validation Gates (All Passed)

1. ✅ **Hook starts with 'use'**: `useAccountDetails`
2. ✅ **All state variables initialized**:
   - `selectedAccountForDetails` → `useState<Account | null>(null)`
   - `isDetailsOpen` → `useState(false)`
3. ✅ **All functions implemented**:
   - `openDetailsFor` → Sets selected account and opens panel
   - `closeDetails` → Clears selection and closes panel
4. ✅ **Return object matches interface**: Perfect match with `UseAccountDetailsReturn`
5. ✅ **'use client' directive present**: First line of file

## Transformation Applied

**Pattern Detected**: Selection with State Pattern  
**State Management**: Centralized panel state with single-panel enforcement  
**Business Rule Implemented**: Only one detail panel can be open at a time

The hook has been successfully generated at `src/hooks/useAccountDetails.ts` following the deterministic transformation rules exactly as specified in the HOOK-PROCESSOR prompt.

```yaml

## Validation Gates (All Passed)

1. ✅ **Hook starts with 'use'**: `useAccountDetails`
2. ✅ **All state variables initialized**:
   - `selectedAccountForDetails` → `useState<Account | null>(null)`
   - `isDetailsOpen` → `useState(false)`
3. ✅ **All functions implemented**:
   - `openDetailsFor` → Sets selected account and opens panel
   - `closeDetails` → Clears selection and closes panel
4. ✅ **Return object matches interface**: Perfect match with `UseAccountDetailsReturn`
5. ✅ **'use client' directive present**: First line of file

## Transformation Applied

**Pattern Detected**: Selection with State Pattern
**State Management**: Centralized panel state with single-panel enforcement
**Business Rule Implemented**: Only one detail panel can be open at a time

The hook has been successfully generated at `src/hooks/useAccountDetails.ts` following the deterministic transformation rules exactly as specified in the HOOK-PROCESSOR prompt.
```

```plaintext

## Validation Gates (All Passed)

1. ✅ **Hook starts with 'use'**: `useAccountDetails`
2. ✅ **All state variables initialized**:
   - `selectedAccountForDetails` → `useState<Account | null>(null)`
   - `isDetailsOpen` → `useState(false)`
3. ✅ **All functions implemented**:
   - `openDetailsFor` → Sets selected account and opens panel
   - `closeDetails` → Clears selection and closes panel
4. ✅ **Return object matches interface**: Perfect match with `UseAccountDetailsReturn`
5. ✅ **'use client' directive present**: First line of file

## Transformation Applied

**Pattern Detected**: Selection with State Pattern
**State Management**: Centralized panel state with single-panel enforcement
**Business Rule Implemented**: Only one detail panel can be open at a time

The hook has been successfully generated at `src/hooks/useAccountDetails.ts` following the deterministic transformation rules exactly as specified in the HOOK-PROCESSOR prompt.
```
