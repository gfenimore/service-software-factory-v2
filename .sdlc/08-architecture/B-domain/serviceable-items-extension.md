# 3. Serviceable Items Domain Extension (Complexity-Appropriate Approach)

**Purpose**: Use the right level of complexity for each domain and use case

## Core Principle: Match Data Complexity to Business Reality

Not every service business needs the full SERVICEABLE_ITEM complexity. Choose the approach that matches your operational reality:

- **Simple scenarios**: Use SERVICE_LOCATION.Notes
- **Complex scenarios**: Use SERVICEABLE_ITEM + SERVICEABLE_ITEM_PROPERTY

## Decision Tree: When to Use What

### Use SERVICE_LOCATION.Notes When:

✅ **Single-structure properties** (residential homes, small offices)  
✅ **Uniform service delivery** (treat entire property the same way)  
✅ **Simple tracking needs** (no need to separate areas for billing/reporting)  
✅ **Quick setup priority** (minimal data entry, faster onboarding)

### Use SERVICEABLE_ITEM + Properties When:

✅ **Multi-component assets** (boats with hull/engine/electronics)  
✅ **Separate service tracking** (different maintenance schedules per component)  
✅ **Complex billing requirements** (charge differently for different areas)  
✅ **Detailed reporting needs** (compare performance across similar items)

## Approach 1: Simple SERVICE_LOCATION.Notes

### Residential Pest Control Example

**SERVICE_LOCATION Record:**

```sql
INSERT INTO service_locations (
  id, account_id, location_name, street_address, city, state, postal_code,
  notes
) VALUES (
  'loc-smith-home', 'acc-smith-family', 'Smith Residence',
  '123 Main Street', 'Tampa', 'FL', '33101',
  'Type: Single Family Home
   Size: 2,000 sqft
   Pets: 2 dogs (friendly, keep in backyard during service)
   Gate Code: 1234
   Special Instructions: Exclude basement (flooding issues)
   Preferred Time: Afternoons after 2pm
   Emergency Contact: Jane Smith 555-9999'
);
```

**Three-Column Interface:**

```
┌─────────────┬─────────────────┬──────────────────────┐
│ Accounts    │ Locations       │ Location Details     │
│ Smith Family│ • 123 Main St   │ Type: Single Family  │
│ Jones Family│ • 456 Oak Ave   │ Size: 2,000 sqft     │
│ Brown Family│ • 789 Pine Dr   │ Pets: 2 dogs         │
│             │                 │ Gate Code: 1234      │
│             │                 │ Exclude: Basement    │
│             │                 │                      │
│             │                 │ Work Order History:  │
│             │                 │ • WO-2025-001 (Done) │
│             │                 │ • WO-2024-156 (Done) │
└─────────────┴─────────────────┴──────────────────────┘
```

**Benefits:**

- **Fast setup**: One record per property
- **Easy to understand**: All info in one place
- **Flexible**: Free-form notes handle any scenario
- **Low maintenance**: No complex relationships

**Structured Notes Pattern (Optional Enhancement):**

```sql
-- Semi-structured approach using JSON in notes
notes: '{
  "property_type": "single_family_home",
  "square_feet": 2000,
  "pets": "2 dogs (friendly)",
  "access": {
    "gate_code": "1234",
    "preferred_time": "afternoons after 2pm"
  },
  "exclusions": ["basement"],
  "emergency_contact": "Jane Smith 555-9999",
  "special_instructions": "Keep dogs in backyard during service"
}'
```

## Approach 2: Complex SERVICEABLE_ITEM + Properties

### Marine Services Example

**Base SERVICEABLE_ITEM Records:**

```sql
-- The boat itself as a container
INSERT INTO serviceable_items VALUES (
  'si-sea-breeze', 'acc-marina-corp', 'loc-slip-a12',
  'Sea Breeze', 'vessel_container',
  '42ft Catalina sailboat', 'active'
);

-- Individual serviceable systems
INSERT INTO serviceable_items VALUES
('si-sea-breeze-hull', 'acc-marina-corp', 'loc-slip-a12',
 'Sea Breeze Hull', 'vessel_hull',
 'Fiberglass hull below waterline', 'active'),

('si-sea-breeze-engine', 'acc-marina-corp', 'loc-slip-a12',
 'Sea Breeze Engine', 'vessel_engine',
 'Yanmar 30hp diesel engine', 'active'),

('si-sea-breeze-sails', 'acc-marina-corp', 'loc-slip-a12',
 'Sea Breeze Sails', 'vessel_sails',
 'Main and jib sails', 'active');
```

**SERVICEABLE_ITEM_PROPERTY Records:**

```sql
-- Hull properties
INSERT INTO serviceable_item_properties VALUES
('prop-hull-001', 'si-sea-breeze-hull', 'hull_material', 'fiberglass', 'String', null),
('prop-hull-002', 'si-sea-breeze-hull', 'length_overall', '42', 'Number', 'ft'),
('prop-hull-003', 'si-sea-breeze-hull', 'beam', '12.5', 'Number', 'ft'),
('prop-hull-004', 'si-sea-breeze-hull', 'draft', '5.5', 'Number', 'ft'),
('prop-hull-005', 'si-sea-breeze-hull', 'last_haul_out', '2024-01-15', 'Date', null),
('prop-hull-006', 'si-sea-breeze-hull', 'bottom_paint_type', 'ablative_antifouling', 'String', null),

-- Engine properties
('prop-eng-001', 'si-sea-breeze-engine', 'manufacturer', 'Yanmar', 'String', null),
('prop-eng-002', 'si-sea-breeze-engine', 'model', '3YM30', 'String', null),
('prop-eng-003', 'si-sea-breeze-engine', 'horsepower', '30', 'Number', 'hp'),
('prop-eng-004', 'si-sea-breeze-engine', 'fuel_type', 'diesel', 'String', null),
('prop-eng-005', 'si-sea-breeze-engine', 'engine_hours', '1247', 'Number', 'hours'),
('prop-eng-006', 'si-sea-breeze-engine', 'last_oil_change', '2024-03-10', 'Date', null);
```

