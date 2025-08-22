#!/usr/bin/env node

/**
 * IMS Generator Bridge
 * Connects generators to the current iteration context
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const RuleExtractor = require('../rules/rule-extractor');

class IMSGeneratorBridge {
  constructor() {
    this.pipelineRoot = path.join(__dirname, '..', '..');
    this.iterationsDir = path.join(this.pipelineRoot, 'iterations');
    this.currentDir = path.join(this.iterationsDir, 'current');
    this.manifest = this.loadManifest();
  }

  loadManifest() {
    const manifestPath = path.join(this.iterationsDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
    return null;
  }

  getCurrentIteration() {
    if (!this.manifest || !this.manifest.currentIteration) {
      console.error('❌ No current iteration set');
      return null;
    }
    return this.manifest.currentIteration;
  }

  getIterationPath(iterationId = null) {
    const id = iterationId || this.getCurrentIteration();
    if (!id) return null;
    return path.join(this.iterationsDir, 'archive', id);
  }

  getConfigPath(configType, iterationId = null) {
    const iterPath = this.getIterationPath(iterationId);
    if (!iterPath) return null;
    return path.join(iterPath, 'configs', configType);
  }

  getOutputPath(line, iterationId = null) {
    const iterPath = this.getIterationPath(iterationId);
    if (!iterPath) return null;
    return path.join(iterPath, 'generated', `${line}-line`);
  }

  /**
   * Extract rules for an entity
   */
  extractRules(entityName, viewType) {
    const iteration = this.getCurrentIteration();
    if (!iteration) {
      console.error('❌ No current iteration');
      return null;
    }

    const iterPath = this.getIterationPath();
    const configPath = this.getConfigPath('entities');
    const configFile = path.join(configPath, entityName, `${viewType}.json`);
    
    // Find the config file (handle different naming conventions)
    let actualConfigFile = configFile;
    if (!fs.existsSync(configFile)) {
      const entityDir = path.join(configPath, entityName);
      if (fs.existsSync(entityDir)) {
        const files = fs.readdirSync(entityDir);
        const matchingFile = files.find(f => f.includes(viewType));
        if (matchingFile) {
          actualConfigFile = path.join(entityDir, matchingFile);
        }
      }
    }

    // Extract rules
    const extractor = new RuleExtractor();
    const rules = extractor.extractAllRules({
      entity: entityName,
      viewForgeConfig: actualConfigFile,
      iterationPath: iterPath
    });

    console.log(`   📋 Extracted ${rules.length} rules for ${entityName}`);
    return rules;
  }

  /**
   * Generate HTML from current iteration configs
   */
  generateHTML(entityName, viewType) {
    const iteration = this.getCurrentIteration();
    if (!iteration) {
      console.error('❌ No current iteration');
      return false;
    }

    console.log(`\n🔧 Generating HTML for ${entityName} ${viewType}`);
    console.log(`   Iteration: ${iteration}`);

    // Extract rules first
    this.extractRules(entityName, viewType);

    // Get config path
    const configPath = this.getConfigPath('entities');
    let configFile = path.join(configPath, entityName, `${viewType}.json`);
    
    if (!fs.existsSync(configFile)) {
      // Try alternative naming
      const files = fs.existsSync(path.join(configPath, entityName)) 
        ? fs.readdirSync(path.join(configPath, entityName))
        : [];
      
      const matchingFile = files.find(f => f.includes(viewType));
      if (matchingFile) {
        configFile = path.join(configPath, entityName, matchingFile);
      } else {
        console.error(`❌ Config not found: ${configFile}`);
        console.log(`   Available configs: ${files.join(', ')}`);
        return false;
      }
    }

    // Get output path
    const outputPath = this.getOutputPath('concept');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    const outputFile = path.join(outputPath, `${entityName}-${viewType}.html`);

    // Run generator
    const generatorPath = path.join(this.pipelineRoot, '01-factory-tools', 'generators', 'simple-html-generator.js');
    
    try {
      const command = `node "${generatorPath}" "${configFile}" "${outputFile}"`;
      console.log(`   Running: ${path.basename(generatorPath)}`);
      execSync(command, { stdio: 'inherit' });
      
      // Record artifact in iteration
      this.recordArtifact(iteration, `${entityName}-${viewType}.html`, 'concept-line');
      
      console.log(`✅ Generated: ${path.relative(this.pipelineRoot, outputFile)}`);
      return true;
    } catch (error) {
      console.error(`❌ Generation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate navigation from current iteration
   */
  generateNavigation() {
    const iteration = this.getCurrentIteration();
    if (!iteration) {
      console.error('❌ No current iteration');
      return false;
    }

    console.log(`\n🔧 Generating Navigation`);
    console.log(`   Iteration: ${iteration}`);

    const configPath = this.getConfigPath('navigation');
    const configFile = path.join(configPath, 'nav-config-pest-control-v1.json');
    
    if (!fs.existsSync(configFile)) {
      console.error(`❌ Navigation config not found: ${configFile}`);
      return false;
    }

    const outputPath = this.getOutputPath('concept');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    const outputFile = path.join(outputPath, 'navigation.html');

    const generatorPath = path.join(this.pipelineRoot, '01-factory-tools', 'generators', 'navigation-generator.js');
    
    try {
      const command = `node "${generatorPath}" "${configFile}" "${outputFile}"`;
      console.log(`   Running: ${path.basename(generatorPath)}`);
      execSync(command, { stdio: 'inherit' });
      
      this.recordArtifact(iteration, 'navigation.html', 'concept-line');
      
      console.log(`✅ Generated: ${path.relative(this.pipelineRoot, outputFile)}`);
      return true;
    } catch (error) {
      console.error(`❌ Generation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate complete layout
   */
  generateLayout(layoutName = 'three-column') {
    const iteration = this.getCurrentIteration();
    if (!iteration) {
      console.error('❌ No current iteration');
      return false;
    }

    console.log(`\n🔧 Generating Layout: ${layoutName}`);
    console.log(`   Iteration: ${iteration}`);

    const configPath = this.getConfigPath('layouts');
    const configFile = path.join(configPath, `${layoutName}.json`);
    
    if (!fs.existsSync(configFile)) {
      console.error(`❌ Layout config not found: ${configFile}`);
      return false;
    }

    const outputPath = this.getOutputPath('concept');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    const outputFile = path.join(outputPath, 'complete-app.html');

    const generatorPath = path.join(this.pipelineRoot, '01-factory-tools', 'generators', 'layout-generator.js');
    
    try {
      const command = `node "${generatorPath}" "${configFile}" "${outputFile}"`;
      console.log(`   Running: ${path.basename(generatorPath)}`);
      execSync(command, { stdio: 'inherit' });
      
      this.recordArtifact(iteration, 'complete-app.html', 'concept-line');
      
      console.log(`✅ Generated: ${path.relative(this.pipelineRoot, outputFile)}`);
      return true;
    } catch (error) {
      console.error(`❌ Generation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Record generated artifact in iteration metadata
   */
  recordArtifact(iterationId, artifactName, line) {
    const metadataPath = path.join(this.getIterationPath(iterationId), 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      metadata.results.artifacts_generated++;
      
      if (!metadata.artifacts) {
        metadata.artifacts = [];
      }
      metadata.artifacts.push({
        name: artifactName,
        line: line,
        generated: new Date().toISOString()
      });
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }
  }

  /**
   * Generate all configured entities
   */
  generateAll() {
    const iteration = this.getCurrentIteration();
    if (!iteration) {
      console.error('❌ No current iteration');
      return false;
    }

    console.log(`\n🚀 Generating All Artifacts for Iteration: ${iteration}\n`);
    console.log('='.repeat(80));

    const configPath = this.getConfigPath('entities');
    if (!fs.existsSync(configPath)) {
      console.error(`❌ No entity configs found in iteration`);
      return false;
    }

    const entities = fs.readdirSync(configPath).filter(f => 
      fs.statSync(path.join(configPath, f)).isDirectory()
    );

    console.log(`Found ${entities.length} configured entities: ${entities.join(', ')}\n`);

    let generated = 0;
    entities.forEach(entity => {
      const entityPath = path.join(configPath, entity);
      const configs = fs.readdirSync(entityPath).filter(f => f.endsWith('.json'));
      
      console.log(`\n📦 Entity: ${entity}`);
      console.log(`   Configs: ${configs.length}`);
      
      configs.forEach(config => {
        const viewType = config.replace('.json', '').replace(`field-config-${entity}-`, '').replace(/-\d+$/, '');
        if (this.generateHTML(entity, viewType)) {
          generated++;
        }
      });
    });

    // Generate navigation
    console.log('\n📦 Navigation');
    if (this.generateNavigation()) {
      generated++;
    }

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Generation Complete: ${generated} artifacts created`);
    console.log(`   Output: ${path.relative(this.pipelineRoot, this.getOutputPath('concept'))}`);

    return true;
  }
}

// CLI interface
function main() {
  const bridge = new IMSGeneratorBridge();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'generate':
      if (args[0] === 'all') {
        bridge.generateAll();
      } else if (args[0] && args[1]) {
        bridge.generateHTML(args[0], args[1]);
      } else {
        console.error('Usage: generate <entity> <view-type> OR generate all');
      }
      break;

    case 'nav':
    case 'navigation':
      bridge.generateNavigation();
      break;

    case 'layout':
      bridge.generateLayout(args[0] || 'three-column');
      break;

    case 'all':
      bridge.generateAll();
      break;

    case 'extract-rules':
      if (args[0]) {
        const entityName = args[0];
        const viewType = args[1] || 'list-view';
        bridge.extractRules(entityName, viewType);
      } else {
        console.error('Usage: extract-rules <entity> [view-type]');
      }
      break;

    case 'status':
      const iteration = bridge.getCurrentIteration();
      if (iteration) {
        console.log(`Current Iteration: ${iteration}`);
        const iterPath = bridge.getIterationPath();
        const metadataPath = path.join(iterPath, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          console.log(`Type: ${metadata.type} | Line: ${metadata.line}`);
          console.log(`Artifacts Generated: ${metadata.results.artifacts_generated}`);
        }
      } else {
        console.log('No current iteration set');
      }
      break;

    default:
      console.log(`
IMS Generator Bridge v1.0.0

Usage:
  node ims-generator-bridge.js <command> [options]

Commands:
  generate <entity> <view>  Generate HTML for specific entity/view
  generate all              Generate all configured entities
  navigation                Generate navigation
  layout [name]             Generate layout (default: three-column)
  all                       Generate everything
  extract-rules <entity>    Extract rules for an entity
  status                    Show current iteration status

Examples:
  node ims-generator-bridge.js generate account list-view
  node ims-generator-bridge.js generate all
  node ims-generator-bridge.js extract-rules account
  node ims-generator-bridge.js navigation
  node ims-generator-bridge.js layout three-column
  node ims-generator-bridge.js all
      `);
  }
}

// Export for module use
module.exports = IMSGeneratorBridge;

// Run if called directly
if (require.main === module) {
  main();
}