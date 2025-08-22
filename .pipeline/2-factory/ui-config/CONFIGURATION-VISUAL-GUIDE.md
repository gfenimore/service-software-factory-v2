# Configuration Process - Visual Guide

## How Configuration Works (Simple Version)

Think of it like choosing an outfit:
1. **Pick a Pattern** (like choosing shirt style)
2. **Select Fields** (like choosing colors/accessories)  
3. **Generate UI** (the complete outfit)

---

## Step-by-Step Example: "I want to see phone numbers on Account cards"

### Step 1: You Give Feedback
```
"When viewing account cards, I want to see the 
primary contact's phone number"
```

### Step 2: We Update Configuration
```javascript
// In field-configuration.js
getAccountCardConfig('list') {
  fields: {
    primary: 'AccountName',
    secondary: 'PrimaryContact.Phone',  // ← Added this!
    badge: 'AccountStatus'
  }
}
```

### Step 3: Generator Creates New UI
The generator automatically:
- Finds the phone in your data
- Formats it nicely: (813) 555-1234
- Places it in the card

---

## The 4 Card Patterns (Visual)

```
COMPACT (10+ items visible)        LIST (8-12 items visible)
┌─────────────────────┐           ┌─────────────────────────┐
│ Name           Badge │           │ 👤 │ Name              │
│ Type • City • Count  │           │    │ Phone • Email     │
└─────────────────────┘           └─────────────────────────┘

DATA (3-5 items visible)           METRIC (5-7 items visible)
┌─────────────────────┐           ┌─────────────────────┐
│ Name           Badge │           │ LABEL               │
│ ┌─────┬─────┐       │           │ $1,234             │
│ │Label│Value│       │           │ ─────────────────   │
│ │Label│Value│       │           │ Metric • Metric     │
│ └─────┴─────┘       │           └─────────────────────┘
└─────────────────────┘
```

---

## Real Example: Accounts Column

### Current Configuration:
```javascript
compact: {
  title: 'AccountName',        // Big text at top
  badge: 'AccountStatus',      // Status badge (Active/Pending)
  metadata: [                  // Bottom line info
    'AccountType',            // "Residential"
    'BillingCity',           // "Brandon"
    'LocationCount'          // "3 locations"
  ]
}
```

### What You See:
```
┌──────────────────────────────┐
│ Martinez Residence    ACTIVE │
│ Residential • Brandon • 3 loc │
└──────────────────────────────┘
```

---

## How to Request Changes

### Example 1: "Add email to cards"
**Your feedback:** "Show email addresses on account cards"

**What happens:**
1. We add `PrimaryContact.Email` to configuration
2. Generator pulls email from data
3. New cards show email

### Example 2: "Too many cards, make them smaller"
**Your feedback:** "Account list is too long, need to see more at once"

**What happens:**
1. We switch from `list` to `compact` pattern
2. Cards get smaller automatically
3. You see 10+ instead of 8

### Example 3: "Need more detail on work orders"
**Your feedback:** "Work orders need to show assigned technician and due date"

**What happens:**
1. We switch to `data` pattern for work orders
2. Add `AssignedTo` and `DueDate` fields
3. Cards show full details

---

## Quick Reference: What You Control

### 1. Information Shown
- Which fields appear
- Order of fields
- Grouping of related data

### 2. Visual Density
- Compact: Maximum items
- List: Balance  
- Data: Maximum detail

### 3. Special Formatting
- Phone: (555) 123-4567
- Money: $1,234.56
- Dates: Jan 15, 2025
- Status: Colored badges

---

## The Magic: No Code Required!

### Traditional Way (Days/Weeks)
1. Meeting to discuss mockups
2. Designer creates wireframes
3. Review meeting
4. Developer codes it
5. Testing
6. Revisions...

### Our Way (Minutes)
1. You: "Add phone numbers"
2. We: Update configuration
3. Done! New UI generated

---

## Common Patterns

### Account Cards Usually Show:
- Name (always)
- Status badge
- Type
- Location/City
- Contact info (optional)

### Location Cards Usually Show:
- Location name
- Address
- Status
- Work order count

### Work Order Cards Usually Show:
- Order number
- Title/Description
- Priority
- Due date
- Assigned technician
- Status

---

## FAQ

**Q: Can I see different fields in different columns?**
A: Yes! Accounts can use `compact`, Locations use `list`, Work Orders use `data`.

**Q: What if I want a field that doesn't exist?**
A: We first add it to the data model (BUSM), then to configuration.

**Q: Can the same data look different in different places?**
A: Yes! Phone can be a link in one place, plain text in another.

**Q: How do I know what fields are available?**
A: Check the BUSM.yaml file, or just ask for what you want to see!

---

## Your Role in Configuration

### You Provide:
✅ What information matters to you
✅ How much detail you need
✅ What's missing or wrong
✅ Workflow preferences

### We Handle:
✅ Technical configuration
✅ Pattern selection
✅ Field formatting
✅ Layout optimization

---

## Next Steps

1. **Look at current UI** - What's missing?
2. **Submit feedback** - Click 💡 button
3. **We configure** - Update patterns/fields
4. **Review new version** - Repeat until perfect

Remember: You're the expert on what information you need to see. We're the experts on making it happen. Together, we build the perfect UI without mockup marathons!