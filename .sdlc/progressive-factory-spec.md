# Progressive Factory Specification - Unified Approach

**Version**: 1.0  
**Date**: August 2025  
**Authors**: Human + Claude + CC (Convergent Discovery)

---

## 🧬 Core Principle: Software Sedimentation

Software naturally evolves through progressive refinement stages with inherited improvements. Each phase enhances rather than replaces, creating layers of functionality like geological strata.

> "Standards aren't barriers - they're guardrails that widen as you gain speed."

---

## 📊 The Three-Line Factory Model

### Line Structure

```
CONCEPT LINE     → Fast validation, loose standards
PROTOTYPE LINE   → Prove it works, medium standards
PRODUCTION LINE  → Ship with confidence, strict standards
```

### Progressive Inheritance

```yaml
concept: base_configuration

prototype:
  extends: concept
  adds: real_connections

production:
  extends: prototype
  adds: enterprise_features
```

---

## 🎯 Implementation Structure

### Directory Layout

```
.pipeline/
├── concept/            # NO RULES - Creative exploration
│   └── US-XXX/
│       ├── mocks/
│       ├── workflows/
│       └── validation/
├── prototype/          # SOME RULES - Technical feasibility
│   └── US-XXX/
│       ├── extends: ../concept/US-XXX/
│       ├── real-code/
│       └── integration/
├── production/         # ALL RULES - Enterprise ready
│   └── US-XXX/
│       ├── extends: ../prototype/US-XXX/
│       ├── hardened/
│       └── monitoring/
└── graduated/          # Final shipped versions
    └── US-XXX/

src/
├── concept/           # Allows any, console.log OK
├── prototype/         # TypeScript strict, basic testing
├── production/        # Full standards, 80% coverage
└── lib/              # Graduated, production code
```

### Standards Configuration

```yaml
# factory-standards.yaml
standards:
  concept:
    typescript:
      strict: false
      noImplicitAny: false
      allows_any: true
    testing:
      required: false
      smoke_tests_only: true
    components:
      patterns: ['functional', 'mock-data']
    validation:
      level: 'ui-only'

  prototype:
    extends: concept
    typescript:
      strict: true
      noImplicitAny: true
    testing:
      required: true
      coverage:
        statements: 60
        branches: 50
    security:
      authentication: required
      basic_authorization: true
    api:
      pattern: rest
      validation: zod

  production:
    extends: prototype
    typescript:
      noImplicitReturns: true
      noUncheckedIndexedAccess: true
    testing:
      coverage:
        statements: 80
        branches: 75
        critical_paths: 95
    security:
      owasp_top_10: enforced
      rls: multi-tenant
      mfa: available
    performance:
      lighthouse: 90
      monitoring: full
```

---

## 🤖 Line-Aware Agent System

### Single Agents with Progressive Behavior

```yaml
# agent-line-config.yaml
agents:
  STORY-BUILDER:
    version: 3.0
    line_behaviors:
      concept:
        focus: 'Business workflow and UX validation'
        skip: ['Technical specs', 'API contracts']
        output: 'Simplified stories with mock requirements'

      prototype:
        focus: 'Technical feasibility and integration'
        include: ['Basic API contracts', 'Simple schemas']
        output: 'Technical stories with single-tenant scope'

      production:
        focus: 'Complete implementation with edge cases'
        include: ['Full specs', 'Security', 'Performance']
        output: 'Production-ready stories with multi-tenant'

  ARCHITECT:
    version: 5.0
    line_behaviors:
      concept:
        skip: true # No architecture for mocks

      prototype:
        focus: 'Basic component structure'
        include: ['Component hierarchy', 'State management']

      production:
        focus: 'Enterprise architecture'
        include: ['Scalability', 'Caching', 'Error boundaries']
```

### Progressive Processor Chain

