# Quick Start - Business Rules CLI

## Your Next Edit with CLI

Since you're working with a service business model, here's how to make common updates:

### Start the CLI
```bash
cd .pipeline/factory-tools/business-rules-configurator
npm run cli
```

### Common Service Business Updates

#### 1. Add Service-Specific Required Fields
When CLI starts, choose:
- `1` (Edit Phase 1 Account rules)
- `1` (Required fields)
- `a` (Add)
- Type: `serviceAddress`

#### 2. Update State Transitions for Service Workflow
- `4` (State transitions)
- Type: `Prospect`
- New transitions: `Active, Declined`

#### 3. Add Service Contract States
For a service business, you might want:
```
Lead → Qualified
Qualified → Proposal  
Proposal → Contract
Contract → Active
Active → Renewal, Cancelled
```

#### 4. Quick Mode Examples
Choose option `3` at start for quick commands:
```
require serviceAddress
require contractStartDate
unique contractNumber
transition Active Renewal
```

## Your Current Setup

Based on your edit, you have:
- **Account Types**: Residential, Commercial, Industrial, Other
- **Status Options**: Active, Suspended, Prospect, Closed

To add service-specific rules via CLI:
1. Add conditional rules (e.g., Commercial accounts require taxId)
2. Add validation patterns (e.g., service contract format)
3. Add business logic (e.g., auto-generate service ticket on Active)

## Benefits of CLI
✅ Validates YAML syntax
✅ Creates automatic backups
✅ Shows current values before editing
✅ Prevents typos (like "I ndustrial")
✅ Immediate regeneration option

Try it out: `npm run cli`