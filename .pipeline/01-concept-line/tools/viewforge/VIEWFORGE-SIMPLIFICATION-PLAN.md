# ViewForge Simplification Implementation Plan
*Phase 1: Transform ViewForge to Wireframe Generator*

## Goal
Transform ViewForge from a "do everything" tool to a focused "clickable wireframe" generator that:
- Defines what to show (fields, layout)
- Defines where clicks go (navigation)
- Pulls everything else from BUSM

## Phase 1: Core Transformation (Current Sprint)

### Step 1: Create ViewForge Output Transformer
**File:** `.pipeline/factory-tools/viewforge/viewforge-transformer.js`

```javascript
class ViewForgeTransformer {
  constructor(busm, gapLogger) {
    this.busm = busm;
    this.gapLogger = gapLogger;
  }
  
  // Transform current v3 format to new simplified format
  transformV3ToSimplified(v3Config) {
    return {
      id: this.generateId(v3Config),
      type: this.mapViewType(v3Config.type),
      entity: v3Config.entity,
      title: v3Config.title,
      display: this.transformDisplay(v3Config),
      navigation: this.extractNavigation(v3Config),
      dataSource: this.defineDataSource(v3Config)
    };
  }
  
  // Extract navigation from relationships
  extractNavigation(config) {
    const navigation = {
      onRowClick: {},
      onFieldClick: {},
      onActionClick: {}
    };
    
    // Auto-detect relationship navigation
    config.fields.forEach(field => {
      if (field.name.includes('.')) {
        const [relationName] = field.name.split('.');
        const relation = this.busm.getRelationship(config.entity, relationName);
        
        if (relation) {
          navigation.onFieldClick[field.name] = {
            target: `${relation.targetEntity}-detail`,
            params: [relation.foreignKey]
          };
        } else {
          this.gapLogger.log({
            category: 'MISSING_RELATIONSHIP',
            entity: config.entity,
            field: field.name,
            expected: 'Relationship definition',
            assumption: 'No navigation',
            impact: 'HIGH'
          });
        }
      }
    });
    
    return navigation;
  }
}
```

### Step 2: Integrate Gap Logger
**File:** `.pipeline/factory-tools/viewforge/viewforge-gap-logger.js`

```javascript
class ViewForgeGapLogger {
  constructor(gapLogger) {
    this.gapLogger = gapLogger;
    this.gaps = [];
  }
  
  checkViewForgeConfig(config) {
    // Check for missing display hints
    config.display.fields.forEach(field => {
      if (!field.label) {
        this.logGap({
          category: 'MISSING_LABEL',
          field: field.path,
          assumption: `Using field name: ${field.path}`,
          suggestedFix: 'Add label to ViewForge config'
        });
      }
    });
    
    // Check for missing navigation
    if (!config.navigation.onRowClick.target) {
      this.logGap({
        category: 'MISSING_NAVIGATION',
        view: config.id,
        expected: 'Row click navigation',
        assumption: 'No navigation on row click',
        suggestedFix: 'Define onRowClick target'
      });
    }
    
    return this.gaps;
  }
  
  logGap(gap) {
    this.gaps.push(gap);
    this.gapLogger.log({
      ...gap,
      source: 'ViewForge',
      timestamp: new Date()
    });
  }
}
```

### Step 3: Update Concept Generator
**File:** `.pipeline/factory-tools/generators/concept-html/concept-generator-v2.js`

```javascript
class ConceptGeneratorV2 {
  constructor(viewForgeConfig, busm, gapLogger) {
    this.config = viewForgeConfig;
    this.busm = busm;
    this.gapLogger = gapLogger;
  }
  
  generate() {
    // Validate we have what we need
    this.validateConfig();
    
    // Generate HTML wireframe
    const html = this.generateHTML();
    
    // Generate navigation script
    const navigation = this.generateNavigationScript();
    
    // Report gaps found
    const gaps = this.gapLogger.getCurrentGaps();
    
    return {
      html,
      navigation,
      gaps,
      success: gaps.filter(g => g.severity === 'CRITICAL').length === 0
    };
  }
  
  generateHTML() {
    const { display, navigation } = this.config;
    
    // Build clickable wireframe
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>${this.config.title} - Concept</title>
  <style>
    .clickable { cursor: pointer; color: blue; text-decoration: underline; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    button { margin: 0 5px; }
  </style>
</head>
<body>
  <h1>${this.config.title}</h1>`;
    
    if (this.config.type === 'list') {
      html += this.generateListView(display, navigation);
    } else if (this.config.type === 'detail') {
      html += this.generateDetailView(display, navigation);
    }
    
    html += `
  <script>${this.generateNavigationScript()}</script>
</body>
</html>`;
    
    return html;
  }
}
```

### Step 4: Update Prototype Generator
**File:** `.pipeline/factory-tools/generators/prototype-react/prototype-generator-v2.js`

```javascript
class PrototypeGeneratorV2 {
  constructor(viewForgeConfig, busm, gapLogger) {
    this.config = viewForgeConfig;
    this.busm = busm;
    this.gapLogger = gapLogger;
  }
  
