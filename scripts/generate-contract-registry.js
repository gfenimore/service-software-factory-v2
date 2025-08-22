#!/usr/bin/env node

/**
 * CONTRACT REGISTRY GENERATOR
 * Reads all interface.ts files and generates:
 * 1. Mermaid diagram of sub-module relationships
 * 2. Complete event/state/method catalog
 * 
 * Run: node scripts/generate-contract-registry.js
 */

const fs = require('fs');
const path = require('path');

class ContractRegistry {
  constructor() {
    this.subModules = new Map();
    this.relationships = [];
    this.events = new Map();
    this.states = new Map();
    this.methods = new Map();
  }
  
  // Parse an interface file
  parseInterface(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract module info (simple parsing for concept mode)
    const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
    const moduleMatch = content.match(/Module:\s*(\w+)/);
    const subModuleMatch = content.match(/Sub-Module:\s*([\w\s]+)/);
    const hierarchyMatch = content.match(/Sub-Module ID:\s*([\d.]+)/);
    
    if (!nameMatch) return null;
    
    const moduleId = nameMatch[1];
    const moduleName = moduleMatch ? moduleMatch[1] : 'unknown';
    const subModuleName = subModuleMatch ? subModuleMatch[1] : 'unknown';
    const hierarchyId = hierarchyMatch ? hierarchyMatch[1] : null;
    
    // Extract PROVIDES
    const provides = {
      events: this.extractSection(content, 'provides', 'events'),
      state: this.extractSection(content, 'provides', 'state'),
      methods: this.extractSection(content, 'provides', 'methods')
    };
    
    // Extract CONSUMES
    const consumes = {
      events: this.extractSection(content, 'consumes', 'events'),
      state: this.extractSection(content, 'consumes', 'state'),
      methods: this.extractSection(content, 'consumes', 'methods')
    };
    
    return {
      id: moduleId,
      module: moduleName,
      subModule: subModuleName,
      hierarchyId: hierarchyId,
      path: filePath,
      provides,
      consumes
    };
  }
  
  extractSection(content, section, type) {
    const regex = new RegExp(`${section}:[\\s\\S]*?${type}:\\s*{([\\s\\S]*?)}`, 'm');
    const match = content.match(regex);
    if (!match) return {};
    
    const items = {};
    // Simple extraction of quoted keys
    const keyRegex = /["']([^"']+)["']:\s*{/g;
    let keyMatch;
    while ((keyMatch = keyRegex.exec(match[1])) !== null) {
      items[keyMatch[1]] = {
        name: keyMatch[1],
        // Extract description if available
        description: this.extractDescription(match[1], keyMatch[1])
      };
    }
    
    return items;
  }
  
  extractDescription(content, key) {
    const regex = new RegExp(`${key}["']:[\\s\\S]*?description:\\s*["']([^"']+)["']`);
    const match = content.match(regex);
    return match ? match[1] : '';
  }
  
  // Scan all interface files
  scanInterfaces(baseDir) {
    const scanDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (file.endsWith('Interface.concept.ts') || file.endsWith('Interface.concept.js') || 
                   file.endsWith('Interface.prototype.ts') || file.endsWith('Interface.production.ts') ||
                   file === 'interface.ts' || file === 'interface.js') {
          console.log(`📄 Parsing: ${fullPath}`);
          const moduleInfo = this.parseInterface(fullPath);
          
          if (moduleInfo) {
            this.subModules.set(moduleInfo.id, moduleInfo);
            this.processModule(moduleInfo);
          }
        }
      }
    };
    
