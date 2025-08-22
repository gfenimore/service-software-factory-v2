# Multi-Agent Workflow Definition v2.0

**Purpose**: Reliable, verifiable software delivery using specialized agents

## 🎯 Core Principle: Smallest Deployable Units + Trust But Verify

Each agent contributes to creating the smallest possible working increments that can be:

- **Verified** independently with executable proof
- **Deployed** to preview URLs
- **Tested** at a basic level
- **Enhanced** progressively

**Critical Addition**: No agent claims completion without providing **executable verification commands** and proof of working functionality.

## 🎭 Agent Roles & Responsibilities

### 1. PLANNER Agent

**Role**: Task Decomposer  
**Creates**: Ordered list of 30-minute tasks with verification commands

**Responsibilities:**

- Break user stories into implementable tasks (≤30 minutes each)
- Define **executable verification criteria** for each task
- Specify commit checkpoints (every 3-4 tasks)
- Ensure each task produces exactly ONE deliverable

**Key Decisions:**

- Task ordering and dependencies
- **Verification commands** that prove completion
- Commit frequency (every 3-4 tasks)

**Does NOT:**

- Define implementation details
- Specify design patterns
- Create test strategies

**Deliverable**: `.cursor/artifacts/current/planning/[story-id]-tasks.md`

---

### 2. ARCHITECT Agent

**Role**: Technical Designer  
**Creates**: Technical specifications and patterns

**Responsibilities:**

- Map planner tasks to technical implementations
- Define TypeScript interfaces and types
- Specify component patterns and data flow (including three-column layouts)
- Provide test patterns (not test plans)
- Choose server vs client components

**Key Decisions:**

- Technology patterns (server/client components)
- State management approach
- Integration patterns
- Error handling strategies

**Does NOT:**

- Implement code
- Write actual tests
- Decide task order

**Deliverable**: `.cursor/artifacts/current/design/[story-id]-architecture.md`

---

### 3. DEVELOPER Agent

**Role**: Incremental Builder & Packager  
**Creates**: Working, deployable code with executable proof

**Responsibilities:**

- **Package** planner tasks + architect specs into working code
- Implement minimal viable versions first (no perfectionism)
- Write "proof of life" tests
- **Execute verification commands and provide output**
- Ensure each increment deploys to preview URL
- Commit at specified checkpoints

**Key Decisions:**

- How minimal can this increment be while still working?
- What's the simplest test that proves functionality?
- What can be mocked vs what needs to be real?

**Progressive Enhancement Pattern:**

```typescript
// Increment 1: Renders something
export function Component() {
  return <div>Component works!</div>
}

// Increment 2: Accepts props
export function Component({ data }: Props) {
  return <div>{data.length} items</div>
}

// Increment 3: Full functionality
export function Component({ data, loading, error }: Props) {
  // Complete implementation
}
```

**Verification Requirements:**

````markdown
## Agent: DEVELOPER - Task [X] Complete

**Verification Commands Run:**

```bash
npm run type-check     # ✅ 0 errors
npm test ComponentName # ✅ 5/5 tests passing
curl localhost:3000/accounts # ✅ 200 OK
ls -la src/components/accounts/  # ✅ Files created
```
````

**Preview URL**: https://preview-xyz.vercel.app/accounts
**Integration Test**: Component visible and functional at URL
**Next Agent Can Proceed**: YES/NO

````

**Does NOT:**
- Create comprehensive test suites
- Implement future functionality
- Make architectural decisions

**Deliverable**: `.cursor/artifacts/current/development/[story-id]-complete.md`

---

### 4. TESTER Agent
**Role**: Quality Assurance Specialist
**Creates**: Comprehensive test suites

**Responsibilities:**
- Analyze implemented components
- Create detailed test plans
- Write comprehensive test suites
- Cover edge cases and error scenarios
- Ensure accessibility compliance
- Performance testing

**Timing**: After initial implementation is working

**Does NOT:**
- Block initial deployment
- Require 100% coverage immediately
- Slow down rapid iteration

**Deliverable**: `.cursor/artifacts/current/testing/[story-id]-test-report.md`

---

### 5. REVIEWER Agent
**Role**: Quality Gatekeeper
**Creates**: Review reports and improvement tasks

**Responsibilities:**
- Verify all deliverables exist at specified locations
- Check code quality standards
- Ensure patterns are followed
- **Validate preview deployments work**
- Create punch list of improvements

**Timing**: Before merging to main

**Deliverable**: `.cursor/artifacts/current/reviews/[story-id]-review.md`

---

## 📦 The Packaging Process

### How DEVELOPER Packages Work:

```mermaid
graph LR
    A[Read Planner Task] --> B{Understand Deliverable}
    B --> C[Read Architect Spec]
    C --> D{Find Relevant Pattern}
    D --> E[Implement Minimal Version]
    E --> F[Write Basic Test]
    F --> G{Verify Locally}
    G -->|Pass| H[Commit & Push]
    H --> I[Verify Preview URL]
    I -->|Works| J[Execute Verification Commands]
    J -->|Pass| K[Report Completion]
    G -->|Fail| L[Fix Issues]
    L --> G
````

### Example Package:

**Planner Task 4**: Create AccountsTable component  
**Architect Spec**: Use TypeScript interface `AccountsTableProps`, server component pattern  
**Developer Package**:

1. ✅ `AccountsTable.tsx` - Renders with mock data
2. ✅ `AccountsTable.test.tsx` - Verifies render
3. ✅ Visible at preview URL `/accounts`
4. ✅ TypeScript compiles (verified with `npm run type-check`)
5. ✅ Tests pass (verified with `npm test`)
6. ✅ Committed with message: "feat: add AccountsTable component"

---

## 🧪 Test Strategy Across Agents

### Phase 1: Developer Tests (Minimal - Proof of Life)

**Purpose**: Prove the component works

```typescript
test('renders without crashing', () => {
  render(<Component />)
})

