# Real-World Workflow Scenarios in the New Structure

## Scenario-Based Development Patterns

This document walks through actual development scenarios you'll encounter daily, showing exactly how to work in the new factory structure.

---

## Scenario 1: Monday Morning - Starting Fresh

**Context:** It's Monday morning. You need to implement a new customer search feature that was discussed Friday.

```bash
# Start your Monday
cd ~/Projects/service-software-factory-v2
git pull origin main

# Check what changed while you were away
git log --since="3 days ago" --oneline definitions/

# Clean start for the week
npm run clean
npm run build

# Create your feature branch
git checkout -b feature/customer-search

# Start with the PRD
mkdir -p definitions/requirements/prds/features
cat > definitions/requirements/prds/features/customer-search.md << 'EOF'
# Customer Search Feature

## Overview
Enable users to search for customers by name, email, or ID.

## Requirements
1. Real-time search as user types
2. Display results in grid format
3. Show customer name, email, last activity
4. Click to view full customer details

## Acceptance Criteria
- Search begins after 3 characters
- Results appear within 200ms
- Maximum 20 results shown
- Load more on scroll
EOF

# Create the ViewForge configuration
cat > definitions/configurations/viewforge/customer-search.viewforge.json << 'EOF'
{
  "name": "customer-search",
  "type": "component",
  "data": {
    "source": "@api.customers.search",
    "trigger": "onInputChange",
    "debounce": 300
  },
  "layout": {
    "type": "grid",
    "columns": ["name", "email", "lastActivity"],
    "actions": ["view", "edit"]
  }
}
EOF

# Build and preview
npm run build:concept
open .build/current/concept/customer-search.html

# Not quite right? Iterate quickly:
code definitions/configurations/viewforge/customer-search.viewforge.json
# Make changes...
npm run build:concept  # Rebuild in ~10 seconds
# Refresh browser to see changes

# Happy with concept? Commit your morning's work
git add definitions/
git commit -m "feat: Add customer search feature requirements and initial concept"
git push -u origin feature/customer-search
```

**Time spent:** 30 minutes from idea to reviewable concept

---

## Scenario 2: Integration with External Service

**Context:** The customer search needs to integrate with your CRM's API.

```bash
# Still on feature/customer-search branch

# Define the CRM integration
cat > factory/integrations/crm-customer-search.yaml << 'EOF'
name: crm-customer-search
type: rest-api
version: 1.0.0

config:
  base_url: ${CRM_API_URL}
  auth:
    type: bearer
    token: ${CRM_API_TOKEN}

endpoints:
  search:
    method: GET
    path: /api/v2/customers/search
    params:
      - name: query
        type: string
        required: true
      - name: limit
        type: integer
        default: 20
    
transformations:
  response:
    - map: data.customers
    - pick: [id, name, email, lastActivityDate]
    - rename:
        lastActivityDate: lastActivity
        
error_handling:
  - status: 429
    action: retry
    delay: 1000
  - status: 401
    action: refresh_token
EOF

# Add integration to prototype stage
code factory.config.yaml
# Add to prototype.integrations array:
# - ./factory/integrations/crm-customer-search.yaml

# Test the integration in isolation
cat > definitions/test-scenarios/test-crm-search.json << 'EOF'
{
  "name": "CRM Search Integration Test",
  "integration": "crm-customer-search",
  "tests": [
    {
      "input": { "query": "john" },
      "expect": {
        "status": 200,
        "data.length": ">0"
      }
    }
  ]
}
EOF

# Set up environment variables (not tracked in git)
cat >> .env << 'EOF'
CRM_API_URL=https://api.crm.example.com
CRM_API_TOKEN=test-token-12345
EOF

# Run integration test
npm run test:integration -- crm-customer-search

# Build prototype with real data
npm run build:prototype

# Test with live data
npm run control-panel
# Navigate to: http://localhost:3000/prototype/customer-search

# Everything working? Commit
git add factory/integrations/crm-customer-search.yaml
git add definitions/test-scenarios/test-crm-search.json
git commit -m "feat: Add CRM integration for customer search"
```

**Time spent:** 45 minutes to fully integrated, tested feature

---

## Scenario 3: Bug Fix in Production

**Context:** Users report the search is too slow. You need to debug and fix quickly.

