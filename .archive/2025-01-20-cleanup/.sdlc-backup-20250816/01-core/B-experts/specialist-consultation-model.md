# Specialist Consultation Model - Internal Experts

## Core Principle

**Specialists are consultants, not firefighters**

- Called PROACTIVELY for expertise (preferred)
- Called REACTIVELY for problems (when necessary)

## Consultation Triggers by Agent

### ARCHITECT Consultations

#### Consults REACT-EXPERT when:

```yaml
Designing:
- Data fetching strategy (Server vs Client)
- Component composition patterns
- State management approach
- Performance-critical components
- Streaming/Suspense boundaries

Example:
"For this dashboard with real-time updates, should I use:
A) Server components with polling
B) Client components with websockets
C) Hybrid approach?"
```

#### Consults DATA-EXPERT when:

```yaml
Designing:
- Query patterns for complex data
- Caching strategies
- Real-time subscriptions
- Data denormalization decisions
- Security boundaries (RLS)

Example:
"The accounts list needs filtering by 5 fields and pagination.
Best pattern for performance?"
```

#### Consults STYLE-MASTER when:

```yaml
Designing:
- Complex responsive layouts
- Animation-heavy interfaces
- Theme system architecture
- Component library patterns
- Accessibility requirements

Example:
"Three-column layout that becomes single column on mobile.
What's the most maintainable approach?"
```

---

### DEVELOPER Consultations

#### Consults DR-TYPESCRIPT when:

```yaml
Implementing:
- Generic components
- Complex type inference
- Union type discrimination
- Module augmentation
- Type-safe API contracts

Example:
"Creating a Table component that infers column types from data.
How to type this generically?"
```

#### Consults REACT-EXPERT when:

```yaml
Implementing:
- Custom hooks
- Performance optimization
- Ref forwarding patterns
- Error boundaries
- Suspense implementation

Example:
"useEffect running twice in development.
Is this React 18 StrictMode or a bug?"
```

---

### TESTBUILDER Consultations

#### Consults Any Specialist when:

```yaml
Creating tests for:
- Framework-specific patterns
- Complex async scenarios
- Performance benchmarks
- Accessibility standards
- Integration boundaries

Example to REACT-EXPERT:
"How to test Server Components that fetch data?"
```

---

## Consultation Protocol

### 1. Inline Consultation (During Work)

```markdown
## ARCHITECT Design Decision Point

**Question for REACT-EXPERT**:
The navigation needs to maintain state across page refreshes.
Options considered:

1. localStorage with useEffect
2. URL state with searchParams
3. Cookie-based with server component

**REACT-EXPERT Responds**:
Recommendation: Option 2 (URL state)

- Shareable links
- Works with browser back/forward
- No hydration issues
- Pattern: [provides code example]

**ARCHITECT Continues**:
Implementing URL-based state management...
```

### 2. Validation Consultation (Before Handoff)

```markdown
## DEVELOPER Implementation Review

**Quick Check with DR-TYPESCRIPT**:
Implemented generic Table<T> component.
Type inference working but feels complex.
Better pattern?

**DR-TYPESCRIPT Reviews**:
Current implementation: 7/10
Suggestions:

- Simplify with mapped types
- Add type constraints
- Example refactor: [code]
  Optional improvement, not blocking.
```

---

## When NOT to Consult Specialists

### Don't Consult When:

1. **Standard patterns apply** - Use established conventions
2. **Time pressure is high** - Make decision, note for later
3. **Good enough works** - Don't over-optimize
4. **Clear documentation exists** - Check docs first

### Always Consult When:

1. **Two valid approaches** - Expert breaks the tie
2. **Performance critical** - Get it right first time
3. **Security implications** - No compromises
4. **New framework features** - Leverage expertise

---

## Specialist Response Format

### Quick Consultation (2-3 min)

```yaml
Question Summary: [restate question]
Recommendation: [specific choice]
Key Reason: [one sentence why]
Pattern/Example: [code snippet if helpful]
Learn More: [optional link/reference]
```

### Deep Consultation (5-10 min)

```yaml
Question Analysis:
  - Core requirement
  - Constraints identified
  - Options considered

Recommendation:
  - Chosen approach
  - Implementation pattern
  - Example code

Trade-offs:
  - Pros of this approach
  - Cons to be aware of
  - When to reconsider

Future Considerations:
  - Scalability notes
  - Migration path if needed
```

---

## Budget for Consultations

### Per Value Slice:

- ARCHITECT: 2-3 consultations
- DEVELOPER: 1-2 per complex component
- TESTBUILDER: 1 for test strategy

### Red Flags (Too Many Consultations):

- 5+ consultations for one component → Complexity too high
- Same question repeatedly → Missing documentation
- Every decision needs expert → Architecture unclear

---

## Integration with Session State

Add consultation tracking:

```json
"consultations": [
  {
    "task": "T-008",
    "agent": "ARCHITECT",
    "specialist": "REACT-EXPERT",
    "topic": "Server vs Client components",
    "decision": "Server with client wrapper",
    "timestamp": "2025-08-05T10:30:00Z"
  }
]
```

---

## Value of Proactive Consultation

### Without Consultation:

1. ARCHITECT makes decision
2. DEVELOPER implements
3. BUG ANALYST finds issues
4. Back to ARCHITECT
5. Rework required
   **Time: 60-90 minutes**

### With Consultation:

1. ARCHITECT consults expert
2. Makes informed decision
3. DEVELOPER implements successfully
4. No rework needed
   **Time: 35-40 minutes**

**ROI: 5 minutes of consultation saves 50 minutes of rework**
