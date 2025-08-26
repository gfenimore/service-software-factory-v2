# Pipeline Restructure Proposal: Solving the Artifact Tracking Crisis

## Executive Summary

After analyzing the entire .pipeline structure, I've identified the core problem: **output pollution and versioning chaos**. The pipeline generates copies of itself within outputs, tools are duplicated across directories, and there's no unified versioning strategy. This proposal presents a clean, scalable structure that enables proper artifact tracking, versioning, and quality assurance.

## Core Problems Identified

1. **Recursive Output Pollution**: Outputs contain nested .pipeline structures
2. **Tool Duplication**: Same tools in multiple locations
3. **Versioning Chaos**: Different schemes (stage1, v1.0.0, ITER-2025) across stages
4. **No Artifact Lifecycle**: No cleanup, archival, or retention policies
5. **Missing Dependencies**: No tracking of what depends on what
6. **Path Brittleness**: Hard-coded paths break when structure changes

## Proposed New Structure

```
.pipeline/
├── _manifest/                    # SINGLE SOURCE OF TRUTH
│   ├── pipeline.json             # Current pipeline state
│   ├── versions.json             # Version compatibility matrix
│   ├── dependencies.json         # Tool & artifact dependencies
│   └── artifacts.json            # Artifact registry & locations
│
├── _workspace/                   # ACTIVE WORKING DIRECTORY
│   ├── current/                  # Current iteration workspace
│   │   ├── config.json          # Active configuration
│   │   └── .gitignore           # Ignore working files
│   └── temp/                    # Temporary processing files
│
├── 00-inputs/                    # ALL INPUTS (versioned)
│   ├── requirements/
│   │   ├── v1/
│   │   │   ├── prds/           # PRDs for this version
│   │   │   └── models/         # BUSM models
│   │   └── current -> v1/      # Symlink to active version
│   ├── configurations/
│   │   ├── v1/
│   │   │   ├── viewforge/      # ViewForge configs
│   │   │   └── rules/          # Business rules
│   │   └── current -> v1/
│   └── test-data/
│       ├── v1/
│       └── current -> v1/
│
├── 01-tools/                     # ALL TOOLS (single location each)
│   ├── generators/
│   │   ├── ast-generator/
│   │   ├── concept-generator/
│   │   ├── prototype-generator/
│   │   └── database-generator/
│   ├── transformers/
│   │   ├── viewforge-transformer/
│   │   └── busm-reader/
│   ├── configurators/
│   │   ├── business-rules-configurator/  # SINGLE LOCATION
│   │   ├── theme-engine/
│   │   └── module-system/
│   └── utilities/
│       ├── gap-logger/
│       ├── sample-data-generator/
│       └── manifest-manager/
│
├── 02-builds/                    # VERSIONED BUILD OUTPUTS
│   ├── concept/
│   │   ├── v1.0.0/
│   │   │   ├── manifest.json   # What was built
│   │   │   ├── artifacts/      # HTML wireframes
│   │   │   └── logs/           # Build logs
│   │   ├── v1.0.1/
│   │   └── latest -> v1.0.1/   # Symlink to latest
│   ├── prototype/
│   │   ├── v2.0.0/
│   │   │   ├── manifest.json
│   │   │   ├── artifacts/      # React components
│   │   │   └── logs/
│   │   └── latest -> v2.0.0/
│   └── production/
│       ├── v3.0.0/
│       │   ├── manifest.json
│       │   ├── artifacts/      # Production build
│       │   └── logs/
│       └── latest -> v3.0.0/
│
├── 03-releases/                  # RELEASED VERSIONS
│   ├── 2025-01-25-release-1.0/
│   │   ├── release.json        # Release metadata
│   │   ├── concept/            # Snapshot from builds
│   │   ├── prototype/
│   │   └── production/
│   └── latest -> 2025-01-25-release-1.0/
│
├── 04-archive/                   # ARCHIVED ARTIFACTS
│   ├── 2025-01/                # Monthly archives
│   │   ├── builds/
│   │   └── releases/
│   └── retention-policy.json    # Auto-cleanup rules
│
├── 05-operations/                # OPERATIONAL TOOLS
│   ├── orchestrator/
│   │   ├── pipeline-orchestrator.js
│   │   └── workflows/
│   ├── control-panel/           # Web UI
│   ├── monitoring/
│   │   ├── gap-reports/
│   │   └── quality-metrics/
│   └── automation/
│       ├── auto-commit.sh
│       └── cleanup.sh           # Archive old artifacts
│
└── pipeline.config.json          # PIPELINE CONFIGURATION
```

