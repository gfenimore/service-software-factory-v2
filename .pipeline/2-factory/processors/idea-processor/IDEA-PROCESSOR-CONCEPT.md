# Idea Processor - Concept

## Purpose
Transform user feedback into actionable development items automatically.

## Feedback Processing Pipeline

```
User Feedback → Classification → Processing → Output
                       ↓               ↓           ↓
                   [Type/Priority]  [Agent]   [Artifact]
```

## Classification Rules

### 1. Simple UI Fix (< 30 min)
- **Examples**: Color change, text update, spacing adjustment
- **Action**: Generate component update directly
- **Output**: Modified HTML/CSS

### 2. Enhancement (< 2 hours)
- **Examples**: Add sorting, improve search, add tooltip
- **Action**: Create task slice
- **Output**: Task file for current sprint

### 3. New Feature (> 2 hours)
- **Examples**: New column, new data view, export function
- **Action**: Generate user story
- **Output**: User story for backlog

### 4. Bug/Issue
- **Examples**: Data not loading, incorrect calculation
- **Action**: Create bug ticket with reproduction steps
- **Output**: Bug report with context

## Processing Agents

### Quick Fix Agent
```javascript
function processQuickFix(feedback) {
    if (feedback.type === 'ui' && feedback.priority === 'low') {
        // Generate CSS update
        return generateCSSPatch(feedback);
    }
}
```

### Enhancement Agent
```javascript
function processEnhancement(feedback) {
    // Use context to understand current state
    const context = feedback.context;
    
    // Generate task slice
    return {
        type: 'task',
        title: `Enhancement: ${feedback.description.substring(0, 50)}`,
        acceptance: feedback.expectedBehavior,
        implementation: generateImplementationSteps(feedback)
    };
}
```

### Story Generator Agent
```javascript
function processNewFeature(feedback) {
    // Create full user story
    return {
        type: 'story',
        title: `User can ${extractAction(feedback.description)}`,
        value: estimateBusinessValue(feedback),
        acceptance: generateAcceptanceCriteria(feedback),
        priority: feedback.priority
    };
}
```

## Context Utilization

The captured context is crucial for:

1. **Understanding Current State**: What was user doing when they had the idea?
2. **Reproduction**: Can we recreate the scenario?
3. **Impact Analysis**: What components are affected?
4. **Validation**: Will the change break existing functionality?

## Example Feedback → Output

### Input
```json
{
    "type": "enhancement",
    "description": "Add a count badge showing number of work orders per location",
    "context": {
        "selectedAccount": "ACC-001",
        "visibleItems": {
            "locations": 5,
            "workOrders": 12
        }
    }
}
```

### Output (Task Slice)
```markdown
## Task: Add Work Order Count Badge to Locations

### Context
User viewing location list wants to see work order counts without clicking

### Implementation
1. Update location-item HTML template
2. Add badge element with count
3. Style badge (position: absolute, top-right)
4. Update data loading to include counts

### Acceptance
- [ ] Badge shows correct count
- [ ] Badge updates when work orders change
- [ ] Badge has proper styling
```

## Future Vision

### Immediate Processing (< 1 minute)
```javascript
// User submits feedback
feedback.submit() 
  → classify() 
  → generateArtifact() 
  → showPreview()
  → userApproves() 
  → autoImplement()
```

### Learning Loop
```javascript
// Track which ideas get implemented
trackImplementation(feedback.id, {
    implemented: true,
    timeToImplement: '2 hours',
    userSatisfaction: 5
});

// Improve classification over time
updateClassifier(feedback, outcome);
```

## Integration with Concept Generator

Add feedback injection point:
```javascript
// In CONCEPT-GENERATOR.js
function generateHTML(tasks, feedback = []) {
    const baseHTML = generateBaseStructure(tasks);
    
    // Apply approved feedback patches
    const enhancedHTML = applyFeedbackPatches(baseHTML, feedback);
    
    // Inject feedback collector
    const finalHTML = injectFeedbackCollector(enhancedHTML);
    
    return finalHTML;
}
```

## Feedback Storage Structure

```
.pipeline/
├── feedback/
│   ├── raw/                 # Original feedback
│   │   └── 2025-01-19/
│   │       └── FB-*.json
│   ├── processed/            # Classified and processed
│   │   ├── quick-fixes/
│   │   ├── enhancements/
│   │   └── features/
│   └── implemented/          # Completed items
│       └── manifest.json
```

## CLI Commands

```bash
# Process pending feedback
npm run feedback:process

# Generate report
npm run feedback:report

# Auto-implement quick fixes
npm run feedback:quick-fix --auto-approve

# Export to backlog
npm run feedback:export-backlog
```

## Benefits

1. **Immediate Capture**: Ideas captured in context
2. **Automatic Triage**: No manual classification needed
3. **Fast Iteration**: Quick fixes applied immediately
4. **Learning System**: Improves over time
5. **Context Preservation**: Never lose the "why"

## Next Steps

1. Inject feedback collector into current concept HTML
2. Create feedback processor CLI tool
3. Build simple classification rules
4. Test with real feedback
5. Create feedback → story/task pipeline