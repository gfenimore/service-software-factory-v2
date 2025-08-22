# Software Factory Process Flow - Simple View

## The Three-Line Factory

```
INPUT: Business Need (Account Management)
  ↓
CONCEPT LINE (HTML) ──→ PROTOTYPE LINE (React) ──→ PRODUCTION LINE (Vue)
  ↓                        ↓                           ↓
2 hours                  4 hours                    10 hours
Stakeholder Demo         Technical Demo             Enterprise Ready
```

---

## What Runs at Each Line

### 🎨 CONCEPT LINE - "Make it Visual"
**Goal**: Get something clickable in 2 hours

```
Step 1: IMS Creates Iteration
        └─> ITER-2025-01-21-001 (Concept)

Step 2: Configure in ViewForge (Manual - 30 min)
        └─> account-list-view.json
        └─> account-detail-view.json  
        └─> account-form-view.json

Step 3: Define Basic Rules (Manual - 15 min)
        └─> Display rules: "Show newest first"
        └─> Required fields: "Name is required"
        └─> Simple validation: "Email must have @"

Step 4: Generate HTML (Automated - 1 min)
        Tool: simple-html-generator.js
        └─> account-list.html
        └─> account-detail.html
        └─> account-form.html

Step 5: Test with Users (Manual - 1 hour)
        └─> Click through demos
        └─> Gather feedback
        └─> Validate workflow

Step 6: Complete Iteration
        └─> Tag as Golden if successful
```

**OUTPUT**: Static HTML pages with mock data
**TOOLS**: ViewForge + HTML Generator
**RULES**: Basic display and validation only

---

### ⚛️ PROTOTYPE LINE - "Make it Work"
**Goal**: Working React app with real API in 4 hours

```
Step 1: IMS Promotes from Concept
        └─> ITER-2025-01-21-002 (Prototype)
        └─> Inherits all Concept configs

Step 2: Enhance Configurations (Semi-automated - 20 min)
        ViewForge adds:
        └─> API endpoints
        └─> State management needs
        └─> Error handling specs

Step 3: Evolve Rules (Semi-automated - 30 min)
        Rules Manager adds:
        └─> API validation: "Check unique email"
        └─> Loading states: "Show spinner during fetch"
        └─> Error recovery: "Retry failed requests 3x"
        └─> Performance: "Load in <1 second"

Step 4: Story Builder Creates Stories (Automated - 15 min)
        Agent: story-builder-v21.md
        └─> US-004-account-cards.md (with tech specs)

Step 5: Processor Pipeline Runs (Automated - 35 min)
        
        5.1: Type Processor
             └─> Account.ts (TypeScript interfaces)
        
        5.2: Scaffold Processor  
             └─> AccountList.tsx (component shell)
             └─> AccountDetail.tsx
             └─> AccountForm.tsx
        
        5.3: React Processor
             └─> Adds hooks, state, API calls
        
        5.4: Hook Processor
             └─> useAccount.ts (custom hooks)
        
        5.5: Test Processor
             └─> Account.test.tsx (test suites)

Step 6: Integration & Testing (Manual + Auto - 2 hours)
        └─> Run tests
        └─> Fix issues
        └─> Validate with API

Step 7: Complete Iteration
        └─> Ready for Production line
```

**OUTPUT**: Working React application
**TOOLS**: ViewForge + Rules Manager + Story Builder + 5 Processors
**RULES**: API validation, error handling, basic performance

---

### 🚀 PRODUCTION LINE - "Make it Scale"
**Goal**: Enterprise-ready Vue app in 10 hours

```
Step 1: IMS Promotes from Prototype
        └─> ITER-2025-01-21-003 (Production)
        └─> Inherits Prototype configs + rules

Step 2: Production Configurations (Manual - 30 min)
        ViewForge adds:
        └─> Multi-tenant settings
        └─> Security layers
        └─> Audit requirements

Step 3: Complete Rules (Manual - 1 hour)
        Rules Manager adds:
        └─> RBAC: "Only managers can delete"
        └─> Audit: "Log all changes"
        └─> Compliance: "PII must be encrypted"
        └─> Performance: "p95 <500ms"
        └─> Caching: "5 minute TTL"

Step 4: Vue Generation (Automated - 30 min)
        Processor: vue-processor.md
        └─> AccountList.vue
        └─> AccountDetail.vue
        └─> AccountForm.vue

Step 5: Security Layer (Automated - 30 min)
        Generator: security-generator
        └─> RBAC configuration
        └─> Field encryption setup
        └─> Audit logging

Step 6: Performance Layer (Automated - 30 min)
        Generator: performance-generator
        └─> CDN configuration
        └─> Caching strategies
        └─> Virtual scrolling

Step 7: Full Testing (Manual - 4 hours)
        └─> Security audit
        └─> Load testing
        └─> UAT with business

Step 8: Deploy (Automated - 30 min)
        └─> Production deployment
```

**OUTPUT**: Production Vue application
**TOOLS**: Full suite + Security/Performance generators
**RULES**: Complete business + technical rules

---

## The Power of Progressive Rules

### Same Rule, Different Expressions:

**Rule: "Account name is required"**

- **Concept**: Show asterisk (*) next to field
- **Prototype**: Validate on blur, show error message
- **Production**: + Check uniqueness in DB, audit changes, encrypt at rest

**Rule: "Show accounts list"**

- **Concept**: Display 10 mock accounts
- **Prototype**: Fetch from API, pagination
- **Production**: + Virtual scroll, cache 5 min, prefetch next page

---

## Why This Works

1. **Fast Feedback**: See something in 2 hours, not 2 weeks
2. **Progressive Enhancement**: Each line builds on previous
3. **Managed Iterations**: IMS tracks everything
4. **Rule Evolution**: Rules grow with complexity
5. **Automated Generation**: Processors do heavy lifting
6. **Consistent Output**: Same configs → same results

---

## The Account Entity Journey

Current Status:
- ✅ We have Account configured in ViewForge
- ✅ IMS is managing our iterations
- ✅ Generators are ready for Concept Line
- ⏳ Ready to run end-to-end

Next: Generate Account views in current iteration!