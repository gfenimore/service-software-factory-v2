const fs = require('fs');
const path = require('path');
const MermaidBUSMParser = require('./mermaid-parser');

class BUSMReader {
  constructor() {
    this.mermaidParser = new MermaidBUSMParser();
  }

  read(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.mmd' || ext === '.mermaid') {
      return this.mermaidParser.parseMermaidFile(filePath);
    } else if (ext === '.json') {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      throw new Error(`Unsupported file format: ${ext}. Supported formats: .mmd, .mermaid, .json`);
    }
  }

  readContent(content, format = 'mermaid') {
    if (format === 'mermaid') {
      return this.mermaidParser.parseMermaidContent(content);
    } else if (format === 'json') {
      return JSON.parse(content);
    } else {
      throw new Error(`Unsupported format: ${format}. Supported formats: mermaid, json`);
    }
  }

  extractSubset(filePath, entities) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.mmd' || ext === '.mermaid') {
      this.mermaidParser.parseMermaidFile(filePath);
      return this.mermaidParser.extractSubset(entities);
    } else if (ext === '.json') {
      const busm = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return this.extractJsonSubset(busm, entities);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  extractJsonSubset(busm, entities) {
    const entitySet = new Set(entities);
    
    return {
      metadata: busm.metadata || {},
      entities: busm.entities.filter(e => entitySet.has(e.name)),
      relationships: busm.relationships.filter(r => 
        entitySet.has(r.sourceEntity) && entitySet.has(r.targetEntity)
      )
    };
  }

  toBUSMFormat(data) {
    if (typeof data === 'string') {
      return this.mermaidParser.parseMermaidContent(data);
    }
    return data;
  }

  toMermaid(busm) {
    return this.mermaidParser.toMermaid(busm);
  }
}

module.exports = BUSMReader;