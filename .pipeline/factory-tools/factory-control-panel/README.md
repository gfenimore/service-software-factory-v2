# Factory Control Panel - Quick Start Guide

## 🚀 Launch the Control Panel

```bash
npm run control-panel
# or
npm run ui
```

Then open your browser to: **http://localhost:3000**

## 🎯 What You Can Do

The Factory Control Panel provides a **visual interface** to the entire Service Software Factory pipeline:

### 1. Select Entity from BUSM
- Click on any entity in the left panel (Account, Contact, User, etc.)
- See all available fields from the Business Model

### 2. Choose Fields
- Select which fields to include in your module
- Use Phase selector to filter fields:
  - **Phase 1**: Essential fields only (quick prototype)
  - **Phase 2**: Extended fields (more features)
  - **Phase 3**: Complete entity (all fields)

### 3. Click "BUILD IT"
- Executes the entire pipeline automatically:
  - ✅ Creates module configuration
  - ✅ Generates database schema
  - ✅ Builds React components (simulated in MVP)
  - ✅ Validates everything

### 4. Watch Real-Time Progress
- See each pipeline stage execute
- Monitor build logs in real-time
- Get instant feedback on any issues

## 📊 Current Features (MVP)

- **Visual Entity Selection** - No more CLI commands!
- **Field Picker** - Choose exactly what you need
- **One-Click Build** - "BUILD IT" button runs everything
- **Real-Time Progress** - Watch the pipeline execute
- **Build History** - Track what's been built
- **Database Integration** - Actually generates SQL migrations

## 🏗️ What Gets Built

When you click "BUILD IT", the system:

1. **Module Configuration** (.yaml file)
   - Saved to `.pipeline/factory-tools/module-system/`
   - Example: `account-module-phase1-ui.yaml`

2. **Database Schema** (SQL migration)
   - Saved to `.pipeline/database/migrations/prototype/`
   - Example: `2025-08-23_iter1_account.sql`

3. **TypeScript Types**
   - Saved to `.pipeline/database/types/`
   - Example: `database-types-iter1.ts`

4. **Schema State** (for iteration tracking)
   - Saved to `.pipeline/database/state/prototype/`

## 🎨 Interface Overview

```
┌─────────────────────────────────────────────────────┐
│            FACTORY CONTROL PANEL                     │
├───────────┬──────────────────┬──────────────────────┤
│           │                  │                      │
│  ENTITIES │   FIELD PICKER   │   PIPELINE CONTROL   │
│           │                  │                      │
│ • Account │  ☑ id           │    [BUILD IT]        │
│ • Contact │  ☑ name         │                      │
│ • User    │  ☑ email        │   Status:            │
│           │  ☐ phone        │   ✅ Module          │
│           │                  │   ✅ Database        │
│           │                  │   ⏳ Components      │
│           │                  │                      │
└───────────┴──────────────────┴──────────────────────┘
```

## 🔧 Technical Details

- **Frontend**: HTML/CSS/JavaScript (vanilla for MVP)
- **Backend**: Node.js + Express
- **Integration**: Calls existing CLI tools as child processes
- **Real-time Updates**: Polling for build status
- **Database**: Uses the Database Generator we built

## 📝 Next Steps

This MVP demonstrates the concept. Future enhancements:
- React frontend (eating our own dog food!)
- WebSocket for real-time updates
- Complete AST Generator integration
- Deployment management
- Iteration tracking with full history
- Visual preview of generated components

## 🎯 The Vision Realized

From the PRD: *"From business need to deployed software in ONE CLICK!"*

We're getting there! This MVP proves the concept:
- ✅ Visual interface replaces CLI
- ✅ Single button executes pipeline
- ✅ Real working code generation
- ✅ Complete traceability

## 🐛 Troubleshooting

If the server doesn't start:
```bash
# Install dependencies
npm install express

# Check if port 3000 is in use
# Windows: netstat -an | findstr :3000
# Mac/Linux: lsof -i :3000
```

If entities don't load:
- Check that BUSM model exists at `.pipeline/factory-tools/busm-reader/busm-model.json`
- Verify the server started successfully

## 🎉 Success!

You now have a visual interface to your Service Software Factory! No more command-line complexity - just click and build!

---

*Factory Control Panel MVP v1.0*
*Part of the Service Software Factory*