#!/usr/bin/env node

/**
 * Simple HTTP Server for viewing generated HTML
 * No dependencies required - uses Node's built-in modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const PIPELINE_ROOT = path.join(__dirname, '..', '..');

class SimpleViewer {
  constructor() {
    this.server = null;
  }

  start() {
    this.server = http.createServer((req, res) => {
      console.log(`Request: ${req.url}`);
      
      // Parse URL
      let filePath = req.url === '/' ? '/index.html' : req.url;
      
      // Security: prevent directory traversal
      filePath = filePath.replace(/\.\./g, '');
      
      // Try to find the file
      let fullPath = '';
      
      if (filePath === '/index.html' || filePath === '/') {
        // Serve the index page
        this.serveIndex(res);
        return;
      }
      
      // Check in current iteration
      const iterationsDir = path.join(PIPELINE_ROOT, 'iterations');
      const currentPointerPath = path.join(iterationsDir, 'current', 'iteration-pointer.json');
      
      if (fs.existsSync(currentPointerPath)) {
        const pointer = JSON.parse(fs.readFileSync(currentPointerPath, 'utf8'));
        const iterPath = pointer.path;
        fullPath = path.join(iterPath, 'generated', 'concept-line', filePath.substring(1));
      }
      
      if (!fs.existsSync(fullPath)) {
        // Try in general generated folder
        fullPath = path.join(PIPELINE_ROOT, '03-generated', 'concept-line', filePath.substring(1));
      }
      
      if (!fs.existsSync(fullPath)) {
        // Try exact path
        fullPath = path.join(PIPELINE_ROOT, filePath.substring(1));
      }
      
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        // Serve the file
        const ext = path.extname(fullPath);
        const contentType = this.getContentType(ext);
        
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(fullPath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('File not found: ' + filePath);
      }
    });
    
    this.server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║         🚀 Concept Line Viewer Started!                ║
╚════════════════════════════════════════════════════════╝

  Server running at: http://localhost:${PORT}
  
  Press Ctrl+C to stop the server
      `);
      
      // Auto-open browser on Windows
      if (process.platform === 'win32') {
        try {
          execSync(`start http://localhost:${PORT}`);
        } catch (e) {
          console.log('Please open your browser to: http://localhost:' + PORT);
        }
      }
    });
  }
  
  serveIndex(res) {
    // Get current iteration
    const iterationsDir = path.join(PIPELINE_ROOT, 'iterations');
    const manifestPath = path.join(iterationsDir, 'manifest.json');
    const currentPointerPath = path.join(iterationsDir, 'current', 'iteration-pointer.json');
    
    let currentIteration = null;
    let generatedFiles = [];
    
    if (fs.existsSync(currentPointerPath)) {
      const pointer = JSON.parse(fs.readFileSync(currentPointerPath, 'utf8'));
      currentIteration = pointer.currentIteration;
      
      const generatedPath = path.join(pointer.path, 'generated', 'concept-line');
      if (fs.existsSync(generatedPath)) {
        generatedFiles = fs.readdirSync(generatedPath)
          .filter(f => f.endsWith('.html'))
          .map(f => ({
            name: f,
            path: '/' + f,
            size: fs.statSync(path.join(generatedPath, f)).size
          }));
      }
    }
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Concept Line Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a1a1a;
      margin-bottom: 10px;
    }
    .iteration-info {
      color: #666;
      font-size: 14px;
    }
    .file-grid {
      display: grid;
      gap: 20px;
    }
    .file-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .file-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    .file-name {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .file-meta {
      font-size: 14px;
      color: #666;
    }
    .empty-state {
      background: white;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      color: #999;
    }
    .status {
      display: inline-block;
      padding: 4px 8px;
      background: #10b981;
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Concept Line Viewer <span class="status">LIVE</span></h1>
      <div class="iteration-info">
        ${currentIteration ? `Current Iteration: ${currentIteration}` : 'No iteration selected'}
      </div>
    </div>
    
    <div class="file-grid">
      ${generatedFiles.length > 0 ? generatedFiles.map(file => `
        <a href="${file.path}" class="file-card">
          <div class="file-name">📄 ${file.name}</div>
          <div class="file-meta">Click to view • ${(file.size / 1024).toFixed(1)}KB</div>
        </a>
      `).join('') : `
        <div class="empty-state">
          <p>No HTML files generated yet in the current iteration.</p>
          <p style="margin-top: 10px; font-size: 14px;">Run: npm run generate:all</p>
        </div>
      `}
    </div>
  </div>
</body>
</html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
  
  getContentType(ext) {
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    return types[ext] || 'text/plain';
  }
  
  stop() {
    if (this.server) {
      this.server.close();
      console.log('Server stopped');
    }
  }
}

// CLI
if (require.main === module) {
  const viewer = new SimpleViewer();
  viewer.start();
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nStopping server...');
    viewer.stop();
    process.exit(0);
  });
}

module.exports = SimpleViewer;