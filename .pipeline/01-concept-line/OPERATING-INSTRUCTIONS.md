# Concept Line Operating Instructions
## Complete Guide for Pipeline Execution

### Version: 1.0.0
### Date: 2025-08-25
### Status: Ready for Use

---

## 🚀 Quick Start

### One-Command Execution
```bash
# From project root
node .pipeline/01-concept-line/orchestrator/pipeline-orchestrator.js
```

This will:
1. Read BUSM.mmd and feature specs
2. Execute all 6 stages automatically
3. Deploy POC to http://localhost:3000/accounts/master-view
4. Generate all artifacts in `.pipeline/01-concept-line/outputs/`

---

## 📋 Pre-Flight Checklist

### Required Files
- [x] `.pipeline/00-requirements/models/BUSM.mmd`
- [x] `.product-specs/.../master-view-feature.md`
- [ ] Business rules (create via UI or provide JSON)

### Environment Setup
```bash
# Verify Node.js
node --version  # Should be 14+

# Install dependencies (if needed)
cd .pipeline/06-control-panel/app-shell && npm install
cd .pipeline/01-concept-line/tools/business-rules-configurator/rule-collection-ui && npm install
```

---

## 🛠️ Tool-by-Tool Operations

### 1. Rule Collection UI

**Purpose**: Define business rules through web interface

**Start the UI**:
```bash
cd .pipeline/01-concept-line/tools/business-rules-configurator/rule-collection-ui
npm install  # First time only
npm start
```

**Access**: http://localhost:3001

**Usage**:
1. Click "Add New Rule"
2. Fill in:
   - Rule Name (e.g., "Account Validation")
   - Description (what the rule does)
   - Type (validation, calculation, etc.)
   - Applies To (component or entity name)
   - Priority (critical, high, medium, low)
   - Conditions (when rule triggers)
   - Actions (what happens)
3. Click "Save Rule"
4. Click "Export to Pipeline" when done

**Output**: `business-rules.json` exported to pipeline

---

### 2. Pipeline Orchestrator

**Purpose**: Automate all stages of Concept Line

**Run Complete Pipeline**:
```bash
node .pipeline/01-concept-line/orchestrator/pipeline-orchestrator.js
```

**Monitor Progress**:
```
[2025-08-25T10:30:00.000Z] [INFO] Stage 1: Requirements Capture
[2025-08-25T10:30:05.000Z] [INFO] Extracted entities: Account, User
[2025-08-25T10:30:10.000Z] [INFO] Stage 1 complete: Requirements captured
...
[2025-08-25T10:35:00.000Z] [INFO] === Pipeline Complete in 300s ===
```

**Verify Outputs**:
```bash
# Check stage artifacts
ls -la .pipeline/01-concept-line/outputs/stage*/

# Specific artifacts:
cat .pipeline/01-concept-line/outputs/stage1/busm-subset.mmd
cat .pipeline/01-concept-line/outputs/stage5/validation-report.json
cat .pipeline/01-concept-line/outputs/stage6/deployment-manifest.json
```

---

### 3. BUSM Mermaid Parser (Via BUSM Reader)

**Purpose**: Parse BUSM diagrams in Mermaid format

**Programmatic Usage**:
```javascript
const BUSMReader = require('.pipeline/01-concept-line/tools/busm-reader');
const reader = new BUSMReader();

// Parse BUSM diagram
const busm = reader.read('.pipeline/00-requirements/models/BUSM.mmd');

// Extract subset for specific entities
const subset = reader.extractSubset(
  '.pipeline/00-requirements/models/BUSM.mmd',
  ['Account', 'User', 'Organization']
);

// Convert back to Mermaid
const mermaidOutput = reader.toMermaid(subset);
```

**Command Line Testing**:
```bash
# Create test script
cat > test-busm.js << 'EOF'
const BUSMReader = require('./busm-reader');
const reader = new BUSMReader();
const busm = reader.read('../../00-requirements/models/BUSM.mmd');
console.log(JSON.stringify(busm, null, 2));
EOF

# Run from busm-reader directory
cd .pipeline/01-concept-line/tools/busm-reader
node test-busm.js
```

---

### 4. App Shell Template

**Purpose**: Pre-built React app for component hosting

**Start App Shell**:
```bash
cd .pipeline/06-control-panel/app-shell
npm install  # First time only
npm start
```

**Access**: http://localhost:3000

**Features**:
- Navigation drawer
- Three-column Master View
- Indicator chips
- Component injection points

**Customization**:
```javascript
// To add new routes, edit src/App.js:
<Route path="/your-path" element={<YourComponent />} />

// To modify layout, edit src/components/Layout.js
// To change Master View, edit src/pages/accounts/MasterView.js
```

---

## 📊 Stage-by-Stage Manual Execution

### Stage 1: Requirements Capture
```bash
# Inputs needed:
ls .pipeline/00-requirements/models/BUSM.mmd
ls .product-specs/**/master-view-feature.md

# If running manually, ensure business rules exist:
ls .pipeline/01-concept-line/outputs/stage1/business-rules.json
```

### Stage 2: Configuration
```bash
# Requires Stage 1 outputs
# Enriches with metadata and mappings
```

