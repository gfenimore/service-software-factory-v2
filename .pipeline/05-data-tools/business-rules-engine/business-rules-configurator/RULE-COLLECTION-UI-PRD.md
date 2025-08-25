# Rule Collection UI - Product Requirements Document
*Interactive Web Interface for Business Rule Definition*

## 1. Purpose

Provide a web-based UI for Product Owners and stakeholders to define, review, and validate business rules during Stage 1 of the Concept Line, replacing the CLI-only approach with a more accessible interface.

## 2. Problem Statement

**Current State:**
- CLI-only rule definition (`rules-cli.js`)
- Requires technical knowledge
- No visual validation feedback
- Difficult for stakeholders to review

**Future State:**
- Web UI accessible to non-technical users
- Visual rule builder with live preview
- Immediate validation feedback
- Exportable rule documentation

## 3. Integration with Concept Line

### Stage 1 Position
```
INPUTS                    RULE COLLECTION UI              OUTPUTS
-------                   ------------------              -------
BUSM.mmd         →       │                  │      →     rules.yaml
master-view.md   →       │  Web Interface   │      →     validation-map.json
extracted-entities →     │  localhost:3002  │      →     rule-indicators.json
                         │                  │      →     gap-report.json
```

## 4. Core Functionality

### 4.1 Rule Definition Interface

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Business Rules Collection - Account Master View          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Entity: [Account ▼]    Field: [Status ▼]    + Add Rule    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Rule Type: [Validation ▼]                               │ │
│ │                                                          │ │
│ │ ○ Required Field                                        │ │
│ │ ● Enum Values                                           │ │
│ │ ○ Pattern Match                                         │ │
│ │ ○ Range (Min/Max)                                       │ │
│ │                                                          │ │
│ │ Allowed Values:                                         │ │
│ │ ┌──────────────────┐  ┌──────────────────┐            │ │
│ │ │ Active           │  │ Inactive         │  [+]       │ │
│ │ └──────────────────┘  └──────────────────┘            │ │
│ │ ┌──────────────────┐                                   │ │
│ │ │ Suspended        │                                    │ │
│ │ └──────────────────┘                                   │ │
│ │                                                          │ │
│ │ Error Message:                                          │ │
│ │ [Status must be Active, Inactive, or Suspended      ]  │ │
│ │                                                          │ │
│ │ [✓ Save Rule]  [Test Rule]  [Cancel]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 State Transition Builder

```
┌─────────────────────────────────────────────────────────────┐
│ State Transitions - Work Order                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [Draft] ──→ [Scheduled] ──→ [In Progress] ──→ [Complete] │
│      ↓            ↓                 ↓                       │
│   [Cancelled]  [Cancelled]      [On Hold]                   │
│                                                             │
│ + Add State    + Add Transition                            │
│                                                             │
│ Selected: Draft → Scheduled                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Conditions:                                              │ │
│ │ □ Technician assigned                                   │ │
│ │ □ Customer confirmed                                    │ │
│ │ □ Parts available                                       │ │
│ │                                                          │ │
│ │ Actions on Transition:                                   │ │
│ │ ☑ Send notification to technician                       │ │
│ │ ☑ Update calendar                                       │ │
│ │ □ Generate work order PDF                               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Business Logic Editor

```
┌─────────────────────────────────────────────────────────────┐
│ Business Logic - Account                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Event: [On Create ▼]                                       │
│                                                             │
│ Actions:                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Generate Account Number                              │ │
│ │    Pattern: ACC-{YYYY}-{SEQUENCE}                       │ │
│ │    Example: ACC-2025-000123                             │ │
│ │                                                          │ │
│ │ 2. Set Default Status                                   │ │
│ │    Value: "Active"                                      │ │
│ │                                                          │ │
│ │ 3. Send Welcome Email                                   │ │
│ │    Template: welcome_new_account                        │ │
│ │    To: {primary_contact.email}                          │ │
│ │                                                          │ │
│ │ [+ Add Action]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Integration Requirements Mapper

```
┌─────────────────────────────────────────────────────────────┐
│ Integration Requirements                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Entity: Account                                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Field              Integration    System         Status │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ quickbooksId       🔗 Sync        QuickBooks     ⚠️     │ │
│ │ taxId              🔗 Validate    IRS API        ✓      │ │
│ │ creditScore        📡 Fetch       Experian       ⚠️     │ │
│ │ address            🔗 Geocode     Google Maps    ✓      │ │
│ │                                                          │ │
│ │ [+ Add Integration]                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚠️ 2 integrations need configuration                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 Rule Review Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Rule Summary - Account Master View                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────┬──────────┬──────────┬──────────┐            │
│ │ 12       │ 4        │ 7        │ 3        │            │
│ │ Rules    │ States   │ Calcs    │ Gaps     │            │
│ └──────────┴──────────┴──────────┴──────────┘            │
│                                                             │
│ By Entity:                                                 │
│ • Account: 8 rules, 2 gaps                                │
│ • Service Location: 3 rules                               │
│ • Work Order: 4 rules, 1 gap                              │
│                                                             │
│ Coverage Report:                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Fields with Rules:     18/24 (75%)  ████████░░         │ │
│ │ State Transitions:     4/4 (100%)   ██████████         │ │
│ │ Integrations Mapped:   5/7 (71%)    ███████░░░         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Export Rules]  [Validate All]  [Continue to Stage 2]      │
└─────────────────────────────────────────────────────────────┘
```