```bash
# Get on main branch with latest
git checkout main
git pull

# Reproduce the issue
npm run build:production
npm run control-panel
# Test search... confirm it's slow

# Check logs for clues
tail -f .build/logs/integration-*.log
# See: "CRM API response time: 2500ms"

# The issue: No caching! Quick fix:

# Create hotfix branch
git checkout -b hotfix/search-performance

# Add caching to integration
cat > factory/integrations/crm-customer-search-cached.yaml << 'EOF'
name: crm-customer-search
type: rest-api
version: 1.0.1  # Version bump

config:
  base_url: ${CRM_API_URL}
  auth:
    type: bearer
    token: ${CRM_API_TOKEN}
  
  # ADD CACHING
  cache:
    enabled: true
    ttl: 300  # 5 minutes
    key_pattern: "search:{query}:{limit}"

endpoints:
  search:
    method: GET
    path: /api/v2/customers/search
    # ... rest same as before
EOF

# Replace old integration file
mv factory/integrations/crm-customer-search-cached.yaml \
   factory/integrations/crm-customer-search.yaml

# Test the fix
npm run clean  # Clear any existing cache
npm run build:production
npm run test:performance -- customer-search
# Results: "Average response time: 50ms" ✅

# Verify nothing else broke
npm run test

# Quick deployment
git add factory/integrations/
git commit -m "fix: Add caching to customer search for performance

- Added 5-minute cache to CRM API calls
- Reduces response time from 2500ms to 50ms
- Fixes #123"

git push origin hotfix/search-performance

# Create PR and merge to main
gh pr create --title "🔥 Hotfix: Search performance" \
  --body "Adds caching to fix slow customer search"

# After PR approved and merged
git checkout main
git pull
npm run deploy:production
```

**Time spent:** 20 minutes from report to fix in production

---

## Scenario 4: Team Collaboration on Complex Feature

**Context:** You're working on a complex dashboard with 2 other developers.

```bash
# Team creates feature branch
git checkout -b feature/analytics-dashboard

# You handle data models
cat > definitions/requirements/models/analytics-dashboard.yaml << 'EOF'
models:
  UserMetrics:
    fields:
      - totalSales: number
      - conversionRate: percentage
      - activeCustomers: integer
    
  TimeSeriesData:
    fields:
      - timestamp: datetime
      - value: number
      - label: string
EOF

# Teammate 1 handles ViewForge configs
# (They're working in parallel)
# definitions/configurations/viewforge/analytics-*.viewforge.json

# Teammate 2 handles integrations
# factory/integrations/analytics-*.yaml

# Your changes ready first
git add definitions/requirements/models/
git commit -m "feat: Add data models for analytics dashboard"
git push

# Pull teammate's changes
git pull origin feature/analytics-dashboard

# Merge conflict? Here's how to handle:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> origin/feature/analytics-dashboard

# For factory.config.yaml conflicts (common with integrations):
code factory.config.yaml
# Usually just combine both integration lists

# Resolve and continue
git add factory.config.yaml
git commit -m "merge: Resolve factory config conflicts"
git push

# Test combined work
npm run clean
npm run build
npm run test

# Ready for review? Create PR together
gh pr create --title "Analytics Dashboard Feature" \
  --body "Complete analytics dashboard implementation
  
Co-authored-by: Teammate1 <teammate1@example.com>
Co-authored-by: Teammate2 <teammate2@example.com>"
```

---

## Scenario 5: Experimenting with New Ideas

**Context:** You want to try a crazy new UI approach without affecting anyone.

```bash
# Create experimental branch
git checkout -b experiment/3d-visualization

# Set up isolated experiment
mkdir -p definitions/experiments

cat > definitions/experiments/3d-viz.viewforge.json << 'EOF'
{
  "name": "3d-customer-map",
  "type": "experimental",
  "renderer": "threejs",
  "data": "@api.customers.locations"
}
EOF

# Create custom generator for this experiment
cp -r factory/generators/concept-html factory/generators/concept-3d

# Modify the generator for 3D
code factory/generators/concept-3d/index.js
# Add three.js rendering logic...

# Test your experiment
node factory/generators/concept-3d/index.js \
  --input definitions/experiments/3d-viz.viewforge.json \
  --output .build/experiments/3d-viz

# Open in browser
open .build/experiments/3d-viz/index.html

# Experiment failed? No problem!
git stash  # Save work just in case
git checkout main
git branch -D experiment/3d-visualization
# No mess, no cleanup, no artifacts to manage

# Experiment succeeded? Promote it!
git add .
git commit -m "experiment: 3D customer visualization proof of concept"
# Create PR to discuss with team
```

