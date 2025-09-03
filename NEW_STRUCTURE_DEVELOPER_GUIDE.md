# Developer Guide: Working with the New Factory Structure

## Table of Contents
1. [Understanding the New Model](#understanding-the-new-model)
2. [Daily Development Workflows](#daily-development-workflows)
3. [Common Tasks & Patterns](#common-tasks--patterns)
4. [Integration Development](#integration-development)
5. [Testing & Validation](#testing--validation)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Understanding the New Model

### Core Philosophy
The new structure treats your pipeline as a **factory** that transforms **definitions** into **outputs**. Think of it like a compiler:

```
Definitions (source code) → Factory (compiler) → Outputs (binaries)
```

### Directory Structure & Purpose

```
service-software-factory-v2/
│
├── factory/                    # 🏭 THE TRANSFORMATION ENGINE (Git-tracked)
│   ├── generators/            # Tools that create outputs
│   │   ├── concept-html/      # Generates HTML concepts from ViewForge
│   │   ├── module-system/     # Builds modular components
│   │   ├── viewforge/         # ViewForge transformer
│   │   ├── prototype/         # Assembles prototypes
│   │   └── production/        # Production-ready builds
│   │
│   ├── integrations/          # External service connectors
│   │   ├── address-validation.yaml
│   │   └── geographic-display.yaml
│   │
│   ├── specifications/        # Factory documentation
│   │   └── FACTORY-PATTERN.md
│   │
│   └── control-panel/         # Development server & tools
│       └── server.js
│
├── definitions/               # 📋 YOUR BUSINESS LOGIC (Git-tracked)
│   ├── requirements/         # What you want to build
│   │   ├── prds/            # Product requirement docs
│   │   └── models/          # Data models
│   │
│   ├── configurations/       # How to build it
│   │   ├── viewforge/       # ViewForge JSON configs
│   │   └── rules/           # Business rules
│   │
│   └── test-scenarios/      # How to validate it
│
├── .build/                   # 🚮 EPHEMERAL OUTPUTS (Not tracked)
│   ├── current/             # Latest build results
│   │   ├── concept/         # HTML concepts
│   │   ├── prototype/       # Working prototypes
│   │   └── production/      # Production builds
│   │
│   ├── cache/              # Speed optimization
│   └── logs/               # Build logs
│
├── factory.config.yaml      # Single source of truth
└── package.json            # npm scripts
```

### Key Principles

1. **Definitions are permanent** - Your business logic, requirements, and configurations are version-controlled
2. **Outputs are temporary** - Build results can be deleted and regenerated anytime
3. **Factory is stable** - Tools evolve slowly and deliberately
4. **One source of truth** - `factory.config.yaml` defines the entire pipeline

---

## Daily Development Workflows

### 🌅 Starting Your Day

```bash
# 1. Get latest changes
git pull

# 2. Clean build environment (optional, but recommended)
npm run clean

# 3. Run fresh build to ensure everything works
npm run build

# 4. Start development server (if needed)
npm run control-panel
```

### 🔄 The Development Loop

#### Working on ViewForge Configurations

```bash
# 1. Edit your ViewForge configuration
code definitions/configurations/viewforge/my-feature.viewforge.json

# 2. Rebuild concepts to see changes
npm run build:concept

# 3. View in browser
open .build/current/concept/index.html
# OR use the control panel
npm run control-panel
```

#### Adding a New Integration

```bash
# 1. Create integration definition
code factory/integrations/payment-processing.yaml

# 2. Reference it in factory.config.yaml
code factory.config.yaml
# Add to prototype.integrations array

# 3. Rebuild prototype with new integration
npm run build:prototype

# 4. Test the integration
npm run test:integrations
```

#### Modifying Business Requirements

```bash
# 1. Update requirement documents
code definitions/requirements/prds/new-feature.md

# 2. Update corresponding ViewForge config
code definitions/configurations/viewforge/new-feature.viewforge.json

# 3. Rebuild and review
npm run build
open .build/current/concept/new-feature.html
```

### 📦 Preparing for Deployment

```bash
# 1. Ensure clean build
npm run clean
npm run build

# 2. Run validation
npm run validate

# 3. Run tests
npm run test

# 4. Create production build
npm run build:production

# 5. Export for deployment
npm run export
# Creates: export-YYYYMMDD.zip

# OR direct deployment
npm run deploy:staging
```

---

## Common Tasks & Patterns

### Task: Create a New Feature from Scratch

```bash
# 1. Start with requirements
cat > definitions/requirements/prds/user-dashboard.md << 'EOF'
# User Dashboard PRD
## Overview
A personalized dashboard showing user metrics and recent activity.

## Requirements
- Display user profile information
- Show recent transactions
- Display activity metrics
EOF

# 2. Create ViewForge configuration
cat > definitions/configurations/viewforge/user-dashboard.viewforge.json << 'EOF'
{
  "name": "user-dashboard",
  "type": "view",
  "components": [
    {
      "type": "profile-card",
      "data": "@user.profile"
    },
    {
      "type": "metrics-grid",
      "data": "@user.metrics"
    }
  ]
}
EOF

# 3. Build and review
npm run build:concept
open .build/current/concept/user-dashboard.html

# 4. Iterate until satisfied
# Edit → Build → Review → Repeat

# 5. Commit your definitions (NOT the outputs!)
git add definitions/
git commit -m "Add user dashboard feature"
```

### Task: Debug a Failed Build

```bash
# 1. Check build logs
cat .build/logs/build-*.log

# 2. Run validation
npm run validate

# 3. Try verbose mode
npm run build:concept -- --verbose

# 4. Check specific generator
node factory/generators/concept-html/concept-generator-v3.js --debug

# 5. If still stuck, check factory config
npm run validate:config
```

### Task: Work with Historical Versions

```bash
# See what changed recently
git log --since="3 days ago" --oneline definitions/

# Rebuild from last week's definitions
git checkout HEAD~5
npm run build
# Review old output
git checkout main  # Return to current

# Compare outputs between versions
git checkout feature-branch
npm run build
mv .build/current .build/feature-output
git checkout main
npm run build
diff -r .build/current .build/feature-output
```

### Task: Share Work with Team

```bash
# Option 1: Share via Git (Recommended)
git add definitions/
git commit -m "Updated dashboard layout"
git push
# Team member runs: git pull && npm run build

# Option 2: Share specific output
npm run build:concept
cd .build/current/concept
zip -r ~/Desktop/concept-review.zip .
# Send zip file to team

# Option 3: Deploy to shared environment
npm run deploy:staging
# Share staging URL with team
```

---

## Integration Development

### Understanding Integration Points

```yaml
# factory/integrations/example-service.yaml
name: example-service
type: rest-api
config:
  endpoint: https://api.example.com
  authentication: api-key
  
transforms:
  - input: "@user.address"
    output: "@validated.address"
    operation: validate-address
```

### Adding a New Integration

1. **Define the integration**
   ```bash
   code factory/integrations/my-service.yaml
   ```

2. **Register in factory config**
   ```yaml
   # factory.config.yaml
   stages:
     prototype:
       integrations:
         - ./factory/integrations/my-service.yaml
   ```

3. **Use in ViewForge configuration**
   ```json
   {
     "data-source": "@integration.my-service.getData"
   }
   ```

4. **Test the integration**
   ```bash
   npm run test:integration -- my-service
   ```

### Integration Testing Pattern

```bash
# Create test scenario
cat > definitions/test-scenarios/integration-test.json << 'EOF'
{
  "name": "Test My Service Integration",
  "steps": [
    {
      "action": "call-integration",
      "integration": "my-service",
      "input": { "test": "data" },
      "expect": { "status": "success" }
    }
  ]
}
EOF

# Run test
npm run test:scenario -- integration-test
```

---

## Testing & Validation

### Pre-Commit Checklist

```bash
# 1. Validate structure
npm run validate

# 2. Run linting
npm run lint

# 3. Type checking
npm run type-check

# 4. Run tests
npm run test

# 5. Build verification
npm run clean && npm run build
```

### Continuous Validation

```bash
# Watch mode for development
npm run watch

# This automatically:
# - Watches definitions/ for changes
# - Rebuilds affected stages
# - Refreshes browser (if using control-panel)
```

### Testing Patterns

```bash
# Unit test a generator
npm run test:generator -- concept-html

# Integration test
npm run test:integration -- address-validation

# End-to-end test
npm run test:e2e

# Smoke test (quick validation)
npm run test:smoke
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: "Cannot find module './factory/generators/...'"
```bash
# Solution: Path mappings may be incorrect
node scripts/verify-migration-readiness.js post
# Fix any reported issues
```

#### Issue: Build outputs are missing
```bash
# Solution: Ensure generators are executable
chmod +x factory/generators/**/*.js
npm run build
```

#### Issue: Changes to definitions not reflected in output
```bash
# Solution: Clear cache and rebuild
npm run clean
npm run build

# If still not working, check generator is reading correct path
grep -n "definitions/configurations" factory/generators/concept-html/*.js
```

#### Issue: Integration failing with timeout
```bash
# Solution: Check integration config
cat factory/integrations/problematic-integration.yaml

# Test in isolation
node factory/generators/prototype/test-integration.js problematic-integration

# Check logs
tail -f .build/logs/integration-*.log
```

#### Issue: Git showing many untracked files in .build/
```bash
# Solution: Ensure .gitignore is correct
cat .gitignore | grep .build
# Should show: .build/

# If missing, add it
echo ".build/" >> .gitignore
git add .gitignore
git commit -m "Ignore build outputs"
```

### Debug Mode

```bash
# Enable debug logging globally
export DEBUG=factory:*
npm run build

# Debug specific component
DEBUG=factory:concept npm run build:concept

# Super verbose mode
npm run build -- --verbose --debug --log-level=trace
```

### Recovery Procedures

```bash
# Complete reset
git clean -fdx  # WARNING: Removes ALL untracked files
git reset --hard
npm install
npm run build

# Selective reset
rm -rf .build node_modules
npm install
npm run build

# Factory-only reset
rm -rf factory/
git checkout -- factory/
npm run validate
```

---

## FAQ

### Q: Where did my versioned outputs go?
**A:** Outputs are now ephemeral in `.build/`. To preserve important builds:
```bash
# Tag in git for reproducibility
git tag -a "v1.0-release" -m "Version 1.0 release"

# Or export for archival
npm run export
mv export.zip releases/v1.0-$(date +%Y%m%d).zip
```

### Q: How do I know what version of output I'm looking at?
**A:** Check the git commit that generated it:
```bash
# The current git state determines the output
git rev-parse HEAD
# This commit hash IS your version
```

### Q: Can I still access old pipeline outputs?
**A:** During migration, yes:
```bash
# Old outputs preserved temporarily in
ls .pipeline.old/02-concept-line/output/
# These will be removed after 7 days
```

### Q: How do I collaborate on work-in-progress?
**A:** Use feature branches:
```bash
# Create feature branch
git checkout -b feature/new-dashboard

# Work and commit definitions
git add definitions/
git commit -m "WIP: Dashboard layout"
git push -u origin feature/new-dashboard

# Team member checks out and builds
git checkout feature/new-dashboard
npm run build
```

### Q: What if I need to rollback a deployment?
**A:** Deployments are reproducible from git:
```bash
# Find the last good commit
git log --oneline -10

# Checkout and rebuild
git checkout abc1234  # Last good commit
npm run build:production
npm run deploy:production

# Return to main when fixed
git checkout main
```

### Q: How do I optimize slow builds?
**A:** Several strategies:
```bash
# 1. Use cache (enabled by default)
# Cache located in .build/cache/

# 2. Build only what changed
npm run build:concept  # Skip prototype if unchanged

# 3. Parallel builds (if supported)
npm run build -- --parallel

# 4. Profile to find bottlenecks
npm run build -- --profile
cat .build/logs/profile-*.json
```

### Q: Can I customize the factory for my needs?
**A:** Yes, the factory is designed to be extended:
```bash
# 1. Add custom generator
cp factory/generators/template factory/generators/my-custom
# Edit as needed

# 2. Register in config
# Edit factory.config.yaml

# 3. Add npm script
# Edit package.json

# 4. Test
npm run build:my-custom
```

### Q: How do I handle secrets and environment variables?
**A:** Use environment files (not tracked):
```bash
# Create .env file
cat > .env << 'EOF'
API_KEY=secret-key-here
DATABASE_URL=connection-string
EOF

# Generators automatically load .env
# Access via process.env.API_KEY
```

### Q: What about CI/CD integration?
**A:** The new structure simplifies CI/CD:
```yaml
# .github/workflows/build.yml or similar
steps:
  - uses: actions/checkout@v2
  - run: npm install
  - run: npm run validate
  - run: npm run test
  - run: npm run build:production
  - run: npm run deploy:staging
```

---

## Quick Reference Card

```
╔═══════════════════════════════════════════════════════════╗
║                   QUICK COMMAND REFERENCE                  ║
╠═══════════════════════════════════════════════════════════╣
║ BUILDING                                                   ║
║ npm run build           → Full pipeline                   ║
║ npm run build:concept   → Concept only                    ║
║ npm run build:prototype → Prototype only                  ║
║ npm run build:production→ Production only                 ║
║                                                           ║
║ DEVELOPMENT                                               ║
║ npm run watch          → Auto-rebuild on changes          ║
║ npm run control-panel  → Start dev server                 ║
║ npm run clean          → Clear all outputs                ║
║                                                           ║
║ VALIDATION                                                ║
║ npm run validate       → Check structure                  ║
║ npm run test           → Run test suite                   ║
║ npm run lint           → Code quality                     ║
║ npm run type-check     → TypeScript checking              ║
║                                                           ║
║ DEPLOYMENT                                                ║
║ npm run export         → Create zip archive               ║
║ npm run deploy:staging → Deploy to staging                ║
║ npm run deploy:production → Deploy to production          ║
║                                                           ║
║ KEY LOCATIONS                                             ║
║ definitions/   → Your business logic (edit here)          ║
║ factory/       → Tools (rarely edit)                      ║
║ .build/        → Outputs (never edit, not in git)         ║
║                                                           ║
║ HELP                                                      ║
║ npm run help           → Show all commands                ║
║ cat factory.config.yaml→ View pipeline config             ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Next Steps

1. **Try a simple edit** - Modify a ViewForge configuration and rebuild
2. **Run the test suite** - Ensure everything works in your environment  
3. **Review factory.config.yaml** - Understand your pipeline configuration
4. **Bookmark this guide** - Reference during development

For additional help:
- Review `MIGRATION_PLAN.md` for technical details
- Check `factory/specifications/` for factory patterns
- Contact team lead for specific questions

Remember: **You're no longer managing artifacts, you're operating a factory!**