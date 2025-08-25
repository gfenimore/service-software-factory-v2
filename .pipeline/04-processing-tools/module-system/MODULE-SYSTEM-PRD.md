# Module System - Product Requirements Document
*Building the Service App Incrementally, Module by Module*

## 1. The Critical Insight

You're building a SERVICE application incrementally, which means:
- Not all entities are needed at once
- Business rules apply within module boundaries
- Navigation is scoped to module context
- Each module is a deliverable unit

## 2. Problem Statement

**Current State:**
- ViewForge assumes all entities available
- Business Rules have no module context
- Navigation crosses all boundaries
- Can't build/test one module at a time

**Future State:**
- Modules define entity boundaries
- ViewForge generates per module
- Business Rules scoped to module
- Each module independently deployable

## 3. Module Definition Structure

### 3.1 Module Configuration
```yaml
# modules/account-management.yaml
module:
  id: account-management
  name: Account Management
  version: 1.0.0
  description: Core account and contact management
  
  # Which entities belong to this module
  entities:
    owned:  # This module owns these entities
      - Account
      - Contact
      - AccountContact  # Junction table
    
    referenced:  # Can reference but not modify
      - User  # For ownership
      - Territory  # For assignment
  
  # Module dependencies
  dependencies:
    - user-management  # Need users for ownership
    - territory-management  # Need territories for assignment
  
  # Entry points
  navigation:
    main_menu:
      - label: Accounts
        view: account-list
        icon: building
      - label: Contacts
        view: contact-list
        icon: users
    
    dashboard_widgets:
      - recent-accounts
      - my-accounts
  
  # Module-specific business rules
  business_rules:
    file: account-management-rules.yaml
    
  # ViewForge configs for this module
  views:
    - account-list
    - account-detail
    - account-form
    - contact-list
    - contact-detail
    - contact-form
```

### 3.2 Module Boundaries
```yaml
# modules/opportunity-management.yaml
module:
  id: opportunity-management
  name: Opportunity Management
  version: 1.0.0
  
  entities:
    owned:
      - Opportunity
      - OpportunityLineItem
      - OpportunityStage
    
    referenced:
      - Account  # From account-management module
      - Contact  # From account-management module
      - Product  # From product-catalog module
  
  # Cross-module navigation
  cross_module_navigation:
    from_account_detail:
      - action: view_opportunities
        target: opportunity-list
        filter: accountId
    
    from_opportunity_detail:
      - action: view_account
        target: account-detail  # Goes to account-management module
        params: accountId
```

## 4. How Modules Control Generation

### 4.1 Scoped ViewForge Generation
```javascript
// Generate only for a specific module
npm run generate:concept --module account-management

// ViewForge only processes:
// - Entities in module.entities.owned
// - Views in module.views
// - Navigation within module boundaries
```

### 4.2 Scoped Business Rules
```yaml
# account-management-rules.yaml
module: account-management
scope: module  # Rules only apply within this module

rules:
  Account:  # Only Account entity rules
    validation:
      required: [accountName, accountType]
    states:
      # States specific to this module's workflow
      Draft: [Active]
      Active: [Archived]
  
  Contact:  # Only Contact entity rules
    validation:
      required: [firstName, lastName, email]
```

### 4.3 Cross-Module References
```yaml
# How to handle cross-module relationships
cross_module:
  # When Opportunity references Account
  opportunity_to_account:
    type: reference_only  # Can't modify Account from Opportunity module
    navigation: 
      type: link
      target_module: account-management
      target_view: account-detail
    display:
      fields: [accountName, accountType]  # What fields to show
      readonly: true  # Can't edit from this module
```

## 5. Module-Based Development Workflow

### Step 1: Define Module
```yaml
# Start with smallest viable module
module:
  id: contacts-basic
  entities:
    owned: [Contact]
  views: [contact-list, contact-form]
```

### Step 2: Generate Module
```bash
# Generate everything for one module
npm run module:generate contacts-basic

# Creates:
# - /generated/contacts-basic/concept/
# - /generated/contacts-basic/prototype/
# - /generated/contacts-basic/rules/
```

### Step 3: Test Module
```bash
# Test just this module
npm run module:test contacts-basic

# Validates:
# - All owned entities have BUSM definitions
# - All views have ViewForge configs
# - All rules are valid
# - No broken cross-references
```

### Step 4: Build Incrementally
```
Week 1: contacts-basic (just contacts)
Week 2: accounts-basic (accounts + link to contacts)
Week 3: account-contacts (full relationship)
Week 4: opportunities (references accounts)
```

## 6. Implementation in Our Tools

### 6.1 ViewForge Changes
```javascript
class ViewForgeTransformer {
  constructor(busm, gapLogger, moduleConfig) {
    this.module = moduleConfig;
    this.allowedEntities = [
      ...moduleConfig.entities.owned,
      ...moduleConfig.entities.referenced
    ];
  }
  
  transformView(viewConfig) {
    // Only allow navigation within module
    if (!this.module.views.includes(viewConfig.navigation.target)) {
      // Mark as cross-module navigation
      viewConfig.navigation.crossModule = true;
      viewConfig.navigation.targetModule = this.findTargetModule(target);
    }
  }
}
```

### 6.2 Business Rules Changes
```javascript
class BusinessRulesConfigurator {
  constructor(moduleConfig) {
    this.module = moduleConfig;
    this.scope = moduleConfig.entities.owned;
  }
  
  validateRule(rule) {
    // Can only define rules for owned entities
    if (!this.scope.includes(rule.entity)) {
      throw new Error(`Cannot define rules for ${rule.entity} in module ${this.module.id}`);
    }
  }
}
```

### 6.3 Generator Changes
```javascript
class ConceptGenerator {
  constructor(moduleConfig) {
    this.module = moduleConfig;
  }
  
  generateNavigation(view) {
    if (view.navigation.crossModule) {
      // Generate link to other module
      return `<a href="../${view.navigation.targetModule}/${view.navigation.target}.html">`;
    } else {
      // Generate internal navigation
      return `<a href="${view.navigation.target}.html">`;
    }
  }
}
```

## 7. Module Hierarchy

### 7.1 Core Modules (Build First)
```
foundation/
├── user-management
├── territory-management
└── security-roles
```

### 7.2 Business Modules (Build Next)
```
business/
├── account-management
│   ├── accounts-basic
│   └── contacts-basic
├── opportunity-management
│   ├── opportunities-basic
│   └── opportunity-pipeline
└── product-catalog
    ├── products-basic
    └── pricing-rules
```

### 7.3 Advanced Modules (Build Later)
```
advanced/
├── reporting-analytics
├── workflow-automation
└── integration-apis
```

## 8. Benefits of Module System

1. **Incremental Development** - Build one module at a time
2. **Clear Boundaries** - Know what belongs where
3. **Scoped Testing** - Test modules independently
4. **Managed Dependencies** - Know what depends on what
5. **Parallel Development** - Teams can work on different modules
6. **Progressive Deployment** - Deploy modules as they're ready

## 9. Module Definition Example

```yaml
# The simplest possible starting module
module:
  id: hello-world
  name: Hello World Module
  entities:
    owned: [Message]
  
  views:
    - message-list
    - message-form
  
  business_rules:
    Message:
      validation:
        required: [text]
      
  # No dependencies, no cross-references
  # Can be built and tested completely independently
```

## 10. Success Metrics

- Each module generates independently
- No broken cross-references
- Module tests pass in isolation
- Can deploy one module without others
- Clear dependency graph

---

*This module system ensures we build incrementally while maintaining clear boundaries and relationships*