## Key Design Principles

### 1. Single Source of Truth (`_manifest/`)
```json
// _manifest/pipeline.json
{
  "version": "2.0.0",
  "current_iteration": "ITER-2025-01-25-001",
  "active_builds": {
    "concept": "v1.0.1",
    "prototype": "v2.0.0",
    "production": "v3.0.0"
  },
  "last_release": "2025-01-25-release-1.0",
  "state": "building_prototype"
}
```

### 2. Clear Input/Output Separation
- **Inputs** (`00-inputs/`): All source materials, versioned
- **Tools** (`01-tools/`): Processing tools, single location each
- **Builds** (`02-builds/`): Generated artifacts, versioned
- **Releases** (`03-releases/`): Snapshot bundles for deployment

### 3. Unified Versioning Strategy
```
Semantic Versioning for all artifacts:
- Concept: v1.x.x (wireframe changes)
- Prototype: v2.x.x (React component changes)  
- Production: v3.x.x (production releases)

Build naming: v{stage}.{major}.{minor}
Release naming: {date}-release-{version}
Archive naming: {year}-{month}/
```

### 4. Artifact Lifecycle Management
```json
// 04-archive/retention-policy.json
{
  "builds": {
    "keep_latest": 10,
    "keep_days": 30,
    "archive_after_days": 7
  },
  "releases": {
    "keep_all": true,
    "compress_after_days": 90
  },
  "workspace": {
    "clean_temp_after_hours": 24
  }
}
```

### 5. Dependency Tracking
```json
// _manifest/dependencies.json
{
  "concept-generator": {
    "requires": ["busm-reader", "viewforge-transformer"],
    "inputs": ["00-inputs/configurations/current/viewforge/"],
    "outputs": ["02-builds/concept/"]
  },
  "prototype-generator": {
    "requires": ["ast-generator", "theme-engine"],
    "inputs": ["02-builds/concept/latest/"],
    "outputs": ["02-builds/prototype/"]
  }
}
```

## Migration Strategy

### Phase 1: Structure Setup (Day 1)
```bash
# 1. Create new structure
mkdir -p .pipeline-new/{_manifest,_workspace,00-inputs,01-tools,02-builds,03-releases,04-archive,05-operations}

# 2. Move tools to single locations
mv .pipeline/01-concept-line/tools/* .pipeline-new/01-tools/generators/
# (consolidate duplicates, keep best version)

# 3. Extract clean configurations
cp -r .pipeline/00-requirements/* .pipeline-new/00-inputs/requirements/v1/
```

### Phase 2: Output Cleanup (Day 2)
```bash
# 1. Extract artifacts from nested structures
find .pipeline -name "*.html" -path "*/outputs/*" | while read f; do
  # Copy to clean build directory without .pipeline nesting
done

# 2. Remove recursive .pipeline directories from outputs
find .pipeline -type d -path "*/outputs/.pipeline" -exec rm -rf {} +

# 3. Create version manifests for existing artifacts
```

### Phase 3: Tool Updates (Day 3)
```javascript
// Update tools to use new paths
const PIPELINE_ROOT = process.env.PIPELINE_ROOT || '.pipeline';
const MANIFEST = require(`${PIPELINE_ROOT}/_manifest/pipeline.json`);
const INPUT_DIR = `${PIPELINE_ROOT}/00-inputs/configurations/current`;
const OUTPUT_DIR = `${PIPELINE_ROOT}/02-builds/concept/${MANIFEST.active_builds.concept}`;
```

