# Current Agents and Processors Inventory

**Generated**: August 16, 2025  
**Updated**: August 16, 2025 - Post-consolidation
**Purpose**: Master reference for current agent and processor versions in the software factory
**Status**: ✅ CONSOLIDATED - Single source of truth established

---

## 📊 Summary

All agents and processors have been consolidated to `.sdlc\01-core\A-agents\` as the single source of truth. Duplicates have been removed from experimental location.

---

## 🤖 AGENTS (Smart Decision Makers)

### Core Pipeline Agents

| Agent             | Current Version     | Location                                | Purpose                                                    |
| ----------------- | ------------------- | --------------------------------------- | ---------------------------------------------------------- |
| **STORY-BUILDER** | v2.1                | `01-core/A-agents/story-builder-v21.md` | Transforms features into user stories with technical specs |
| **PLANNER**       | v5.2                | `01-core/A-agents/planner-agent.md`     | Decomposes stories into tasks and value slices             |
| **ARCHITECT**     | v5.0 (labeled v4.0) | `01-core/A-agents/architect-agent.md`   | Creates technical architecture from tasks                  |
| **DEVELOPER**     | v4.3                | `01-core/A-agents/developer.md`         | Implements business logic with integration focus           |
| **DEVOPS**        | v6.0                | `01-core/A-agents/devops-agent.md`      | Adaptive orchestrator for pipeline execution               |
| **TESTER**        | v3.0                | `01-core/A-agents/tester-agent.md`      | Quality assurance and test generation                      |
| **TESTBUILDER**   | v1.0                | `01-core/A-agents/testbuilder-agent.md` | Test expansion specialist                                  |

### Supporting Agents

| Agent                   | Current Version | Location                                                     | Purpose                                  |
| ----------------------- | --------------- | ------------------------------------------------------------ | ---------------------------------------- |
| **SPECIALIST-SELECTOR** | v1.0            | `01-core/A-agents/specialists/specialist-selector-prompt.md` | Selects appropriate specialist agents    |
| **DR-TYPESCRIPT**       | v1.0            | `01-core/B-experts/dr-typescript-agent-v1.md`                | TypeScript expertise and troubleshooting |

### Archived/Superseded Agents

- ARCHITECT v2, v3 (superseded by v5)
- DEVELOPER v2, v3, v4, v4.1, v4.2 (superseded by v4.3)
- PLANNER v4 (superseded by v5.2)
- STORY-BUILDER v1.0, v2.0 (superseded by v2.1)
- REVIEWER v2, v3 (deprecated)
- BUGANALYST v1 (deprecated)

---

## ⚙️ PROCESSORS (Deterministic Code Generators)

### Current Active Processors

| Processor                  | Version | Location                                                | Purpose                               |
| -------------------------- | ------- | ------------------------------------------------------- | ------------------------------------- |
| **TYPE-PROCESSOR**         | v1.0    | `01-core/A-agents/processors/type-processor.md`         | Generates TypeScript type definitions |
| **SCAFFOLD-PROCESSOR**     | v1.0    | `01-core/A-agents/processors/scaffold-processor.md`     | Creates component shells/structure    |
| **REACT-PROCESSOR**        | v1.0    | `01-core/A-agents/processors/react-processor.md`        | Adds React logic to scaffolds         |
| **HOOK-PROCESSOR**         | v1.0    | `01-core/A-agents/processors/hook-processor.md`         | Generates custom React hooks          |
| **MODIFY-PROCESSOR**       | v1.0    | `01-core/A-agents/processors/modify-processor.md`       | Modifies existing files               |
| **REACT-TEST-PROCESSOR**   | v1.0    | `01-core/A-agents/processors/react-test-processor.md`   | Generates React component tests       |
| **PROCESSOR-SELECTOR**     | v2.0    | `01-core/A-agents/processors/processor-selector.md`     | Selects and orders processors         |
| **INVOCATION-GENERATOR**   | v1.0    | `01-core/A-agents/processors/invocation-generator.md`   | Generates processor invocations       |
| **INTEGRATION-SPECIALIST** | v1.0    | `01-core/A-agents/processors/integration-specialist.md` | Handles integration tasks             |
| **PROCESSOR_VALIDATION**   | v1.0    | `01-core/A-agents/processors/PROCESSOR_VALIDATION.md`   | Validates processor outputs           |

### Test Twin Processors

All test twins are v1.0 and located in:

- `01-core/A-agents/processors/test-twins/`

Test twins exist for:

- API-PROCESSOR-TEST
- HOOK-PROCESSOR-TEST
- MODIFY-PROCESSOR-TEST
- REACT-PROCESSOR-TEST
- SCAFFOLD-PROCESSOR-TEST
- TYPE-PROCESSOR-TEST

---

## 🔄 Pipeline Flow Order

According to the SDLC Pipeline Definition:

1. **STORY-BUILDER v2.1** → Creates user story
2. **PLANNER v5.2** → Creates tasks and value slices
3. **ARCHITECT v5** → Creates architecture (if needed)
4. **PROCESSOR-SELECTOR v2.0** → Selects processors
5. **Processors Execute** (typical order):
   - TYPE-PROCESSOR v1.0
   - SCAFFOLD-PROCESSOR v1.0
   - REACT-PROCESSOR v1.0
   - HOOK-PROCESSOR v1.0 (if needed)
   - MODIFY-PROCESSOR v1.0 (for integration)
   - REACT-TEST-PROCESSOR v1.0
6. **DEVELOPER v4.3** → Implements business logic
7. **TESTER v3.0** → Quality assurance
8. **DEVOPS v6.0** → Orchestrates deployment

---

## ⚠️ Important Notes

### Consolidation Complete ✅

All processors and agents have been consolidated to a single location:

- `.sdlc/01-core/A-agents/` (processors in processors/ subdirectory)
- Duplicates removed from `.sdlc/12-sdlc-design/sdlc-experimental/08-factory/`
- Older versions archived to `.sdlc/09-archive/agents/`

### Version Consistency

All processors are at v1.0, suggesting they are stable and haven't needed updates since initial creation.

### Agent Evolution

Agents show more evolution (multiple versions) than processors:

- DEVELOPER evolved through 5 versions (v2 → v4.3)
- PLANNER evolved from v4 → v5.2
- STORY-BUILDER evolved from v1.0 → v2.1
- DEVOPS reached v6.0

This suggests agents handle more complex, evolving requirements while processors remain stable.

---

## 🎯 Key Capabilities

### What We Can Generate Automatically:

- TypeScript types from business models
- Component scaffolds with proper structure
- React logic and state management
- Custom hooks for data fetching
- Test files for components
- Integration modifications

### What Still Requires Manual Work:

- Complex business logic implementation
- API endpoint creation
- Database migrations
- Authentication/authorization logic
- Performance optimizations
- Production deployment configuration

---

## 📂 File Organization (IMPLEMENTED)

Current structure after consolidation:

```
.sdlc/
├── 01-core/
│   └── A-agents/         # All current agent and processor definitions
│       ├── *.md          # Agent definitions
│       └── processors/   # All current processor definitions
└── 09-archive/          # All superseded versions
    └── agents/
        └── story-builder-versions/  # Archived story-builder versions
```

✅ Duplication eliminated
✅ Clear current vs. archived distinction established

---

## 🔍 Next Steps

1. ~~**Consolidate Duplicates**: Remove duplicate processor definitions~~ ✅ COMPLETE
2. **Version Tagging**: Consider adding Git tags for agent/processor versions
3. ~~**Documentation Update**: Update all references to point to single source of truth~~ ✅ COMPLETE
4. **Validation Suite**: Create tests to ensure processor outputs remain consistent

---

_This inventory represents the current state of the software factory's agent and processor ecosystem._
