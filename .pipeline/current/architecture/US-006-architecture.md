# US-006 Technical Architecture - Value Slice 1: Core Location Display

**Story**: US-006 View Service Locations for Selected Account  
**Value Slice**: 1 - Core Location Display  
**Tasks in Scope**: T-001, T-002, T-003, T-004  
**Architect**: v4.0 Quality-First Edition  
**Date**: August 14, 2025

---

## 📐 Architecture Scope

**What This Architecture Covers** (Value Slice 1 ONLY):

- Display service locations when account is selected
- Show location cards with basic information
- Indicate primary location and access info
- Handle loading, error, and empty states

**What This Architecture Does NOT Cover** (Future Slices):

- ❌ Location selection handling (Value Slice 2)
- ❌ Pagination controls (Value Slice 2)
- ❌ API implementation (Value Slice 3)
- ❌ Production integration (Value Slice 4)

---

## 🏛️ Component Hierarchy

```
MasterViewLayout (existing)
└── Column 2
    └── ServiceLocationsList (new - T-002)
        ├── Loading State (skeleton)
        ├── Error State (message + retry)
        ├── Empty State (no locations message)
        └── Location List
            └── ServiceLocationCard[] (new - T-004)
                ├── Location Name (prominent)
                ├── Address Block
                ├── Primary Badge (conditional)
                └── Access Info Icon (conditional)
```

**Component Count**: 2 new components (within error budget of 10)

---

## 📊 Interface Definitions

### T-001: Core Types

```typescript
// src/types/serviceLocation.types.ts

export interface ServiceLocation {
  id: string
  account_id: string
  location_name: string
  street_address: string
  city: string
  state: string
  postal_code: string
  access_information: string | null
  is_primary: boolean
  status: 'Active' | 'Inactive' | 'On-Hold'
  created_at: string
  updated_at: string
}

export interface ServiceLocationsResponse {
  locations: ServiceLocation[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

// NO 'any' types - all fields explicitly typed
```

### T-002: Component Props

```typescript
// src/components/master-view/ServiceLocationsList.tsx

export interface ServiceLocationsListProps {
  accountId: string // From Column 1 selection
  accountName: string // For display header
  className?: string // Optional styling
  // Note: NO onLocationSelect yet - that's Value Slice 2
}

interface ServiceLocationsListState {
  locations: ServiceLocation[]
  loading: boolean
  error: string | null
  // Note: NO currentPage yet - that's Value Slice 2
}
```

### T-003: Hook Interface

```typescript
// src/hooks/useServiceLocations.ts

export interface UseServiceLocationsResult {
  locations: ServiceLocation[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export interface UseServiceLocationsOptions {
  accountId: string
  enabled?: boolean // Allow disabling fetch
}
```

### T-004: Card Component Props

```typescript
// src/components/master-view/ServiceLocationCard.tsx

export interface ServiceLocationCardProps {
  location: ServiceLocation
  className?: string
  // Note: NO isSelected, NO onClick - that's Value Slice 2
}
```

**Interface Count**: 7 interfaces (within error budget of 20)

---

## 🔄 State Management Design

### Data Flow (Value Slice 1 Only)

```
1. MasterViewLayout
   ↓ passes accountId
2. ServiceLocationsList
   ↓ uses accountId
3. useServiceLocations hook
   ↓ fetches from Supabase
4. Returns locations array
   ↓ maps to cards
5. ServiceLocationCard[]
   ↓ displays data
6. User sees locations
```

### State Ownership

```yaml
Context State (MasterViewContext):
  - selectedAccountId: string | null # READ ONLY in this slice
  # Note: selectedLocationId not used in Value Slice 1

Component State (ServiceLocationsList):
  - locations: ServiceLocation[] # Fetched data
  - loading: boolean # Fetch status
  - error: string | null # Error message

Props Flow:
  - accountId → ServiceLocationsList (from parent)
  - accountName → ServiceLocationsList (from parent)
  - location → ServiceLocationCard (from list)
```

### Data Fetching Pattern

```typescript
// Simplified for Value Slice 1 - no pagination yet
const { locations, loading, error } = useServiceLocations({
  accountId: props.accountId,
  enabled: !!props.accountId, // Only fetch if account selected
})
```

---

## 🎨 Component Specifications

### ServiceLocationsList Component

