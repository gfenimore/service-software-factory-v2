# Field Selection Contexts - Brainstorming

## The Big Question: When & Why Do We Choose Different Fields?

### Context 1: User Role
Different users need different information!

**Dispatcher View:**
- Needs: Technician availability, location, priority
- Doesn't need: Billing details, contract terms

**Billing Department:**
- Needs: Account balance, payment terms, contract value
- Doesn't need: Technical equipment details

**Field Technician:**
- Needs: Equipment model, service history, access notes
- Doesn't need: Financial information

**Sales Team:**
- Needs: Opportunity status, contract expiration, growth potential
- Doesn't need: Technical service details

---

### Context 2: Task/Workflow Stage
Same user, different moments need different fields!

**Morning Planning:**
- Today's route
- Priority emergencies
- Technician assignments
- Drive times

**During Service Call:**
- Equipment details
- Service history
- Customer notes
- Safety warnings

**End of Day Review:**
- Completed count
- Tomorrow's schedule
- Overtime hours
- Incomplete reasons

---

### Context 3: Information Density Needs

**"Scanning Mode" (Finding something fast):**
- Minimal fields (3-4 max)
- Just identifiers
- Visual indicators
- Pattern: COMPACT

**"Comparison Mode" (Choosing between options):**
- Moderate fields (5-7)
- Key differentiators
- Decision factors
- Pattern: LIST or METRIC

**"Analysis Mode" (Deep dive):**
- Maximum fields (8-12)
- All relevant data
- Historical info
- Pattern: DATA

---

### Context 4: Screen Real Estate

**Mobile (Phone):**
- 2-3 fields max
- Critical only
- Tap targets
- Vertical scrolling OK

**Tablet:**
- 4-6 fields
- Balanced view
- Touch-friendly
- Some horizontal space

**Desktop - Dashboard:**
- 3-5 fields per card
- Multiple cards visible
- Glanceable

**Desktop - Working View:**
- 6-10 fields
- Full context
- Multi-column

---

### Context 5: Business Scenarios

**Emergency Response:**
- Location (WHERE)
- Contact (WHO)
- Problem (WHAT)
- Priority (WHEN)
- *Skip everything else*

**Quarterly Business Review:**
- Revenue metrics
- Service performance
- Growth trends
- Contract status
- *Skip operational details*

**New Customer Onboarding:**
- Contact information
- Service locations
- Equipment inventory
- Access requirements
- *Skip history (none exists)*

**Collection Activities:**
- Outstanding balance
- Days overdue
- Last payment
- Contact attempts
- *Skip service details*

---

### Context 6: Data Freshness Requirements

**Real-Time Critical:**
- Status (must be current)
- Assignment (who's on it NOW)
- Location (where are they NOW)

**Daily Update OK:**
- Scheduled dates
- Standard prices
- Contact info

**Historical/Stable:**
- Account type
- Original install date
- Contract terms

---

### Context 7: Relationship Distance

**Direct Properties** (Always available):
- AccountName
- Status
- Type
- City

**One Hop** (Requires join):
- PrimaryContact.Name
- ServiceLocation.Count
- LastWorkOrder.Date

**Two+ Hops** (Performance cost):
- Location.LastWorkOrder.Technician.Name
- Account.Contract.Terms.PaymentSchedule

---

## Key Insight: Context Combinations!

Real situations combine multiple contexts:

**Example: "Field Tech on Mobile During Emergency"**
- Role: Field Tech
- Task: Emergency Response  
- Device: Mobile
- Scenario: Emergency
- Need: Real-time

**Result: Ultra-minimal fields**
- Address
- Problem
- Contact Phone
- Access Code
(Everything else is noise!)

---

## Questions We Should Ask When Selecting Fields:

1. **WHO is using this?** (Role)
2. **WHAT are they trying to do?** (Task)
3. **WHERE are they?** (Location/Device)
4. **WHEN are they doing it?** (Time pressure)
5. **WHY do they need this info?** (Decision/Action)
6. **HOW MANY items at once?** (Density)
7. **HOW FAST must it load?** (Performance)
8. **HOW OFTEN does it change?** (Freshness)

---

## Proposed Solution: Context Profiles

Instead of selecting fields every time, we create **Context Profiles**:

```yaml
profiles:
  dispatcher-morning:
    role: dispatcher
    task: planning
    fields:
      - WorkOrderNumber
      - Priority
      - Location
      - AssignedTech
      - ScheduledTime
    pattern: compact
  
  tech-onsite:
    role: technician
    task: service
    fields:
      - Equipment
      - ServiceHistory
      - CustomerNotes
      - SafetyWarnings
    pattern: data
  
  billing-review:
    role: billing
    task: collections
    fields:
      - AccountName
      - Balance
      - DaysOverdue
      - LastPayment
      - ContactPhone
    pattern: list
```

---

## The Selection Interface Should Ask:

### Step 1: Context
"What context are you configuring for?"
- [ ] Morning Planning
- [ ] Active Service
- [ ] Customer Review
- [ ] Emergency Response
- [ ] Billing/Collections
- [ ] Sales Activities
- [x] General Use (Default)

### Step 2: User Type
"Who will use this view?"
- [ ] Dispatcher
- [ ] Field Technician
- [ ] Customer Service
- [ ] Billing Team
- [ ] Management
- [x] Everyone (Default)

### Step 3: Density
"How many items need to be visible?"
- [ ] Maximum (10+) → Minimal fields
- [x] Moderate (5-10) → Balanced fields
- [ ] Few (3-5) → Detailed fields

### Step 4: Field Selection
"Check the fields you need to see:"
[Dynamic list based on context]

---

## This Changes Everything!

Instead of one configuration, we need:
```javascript
getAccountCardConfig(context = 'default') {
  const configs = {
    'dispatcher-morning': { /* minimal */ },
    'tech-onsite': { /* equipment focused */ },
    'billing-review': { /* financial focused */ },
    'default': { /* balanced */ }
  };
  
  return configs[context] || configs.default;
}
```

---

## Next Questions:

1. Should users switch contexts manually or auto-detect?
2. Should we save user preferences per context?
3. Can users create custom contexts?
4. Should contexts cascade (role → task → specific)?
5. How do we handle conflicting context needs?

What do you think? Which contexts are most important for your use cases?