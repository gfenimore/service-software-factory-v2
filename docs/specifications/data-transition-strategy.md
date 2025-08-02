# Mock-to-Real Data Transition Strategy

**Purpose**: Systematic progression from development to production data

## Three-Phase Transition Model

### Phase 1: Development (Mock Data)

**Purpose**: Fast iteration without external dependencies

```typescript
// src/lib/data/mock-data.ts
export const mockAccounts = [
  { id: '1', name: 'ABC Pest Control', status: 'active' },
  { id: '2', name: 'Green Solutions LLC', status: 'active' }
]

// src/components/AccountsTable.tsx
export function AccountsTable() {
  const accounts = mockAccounts // Hardcoded for fast development
  return <Table data={accounts} />
}
```

### Phase 2: Integration (Database + Fallbacks)

**Purpose**: Real data with development safety nets

```typescript
// src/lib/data/accounts-service.ts
export async function getAccounts(): Promise<Account[]> {
  try {
    const { data, error } = await supabase.from('accounts').select('*')

    if (error) throw error
    return data || []
  } catch (error) {
    logger.warn('Database unavailable, using mock data', { error })
    return mockAccounts // Fallback for development
  }
}
```

### Phase 3: Production (Real Data Only)

**Purpose**: Full production reliability

```typescript
// src/lib/data/accounts-service.ts
export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabase.from('accounts').select('*')

  if (error) {
    logger.error('Database error', { error })
    throw new DatabaseError('Failed to fetch accounts')
  }

  return data || []
}
```

## Transition Automation Scripts

```bash
# scripts/transition-to-phase.sh
#!/bin/bash
PHASE=$1
COMPONENT_DIR=$2

case $PHASE in
  "integration")
    echo "🔄 Transitioning to Phase 2: Integration"

    # Update all components to use service layer
    find $COMPONENT_DIR -name "*.tsx" -exec \
      sed -i 's/mockAccounts/await getAccounts()/g' {} \;

    # Add error boundaries
    # Add loading states
    echo "✅ Integration phase activated"
    ;;

  "production")
    echo "🚀 Transitioning to Phase 3: Production"

    # Remove all mock data imports
    find $COMPONENT_DIR -name "*.tsx" -exec \
      sed -i '/mockAccounts/d' {} \;

    # Remove fallback code
    # Enable strict error handling
    echo "✅ Production phase activated"
    ;;
esac
```

## Data Configuration by Environment

```typescript
// src/lib/config/data-config.ts
interface DataConfig {
  useMockData: boolean
  enableFallbacks: boolean
  strictErrorHandling: boolean
}

const configs: Record<string, DataConfig> = {
  development: {
    useMockData: true,
    enableFallbacks: true,
    strictErrorHandling: false,
  },
  staging: {
    useMockData: false,
    enableFallbacks: true,
    strictErrorHandling: false,
  },
  production: {
    useMockData: false,
    enableFallbacks: false,
    strictErrorHandling: true,
  },
}

export const dataConfig = configs[process.env.NODE_ENV || 'development']
```

## Client Deployment Readiness Checklist

```markdown
# Pre-Client Deployment Checklist

## Data Transition Complete

- [ ] All components use real data services
- [ ] Mock data removed from production builds
- [ ] Database connection tested under load
- [ ] Error handling covers all failure modes
- [ ] Performance meets client requirements

## Client-Specific Configuration

- [ ] Domain-specific terminology updated
- [ ] Client branding applied
- [ ] Custom business rules implemented
- [ ] Data migration scripts tested
- [ ] Backup/recovery procedures verified

## Production Readiness

- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Monitoring/alerting configured
- [ ] Documentation complete
- [ ] Support procedures documented
```

## Domain Template Data Patterns

```typescript
// templates/domain-data-patterns.ts

// Generic pattern for any service business
interface ServiceBusinessData {
  customers: Customer[] // Accounts/Clients
  services: Service[] // What we deliver
  appointments: Appointment[] // When we deliver
  technicians: Employee[] // Who delivers
  invoices: Invoice[] // Payment tracking
}

// Domain-specific extensions
interface PestControlData extends ServiceBusinessData {
  treatments: Treatment[] // Pest-specific services
  properties: Property[] // Service locations
  chemicals: Chemical[] // Treatment materials
}

interface MarineData extends ServiceBusinessData {
  vessels: Vessel[] // Boats being serviced
  slips: Slip[] // Marina locations
  parts: Part[] // Marine-specific inventory
}
```