### Stage 3: ViewForge
```bash
# Transforms enriched config to components
# Generates JSX templates
```

### Stage 4: AST Generation
```bash
# Creates Abstract Syntax Trees
# Validates syntax correctness
```

### Stage 5: Validation
```bash
# Runs quality checks
# Generates validation report
```

### Stage 6: Deployment
```bash
# Deploys to app shell
# Creates manifest for handoff
```

---

## 🔍 Troubleshooting

### Common Issues

**Issue**: "BUSM file not found"
```bash
# Solution: Verify file exists
ls -la .pipeline/00-requirements/models/
# If missing, check path in orchestrator
```

**Issue**: "Port 3001 already in use" (Rule UI)
```bash
# Solution: Kill existing process
lsof -i :3001  # Find PID
kill -9 <PID>  # Kill process
# Or use different port in server.js
```

**Issue**: "Cannot find module"
```bash
# Solution: Install dependencies
cd [tool-directory]
npm install
```

**Issue**: "Pipeline fails at Stage X"
```bash
# Solution: Check stage output
ls .pipeline/01-concept-line/outputs/stage[X-1]/
# Review logs for specific error
```

---

## 📁 Output Artifacts

### Directory Structure After Execution
```
.pipeline/01-concept-line/outputs/
├── stage1/
│   ├── busm-subset.mmd      # Filtered BUSM entities
│   ├── feature-spec.md      # Copy of feature spec
│   └── business-rules.json  # Defined rules
├── stage2/
│   └── enriched-config.json # Enhanced configuration
├── stage3/
│   ├── viewforge-spec.json  # Layout specification
│   ├── AccountListView.jsx  # Generated component
│   ├── AccountDetailView.jsx
│   └── AccountActionsView.jsx
├── stage4/
│   ├── AccountListView.ast.json
│   ├── AccountDetailView.ast.json
│   └── AccountActionsView.ast.json
├── stage5/
│   └── validation-report.json # Quality metrics
└── stage6/
    └── deployment-manifest.json # Handoff document
```

---

## 🎯 Success Indicators

### Pipeline Success
- [x] All 6 stages complete
- [x] Quality score > 80%
- [x] POC accessible at localhost:3000
- [x] All artifacts generated

### Visual Confirmation
1. Open http://localhost:3000/accounts/master-view
2. Verify three-column layout
3. Check indicator chips present
4. Confirm navigation works

---

## 🔄 Iteration Workflow

### For New Features
1. Update BUSM.mmd with new entities
2. Create new feature spec
3. Define new business rules (UI or JSON)
4. Run pipeline again
5. Components regenerated

### For Rule Changes
1. Start Rule Collection UI
2. Edit existing rules
3. Export to pipeline
4. Re-run orchestrator
5. Changes reflected in POC

---

## 📝 Manual Business Rule Creation

If not using the UI, create `business-rules.json`:

```json
{
  "rules": [
    {
      "id": "BR-001",
      "name": "Account Name Required",
      "description": "Account name must be provided",
      "type": "validation",
      "appliesTo": "AccountDetailView",
      "priority": "high",
      "conditions": "When saving account",
      "actions": "Validate name field not empty",
      "indicator": "✅",
      "created": "2025-08-25T10:00:00Z"
    }
  ]
}
```

Place in: `.pipeline/01-concept-line/outputs/stage1/business-rules.json`

---

## 🚨 Emergency Recovery

### Reset Everything
```bash
# Clear all outputs
rm -rf .pipeline/01-concept-line/outputs/*

# Recreate structure
mkdir -p .pipeline/01-concept-line/outputs/stage{1..6}

# Start fresh
node .pipeline/01-concept-line/orchestrator/pipeline-orchestrator.js
```

### Backup Current State
```bash
# Create backup
cp -r .pipeline/01-concept-line/outputs .pipeline/01-concept-line/outputs-backup-$(date +%Y%m%d-%H%M%S)
```

---

## 📞 Support & Help

### Check Logs
```bash
# Pipeline logs are printed to console
# Redirect to file for analysis:
node .pipeline/01-concept-line/orchestrator/pipeline-orchestrator.js > pipeline.log 2>&1
```

### Validate Prerequisites
```bash
# Run validation script
cat > validate.sh << 'EOF'
#!/bin/bash
echo "Checking prerequisites..."
[ -f ".pipeline/00-requirements/models/BUSM.mmd" ] && echo "✓ BUSM found" || echo "✗ BUSM missing"
[ -d ".pipeline/01-concept-line/tools" ] && echo "✓ Tools directory found" || echo "✗ Tools missing"
[ -f ".pipeline/01-concept-line/orchestrator/pipeline-orchestrator.js" ] && echo "✓ Orchestrator found" || echo "✗ Orchestrator missing"
which node > /dev/null && echo "✓ Node.js installed" || echo "✗ Node.js missing"
EOF
chmod +x validate.sh
./validate.sh
```

---

## 🎉 Congratulations!

You now have a complete Concept Line pipeline that transforms business requirements into clickable POCs in under 30 minutes!

**Next Steps**:
1. Run your first pipeline execution
2. Review generated artifacts
3. Access POC at localhost:3000
4. Iterate based on stakeholder feedback

---

*End of Operating Instructions - Concept Line v1.0.0*