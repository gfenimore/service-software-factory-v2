# PRD: BUSM Parser
*Service Software Factory Stage 1 - Business Model Entity Extractor*

## Problem Statement
Stage 1 requires automated extraction of entity definitions, field structures, and relationships from Mermaid BUSM diagrams to eliminate manual parsing errors and enable dynamic entity selection.

## Success Criteria
1. Parses BUSM Mermaid syntax with 100% accuracy
2. Extracts entity definitions with field counts and types
3. Filters entities based on user selection
4. Generates clean JSON output for downstream processing
5. Handles BUSM format variations gracefully

## Acceptance Criteria
1. Reads .mmd files with standard Mermaid entity-relationship syntax
2. Extracts entity names, field lists, and data types
3. Identifies relationships between entities
4. Filters entity subset based on orchestrator input
5. Outputs structured JSON with entity definitions
6. Validates Mermaid syntax and reports parsing errors
7. Supports BUSM field count calculation for UI display
8. Maintains entity relationship mapping for future stages

## Performance Metrics
- Parsing accuracy: 100% for valid Mermaid syntax
- Processing time: < 2 seconds for typical BUSM file
- Error detection rate: 100% for syntax issues

## Out of Scope
1. Mermaid diagram visual rendering
2. Interactive BUSM editing capabilities
3. Entity relationship validation
4. Dynamic BUSM generation

## Dependencies and Assumptions
1. BUSM files follow standard Mermaid entity-relationship format
2. Entity definitions include field names and basic types
3. File system read access to BUSM source files
4. Node.js environment with file parsing capabilities

---

*PRD Status: Draft*
*Created: 2025-09-01*
*Component: Stage 1 Entity Extraction*