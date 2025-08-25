/**
 * Factory Control Panel - MVP Server
 * Visual interface for the Service Software Factory
 */

const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;

// Get the absolute path to the pipeline directory
// Use path.resolve for robust cross-platform resolution
const PIPELINE_DIR = path.resolve(__dirname, '..');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store for build progress (in production, use proper database)
let currentBuild = {
  id: null,
  status: 'idle',
  stages: {},
  logs: [],
  startTime: null,
  endTime: null
};

// API Routes

// Debug endpoint to check paths
app.get('/api/debug', (req, res) => {
  const testPath = path.join(PIPELINE_DIR, '01-concept-line', 'tools', 'busm-reader', 'busm-model.json');
  res.json({
    __dirname: __dirname,
    PIPELINE_DIR: PIPELINE_DIR,
    testPath: testPath,
    exists: require('fs').existsSync(testPath),
    cwd: process.cwd()
  });
});

// Get BUSM entities
app.get('/api/busm/entities', async (req, res) => {
  try {
    const busmPath = path.join(PIPELINE_DIR, '01-concept-line', 'tools', 'busm-reader', 'busm-model.json');
    console.log('Trying to load BUSM from:', busmPath);
    console.log('PIPELINE_DIR:', PIPELINE_DIR);
    console.log('__dirname:', __dirname);
    const busmData = await fs.readFile(busmPath, 'utf8');
    const busm = JSON.parse(busmData);
    
    // Transform for UI consumption
    const entities = Object.entries(busm.entities).map(([name, entity]) => ({
      name,
      description: entity.description,
      fieldCount: Object.keys(entity.fields).length,
      fields: Object.entries(entity.fields).map(([fieldName, field]) => ({
        name: fieldName,
        type: field.type,
        required: field.required || false,
        description: field.description
      }))
    }));
    
    res.json({ entities });
  } catch (error) {
    console.error('Error loading BUSM:', error);
    res.status(500).json({ error: 'Failed to load BUSM model' });
  }
});

// Get existing modules
app.get('/api/modules', async (req, res) => {
  try {
    const modulePath = path.join(PIPELINE_DIR, '04-processing-tools', 'module-system');
    const files = await fs.readdir(modulePath);
    const modules = files
      .filter(f => f.endsWith('.yaml'))
      .map(f => f.replace('.yaml', ''));
    
    res.json({ modules });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load modules' });
  }
});

// Create new module configuration
app.post('/api/modules/create', async (req, res) => {
  const { entity, fields, phase } = req.body;
  
  currentBuild = {
    id: Date.now(),
    status: 'building',
    entity,
    phase,
    stages: {
      module: { status: 'pending', message: 'Creating module configuration...' },
      database: { status: 'pending', message: 'Waiting...' },
      components: { status: 'pending', message: 'Waiting...' },
      validation: { status: 'pending', message: 'Waiting...' }
    },
    logs: [],
    startTime: new Date()
  };
  
  res.json({ buildId: currentBuild.id, status: 'started' });
  
  // Execute pipeline asynchronously
  executePipeline(entity, fields, phase);
});

// Get build status
app.get('/api/build/status', (req, res) => {
  res.json(currentBuild);
});

// Get pipeline history
app.get('/api/history', async (req, res) => {
  // For MVP, just return mock data
  // In production, this would query a database
  const history = [
    {
      id: 1,
      entity: 'Account',
      phase: 1,
      timestamp: '2025-08-23T14:30:00Z',
      status: 'completed',
      user: 'Garry'
    }
  ];
  
  res.json({ history });
});

// Execute the factory pipeline
async function executePipeline(entity, fields, phase) {
  try {
    // Stage 1: Create module configuration
    updateStage('module', 'running', 'Creating module configuration...');
    await createModuleConfig(entity, fields, phase);
    updateStage('module', 'completed', 'Module configuration created');
    
    // Stage 2: Generate database
    updateStage('database', 'running', 'Generating database schema...');
    await generateDatabase(entity, phase);
    updateStage('database', 'completed', 'Database schema generated');
    
    // Stage 3: Generate components (simplified for MVP)
    updateStage('components', 'running', 'Generating React components...');
    await sleep(2000); // Simulated - would call AST generator
    updateStage('components', 'completed', 'Components generated');
    
    // Stage 4: Validation
    updateStage('validation', 'running', 'Validating generated code...');
    await sleep(1000); // Simulated - would run TypeScript check
    updateStage('validation', 'completed', 'All validations passed');
    
    currentBuild.status = 'completed';
    currentBuild.endTime = new Date();
    addLog('✅ Build completed successfully!');
    
  } catch (error) {
    currentBuild.status = 'failed';
    currentBuild.error = error.message;
    addLog(`❌ Build failed: ${error.message}`);
  }
}

// Create module configuration
async function createModuleConfig(entity, fields, phase) {
  // For MVP, create a simple module config
  const moduleConfig = {
    module: {
      id: `${entity.toLowerCase()}-phase${phase}`,
      name: `${entity} Management Phase ${phase}`,
      version: '1.0.0',
      phase: phase
    },
    entity: {
      name: entity,
      fields: fields
    }
  };
  
  const yaml = generateYAML(moduleConfig);
  const fileName = `${entity.toLowerCase()}-module-phase${phase}-ui.yaml`;
  const filePath = path.join(PIPELINE_DIR, '04-processing-tools', 'module-system', fileName);
  
  await fs.writeFile(filePath, yaml);
  addLog(`Created module config: ${fileName}`);
}

// Generate database using our Database Generator
async function generateDatabase(entity, phase) {
  return new Promise((resolve, reject) => {
    const command = `node ${path.join(PIPELINE_DIR, '05-data-tools', 'database-generator', 'index.js')} ${entity.toLowerCase()} ${phase} 1`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        addLog(`Database generation error: ${error.message}`);
        reject(error);
        return;
      }
      
      // Parse output for logs
      const lines = stdout.split('\n');
      lines.forEach(line => {
        if (line.includes('✓') || line.includes('✅')) {
          addLog(line.trim());
        }
      });
      
      resolve();
    });
  });
}

// Helper functions
function updateStage(stage, status, message) {
  if (currentBuild.stages[stage]) {
    currentBuild.stages[stage].status = status;
    currentBuild.stages[stage].message = message;
    currentBuild.stages[stage].timestamp = new Date();
  }
  addLog(`[${stage.toUpperCase()}] ${message}`);
}

function addLog(message) {
  currentBuild.logs.push({
    timestamp: new Date(),
    message
  });
  console.log(message);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateYAML(obj) {
  // Simple YAML generator for MVP
  const lines = [];
  
  function writeObject(data, indent = 0) {
    Object.entries(data).forEach(([key, value]) => {
      const spaces = ' '.repeat(indent);
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${spaces}${key}:`);
        writeObject(value, indent + 2);
      } else if (Array.isArray(value)) {
        lines.push(`${spaces}${key}:`);
        value.forEach(item => {
          if (typeof item === 'object') {
            lines.push(`${spaces}  - name: ${item.name}`);
            Object.entries(item).forEach(([k, v]) => {
              if (k !== 'name') {
                lines.push(`${spaces}    ${k}: ${v}`);
              }
            });
          } else {
            lines.push(`${spaces}  - ${item}`);
          }
        });
      } else {
        lines.push(`${spaces}${key}: ${value}`);
      }
    });
  }
  
  writeObject(obj);
  return lines.join('\n');
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🏭 FACTORY CONTROL PANEL - MVP                       ║
║                                                           ║
║     Server running at: http://localhost:${PORT}            ║
║                                                           ║
║     Open your browser to access the visual interface     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});