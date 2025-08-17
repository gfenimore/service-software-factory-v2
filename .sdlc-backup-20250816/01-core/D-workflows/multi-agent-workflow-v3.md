# Multi-Agent Workflow Definition v3.0 - Enhanced SDLC

**Purpose**: Complete definition of agent roles, responsibilities, and orchestration in our enhanced SDLC

## 🎯 Core Principles

### Quality Wins Through Orchestration

Each agent has a focused role, with DevOps orchestrating the workflow and Reviewer ensuring quality throughout. This separation enables:

- **Speed**: Agents work in parallel where possible
- **Quality**: Continuous validation catches issues early
- **Reliability**: Clear handoffs prevent miscommunication
- **Scalability**: Focused agents are easier to enhance

### Trust But Verify

Every agent must provide executable proof of completion:

- **Claims** require verification commands
- **Artifacts** must exist in correct locations
- **Quality** must pass automated checks
- **Deployments** must be accessible

## 🎭 Agent Roles & Responsibilities

### 1. PLANNER Agent

**Role**: Task Decomposer & Organizer  
**Creates**: Detailed task breakdown with verification criteria

**Responsibilities:**

- Analyze user stories with business rules
- Break down work into 30-minute tasks
- Define verification commands for each task
- Identify commit checkpoints (every 3-4 tasks)
- Map tasks to acceptance criteria

**Key Outputs:**

- `.cursor/artifacts/current/planning/us-xxx-tasks.md`
- Tasks with clear deliverables
- Verification commands that prove "I can" statements
- Git commit checkpoint markers

**Success Metrics:**

- Tasks truly completable in 30 minutes
- Every task has one deliverable
- Verification commands are executable
- Business rules integrated into tasks

---

### 2. ARCHITECT Agent

**Role**: Technical Designer & Pattern Definer  
**Creates**: Technical specifications and implementation patterns

**Responsibilities:**

- Transform tasks into technical designs
- Define TypeScript interfaces and types
- Decide server vs client components
- Specify data flow and state management
- Provide test patterns (not full tests)

**Key Outputs:**

- `.cursor/artifacts/current/design/us-xxx-architecture.md`
- Complete TypeScript interfaces
- Component hierarchy diagrams
- Integration patterns
- Technology decisions with rationale

**Success Metrics:**

- Every planner task has technical spec
- Interfaces compile without errors
- Clear server/client boundaries
- Patterns consistent with existing code

---

### 3. DEVELOPER Agent

**Role**: Incremental Builder & Progressive Enhancer  
**Creates**: Working, tested, deployable code

**Responsibilities:**

- Implement tasks following specifications
- Write minimal "proof of life" tests
- Progressively enhance functionality
- Ensure each increment deploys
- Follow commit checkpoint schedule

**Key Outputs:**

- Working code in correct locations
- Basic tests that prove functionality
- Successful preview deployments
- Clean git history with meaningful commits

**Success Metrics:**

- Each task independently verifiable
- TypeScript compiles after each task
- Basic tests pass
- Preview URL shows progress

**Progressive Enhancement Example:**

```typescript
// Task 4: Basic render
export function AccountsTable() {
  return <div>Accounts Table</div>
}

// Task 8: With data
export function AccountsTable({ data }: Props) {
  return <table>{/* render data */}</table>
}

// Task 12: Full features
export function AccountsTable({ data, onSort, filters }: Props) {
  // Complete implementation
}
```

---

### 4. DEVOPS Agent (Enhanced)

**Role**: Infrastructure Orchestrator & Workflow Guardian  
**Creates**: Clean environments, deployments, and workflow automation

**Responsibilities:**

- Initialize feature workspace and git branches
- Verify agent handoffs and artifacts
- Manage git operations at checkpoints
- Orchestrate deployments (preview & production)
- Handle infrastructure errors with auto-fix
- Archive completed features

**Key Workflows:**

- `start-feature`: Initialize everything
- `verify-handoff`: Validate agent transitions
- `checkpoint`: Commit and deploy progress
- `complete-feature`: Merge and archive
- `rollback`: Emergency recovery

**Success Metrics:**

- Clean git history maintained
- All deployments verified working
- Artifacts in correct locations
- Smooth agent transitions
- Quick error recovery

---

### 5. REVIEWER Agent (Enhanced)

**Role**: Quality Guardian & Standards Enforcer  
**Creates**: Quality reports and improvement recommendations

**Responsibilities:**

- Continuous quality validation (not just final)
- Code quality checks (TypeScript, ESLint, tests)
- Pattern compliance verification
- Performance and security validation
- Provide specific, actionable feedback

**Key Workflows:**

- `validate-checkpoint`: During development
- `validate-patterns`: Architecture compliance
- `validate-tests`: Test quality and coverage
- `validate-performance`: Speed and size
- `final-review`: Production readiness

**Success Metrics:**

- Issues caught early (during dev)
- 80%+ test coverage maintained
- Zero TypeScript/ESLint errors
- Performance budgets respected
- Security vulnerabilities addressed

---

### 6. TESTER Agent

**Role**: Comprehensive Quality Assurance  
**Creates**: Full test suites ensuring production readiness

**Responsibilities:**

- Enhance developer's basic tests
- Cover all edge cases and errors
- Validate business rules thoroughly
- Ensure accessibility compliance
- Performance and stress testing

**Key Outputs:**

- `.cursor/artifacts/current/testing/us-xxx-test-report.md`
- Comprehensive test suites
- Coverage reports >80%
- Performance benchmarks
- Accessibility audit results

**Success Metrics:**

- All acceptance criteria tested
- Business rules validated
- Edge cases covered
- No untested code paths

