# Pipeline Evolution Strategy: Gradual Decoupling Approach

## Executive Summary

Instead of a risky 4-6 hour migration with 180+ hardcoded path dependencies, we recommend an **evolutionary approach** that maintains system stability while gradually decoupling the architecture. This approach reduces risk from HIGH to LOW by avoiding any "big bang" changes.

## Current Situation Assessment

- **180+ files** contain hardcoded `.pipeline` references
- **17 npm scripts** directly reference pipeline paths
- **Active production usage** prevents downtime
- **Risk Level**: HIGH for any migration approach

## Recommended Strategy: Evolution, Not Migration

### Core Principle
**Never break what's working.** Build new structure alongside old, gradually move components over weeks/months as you naturally touch them.

## Implementation Plan

### Phase 1: Stop the Bleeding (Day 1 - 2 hours)

#### 1.1 Create Central Configuration
```javascript
// pipeline-config.js (at project root)
module.exports = {
  PIPELINE_ROOT: process.env.PIPELINE_ROOT || '.pipeline',
  
  // Map logical names to physical paths
  paths: {
    'concept-generator': '.pipeline/factory-tools/generators/concept-html/concept-generator-v3.js',
    'viewforge-transformer': '.pipeline/factory-tools/viewforge/viewforge-transformer.js',
    'module-builder': '.pipeline/factory-tools/module-system/module-builder.js',
    'control-panel': '.pipeline/06-control-panel/server.js',
    // Add all tools here as you discover them
  },
  
  // Helper function for safe path resolution
  getPath: function(component) {
    return this.paths[component] || component;
  },
  
  // Helper for output directories
  getOutputPath: function(stage) {
    const outputs = {
      'concept': '.build/current/concept',
      'prototype': '.build/current/prototype',
      'production': '.build/current/production'
    };
    return outputs[stage] || `.build/current/${stage}`;
  }
};
```

#### 1.2 Create Tool Runner Wrapper
```javascript
// scripts/run-tool.js
const config = require('../pipeline-config');
const { spawn } = require('child_process');

const tool = process.argv[2];
const args = process.argv.slice(3);

const toolPath = config.getPath(tool);

const child = spawn('node', [toolPath, ...args], {
  stdio: 'inherit',
  env: { ...process.env, PIPELINE_CONFIG: JSON.stringify(config) }
});

child.on('exit', (code) => process.exit(code));
```

### Phase 2: Parallel Structure (Week 1)

#### 2.1 Create New Structure (Without Removing Old)
```bash
# Create evolution branch
git checkout -b pipeline-evolution

# Create new structure alongside old
mkdir -p factory-v2/{generators,integrations,configurations}
mkdir -p definitions-v2/{requirements,configurations}

# DO NOT delete or move .pipeline yet
```

#### 2.2 Update Package.json Gradually
```json
{
  "scripts": {
    "// Legacy Commands (Keep Working)": "",
    "concept:generate": "node .pipeline/factory-tools/generators/concept-html/concept-generator-v3.js",
    
    "// New Commands (Use Config)": "",
    "build:concept": "node scripts/run-tool.js concept-generator",
    "build:viewforge": "node scripts/run-tool.js viewforge-transformer",
    
    "// Transition Helper": "",
    "which-pipeline": "echo 'Using:' && node -e \"console.log(require('./pipeline-config').PIPELINE_ROOT)\""
  }
}
```

### Phase 3: Gradual Decoupling (Weeks 2-4)

#### 3.1 Decouple As You Touch
When you need to modify a file with hardcoded paths:

**Before:**
```javascript
const viewforge = require('./.pipeline/factory-tools/viewforge/viewforge-transformer.js');
```

**After:**
```javascript
const config = require('./pipeline-config');
const viewforge = require(config.getPath('viewforge-transformer'));
```

#### 3.2 Migration Tracker
```markdown
# migration-progress.md
## Decoupled Components
- [ ] concept-generator
- [ ] viewforge-transformer
- [ ] module-builder
- [ ] control-panel

## Files Updated
- [ ] package.json (partial)
- [ ] scripts/build.js
- [ ] factory/generators/concept.js
(Update as you progress)
```

