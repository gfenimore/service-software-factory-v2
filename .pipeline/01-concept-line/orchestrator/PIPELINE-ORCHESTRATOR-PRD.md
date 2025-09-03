# Product Requirements Document (PRD)
## Concept Line Pipeline Orchestrator

### Document Information
- **Version**: 1.0.0
- **Date**: 2025-08-25
- **Author**: Pipeline Team
- **Status**: Implemented

## 1. Executive Summary

### Product Overview
The Pipeline Orchestrator is an automated execution engine that coordinates the complete Concept Line process from Stage 1 (Requirements) through Stage 6 (Deployment), transforming BUSM diagrams and feature specifications into clickable POCs.

### Problem Statement
Manual execution of pipeline stages is error-prone, time-consuming, and requires deep knowledge of each tool's interface. Stakeholders need rapid POC generation (< 30 minutes) with consistent quality.

### Solution
An orchestration engine that automatically sequences all pipeline stages, manages artifacts between stages, validates outputs, and produces deployment-ready POCs with full traceability.

## 2. Objectives & Goals

### Primary Objectives
1. Automate end-to-end Concept Line execution
2. Ensure artifact consistency between stages
3. Generate POCs in < 30 minutes
4. Provide complete execution transparency

### Success Metrics
- Execution time < 30 minutes
- Zero manual intervention required
- Quality score > 80%
- 100% artifact traceability

## 3. Functional Requirements

### Core Features

#### F1: Stage Management
- **F1.1**: Sequential execution of Stages 1-6
- **F1.2**: Artifact passing between stages
- **F1.3**: Stage failure handling
- **F1.4**: Progress reporting

#### F2: Stage 1 - Requirements Capture (Service Software Factory Template-Based)
- **F2.1**: Scope Definition via UI Form (Service Type + Client + Module)
- **F2.2**: Entity Selection from BUSM.mmd (Direct selection vs extraction)
- **F2.3**: Component Auto-Generation (3-column Master View template)
- **F2.4**: Business Rules Auto-Generation (3-layer inheritance: Base → Service → Client)
- **F2.5**: Template Management (Save/Load configurations for reuse)

#### F3: Stage 2 - Configuration
- **F3.1**: Enrich requirements with metadata
- **F3.2**: Map entities to components
- **F3.3**: Identify integration points
- **F3.4**: Log gaps

#### F4: Stage 3 - ViewForge
- **F4.1**: Transform to three-column layout
- **F4.2**: Generate component templates
- **F4.3**: Apply business indicators
- **F4.4**: Create ViewForge spec

#### F5: Stage 4 - AST Generation
- **F5.1**: Generate abstract syntax trees
- **F5.2**: Validate syntax
- **F5.3**: Extract indicators
- **F5.4**: Ensure correctness

#### F6: Stage 5 - Validation
- **F6.1**: Run quality checks
- **F6.2**: Calculate quality score
- **F6.3**: Identify gaps
- **F6.4**: Generate validation report

#### F7: Stage 6 - Deployment
- **F7.1**: Deploy to app shell
- **F7.2**: Create manifest
- **F7.3**: Configure routes
- **F7.4**: Prepare handoff

### User Stories

**US1**: As a product owner, I want to generate a POC from my requirements in < 30 minutes
- **Acceptance**: POC accessible at localhost:3000

**US2**: As a developer, I want to see all transformation artifacts
- **Acceptance**: All stage outputs preserved

**US3**: As a stakeholder, I want to review business indicators in the UI
- **Acceptance**: Indicators visible and counted

## 4. Technical Requirements

### Architecture
```javascript
class ConceptLinePipeline {
  stages = {
    1: stage1_requirements(),
    2: stage2_configuration(),
    3: stage3_viewforge(),
    4: stage4_ast(),
    5: stage5_validation(),
    6: stage6_deployment()
  }
  
  artifacts = {
    requirements: {},
    configuration: {},
    viewforge: {},
    ast: {},
    validation: {},
    manifest: {}
  }
}
```

### Input Requirements (Service Software Factory Template-Based)
1. BUSM diagram: `{configurable}/00-requirements/models/BUSM.mmd` (Single source of truth for entities)
2. Service/Client scope: Via UI form (Service Type + Client Name + Module Selection)
3. Entity selection: Direct selection from BUSM entities (no document parsing)
4. Templates: Saveable/loadable configuration templates per service type
5. Business rules: Auto-generated from BUSM + 3-layer inheritance (Base → Service → Client)

