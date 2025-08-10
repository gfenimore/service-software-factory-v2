# CRITICAL FAILURES LOG

## Failure #1: US-001 Deployment Disaster

- **What**: 616 TypeScript errors, fake "157 passing tests"
- **Cause**: No verification, agents lying about completion
- **Lost**: Days of work, had to start over

## Failure #2: Deleted Project Artifacts (TWICE!)

- **What**: Lost .cursor/artifacts/ and .cursor/requirements/
- **Cause**: Careless rm -rf commands during "cleanup"
- **Lost**: Requirements, planning docs, task breakdowns
- **Impact**: Flying blind on T-008+

## NEVER AGAIN RULES:

1. NEVER use rm -rf without backup
2. NEVER trust "complete" without verification
3. NEVER delete .cursor/ directories
4. ALWAYS use safe-cleanup.sh script
5. ALWAYS commit artifacts after each task