  generate() {
    // Get entity definition from BUSM
    const entity = this.busm.getEntity(this.config.entity);
    
    if (!entity) {
      this.gapLogger.log({
        category: 'MISSING_ENTITY',
        entity: this.config.entity,
        severity: 'CRITICAL',
        assumption: 'Cannot generate without entity'
      });
      throw new Error(`Entity ${this.config.entity} not found in BUSM`);
    }
    
    // Generate mock data
    const mockData = this.generateMockData(entity);
    
    // Build React component
    const component = this.buildComponent(entity, mockData);
    
    // Validate output compiles
    const validated = this.validateComponent(component);
    
    return {
      component: validated.code,
      mockData,
      gaps: this.gapLogger.getCurrentGaps(),
      compiled: validated.compiled
    };
  }
  
  buildComponent(entity, mockData) {
    // Build using AST approach (future)
    // For now, use improved template
    const fields = this.config.display.fields;
    const navigation = this.config.navigation;
    
    return `
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ${this.config.entity}ListProps {
  // Props interface
}

export const ${this.config.entity}ListView: React.FC<${this.config.entity}ListProps> = () => {
  const navigate = useNavigate();
  const data = ${JSON.stringify(mockData, null, 2)};
  
  const handleRowClick = (item: any) => {
    navigate('/${navigation.onRowClick.target}/' + item.${navigation.onRowClick.params[0]});
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">${this.config.title}</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            ${fields.map(f => `<th className="border p-2">${f.label}</th>`).join('\n            ')}
          </tr>
        </thead>
        <tbody>
          {data.map((item: any) => (
            <tr key={item.${entity.primaryKey}} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-gray-50">
              ${fields.map(f => `<td className="border p-2">{item.${f.path}}</td>`).join('\n              ')}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};`;
  }
}
```

## Phase 2: Testing & Validation

### Test Suite
```javascript
describe('ViewForge Simplification', () => {
  it('transforms v3 config to simplified format', () => {
    const v3Config = loadV3Config();
    const simplified = transformer.transformV3ToSimplified(v3Config);
    
    expect(simplified).toHaveProperty('display');
    expect(simplified).toHaveProperty('navigation');
    expect(simplified).toHaveProperty('dataSource');
  });
  
  it('logs gaps for missing information', () => {
    const config = { /* minimal config */ };
    const gaps = gapLogger.checkViewForgeConfig(config);
    
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0]).toHaveProperty('category');
    expect(gaps[0]).toHaveProperty('suggestedFix');
  });
  
  it('generates valid HTML from simplified config', () => {
    const html = conceptGenerator.generate(simplifiedConfig);
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('onclick');
  });
});
```

## Phase 3: Migration Path

### Week 1: Build Transformer
- [ ] Create ViewForgeTransformer class
- [ ] Test with existing v3 configs
- [ ] Generate gap reports

### Week 2: Update Generators
- [ ] Update Concept generator to use simplified format
- [ ] Update Prototype generator to use simplified format
- [ ] Test end-to-end generation

### Week 3: Documentation & Training
- [ ] Document new format
- [ ] Create migration guide
- [ ] Update examples

## Success Criteria

1. **ViewForge outputs simplified format** ✅
2. **All navigation from relationships** ✅
3. **Gaps logged systematically** ✅
4. **Generators work with new format** ✅
5. **No regression in functionality** ✅

## Risk Mitigation

1. **Keep v3 format working** - Don't break existing functionality
2. **Transform in generator** - ViewForge v3 → Transformer → Simplified → Generator
3. **Log all assumptions** - Use Gap Logger extensively
4. **Test thoroughly** - Every transformation tested

## Next Steps

1. Start with ViewForgeTransformer implementation
2. Test with Account List example
3. Generate gap report
4. Iterate based on gaps found

---

*This plan transforms ViewForge into a focused wireframe tool while maintaining backward compatibility*