# SDLC Workflow Map: Complete Agent & Processor Architecture

## From Idea to Production: Every Step Mapped

---

## 📊 High-Level Phase Flow

```
IDEA → REQUIREMENTS → DESIGN → CONSTRUCTION → TESTING → DEPLOYMENT → OPERATIONS
  ↓         ↓            ↓           ↓            ↓           ↓            ↓
Agents   story-builder  designer   coder      testbuilder  deployer   monitor
  ↓         ↓            ↓           ↓            ↓           ↓            ↓
Processors  Multiple    validators  builders    testers    pipelines   trackers
```

---

## 🔄 Detailed Phase-by-Phase Workflow

### PHASE 1: REQUIREMENTS

**Owner**: Product/Business Team  
**Duration**: 1-2 days

```
1.1 Initial Capture
    Input: Business need, user request, idea
    Agent: story-builder
    Output: requirements.md

1.2 Feature Refinement
    Input: requirements.md
    Processor: requirements-validator
    Output: feature-document.md

1.3 Story Breakdown
    Input: feature-document.md
    Processor: story-decomposer
    Output: user-stories/*.md

1.4 Acceptance Criteria
    Input: user-stories/*.md
    Processor: acceptance-criteria-generator
    Output: acceptance-criteria/*.md

1.5 Requirements Review Gate
    Input: All requirements artifacts
    Quality Gate: requirements-complete
    Decision: Proceed or refine
```

### PHASE 2: DESIGN

**Owner**: Architecture/UX Team  
**Duration**: 1-2 days

```
2.1 Data Model Design
    Input: requirements.md + BUSM.mmd
    Processor: schema-designer
    Output: schema-changes.sql

2.2 API Design
    Input: user-stories/*.md
    Processor: api-designer
    Output: api-spec.yaml

2.3 UI/UX Design
    Input: user-stories/*.md
    Agent: designer (or manual mockup)
    Output: mockups/*.png or figma link

2.4 Type Generation
    Input: schema-changes.sql
    Processor: type-generator
    Output: types/*.ts

2.5 Design Review Gate
    Input: All design artifacts
    Quality Gate: design-approved
    Decision: Proceed or revise
```

### PHASE 3: CONSTRUCTION

**Owner**: Development Team  
**Duration**: 2-5 days

```
3.1 Database Implementation
    Input: schema-changes.sql
    Processor: migration-runner
    Output: Database tables created
    Tracking: processor_sessions.status = 'running'

3.2 API Implementation
    Input: api-spec.yaml + types/*.ts
    Agent: coder (Claude Code/CC)
    Output: app/api/**/route.ts
    Tracking: processor_runs entries

3.3 UI Component Building
    Input: mockups/* + user-stories/*
    Agent: coder (Claude Code/CC)
    Output: components/*.tsx

3.4 Integration
    Input: All components + APIs
    Processor: integration-validator
    Output: Integration test results

3.5 Code Review Gate
    Input: All code artifacts
    Quality Gate: code-review-passed
    Decision: Proceed or fix
```

### PHASE 4: TESTING

**Owner**: QA/Development Team  
**Duration**: 1-2 days

```
4.1 Test Generation
    Input: acceptance-criteria/*.md
    Agent: testbuilder
    Output: tests/*.test.ts

4.2 Unit Testing
    Input: tests/*.test.ts
    Processor: test-runner
    Output: test-results/unit/*

4.3 Integration Testing
    Input: Full application
    Processor: integration-tester
    Output: test-results/integration/*

4.4 User Acceptance Testing
    Input: Deployed preview
    Process: Manual validation
    Output: uat-results.md

4.5 Testing Gate
    Input: All test results
    Quality Gate: tests-passed
    Decision: Proceed to deploy or fix
```

### PHASE 5: DEPLOYMENT

**Owner**: DevOps/Platform Team  
**Duration**: < 1 hour

```
5.1 Build Verification
    Input: Source code
    Processor: build-validator
    Output: Build success/failure

5.2 Preview Deployment
    Input: Feature branch
    Processor: vercel-preview
    Output: Preview URL

5.3 Production Deployment
    Input: Main branch
    Processor: vercel-production
    Output: Production URL

5.4 Deployment Verification
    Input: Production URL
    Processor: smoke-tester
    Output: Deployment verified

5.5 Deployment Gate
    Input: All deployment checks
    Quality Gate: deployment-verified
    Decision: Complete or rollback
```

### PHASE 6: OPERATIONS

**Owner**: Operations Team  
**Duration**: Ongoing

```
6.1 Monitoring
    Input: Production application
    Processor: health-monitor
    Output: metrics/*

6.2 Error Tracking
    Input: Application logs
    Processor: error-analyzer
    Output: error-reports/*

6.3 Performance Tracking
    Input: Application metrics
    Processor: performance-analyzer
    Output: performance-reports/*

6.4 Retrospective
    Input: Sprint artifacts
    Process: Team discussion
    Output: retrospective.md
```

