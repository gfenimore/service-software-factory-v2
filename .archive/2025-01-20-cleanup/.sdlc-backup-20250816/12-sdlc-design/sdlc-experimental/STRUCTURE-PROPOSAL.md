# Proposed SDLC Structure for Factory Development

## Problem

Current structure doesn't align with SDLC phases, making it hard to:

1. Track artifacts through the lifecycle
2. Know where to put feature docs, specs, as-builts
3. Follow our methodical US-006 journey

## Proposed Structure

```
sdlc-experimental/
├── 00-vision/                    # Factory vision & strategy
│   ├── software-factory-vision.md
│   └── sdlc-methodology.md
│
├── 01-planning/                  # Requirements & Features
│   ├── features/                 # Feature documents
│   │   └── master-view-v2.md
│   ├── user-stories/            # Generated from features
│   │   └── US-006-service-locations.md
│   └── processors/              # Feature→Story generators
│       └── story-generator.md
│
├── 02-design/                    # Technical Design
│   ├── as-builts/               # What we actually built
│   ├── diagrams/                # Architecture diagrams
│   ├── specs/                   # Technical specifications
│   └── processors/              # Design generators
│
├── 03-development/              # Code Generation
│   ├── components/              # Generated components
│   ├── apis/                    # Generated APIs
│   ├── types/                   # Generated types
│   └── processors/              # Code generators
│       ├── busm-to-schema.md
│       ├── schema-to-types.md
│       └── types-to-components.md
│
├── 04-testing/                  # Test Generation
│   ├── test-plans/             # Test strategies
│   ├── test-cases/             # Generated tests
│   └── processors/             # Test generators
│
├── 05-deployment/              # Deployment Artifacts
│   ├── configs/                # Deployment configs
│   └── processors/             # Deployment automation
│
├── 06-operations/              # Running System
│   ├── retrospectives/         # Learning from operations
│   ├── metrics/                # Performance data
│   └── incidents/              # Issues and resolutions
│
├── 07-patterns/                # Reusable Templates
│   ├── ui-patterns/            # Master-Detail-Detail, etc.
│   ├── api-patterns/           # CRUD, pagination, etc.
│   └── test-patterns/          # Common test scenarios
│
├── 08-factory/                 # The Factory Itself
│   ├── agents/                 # Smart agents
│   │   └── story-builder.md
│   ├── processors/             # Simple processors
│   └── pipelines/              # Processor chains
│
└── 09-archive/                 # Historical artifacts
    └── experiments/            # Failed experiments (learning)
```

## Benefits of This Structure

1. **Follows SDLC Flow**: Planning → Design → Development → Testing → Deployment → Operations
2. **Clear Artifact Placement**: Know exactly where each document belongs
3. **Processor Co-location**: Each phase has its own processors
4. **Factory Separation**: Factory tools (08) separate from SDLC artifacts (01-06)
5. **Pattern Library**: Reusable patterns isolated in 07
6. **Learning Capture**: Operations/retrospectives feed back to planning

## Migration Path

1. Create new structure alongside current
2. Move artifacts to correct locations
3. Update references
4. Delete old structure

## For US-006 Journey

With this structure, our US-006 path is clear:

1. Start in 01-planning with feature doc
2. Generate story in 01-planning/user-stories
3. Create design in 02-design/specs
4. Generate code in 03-development
5. Generate tests in 04-testing
6. Deploy via 05-deployment
7. Retrospect in 06-operations
8. Extract patterns to 07-patterns
9. Build processors in 08-factory

Each step has a clear home!