    scanDir(baseDir);
  }
  
  // Process module relationships
  processModule(module) {
    // Track all events this module provides
    Object.keys(module.provides.events).forEach(event => {
      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      this.events.get(event).push({
        provider: module.id,
        description: module.provides.events[event].description
      });
    });
    
    // Track all states
    Object.keys(module.provides.state).forEach(state => {
      if (!this.states.has(state)) {
        this.states.set(state, []);
      }
      this.states.get(state).push({
        provider: module.id,
        description: module.provides.state[state].description
      });
    });
    
    // Track all methods
    Object.keys(module.provides.methods).forEach(method => {
      if (!this.methods.has(method)) {
        this.methods.set(method, []);
      }
      this.methods.get(method).push({
        provider: module.id,
        description: module.provides.methods[method].description
      });
    });
    
    // Build relationships from CONSUMES
    Object.keys(module.consumes.events).forEach(event => {
      const consumed = module.consumes.events[event];
      this.relationships.push({
        from: consumed.source || 'unknown',
        to: module.id,
        type: 'event',
        label: event
      });
    });
    
    Object.keys(module.consumes.state).forEach(state => {
      const consumed = module.consumes.state[state];
      this.relationships.push({
        from: consumed.source || 'unknown',
        to: module.id,
        type: 'state',
        label: state
      });
    });
    
    Object.keys(module.consumes.methods).forEach(method => {
      const consumed = module.consumes.methods[method];
      this.relationships.push({
        from: consumed.source || 'unknown',
        to: module.id,
        type: 'method',
        label: method
      });
    });
  }
  
  // Generate Mermaid diagram
  generateMermaidDiagram() {
    let mermaid = `graph TB
    %% Sub-Module Communication Architecture
    %% Generated: ${new Date().toISOString()}
    
`;
    
    // Add sub-module nodes with styling
    this.subModules.forEach((module, id) => {
      const label = `${module.subModule}<br/>${module.module}`;
      mermaid += `    ${id.replace(/[\/\-]/g, '_')}["${label}"]\n`;
    });
    
    mermaid += '\n';
    
    // Add relationships with different styles for different types
    this.relationships.forEach(rel => {
      const fromId = rel.from.replace(/[\/\-]/g, '_');
      const toId = rel.to.replace(/[\/\-]/g, '_');
      
      if (rel.type === 'event') {
        // Solid arrow for events
        mermaid += `    ${fromId} -->|${rel.label}| ${toId}\n`;
      } else if (rel.type === 'state') {
        // Dotted arrow for state reads
        mermaid += `    ${fromId} -.->|reads ${rel.label}| ${toId}\n`;
      } else if (rel.type === 'method') {
        // Thick arrow for method calls
        mermaid += `    ${fromId} ==>|calls ${rel.label}| ${toId}\n`;
      }
    });
    
    // Add styling
    mermaid += `
    %% Styling
    classDef conceptModule fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    classDef prototypeModule fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    classDef productionModule fill:#dcfce7,stroke:#22c55e,stroke-width:2px
    
`;
    
    // Apply styles based on module names
    this.subModules.forEach((module, id) => {
      const nodeId = id.replace(/[\/\-]/g, '_');
      if (id.includes('concept')) {
        mermaid += `    class ${nodeId} conceptModule\n`;
      } else if (id.includes('prototype')) {
        mermaid += `    class ${nodeId} prototypeModule\n`;
      } else if (id.includes('production')) {
        mermaid += `    class ${nodeId} productionModule\n`;
      }
    });
    
    return mermaid;
  }
  
  // Generate markdown catalog
  generateCatalog() {
    let markdown = `# 📡 Sub-Module Contract Registry

**Generated**: ${new Date().toISOString()}  
**Total Sub-Modules**: ${this.subModules.size}  
**Total Events**: ${this.events.size}  
**Total Shared States**: ${this.states.size}  
**Total Public Methods**: ${this.methods.size}

---

## 🏗️ Sub-Modules

`;
    
    // List all sub-modules
    this.subModules.forEach((module, id) => {
      const hierarchyLabel = module.hierarchyId ? ` (${module.hierarchyId})` : '';
      markdown += `### ${module.module} / ${module.subModule}${hierarchyLabel}
- **ID**: \`${id}\`
${module.hierarchyId ? `- **Hierarchy**: \`${module.hierarchyId}\`\n` : ''}- **Path**: \`${module.path}\`

#### Provides:
`;
      
      if (Object.keys(module.provides.events).length > 0) {
        markdown += '**Events:**\n';
        Object.keys(module.provides.events).forEach(event => {
          markdown += `- \`${event}\` - ${module.provides.events[event].description || 'No description'}\n`;
        });
      }
      
      if (Object.keys(module.provides.state).length > 0) {
        markdown += '\n**State:**\n';
        Object.keys(module.provides.state).forEach(state => {
          markdown += `- \`${state}\` - ${module.provides.state[state].description || 'No description'}\n`;
        });
      }
      
      if (Object.keys(module.provides.methods).length > 0) {
        markdown += '\n**Methods:**\n';
        Object.keys(module.provides.methods).forEach(method => {
          markdown += `- \`${method}()\` - ${module.provides.methods[method].description || 'No description'}\n`;
        });
      }
      
      markdown += '\n#### Consumes:\n';
      
      if (Object.keys(module.consumes.events).length > 0) {
        markdown += '**Events:**\n';
        Object.keys(module.consumes.events).forEach(event => {
          const consumed = module.consumes.events[event];
          markdown += `- \`${event}\` from \`${consumed.source || 'unknown'}\`\n`;
        });
      }
      
      if (Object.keys(module.consumes.state).length > 0) {
        markdown += '\n**State:**\n';
        Object.keys(module.consumes.state).forEach(state => {
          const consumed = module.consumes.state[state];
          markdown += `- \`${state}\` from \`${consumed.source || 'unknown'}\`\n`;
        });
      }
      
      markdown += '\n---\n\n';
    });
    
    // Global event catalog
    markdown += `## 📤 Global Event Catalog

| Event | Providers | Description |
|-------|-----------|-------------|
`;
    
    this.events.forEach((providers, event) => {
      const providerList = providers.map(p => `\`${p.provider}\``).join(', ');
      const description = providers[0].description || '-';
      markdown += `| \`${event}\` | ${providerList} | ${description} |\n`;
    });
    
    // Global state catalog
    markdown += `\n## 🗃️ Global State Catalog

| State | Providers | Description |
|-------|-----------|-------------|
`;
    
    this.states.forEach((providers, state) => {
      const providerList = providers.map(p => `\`${p.provider}\``).join(', ');
      const description = providers[0].description || '-';
      markdown += `| \`${state}\` | ${providerList} | ${description} |\n`;
    });
    
    // Global method catalog
    markdown += `\n## 🔧 Global Method Catalog

| Method | Providers | Description |
|--------|-----------|-------------|
`;
    
    this.methods.forEach((providers, method) => {
      const providerList = providers.map(p => `\`${p.provider}\``).join(', ');
      const description = providers[0].description || '-';
      markdown += `| \`${method}()\` | ${providerList} | ${description} |\n`;
    });
    
    return markdown;
  }
  
  // Generate everything
  generate(baseDir, outputDir) {
    console.log('🚀 Generating Contract Registry...\n');
    
    // Scan all interfaces
    this.scanInterfaces(baseDir);
    
    console.log(`\n📊 Found ${this.subModules.size} sub-modules`);
    console.log(`🔗 Found ${this.relationships.length} relationships\n`);
    
    // Generate outputs
    const mermaid = this.generateMermaidDiagram();
    const catalog = this.generateCatalog();
    
    // Add mermaid to catalog
    const fullMarkdown = catalog + `
## 🗺️ System Communication Map

\`\`\`mermaid
${mermaid}
\`\`\`

## 🔄 Integration Flows

### Master View → Detail View Flow
1. User clicks account in Master View
2. Master View emits \`account:selected\` event
3. Detail View receives event and opens
4. Detail View emits \`detail-view:opened\`
5. User edits and saves
6. Detail View emits \`account:updated\`
7. Master View receives and refreshes
8. Detail View emits \`detail-view:closed\`

### Master View → Work Order Management Flow  
1. User selects location in Master View
2. Master View emits \`location:selected\` event
3. Work Order Management receives and filters orders
4. User creates new work order
5. Work Order Management emits \`workOrder:created\`
6. Master View receives and updates count
`;
    
    // Write files
    fs.writeFileSync(
      path.join(outputDir, 'CONTRACT-REGISTRY.md'),
      fullMarkdown
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'communication-diagram.mmd'),
      mermaid
    );
    
    console.log('✅ Generated CONTRACT-REGISTRY.md');
    console.log('✅ Generated communication-diagram.mmd');
    console.log('\n🎉 Contract Registry generation complete!');
  }
}

// Run the generator
const registry = new ContractRegistry();
const baseDir = path.join(__dirname, '..', '.pipeline', 'concept', 'modules');
const outputDir = path.join(__dirname, '..', '.pipeline', 'concept');

registry.generate(baseDir, outputDir);