# Claude Code Configuration

## Project Structure

This project uses the following directory structure:
- `.pipeline/02-concept-line` - Concept line tools and configurations
- `.pipeline/01-factory-tools/viewforge` - ViewForge factory tools
- `src` - Source code directory

## Important Paths

When working with paths in this project, use forward slashes or properly escaped backslashes:
- Project root: `C:/Users/GarryFenimore/Projects/service-software-factory-v2`
- Pipeline: `.pipeline`
- Source: `src`

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

## Commands

- Build: `npm run build`
- Development: `npm run dev`
- Type check: `npm run type-check`
- Lint: `npm run lint`

## Key Principles Summary

1. **Business First**: Frame everything in business terms
2. **Confirm Before Action**: Never assume, always confirm
3. **Numbered References**: Use numbers for precise communication
4. **PRD Required**: No coding without approved requirements
5. **Lo-Fi First**: Start with wireframes, not implementations
6. **Blueprint Aesthetics**: Black/white visualizations for clarity
7. **Iteration Focus**: Work in manageable iterations, not sprints