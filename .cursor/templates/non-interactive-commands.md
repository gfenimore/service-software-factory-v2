# Non-Interactive Commands Reference

**Location**: `.cursor/templates/non-interactive-commands.md`
**Purpose**: Ensure all agents use commands that don't require user interaction

## 🚫 NEVER Use Interactive Commands

These commands will hang waiting for user input:

- `npm test` (opens in watch mode)
- `npm run lint --fix` (may prompt for fixes)
- `git commit` (opens editor)
- `git merge` (may open editor for merge message)
- `jest --watch` (interactive watch mode)

## ✅ ALWAYS Use Non-Interactive Commands

### Testing

```bash
# Run all tests once and exit
npm test -- --watchAll=false

# Run specific test file
npm test -- --watchAll=false ComponentName.test.tsx

# Run tests with coverage
npm test -- --watchAll=false --coverage

# Run tests in CI mode
npm run test:ci

# Run tests with specific pattern
npm test -- --watchAll=false --testNamePattern="business rule"
```

### Linting

```bash
# Check for linting errors only (don't auto-fix)
npm run lint

# Run ESLint on specific file
npx eslint src/components/Example.tsx

# Run with quiet mode (errors only, no warnings)
npm run lint -- --quiet
```

### TypeScript

```bash
# Run type checking
npm run type-check

# NEVER use 'tsc' directly - use the npm script
# NOT: tsc
# YES: npm run type-check
```

### Git Commands

```bash
# Add all files and commit with message
git add -A && git commit -m "feat: add new component"

# Add specific files
git add src/components/NewComponent.tsx src/components/NewComponent.test.tsx

# Push to specific branch
git push origin feature/us-003-navigation

# Stash with message
git stash push -m "WIP: working on navigation"

# Create and checkout branch in one command
git checkout -b feature/us-004-details
```

### Building

```bash
# Build the application
npm run build

# NEVER use 'next build' directly
# NOT: next build
# YES: npm run build
```

### Package Management

```bash
# Install dependencies from package-lock.json
npm ci

# Install new dependency
npm install package-name

# Install dev dependency
npm install -D package-name
```

### Process Management

```bash
# Start dev server in background (for testing)
npm run dev &
DEV_PID=$!

# Kill the dev server later
kill $DEV_PID

# Check if port is in use
lsof -i :3000

# Kill process on specific port
kill -9 $(lsof -t -i:3000)
```

### File Operations

```bash
# Remove files/directories forcefully
rm -rf .next node_modules

# Create directory structure
mkdir -p src/components/navigation

# Check if file exists
test -f path/to/file.ts && echo "exists" || echo "not found"

# Count lines in file
wc -l src/components/Example.tsx
```

### Curl Commands for Testing

```bash
# Test endpoint (fail on HTTP error)
curl -f http://localhost:3000/api/health

# Test with specific headers
curl -H "Content-Type: application/json" http://localhost:3000/api/accounts

# Silent mode with just status code
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# POST with data
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"Test"}' http://localhost:3000/api/accounts
```

### Quality Check Commands

```bash
# Run the unified quality check
npm run quality-check

# Or if script is executable
./scripts/quality-check.js
```

## 🎯 Agent-Specific Guidelines

### For DEVELOPER Agent

- Always use `npm test -- --watchAll=false` after creating test files
- Use `npm run lint` after each component (never --fix)
- Commit with full message: `git add -A && git commit -m "message"`

### For TESTER Agent

- Run coverage with: `npm test -- --watchAll=false --coverage`
- Test specific files: `npm test -- --watchAll=false FileName.test.tsx`

### For DEVOPS Agent

- Always specify branches: `git push origin branch-name`
- Use curl with `-f` flag to fail on errors
- Background processes should capture PID for cleanup

### For REVIEWER Agent

- Use `npm run type-check` for TypeScript validation
- Use `npm audit --audit-level=moderate` for security checks
- Never use auto-fix commands during review

## 💡 Quick Reference Card

```bash
# The Big 4 - Use These Most Often
npm test -- --watchAll=false          # Test
npm run lint                          # Lint
npm run type-check                    # Types
npm run build                         # Build

# Git Essentials
git add -A && git commit -m "msg"     # Commit
git push origin branch-name           # Push

# Development
npm run dev                           # Start dev
npm run quality-check                 # All checks
```

## ⚠️ Common Mistakes to Avoid

1. **Using `npm test` without flags** - This opens watch mode
2. **Using `git commit` without `-m`** - This opens editor
3. **Using `tsc` directly** - Use `npm run type-check`
4. **Forgetting `--` in npm test** - Flags won't pass through
5. **Using `jest` directly** - Use npm scripts instead

Remember: If a command might wait for input, it's wrong for agents!
