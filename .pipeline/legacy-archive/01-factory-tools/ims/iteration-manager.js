#!/usr/bin/env node

/**
 * Iteration Management System (IMS) Core
 * Version: 1.0.0
 * Purpose: Orchestrate configurations, rules, and artifacts across factory lines
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const PIPELINE_ROOT = path.join(__dirname, '..', '..');
const ITERATIONS_DIR = path.join(PIPELINE_ROOT, 'iterations');
const MANIFEST_PATH = path.join(ITERATIONS_DIR, 'manifest.json');
const ARCHIVE_DIR = path.join(ITERATIONS_DIR, 'archive');
const CURRENT_DIR = path.join(ITERATIONS_DIR, 'current');

// Iteration Management Class
class IterationManager {
  constructor() {
    this.manifest = this.loadManifest();
  }

  /**
   * Load the iterations manifest
   */
  loadManifest() {
    if (!fs.existsSync(MANIFEST_PATH)) {
      const initialManifest = {
        version: '1.0.0',
        created: new Date().toISOString().split('T')[0],
        currentIteration: null,
        iterations: [],
        goldenIterations: [],
        statistics: {
          totalIterations: 0,
          conceptIterations: 0,
          prototypeIterations: 0,
          productionIterations: 0,
          successfulPromotions: 0
        }
      };
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(initialManifest, null, 2));
      return initialManifest;
    }
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  /**
   * Save the manifest
   */
  saveManifest() {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(this.manifest, null, 2));
  }

  /**
   * Generate iteration ID
   */
  generateIterationId() {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const counter = String(this.manifest.statistics.totalIterations + 1).padStart(3, '0');
    return `ITER-${timestamp.split('T')[0]}-${counter}`;
  }

  /**
   * Create a new iteration
   */
  createIteration(description, options = {}) {
    const id = this.generateIterationId();
    const iterationPath = path.join(ARCHIVE_DIR, id);
    
    // Create iteration directory structure
    const dirs = [
      iterationPath,
      path.join(iterationPath, 'configs'),
      path.join(iterationPath, 'configs', 'entities'),
      path.join(iterationPath, 'configs', 'navigation'),
      path.join(iterationPath, 'configs', 'layouts'),
      path.join(iterationPath, 'rules'),
      path.join(iterationPath, 'rules', 'business'),
      path.join(iterationPath, 'rules', 'technical'),
      path.join(iterationPath, 'generated'),
      path.join(iterationPath, 'generated', 'concept-line'),
      path.join(iterationPath, 'generated', 'prototype-line'),
      path.join(iterationPath, 'generated', 'production-line'),
      path.join(iterationPath, 'tests'),
      path.join(iterationPath, 'logs')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Determine parent iteration
    const parent = options.parent || this.manifest.currentIteration;
    
    // Create iteration metadata
    const metadata = {
      id,
      type: options.type || 'feature',
      line: options.line || 'concept',
      status: 'active',
      created: new Date().toISOString(),
      creator: options.creator || 'user',
      parent,
      description,
      
      scope: {
        feature: options.feature || null,
        stories: options.stories || [],
        entities: options.entities || []
      },
      
      configurations: {
        viewforge: null,
        rules: null,
        navigation: null
      },
      
      results: {
        artifacts_generated: 0,
        tests_passed: 0,
        tests_failed: 0,
        validation_status: 'pending'
      },
      
      promotion: {
        eligible: false,
        target_line: null,
        blockers: []
      },
      
      learnings: []
    };
    
    // Save metadata
    fs.writeFileSync(
      path.join(iterationPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Create changelog
    const changelog = `# Iteration ${id} Changelog

## Created
- Date: ${new Date().toISOString()}
- Description: ${description}
- Type: ${metadata.type}
- Line: ${metadata.line}
- Parent: ${parent || 'none'}

## Changes
- Initial creation

## Learnings
- (To be captured during iteration)
`;
    
    fs.writeFileSync(path.join(iterationPath, 'changelog.md'), changelog);
    
    // Snapshot current configurations
    this.snapshotConfigurations(iterationPath);
    
    // Update manifest
    this.manifest.iterations.push({
      id,
      description,
      created: metadata.created,
      status: 'active',
      type: metadata.type,
      line: metadata.line
    });
    
    this.manifest.currentIteration = id;
    this.manifest.statistics.totalIterations++;
    this.manifest.statistics[`${metadata.line}Iterations`]++;
    
    // Update current symlink
    this.updateCurrentSymlink(iterationPath);
    
    this.saveManifest();
    
    console.log(`✅ Created iteration: ${id}`);
    console.log(`   Description: ${description}`);
    console.log(`   Type: ${metadata.type}`);
    console.log(`   Line: ${metadata.line}`);
    console.log(`   Path: ${iterationPath}`);
    
    return id;
  }

  /**
   * Snapshot current configurations
   */
  snapshotConfigurations(iterationPath) {
    const configsPath = path.join(iterationPath, 'configs');
    
    // Snapshot entity configurations
    const entitiesSource = path.join(PIPELINE_ROOT, '02-configurations', 'entities');
    const entitiesDest = path.join(configsPath, 'entities');
    
    if (fs.existsSync(entitiesSource)) {
      this.copyDirectory(entitiesSource, entitiesDest);
      console.log('   📸 Snapshotted entity configurations');
    }
    
    // Snapshot navigation configurations
    const navSource = path.join(PIPELINE_ROOT, '02-configurations', 'navigation');
    const navDest = path.join(configsPath, 'navigation');
    
    if (fs.existsSync(navSource)) {
      this.copyDirectory(navSource, navDest);
      console.log('   📸 Snapshotted navigation configurations');
    }
    
    // Snapshot layout configurations
    const layoutSource = path.join(PIPELINE_ROOT, '02-configurations', 'layouts');
    const layoutDest = path.join(configsPath, 'layouts');
    
    if (fs.existsSync(layoutSource)) {
      this.copyDirectory(layoutSource, layoutDest);
      console.log('   📸 Snapshotted layout configurations');
    }
    
    // Create configuration snapshot hash
    const snapshotHash = Date.now().toString(36);
    const snapshotInfo = {
      timestamp: new Date().toISOString(),
      hash: snapshotHash,
      sources: {
        entities: fs.existsSync(entitiesSource),
        navigation: fs.existsSync(navSource),
        layouts: fs.existsSync(layoutSource)
      }
    };
    
    fs.writeFileSync(
      path.join(configsPath, 'snapshot-info.json'),
      JSON.stringify(snapshotInfo, null, 2)
    );
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const items = fs.readdirSync(source);
    
    items.forEach(item => {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
  }

  /**
   * Update current iteration symlink
   */
  updateCurrentSymlink(iterationPath) {
    // Windows doesn't handle symlinks well, so we'll use a pointer file
    const pointerPath = path.join(CURRENT_DIR, 'iteration-pointer.json');
    const pointer = {
      currentIteration: path.basename(iterationPath),
      path: iterationPath,
      updated: new Date().toISOString()
    };
    fs.writeFileSync(pointerPath, JSON.stringify(pointer, null, 2));
  }

  /**
   * List all iterations
   */
  listIterations() {
    console.log('\n📋 Iterations Overview\n');
    console.log('='.repeat(80));
    
    if (this.manifest.iterations.length === 0) {
      console.log('No iterations found.');
      return;
    }
    
    // Current iteration
    if (this.manifest.currentIteration) {
      const current = this.manifest.iterations.find(i => i.id === this.manifest.currentIteration);
      if (current) {
        console.log(`CURRENT: ${current.id}`);
        console.log(`         ${current.description}`);
        console.log(`         Type: ${current.type || 'feature'} | Line: ${current.line || 'concept'}`);
        console.log('');
      }
    }
    
    // All iterations
    console.log('ALL ITERATIONS:');
    this.manifest.iterations.forEach(iter => {
      const marker = iter.id === this.manifest.currentIteration ? '→' : ' ';
      const golden = this.manifest.goldenIterations?.includes(iter.id) ? '⭐' : '';
      console.log(`${marker} ${iter.id} ${golden}`);
      console.log(`  ${iter.description}`);
      console.log(`  Created: ${iter.created} | Status: ${iter.status}`);
    });
    
    // Statistics
    console.log('\n📊 Statistics:');
    console.log(`   Total Iterations: ${this.manifest.statistics.totalIterations}`);
    console.log(`   Concept: ${this.manifest.statistics.conceptIterations}`);
    console.log(`   Prototype: ${this.manifest.statistics.prototypeIterations}`);
    console.log(`   Production: ${this.manifest.statistics.productionIterations}`);
    
    // Golden iterations
    if (this.manifest.goldenIterations?.length > 0) {
      console.log('\n⭐ Golden Iterations:');
      this.manifest.goldenIterations.forEach(id => {
        const iter = this.manifest.iterations.find(i => i.id === id);
        if (iter) {
          console.log(`   ${id} - ${iter.description}`);
        }
      });
    }
  }

  /**
   * Switch to a specific iteration (read-only)
   */
  switchIteration(iterationId) {
    const iteration = this.manifest.iterations.find(i => i.id === iterationId);
    if (!iteration) {
      console.error(`❌ Iteration not found: ${iterationId}`);
      return false;
    }
    
    const iterationPath = path.join(ARCHIVE_DIR, iterationId);
    if (!fs.existsSync(iterationPath)) {
      console.error(`❌ Iteration directory not found: ${iterationPath}`);
      return false;
    }
    
    this.manifest.currentIteration = iterationId;
    this.updateCurrentSymlink(iterationPath);
    this.saveManifest();
    
    console.log(`✅ Switched to iteration: ${iterationId}`);
    console.log(`   Description: ${iteration.description}`);
    
    return true;
  }

  /**
   * Tag an iteration as golden
   */
  tagGolden(iterationId) {
    const iteration = this.manifest.iterations.find(i => i.id === iterationId);
    if (!iteration) {
      console.error(`❌ Iteration not found: ${iterationId}`);
      return false;
    }
    
    if (!this.manifest.goldenIterations) {
      this.manifest.goldenIterations = [];
    }
    
    if (!this.manifest.goldenIterations.includes(iterationId)) {
      this.manifest.goldenIterations.push(iterationId);
      this.saveManifest();
      console.log(`⭐ Tagged iteration as golden: ${iterationId}`);
    } else {
      console.log(`ℹ️ Iteration already tagged as golden: ${iterationId}`);
    }
    
    return true;
  }

  /**
   * Compare two iterations
   */
  compareIterations(id1, id2) {
    const iter1 = this.manifest.iterations.find(i => i.id === id1);
    const iter2 = this.manifest.iterations.find(i => i.id === id2);
    
    if (!iter1 || !iter2) {
      console.error('❌ One or both iterations not found');
      return;
    }
    
    console.log('\n📊 Iteration Comparison\n');
    console.log('='.repeat(80));
    console.log(`Comparing: ${id1}`);
    console.log(`     with: ${id2}`);
    console.log('');
    
    // Load metadata
    const meta1Path = path.join(ARCHIVE_DIR, id1, 'metadata.json');
    const meta2Path = path.join(ARCHIVE_DIR, id2, 'metadata.json');
    
    if (fs.existsSync(meta1Path) && fs.existsSync(meta2Path)) {
      const meta1 = JSON.parse(fs.readFileSync(meta1Path, 'utf8'));
      const meta2 = JSON.parse(fs.readFileSync(meta2Path, 'utf8'));
      
      // Compare basic info
      console.log('Basic Information:');
      console.log(`  Type: ${meta1.type} → ${meta2.type}`);
      console.log(`  Line: ${meta1.line} → ${meta2.line}`);
      console.log(`  Stories: ${meta1.scope.stories.length} → ${meta2.scope.stories.length}`);
      
      // Compare results
      console.log('\nResults:');
      console.log(`  Artifacts: ${meta1.results.artifacts_generated} → ${meta2.results.artifacts_generated}`);
      console.log(`  Tests Passed: ${meta1.results.tests_passed} → ${meta2.results.tests_passed}`);
      console.log(`  Tests Failed: ${meta1.results.tests_failed} → ${meta2.results.tests_failed}`);
      
      // Compare configurations
      const configs1 = path.join(ARCHIVE_DIR, id1, 'configs', 'entities');
      const configs2 = path.join(ARCHIVE_DIR, id2, 'configs', 'entities');
      
      if (fs.existsSync(configs1) && fs.existsSync(configs2)) {
        const files1 = fs.readdirSync(configs1);
        const files2 = fs.readdirSync(configs2);
        
        const added = files2.filter(f => !files1.includes(f));
        const removed = files1.filter(f => !files2.includes(f));
        
        console.log('\nConfiguration Changes:');
        if (added.length > 0) {
          console.log(`  Added: ${added.join(', ')}`);
        }
        if (removed.length > 0) {
          console.log(`  Removed: ${removed.join(', ')}`);
        }
        if (added.length === 0 && removed.length === 0) {
          console.log(`  No configuration changes`);
        }
      }
    }
  }
}

// CLI Commands
function main() {
  const manager = new IterationManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'new':
    case 'create':
      const description = args.join(' ') || 'New iteration';
      manager.createIteration(description);
      break;
      
    case 'list':
      manager.listIterations();
      break;
      
    case 'switch':
      if (args[0]) {
        manager.switchIteration(args[0]);
      } else {
        console.error('❌ Please provide an iteration ID');
      }
      break;
      
    case 'golden':
    case 'tag-golden':
      if (args[0]) {
        manager.tagGolden(args[0]);
      } else if (manager.manifest.currentIteration) {
        manager.tagGolden(manager.manifest.currentIteration);
      } else {
        console.error('❌ Please provide an iteration ID or set current iteration');
      }
      break;
      
    case 'compare':
      if (args[0] && args[1]) {
        manager.compareIterations(args[0], args[1]);
      } else {
        console.error('❌ Please provide two iteration IDs to compare');
      }
      break;
      
    default:
      console.log(`
Iteration Management System (IMS) v1.0.0

Usage:
  node iteration-manager.js <command> [options]

Commands:
  new <description>       Create a new iteration
  list                    List all iterations
  switch <id>            Switch to a specific iteration
  golden [id]            Tag iteration as golden (default: current)
  compare <id1> <id2>    Compare two iterations

Examples:
  node iteration-manager.js new "Testing service location views"
  node iteration-manager.js list
  node iteration-manager.js switch ITER-2025-01-21-001
  node iteration-manager.js golden
  node iteration-manager.js compare ITER-001 ITER-002
      `);
  }
}

// Export for use as module
module.exports = IterationManager;

// Run if called directly
if (require.main === module) {
  main();
}