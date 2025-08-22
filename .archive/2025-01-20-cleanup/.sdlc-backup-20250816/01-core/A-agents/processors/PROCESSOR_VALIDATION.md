# 🚨 CRITICAL: Processor Security Validation Rules

**Date**: January 17, 2025  
**Purpose**: Prevent processors from generating vulnerable code  
**Authority**: Multi-LLM Security Audit Consensus

---

## ⛔ FORBIDDEN PATTERNS - MUST BLOCK

### 1. Hardcoded Credentials (CWE-798)

```javascript
// FORBIDDEN PATTERNS TO DETECT:
const CREDENTIAL_PATTERNS = [
  /const \w+ = ['"]eyJ[a-zA-Z0-9+/=]+['"]/, // JWT tokens
  /const \w+ = ['"]sk_[a-zA-Z0-9]+['"]/, // Secret keys
  /const \w+ = ['"]sb_secret_[a-zA-Z0-9_]+['"]/, // Supabase secrets
  /https:\/\/[a-z]+\.supabase\.co/, // Hardcoded URLs
  /postgresql:\/\/[^:]+:[^@]+@/, // Database URLs
]
```

### 2. Unvalidated Input (CWE-20)

```javascript
// FORBIDDEN:
const UNSAFE_INPUT_PATTERNS = [
  /\.insert\(\{\s*\.\.\.body\s*\}\)/, // Spread operator without validation
  /\.insert\(\{\s*\.\.\.req\.body\s*\}\)/, // Direct request body
  /\.update\(\{\s*\.\.\.data\s*\}\)/, // Unvalidated data
  /JSON\.parse\(.*\)(?!.*catch)/, // JSON.parse without try-catch
]
```

### 3. Error Exposure (CWE-209)

```javascript
// FORBIDDEN:
const ERROR_EXPOSURE_PATTERNS = [
  /return.*error\.message/, // Exposing error messages
  /res\.json\(.*error\.stack/, // Stack traces
  /details:\s*error/, // Full error objects
  /console\.log\(.*password/, // Logging sensitive data
]
```

### 4. SQL Injection Risks (CWE-89)

```javascript
// FORBIDDEN:
const SQL_INJECTION_PATTERNS = [
  /\$\{.*\}.*WHERE/, // Template literals in SQL
  /\+.*\+.*WHERE/, // String concatenation in queries
  /\.raw\(/, // Raw SQL without parameterization
]
```

### 5. Performance Anti-patterns

```javascript
// FORBIDDEN:
const PERFORMANCE_PATTERNS = [
  /\.select\(['"`]\*['"`]\)/, // Select all columns
  /createClient\([^)]+\)(?!.*singleton)/, // Client per request
  /await.*forEach/, // Async in forEach
  /new Promise.*setTimeout(?!.*test)/, // Sleep in production code
]
```

---

## ✅ REQUIRED PATTERNS - MUST INCLUDE

### 1. Environment Variables for Credentials

```typescript
// REQUIRED for any credentials:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables')
}
```

### 2. Input Validation with Zod

```typescript
// REQUIRED for all API inputs:
import { z } from 'zod'

const schema = z.object({
  field: z.string().min(1).max(100),
  // ... define all fields
})

const validated = schema.parse(body)
// Use validated, never raw body
```

### 3. Error Sanitization

```typescript
// REQUIRED for all error responses:
catch (error) {
  console.error('Operation failed:', error) // Log full error server-side
  return res.status(500).json({
    error: 'Operation failed' // Generic message to client
  })
}
```

### 4. Pagination for Lists

```typescript
// REQUIRED for all list operations:
.range(offset, offset + limit - 1)
.limit(20) // Always set a limit
```

### 5. Specific Column Selection

```typescript
// REQUIRED instead of SELECT *:
.select('id, name, email, status') // Specific columns only
```

---

## 🛠️ PROCESSOR TEMPLATE UPDATES REQUIRED

### TYPE-PROCESSOR

```typescript
// Add to template:
/**
 * SECURITY: All inputs must be validated with Zod
 * PERFORMANCE: Use specific types, avoid 'any'
 */
```

### HOOK-PROCESSOR

```typescript
// Add to template:
// SECURITY: Never expose credentials in hooks
// PERFORMANCE: Use singleton pattern for clients
const supabase = getSupabaseClient() // Singleton
```

### REACT-PROCESSOR

```typescript
// Add to template:
// SECURITY: Sanitize all user inputs
// PERFORMANCE: Use React.memo for expensive components
```

### SCAFFOLD-PROCESSOR

```typescript
// Add to template:
// ARCHITECTURE: Include service layer
// SECURITY: Add input validation schemas
```

---

## 📋 VALIDATION CHECKLIST FOR EVERY PROCESSOR

Before ANY code generation:

- [ ] No hardcoded credentials
- [ ] All inputs validated
- [ ] Errors sanitized
- [ ] Pagination included
- [ ] Specific columns selected
- [ ] Service layer used
- [ ] Singleton pattern for clients
- [ ] TypeScript types (no 'any')

---

## 🔧 IMPLEMENTATION SCRIPT

```javascript
// processor-validator.js
function validateGeneratedCode(code, processorName) {
  const violations = []

  // Check forbidden patterns
  FORBIDDEN_PATTERNS.forEach((pattern) => {
    if (pattern.regex.test(code)) {
      violations.push({
        severity: 'CRITICAL',
        pattern: pattern.name,
        processor: processorName,
        fix: pattern.fix,
      })
    }
  })

  // Check required patterns
  REQUIRED_PATTERNS.forEach((pattern) => {
    if (!pattern.regex.test(code)) {
      violations.push({
        severity: 'HIGH',
        missing: pattern.name,
        processor: processorName,
        required: pattern.template,
      })
    }
  })

  if (violations.length > 0) {
    throw new ProcessorValidationError(violations)
  }

  return true
}
```

---

## ⚠️ CRITICAL REMINDER

**These validations are NOT optional!**

The audit found that our processors have been systematically generating:

- Hardcoded credentials (worth $500K-$5M risk)
- SQL injection vulnerabilities
- Performance bottlenecks
- Architectural anti-patterns

Every processor MUST be updated to prevent these issues.

---

## 📊 PROCESSOR RISK MATRIX

| Processor              | Risk Level | Issues Found          | Priority  |
| ---------------------- | ---------- | --------------------- | --------- |
| HOOK-PROCESSOR         | CRITICAL   | Hardcoded credentials | Immediate |
| REACT-PROCESSOR        | HIGH       | No input validation   | 24 hours  |
| SCAFFOLD-PROCESSOR     | HIGH       | No service layer      | 48 hours  |
| TYPE-PROCESSOR         | MEDIUM     | Uses 'any' type       | 1 week    |
| INTEGRATION-SPECIALIST | CRITICAL   | Propagates all issues | Immediate |

---

**ENFORCEMENT**: All code generation must pass validation before execution!
