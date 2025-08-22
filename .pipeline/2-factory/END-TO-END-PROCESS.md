# End-to-End Process: Requirements → Cards

## Clean Slate Starting Point

### Input Documents Required:
1. ✅ **Requirements Spec**: `.pipeline/1-inputs/requirements/1.1.1-master-view/1.1.1-master-view-spec.md`
2. ✅ **BUSM Data Model**: `.pipeline/1-inputs/busm/BUSM.yaml`

---

## The Complete Flow

### Step 1: Field Selection (USER INPUT NEEDED)
**Purpose**: You select which fields from BUSM should appear on cards

**Process**:
1. We show you available fields from BUSM
2. You check the ones you want to see
3. We save your selections

**Output**: Field configuration for each entity

---

### Step 2: Story Builder Agent
**Command**: Use agent, not processor
**Purpose**: Convert requirements into user stories

**Input**: 
- Requirements spec
- BUSM model

**Output**:
- User stories with acceptance criteria
- Requirements mapping

---

### Step 3: Planner Agent  
**Purpose**: Break stories into implementation tasks

**Input**:
- User stories
- Field configurations

**Output**:
- Task breakdowns
- Value slices

---

### Step 4: Pattern-Based Generator
**Purpose**: Generate the actual HTML using patterns + your field selections

**Input**:
- Task breakdowns
- Field configurations
- Design tokens

**Output**:
- Complete HTML concept with 3 columns
- All three card types (Accounts, Locations, Work Orders)

---

## The Critical Decision Point: Field Selection

### For Account Cards, you need to choose:
```
Essential Fields (always shown):
□ AccountName
□ AccountStatus

Choose additional fields (pick 3-5):
□ AccountType (Residential/Commercial)
□ BillingCity
□ PrimaryContact.FullName
□ PrimaryContact.Phone
□ PrimaryContact.Email
□ LastServiceDate
□ NextServiceDate
□ AccountValue
□ ServiceLocations (count)
```

### For Location Cards, you need to choose:
```
Essential Fields (always shown):
□ LocationName
□ LocationStatus

Choose additional fields (pick 3-5):
□ LocationType
□ ServiceAddress
□ ServiceCity
□ AccessNotes
□ ServiceFrequency
□ LastServiceDate
□ NextServiceDate
□ WorkOrders (count)
□ Equipment (count)
```

### For Work Order Cards, you need to choose:
```
Essential Fields (always shown):
□ WorkOrderNumber
□ Title
□ Status

Choose additional fields (pick 3-5):
□ Priority
□ WorkOrderType
□ ScheduledDate
□ DueDate
□ AssignedTo
□ EstimatedHours
□ LocationName
□ AccountName
```

---

## Two Paths Forward

### Option A: Interactive Selection
I create an HTML form where you check boxes to select fields

### Option B: Quick Config
You tell me which fields you want, I configure them directly

### Option C: Use Smart Defaults
I use the configurations we already built yesterday (reasonable defaults)

---

## What Happens After Selection

1. Your selections get saved to `field-configuration.js`
2. We run the Story Builder to create stories
3. We run the Planner to create tasks
4. Generator uses your selections to build cards
5. Result: Clean HTML with exactly the fields you want

---

## Question for You:

**How do you want to make field selections?**

A) Interactive HTML form (check boxes)
B) Just tell me what you want to see
C) Use the defaults we already have

Once you decide, we can do the complete end-to-end run!