### Phase 4: Component Migration (Months 2-3)

Only after a component is fully decoupled:
1. Copy it to factory-v2
2. Update pipeline-config.js to point to new location
3. Test thoroughly
4. Remove from .pipeline (only after verification)

## Preventing Future Path Hardcoding

### Add to CLAUDE.md
```markdown
## CRITICAL: Path Management Rules

### PROHIBITED: Hardcoded Paths
**NEVER** write code with hardcoded paths like:
- ❌ `require('./.pipeline/factory-tools/...')`
- ❌ `'./factory/generators/specific-tool.js'`
- ❌ `path.join(__dirname, '../../../tools/...')`

### REQUIRED: Configuration-Based Paths
**ALWAYS** use configuration for paths:
- ✅ `const config = require('./pipeline-config')`
- ✅ `config.getPath('tool-name')`
- ✅ `process.env.PIPELINE_ROOT || './default'`

### Path Management Principles
1. **Logical Names Over Physical Paths**: Reference tools by function, not location
2. **Single Source of Truth**: All paths in pipeline-config.js
3. **Environment Variables**: Allow override via PIPELINE_ROOT, etc.
4. **Relative Imports Only for Siblings**: Only use relative paths within same module

### Code Review Checklist
Before accepting any pipeline-related code:
- [ ] No hardcoded .pipeline paths
- [ ] No hardcoded factory paths  
- [ ] Uses pipeline-config for tool locations
- [ ] Uses getOutputPath() for build outputs
- [ ] Includes fallback/default values
```

### Add Linting Rules (.eslintrc.js)
```javascript
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        '.pipeline/*',
        '../.pipeline/*',
        '../../.pipeline/*',
        './factory/generators/*',
        '../factory/generators/*'
      ],
      message: 'Use pipeline-config.js instead of hardcoded paths'
    }]
  }
};
```

### Git Pre-commit Hook (.husky/pre-commit)
```bash
#!/bin/sh
# Check for hardcoded pipeline paths
if git diff --cached --name-only | xargs grep -l "\.pipeline\|factory/generators" 2>/dev/null; then
  echo "❌ Error: Hardcoded pipeline paths detected!"
  echo "Use pipeline-config.js instead"
  exit 1
fi
```

## Success Metrics

### Week 1
- [ ] pipeline-config.js created and working
- [ ] At least 2 npm scripts using new approach
- [ ] No production disruption

### Month 1
- [ ] 25% of tools using config-based paths
- [ ] New development uses factory-v2
- [ ] Zero downtime

### Month 3
- [ ] 75% of tools decoupled
- [ ] Old .pipeline can be archived
- [ ] Team trained on new patterns

## Risk Mitigation

| Risk | Mitigation | Recovery |
|------|------------|----------|
| Breaking existing tools | Keep .pipeline untouched initially | Git revert |
| Path resolution errors | Test each change individually | Use fallback paths |
| Team confusion | Document both approaches | Pair programming |
| Merge conflicts | Small, frequent commits | Feature branches |

## FAQ for Team

**Q: Do I need to update all my code?**
A: No. Only update when you're already modifying a file for other reasons.

**Q: What if I need to add a new tool?**
A: Add it to factory-v2 and register in pipeline-config.js.

**Q: Can I still use the old commands?**
A: Yes. All existing commands continue working during transition.

**Q: How do I know which structure to use?**
A: Check pipeline-config.js - it's the source of truth.

## Conclusion

This evolutionary approach:
- **Reduces risk** from HIGH to LOW
- **Maintains productivity** (no downtime)
- **Fixes the real problem** (coupling) not just symptoms (folders)
- **Teaches better practices** gradually
- **Allows rollback** at any point

The key insight: Your problem isn't folder structure, it's **architectural coupling**. This plan addresses the root cause while keeping your system operational.

## Next CC Prompt

"Please help implement Phase 1 of this evolutionary approach. Start by creating the pipeline-config.js file with all our current tool paths, then show how to update one npm script to use the new configuration-based approach."