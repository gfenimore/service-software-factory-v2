# 🏭 Pipeline Directory Structure
*Configuration-Driven UI Factory for Pest Control System*

## 📂 Directory Organization

### 🔧 01-factory-tools/
**The Factory - Tools that build things**
- `viewforge/` - Visual field configurator (ViewForge)
- `generators/` - Code generators that consume configs and produce UI
- `docs/` - Documentation for understanding the system

### 📝 02-configurations/
**The Inputs - What we configure**
- `entities/` - Entity field configurations (Account, Service Location, Work Order)
- `navigation/` - Menu and navigation configurations
- `layouts/` - Page layout configurations

### 🏭 03-generated/
**The Outputs - What the factory produces**
- `concept-line/` - HTML/CSS/JS outputs (no framework)
- `prototype-line/` - React component outputs
- `production-line/` - Vue component outputs

### 🧪 04-testing/
**Quality Control - Testing and demos**
- `demos/` - Interactive demonstrations
- `workflows/` - End-to-end workflow tests

### 📊 05-feedback/
**Continuous Improvement - User feedback loop**
- `system/` - Feedback collection tools
- `sessions/` - Recorded feedback sessions
- `reports/` - Analysis and insights

### 📚 06-archive/
**History - Previous iterations and backups**
- `iteration-1/` - First version attempts
- `migration-backup/` - Backups from migrations

---

## 🔄 The Factory Flow

```
1. CONFIGURE → 2. GENERATE → 3. TEST → 4. FEEDBACK → 5. ITERATE
```

### Step 1: Configure (02-configurations/)
Use ViewForge to visually configure entity fields:
```
01-factory-tools/viewforge/configurator.html
  ↓ (exports JSON)
02-configurations/entities/account/list-view.json
```

### Step 2: Generate (03-generated/)
Run generators to produce UI code:
```
02-configurations/entities/account/list-view.json
  ↓ (processed by)
01-factory-tools/generators/html-generator.js
  ↓ (produces)
03-generated/concept-line/views/account-list.html
```

### Step 3: Test (04-testing/)
Test the generated UI:
```
03-generated/concept-line/complete-apps/app.html
  ↓ (tested in)
04-testing/workflows/morning-dispatch/
```

### Step 4: Collect Feedback (05-feedback/)
Gather user feedback on generated UI:
```
04-testing/demos/pest-control-demo.html
  ↓ (feedback collected)
05-feedback/sessions/2025-01-21-feedback.json
```

### Step 5: Iterate
Use feedback to improve configurations and regenerate.

---

## 🚀 Quick Start

### To Configure a New Entity:
1. Open `01-factory-tools/viewforge/configurator.html`
2. Configure fields for your entity
3. Export to `02-configurations/entities/[entity-name]/`

### To Generate UI:
```bash
cd 01-factory-tools/generators
node html-generator.js ../../02-configurations/entities/account/list-view.json ../../03-generated/concept-line/views/account-list.html
```

### To Create Complete App:
```bash
cd 01-factory-tools/generators
node layout-generator.js ../../02-configurations/layouts/three-column.json ../../03-generated/concept-line/complete-apps/app.html
```

---

## 📍 Current Status

### ✅ Working
- ViewForge configurator
- HTML generator
- Navigation generator
- Layout generator
- Account entity (partial)

### 🚧 In Progress
- Service Location entity configuration
- Work Order entity configuration
- React generator

### 📅 Planned
- Vue generator
- Database connections
- Context rules engine

---

## 🎯 Today's Focus

Working on configuring core pest control entities:
1. Service Location
2. Work Order
3. Testing full pipeline with real entities

---

## 📖 Key Documents

- **System Design**: `01-factory-tools/docs/architecture/CONFIGURATION-DRIVEN-FACTORY-PROPOSAL.md`
- **Navigation Philosophy**: `01-factory-tools/docs/philosophy/NAVIGATION-PHILOSOPHY.md`
- **Status Report**: `STATUS-AND-TASK-PLAN-2025-01-21.md`

---

## 🔍 Finding Things

| What You're Looking For | Where It Is |
|------------------------|-------------|
| ViewForge UI | `01-factory-tools/viewforge/configurator.html` |
| Generators | `01-factory-tools/generators/` |
| Entity Configs | `02-configurations/entities/` |
| Generated HTML | `03-generated/concept-line/` |
| Demos | `04-testing/demos/` |
| Documentation | `01-factory-tools/docs/` |

---

*The pipeline is now organized for clarity and efficiency. Each directory has a clear purpose in the factory flow.*