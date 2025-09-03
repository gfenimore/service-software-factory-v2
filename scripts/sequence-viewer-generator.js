#!/usr/bin/env node
/**
 * Automated Sequence Viewer Generator
 * Reads sequence diagram markdown files and generates enhanced HTML viewers
 * Eliminates manual HTML editing when sequence diagrams change
 */

const fs = require('fs').promises;
const path = require('path');

class SequenceViewerGenerator {
  constructor() {
    this.templatePath = path.join(__dirname, '../.pipeline/01-concept-line/tools/sequence-viewer-template.html');
  }

  /**
   * Parse sequence diagram markdown to extract structured data
   */
  parseSequenceMarkdown(content) {
    const data = {
      title: '',
      description: '',
      overview: '',
      mermaidDiagram: '',
      metrics: {},
      inputArtifacts: [],
      outputArtifacts: [],
      toolsInvolved: [],
      testingSteps: [],
      automationBreakdown: { automated: [], manual: [] }
    };

    // Extract title from first heading
    const titleMatch = content.match(/^# (.+)/m);
    if (titleMatch) {
      data.title = titleMatch[1];
    }

    // Extract description from subtitle
    const descMatch = content.match(/^\*(.+)\*/m);
    if (descMatch) {
      data.description = descMatch[1];
    }

    // Extract overview from Stage Overview section
    const overviewMatch = content.match(/## Stage \d+ Overview[^#]*\n(.+?)(?=\n##|\n```|$)/s);
    if (overviewMatch) {
      data.overview = overviewMatch[1].trim();
    }

    // Extract Mermaid diagram
    const mermaidMatch = content.match(/```mermaid\r?\n([\s\S]+?)\r?\n```/);
    if (mermaidMatch) {
      data.mermaidDiagram = mermaidMatch[1];
    } else {
      console.log('⚠️ No Mermaid diagram found - checking content...');
      console.log('Content preview:', content.substring(0, 500));
    }

    // Extract metrics from Success Metrics table
    const metricsMatch = content.match(/\| Time to capture requirements.*?\n\| Business rules definition.*?\n\| BUSM parsing accuracy.*?\n\| Entity extraction.*?\n\| Gap identification.*?\n\| Format errors.*?\n/s);
    if (metricsMatch) {
      // Parse metrics from table - simplified for prototype
      data.metrics = {
        automationLevel: "90%",
        processingTime: "5-10 min",
        outputs: 5, // Extracted from new Stage 1 design
        consistency: "100%"
      };
    }

    // Extract artifacts from structured sections
    this.extractArtifacts(content, data);

    return data;
  }

  /**
   * Extract input/output artifacts from structured sections
   */
  extractArtifacts(content, data) {
    // Input artifacts - look for Input Artifacts or Input Requirements sections
    const inputMatch = content.match(/### Input (?:Artifacts|Requirements)[^#]*?\n([\s\S]+?)(?=\n###|\n##|$)/);
    if (inputMatch) {
      const inputs = inputMatch[1].match(/[-*] (.+)/g) || [];
      data.inputArtifacts = inputs.map(item => item.replace(/[-*] /, '').trim());
    }

    // Output artifacts - look for Output Artifacts or Artifacts Created sections
    const outputMatch = content.match(/### Output Artifacts[^#]*?\n([\s\S]+?)(?=\n###|\n##|$)/);
    if (outputMatch) {
      const outputs = outputMatch[1].match(/[-*] (.+)/g) || [];
      data.outputArtifacts = outputs.map(item => item.replace(/[-*] /, '').trim());
    }

    // Tools involved - look for Tools Involved section
    const toolsMatch = content.match(/## Tools Involved[^#]*?\n([\s\S]+?)(?=\n##|$)/);
    if (toolsMatch) {
      const tools = toolsMatch[1].match(/\d+\. \*\*(.+?)\*\*/g) || [];
      data.toolsInvolved = tools.map(tool => tool.replace(/\d+\. \*\*(.+?)\*\*.*/, '$1'));
    }

    // Automation breakdown
    const automatedMatch = content.match(/### What's Automated \(90%\)[^#]*?\n([\s\S]+?)(?=\n###|\n##|$)/);
    if (automatedMatch) {
      const automated = automatedMatch[1].match(/✅ (.+)/g) || [];
      data.automationBreakdown.automated = automated.map(item => item.replace('✅ ', '').trim());
    }

    const manualMatch = content.match(/### What Remains Human \(10%\)[^#]*?\n([\s\S]+?)(?=\n###|\n##|$)/);
    if (manualMatch) {
      const manual = manualMatch[1].match(/⚡ (.+)/g) || [];
      data.automationBreakdown.manual = manual.map(item => item.replace('⚡ ', '').trim());
    }
  }

  /**
   * Generate HTML viewer from extracted data
   */
  generateViewer(data) {
    const template = `<!DOCTYPE html>
<html>
<head>
    <title>${data.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            background: #f5f5f5; 
        }
        .container { 
            max-width: 1600px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0 0 15px 0;
            color: #2c3e50;
        }
        .header p {
            margin: 0;
            color: #666;
            font-size: 16px;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .mermaid {
            text-align: center;
            background: white;
            padding: 20px;
            border-radius: 6px;
        }
        .key-points {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #1976d2;
            margin-bottom: 30px;
        }
        .key-points h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #4caf50;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #666;
            font-size: 14px;
        }
        .automation-breakdown {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .automation-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }
        .automated-list, .manual-list {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 2px solid #e0e0e0;
        }
        .automated-list {
            border-color: #4caf50;
        }
        .manual-list {
            border-color: #ff9800;
        }
        .automated-list h4 {
            color: #4caf50;
            margin: 0 0 10px 0;
        }
        .manual-list h4 {
            color: #ff9800;
            margin: 0 0 10px 0;
        }
        .automated-list ul, .manual-list ul {
            margin: 0;
            padding-left: 20px;
        }
        .automated-list li, .manual-list li {
            margin-bottom: 5px;
        }
        .artifacts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .artifact-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .artifact-header {
            background: #f5f5f5;
            padding: 15px;
            border-bottom: 2px solid #e0e0e0;
        }
        .artifact-header h4 {
            margin: 0;
            color: #333;
        }
        .artifact-content {
            padding: 15px;
        }
        .artifact-list {
            margin: 0;
            padding-left: 20px;
        }
        .artifact-list li {
            margin-bottom: 8px;
            color: #555;
        }
        .generated-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="generated-notice">
            🤖 This viewer was auto-generated from sequence diagram markdown. Last updated: ${new Date().toISOString()}
        </div>
        
        <div class="header">
            <h1>🔄 ${data.title}</h1>
            <p>${data.description}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${data.metrics.automationLevel || '90%'}</div>
                <div class="metric-label">Automation Level</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.metrics.processingTime || '5-10 min'}</div>
                <div class="metric-label">Processing Time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.metrics.outputs || '5'}</div>
                <div class="metric-label">Output Artifacts</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.metrics.consistency || '100%'}</div>
                <div class="metric-label">Consistency</div>
            </div>
        </div>

        <div class="key-points">
            <h3>🎯 Stage Overview</h3>
            <p>${data.overview}</p>
        </div>

        <div class="content">
            <div class="mermaid">
${data.mermaidDiagram}
            </div>
        </div>

        <div class="artifacts-grid">
            <div class="artifact-card">
                <div class="artifact-header">
                    <h4>📥 Input Artifacts</h4>
                </div>
                <div class="artifact-content">
                    <ul class="artifact-list">
                        ${data.inputArtifacts.map(item => `<li>${item}</li>`).join('\n                        ')}
                    </ul>
                </div>
            </div>
            <div class="artifact-card">
                <div class="artifact-header">
                    <h4>📤 Output Artifacts</h4>
                </div>
                <div class="artifact-content">
                    <ul class="artifact-list">
                        ${data.outputArtifacts.map(item => `<li>${item}</li>`).join('\n                        ')}
                    </ul>
                </div>
            </div>
            <div class="artifact-card">
                <div class="artifact-header">
                    <h4>⚙️ Tools Involved</h4>
                </div>
                <div class="artifact-content">
                    <ul class="artifact-list">
                        ${data.toolsInvolved.map(item => `<li>${item}</li>`).join('\n                        ')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="automation-breakdown">
            <h3>🤖 Automation Breakdown</h3>
            <div class="automation-section">
                <div class="automated-list">
                    <h4>✅ Automated (90%)</h4>
                    <ul>
                        ${data.automationBreakdown.automated.map(item => `<li>${item}</li>`).join('\n                        ')}
                    </ul>
                </div>
                <div class="manual-list">
                    <h4>⚡ Manual (10%)</h4>
                    <ul>
                        ${data.automationBreakdown.manual.map(item => `<li>${item}</li>`).join('\n                        ')}
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            sequence: {
                useMaxWidth: true,
                showSequenceNumbers: true,
                wrap: true
            }
        });
    </script>
</body>
</html>`;

    return template;
  }

  /**
   * Main entry point - generate viewer from markdown file
   */
  async generateFromFile(mdFilePath, outputPath) {
    try {
      console.log(`📖 Reading sequence diagram: ${mdFilePath}`);
      const content = await fs.readFile(mdFilePath, 'utf8');
      
      console.log(`🔍 Parsing markdown structure...`);
      const data = this.parseSequenceMarkdown(content);
      
      console.log(`🎨 Generating HTML viewer...`);
      const html = this.generateViewer(data);
      
      console.log(`💾 Writing viewer: ${outputPath}`);
      await fs.writeFile(outputPath, html, 'utf8');
      
      console.log(`✅ Generated sequence viewer successfully!`);
      return { success: true, data, outputPath };
      
    } catch (error) {
      console.error(`❌ Error generating viewer:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * CLI interface
   */
  static async runCLI() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Automated Sequence Viewer Generator

Usage:
  node sequence-viewer-generator.js <input.md> <output.html>
  node sequence-viewer-generator.js --test

Options:
  --test    Generate viewer for Stage 1 sequence diagram
  --help    Show this help message

Examples:
  node sequence-viewer-generator.js ./models/STAGE-1-SEQUENCE-DIAGRAM.md ./viewers/stage1.html
  node sequence-viewer-generator.js --test
`);
      return;
    }

    const generator = new SequenceViewerGenerator();

    if (args.includes('--test')) {
      // Test with Stage 1 diagram
      const inputPath = path.join(__dirname, '../.pipeline/01-concept-line/models/STAGE-1-SEQUENCE-DIAGRAM.md');
      const outputPath = path.join(__dirname, '../.pipeline/01-concept-line/models/system-flows/stage1-auto-generated-viewer.html');
      
      const result = await generator.generateFromFile(inputPath, outputPath);
      if (result.success) {
        console.log(`🚀 Test completed successfully!`);
        console.log(`🌐 Open in browser: file://${path.resolve(outputPath)}`);
      }
      return;
    }

    // Manual file specification
    if (args.length !== 2) {
      console.error('❌ Please specify input markdown file and output HTML file');
      console.log('   Usage: node sequence-viewer-generator.js <input.md> <output.html>');
      process.exit(1);
    }

    const [inputPath, outputPath] = args;
    const result = await generator.generateFromFile(inputPath, outputPath);
    
    if (!result.success) {
      console.error(`❌ Generation failed: ${result.error}`);
      process.exit(1);
    }

    console.log(`🌐 Open in browser: file://${path.resolve(outputPath)}`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  SequenceViewerGenerator.runCLI().catch(console.error);
}

module.exports = SequenceViewerGenerator;