```typescript
// Structure (T-002)
export const ServiceLocationsList: React.FC<ServiceLocationsListProps> = ({
  accountId,
  accountName,
  className
}) => {
  // Fetch data using hook
  const { locations, loading, error, refetch } = useServiceLocations({
    accountId,
    enabled: !!accountId
  });

  // Render states
  if (!accountId) return null;  // No account selected
  if (loading) return <LocationsLoadingSkeleton />;
  if (error) return <LocationsErrorState message={error} onRetry={refetch} />;
  if (locations.length === 0) return <LocationsEmptyState accountName={accountName} />;

  // Render location cards
  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {locations.length} location{locations.length !== 1 ? 's' : ''}
        </h3>
      </div>
      <div className="space-y-2">
        {locations.map(location => (
          <ServiceLocationCard
            key={location.id}
            location={location}
          />
        ))}
      </div>
    </div>
  );
};
```

### ServiceLocationCard Component

```typescript
// Structure (T-004)
export const ServiceLocationCard: React.FC<ServiceLocationCardProps> = ({
  location,
  className
}) => {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      {/* Location Name - Prominent */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">
          {location.location_name}
        </h4>
        {location.is_primary && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
            PRIMARY
          </span>
        )}
      </div>

      {/* Address Block */}
      <div className="text-sm text-gray-600">
        <div>{location.street_address}</div>
        <div>{location.city}, {location.state} {location.postal_code}</div>
      </div>

      {/* Access Info Indicator */}
      {location.access_information && (
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <KeyIcon className="w-3 h-3 mr-1" />
          <span>Access info available</span>
        </div>
      )}
    </div>
  );
};
```

---

## 🔒 Quality Gates

### TypeScript Quality

- ✅ NO 'any' types used
- ✅ All props explicitly typed
- ✅ All return types defined
- ✅ Null/undefined handled with unions

### Component Quality

- ✅ Single responsibility per component
- ✅ Props are minimal and focused
- ✅ No business logic in components (use hook)
- ✅ Error boundaries considered

### State Management Quality

- ✅ No duplicate state
- ✅ Clear data flow
- ✅ Unidirectional updates
- ✅ No prop drilling

---

## 📈 Error Budget Tracking

**Components Created**: 2 / 10 ✅

- ServiceLocationsList
- ServiceLocationCard

**Interfaces Created**: 7 / 20 ✅

- ServiceLocation
- ServiceLocationsResponse
- ServiceLocationsListProps
- ServiceLocationsListState
- UseServiceLocationsResult
- UseServiceLocationsOptions
- ServiceLocationCardProps

**Time Spent**: ~20 minutes / 30 minutes ✅

**Complexity Assessment**: LOW

- Simple display components
- Standard React patterns
- No complex state management

---

## 🚫 Top 5 Don'ts Applied

1. ✅ **NO 'any' types** - All types explicitly defined
2. ✅ **NO features beyond requirements** - Only display, no selection
3. ✅ **NO assumed database columns** - Using only BUSM fields
4. ✅ **NO over-architecture** - Simple, focused on Value Slice 1
5. ✅ **NO premature optimization** - Basic fetching, no caching

---

## 📋 Implementation Checklist

For developers implementing this architecture:

### T-001: Create Types

- [ ] Create `serviceLocation.types.ts`
- [ ] Export all interfaces
- [ ] No 'any' types

### T-002: Build Component Shell

- [ ] Create `ServiceLocationsList.tsx`
- [ ] Implement loading/error/empty states
- [ ] Connect to useServiceLocations hook

### T-003: Implement Data Fetching

- [ ] Create `useServiceLocations.ts` hook
- [ ] Query Supabase for locations
- [ ] Filter by accountId and status='Active'

### T-004: Create Card Component

- [ ] Create `ServiceLocationCard.tsx`
- [ ] Display all required fields
- [ ] Show PRIMARY badge conditionally
- [ ] Show access info indicator

---

## 🎯 Success Criteria

Value Slice 1 is complete when:

1. Locations display when account is selected
2. Cards show location name, address, badges
3. Loading/error/empty states work
4. No TypeScript errors
5. No console errors

---

## 🚀 Next Steps

1. ✅ Architecture for Value Slice 1 complete
2. → Implement T-001 through T-004
3. → Test core display functionality
4. → Then proceed to Value Slice 2 (selection/pagination)

---

_Architecture generated by ARCHITECT v4.0 - Quality-First, No 'any' types, Focused on Value Slice 1 only_
