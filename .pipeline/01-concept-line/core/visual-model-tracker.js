#!/usr/bin/env node

/**
 * Visual Model Tracker - Real-time pipeline visualization
 * Shows what's happening as the pipeline executes
 */

const fs = require('fs');
const path = require('path');

class VisualModelTracker {
  constructor() {
    this.executionModel = new Map();
    this.visualizer = new ProcessVisualizer();
    this.isTracking = false;
    this.trackingStartTime = null;
  }

  startTracking(pipelineName = 'concept-line') {
    this.isTracking = true;
    this.trackingStartTime = Date.now();
    this.executionModel.clear();
    
    console.log(`📊 Visual tracking started for pipeline: ${pipelineName}`);
    return this.trackingStartTime;
  }

  recordStage(stageName, inputs, outputs, metrics = {}) {
    if (!this.isTracking) return;
    
    const timestamp = Date.now();
    const duration = timestamp - (this.executionModel.get('lastTimestamp') || this.trackingStartTime);
    
    const stageRecord = {
      stageName,
      inputs: this.sanitizeData(inputs),
      outputs: this.sanitizeData(outputs),
      metrics: {
        duration,
        timestamp,
        ...metrics
      },
      status: 'completed'
    };
    
    this.executionModel.set(stageName, stageRecord);
    this.executionModel.set('lastTimestamp', timestamp);
    
    // Real-time console visualization
    this.displayStageUpdate(stageRecord);
    
    // Update live model
    this.updateLiveDiagram();
    
    return stageRecord;
  }

  recordError(stageName, error, partialOutputs = {}) {
    if (!this.isTracking) return;
    
    const timestamp = Date.now();
    const duration = timestamp - (this.executionModel.get('lastTimestamp') || this.trackingStartTime);
    
    const errorRecord = {
      stageName,
      error: error.message || error,
      partialOutputs: this.sanitizeData(partialOutputs),
      metrics: { duration, timestamp },
      status: 'error'
    };
    
    this.executionModel.set(stageName, errorRecord);
    this.executionModel.set('lastTimestamp', timestamp);
    
    console.log(`❌ Stage ${stageName} failed: ${error.message || error}`);
    
    return errorRecord;
  }

