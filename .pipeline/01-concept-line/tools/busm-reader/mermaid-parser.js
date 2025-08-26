const fs = require('fs');
const path = require('path');

class MermaidBUSMParser {
  constructor() {
    this.entities = new Map();
    this.relationships = [];
  }

  parseMermaidFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return this.parseMermaidContent(content);
  }

  parseMermaidContent(content) {
    const lines = content.split('\n').map(line => line.trim());
    
    for (const line of lines) {
      if (!line || line.startsWith('%%') || line === 'graph TD' || line === 'graph LR') {
        continue;
      }
      
      if (line.includes('[') && line.includes(']')) {
        this.parseEntity(line);
      }
      
      if (line.includes('-->') || line.includes('-.->') || line.includes('==>')) {
        this.parseRelationship(line);
      }
    }
    
    return this.toBUSMFormat();
  }

  parseEntity(line) {
    const idMatch = line.match(/^(\w+)\[([^\]]+)\]/);
    if (idMatch) {
      const [, id, label] = idMatch;
      const cleanLabel = label.replace(/["']/g, '');
      
      const entityDetails = this.parseEntityDetails(cleanLabel);
      
      this.entities.set(id, {
        id: id,
        name: entityDetails.name,
        type: entityDetails.type,
        attributes: entityDetails.attributes || []
      });
    }
  }

  parseEntityDetails(label) {
    const parts = label.split('|');
    
    if (parts.length === 1) {
      return { name: parts[0].trim(), type: 'Entity' };
    }
    
    const name = parts[0].trim();
    const attributes = [];
    let type = 'Entity';
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.startsWith('+') || part.startsWith('-') || part.startsWith('#')) {
        const visibility = part[0];
        const attrName = part.substring(1).trim();
        const [attrNamePart, attrType] = attrName.split(':').map(s => s.trim());
        
        attributes.push({
          name: attrNamePart,
          type: attrType || 'string',
          visibility: visibility === '+' ? 'public' : visibility === '-' ? 'private' : 'protected'
        });
      } else if (part.includes(':')) {
        const [attrName, attrType] = part.split(':').map(s => s.trim());
        attributes.push({
          name: attrName,
          type: attrType || 'string',
          visibility: 'public'
        });
      }
    }
    
    return { name, type, attributes };
  }

  parseRelationship(line) {
    let relType = 'association';
    let arrow = '-->';
    
    if (line.includes('-.->')) {
      relType = 'dependency';
      arrow = '.->';
    } else if (line.includes('==>')) {
      relType = 'composition';
      arrow = '==>';
    } else if (line.includes('--|>')) {
      relType = 'inheritance';
      arrow = '--|>';
    }
    
    const parts = line.split(arrow);
    if (parts.length !== 2) return;
    
    const sourceMatch = parts[0].trim().match(/^(\w+)/);
    const targetMatch = parts[1].trim().match(/^(\w+)/);
    
    if (sourceMatch && targetMatch) {
      const labelMatch = parts[1].match(/\|([^|]+)\|/);
      const label = labelMatch ? labelMatch[1].trim() : '';
      
      this.relationships.push({
        source: sourceMatch[1],
        target: targetMatch[1],
        type: relType,
        label: label
      });
    }
  }

  toBUSMFormat() {
    const busm = {
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        source: 'mermaid-parser'
      },
      entities: Array.from(this.entities.values()),
      relationships: this.relationships.map(rel => ({
        ...rel,
        sourceEntity: this.entities.get(rel.source)?.name || rel.source,
        targetEntity: this.entities.get(rel.target)?.name || rel.target
      }))
    };
    
    return busm;
  }

  extractSubset(entities) {
    const subset = {
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        source: 'mermaid-parser-subset'
      },
      entities: [],
      relationships: []
    };
    
    const entitySet = new Set(entities);
    
    for (const [id, entity] of this.entities) {
      if (entitySet.has(entity.name)) {
        subset.entities.push(entity);
      }
    }
    
    for (const rel of this.relationships) {
      const sourceEntity = this.entities.get(rel.source);
      const targetEntity = this.entities.get(rel.target);
      
      if (sourceEntity && targetEntity && 
          entitySet.has(sourceEntity.name) && 
          entitySet.has(targetEntity.name)) {
        subset.relationships.push({
          ...rel,
          sourceEntity: sourceEntity.name,
          targetEntity: targetEntity.name
        });
      }
    }
    
    return subset;
  }

  toMermaid(busm) {
    const lines = ['graph TD'];
    
    for (const entity of busm.entities) {
      let label = entity.name;
      if (entity.attributes && entity.attributes.length > 0) {
        const attrs = entity.attributes.map(attr => {
          const prefix = attr.visibility === 'private' ? '-' : 
                        attr.visibility === 'protected' ? '#' : '+';
          return `${prefix}${attr.name}: ${attr.type}`;
        });
        label = `${entity.name}|${attrs.join('|')}`;
      }
      lines.push(`  ${entity.id}[${label}]`);
    }
    
    for (const rel of busm.relationships) {
      let arrow = '-->';
      if (rel.type === 'dependency') arrow = '.->';
      if (rel.type === 'composition') arrow = '==>';
      if (rel.type === 'inheritance') arrow = '--|>';
      
      if (rel.label) {
        lines.push(`  ${rel.source} ${arrow}|${rel.label}| ${rel.target}`);
      } else {
        lines.push(`  ${rel.source} ${arrow} ${rel.target}`);
      }
    }
    
    return lines.join('\n');
  }
}

module.exports = MermaidBUSMParser;