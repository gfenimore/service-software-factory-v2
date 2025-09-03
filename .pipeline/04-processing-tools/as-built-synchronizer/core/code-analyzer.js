#!/usr/bin/env node

/**
 * Code Analyzer - As-Built Synchronizer Core Component
 * Analyzes JavaScript/TypeScript implementations to extract actual behavior
 * 
 * Implements: TR-001 (File System Analysis) from AS-BUILT-SYNCHRONIZER-PRD.md
 */

const fs = require('fs');
const path = require('path');

class CodeAnalyzer {
  constructor(options = {}) {
    this.options = {
      supportedExtensions: ['.js', '.ts', '.jsx', '.tsx'],
      maxFileSize: 1024 * 1024, // 1MB max file size
      excludePatterns: ['node_modules', '.git', 'dist', 'build'],
      ...options
    };
    
    this.analysisResults = new Map();
  }

  /**
   * Analyze a component's implementation
   * Implements: FR-001 (Implementation Analysis)
   */
  async analyzeComponent(componentPath, componentName) {
    console.log(`🔍 Analyzing component: ${componentName} at ${componentPath}`);
    
    const startTime = Date.now();
    const result = {
      componentName,
      componentPath,
      timestamp: new Date().toISOString(),
      files: [],
      functions: [],
      exports: [],
      imports: [],
      configurations: [],
      apiEndpoints: [],
      errors: []
    };

    try {
      // Find all relevant files
      const files = this.findRelevantFiles(componentPath);
      console.log(`  📁 Found ${files.length} files to analyze`);
      
      for (const file of files) {
        try {
          const fileAnalysis = await this.analyzeFile(file);
          result.files.push(fileAnalysis);
          
          // Aggregate results
          result.functions.push(...fileAnalysis.functions);
          result.exports.push(...fileAnalysis.exports);
          result.imports.push(...fileAnalysis.imports);
          result.configurations.push(...fileAnalysis.configurations);
          result.apiEndpoints.push(...fileAnalysis.apiEndpoints);
          
        } catch (error) {
          result.errors.push({
            file,
            error: error.message,
            type: 'FILE_ANALYSIS_ERROR'
          });
        }
      }
      
      // Calculate summary statistics
      result.summary = this.generateSummary(result);
      result.analysisTime = Date.now() - startTime;
      
      this.analysisResults.set(componentName, result);
      
      console.log(`  ✅ Analysis complete in ${result.analysisTime}ms`);
      console.log(`     Functions: ${result.functions.length}`);
      console.log(`     Exports: ${result.exports.length}`);
      console.log(`     API Endpoints: ${result.apiEndpoints.length}`);
      
      return result;
      
    } catch (error) {
      result.errors.push({
        type: 'COMPONENT_ANALYSIS_ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Find all relevant files for analysis
   */
  findRelevantFiles(componentPath) {
    const files = [];
    
    const walkDirectory = (dir, basePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = path.join(basePath, entry);
        
        // Skip excluded patterns
        if (this.shouldExcludeFile(relativePath)) {
          continue;
        }
        
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDirectory(fullPath, relativePath);
        } else if (stat.isFile() && this.isSupportedFile(entry) && stat.size <= this.options.maxFileSize) {
          files.push(fullPath);
        }
      }
    };
    
    walkDirectory(componentPath);
    return files.sort(); // Consistent ordering
  }

  /**
   * Check if file should be excluded
   */
  shouldExcludeFile(filePath) {
    return this.options.excludePatterns.some(pattern => 
      filePath.includes(pattern)
    );
  }

  /**
   * Check if file extension is supported
   */
  isSupportedFile(filename) {
    const ext = path.extname(filename);
    return this.options.supportedExtensions.includes(ext);
  }

  /**
   * Analyze individual file
   */
  async analyzeFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const extension = path.extname(filePath);
    
    const fileResult = {
      path: filePath,
      relativePath,
      extension,
      size: content.length,
      functions: [],
      exports: [],
      imports: [],
      configurations: [],
      apiEndpoints: [],
      classes: [],
      comments: []
    };

    try {
      // Analyze based on file type
      if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
        await this.analyzeJavaScriptFile(content, fileResult);
      } else if (extension === '.json') {
        this.analyzeJsonFile(content, fileResult);
      }
      
      return fileResult;
      
    } catch (error) {
      fileResult.analysisError = error.message;
      return fileResult;
    }
  }

  /**
   * Analyze JavaScript/TypeScript file
   * Uses regex patterns for now - could be enhanced with AST parsing
   */
  async analyzeJavaScriptFile(content, fileResult) {
    // Extract function declarations
    this.extractFunctions(content, fileResult);
    
    // Extract exports
    this.extractExports(content, fileResult);
    
    // Extract imports
    this.extractImports(content, fileResult);
    
    // Extract classes
    this.extractClasses(content, fileResult);
    
    // Extract API endpoints (Express.js style)
    this.extractApiEndpoints(content, fileResult);
    
    // Extract configuration objects
    this.extractConfigurations(content, fileResult);
    
    // Extract JSDoc comments
    this.extractComments(content, fileResult);
  }

