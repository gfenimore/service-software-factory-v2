# Gap Logger - Product Requirements Document
*Because Every Gap is a Learning Opportunity!*

## 1. The Core Context

### Problem Statement

**Current Conditions:**
For **Factory developers** generating components from partial information, the following conditions exist:

1. **Silent Assumptions** - Generators guess when info is missing, don't tell anyone
2. **Lost Learning** - We don't capture what was missing for next time
3. **Hidden Defaults** - Using fallbacks without documenting why
4. **Repeated Discoveries** - Same gaps found over and over
5. **No Improvement Loop** - Gaps don't get fixed systematically

**Impacts of These Conditions:**
- We don't know what we don't know
- Can't prioritize what to build next
- Generators make inconsistent guesses
- Knowledge isn't accumulated
- Same problems in Prototype that we had in Concept

**Our Solution:**
The Gap Logger is a **systematic gap discovery and tracking system** that logs every assumption, guess, and missing piece of information during generation. It turns gaps from problems into valuable intelligence about what tools and data we need.

### Product Philosophy
"Every gap discovered in Concept saves pain in Production"

## 2. What Gets Logged

### Categories of Gaps

#### Data Gaps
```javascript
gapLogger.logDataGap({
  category: 'MISSING_TYPE',
  entity: 'Account',
  field: 'accountName',
  expected: 'maxLength constraint',
  found: 'none',
  assumption: 'Using 255 characters',
  impact: 'MEDIUM',
  suggestedFix: 'Add maxLength to BUSM'
});
```

#### UI Hint Gaps
```javascript
gapLogger.logUIGap({
  category: 'MISSING_DISPLAY_HINT',
  field: 'status',
  expected: 'display format',
  found: 'none',
  assumption: 'showing as plain text',
  betterOption: 'colored badge',
  impact: 'LOW'
});
```

#### Navigation Gaps
```javascript
gapLogger.logNavigationGap({
  category: 'UNCLEAR_NAVIGATION',
  from: 'AccountList',
  to: 'AccountDetail',
  expected: 'navigation rule',
  assumption: 'rowClick navigates to detail',
  impact: 'HIGH'
});
```

#### Business Rule Gaps
```javascript
gapLogger.logRuleGap({
  category: 'MISSING_VALIDATION',
  entity: 'Account',
  field: 'balance',
  scenario: 'negative value',
  assumption: 'allowing negative',
  question: 'Should balance allow negative?',
  impact: 'HIGH'
});
```

## 3. Gap Logger Interface

### Core API
```javascript
class GapLogger {
  // Log a gap
  log(gap: Gap): void;
  
  // Get all gaps for current session
  getCurrentGaps(): Gap[];
  
  // Get gaps by category
  getGapsByCategory(category: string): Gap[];
  
  // Get gaps by impact
  getCriticalGaps(): Gap[];
  
  // Generate gap report
  generateReport(): GapReport;
  
  // Export for tracking
  exportToFile(filename: string): void;
}
```

### Gap Structure
```typescript
interface Gap {
  id: string;
  timestamp: Date;
  category: GapCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  context: {
    generator: string;      // Which generator found it
    entity?: string;       // Related entity
    field?: string;        // Related field
    component?: string;    // Component being generated
  };
  
  discovery: {
    expected: string;      // What we expected to find
    found: string;         // What we actually found
    assumption: string;    // What we did instead
  };
  
  recommendation: {
    fix: string;          // How to fix it
    owner: string;        // Who should fix (BUSM, ViewForge, etc.)
    effort: string;       // Estimated effort
  };
}
```

## 4. Output Formats

### Console Output (During Generation)
```
🔍 GAP: Missing display hint for Account.balance
   Expected: Display format specification
   Found: None
   Assuming: Plain number display
   Better: Currency with $ symbol
   Fix: Add displayAs: 'currency' to BUSM
```

### Summary Report (After Generation)
```
=== Gap Discovery Report ===
Generated: 2025-01-22 10:30:00
Component: AccountList

CRITICAL GAPS (Must Fix):
- Missing relationship definition: Account → Contact
- No validation rules for required fields

HIGH PRIORITY (Should Fix):
- No max length for accountName (assuming 255)
- No business rule for status transitions

MEDIUM PRIORITY (Consider):
- No display hints for currency fields
- No sort preferences defined

LOW PRIORITY (Nice to Have):
- No custom labels for technical fields
- No tooltip help text

STATISTICS:
- Total Gaps: 23
- By Category: Data(8), UI(7), Navigation(5), Rules(3)
- Fix Owners: BUSM(12), ViewForge(6), New Tool Needed(5)

RECOMMENDATIONS:
1. Add validation rules to BUSM
2. Create UI Hints configuration
3. Define navigation patterns
```

### JSON Export (For Tracking)
```json
{
  "session": {
    "id": "gap-session-2025-01-22-001",
    "generator": "concept-line",
    "timestamp": "2025-01-22T10:30:00Z"
  },
  "gaps": [
    {
      "id": "gap-001",
      "category": "MISSING_VALIDATION",
      "entity": "Account",
      "field": "accountName",
      "severity": "HIGH",
      "assumption": "No validation, accepting any string",
      "suggestedFix": "Add minLength: 3, maxLength: 100 to BUSM"
    }
  ],
  "summary": {
    "total": 23,
    "critical": 2,
    "high": 5,
    "medium": 10,
    "low": 6
  }
}
```

## 5. Integration Points

### Where Gap Logger Gets Called

#### ViewForge Reader
```javascript
function readViewForgeConfig(config) {
  if (!config.navigation) {
    gapLogger.log({
      category: 'MISSING_NAVIGATION',
      expected: 'Navigation rules',
      found: 'none',
      assumption: 'Using standard patterns'
    });
  }
}
```

#### BUSM Reader
```javascript
function getBUSMField(entity, field) {
  const fieldDef = busm[entity]?.[field];
  if (!fieldDef?.maxLength) {
    gapLogger.log({
      category: 'MISSING_CONSTRAINT',
      entity, field,
      expected: 'maxLength',
      assumption: 'Using 255'
    });
  }
}
```

#### Generators
```javascript
function generateField(field) {
  if (!field.displayHint) {
    gapLogger.log({
      category: 'MISSING_UI_HINT',
      field: field.name,
      assumption: 'Plain text display'
    });
  }
}
```

## 6. Success Metrics

- Every generation produces a gap report
- No silent assumptions
- Gaps decrease over time as we fill them
- Critical gaps get fixed within one sprint
- Knowledge accumulates in BUSM/configs

## 7. Future Enhancements

### Phase 2: Gap Tracking Database
- Store all historical gaps
- Track which gaps got fixed
- Identify recurring patterns
- Generate trend reports

### Phase 3: Automated Fix Suggestions
- Generate PRs for simple BUSM additions
- Create scaffolding for missing configs
- Suggest tool building priorities

### Phase 4: AI-Powered Gap Filling
- Learn from previous fixes
- Suggest likely values
- Auto-fill low-risk gaps

---

## The Value Proposition

**Without Gap Logger:** "Why doesn't the generated component look right?" 🤷‍♂️

**With Gap Logger:** "Here's exactly what's missing and how to fix it!" 📋

---

*PRD Version: 1.0.0*
*Created: 2025-01-22*
*Status: Essential for factory intelligence*