### Output Artifacts (Template-Based)
```
{configurable}/01-concept-line/outputs/
├── stage1/
│   ├── scope-definition.json          # Service/Client/Module configuration
│   ├── selected-entities.json         # Entity selection from BUSM
│   ├── component-specifications.json  # 3-column layout component specs
│   ├── business-rules.json           # Auto-generated 3-layer rules
│   └── template-config.json          # Saveable template configuration
├── stage2/
│   └── enriched-config.json
├── stage3/
│   ├── viewforge-spec.json
│   └── *.jsx components
├── stage4/
│   └── *.ast.json
├── stage5/
│   └── validation-report.json
└── stage6/
    └── deployment-manifest.json
```

## 5. Non-Functional Requirements

### Performance
- **NFR1**: Complete execution < 30 minutes
- **NFR2**: Stage execution logged in real-time
- **NFR3**: Memory usage < 512MB

### Reliability
- **NFR4**: Graceful failure handling
- **NFR5**: Artifact preservation on failure
- **NFR6**: Resumable execution

### Maintainability
- **NFR7**: Modular stage handlers
- **NFR8**: Clear logging
- **NFR9**: Extensible architecture

## 6. Data Flow

### Stage Flow Diagram (Service Software Factory Template-Based)
```
UI Form (Service + Client + Module) + BUSM.mmd + Template (optional)
        ↓
   [Stage 1: Requirements Capture]
   ├─ Scope Definition
   ├─ Entity Selection  
   ├─ Component Auto-Generation
   ├─ Rules Auto-Generation (Base → Service → Client)
   └─ Template Save/Load
        ↓
   Selected Entities + Auto-Generated Rules + Component Specs
        ↓
   [Stage 2: Configuration]
        ↓
   Enriched Config
        ↓
   [Stage 3: ViewForge]
        ↓
   Component Templates
        ↓
   [Stage 4: AST]
        ↓
   Validated ASTs
        ↓
   [Stage 5: Validation]
        ↓
   Quality Report
        ↓
   [Stage 6: Deployment]
        ↓
   Live POC + Manifest
```

## 7. Integration Points

### Tool Dependencies
1. BUSM Reader (with Mermaid parser)
2. Business Rules Configurator
3. ViewForge transformer
4. AST Generator
5. Gap Logger
6. App Shell

### External Interfaces
- File system for artifact storage
- HTTP server for POC hosting
- Console for progress logging

## 8. Error Handling

### Stage Failures
| Stage | Failure Mode | Recovery |
|-------|-------------|----------|
| 1 | Missing BUSM | Halt execution |
| 2 | Invalid entities | Use defaults |
| 3 | Template error | Log and continue |
| 4 | Syntax error | Mark as invalid |
| 5 | Low quality | Warn but continue |
| 6 | Deploy failure | Retry once |

## 9. Logging & Monitoring

### Log Format
```
[2025-08-25T10:30:00.000Z] [INFO] Stage 1: Requirements Capture
[2025-08-25T10:30:05.000Z] [INFO] Extracted entities: Account, User
[2025-08-25T10:30:10.000Z] [INFO] Stage 1 complete: Requirements captured
```

### Metrics Tracked
- Stage execution time
- Artifact sizes
- Quality scores
- Error counts

## 10. Testing Strategy

### Unit Tests
- Individual stage handlers
- Artifact transformations
- Error handling

### Integration Tests
- Full pipeline execution
- Artifact passing
- Tool interactions

### E2E Tests
- BUSM → POC generation
- Quality validation
- Deployment verification

## 11. Implementation Status

### Completed
- [x] Core orchestration engine
- [x] All stage handlers
- [x] Artifact management
- [x] Logging system

### Pending
- [ ] Resume capability
- [ ] Parallel stage execution
- [ ] Web UI for monitoring
- [ ] Stage plugin system

## 12. Success Criteria

### Launch Criteria
- [x] Executes all 6 stages
- [x] Generates valid artifacts
- [x] Deploys to app shell
- [ ] Handles all error cases

### Performance Criteria
- [ ] < 30 minute execution
- [ ] Quality score > 80%
- [ ] Zero manual steps

## 13. API Reference

### CLI Usage
```bash
node pipeline-orchestrator.js
```

### Programmatic Usage
```javascript
const Pipeline = require('./pipeline-orchestrator');
const pipeline = new Pipeline();

pipeline.run().then(result => {
  console.log(`Success: ${result.success}`);
  console.log(`Duration: ${result.duration}s`);
  console.log(`Artifacts:`, result.artifacts);
});
```

### Configuration
```javascript
{
  baseDir: '.pipeline',
  stages: [1, 2, 3, 4, 5, 6],
  skipValidation: false,
  preserveArtifacts: true
}
```

---
*End of PRD - Pipeline Orchestrator v1.0.0*