## 5. Technical Architecture

### 5.1 File Structure
```
.pipeline/factory-tools/business-rules-configurator/
├── rule-collection-ui/
│   ├── server.js              # Express server
│   ├── public/
│   │   ├── index.html         # Main UI
│   │   ├── rule-builder.js    # Rule definition logic
│   │   ├── state-builder.js   # State machine builder
│   │   ├── integration-mapper.js
│   │   └── styles.css
│   └── api/
│       ├── load-entities.js   # Load from BUSM
│       ├── save-rules.js      # Save to YAML
│       └── validate-rules.js  # Test rules
```

### 5.2 Input Artifacts (Read)
```
.pipeline/source-artifacts/
├── BUSM.mmd                   # Entity definitions
└── master-view-feature.md     # Feature requirements

.pipeline/stage1-output/
└── extracted-entities.json    # Entities from story-builder
```

### 5.3 Output Artifacts (Write)
```
.pipeline/factory-tools/business-rules/
├── master-view-rules.yaml     # Complete rule definitions
├── validation-map.json        # Field-to-rule mapping
└── rule-indicators.json       # UI indicator definitions

.pipeline/gaps/
└── stage1-rule-gaps.json      # Missing rules report
```

## 6. API Endpoints

```javascript
// Load entities from BUSM
GET /api/entities
Response: [{name: "Account", fields: [...]}]

// Get existing rules for entity
GET /api/rules/:entity
Response: {validations: [...], states: [...]}

// Save rule definition
POST /api/rules
Body: {entity: "Account", field: "status", rule: {...}}

// Test rule against sample data
POST /api/rules/test
Body: {rule: {...}, testData: {...}}

// Export all rules
GET /api/rules/export
Response: YAML file download

// Get gap analysis
GET /api/gaps
Response: {missingRules: [...], uncoveredFields: [...]}
```

## 7. User Workflow

### 7.1 Product Owner Flow
1. Open Rule Collection UI (http://localhost:3002)
2. System loads entities from BUSM
3. For each entity:
   - Define validation rules
   - Set up state transitions
   - Map integrations
   - Add business logic
4. Review coverage dashboard
5. Export rules.yaml
6. Continue to Stage 2

### 7.2 Stakeholder Review Flow
1. Access read-only dashboard
2. View all defined rules
3. See gap analysis
4. Provide feedback via comments
5. Approve rules for pipeline

## 8. Integration with Existing Tools

### 8.1 BUSM Reader
```javascript
// Load entity definitions
const busmReader = require('../busm-reader/busm-reader.js');
const entities = busmReader.parse('.pipeline/source-artifacts/BUSM.mmd');
```

### 8.2 Story Builder
```javascript
// Get required entities from feature
const storyBuilder = require('.sdlc/01-core/A-agents/story-builder-v21.md');
const requirements = storyBuilder.extract('master-view-feature.md');
```

### 8.3 Gap Logger
```javascript
// Report missing rules
const gapLogger = require('../gap-logger/gap-logger.js');
gapLogger.log({
  stage: 1,
  type: 'missing_rule',
  entity: 'Account',
  field: 'creditLimit'
});
```

## 9. Success Metrics

- **Accessibility**: Non-technical users can define rules
- **Completeness**: 100% of fields have rules defined
- **Speed**: Rule definition < 30 minutes per entity
- **Quality**: Zero rule conflicts detected
- **Coverage**: All gaps identified and documented

## 10. Implementation Priority

### Phase 1 (MVP)
- Basic validation rule builder
- Simple state transitions
- Export to YAML
- Gap identification

### Phase 2
- Complex business logic editor
- Integration mapper
- Rule testing interface
- Coverage dashboard

### Phase 3
- AI-powered rule suggestions
- Conflict detection
- Version control
- Collaborative editing

## 11. Launch Command

```bash
# Start Rule Collection UI
npm run rules:ui

# Opens browser to http://localhost:3002
# Loads entities from BUSM
# Ready for rule definition
```

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex rule syntax | High | Visual builders with examples |
| Rule conflicts | Medium | Real-time conflict detection |
| Lost work | Medium | Auto-save every 30 seconds |
| Invalid rules | High | Live validation and testing |

---

*PRD Version: 1.0.0*
*Status: To Be Built*
*Priority: HIGH - Critical for Stage 1 completeness*
*Location: .pipeline/factory-tools/business-rules-configurator/rule-collection-ui/*