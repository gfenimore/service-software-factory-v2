# Pipeline Reorganization - Visual Examples

## Option 1: Detailed Structure (Deep Organization)

```
.pipeline/
├── 00-factory-core/
│   ├── README.md                          "Welcome to the 3-Line Factory"
│   ├── PRINCIPLES.md                      "Configuration-driven, 80/20 rule..."
│   ├── GLOSSARY.md                        "BUSM = Business Model, JTBD = Jobs-to-be-Done..."
│   └── SDLC/
│       ├── PROCESS.md                     "How we work: Plan → Build → Learn"
│       ├── LEARNINGS.md                   "Throw away bad code, Preview is mandatory..."
│       └── RETROSPECTIVES.md              "Sprint 1: 3 hours total, ViewForge v2→v3..."
│
├── 01-configuration/
│   ├── LINE-PRD.md                        "Configuration Line: Visual tools for factory input"
│   ├── tools/
│   │   ├── viewforge/
│   │   │   ├── PRD.md                     "ViewForge 2.0 PRD - Conditions, Impacts, Solution"
│   │   │   ├── current/                   
│   │   │   │   ├── index.html             [ViewForge v3 app]
│   │   │   │   ├── js/
│   │   │   │   │   └── v3-app.js         [Current working code]
│   │   │   │   └── package.json
│   │   │   ├── versions/
│   │   │   │   ├── v1/                    [First attempt - basic]
│   │   │   │   └── v2/                    [Second attempt - thrown away]
│   │   │   └── iterations/
│   │   │       ├── sprint-1/
│   │   │       │   ├── config.json        [Account List configuration]
│   │   │       │   ├── LEARNINGS.md       "v2 didn't work, rebuilt as v3"
│   │   │       │   └── METRICS.md         "2 hours, 3 stories completed"
│   │   │       └── sprint-2/              [Future]
│   │   └── json-editor/                   [Future tool]
│   └── outputs/
│       └── sprint-1/
│           ├── account-list.json          [Your actual configuration with locationName]
│           └── service-location.json      [Future]
│
├── 02-concept/
│   ├── LINE-PRD.md                        "Concept Line: B&W HTML validation"
│   ├── PRINCIPLES.md                      "If it doesn't work in B&W, colors won't save it"
│   ├── generators/
│   │   ├── html-generator/
│   │   │   ├── PRD.md                     "Concept Generator PRD"
│   │   │   ├── current/
│   │   │   │   ├── index.js               [Main generator]
│   │   │   │   ├── parser.js
│   │   │   │   ├── validator.js
│   │   │   │   ├── sample-data.js
│   │   │   │   ├── generators/
│   │   │   │   │   ├── table.js
│   │   │   │   │   ├── list.js
│   │   │   │   │   └── detail.js
│   │   │   │   └── package.json
│   │   │   └── versions/
│   │   │       └── v1/                    [Current is v1]
│   │   └── pdf-generator/                 [Future]
│   └── outputs/
│       └── sprint-1/
│           ├── account-list.html          [B&W table with 5 rows]
│           └── account-list-debug.html    [With metadata]
│
├── 03-prototype/
│   ├── LINE-PRD.md                        "Prototype Line: Make it real enough for feedback"
│   ├── PRINCIPLES.md                      "React + Tailwind, not production-ready"
│   ├── generators/
│   │   ├── react-generator/
│   │   │   ├── PRD.md
│   │   │   ├── current/
│   │   │   │   ├── index.js
│   │   │   │   ├── generators/
│   │   │   │   │   ├── table-view.js     [React table generator]
│   │   │   │   │   ├── types.js          [TypeScript generator]
│   │   │   │   │   └── mock-data.js      [Sample data generator]
│   │   │   │   └── package.json
│   │   │   └── versions/
│   │   └── vue-generator/                 [Alternative framework]
│   └── outputs/
│       └── sprint-1/
│           └── account-list/
│               ├── components/
│               │   └── AccountListView.tsx
│               ├── types/
│               │   └── AccountListTypes.ts
│               └── data/
│                   └── AccountListMockData.ts
│
├── iterations/
│   ├── sprint-1/
│   │   ├── PLAN.md                        "Spike: Single story through all lines"
│   │   ├── ACTUAL.md                      "Completed: ViewForge v3, Concept, Prototype"
│   │   ├── METRICS.md                     "3 hours total, 3 tools built"
│   │   └── HANDOFF.md                     "Ready for Sprint 2: Add more view types"
│   └── sprint-2/
│       └── PLAN.md                        "Add detail and list views"
│
└── archive/
    ├── viewforge-v2/                      [The one we threw away]
    ├── old-manifests/
    └── experiments/
```

