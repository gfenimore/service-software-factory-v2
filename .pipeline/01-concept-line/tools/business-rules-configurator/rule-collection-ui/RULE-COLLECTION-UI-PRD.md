# Product Requirements Document (PRD)
## Rule Collection UI - Requirements Gathering Tool

### Document Information
- **Version**: 1.1.0
- **Date**: 2025-08-25
- **Author**: Pipeline Team  
- **Status**: Implemented (Rebranded)

### ⚠️ IMPORTANT CLARIFICATION
This tool is NOT the Business Rules Engine described in the main PRD. This is a requirements gathering tool that helps stakeholders describe business rules in plain language for later implementation in the actual Business Rules Engine.

## 1. Executive Summary

### Product Overview
The Rule Collection UI is a web-based interface for non-technical stakeholders to define, manage, and export business rules for the Concept Line pipeline. It replaces CLI-based rule definition with an intuitive visual interface.

### Problem Statement
Business rules are critical for POC behavior, but requiring stakeholders to edit JSON files or use command-line tools creates barriers to participation and increases error rates.

### Solution
A browser-based UI with form-driven rule creation, visual rule management, and one-click export to the pipeline, making business rule definition accessible to all stakeholders.

## 2. Objectives & Goals

### Primary Objectives
1. Enable non-technical rule definition
2. Validate rules at creation time
3. Export directly to pipeline
4. Provide visual rule management

### Success Metrics
- Rule creation time < 2 minutes
- Zero JSON editing required
- 100% valid rule output
- Export success rate > 95%

## 3. Functional Requirements

### Core Features

#### F1: Rule Creation
- **F1.1**: Form-based rule entry
- **F1.2**: Field validation
- **F1.3**: Auto-ID generation
- **F1.4**: Timestamp tracking

#### F2: Rule Properties
- **F2.1**: Rule name and description
- **F2.2**: Type selection (validation, calculation, etc.)
- **F2.3**: Component/entity targeting
- **F2.4**: Priority levels

#### F3: Rule Conditions
- **F3.1**: When conditions (triggers)
- **F3.2**: Action definitions
- **F3.3**: Visual indicators
- **F3.4**: Business context

#### F4: Rule Management
- **F4.1**: List all rules
- **F4.2**: Edit existing rules
- **F4.3**: Delete rules
- **F4.4**: Search and filter

#### F5: Pipeline Integration
- **F5.1**: Export to Stage 1
- **F5.2**: JSON generation
- **F5.3**: Validation before export
- **F5.4**: Success confirmation

### User Stories

**US1**: As a product owner, I want to define business rules without touching code
- **Acceptance**: Rules created via web form

**US2**: As a stakeholder, I want to see all rules at a glance
- **Acceptance**: Visual rule cards with metadata

**US3**: As a pipeline, I want to consume valid rule JSON
- **Acceptance**: Exported JSON passes validation

## 4. Technical Requirements

### Architecture
```
rule-collection-ui/
├── server.js           # Express server
├── package.json        # Dependencies
├── business-rules.json # Persistent storage
└── public/
    ├── index.html     # Main UI
    ├── styles.css     # Styling
    └── app.js        # Client logic
```

### Technology Stack
- Backend: Node.js + Express
- Frontend: Vanilla JavaScript
- Styling: CSS3 with animations
- Storage: File-based JSON

### API Endpoints
```
GET  /api/rules      # List all rules
POST /api/rules      # Create rule
PUT  /api/rules/:id  # Update rule
DELETE /api/rules/:id # Delete rule
POST /api/export     # Export to pipeline
```

## 5. User Interface