---

## 🤖 Agent Inventory

| Agent         | Purpose               | Status       | Location                  |
| ------------- | --------------------- | ------------ | ------------------------- |
| story-builder | Generate user stories | ✅ Built     | processors/story-builder/ |
| designer      | Create mockups        | ❌ Manual    | (Human process)           |
| coder         | Write code            | ✅ Active    | Claude Code (CC)          |
| testbuilder   | Generate tests        | 🟡 Exists    | processors/testbuilder/   |
| reviewer      | Code review           | ❌ Manual    | (Human process)           |
| deployer      | Deploy code           | ✅ Automated | Vercel                    |

---

## ⚙️ Processor Inventory

| Processor                     | Phase        | Input           | Output            | Status       |
| ----------------------------- | ------------ | --------------- | ----------------- | ------------ |
| requirements-validator        | Requirements | requirements.md | validation-report | 🟡 Partial   |
| story-decomposer              | Requirements | feature doc     | user stories      | 🟡 Partial   |
| acceptance-criteria-generator | Requirements | user story      | criteria          | ❌ Not built |
| schema-designer               | Design       | requirements    | SQL               | 🟡 Manual    |
| type-generator                | Design       | schema          | TypeScript        | ✅ Can build |
| api-designer                  | Design       | stories         | OpenAPI           | ❌ Not built |
| migration-runner              | Construction | SQL             | DB changes        | ✅ Manual    |
| integration-validator         | Construction | code            | report            | ❌ Not built |
| test-runner                   | Testing      | tests           | results           | ✅ Via npm   |
| build-validator               | Deployment   | code            | pass/fail         | ✅ Vercel    |
| health-monitor                | Operations   | app             | metrics           | ❌ Not built |

---

## 🔄 Invocation Chain Example

Here's how US-006 (Service Locations) would flow through the system:

```
1. CREATE STORY
   invocation-generator.run("story-builder", "Add service locations to Master View")
   → Output: US-006-service-locations.md

2. DESIGN SCHEMA
   invocation-generator.run("schema-designer", "US-006-service-locations.md")
   → Output: add-service-locations.sql

3. GENERATE TYPES
   invocation-generator.run("type-generator", "add-service-locations.sql")
   → Output: service-location.types.ts

4. BUILD FEATURE
   CC manually codes based on story + types + schema

5. TEST
   invocation-generator.run("testbuilder", "US-006-service-locations.md")
   → Output: service-locations.test.ts

6. DEPLOY
   git push → Vercel auto-deploys
```

---

## 📈 Current State vs. Target State

### Current State (Reality)

```
Idea → Claude/Human discuss → CC codes → Debug → Deploy
```

**Processing through**: 2 agents (Claude, CC), 0 automated processors

### Target State (With Automation)

```
Idea → story-builder → schema-designer → type-generator →
CC codes → testbuilder → test-runner → auto-deploy
```

**Processing through**: 4 agents, 5+ processors, multiple quality gates

### Hybrid State (Recommended)

```
Idea → Human refines → story-builder assists →
schema-designer generates → CC codes →
testbuilder helps → Human reviews → auto-deploy
```

**Processing through**: Human-in-the-loop with agent assistance

---

## 🎯 What We Can Automate TODAY

1. **Schema-to-Types Pipeline** (High Value, Low Risk)
   - Input: BUSM.mmd section
   - Process: Parse → Generate SQL → Generate TypeScript
   - Output: Perfect alignment

2. **Story Enhancement** (Medium Value, Medium Risk)
   - Input: Basic user need
   - Process: story-builder → acceptance-criteria-generator
   - Output: Complete user story

3. **Test Generation** (High Value, Medium Risk)
   - Input: User story
   - Process: testbuilder → test-runner
   - Output: Test coverage

---

## 📊 Decision Matrix

| What to Automate     | Value  | Risk   | Effort | Do It?  |
| -------------------- | ------ | ------ | ------ | ------- |
| Schema→Types         | High   | Low    | Low    | ✅ YES  |
| Requirements→Stories | Medium | Medium | Medium | 🟡 TEST |
| Stories→Tests        | High   | Medium | Medium | 🟡 TEST |
| Code Generation      | Low    | High   | High   | ❌ NO   |
| Deployment           | High   | Low    | Done   | ✅ DONE |

---

## 🚦 Next Steps to Reduce Cognitive Dissonance

1. **Document what exists** - This map
2. **Identify gaps** - What's manual that shouldn't be
3. **Prioritize automation** - Based on pain points
4. **Test with US-006** - Run one story through partial automation
5. **Refine and expand** - Based on what works

---

_This is your complete system. Some parts are built, some are manual, some are missing. But now you can SEE it all._