---

## Option 2: Simpler Structure (Flat & Intuitive)

```
.pipeline/
├── factory-docs/
│   ├── OVERVIEW.md                        "3-Line Progressive Factory"
│   ├── PRINCIPLES.md                      "Configuration-driven development"
│   ├── prds/
│   │   ├── 00-factory-vision.md          "Overall factory concept"
│   │   ├── 01-viewforge.md               "ViewForge PRD with conditions/impacts"
│   │   ├── 02-concept-generator.md       "Concept Line Generator PRD"
│   │   └── 03-prototype-generator.md     "Prototype Line Generator PRD"
│   └── learnings/
│       ├── sprint-1-learnings.md         "Throw away v2, JTBD > User Stories..."
│       ├── viewforge-learnings.md        "Preview mandatory, related fields critical"
│       └── generator-learnings.md        "Context-aware sample data"
│
├── line-1-config/
│   ├── README.md                          "Configuration Line - Start here"
│   ├── viewforge/
│   │   ├── index.html                     [ViewForge v3 - current]
│   │   ├── js/
│   │   │   ├── v3-app.js
│   │   │   └── busm-registry.js
│   │   └── package.json
│   └── outputs/
│       ├── account-list.json             [Your config with locationName]
│       └── work-order-list.json          [Future]
│
├── line-2-concept/
│   ├── README.md                          "Concept Line - B&W validation"
│   ├── generator/
│   │   ├── index.js                       [Main entry]
│   │   ├── parser.js
│   │   ├── validator.js
│   │   ├── sample-data.js
│   │   ├── generators/
│   │   │   ├── table.js
│   │   │   ├── list.js
│   │   │   └── detail.js
│   │   ├── test-fixtures/
│   │   │   └── account-list-config.json
│   │   └── package.json
│   └── outputs/
│       └── account-list.html             [B&W HTML table]
│
├── line-3-prototype/
│   ├── README.md                          "Prototype Line - Interactive React"
│   ├── generator/
│   │   ├── index.js
│   │   ├── parser.js
│   │   ├── generators/
│   │   │   ├── table-view.js
│   │   │   ├── types.js
│   │   │   └── mock-data.js
│   │   └── package.json
│   └── outputs/
│       └── account-list/
│           ├── index.tsx
│           ├── components/
│           │   └── AccountListView.tsx
│           ├── types/
│           │   └── AccountListTypes.ts
│           └── data/
│               └── AccountListMockData.ts
│
├── sprints/
│   ├── sprint-1/
│   │   ├── README.md                      "What we built in Sprint 1"
│   │   ├── METRICS.md                     "Time: 3 hours, Complexity: 7"
│   │   └── artifacts.md                   "Links to all outputs"
│   └── sprint-2/
│       └── PLAN.md                        "Next: Detail views, filters"
│
└── archive/
    ├── viewforge-v2/                      [Thrown away but kept for reference]
    └── old-docs/
```

---

## Key Differences

### Option 1 (Detailed)
✅ **Pros:**
- Clear version tracking (v1, v2, v3)
- Iterations tracked per tool
- Deep organization for scaling
- Separate core factory resources

❌ **Cons:**
- Many nested folders
- PRDs scattered across structure
- Harder to find "current" items
- More complex to navigate

### Option 2 (Simpler)
✅ **Pros:**
- Immediately intuitive (line-1, line-2, line-3)
- All PRDs in one place
- Current tools at top level
- Flat structure = easy navigation

❌ **Cons:**
- Less version tracking built-in
- May need reorganization as it grows
- Less formal separation

## My Analysis

**For our current needs**, Option 2 (Simpler) seems better because:
- We're still early (Sprint 1)
- We value speed and clarity
- We can always add structure later
- Finding files quickly matters most

What do you think? See a third option?