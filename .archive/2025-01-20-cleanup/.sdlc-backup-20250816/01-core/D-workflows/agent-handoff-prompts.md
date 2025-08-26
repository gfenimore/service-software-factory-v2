# Agent Handoff Prompt Templates - DevOps Enhanced

## 🎯 Overview

These templates provide quick, customizable prompts for invoking each agent in the SDLC workflow with proper DevOps orchestration. Replace `[STORY_ID]` and `[STORY_TITLE]` with your current values.

---

## 0. DEVOPS Initial Setup (START HERE!)

```
@devops start-feature [STORY_ID] "[STORY_TITLE]"
```

### What DevOps Will Do:

- ✅ Verify clean workspace (auto-stash if needed)
- ✅ Create feature branch: `feature/[STORY_ID]-[kebab-title]`
- ✅ Set up artifact directories
- ✅ Create draft PR with checklist
- ✅ Verify requirements file exists
- ✅ Report readiness for PLANNER

### If DevOps Reports Issues:

- **Dirty workspace**: Follow stash/commit instructions
- **Feature exists**: Choose to continue or archive
- **Missing requirements**: Create the user story first

---

## 1. PLANNER Agent Invocation

```
@planner

Process the user story for [STORY_ID]: [STORY_TITLE]

The requirements are located at:
.cursor/artifacts/current/requirements/[STORY_ID]-[kebab-case-title].md

Please create a detailed task breakdown following the enhanced SDLC methodology.
```

### After PLANNER Completes:

```
@devops verify-handoff planner architect [STORY_ID]
```

DevOps will verify:

- ✅ Planning file created and not empty
- ✅ Appropriate number of tasks (10-30)
- ✅ Git checkpoints included
- ✅ Verification commands present

---

## 2. ARCHITECT Agent Invocation

## 2. ARCHITECT Agent Invocation

**Prerequisites**: DevOps must confirm PLANNER handoff successful

```
@architect

Create the technical design for [STORY_ID]: [STORY_TITLE]

Read the planner's task breakdown from:
.cursor/artifacts/current/planning/[STORY_ID]-tasks.md

Create a comprehensive technical architecture following our patterns.
```

### After ARCHITECT Completes:

```
@devops verify-handoff architect developer [STORY_ID]
```

DevOps will verify:

- ✅ Architecture file created and not empty
- ✅ TypeScript interfaces defined
- ✅ Server/client decisions documented
- ✅ Test patterns included

---

## 3. DEVELOPER Agent Invocation

**Prerequisites**: DevOps must confirm ARCHITECT handoff successful

```
@developer

Implement [STORY_ID]: [STORY_TITLE]

Follow the task breakdown from:
.cursor/artifacts/current/planning/[STORY_ID]-tasks.md

And technical design from:
.cursor/artifacts/current/design/[STORY_ID]-architecture.md

Start with minimal implementations and progressively enhance.
```

### During Development - Checkpoint Command:

After completing 3-4 tasks, run:

```
@devops checkpoint [STORY_ID]
```

DevOps will:

- ✅ Verify completed tasks
- ✅ Run type-check and tests
- ✅ Commit if appropriate
- ✅ Push and verify preview deployment
- ✅ Report progress and next steps

### After ALL Development Tasks:

```
@devops verify-handoff developer tester [STORY_ID]
```

---

## 4. TESTER Agent Invocation

## 4. TESTER Agent Invocation

**Prerequisites**: DevOps must confirm DEVELOPER handoff successful and preview URL working

```
@tester

Create comprehensive tests for [STORY_ID]: [STORY_TITLE]

The implementation is complete and deployed to:
[DevOps will provide the preview URL]

Enhance the existing proof-of-life tests with comprehensive coverage.
```

### After TESTER Completes:

```
@devops verify-handoff tester reviewer [STORY_ID]
```

DevOps will verify:

- ✅ Test report created
- ✅ All tests passing
- ✅ Coverage > 80%
- ✅ Edge cases covered

---

## 5. REVIEWER Agent Invocation

**Prerequisites**: DevOps must confirm TESTER handoff successful

```
@reviewer

Perform quality review for [STORY_ID]: [STORY_TITLE]

Review all artifacts in:
.cursor/artifacts/current/

Preview URL: [DevOps will provide URL]

Verify all patterns followed and quality standards met.
```

### After REVIEWER Completes:

```
@devops verify-handoff reviewer complete [STORY_ID]
```

DevOps will verify:

- ✅ Review report exists
- ✅ No blocking issues
- ✅ Approval status clear
- ✅ Ready for production

---

## 6. DEVOPS Feature Completion

**Prerequisites**: All agents complete, reviewer approved

```
@devops complete-feature [STORY_ID]
```

DevOps will:

- ✅ Run final verification checklist
- ✅ Merge to main branch
- ✅ Verify production deployment
- ✅ Archive artifacts
- ✅ Clean workspace
- ✅ Tag release

---

## 📋 Simplified Workflow Checklist

## 📋 Simplified Workflow Checklist

### The DevOps-Orchestrated Flow:

1. **START**: `@devops start-feature [ID] "[TITLE]"`
2. **PLAN**: `@planner` → `@devops verify-handoff planner architect [ID]`
3. **DESIGN**: `@architect` → `@devops verify-handoff architect developer [ID]`
4. **BUILD**: `@developer` → `@devops checkpoint [ID]` (every 3-4 tasks)
5. **VERIFY DEV**: `@devops verify-handoff developer tester [ID]`
6. **TEST**: `@tester` → `@devops verify-handoff tester reviewer [ID]`
7. **REVIEW**: `@reviewer` → `@devops verify-handoff reviewer complete [ID]`
8. **COMPLETE**: `@devops complete-feature [ID]`

### 🚨 Common Issues & Solutions

**"Current feature in progress"**

- Run: `@devops status` to see what's in progress
- Then: `@devops complete-feature [OLD-ID]` or `@devops archive-feature [OLD-ID]`

**"Handoff verification failed"**

- Check the specific error message from DevOps
- Common: Previous agent didn't save to correct location
- Fix: Have agent save to exact path shown in error

**"Preview deployment not working"**

- DevOps will retry 3 times automatically
- If still failing, check error message for manual fix
- Common: Missing environment variables

---

## 🚀 Quick Start Example

```bash
# 1. Start fresh
@devops start-feature us-003 "left navigation"

# 2. Run planner
@planner
[wait for completion]
@devops verify-handoff planner architect us-003

# 3. Run architect
@architect
[wait for completion]
@devops verify-handoff architect developer us-003

# 4. Start development
@developer
[implement tasks 1-4]
@devops checkpoint us-003
[implement tasks 5-8]
@devops checkpoint us-003
[complete remaining tasks]
@devops verify-handoff developer tester us-003

# 5. Continue through test, review, complete...
```

---

## 📝 Key Points to Remember

1. **Always start with DevOps** - Never invoke agents directly without setup
2. **DevOps verifies everything** - No manual verification commands needed
3. **Checkpoints during dev** - Use `@devops checkpoint` every 3-4 tasks
4. **DevOps provides URLs** - No need to hunt for preview links
5. **Auto-fix when possible** - DevOps handles common issues automatically

---

## 🔧 DevOps Commands Reference

- `@devops start-feature [ID] "[TITLE]"` - Initialize new feature
- `@devops verify-handoff [FROM] [TO] [ID]` - Verify agent transition
- `@devops checkpoint [ID]` - Development progress checkpoint
- `@devops status [ID]` - Current feature status
- `@devops complete-feature [ID]` - Finish and deploy feature
- `@devops health` - Repository health check
- `@devops rollback production` - Emergency rollback