**Three-Column Interface:**

```
┌─────────────┬─────────────────┬──────────────────────┐
│ Accounts    │ Service Items   │ Hull Details         │
│ Marina Corp │ • Sea Breeze Hull│ Material: Fiberglass │
│ Boat Club   │ • Sea Breeze Eng│ Length: 42ft         │
│ Yacht Owner │ • Sea Breeze Sails│ Last Haul: Jan 15   │
│             │ • Ocean Dream   │ Bottom Paint: Anti-  │
│             │ • Wind Dancer   │   fouling ablative   │
│             │                 │                      │
│             │                 │ Work Order History:  │
│             │                 │ • WO-2025-012 (Hull  │
│             │                 │   cleaning, Done)    │
│             │                 │ • WO-2024-234 (Bottom│
│             │                 │   paint, Done)       │
└─────────────┴─────────────────┴──────────────────────┘
```

## Domain-Specific Property Conventions

### Marine Domain Properties

```typescript
// Hull-specific properties
const hullProperties = {
  hull_material: 'fiberglass | aluminum | wood | steel',
  length_overall: 'Number (ft)',
  beam: 'Number (ft)',
  draft: 'Number (ft)',
  last_haul_out: 'Date',
  bottom_paint_type: 'String',
  bottom_paint_date: 'Date',
  survey_date: 'Date',
  insurance_survey_due: 'Date',
}

// Engine-specific properties
const engineProperties = {
  manufacturer: 'String',
  model: 'String',
  horsepower: 'Number (hp)',
  fuel_type: 'diesel | gas | electric',
  engine_hours: 'Number (hours)',
  last_oil_change: 'Date',
  last_service: 'Date',
  next_service_hours: 'Number (hours)',
}
```

### Commercial Pest Control Properties

```typescript
// For complex commercial properties that need SERVICEABLE_ITEMs
const commercialPestProperties = {
  area_type: 'kitchen | dining | storage | office | bathroom',
  square_footage: 'Number (sqft)',
  food_handling_area: 'Boolean',
  chemical_restrictions: 'food_safe_only | organic_only | standard',
  access_method: 'key_required | keycard | call_ahead | unlocked',
  service_frequency: 'weekly | monthly | quarterly',
  pest_pressure_level: 'low | medium | high',
  critical_control_point: 'Boolean', // For HACCP compliance
}
```

## UI Rendering Logic

### Property-Driven Display Components

```typescript
// Render properties based on item_type
export function ServiceableItemDetails({ item, properties }) {
  const renderLogic = {
    'vessel_hull': <HullPropertyDisplay properties={properties} />,
    'vessel_engine': <EnginePropertyDisplay properties={properties} />,
    'vessel_sails': <SailsPropertyDisplay properties={properties} />,
    'commercial_kitchen': <CommercialKitchenDisplay properties={properties} />
  }

  return renderLogic[item.item_type] || <GenericPropertyDisplay properties={properties} />
}

// Hull-specific rendering
function HullPropertyDisplay({ properties }) {
  const specs = extractProperties(properties, ['length_overall', 'beam', 'draft'])
  const maintenance = extractProperties(properties, ['last_haul_out', 'bottom_paint_date'])

  return (
    <div>
      <SectionHeader>Vessel Specifications</SectionHeader>
      <SpecGrid>
        <SpecItem label="LOA" value={`${specs.length_overall}ft`} />
        <SpecItem label="Beam" value={`${specs.beam}ft`} />
        <SpecItem label="Draft" value={`${specs.draft}ft`} />
      </SpecGrid>

      <SectionHeader>Maintenance History</SectionHeader>
      <MaintenanceTimeline>
        <TimelineItem date={maintenance.last_haul_out} event="Last Haul Out" />
        <TimelineItem date={maintenance.bottom_paint_date} event="Bottom Paint" />
      </MaintenanceTimeline>
    </div>
  )
}
```

## Implementation Strategy

### Phase 1: Start Simple

- Implement SERVICE_LOCATION.Notes approach first
- Get residential pest control working
- Validate the three-column interface

### Phase 2: Add Complexity When Needed

- Implement SERVICEABLE_ITEM + properties for marine
- Create property-driven UI components
- Add domain-specific rendering logic

### Phase 3: Hybrid Approach

- Allow both approaches in same system
- Let users choose complexity level per account
- Provide migration path from simple to complex

## Benefits of This Approach

✅ **Right-sized complexity**: Simple cases stay simple  
✅ **Scalable**: Can handle complex scenarios when needed  
✅ **Familiar patterns**: Uses existing BUSM tables  
✅ **Gradual adoption**: Start simple, add complexity later  
✅ **Cost-effective**: Less development time for simple cases
