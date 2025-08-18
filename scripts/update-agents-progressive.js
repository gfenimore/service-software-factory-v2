#!/usr/bin/env node

/**
 * Update Agents for Progressive Factory
 * Version: 2.0
 * Purpose: Updates all agents to use new progressive pipeline paths
 * and makes them line-aware
 */

const fs = require('fs')
const path = require('path')

// Agent files to update
const AGENTS = {
  'story-builder-v21.md': {
    oldPaths: [
      '.sdlc/01-planning/user-stories/',
      '01-planning/user-stories/',
      '.cursor/artifacts/current/',
    ],
    newPath: '.pipeline/${LINE}/stories/',
    lineAwareness: `
## Line-Aware Behavior

The Story Builder adapts based on the target line:

### Concept Line
- Focus: Business workflow and UX validation
- Skip: Technical specs, API contracts, database design
- Output: Simplified stories with mock data requirements

### Prototype Line  
- Focus: Technical feasibility and integration
- Include: Basic API contracts, simple schemas
- Output: Technical stories with single-tenant scope

### Production Line
- Focus: Complete implementation with all edge cases
- Include: Full technical specs, security requirements, performance targets
- Output: Production-ready stories with multi-tenant considerations

Set the LINE environment variable: export LINE=concept|prototype|production
`,
  },

  'planner-v52.md': {
    oldPaths: ['.cursor/artifacts/current/planning/', '.sdlc/current-work/', '02-design/tasks/'],
    newPath: '.pipeline/${LINE}/tasks/',
    lineAwareness: `
## Line-Aware Behavior

The Planner adjusts task granularity based on the target line:

### Concept Line
- Task types: mock-ui, mock-data, user-flow, validation
- Granularity: Coarse (large tasks)
- Time estimates: Hours
- Skip: Technical architecture, database migrations, security

### Prototype Line
- Task types: create-types, build-components, connect-api, add-validation
- Granularity: Medium
- Time estimates: Half-days
- Include: Integration tasks, basic error handling

### Production Line
- Task types: security-hardening, performance-optimization, monitoring-setup
- Granularity: Fine (small, precise tasks)
- Time estimates: Precise
- Include: Security audit, performance testing, multi-tenant setup

Set the LINE environment variable: export LINE=concept|prototype|production
`,
  },

  'architect-v50.md': {
    oldPaths: ['.sdlc/05-backlog/', '02-design/specs/', '.sdlc/02-design/specs/'],
    newPath: '.pipeline/${LINE}/architecture/',
    lineAwareness: `
## Line-Aware Behavior

The Architect provides different depth based on the target line:

### Concept Line
- SKIP: No architecture needed for pure mocks

### Prototype Line
- Focus: Basic component structure
- Include: Component hierarchy, simple state management
- Skip: Performance optimization, caching strategies

### Production Line
- Focus: Enterprise architecture
- Include: Scalability patterns, caching layers, error boundaries
- Output: Complete technical architecture

Set the LINE environment variable: export LINE=concept|prototype|production
`,
  },

  'processor-selector.md': {
    oldPaths: ['.sdlc/05-backlog/${module}/${feature}/', '.pipeline/current/manifests/'],
    newPath: '.pipeline/${LINE}/manifests/',
    lineAwareness: `
## Line-Aware Processor Selection

The Processor Selector chooses different processors based on the target line:

### Concept Line
- Available: MOCK-PROCESSOR, UI-PROCESSOR
- Skip: TYPE-PROCESSOR, TEST-PROCESSOR
- Mode: All processors run in "concept" mode

### Prototype Line
- Available: TYPE-PROCESSOR, SCAFFOLD-PROCESSOR, REACT-PROCESSOR, HOOK-PROCESSOR
- Mode: All processors run in "prototype" mode
- Focus: Functionality over optimization

### Production Line
- Available: All processors including SECURITY-PROCESSOR, PERFORMANCE-PROCESSOR
- Mode: All processors run in "production" mode
- Focus: Quality over speed

Set the LINE environment variable: export LINE=concept|prototype|production
`,
  },
}

// Processor files to update
const PROCESSORS = [
  'type-processor.md',
  'scaffold-processor.md',
  'react-processor.md',
  'hook-processor.md',
  'test-processor.md',
  'modify-processor.md',
]

function updateAgentFile(filename, config) {
  const filepath = path.join('.sdlc/01-core/A-agents', filename)

  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File not found: ${filepath}`)
    return false
  }

  let content = fs.readFileSync(filepath, 'utf8')
  let updated = false

  // Replace old paths with new progressive path
  config.oldPaths.forEach((oldPath) => {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    if (content.match(regex)) {
      content = content.replace(regex, config.newPath)
      updated = true
    }
  })

  // Add line-awareness section if not present
  if (!content.includes('## Line-Aware Behavior')) {
    content += '\n\n' + config.lineAwareness
    updated = true
  }

  if (updated) {
    fs.writeFileSync(filepath, content)
    console.log(`✅ Updated: ${filename}`)
    return true
  } else {
    console.log(`ℹ️  No changes needed: ${filename}`)
    return false
  }
}

function updateProcessorFile(filename) {
  const filepath = path.join('.sdlc/01-core/A-agents/processors', filename)

  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  Processor not found: ${filepath}`)
    return false
  }

  let content = fs.readFileSync(filepath, 'utf8')
  let updated = false

  // Add line-aware mode section if not present
  if (!content.includes('## Line-Aware Modes')) {
    const modeSection = `
## Line-Aware Modes

This processor operates in three modes based on the target line:

### Concept Mode
- Allows any types
- Mock data generation
- No validation required
- Output: src/concept/

### Prototype Mode  
- TypeScript strict mode
- Basic validation
- Real data connections
- Output: src/prototype/

### Production Mode
- Full type safety
- Comprehensive validation
- Performance optimization
- Security hardening
- Output: src/production/

Set processor mode: --mode=concept|prototype|production
`
    content += '\n\n' + modeSection
    fs.writeFileSync(filepath, content)
    console.log(`✅ Updated processor: ${filename}`)
    return true
  }

  return false
}

function main() {
  console.log('🚀 Updating Agents for Progressive Factory\n')
  console.log('=========================================\n')

  let agentsUpdated = 0
  let processorsUpdated = 0

  // Update main agents
  console.log('📝 Updating Agents:\n')
  for (const [filename, config] of Object.entries(AGENTS)) {
    if (updateAgentFile(filename, config)) {
      agentsUpdated++
    }
  }

  // Update processors
  console.log('\n📝 Updating Processors:\n')
  for (const filename of PROCESSORS) {
    if (updateProcessorFile(filename)) {
      processorsUpdated++
    }
  }

  console.log('\n=========================================')
  console.log(`✅ Updated ${agentsUpdated} agents`)
  console.log(`✅ Updated ${processorsUpdated} processors`)
  console.log('\n🎯 Next steps:')
  console.log('1. Review the changes')
  console.log('2. Test with: export LINE=concept')
  console.log('3. Run US-006 through the concept line')
}

main()
