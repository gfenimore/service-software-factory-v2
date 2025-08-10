#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SDLCAuditor {
  constructor() {
    this.inventory = {
      agents: [],
      userStories: [],
      technicalDocs: [],
      processDocs: [],
      templates: [],
      operational: [],
      reports: [],
      investigations: [],
      scripts: [],
      testTwins: [],
      other: []
    };
    this.duplicates = [];
    this.potentialArchive = [];
    this.criticalFiles = [];
    this.productSpecs = [];
  }

  classifyFile(filePath, fileName) {
    const lowerName = fileName.toLowerCase();
    const content = this.getFileContent(filePath);
    const firstLine = content ? content.split('\n')[0] : '';
    
    // Classification logic
    if (lowerName.includes('agent') || lowerName.includes('processor')) {
      return 'agents';
    } else if (lowerName.includes('us-') || lowerName.includes('user-story')) {
      return 'userStories';
    } else if (lowerName.includes('architecture') || lowerName.includes('technical') || lowerName.includes('design')) {
      return 'technicalDocs';
    } else if (lowerName.includes('process') || lowerName.includes('workflow')) {
      return 'processDocs';
    } else if (lowerName.includes('template') || lowerName.includes('pattern')) {
      return 'templates';
    } else if (lowerName.includes('manifest') || lowerName.includes('config') || fileName.endsWith('.json')) {
      return 'operational';
    } else if (lowerName.includes('report') || lowerName.includes('audit')) {
      return 'reports';
    } else if (lowerName.includes('investigation') || lowerName.includes('analysis')) {
      return 'investigations';
    } else if (fileName.endsWith('.js') || fileName.endsWith('.sh')) {
      return 'scripts';
    } else if (lowerName.includes('test-twin')) {
      return 'testTwins';
    } else {
      return 'other';
    }
  }

  getFileContent(filePath) {
    try {
      if (filePath.endsWith('.md') || filePath.endsWith('.txt')) {
        return fs.readFileSync(filePath, 'utf8');
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  getFileStats(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: this.formatFileSize(stats.size),
        modified: stats.mtime.toISOString().split('T')[0]
      };
    } catch (error) {
      return { size: 'N/A', modified: 'N/A' };
    }
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFilePurpose(filePath, fileName, content) {
    const lowerName = fileName.toLowerCase();
    const firstLine = content ? content.split('\n')[0] : '';
    
    if (lowerName.includes('agent')) return 'Agent/processor specification';
    if (lowerName.includes('us-')) return 'User story definition';
    if (lowerName.includes('architecture')) return 'Technical architecture documentation';
    if (lowerName.includes('task')) return 'Task breakdown and planning';
    if (lowerName.includes('report')) return 'Analysis or status report';
    if (lowerName.includes('manifest')) return 'Processor pipeline configuration';
    if (lowerName.includes('investigation')) return 'Problem investigation documentation';
    if (lowerName.includes('template')) return 'Reusable template or pattern';
    if (lowerName.includes('readme')) return 'Directory documentation';
    if (lowerName.includes('test')) return 'Testing related documentation';
    
    return 'General documentation';
  }

  scanDirectory(dirPath, level = 0) {
    const items = [];
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative('.sdlc', fullPath);
        
        if (entry.isDirectory()) {
          items.push({
            type: 'directory',
            name: entry.name,
            path: relativePath,
            level,
            children: this.scanDirectory(fullPath, level + 1)
          });
        } else {
          const content = this.getFileContent(fullPath);
          const stats = this.getFileStats(fullPath);
          const classification = this.classifyFile(fullPath, entry.name);
          const firstLine = content ? content.split('\n')[0].substring(0, 100) : '';
          const purpose = this.getFilePurpose(fullPath, entry.name, content);
          
          const fileInfo = {
            type: 'file',
            name: entry.name,
            path: relativePath,
            level,
            classification,
            firstLine: firstLine.replace(/^#\s*/, ''),
            size: stats.size,
            modified: stats.modified,
            purpose
          };
          
          items.push(fileInfo);
          
          // Add to inventory
          this.inventory[classification].push(fileInfo);
          
          // Check for critical files
          if (this.isCritical(entry.name, relativePath)) {
            this.criticalFiles.push(fileInfo);
          }
          
          // Check for product specs
          if (this.isProductSpec(entry.name, relativePath)) {
            this.productSpecs.push(fileInfo);
          }
          
          // Check for potential archives
          if (this.isPotentialArchive(entry.name, relativePath)) {
            this.potentialArchive.push(fileInfo);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dirPath}:`, error.message);
    }
    
    return items;
  }

  isCritical(fileName, relativePath) {
    // Files that must be preserved
    return fileName.includes('manifest') ||
           fileName.includes('architecture') ||
           fileName.includes('us-00') ||
           relativePath.includes('01-core') ||
           fileName === 'README.md';
  }

  isProductSpec(fileName, relativePath) {
    // Files that are product requirements vs SDLC process
    return relativePath.includes('05-backlog') ||
           fileName.includes('user-story') ||
           fileName.includes('us-') ||
           fileName.includes('feature') ||
           fileName.includes('requirement');
  }

  isPotentialArchive(fileName, relativePath) {
    // Files that might be obsolete or duplicates
    return relativePath.includes('completed') ||
           relativePath.includes('archive') ||
           fileName.includes('old') ||
           fileName.includes('backup') ||
           fileName.includes('copy');
  }

  generateTreeView(items, indent = '') {
    let output = '';
    
    for (const item of items) {
      if (item.type === 'directory') {
        output += `${indent}📁 ${item.name}/\n`;
        if (item.children) {
          output += this.generateTreeView(item.children, indent + '  ');
        }
      } else {
        const icon = this.getFileIcon(item.classification);
        output += `${indent}${icon} ${item.name} [${item.size}] (${item.classification})\n`;
      }
    }
    
    return output;
  }

  getFileIcon(classification) {
    const icons = {
      agents: '🤖',
      userStories: '📋',
      technicalDocs: '📐',
      processDocs: '🔄',
      templates: '📝',
      operational: '⚙️',
      reports: '📊',
      investigations: '🔍',
      scripts: '💻',
      testTwins: '🧪',
      other: '📄'
    };
    return icons[classification] || '📄';
  }

  generateReport() {
    const structure = this.scanDirectory('.sdlc');
    const today = new Date().toISOString().split('T')[0];
    
    let report = `# SDLC Folder Audit Report
Generated: ${today} at ${new Date().toLocaleTimeString()}

## Executive Summary

- **Total Files**: ${Object.values(this.inventory).flat().length}
- **Critical Files**: ${this.criticalFiles.length}
- **Product Specs**: ${this.productSpecs.length}
- **Potential Archives**: ${this.potentialArchive.length}

## Directory Structure

\`\`\`
${this.generateTreeView(structure)}
\`\`\`

## File Classification Summary

| Category | Count | Description |
|----------|-------|-------------|
| Agents/Processors | ${this.inventory.agents.length} | Agent specifications and processor definitions |
| User Stories | ${this.inventory.userStories.length} | Product requirements and user stories |
| Technical Docs | ${this.inventory.technicalDocs.length} | Architecture and technical documentation |
| Process Docs | ${this.inventory.processDocs.length} | Workflow and process documentation |
| Templates | ${this.inventory.templates.length} | Reusable templates and patterns |
| Operational | ${this.inventory.operational.length} | Configs, manifests, tracking files |
| Reports | ${this.inventory.reports.length} | Analysis and status reports |
| Investigations | ${this.inventory.investigations.length} | Problem investigations and research |
| Scripts | ${this.inventory.scripts.length} | Automation and utility scripts |
| Test Twins | ${this.inventory.testTwins.length} | Test processor specifications |
| Other | ${this.inventory.other.length} | Uncategorized files |

## Detailed File Inventory

### 🤖 Agents and Processors (${this.inventory.agents.length})
${this.formatFileList(this.inventory.agents)}

### 📋 User Stories and Requirements (${this.inventory.userStories.length})
${this.formatFileList(this.inventory.userStories)}

### 📐 Technical Documentation (${this.inventory.technicalDocs.length})
${this.formatFileList(this.inventory.technicalDocs)}

### 🔄 Process Documentation (${this.inventory.processDocs.length})
${this.formatFileList(this.inventory.processDocs)}

### ⚙️ Operational Files (${this.inventory.operational.length})
${this.formatFileList(this.inventory.operational)}

### 📊 Reports (${this.inventory.reports.length})
${this.formatFileList(this.inventory.reports)}

### 🔍 Investigations (${this.inventory.investigations.length})
${this.formatFileList(this.inventory.investigations)}

## Critical Files (Must Preserve)

These files are essential to the SDLC process and must be preserved:

${this.formatFileList(this.criticalFiles)}

## Product Specifications

These files contain product requirements and should potentially be moved to a product-specs folder:

${this.formatFileList(this.productSpecs)}

## Potential Archive Candidates

These files may be obsolete or duplicates and could be archived:

${this.formatFileList(this.potentialArchive)}

## Recommendations

### 1. Folder Reorganization
- **Create** \`/product-specs\` folder for all user stories and requirements
- **Move** 05-backlog items to product-specs (preserve in git history)
- **Archive** completed investigations and reports older than 30 days

### 2. File Consolidation
- Combine related documentation into single files where appropriate
- Remove duplicate processor specifications
- Consolidate test twin specifications

### 3. Critical Preservations
- All files in 01-core must be preserved
- Current manifests and configurations must be maintained
- Active user stories and architectures must remain accessible

### 4. Azure DevOps Integration Prep
- Product specs can map to Azure DevOps work items
- SDLC process docs can become wiki pages
- Scripts can be integrated into pipelines

## Next Steps

1. Review this audit report
2. Confirm files for archival
3. Create product-specs folder structure
4. Move files according to recommendations
5. Update references in remaining files
6. Commit with clear message about reorganization

---
*End of Audit Report*`;

    return report;
  }

  formatFileList(files) {
    if (files.length === 0) return '*No files in this category*\n';
    
    let output = '';
    for (const file of files) {
      output += `\n#### 📄 ${file.name}\n`;
      output += `- **Path**: \`${file.path}\`\n`;
      output += `- **Size**: ${file.size} | **Modified**: ${file.modified}\n`;
      output += `- **Purpose**: ${file.purpose}\n`;
      if (file.firstLine) {
        output += `- **First Line**: "${file.firstLine.substring(0, 80)}${file.firstLine.length > 80 ? '...' : ''}"\n`;
      }
    }
    return output;
  }

  run() {
    console.log('🔍 Starting SDLC Folder Audit...');
    
    const report = this.generateReport();
    const today = new Date().toISOString().split('T')[0];
    const outputPath = path.join('.sdlc', 'inventory-reports', `sdlc-audit-${today}.md`);
    
    fs.writeFileSync(outputPath, report);
    
    console.log('✅ Audit complete!');
    console.log(`📄 Report saved to: ${outputPath}`);
    
    // Summary output
    console.log('\n📊 Summary:');
    console.log(`- Total files analyzed: ${Object.values(this.inventory).flat().length}`);
    console.log(`- Critical files: ${this.criticalFiles.length}`);
    console.log(`- Product specs: ${this.productSpecs.length}`);
    console.log(`- Archive candidates: ${this.potentialArchive.length}`);
  }
}

// Run the auditor
const auditor = new SDLCAuditor();
auditor.run();