---

## 🔄 Orchestrated Workflow

### Phase 1: Initialization

```mermaid
graph LR
    A[User Story] --> B[Save to artifacts/current/requirements]
    B --> C[@devops start-feature]
    C --> D{Environment Ready}
    D -->|Yes| E[@planner]
    D -->|No| F[Fix Issues]
    F --> C
```

### Phase 2: Design & Build Cycle

```mermaid
graph LR
    A[@planner] --> B[@devops verify-handoff]
    B --> C[@architect]
    C --> D[@devops verify-handoff]
    D --> E[@developer]
    E --> F{3-4 tasks done?}
    F -->|Yes| G[@devops checkpoint]
    G --> H[@reviewer validate-checkpoint]
    H --> I{Quality OK?}
    I -->|Yes| J[Continue dev]
    I -->|No| K[Fix issues]
    F -->|No| J
    J --> E
```

### Phase 3: Quality & Completion

```mermaid
graph LR
    A[Dev Complete] --> B[@devops verify-handoff]
    B --> C[@tester]
    C --> D[@devops verify-handoff]
    D --> E[@reviewer final-review]
    E --> F{Approved?}
    F -->|Yes| G[@devops complete-feature]
    F -->|No| H[Back to dev]
    G --> I[Production]
```

---

## 📊 Agent Collaboration Matrix

| From Agent | To Agent  | Handoff Artifact | DevOps Verifies    | Reviewer Validates |
| ---------- | --------- | ---------------- | ------------------ | ------------------ |
| Human      | Planner   | Requirements doc | Clean environment  | N/A                |
| Planner    | Architect | Task breakdown   | File exists, valid | N/A                |
| Architect  | Developer | Technical design | Interfaces present | Pattern compliance |
| Developer  | Developer | Code + tests     | Commits, deploys   | Code quality       |
| Developer  | Tester    | Working preview  | All tasks complete | Coverage baseline  |
| Tester     | Reviewer  | Test suites      | Tests passing      | Test quality       |
| Reviewer   | DevOps    | Approval         | All checks green   | Final quality      |

---

## 🚦 Quality Gates & Checkpoints

### Development Checkpoints (Every 3-4 Tasks)

1. **Developer** completes tasks
2. **DevOps** runs checkpoint:
   - Commits code
   - Pushes to remote
   - Verifies deployment
3. **Reviewer** validates quality:
   - TypeScript compilation
   - Test coverage
   - Pattern compliance
   - Performance impact

### Agent Handoff Gates

1. **DevOps** verifies:
   - Previous artifact exists
   - Correct location
   - Not empty
   - Recent timestamp
2. **Next agent** proceeds only after verification

### Final Production Gate

1. **All agents** complete their work
2. **Reviewer** gives final approval
3. **DevOps** orchestrates merge
4. **Production** deployment verified
5. **Artifacts** archived

---

## 🛠️ Error Handling & Recovery

### Agent-Specific Error Handling

**Planner Errors**:

- Missing requirements → Human provides
- Too many tasks → Split into phases
- Unclear verification → Human clarifies

**Architect Errors**:

- Missing planner tasks → Re-run planner
- Incompatible patterns → Revise design
- Complex beyond scope → Simplify approach

**Developer Errors**:

- Task fails verification → Fix and retry
- Tests don't pass → Debug issue
- Deployment fails → DevOps assists

**DevOps Errors**:

- Auto-fixable → Apply fix, continue
- Needs human → Clear instructions
- Critical failure → Rollback plan

**Reviewer Errors**:

- Quality below standard → Specific fixes
- Pattern violations → Clear guidance
- Performance issues → Optimization tips

---

## 📈 Success Metrics

### Velocity Metrics

- Tasks completed per day
- Time from story to production
- Checkpoint success rate
- Deployment frequency

### Quality Metrics

- Defects caught by phase
- Test coverage trends
- Performance budget adherence
- Security vulnerabilities found

### Process Metrics

- Agent handoff success rate
- Auto-fix effectiveness
- Rollback frequency
- Human intervention required

---

## 🎯 Key Differentiators of v3.0

### 1. DevOps as Orchestrator

- Controls workflow progression
- Handles all infrastructure
- Enables other agents to focus
- Provides auto-fix capabilities

### 2. Reviewer as Continuous Guardian

- Quality checks during development
- Not just final gate
- Specific, actionable feedback
- Prevents quality debt

### 3. Clear Separation of Concerns

- Infrastructure vs Quality
- Automation vs Validation
- Progress vs Standards
- Speed vs Reliability

### 4. Error Recovery Built-In

- Every agent handles failures
- Clear escalation paths
- Auto-fix when safe
- Human guidance when needed

---

## 🚀 Implementation Checklist

Before running first feature:

- [ ] All agent prompts updated to v3.0
- [ ] DevOps v3.0 installed
- [ ] Reviewer v3.0 installed
- [ ] Handoff templates ready
- [ ] Error recovery tested

During feature development:

- [ ] Start with DevOps setup
- [ ] Verify after each handoff
- [ ] Checkpoint every 3-4 tasks
- [ ] Address quality feedback immediately
- [ ] Complete with DevOps finalization

After feature completion:

- [ ] Review metrics
- [ ] Identify improvements
- [ ] Update agent instructions
- [ ] Share learnings

---

## 💡 Remember

**Orchestration + Quality = Sustainable Speed**

- DevOps orchestrates, Reviewer validates
- Every agent focused on their expertise
- Continuous validation prevents debt
- Automation handles routine tasks
- Humans handle exceptions

This enhanced workflow ensures we deliver quality software continuously and reliably!