```yaml
# processor-line-config.yaml
processors:
  TYPE-PROCESSOR:
    version: 2.0
    modes:
      concept:
        command: 'type-processor --mode=concept'
        allows_any: true
        output: 'basic.types.ts'

      prototype:
        command: 'type-processor --mode=prototype'
        input: 'basic.types.ts' # Builds on concept!
        allows_any: false
        output: 'strict.types.ts'

      production:
        command: 'type-processor --mode=production'
        input: 'strict.types.ts' # Builds on prototype!
        includes: ['branded-types', 'runtime-guards']
        output: ['branded.types.ts', 'schemas.ts']
```

---

## 🔄 The Wrapper Pattern

Each line wraps and enhances the previous:

```typescript
// Concept Line - Just make it work
export const getLocations = () => MOCK_DATA

// Prototype Line - Make it real (wraps concept)
export const getLocations = async (accountId: string) => {
  if (FEATURE_FLAG.useReal) {
    return await supabase.from('locations').select()
  }
  return conceptGetLocations() // Falls back to mock!
}

// Production Line - Make it bulletproof (wraps prototype)
export const getLocations = withErrorBoundary(
  withCache(
    withMetrics(
      withRateLimiting(
        prototypeGetLocations // Still has mock fallback!
      )
    )
  )
)
```

---

## 📋 Line Progression Criteria

### Concept → Prototype Gate

```markdown
- [ ] Business stakeholder approval received
- [ ] UX flow validated with users
- [ ] Mock data structure defined
- [ ] No blocking questions remain
- [ ] Basic happy path demonstrated
```

### Prototype → Production Gate

```markdown
- [ ] All integrations tested
- [ ] Error handling complete
- [ ] 60% test coverage achieved
- [ ] Single-tenant functionality verified
- [ ] Performance acceptable for demo
```

### Production → Graduation Gate

```markdown
- [ ] 80% test coverage (95% critical paths)
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Multi-tenant isolation verified
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Load testing passed
```

---

## 🚀 Execution Commands

### Line-Specific Execution

```bash
# Execute with line context
npm run pipeline:concept US-001     # Generates mocks only
npm run pipeline:prototype US-001   # Transforms to real components
npm run pipeline:production US-001  # Adds all production features

# Agents automatically adapt
@story-builder create-story --line=concept
@architect design US-001 --line=prototype
@processor manifest US-001 --line=production

# Check line readiness
npm run line:check US-001 --target=prototype
npm run line:promote US-001 --to=production
```

### Progressive Linting

```javascript
// .eslintrc.progressive.js
module.exports = {
  overrides: [
    {
      files: ['**/concept/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['**/prototype/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': 'warn',
      },
    },
    {
      files: ['**/production/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        'no-console': 'error',
        '@typescript-eslint/strict': 'error',
      },
    },
  ],
}
```

---

## 🎯 Key Benefits

1. **No Rework**: Each line enhances rather than replaces
2. **Fail Fast**: Catch problems at the cheapest point
3. **Clear Progress**: Standards violations = wrong line
4. **Learning System**: Templates improve from patterns
5. **Flexible Pace**: Features move at their own speed
6. **Natural Evolution**: Software develops as it wants to

---

## 📊 Success Metrics

- **Rework Reduction**: Target 50% less code thrown away
- **Early Validation**: 80% of requirement issues caught in Concept
- **Clean Promotion**: 90% of features promote without rollback
- **Clear Status**: Always know exactly where each feature stands
- **Integration Speed**: Downstream teams get mocks on day 1

---

## 🔮 Future Evolution

As patterns emerge, the system learns:

1. **Production discovers**: Common patterns (e.g., all modals need error boundaries)
2. **Template updated**: Prototype templates include the pattern
3. **Concept simplified**: Even concept mocks get basic version
4. **Result**: Pattern built-in from the start, not added later

The factory becomes smarter over time, incorporating learned patterns into earlier stages.

---

_"Software naturally wants to evolve through progressive refinement. We're not imposing a process - we're following the natural law of complex system development."_
