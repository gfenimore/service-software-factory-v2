# How to Edit Business Rules

## Quick Start

### Option 1: Interactive CLI (Recommended)
```bash
cd .pipeline/factory-tools/business-rules-configurator
npm run cli
```

This opens an interactive menu where you can:
- Edit required/unique fields
- Modify state transitions  
- Add validation patterns
- Configure business logic
- Save and regenerate

### Option 2: Quick Commands
```bash
# Make a field required
npm run cli
# Then type: require website

# Make a field unique  
npm run cli
# Then type: unique email

# Add state transition
npm run cli
# Then type: transition Active Archived
```

### Option 3: Direct YAML Edit
Edit the file directly:
```
.pipeline/factory-tools/module-system/phase1-account-basic.yaml
```

## Examples of Real Values

### Making Fields Required for Your Business
```yaml
validation:
  required:
    - accountName      # Company legal name
    - accountType      # Customer classification
    - website          # Add this if you require it
    - primaryContact   # Add in Phase 3
```

### Setting Up Your State Workflow
```yaml
states:
  Lead:              # Before they're a customer
    transitions: [Prospect, Disqualified]
  
  Prospect:          # Evaluating
    transitions: [Customer, Lost]
  
  Customer:          # Active customer
    transitions: [Inactive, Churned]
  
  Inactive:          # Temporarily inactive
    transitions: [Customer, Churned]
```

### Adding Your Validation Rules
```yaml
validation:
  patterns:
    accountName: "^[A-Za-z0-9\\s\\-\\.\\&]+$"  # Allow & for companies
    phone: "^\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$"  # (555) 555-5555
    taxId: "^[0-9]{2}-[0-9]{7}$"  # 12-3456789
```

### Business Logic for Your Process
```yaml
logic:
  onCreate:
    - action: setState
      value: Lead              # Your initial state
    
    - action: generateField
      field: accountNumber
      format: "CUS-{YYYY}-{0000}"  # Your numbering scheme
    
    - action: sendNotification
      to: salesTeam
      template: new_lead_alert
  
  onStateChange:
    Lead_to_Customer:
      - action: requireFields
        fields: [contractNumber, creditLimit]
      
      - action: sendEmail
        template: welcome_customer
```

## Common Customizations

### 1. Service Industry Example
```yaml
# For service companies
validation:
  required: [accountName, serviceAddress, contractType]

states:
  Inquiry: [Quote, NotInterested]
  Quote: [Contract, Declined]
  Contract: [Active, Suspended, Terminated]
  Active: [Suspended, Terminated, Renewed]
```

### 2. B2B Sales Example  
```yaml
# For B2B sales
validation:
  required: [companyName, taxId, creditCheck]
  
conditional:
  - when: dealSize > 100000
    require: [approvalManager, purchaseOrder]
```

### 3. Subscription Business
```yaml
# For subscription model
states:
  Trial: [Paid, Expired]
  Paid: [Cancelled, PastDue]
  PastDue: [Paid, Cancelled]
  Cancelled: [Reactivated]
```

## Testing Your Changes

After editing rules:

```bash
# Validate the rules are correct
npm run validate

# Regenerate the concept views
npm run generate:phase1

# Open the HTML files to see changes
start .pipeline/generated/phase1-account/
```

## Tips

1. **Start Simple** - Don't add all rules at once
2. **Test Often** - Regenerate after each change
3. **Use the CLI** - It prevents syntax errors
4. **Keep Backups** - CLI creates .backup files automatically
5. **Document Why** - Add comments in YAML for complex rules

## Need Help?

- Rules not loading? Check YAML syntax
- Changes not showing? Regenerate the views
- Validation errors? Run `npm run validate`

Remember: Business rules should reflect YOUR actual business process, not generic examples!