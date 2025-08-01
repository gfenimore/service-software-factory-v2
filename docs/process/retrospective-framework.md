# Retrospective Framework

**Version**: 1.0  
**Purpose**: Continuous learning and improvement after each feature/iteration

## When to Run Retrospectives

- After each user story completion
- After any production incident
- Weekly for ongoing work
- After major milestones

## Retrospective Format (30 minutes)

### 1. Data Gathering (5 min)

Collect objective metrics:

- Time estimated vs actual
- Number of commits
- Test coverage achieved
- Build/deploy success rate
- Any production issues

### 2. The 4 L's Framework (20 min)

#### 😊 Liked

What went well? What should we keep doing?

#### 📚 Learned

What new knowledge did we gain?

#### 😐 Lacked

What was missing? What hindered us?

#### 🚀 Longed For

What do we wish we had? Future improvements?

### 3. Action Items (5 min)

- Pick 1-3 concrete improvements
- Assign owners
- Set completion dates

## Retrospective Template

```markdown
# Retrospective: [Feature Name]

**Date**: [Date]
**Participants**: [Names]
**Feature**: [US-XXX]

## Metrics

- Estimated time: X hours
- Actual time: Y hours
- Commits: Z
- Tests written: A
- Coverage: B%
- Deployment status: ✅/❌

## 😊 Liked

-
-

## 📚 Learned

-
-

## 😐 Lacked

-
-

## 🚀 Longed For

-
-

## Action Items

1. [ ] [Action] - Owner: [Name] - Due: [Date]
2. [ ] [Action] - Owner: [Name] - Due: [Date]

## Patterns Emerging

(After multiple retros, what patterns do we see?)
```

## Storage Location

`/docs/retrospectives/[YYYY-MM-DD]-[feature-name].md`

## Key Questions to Consider

### Technical

- Did our infrastructure choices help or hinder?
- Were the agent workflows effective?
- Any repeated errors or bugs?
- Testing adequate?

### Process

- Communication clear?
- Requirements understood?
- Blocked anywhere?
- Tools working well?

### Learning

- New patterns discovered?
- Better ways found?
- Knowledge gaps identified?
- Documentation needs?

## Making It Stick

1. **Start small** - Even 15 min is better than nothing
2. **Be specific** - "API was slow" → "Accounts API took 3s to load 20 records"
3. **No blame** - Focus on systems, not people
4. **Follow through** - Actually do the action items
5. **Share learnings** - Update docs/standards based on findings

## Example Action Items

- "Create snippet for common API pattern"
- "Add performance test to CI pipeline"
- "Document Supabase query optimization"
- "Create UI component library"
- "Add error boundary template"