### Phase 4: Automation (Day 4)
- Update pipeline-orchestrator.js for new structure
- Create cleanup.sh for automatic archival
- Implement manifest-manager tool
- Add version compatibility checks

## Benefits of New Structure

### 1. Eliminates Output Pollution
- No more nested .pipeline in outputs
- Clean artifact directories
- Clear input/output boundaries

### 2. Enables Version Tracking
- Unified semantic versioning
- Version compatibility matrix
- Easy rollback capability

### 3. Supports Quality Assurance
- Build manifests track what was generated
- Logs captured for each build
- Gap tracking integrated

### 4. Scales Cleanly
- Automatic archival prevents growth
- Symlinks provide stable paths
- Clear retention policies

### 5. Improves Developer Experience
- Single location for each tool
- Clear dependency tracking
- No more path confusion

### 6. Enables Automation
- Orchestrator can read manifest
- Cleanup runs automatically
- Version bumping automated

## Example Workflows

### Building a New Concept
```bash
# 1. Orchestrator reads manifest
cat _manifest/pipeline.json

# 2. Checks dependencies
cat _manifest/dependencies.json | jq '.["concept-generator"]'

# 3. Runs generator with versioned inputs/outputs
node 01-tools/generators/concept-generator \
  --input 00-inputs/configurations/current \
  --output 02-builds/concept/v1.0.2

# 4. Updates manifest
echo '{"active_builds": {"concept": "v1.0.2"}}' | \
  jq -s '.[0] * .[1]' _manifest/pipeline.json -

# 5. Creates symlink
ln -sfn v1.0.2 02-builds/concept/latest
```

### Creating a Release
```bash
# 1. Create release directory
mkdir -p 03-releases/2025-01-26-release-1.1

# 2. Snapshot current builds
cp -r 02-builds/concept/latest/* 03-releases/2025-01-26-release-1.1/concept/
cp -r 02-builds/prototype/latest/* 03-releases/2025-01-26-release-1.1/prototype/

# 3. Create release manifest
cat > 03-releases/2025-01-26-release-1.1/release.json << EOF
{
  "version": "1.1",
  "date": "2025-01-26",
  "builds": {
    "concept": "v1.0.2",
    "prototype": "v2.0.1"
  }
}
EOF

# 4. Update latest symlink
ln -sfn 2025-01-26-release-1.1 03-releases/latest
```

### Automatic Cleanup
```bash
# cleanup.sh - Run daily via cron
#!/bin/bash

# Archive builds older than 7 days
find 02-builds -maxdepth 3 -type d -mtime +7 | while read dir; do
  tar -czf "04-archive/$(date +%Y-%m)/$(basename $dir).tar.gz" "$dir"
  rm -rf "$dir"
done

# Clean temp workspace
find _workspace/temp -type f -mtime +1 -delete

# Prune old archives based on retention policy
jq -r '.builds.keep_days' 04-archive/retention-policy.json
```

## Implementation Checklist

- [ ] Create new directory structure
- [ ] Consolidate duplicate tools
- [ ] Extract artifacts from nested outputs
- [ ] Create manifest files
- [ ] Update tool paths
- [ ] Implement version management
- [ ] Setup automatic cleanup
- [ ] Create migration script
- [ ] Update orchestrator
- [ ] Document new workflows
- [ ] Create rollback procedure
- [ ] Test end-to-end pipeline

## Conclusion

This restructure solves the recurring problems by:

1. **Eliminating output pollution** through clear boundaries
2. **Unifying versioning** with semantic versioning everywhere
3. **Enabling tracking** through manifests and dependencies
4. **Automating cleanup** with retention policies
5. **Simplifying paths** with symlinks and consistent structure

The new structure is:
- **Clean**: No nested pipelines or duplicates
- **Trackable**: Every artifact versioned and registered
- **Scalable**: Automatic cleanup prevents bloat
- **Maintainable**: Clear organization and single sources of truth
- **Automatable**: Machine-readable manifests drive operations

This is a one-time pain for long-term gain. The investment in restructuring will pay dividends in reduced confusion, easier automation, and reliable artifact tracking.