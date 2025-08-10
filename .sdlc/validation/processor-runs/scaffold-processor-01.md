# scaffold-processor-01
_Exported on 8/8/2025 at 11:52:34 EDT from Cursor (1.4.2)_

---

**User**

@scaffold-processor process-accountcard

You are SCAFFOLD-PROCESSOR. Your prompt is in:
.sdlc/01-core/A-agents/processors/scaffold-processor.md

Process this input:
Create a basic AccountCard component with these props:
interface AccountCardProps {
  account: Account
  isSelected?: boolean
  onSelect?: (account: Account) => void
  onViewDetails?: () => void
}

Output your result to:
src/components/accounts/AccountCard.tsx

Follow your prompt EXACTLY. Apply deterministic transformation rules only.

---

**Cursor**

I need to read the scaffold processor prompt to understand the exact transformation rules I should follow.

```typescript
interface AccountCardProps {
  account: Account
  isSelected?: boolean
  onSelect?: (account: Account) => void
  onViewDetails?: () => void
}
```

I need to check if the `Account` type is already defined in the codebase, as it's referenced in the AccountCardProps interface.

Now I'll apply the SCAFFOLD-PROCESSOR transformation rules to create the AccountCard component:

```typescriptreact
'use client'

import type { Account } from '@/types/accountDetails.types'

export interface AccountCardProps {
  account: Account
  isSelected?: boolean
  onSelect?: (account: Account) => void
  onViewDetails?: () => void
}

export function AccountCard({ account, isSelected, onSelect, onViewDetails }: AccountCardProps) {
  return (
    <div data-testid="account-card">
      Component Works!
    </div>
  )
}
```

```yaml
SCAFFOLD-PROCESSOR COMPLETE
Input: AccountCardProps interface specification
Output: src/components/accounts/AccountCard.tsx
Component Name: AccountCard
Client Component: YES
Props Count: 4
Next Processor: REACT-PROCESSOR
```

The AccountCard component has been successfully scaffolded with:
- Client directive applied due to `onSelect` and `onViewDetails` event handlers
- Proper TypeScript interface exported
- Named export function with destructured props
- Test ID attribute for testing (`data-testid="account-card"`)
- Import of the existing `Account` type from the types file
- Placeholder "Component Works!" content ready for the REACT-PROCESSOR

```yaml

The AccountCard component has been successfully scaffolded with:
- Client directive applied due to `onSelect` and `onViewDetails` event handlers
- Proper TypeScript interface exported
- Named export function with destructured props
- Test ID attribute for testing (`data-testid="account-card"`)
- Import of the existing `Account` type from the types file
- Placeholder "Component Works!" content ready for the REACT-PROCESSOR
```

```plaintext

The AccountCard component has been successfully scaffolded with:
- Client directive applied due to `onSelect` and `onViewDetails` event handlers
- Proper TypeScript interface exported
- Named export function with destructured props
- Test ID attribute for testing (`data-testid="account-card"`)
- Import of the existing `Account` type from the types file
- Placeholder "Component Works!" content ready for the REACT-PROCESSOR
```