---

## Scenario 6: Preparing Major Release

**Context:** Quarterly release combining multiple features.

```bash
# Create release branch
git checkout -b release/v2.0.0

# Merge all feature branches
git merge feature/customer-search
git merge feature/analytics-dashboard
git merge feature/new-integrations

# Full validation suite
npm run clean
npm run validate
npm run lint
npm run type-check
npm run test
npm run test:integration
npm run test:e2e

# Build all stages
npm run build:production

# Generate release artifacts
mkdir -p releases/v2.0.0

# Export builds
cd .build/current
zip -r ../../releases/v2.0.0/production-build.zip production/
zip -r ../../releases/v2.0.0/prototype-build.zip prototype/
cd ../..

# Create release documentation
cat > releases/v2.0.0/CHANGELOG.md << 'EOF'
# Version 2.0.0 Release

## Features
- Customer search with CRM integration
- Analytics dashboard
- Performance improvements

## Fixes
- Search performance (added caching)
- UI responsiveness on mobile

## Breaking Changes
- None

## Deployment Notes
- Update CRM_API_TOKEN environment variable
- Clear CDN cache after deployment
EOF

# Tag the release
git tag -a v2.0.0 -m "Release version 2.0.0

Major features:
- Customer search
- Analytics dashboard
- Performance improvements"

# Deploy to staging first
npm run deploy:staging

# After testing, deploy to production
npm run deploy:production

# Push everything
git push origin release/v2.0.0
git push origin v2.0.0  # Push tag
```

---

## Scenario 7: Onboarding New Developer

**Context:** New developer joins your team. Here's their first day.

```bash
# What you tell them:

"Welcome! Here's how our pipeline works:

1. Clone and setup (5 minutes):
   git clone [repo]
   cd service-software-factory-v2
   npm install
   cp .env.example .env  # Ask me for real values

2. Understand the structure (10 minutes):
   - definitions/ = What we're building (you'll edit here)
   - factory/ = How we build it (rarely touch)
   - .build/ = Build outputs (never edit, not in git)

3. Try your first build:
   npm run clean
   npm run build
   open .build/current/concept/index.html

4. Make your first change:
   code definitions/configurations/viewforge/homepage.viewforge.json
   # Change the title text
   npm run build:concept
   # See your change instantly!

5. Daily workflow:
   - Pull latest: git pull
   - Make changes in definitions/
   - Build: npm run build
   - Test: npm run test
   - Commit definitions only (never .build/)

That's it! The mental model is simple:
- We define WHAT to build (definitions)
- The factory knows HOW to build it
- Outputs are disposable (can always rebuild from definitions)

Questions? Check NEW_STRUCTURE_DEVELOPER_GUIDE.md"
```

---

## Key Takeaways

### What's Different from Old Pipeline

| Old Way | New Way |
|---------|---------|
| Manage version numbers manually | Git commit IS your version |
| Archive old builds | Rebuild from git history |
| Complex directory navigation | Three clear directories |
| Wait for long builds | Incremental builds in seconds |
| Worry about cleanup | Delete .build/ anytime |
| Track dependencies manually | factory.config.yaml has everything |

### Time Comparisons

| Task | Old Pipeline | New Structure |
|------|--------------|---------------|
| Fresh build | 15-20 minutes | 3-4 minutes |
| Incremental change | 5-10 minutes | 10-30 seconds |
| Find old version | Search archives (10+ min) | Git checkout (instant) |
| Cleanup | Manual process (30+ min) | rm -rf .build (instant) |
| New feature setup | Create dirs, update configs (20 min) | Add 2 files (5 min) |

### Your New Mantras

1. **"Definitions in git, outputs in .build"**
2. **"If I can't rebuild it, it doesn't exist"**
3. **"The git commit IS the version"**
4. **"Delete .build/ without fear"**
5. **"One config file to rule them all"**

---

Remember: The new structure isn't just organized differently - it fundamentally changes how you think about the pipeline. You're not managing artifacts; you're defining transformations.