  sanitizeData(data) {
    if (!data) return null;
    
    // Convert large objects to summaries
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return {
          type: 'array',
          length: data.length,
          sample: data.slice(0, 2)
        };
      } else {
        const keys = Object.keys(data);
        return {
          type: 'object',
          keys: keys.slice(0, 5),
          totalKeys: keys.length
        };
      }
    }
    
    return data;
  }

  displayStageUpdate(stageRecord) {
    const { stageName, metrics, status } = stageRecord;
    const statusIcon = status === 'completed' ? '✅' : '❌';
    const duration = `${metrics.duration}ms`;
    
    console.log(`${statusIcon} ${stageName.padEnd(20)} | ${duration.padEnd(8)} | ${status}`);
  }

  stopTracking() {
    this.isTracking = false;
    const totalDuration = Date.now() - this.trackingStartTime;
    
    console.log(`\n📊 Tracking completed in ${totalDuration}ms`);
    
    return this.generateExecutionSummary();
  }

  generateExecutionSummary() {
    const stages = Array.from(this.executionModel.entries())
      .filter(([key]) => key !== 'lastTimestamp')
      .map(([key, value]) => value);
    
    const totalDuration = Date.now() - this.trackingStartTime;
    const successCount = stages.filter(s => s.status === 'completed').length;
    const errorCount = stages.filter(s => s.status === 'error').length;
    
    const summary = {
      totalDuration,
      stageCount: stages.length,
      successCount,
      errorCount,
      successRate: successCount / stages.length,
      stages: stages
    };
    
    this.displaySummary(summary);
    this.saveExecutionModel(summary);
    
    return summary;
  }

  displaySummary(summary) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📈 EXECUTION SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Duration: ${summary.totalDuration}ms`);
    console.log(`Stages: ${summary.successCount}/${summary.stageCount} successful`);
    console.log(`Success Rate: ${Math.round(summary.successRate * 100)}%`);
    
    if (summary.errorCount > 0) {
      console.log(`\n❌ Errors:`);
      summary.stages
        .filter(s => s.status === 'error')
        .forEach(s => console.log(`  - ${s.stageName}: ${s.error}`));
    }
    
    console.log(`${'='.repeat(60)}\n`);
  }

  saveExecutionModel(summary) {
    const modelsDir = path.join(__dirname, '../models/live');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `execution-model-${timestamp}.json`;
    const filepath = path.join(modelsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));
    
    // Also save as latest
    const latestPath = path.join(modelsDir, 'latest-execution.json');
    fs.writeFileSync(latestPath, JSON.stringify(summary, null, 2));
    
    console.log(`💾 Execution model saved: ${filename}`);
  }

  updateLiveDiagram() {
    const mermaidDiagram = this.visualizer.generateMermaidDiagram(this.executionModel);
    const htmlVisualization = this.visualizer.generateHtmlVisualization(this.executionModel);
    
    const modelsDir = path.join(__dirname, '../models/live');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    // Save Mermaid diagram
    fs.writeFileSync(path.join(modelsDir, 'pipeline-flow.mmd'), mermaidDiagram);
    
    // Save HTML visualization
    fs.writeFileSync(path.join(modelsDir, 'pipeline-visualization.html'), htmlVisualization);
  }

  generateLiveDiagram() {
    return this.visualizer.generateMermaidDiagram(this.executionModel);
  }
}

class ProcessVisualizer {
  generateMermaidDiagram(executionModel) {
    const stages = Array.from(executionModel.entries())
      .filter(([key]) => key !== 'lastTimestamp')
      .map(([key, value]) => value);
    
    let mermaid = `graph TD\n`;
    mermaid += `  Start([Pipeline Start])\n`;
    
    stages.forEach((stage, index) => {
      const stageId = `S${index + 1}`;
      const statusIcon = stage.status === 'completed' ? '✅' : '❌';
      const duration = `${stage.metrics.duration}ms`;
      
      mermaid += `  ${stageId}[${statusIcon} ${stage.stageName}<br/>${duration}]\n`;
      
      if (index === 0) {
        mermaid += `  Start --> ${stageId}\n`;
      } else {
        mermaid += `  S${index} --> ${stageId}\n`;
      }
      
      // Add status styling
      if (stage.status === 'error') {
        mermaid += `  class ${stageId} error\n`;
      } else {
        mermaid += `  class ${stageId} success\n`;
      }
    });
    
    mermaid += `  S${stages.length} --> End([Pipeline End])\n`;
    
    // Add styling classes
    mermaid += `\n  classDef success fill:#d4edda,stroke:#155724,color:#155724\n`;
    mermaid += `  classDef error fill:#f8d7da,stroke:#721c24,color:#721c24\n`;
    
    return mermaid;
  }

  generateHtmlVisualization(executionModel) {
    const stages = Array.from(executionModel.entries())
      .filter(([key]) => key !== 'lastTimestamp')
      .map(([key, value]) => value);
    
    const stageCards = stages.map(stage => `
      <div class="stage-card ${stage.status}">
        <div class="stage-header">
          <span class="stage-icon">${stage.status === 'completed' ? '✅' : '❌'}</span>
          <h3>${stage.stageName}</h3>
          <span class="duration">${stage.metrics.duration}ms</span>
        </div>
        <div class="stage-details">
          <div class="inputs">
            <strong>Inputs:</strong> ${JSON.stringify(stage.inputs, null, 2)}
          </div>
          <div class="outputs">
            <strong>Outputs:</strong> ${JSON.stringify(stage.outputs, null, 2)}
          </div>
        </div>
      </div>
    `).join('\n');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Concept Line Pipeline - Live Visualization</title>
    <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #f5f5f5; 
        }
        .pipeline-container { 
          max-width: 1200px; 
          margin: 0 auto; 
        }
        .pipeline-header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stage-card {
          background: white;
          margin: 10px 0;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 4px solid #28a745;
        }
        .stage-card.error {
          border-left-color: #dc3545;
        }
        .stage-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .stage-icon {
          font-size: 24px;
          margin-right: 15px;
        }
        .stage-header h3 {
          flex: 1;
          margin: 0;
          color: #333;
        }
        .duration {
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #6c757d;
        }
        .stage-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .inputs, .outputs {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          font-size: 12px;
        }
        .inputs strong, .outputs strong {
          color: #495057;
          display: block;
          margin-bottom: 8px;
        }
        .refresh-info {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #17a2b8;
          color: white;
          padding: 10px 15px;
          border-radius: 4px;
          font-size: 12px;
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
    </style>
    <script>
        // Auto-refresh every 2 seconds during pipeline execution
        setTimeout(() => location.reload(), 2000);
    </script>
</head>
<body>
    <div class="refresh-info">Auto-refreshing every 2s</div>
    <div class="pipeline-container">
        <div class="pipeline-header">
            <h1>🏭 Concept Line Pipeline - Live Visualization</h1>
            <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
        <div class="stages">
            ${stageCards}
        </div>
    </div>
</body>
</html>
    `;
  }
}

// Usage example and testing
if (require.main === module) {
  const tracker = new VisualModelTracker();
  
  // Demo execution
  tracker.startTracking('demo-pipeline');
  
  // Simulate stages
  tracker.recordStage('Requirements Capture', 
    { busmFile: 'BUSM.mmd' }, 
    { entities: ['Account', 'User'] },
    { entitiesFound: 2 }
  );
  
  tracker.recordStage('Configuration', 
    { entities: ['Account', 'User'] }, 
    { enrichedConfig: 'config.json' }
  );
  
  tracker.recordStage('ViewForge', 
    { config: 'config.json' }, 
    { components: ['AccountList.jsx'] }
  );
  
  const summary = tracker.stopTracking();
  
  console.log('\n🔍 Generated files:');
  console.log('  - models/live/pipeline-flow.mmd');
  console.log('  - models/live/pipeline-visualization.html');
  console.log('  - models/live/latest-execution.json');
  
  console.log('\n🌐 View visualization: open models/live/pipeline-visualization.html');
}

module.exports = VisualModelTracker;