  /**
   * Extract function declarations from JavaScript content
   */
  extractFunctions(content, fileResult) {
    // Regular function declarations
    const functionPattern = /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;
    
    while ((match = functionPattern.exec(content)) !== null) {
      const [fullMatch, name, params] = match;
      const line = this.getLineNumber(content, match.index);
      
      fileResult.functions.push({
        name,
        type: 'function',
        parameters: this.parseParameters(params),
        line,
        signature: fullMatch,
        isAsync: fullMatch.includes('async')
      });
    }
    
    // Arrow function assignments
    const arrowPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g;
    
    while ((match = arrowPattern.exec(content)) !== null) {
      const [fullMatch, name, params] = match;
      const line = this.getLineNumber(content, match.index);
      
      fileResult.functions.push({
        name,
        type: 'arrow',
        parameters: this.parseParameters(params),
        line,
        signature: fullMatch,
        isAsync: fullMatch.includes('async')
      });
    }
    
    // Method definitions in classes
    const methodPattern = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*{/g;
    
    while ((match = methodPattern.exec(content)) !== null) {
      const [fullMatch, name, params] = match;
      const line = this.getLineNumber(content, match.index);
      
      // Skip obvious non-methods (like if statements)
      if (!['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
        fileResult.functions.push({
          name,
          type: 'method',
          parameters: this.parseParameters(params),
          line,
          signature: fullMatch,
          isAsync: fullMatch.includes('async')
        });
      }
    }
  }

  /**
   * Extract exports from JavaScript content
   */
  extractExports(content, fileResult) {
    // module.exports
    const moduleExportsPattern = /module\.exports\s*=\s*(\w+|{[^}]*})/g;
    let match;
    
    while ((match = moduleExportsPattern.exec(content)) !== null) {
      const [fullMatch, exported] = match;
      const line = this.getLineNumber(content, match.index);
      
      fileResult.exports.push({
        type: 'module.exports',
        name: exported.trim(),
        line,
        statement: fullMatch
      });
    }
    
    // ES6 exports
    const exportPattern = /export\s+(?:default\s+)?(?:class|function|const|let|var)?\s*(\w+)/g;
    
    while ((match = exportPattern.exec(content)) !== null) {
      const [fullMatch, name] = match;
      const line = this.getLineNumber(content, match.index);
      
      fileResult.exports.push({
        type: 'es6',
        name,
        line,
        statement: fullMatch,
        isDefault: fullMatch.includes('default')
      });
    }
  }

  /**
   * Extract imports from JavaScript content
   */
  extractImports(content, fileResult) {
    // require statements
    const requirePattern = /(?:const|let|var)\s+(?:{([^}]+)}|(\w+))\s*=\s*require\(['"`]([^'"`]+)['"`]\)/g;
    let match;
    
    while ((match = requirePattern.exec(content)) !== null) {
      const [fullMatch, destructured, single, modulePath] = match;
      const line = this.getLineNumber(content, match.index);
      
      fileResult.imports.push({
        type: 'require',
        module: modulePath,
        imports: destructured ? destructured.split(',').map(s => s.trim()) : [single],
        line,
        statement: fullMatch
      });
    }
    
    // ES6 imports
    const importPattern = /import\s+(?:(\w+)|{([^}]+)})?\s*from\s+['"`]([^'"`]+)['"`]/g;
    
    while ((match = importPattern.exec(content)) !== null) {
      const [fullMatch, defaultImport, destructured, modulePath] = match;
      const line = this.getLineNumber(content, match.index);
      
      const imports = [];
      if (defaultImport) imports.push(defaultImport);
      if (destructured) imports.push(...destructured.split(',').map(s => s.trim()));
      
      fileResult.imports.push({
        type: 'es6',
        module: modulePath,
        imports,
        line,
        statement: fullMatch
      });
    }
  }

  /**
   * Extract class declarations
   */
  extractClasses(content, fileResult) {
    const classPattern = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/g;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      const [fullMatch, name, parent] = match;
      const line = this.getLineNumber(content, match.index);
      
      fileResult.classes.push({
        name,
        parent: parent || null,
        line,
        declaration: fullMatch
      });
    }
  }

  /**
   * Extract API endpoints (Express.js patterns)
   */
  extractApiEndpoints(content, fileResult) {
    const endpointPattern = /(?:app|router)\.(?:get|post|put|delete|patch)\s*\(['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = endpointPattern.exec(content)) !== null) {
      const [fullMatch, path] = match;
      const method = fullMatch.match(/\.(get|post|put|delete|patch)/)[1].toUpperCase();
      const line = this.getLineNumber(content, match.index);
      
      fileResult.apiEndpoints.push({
        method,
        path,
        line,
        declaration: fullMatch
      });
    }
  }

  /**
   * Extract configuration objects
   */
  extractConfigurations(content, fileResult) {
    // Look for common configuration patterns
    const configPatterns = [
      /(?:const|let|var)\s+(\w*[Cc]onfig\w*)\s*=\s*{([^}]*)}/g,
      /(?:const|let|var)\s+(\w*[Ss]ettings\w*)\s*=\s*{([^}]*)}/g,
      /(?:const|let|var)\s+(\w*[Oo]ptions\w*)\s*=\s*{([^}]*)}/g
    ];
    
    configPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const [fullMatch, name, configContent] = match;
        const line = this.getLineNumber(content, match.index);
        
        fileResult.configurations.push({
          name,
          content: configContent.trim(),
          line,
          declaration: fullMatch
        });
      }
    });
  }

  /**
   * Extract JSDoc comments
   */
  extractComments(content, fileResult) {
    const jsdocPattern = /\/\*\*[\s\S]*?\*\//g;
    let match;
    
    while ((match = jsdocPattern.exec(content)) !== null) {
      const [fullMatch] = match;
      const line = this.getLineNumber(content, match.index);
      
      fileResult.comments.push({
        type: 'jsdoc',
        content: fullMatch,
        line
      });
    }
  }

  /**
   * Analyze JSON configuration file
   */
  analyzeJsonFile(content, fileResult) {
    try {
      const jsonData = JSON.parse(content);
      
      fileResult.configurations.push({
        name: path.basename(fileResult.path, '.json'),
        type: 'json',
        structure: this.analyzeJsonStructure(jsonData),
        keys: Object.keys(jsonData),
        content: jsonData
      });
      
    } catch (error) {
      fileResult.configurations.push({
        name: path.basename(fileResult.path, '.json'),
        type: 'json',
        error: 'Invalid JSON: ' + error.message
      });
    }
  }

  /**
   * Analyze JSON structure recursively
   */
  analyzeJsonStructure(obj, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth || obj === null || typeof obj !== 'object') {
      return typeof obj;
    }
    
    if (Array.isArray(obj)) {
      return ['array', obj.length > 0 ? this.analyzeJsonStructure(obj[0], maxDepth, currentDepth + 1) : 'empty'];
    }
    
    const structure = {};
    for (const [key, value] of Object.entries(obj)) {
      structure[key] = this.analyzeJsonStructure(value, maxDepth, currentDepth + 1);
    }
    
    return structure;
  }

  /**
   * Parse function parameters string
   */
  parseParameters(paramsString) {
    if (!paramsString || paramsString.trim() === '') {
      return [];
    }
    
    return paramsString.split(',').map(param => {
      const trimmed = param.trim();
      const [name, defaultValue] = trimmed.split('=').map(s => s.trim());
      
      return {
        name,
        hasDefault: !!defaultValue,
        defaultValue: defaultValue || null,
        isOptional: trimmed.includes('?') || !!defaultValue
      };
    });
  }

  /**
   * Get line number for character index in content
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Generate summary statistics
   */
  generateSummary(result) {
    return {
      totalFiles: result.files.length,
      totalFunctions: result.functions.length,
      totalExports: result.exports.length,
      totalImports: result.imports.length,
      totalApiEndpoints: result.apiEndpoints.length,
      totalConfigurations: result.configurations.length,
      totalClasses: result.classes ? result.classes.reduce((sum, file) => sum + file.classes.length, 0) : 0,
      fileTypes: result.files.reduce((acc, file) => {
        acc[file.extension] = (acc[file.extension] || 0) + 1;
        return acc;
      }, {}),
      errors: result.errors.length
    };
  }

  /**
   * Save analysis results to file
   */
  async saveResults(outputPath, componentName) {
    const results = this.analysisResults.get(componentName);
    if (!results) {
      throw new Error(`No analysis results found for component: ${componentName}`);
    }
    
    const outputFile = path.join(outputPath, `${componentName}-analysis.json`);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write results
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    console.log(`💾 Analysis results saved to: ${outputFile}`);
    return outputFile;
  }

  /**
   * Get analysis results for component
   */
  getResults(componentName) {
    return this.analysisResults.get(componentName);
  }

  /**
   * List all analyzed components
   */
  listComponents() {
    return Array.from(this.analysisResults.keys());
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new CodeAnalyzer();
  
  const componentPath = process.argv[2];
  const componentName = process.argv[3] || path.basename(componentPath);
  
  if (!componentPath) {
    console.error('Usage: node code-analyzer.js <component-path> [component-name]');
    process.exit(1);
  }
  
  analyzer.analyzeComponent(componentPath, componentName)
    .then(results => {
      console.log('\n📊 Analysis Summary:');
      console.log(JSON.stringify(results.summary, null, 2));
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = CodeAnalyzer;