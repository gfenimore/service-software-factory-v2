#!/usr/bin/env node

/**
 * test-quality-dashboard.js
 * Analyzes test quality and generates metrics dashboard
 */

const fs = require('fs');
const path = require('path');

class TestQualityDashboard {
  constructor() {
    this.metrics = {
      components: [],
      summary: {
        totalComponents: 0,
        componentsWithTests: 0,
        totalTests: 0,
        businessTests: 0,
        boilerplateTests: 0,
        averageQualityScore: 0
      },
      patterns: {
        financial: 0,
        pii: 0,
        interaction: 0,
        conditional: 0,
        error: 0
      },
      coverage: {
        business: 0,
        implementation: 0,
        overall: 0
      }
    };
  }

  // Scan directory for components and tests
  scanDirectory(dir) {
    const components = [];
    
    function scan(directory) {
      const files = fs.readdirSync(directory);
      
      files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile()) {
          // Component files
          if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
            const testFiles = [
              fullPath.replace('.tsx', '.test.tsx'),
              fullPath.replace('.tsx', '.business.test.tsx'),
              fullPath.replace('.tsx', '.spec.tsx')
            ];
            
            const existingTests = testFiles.filter(tf => fs.existsSync(tf));
            
            components.push({
              path: fullPath,
              name: file,
              hasTests: existingTests.length > 0,
              testFiles: existingTests
            });
          }
          
          // Type files
          if (file.endsWith('.types.ts')) {
            const testFile = fullPath.replace('.types.ts', '.types.test.ts');
            if (fs.existsSync(testFile)) {
              components.push({
                path: fullPath,
                name: file,
                hasTests: true,
                testFiles: [testFile]
              });
            }
          }
        }
      });
    }
    
    if (fs.existsSync(dir)) {
      scan(dir);
    }
    
    return components;
  }

  // Analyze test file quality
  analyzeTestFile(testPath) {
    if (!fs.existsSync(testPath)) {
      return null;
    }
    
    const content = fs.readFileSync(testPath, 'utf8');
    const lines = content.split('\n');
    
    const analysis = {
      path: testPath,
      lineCount: lines.length,
      testCount: 0,
      patterns: {
        financial: false,
        pii: false,
        interaction: false,
        conditional: false,
        error: false
      },
      quality: {
        hasBusinessTests: false,
        hasBoilerplate: false,
        hasClearNaming: false,
        isUnder50Lines: lines.length <= 50
      },
      score: 0
    };
    
    // Count tests
    analysis.testCount = (content.match(/\b(test|it)\s*\(/g) || []).length;
    
    // Detect patterns
    analysis.patterns.financial = /balance|amount|price|currency|format.*money/i.test(content);
    analysis.patterns.pii = /mask|account.*number|ssn|credit.*card/i.test(content);
    analysis.patterns.interaction = /click|change|submit|user.*interaction/i.test(content);
    analysis.patterns.conditional = /conditional|renders.*when|shows.*if/i.test(content);
    analysis.patterns.error = /error|catch|failure|invalid/i.test(content);
    
    // Detect quality indicators
    analysis.quality.hasBusinessTests = 
      analysis.patterns.financial || 
      analysis.patterns.pii || 
      analysis.patterns.interaction ||
      analysis.patterns.conditional ||
      analysis.patterns.error;
    
    analysis.quality.hasBoilerplate = 
      /renders without crashing|renders correctly|should render/i.test(content);
    
    analysis.quality.hasClearNaming = 
      /describe\s*\(['"](.*business.*|.*logic.*|.*validation.*)/i.test(content);
    
    // Calculate quality score (0-100)
    let score = 0;
    if (analysis.testCount > 0) score += 20;
    if (analysis.quality.hasBusinessTests) score += 30;
    if (!analysis.quality.hasBoilerplate) score += 20;
    if (analysis.quality.hasClearNaming) score += 15;
    if (analysis.quality.isUnder50Lines) score += 15;
    
    analysis.score = score;
    
    return analysis;
  }

  // Calculate business value score
  calculateBusinessValue(analysis) {
    const weights = {
      financial: 10,
      pii: 10,
      interaction: 5,
      conditional: 3,
      error: 7
    };
    
    let value = 0;
    Object.keys(analysis.patterns).forEach(pattern => {
      if (analysis.patterns[pattern]) {
        value += weights[pattern] || 0;
      }
    });
    
    return value;
  }

  // Generate the dashboard
  generateDashboard() {
    // Scan for components
    const srcComponents = this.scanDirectory('src/components');
    const srcHooks = this.scanDirectory('src/hooks');
    const srcTypes = this.scanDirectory('src/types');
    
    const allComponents = [...srcComponents, ...srcHooks, ...srcTypes];
    
    // Analyze each component's tests
    allComponents.forEach(component => {
      const componentMetrics = {
        name: component.name,
        path: component.path,
        hasTests: component.hasTests,
        tests: [],
        qualityScore: 0,
        businessValue: 0
      };
      
      if (component.hasTests) {
        component.testFiles.forEach(testFile => {
          const analysis = this.analyzeTestFile(testFile);
          if (analysis) {
            componentMetrics.tests.push(analysis);
            componentMetrics.qualityScore = Math.max(componentMetrics.qualityScore, analysis.score);
            componentMetrics.businessValue += this.calculateBusinessValue(analysis);
            
            // Update pattern counts
            Object.keys(analysis.patterns).forEach(pattern => {
              if (analysis.patterns[pattern]) {
                this.metrics.patterns[pattern]++;
              }
            });
            
            // Update test counts
            this.metrics.summary.totalTests += analysis.testCount;
            if (analysis.quality.hasBusinessTests) {
              this.metrics.summary.businessTests += analysis.testCount;
            }
            if (analysis.quality.hasBoilerplate) {
              this.metrics.summary.boilerplateTests += analysis.testCount;
            }
          }
        });
      }
      
      this.metrics.components.push(componentMetrics);
    });
    
    // Calculate summary metrics
    this.metrics.summary.totalComponents = allComponents.length;
    this.metrics.summary.componentsWithTests = allComponents.filter(c => c.hasTests).length;
    
    if (this.metrics.components.length > 0) {
      const totalScore = this.metrics.components.reduce((sum, c) => sum + c.qualityScore, 0);
      this.metrics.summary.averageQualityScore = Math.round(totalScore / this.metrics.components.length);
    }
    
    // Calculate coverage
    if (this.metrics.summary.totalComponents > 0) {
      this.metrics.coverage.overall = Math.round(
        (this.metrics.summary.componentsWithTests / this.metrics.summary.totalComponents) * 100
      );
    }
    
    if (this.metrics.summary.totalTests > 0) {
      this.metrics.coverage.business = Math.round(
        (this.metrics.summary.businessTests / this.metrics.summary.totalTests) * 100
      );
      this.metrics.coverage.implementation = 100 - this.metrics.coverage.business;
    }
    
    return this.metrics;
  }

  // Format the dashboard as text
  formatDashboard() {
    const metrics = this.generateDashboard();
    
    let output = `
╔══════════════════════════════════════════════════╗
║           TEST QUALITY DASHBOARD                 ║
╚══════════════════════════════════════════════════╝

📊 SUMMARY METRICS
═══════════════════════════════════════════════════
  Total Components:        ${metrics.summary.totalComponents}
  Components with Tests:   ${metrics.summary.componentsWithTests} (${metrics.coverage.overall}%)
  Total Test Cases:        ${metrics.summary.totalTests}
  Business Logic Tests:    ${metrics.summary.businessTests} (${metrics.coverage.business}%)
  Boilerplate Tests:       ${metrics.summary.boilerplateTests}
  Average Quality Score:   ${metrics.summary.averageQualityScore}/100

🎯 PATTERN COVERAGE
═══════════════════════════════════════════════════
  Financial Logic:    ${metrics.patterns.financial} components
  PII Handling:       ${metrics.patterns.pii} components
  User Interactions:  ${metrics.patterns.interaction} components
  Conditional Logic:  ${metrics.patterns.conditional} components
  Error Handling:     ${metrics.patterns.error} components

📈 TOP QUALITY COMPONENTS
═══════════════════════════════════════════════════`;
    
    // Sort by quality score
    const topComponents = metrics.components
      .filter(c => c.hasTests)
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 5);
    
    topComponents.forEach(comp => {
      output += `
  ${comp.name.padEnd(30)} Score: ${comp.qualityScore}/100`;
    });
    
    output += `

⚠️  COMPONENTS NEEDING TESTS
═══════════════════════════════════════════════════`;
    
    const untested = metrics.components
      .filter(c => !c.hasTests)
      .slice(0, 5);
    
    if (untested.length === 0) {
      output += `
  ✅ All components have tests!`;
    } else {
      untested.forEach(comp => {
        output += `
  ❌ ${comp.name}`;
      });
      
      if (metrics.components.filter(c => !c.hasTests).length > 5) {
        output += `
  ... and ${metrics.components.filter(c => !c.hasTests).length - 5} more`;
      }
    }
    
    output += `

🏆 QUALITY INDICATORS
═══════════════════════════════════════════════════`;
    
    // Quality indicators
    const indicators = [];
    
    if (metrics.coverage.overall >= 80) {
      indicators.push('✅ Good test coverage (>80%)');
    } else if (metrics.coverage.overall >= 60) {
      indicators.push('⚠️  Moderate test coverage (60-80%)');
    } else {
      indicators.push('❌ Low test coverage (<60%)');
    }
    
    if (metrics.coverage.business >= 70) {
      indicators.push('✅ High business logic focus (>70%)');
    } else if (metrics.coverage.business >= 50) {
      indicators.push('⚠️  Moderate business focus (50-70%)');
    } else {
      indicators.push('❌ Low business logic focus (<50%)');
    }
    
    if (metrics.summary.averageQualityScore >= 70) {
      indicators.push('✅ High quality tests (>70/100)');
    } else if (metrics.summary.averageQualityScore >= 50) {
      indicators.push('⚠️  Moderate test quality (50-70/100)');
    } else {
      indicators.push('❌ Low test quality (<50/100)');
    }
    
    indicators.forEach(ind => {
      output += `
  ${ind}`;
    });
    
    output += `

═══════════════════════════════════════════════════
Generated: ${new Date().toISOString()}
`;
    
    return output;
  }

  // Save dashboard to file
  saveDashboard(outputPath = 'test-quality-dashboard.txt') {
    const dashboard = this.formatDashboard();
    fs.writeFileSync(outputPath, dashboard);
    console.log(dashboard);
    console.log(`Dashboard saved to: ${outputPath}`);
    
    // Also save JSON metrics
    const jsonPath = outputPath.replace('.txt', '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.metrics, null, 2));
    console.log(`Metrics saved to: ${jsonPath}`);
  }
}

// Main execution
function main() {
  console.log('Generating Test Quality Dashboard...\n');
  
  const dashboard = new TestQualityDashboard();
  dashboard.saveDashboard();
}

if (require.main === module) {
  main();
}

module.exports = TestQualityDashboard;