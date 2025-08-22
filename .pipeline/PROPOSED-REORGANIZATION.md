# Proposed Pipeline Reorganization

## Current Problems
- PRDs scattered across folders
- Versions mixed with outputs
- No clear iteration tracking
- Hard to find "what's current"

## Proposed Structure

```
.pipeline/
├── 00-factory-core/                    # Factory-wide resources
│   ├── README.md                       # Factory overview
│   ├── PRINCIPLES.md                   # Core factory principles
│   ├── GLOSSARY.md                     # Terms and definitions
│   └── SDLC/                          # Our SDLC process
│       ├── PROCESS.md
│       ├── LEARNINGS.md
│       └── RETROSPECTIVES.md
│
├── 01-configuration/                   # Line 1: Configuration
│   ├── LINE-PRD.md                    # Configuration Line PRD
│   ├── tools/
│   │   ├── viewforge/
│   │   │   ├── PRD.md                 # ViewForge PRD
│   │   │   ├── current/               # Current version (v3)
│   │   │   │   ├── index.html
│   │   │   │   └── js/
│   │   │   ├── versions/              # Previous versions
│   │   │   │   ├── v1/
│   │   │   │   └── v2/
│   │   │   └── iterations/            # Sprint outputs
│   │   │       ├── sprint-1/
│   │   │       │   ├── config.json    # What we configured
│   │   │       │   └── LEARNINGS.md
│   │   │       └── sprint-2/
│   │   └── [other-config-tools]/
│   └── outputs/                       # All configuration outputs
│       └── sprint-1/
│           └── account-list.json
│
├── 02-concept/                         # Line 2: Concept (B&W HTML)
│   ├── LINE-PRD.md                    # Concept Line PRD
│   ├── PRINCIPLES.md                  # B&W only, etc.
│   ├── generators/
│   │   ├── html-generator/
│   │   │   ├── PRD.md
│   │   │   ├── current/               # Current generator
│   │   │   │   ├── index.js
│   │   │   │   └── generators/
│   │   │   └── versions/
│   │   └── [other-generators]/
│   └── outputs/                       # All HTML outputs
│       └── sprint-1/
│           └── account-list.html
│
├── 03-prototype/                       # Line 3: Prototype (React)
│   ├── LINE-PRD.md                    # Prototype Line PRD
│   ├── PRINCIPLES.md                  # "Real enough for feedback"
│   ├── generators/
│   │   ├── react-generator/
│   │   │   ├── PRD.md
│   │   │   ├── current/
│   │   │   └── versions/
│   │   └── [other-generators]/
│   └── outputs/                       # All React outputs
│       └── sprint-1/
│           └── account-list/
│               ├── components/
│               ├── types/
│               └── data/
│
├── 04-production/                      # Line 4: Production (Future)
│   ├── LINE-PRD.md
│   └── [TBD]/
│
├── iterations/                         # Cross-line iterations
│   ├── sprint-1/
│   │   ├── PLAN.md                   # What we planned
│   │   ├── ACTUAL.md                 # What we built
│   │   ├── METRICS.md                # Time, complexity, etc.
│   │   └── HANDOFF.md                # Ready for next sprint
│   └── sprint-2/
│
└── archive/                           # Old stuff we might need
    ├── experiments/
    ├── deprecated/
    └── reference/
```

## Alternative (Simpler) Structure

```
.pipeline/
├── factory-docs/                      # All documentation
│   ├── OVERVIEW.md
│   ├── prds/                         # All PRDs in one place
│   │   ├── viewforge.md
│   │   ├── concept-generator.md
│   │   └── prototype-generator.md
│   └── learnings/                    # All learnings
│
├── line-1-config/                    # Configuration Line
│   ├── viewforge/                    # Current tool
│   └── outputs/                      # JSON configs
│
├── line-2-concept/                   # Concept Line
│   ├── generator/                    # Current generator
│   └── outputs/                      # HTML files
│
├── line-3-prototype/                 # Prototype Line
│   ├── generator/                    # Current generator
│   └── outputs/                      # React components
│
└── sprints/                          # Iteration tracking
    ├── sprint-1/
    │   ├── README.md                # What happened
    │   └── artifacts/               # Links to outputs
    └── sprint-2/
```

## My Recommendation

I prefer the **Alternative (Simpler) Structure** because:

1. **Intuitive** - You immediately know what each line does
2. **Flat** - Fewer nested folders to navigate
3. **Clear separation** - Docs vs Tools vs Outputs
4. **Easy to find current** - No versions folder, just archive old stuff
5. **Sprint tracking** - Central place to see iteration progress

## Questions for You

1. Do you prefer deep organization or flatter structure?
2. Should PRDs live with their tools or centrally?
3. How important is version tracking vs just "current"?
4. Should outputs be organized by sprint or by tool?
5. Do we need a separate Production line folder yet?

What do you think? Any modifications to suggest?