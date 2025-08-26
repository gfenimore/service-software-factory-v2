# Task Breakdown: US-006 Service Locations (Concept Line)

## Line Configuration
**Current Line**: CONCEPT  
**Standards**: Loose - make it work fast  
**Time Budget**: 2 hours max  
**Architecture**: NONE NEEDED

## Value Slice Summary

### Value Slice 1: Mock Data & Display (1 hour)
**Tasks**: T-001 through T-003  
**User Can Now**: See and interact with location data  
**Complexity**: Low  
**No Architecture Needed**

### Value Slice 2: Interactive Features (1 hour)
**Tasks**: T-004 through T-006  
**User Can Now**: Search, filter, and edit locations (mock only)  
**Complexity**: Low  
**Just Make It Work**

---

## CONCEPT LINE TASKS (Coarse-Grained)

### T-001: Create Mock Location Data
**Time**: 15 minutes  
**Output**: `src/concept/data/mockLocations.js`  
**Verify**: Console.log the data array  

```javascript
// Just a simple array - no types needed!
export const MOCK_LOCATIONS = [
  { id: 1, name: "Downtown Center", address: "123 Main St", ... },
  // ... 10-15 locations
];

export const MOCK_ACCOUNTS = [
  { id: 1, name: "Springfield Municipal" },
  // ... some accounts
];
```

**Success**: Data logs to console

---

### T-002: Build Location List Component
**Time**: 30 minutes  
**Output**: `src/concept/components/LocationList.tsx`  
**Verify**: npm run dev, navigate to test page  

```typescript
// any types are FINE in concept!
export const LocationList = ({ locations }: any) => {
  console.log("Rendering locations:", locations);
  
  return (
    <div>
      {locations.map((loc: any) => (
        <div key={loc.id} style={{ border: '1px solid gray', padding: '10px' }}>
          <h3>{loc.name}</h3>
          <p>{loc.address}</p>
          <span style={{ color: loc.status === 'active' ? 'green' : 'red' }}>
            {loc.status}
          </span>
        </div>
      ))}
    </div>
  );
};
```

**Success**: List displays with mock data

---

### T-003: Create Main Container Component
**Time**: 15 minutes  
**Output**: `src/concept/components/ServiceLocations.tsx`  
**Verify**: Component renders with mock data  

```typescript
import { MOCK_LOCATIONS } from '../data/mockLocations';

export const ServiceLocations = () => {
  const [locations, setLocations] = useState<any>(MOCK_LOCATIONS);
  const [selectedId, setSelectedId] = useState<any>(null);
  
  // Console.log is encouraged for debugging!
  console.log("Current selection:", selectedId);
  
  return (
    <div>
      <h1>Service Locations</h1>
      <LocationList locations={locations} />
    </div>
  );
};
```

**Success**: Main component works

---

### T-004: Add Search/Filter Functionality
**Time**: 20 minutes  
**Output**: Update `ServiceLocations.tsx`  
**Verify**: Search filters the list  

```typescript
// Just add to existing component
const [searchTerm, setSearchTerm] = useState('');

const filtered = locations.filter((loc: any) => 
  loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  loc.address.toLowerCase().includes(searchTerm.toLowerCase())
);

// Add search box to JSX
<input 
  type="text" 
  placeholder="Search locations..."
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

**Success**: Search works client-side

---

### T-005: Build Add/Edit Form Modal
**Time**: 25 minutes  
**Output**: `src/concept/components/LocationForm.tsx`  
**Verify**: Form opens and accepts input  

```typescript
// No validation needed in concept!
export const LocationForm = ({ location, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState(location || {
    name: '',
    address: '',
    status: 'active'
  });
  
  return (
    <div style={{ position: 'fixed', background: 'white', border: '2px solid black' }}>
      <h2>{location ? 'Edit' : 'Add'} Location</h2>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Location Name"
      />
      <input 
        value={formData.address}
        onChange={(e) => setFormData({...formData, address: e.target.value})}
        placeholder="Address"
      />
      <button onClick={() => {
        console.log("Would save:", formData);
        onSave(formData);
      }}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};
```

**Success**: Form displays and logs data

---

### T-006: Create Test Page for Demo
**Time**: 15 minutes  
**Output**: `src/app/test/concept-locations/page.tsx`  
**Verify**: Full feature works at /test/concept-locations  

```typescript
'use client';
import { ServiceLocations } from '@/concept/components/ServiceLocations';

export default function ConceptLocationsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <ServiceLocations />
    </div>
  );
}
```

**Success**: Complete demo ready

---

## Concept Line Verification Checklist

✅ **Speed**: All tasks completable in 2 hours  
✅ **Simplicity**: No complex patterns or architecture  
✅ **Flexibility**: any types, console.log, inline styles all OK  
✅ **Demo Ready**: Can show to stakeholders immediately  
✅ **No Tests**: Zero test coverage required  
✅ **No Build Errors**: Runs despite any type warnings  

## What We're NOT Doing (Concept Line)

❌ TypeScript strict mode  
❌ API integration  
❌ Database design  
❌ Error handling  
❌ Loading states  
❌ Performance optimization  
❌ Unit tests  
❌ Accessibility (beyond basics)  
❌ Security considerations  

## Next Steps

1. Run these tasks to create working mock
2. Demo to stakeholders
3. Gather feedback
4. If approved, promote to prototype line
5. Prototype will add types and real connections

## Commands to Execute

```bash
# Set line
export LINE=concept

# Create directories
mkdir -p src/concept/components
mkdir -p src/concept/data
mkdir -p src/app/test/concept-locations

# Run dev server
npm run dev

# Navigate to
http://localhost:3000/test/concept-locations
```

**Remember**: In concept line, if it works it ships! Don't overthink it!