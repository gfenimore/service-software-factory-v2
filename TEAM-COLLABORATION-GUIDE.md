# Team Collaboration Guide
## Service Software Factory v2.0

### Current Status
✅ **Feature branch merged to main** (2025-08-26)
- Complete Concept Line pipeline implementation
- Business Rules Management System architecture
- 90% automated pipeline from requirements to POC

### For Team Members

## 1. Getting Started

### Clone the Repository
```bash
# If you haven't cloned yet
git clone https://github.com/YOUR_USERNAME/service-software-factory-v2.git
cd service-software-factory-v2

# If you already have it cloned
git fetch origin
git checkout main
git pull origin main
```

### Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install pipeline-specific dependencies
cd .pipeline/01-concept-line/tools/business-rules-configurator/rule-collection-ui
npm install
cd ../../../../../..
```

## 2. Branch Management Strategy

### Creating Your Feature Branch
```bash
# Always branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Naming Conventions
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements

### Example Branch Names
- `feature/business-rules-engine`
- `fix/pipeline-stage3-error`
- `docs/update-prds`
- `refactor/orchestrator-optimization`

## 3. Key Areas for Development

### High Priority Tasks

#### 1. Business Rules Engine Implementation
**Location**: `.pipeline/01-concept-line/tools/business-rules-engine/`
**PRD**: See `docs/BUSINESS-RULE-MANAGEMENT-SYSTEM-PRD.md`
**What's needed**: 
- Build the actual execution engine (parser, evaluator, executor)
- Currently we only have a rule collection UI

#### 2. Rule Authoring Workbench
**Location**: `.pipeline/01-concept-line/tools/rule-authoring-workbench/` (to be created)
**PRD**: See `docs/RULE-AUTHORING-WORKBENCH-PRD.md`
**What's needed**:
- Three-column layout UI
- Integration with Business Rules Engine
- Template management system

#### 3. Pipeline Stage Improvements
**Location**: `.pipeline/01-concept-line/orchestrator/`
**Current stages**: 1-6 are implemented
**Opportunities**:
- Add error recovery mechanisms
- Improve gap analysis
- Add progress visualization

## 4. Running the Pipeline

### Full Pipeline Execution
```bash
cd .pipeline/01-concept-line/orchestrator
node pipeline-orchestrator.js
```

### Running Individual Stages
```bash
# Stage 1: Requirements Capture
node pipeline-orchestrator.js --stage 1

# Stage 2: Configuration Enrichment
node pipeline-orchestrator.js --stage 2

# Continue for stages 3-6...
```

### Using the Rule Collection UI
```bash
cd .pipeline/01-concept-line/tools/business-rules-configurator/rule-collection-ui
npm start
# Access at http://localhost:3001
```

## 5. Testing Your Changes

### Before Committing
```bash
# Run any existing tests
npm test

# Test the pipeline with sample data
cd .pipeline/01-concept-line/orchestrator
node pipeline-orchestrator.js --test
```

### Manual Testing
1. Test individual tools in isolation
2. Run full pipeline with test data
3. Verify outputs in `.pipeline/01-concept-line/outputs/`

## 6. Commit Guidelines

### Commit Message Format
```
type(scope): Brief description

Longer explanation if needed
- Bullet points for multiple changes
- Reference issue numbers if applicable
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples
```bash
git commit -m "feat(rules-engine): Add expression parser for validation rules"
git commit -m "fix(orchestrator): Handle missing BUSM file gracefully"
git commit -m "docs(pipeline): Update stage 3 documentation"
```

## 7. Pull Request Process

### Before Creating PR
1. Ensure your branch is up to date with main
```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
```

2. Test your changes thoroughly
3. Update relevant documentation

### Creating the PR
```bash
# Push your branch
git push -u origin feature/your-feature-name

# Use GitHub CLI (if installed)
gh pr create --title "Your PR title" --body "Description of changes"

# Or create via GitHub web interface
```

### PR Template
```markdown
## Summary
Brief description of what this PR does

## Changes
- List of key changes
- Another change
- etc.

## Testing
How to test these changes

## Related Issues
Closes #123 (if applicable)
```

## 8. Key Files and Locations

### Pipeline Core
- **Orchestrator**: `.pipeline/01-concept-line/orchestrator/pipeline-orchestrator.js`
- **BUSM Parser**: `.pipeline/01-concept-line/tools/busm-reader/mermaid-parser.js`
- **App Shell**: `.pipeline/06-control-panel/app-shell/`

### Documentation
- **Vision**: `.pipeline/01-concept-line/docs/CONCEPT-LINE-VISION.md`
- **BRMS PRD**: `.pipeline/01-concept-line/tools/business-rules-engine/docs/`
- **Learnings**: `.pipeline/01-concept-line/tools/business-rules-engine/docs/LEARNINGS.md`

### Test Data
- **BUSM Model**: `.pipeline/00-requirements/models/BUSM.mmd`
- **Feature Specs**: `.product-specs/`

## 9. Communication

### Slack Channels (if applicable)
- `#pipeline-dev` - General pipeline development
- `#rules-engine` - Business rules engine work
- `#help` - Get help with issues

### Documentation Updates
When you make significant changes:
1. Update relevant PRDs
2. Add to LEARNINGS.md if you discover something important
3. Update this guide if process changes

## 10. Common Issues and Solutions

### Issue: Pipeline fails at Stage 3
**Solution**: Check that ViewForge transformer is properly configured in `.pipeline/01-concept-line/config/`

### Issue: Rule Collection UI won't start
**Solution**: Ensure you've run `npm install` in the rule-collection-ui directory

### Issue: BUSM parsing errors
**Solution**: Validate your .mmd file syntax using a Mermaid preview tool

## Getting Help

1. Check the LEARNINGS.md file for common pitfalls
2. Review existing PRDs for design decisions
3. Ask in team chat
4. Create an issue if you find a bug

## Next Major Milestones

1. **Q3 2025**: Complete Business Rules Engine
2. **Q4 2025**: Rule Authoring Workbench v1.0
3. **Q1 2026**: Full production pipeline with 95% automation

---

**Remember**: The goal is 90%+ automation. Before building, ask:
- Can this be generated?
- Can existing patterns be reused?
- Is this the right abstraction level?

Happy coding! 🚀