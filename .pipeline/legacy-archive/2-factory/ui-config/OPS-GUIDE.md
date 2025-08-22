# UI Generation Operations Guide

## Quick Start

### Generate a New Concept
```bash
# Run the pattern-based generator
node .pipeline/2-factory/generators/pattern-based-generator.js

# View in browser
open .pipeline/3-workspace/concept/iteration-3-optimized.html
```

## Standard Operating Procedures

### 1. Starting a New Feature

#### Step 1: Review Requirements
Look for UI-specific needs:
- Information hierarchy
- Data relationships  
- User workflows
- Density requirements

#### Step 2: Configure Fields
Edit `field-configuration.js` to map your data:

```javascript
getYourEntityConfig(pattern = 'compact') {
  return {
    pattern: pattern,
    fields: {
      title: 'EntityName',
      badge: 'Status',
      metadata: ['Type', 'Location', 'Count']
    }
  };
}
```

#### Step 3: Select Pattern
Based on expected item count:
- **10+ items**: Use `compact` pattern
- **8-12 items**: Use `list` pattern
- **3-5 items**: Use `data` pattern
- **KPI focus**: Use `metric` pattern

#### Step 4: Generate & Test
```bash
node .pipeline/2-factory/generators/pattern-based-generator.js
```

### 2. Customizing Cards

#### Adding New Fields

1. **Update BUSM** (if new field)
   ```yaml
   # In BUSM.yaml
   Account:
     NewField:
       type: string
       description: "New field description"
   ```

2. **Update Configuration**
   ```javascript
   // In field-configuration.js
   fields: {
     title: 'AccountName',
     badge: 'NewField',  // Add here
     metadata: ['Type', 'Location']
   }
   ```

3. **Add Formatting** (if needed)
   ```javascript
   formatValue(value, format) {
     case 'custom-format':
       return `Custom: ${value}`;
   }
   ```

#### Changing Card Density

Edit the recommendation logic:
```javascript
recommendPattern(entityType, viewportWidth, itemCount) {
  account: {
    desktop: itemCount > 20 ? 'compact' : 'list',  // Changed threshold
    tablet: 'compact',  // Force compact on tablet
    mobile: 'compact'
  }
}
```

### 3. Design Token Management

#### Adding New Tokens

1. **Edit tokens-minimal.css**
   ```css
   :root {
     /* Add semantic tokens */
     --color-brand: #your-color;
     --spacing-custom: 32px;
   }
   ```

2. **Use in Templates**
   ```css
   .card-custom {
     padding: var(--spacing-custom);
     border-color: var(--color-brand);
   }
   ```

#### Preparing for Tailwind v4

Keep tokens semantic and CSS-first:
```css
/* Good - works with v4 */
--color-primary: #3b82f6;

/* Avoid - JavaScript config */
primary: { 500: '#3b82f6' }
```

### 4. Creating New Patterns

#### Step 1: Design the Pattern
Create `card-[name].html`:
```html
<!-- CUSTOM CARD TEMPLATE -->
<div class="card-custom">
  <div class="custom-layout">{{content}}</div>
</div>

<style>
.card-custom {
  /* Use design tokens */
  padding: var(--space-4);
  border: var(--card-border);
}
</style>
```

#### Step 2: Register Pattern
In `field-configuration.js`:
```javascript
this.patterns = {
  custom: {
    maxFields: 6,
    slots: ['content', 'actions']
  }
}
```

#### Step 3: Add Configuration
```javascript
getCustomConfig(pattern = 'custom') {
  return {
    pattern: 'custom',
    fields: {
      content: 'MainField',
      actions: ['Action1', 'Action2']
    }
  };
}
```

### 5. Testing & Validation

#### Visual Testing
1. Generate concept with different data counts
2. Check all three columns populate
3. Verify card selection works
4. Test empty states

#### Pattern Testing
```bash
# Test with minimal data (3 items)
node test-pattern.js --items=3

# Test with maximum data (20 items)  
node test-pattern.js --items=20

# Test responsive behavior
node test-pattern.js --viewport=mobile
```

#### Token Validation
```bash
# Check for inline styles (should be none)
grep -r "style=" .pipeline/3-workspace/concept/

# Verify token usage
grep -r "var(--" .pipeline/3-workspace/concept/
```

### 6. Troubleshooting

#### Cards Too Small
- Check pattern selection in `recommendPattern()`
- Verify token values for padding/spacing
- Review column grid settings

#### Fields Not Showing
- Verify field exists in BUSM
- Check field path in configuration
- Review `resolveFieldValue()` logic

#### Style Inconsistency  
- Ensure using tokens, not inline styles
- Check token definitions in CSS
- Verify template includes token stylesheet

### 7. Performance Optimization

#### For Large Lists (100+ items)
1. Use `compact` pattern exclusively
2. Implement virtual scrolling
3. Add pagination controls

#### For Complex Data
1. Use `data` pattern sparingly
2. Limit grid fields to 6-8
3. Consider progressive disclosure

### 8. Migration Path

#### From Existing Concepts
1. Extract inline styles to tokens
2. Identify repeated patterns
3. Create templates for patterns
4. Update generator to use templates

#### To Production React
1. Convert templates to JSX
2. Replace {{}} with props
3. Maintain same token references
4. Use same field configuration

## Common Workflows

### Workflow 1: Quick Fix CSS Issue
```bash
# Edit tokens
vim .pipeline/2-factory/design-system/tokens-minimal.css

# Regenerate
node .pipeline/2-factory/generators/pattern-based-generator.js

# View changes
open .pipeline/3-workspace/concept/iteration-3-optimized.html
```

### Workflow 2: Add New Entity Type
```bash
# 1. Add to field configuration
vim .pipeline/2-factory/ui-config/field-configuration.js

# 2. Add method like getInvoiceCardConfig()

# 3. Update generator to use new config

# 4. Test generation
node .pipeline/2-factory/generators/pattern-based-generator.js
```

### Workflow 3: Feedback Integration
```bash
# 1. Receive feedback about card layout
npm run feedback:server

# 2. Identify if it's a quick CSS fix
# 3. Update tokens or configuration
# 4. Regenerate and test
```

## Best Practices

### DO ✅
- Use semantic token names
- Keep patterns under 5 fields
- Test with real data volumes
- Document field mappings
- Use consistent formatting

### DON'T ❌
- Add inline styles
- Create one-off patterns
- Ignore viewport testing
- Skip BUSM validation
- Hardcode values

## Metrics to Track

1. **Pattern Usage**: Which patterns used most?
2. **Field Frequency**: Common field combinations
3. **Token Coverage**: % of styles using tokens
4. **Generation Time**: Time to create concept
5. **Feedback Rate**: Issues per generation

## Next Phase Integration

When ready for Tailwind v4:
1. Run token migration script
2. Update generator for `@theme`
3. Test with v4 beta
4. Update documentation
5. Deploy progressively

## Support

- **Issues**: Check pattern-based-generator.js logs
- **Updates**: Edit field-configuration.js
- **Tokens**: Modify tokens-minimal.css
- **Patterns**: Create new templates in ui-templates/