test('displays expected content', () => {
  render(<Component data={mockData} />)
  expect(screen.getByText('Expected')).toBeInTheDocument()
})
```

### Phase 2: Tester Tests (Comprehensive - Production Quality)

**Purpose**: Ensure production quality

```typescript
describe('Component Full Test Suite', () => {
  describe('Rendering', () => {
    test('renders with all props variations')
    test('handles empty states')
    test('handles error states')
  })

  describe('Interactions', () => {
    test('responds to user clicks')
    test('keyboard navigation works')
  })

  describe('Accessibility', () => {
    test('meets WCAG 2.1 AA standards')
    test('screen reader compatible')
  })

  describe('Performance', () => {
    test('renders 1000 items efficiently')
    test('no memory leaks')
  })
})
```

---

## 🔄 Handoff Protocol with Verification

### Planner → Architect

**Required Before Handoff:**

```markdown
✅ Planning document complete at: .cursor/artifacts/current/planning/[story-id]-tasks.md
✅ All tasks have clear deliverables with file paths
✅ Verification commands specified for each task
✅ Commit points identified
✅ Human review approves planning approach
```

### Architect → Developer

**Required Before Handoff:**

```markdown
✅ Architecture document complete at: .cursor/artifacts/current/design/[story-id]-architecture.md
✅ All planner tasks have technical specs
✅ TypeScript interfaces defined
✅ Component patterns specified (including three-column patterns)
✅ Test patterns provided
✅ Human review approves technical approach
```

### Developer → Tester

**Required Before Handoff:**

```markdown
✅ All components implemented and deployed
✅ All verification commands executed successfully
✅ Preview URL functional: [url]
✅ Basic tests passing
✅ Development completion report created
✅ Human verification of preview URL confirms functionality
```

### Tester → Reviewer

**Required Before Handoff:**

```markdown
✅ Comprehensive test suite complete
✅ All tests passing
✅ Coverage report generated (80%+ coverage)
✅ Edge cases covered
✅ Performance validated
✅ Accessibility compliance verified
```

### Reviewer → Production

**Required Before Merge:**

```markdown
✅ Review report approves all aspects
✅ All quality gates passed
✅ Preview deployment verified working
✅ Ready for production deployment
```

---

## 🚀 Deployment Checkpoints

### After Each Commit (3-4 tasks):

1. **Git Push** → Vercel preview deployment
2. **Verify URL** → Components work in real environment
3. **Share URL** → Get stakeholder feedback
4. **Continue** → Next set of tasks

### Example Timeline:

- **Hour 1**: Tasks 1-3 → Preview URL with basic structure
- **Hour 2**: Tasks 4-7 → Preview URL with working table
- **Hour 3**: Tasks 8-11 → Preview URL with search/filters
- **Hour 4**: Tasks 12-15 → Preview URL fully functional

**Critical**: Every checkpoint must have a **working preview URL** that demonstrates real progress.

---

## 🚨 Quality Gates (Non-Negotiable)

### Human Verification Required

Before accepting any agent completion:

- [ ] Run the verification commands yourself
- [ ] Check the actual files exist at specified paths
- [ ] Test the preview URL works
- [ ] Verify no console errors
- [ ] Confirm integration points work

### Automated Quality Gates

```bash
# All must pass before proceeding
npm run type-check    # Zero TypeScript errors
npm run lint          # Zero ESLint warnings
npm test             # All tests passing
npm run build        # Production build succeeds
```

---

## 📏 Success Metrics

### For DEVELOPER:

- ✅ Each task completed in ~30 minutes
- ✅ Every commit has working preview URL
- ✅ All verification commands pass
- ✅ No broken builds
- ✅ **Executable proof provided for every completion claim**

### For TESTER:

- ✅ 80%+ code coverage
- ✅ All edge cases tested
- ✅ Performance benchmarks met
- ✅ Accessibility validated

### For REVIEWER:

- ✅ All agents followed their roles
- ✅ Patterns consistently applied
- ✅ Documentation complete
- ✅ Ready for production

---

## 🎁 The Magic: Progressive Enhancement + Verification

Each agent adds value without blocking progress:

1. **PLANNER** enables work to start (with clear verification criteria)
2. **ARCHITECT** enables correct implementation
3. **DEVELOPER** enables deployment and feedback (with proof)
4. **TESTER** enables production confidence
5. **REVIEWER** enables quality maintenance

**The result**: **Continuous deployment of working software** with increasing quality over time, **backed by executable proof** at every step.

## 🛡️ Prevents US-001 Type Failures

This workflow specifically addresses the failures identified in the US-001 forensic analysis:

- ✅ **No false completion claims** - executable proof required
- ✅ **No "beautiful code that doesn't work"** - preview URL verification
- ✅ **No quality theater** - human verification of every claim
- ✅ **No perfect first tries** - minimal increments with real testing
- ✅ **No agent overreach** - clear boundaries and verification
