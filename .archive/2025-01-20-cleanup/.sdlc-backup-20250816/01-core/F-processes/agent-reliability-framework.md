# Agent Reliability Framework

**Purpose**: Eliminate false completion claims through automated verification

## Core Principle: No Agent Declaration Without Proof

Every agent completion must include:

1. **Executable Verification Command**
2. **Proof of Execution Output**
3. **Artifact Location Verification**
4. **Integration Point Testing**

## Agent Completion Pattern

````markdown
## Agent: [AGENT_NAME] - Task Complete

**Verification Commands Run:**

```bash
npm run type-check     # ✅ 0 errors
npm test ComponentName # ✅ 5/5 tests passing
curl localhost:3000/api/accounts # ✅ 200 OK
ls -la src/components/accounts/  # ✅ 4 files created
```
````

**Proof Screenshots/Output:**
[Paste actual terminal output]

**Artifacts Created:**

- ✅ src/components/accounts/AccountsTable.tsx (verified exists)
- ✅ src/components/accounts/AccountsTable.test.tsx (verified passing)
- ✅ .cursor/artifacts/current/planning/us-002-tasks.md (verified content)

**Integration Test:**

- ✅ Component renders at: http://localhost:3000/accounts
- ✅ API responds correctly
- ✅ TypeScript compiles without errors

**Next Agent Can Proceed:** [YES/NO]

````

## Automated Verification Scripts

```bash
# scripts/verify-agent-completion.sh
#!/bin/bash
AGENT_TYPE=$1
STORY_ID=$2

case $AGENT_TYPE in
  "planner")
    # Verify planning artifacts exist and have content
    if [ ! -s ".cursor/artifacts/current/planning/${STORY_ID}-tasks.md" ]; then
      echo "❌ PLANNER: Task file missing or empty"
      exit 1
    fi
    echo "✅ PLANNER: Verified"
    ;;
  "developer")
    # Run all verification commands
    npm run type-check || exit 1
    npm test || exit 1
    npm run build || exit 1
    echo "✅ DEVELOPER: All checks passed"
    ;;
esac
````

## Human Verification Checklist

Before accepting any agent completion:

- [ ] Run the verification commands yourself
- [ ] Check the actual files exist
- [ ] Test the feature manually in browser
- [ ] Verify integration points work
- [ ] Confirm no console errors

## Agent Training Updates

Each agent prompt now includes:

```
CRITICAL: You MUST provide executable proof of completion.
- Run verification commands and paste output
- Take screenshots of working features
- List exact file paths created
- Test integration points
- NO COMPLETION CLAIMS WITHOUT PROOF
```