### Layout Design
```
┌─────────────────────────────────────┐
│     Business Rules Configurator     │
│  Define and manage business rules   │
├─────────────────────────────────────┤
│ [+ Add Rule] [Export] [Refresh]    │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ BR-001  Account List Filtering  │ │
│ │ Type: Validation  Priority: High │ │
│ │ Applies to: AccountListView     │ │
│ │ [Edit] [Delete]                 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ BR-002  Field Validation       │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Rule Creation Modal
```
┌─────────────────────────────────────┐
│        Business Rule Definition      │
├─────────────────────────────────────┤
│ Rule Name: [___________________]    │
│                                      │
│ Description:                         │
│ [_________________________________] │
│                                      │
│ Type: [Validation        ▼]          │
│                                      │
│ Applies To: [_______________]        │
│                                      │
│ Priority: [Medium        ▼]          │
│                                      │
│ When (Conditions):                   │
│ [_________________________________] │
│                                      │
│ Then (Actions):                      │
│ [_________________________________] │
│                                      │
│ Indicator: [📌 Business Rule ▼]     │
│                                      │
│ [Save Rule] [Cancel]                 │
└─────────────────────────────────────┘
```

## 6. Non-Functional Requirements

### Performance
- **NFR1**: Page load < 2 seconds
- **NFR2**: Rule save < 500ms
- **NFR3**: Export < 3 seconds

### Usability
- **NFR4**: Mobile responsive
- **NFR5**: Keyboard navigation
- **NFR6**: Clear error messages

### Security
- **NFR7**: Input sanitization
- **NFR8**: XSS prevention
- **NFR9**: Local network only

## 7. Data Model

### Rule Schema
```javascript
{
  id: "BR-001",              // Auto-generated
  name: "Account Filtering",  // Required
  description: "...",         // Required
  type: "validation",         // Enum
  appliesTo: "AccountView",   // Required
  priority: "high",           // Enum
  conditions: "...",          // Optional
  actions: "...",            // Optional
  indicator: "📌",           // Visual marker
  created: "ISO-8601"        // Auto-generated
}
```

### Rule Types
- `validation` - Input/data validation
- `calculation` - Computed values
- `authorization` - Access control
- `workflow` - Process flow
- `display` - UI logic

### Priority Levels
- `critical` - Must implement
- `high` - Important
- `medium` - Standard
- `low` - Nice to have

## 8. Validation Rules

### Field Validation
| Field | Rules |
|-------|-------|
| Name | Required, 3-50 chars |
| Description | Required, 10-500 chars |
| Type | Required, from enum |
| AppliesTo | Required, alphanumeric |
| Priority | Optional, defaults medium |

### Business Logic
1. Rule IDs must be unique
2. At least one rule required for export
3. Deleted rules cannot be recovered
4. Export creates timestamped backup

## 9. Error Handling

### Client Errors
| Error | Message | Recovery |
|-------|---------|----------|
| Empty name | "Rule name is required" | Focus field |
| Network fail | "Connection error" | Retry button |
| Invalid data | "Please check fields" | Highlight errors |

### Server Errors
| Error | Response | Action |
|-------|----------|--------|
| Save fail | 500 + message | Log, retry |
| Export fail | 500 + details | Show path |
| Not found | 404 | Refresh list |

## 10. Testing Strategy

### Unit Tests
- Rule validation logic
- ID generation
- Export formatting

### Integration Tests
- API endpoints
- File persistence
- Export pipeline

### UI Tests
- Form submission
- Rule CRUD operations
- Export flow

## 11. Deployment

### Development
```bash
npm install
npm run dev  # Port 3001
```

### Production
```bash
npm install --production
npm start    # Port 3001
```

### Configuration
```javascript
{
  port: 3001,
  rulesFile: "business-rules.json",
  exportPath: "../../../outputs/stage1/"
}
```

## 12. Success Criteria

### Launch Criteria
- [x] Create rules via UI
- [x] Edit existing rules
- [x] Delete rules
- [x] Export to pipeline
- [x] Visual indicators

### Acceptance Criteria
- Non-technical users can define rules
- Rules integrate with pipeline
- No JSON editing required

## 13. Future Enhancements

### Phase 2
- [ ] Rule templates
- [ ] Bulk import/export
- [ ] Rule versioning
- [ ] Validation preview

### Phase 3
- [ ] Rule testing sandbox
- [ ] Collaborative editing
- [ ] Rule dependencies
- [ ] Analytics dashboard

## 14. Appendix

### A. Indicator Types
- 📌 Business Rule
- 🔗 Integration Point
- ⚠️ Gap/Warning
- ✅ Validation
- 🔒 Security Rule

### B. Example Rules
```javascript
{
  id: "BR-001",
  name: "Required Field Validation",
  description: "Ensure account name is provided",
  type: "validation",
  appliesTo: "AccountDetailView",
  priority: "high",
  conditions: "When account.name is empty",
  actions: "Show error 'Name is required'",
  indicator: "✅"
}
```

### C. Export Format
```javascript
{
  rules: [
    { /* rule 1 */ },
    { /* rule 2 */ }
  ],
  metadata: {
    exportTime: "ISO-8601",
    ruleCount: 2,
    version: "1.0.0"
  }
}
```

---
*End of PRD - Rule Collection UI v1.0.0*