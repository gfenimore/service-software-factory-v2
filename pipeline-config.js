/**
 * Pipeline Configuration - Central Path Management
 * 
 * This file serves as the single source of truth for all pipeline tool paths.
 * Gradually replace hardcoded paths with references to this configuration.
 */

module.exports = {
  PIPELINE_ROOT: process.env.PIPELINE_ROOT || '.pipeline',
  BUILD_ROOT: process.env.BUILD_ROOT || '.build',
  
  // Map logical names to physical paths
  // Based on actual discovered tool locations in current pipeline structure
  paths: {
    // Core generators (actual locations discovered)
    'concept-generator': '.pipeline/01-concept-line/tools/concept-generator/concept-html/concept-generator-v3.js',
    'concept-generator-v2': '.pipeline/01-concept-line/tools/concept-generator/concept-html/concept-generator-v2.js',
    'viewforge-transformer': '.pipeline/01-concept-line/tools/viewforge/viewforge-transformer.js',
    'module-builder': '.pipeline/04-processing-tools/module-system/module-builder.js',
    
    // Testing tools (search for actual locations)
    'module-tester': '.pipeline/04-processing-tools/module-system/test-busm-to-module.js',
    'busm-tester': '.pipeline/01-concept-line/tools/busm-reader/test-busm-reader.js',
    'ast-tester': '.pipeline/04-processing-tools/ast-generator/test-simple-ast.js',
    'ast-integration': '.pipeline/04-processing-tools/ast-generator/test-complete-integration.js',
    
    // Business rules and configuration
    'rules-cli': '.pipeline/05-data-tools/business-rules-engine/business-rules-configurator/rules-cli.js',
    'database-generator': '.pipeline/05-data-tools/database-generator/index.js',
    
    // Control panel and UI
    'control-panel': '.pipeline/06-control-panel/server.js',
    
    // Directory roots (for reference and path building)
    'concept-line-root': '.pipeline/01-concept-line',
    'prototype-line-root': '.pipeline/02-prototype-line', 
    'requirements-root': '.pipeline/00-requirements',
    'processing-tools-root': '.pipeline/04-processing-tools',
    'data-tools-root': '.pipeline/05-data-tools'
  },
  
  // Output directories for different stages
  outputs: {
    'concept': '.build/current/concept',
    'prototype': '.build/current/prototype', 
    'production': '.build/current/production',
    'database': '.build/database',
    'logs': '.build/logs',
    'temp': '.build/temp'
  },
  
  // Legacy output paths (for compatibility during transition)
  legacyOutputs: {
    'concept': '.pipeline/01-concept-line/outputs',
    'prototype': '.pipeline/02-prototype-line/outputs',
    'database': '.pipeline/database/migrations/prototype'
  },
  
  /**
   * Get a tool path by logical name
   * @param {string} component - Logical name of the tool
   * @returns {string} - Physical path to the tool
   */
  getPath: function(component) {
    const path = this.paths[component];
    if (!path) {
      console.warn(`⚠️  Pipeline Config: Unknown component '${component}', using as literal path`);
      return component;
    }
    return path;
  },
  
  /**
   * Get an output directory path
   * @param {string} stage - Build stage (concept, prototype, production)
   * @param {boolean} useLegacy - Whether to use legacy output paths during transition
   * @returns {string} - Output directory path
   */
  getOutputPath: function(stage, useLegacy = false) {
    const outputs = useLegacy ? this.legacyOutputs : this.outputs;
    const path = outputs[stage];
    if (!path) {
      const fallback = useLegacy ? `.pipeline/${stage}/output` : `.build/current/${stage}`;
      console.warn(`⚠️  Pipeline Config: Unknown stage '${stage}', using fallback: ${fallback}`);
      return fallback;
    }
    return path;
  },
  
  /**
   * Check if running in legacy mode (using .pipeline outputs)
   * @returns {boolean}
   */
  isLegacyMode: function() {
    return process.env.PIPELINE_LEGACY_MODE === 'true' || 
           !require('fs').existsSync('.build');
  },
  
  /**
   * Get all available tools for debugging
   * @returns {Object} - Map of all available tools
   */
  getAvailableTools: function() {
    return { ...this.paths };
  },
  
  /**
   * Validate that a tool exists
   * @param {string} component - Tool component name
   * @returns {boolean} - Whether the tool file exists
   */
  validateTool: function(component) {
    const fs = require('fs');
    const path = this.getPath(component);
    return fs.existsSync(path);
  },
  
  /**
   * Create output directory if it doesn't exist
   * @param {string} stage - Build stage
   * @param {boolean} useLegacy - Whether to use legacy paths
   */
  ensureOutputDir: function(stage, useLegacy = false) {
    const fs = require('fs');
    const path = require('path');
    const outputDir = this.getOutputPath(stage, useLegacy);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${outputDir}`);
    }
  }
};