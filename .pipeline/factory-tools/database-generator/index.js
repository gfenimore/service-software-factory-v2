/**
 * Database Generator for Prototype Line
 * Generates Supabase-compatible SQL migrations from module configurations
 * Part of the Service Software Factory Pipeline
 */

const fs = require('fs').promises;
const path = require('path');

class PrototypeDatabaseGenerator {
  constructor(config = {}) {
    this.config = {
      iteration: config.iteration || 1,
      modulePath: config.modulePath || '.pipeline/factory-tools/module-system',
      busmPath: config.busmPath || '.pipeline/factory-tools/busm-reader/busm-model.json',
      outputPath: config.outputPath || '.pipeline/database/migrations/prototype',
      statePath: config.statePath || '.pipeline/database/state/prototype',
      typesPath: config.typesPath || '.pipeline/database/types',
      ...config
    };
    
    this.moduleConfig = null;
    this.busmModel = null;
    this.previousSchema = null;
    this.discoveryReport = null;
  }

  async generate(moduleName, phase = 1) {
    console.log('🏭 Database Generator - Prototype Mode');
    console.log('━'.repeat(50));
    console.log(`Module: ${moduleName}`);
    console.log(`Phase: ${phase}`);
    console.log(`Iteration: ${this.config.iteration}`);
    console.log();

    try {
      // 1. Discovery Phase
      console.log('🔍 Discovery Phase...');
      await this.discover(moduleName, phase);
      
      // 2. Validation Phase
      console.log('✓ Validation Phase...');
      const validation = await this.validate();
      
      if (validation.hasErrors) {
        this.handleValidationErrors(validation);
        return { success: false, validation };
      }
      
      // 3. Generation Phase
      console.log('🔨 Generation Phase...');
      const schema = await this.buildSchema();
      const migrations = await this.generateMigrations(schema);
      
      // 4. Output Phase
      console.log('💾 Saving Artifacts...');
      await this.saveMigrations(migrations);
      await this.saveSchemaState(schema);
      await this.generateTypes(schema);
      
      // 5. Report
      this.printSuccessReport(migrations);
      
      return {
        success: true,
        tablesCreated: migrations.creates.length,
        tablesModified: migrations.alters.length,
        iteration: this.config.iteration
      };
      
    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async discover(moduleName, phase) {
    // Load module configuration
    const modulePath = path.join(
      this.config.modulePath,
      `${moduleName}-module-phase${phase}-auto.yaml`
    );
    
    try {
      const moduleContent = await fs.readFile(modulePath, 'utf8');
      this.moduleConfig = this.parseYAML(moduleContent);
      console.log(`  ✓ Loaded module: ${this.moduleConfig.entity.name}`);
    } catch (error) {
      // Try without -auto suffix
      const altPath = modulePath.replace('-auto.yaml', '.yaml');
      const moduleContent = await fs.readFile(altPath, 'utf8');
      this.moduleConfig = this.parseYAML(moduleContent);
      console.log(`  ✓ Loaded module: ${this.moduleConfig.entity.name}`);
    }
    
    // Load BUSM model
    const busmContent = await fs.readFile(this.config.busmPath, 'utf8');
    this.busmModel = JSON.parse(busmContent);
    console.log(`  ✓ Loaded BUSM: ${Object.keys(this.busmModel.entities).length} entities`);
    
    // Load previous schema if not iteration 1
    if (this.config.iteration > 1) {
      const prevSchemaPath = path.join(
        this.config.statePath,
        `iteration-${this.config.iteration - 1}-schema.json`
      );
      
      try {
        const prevContent = await fs.readFile(prevSchemaPath, 'utf8');
        this.previousSchema = JSON.parse(prevContent);
        console.log(`  ✓ Loaded previous schema (iteration ${this.config.iteration - 1})`);
      } catch (error) {
        console.log(`  ℹ No previous schema found, treating as iteration 1`);
        this.config.iteration = 1;
      }
    }
    
    // Build discovery report
    this.discoveryReport = {
      entity: this.moduleConfig.entity.name,
      fields: this.moduleConfig.entity.fields || [],
      relationships: this.extractRelationships(),
      operations: ['create', 'read', 'update', 'delete']
    };
    
    console.log(`  ✓ Discovered ${this.discoveryReport.fields.length} fields`);
  }

  async validate() {
    const validation = {
      hasErrors: false,
      errors: [],
      warnings: []
    };
    
    // Check entity exists in BUSM
    const busmEntity = this.busmModel.entities[this.moduleConfig.entity];
    if (!busmEntity) {
      validation.errors.push({
        type: 'MISSING_ENTITY',
        message: `Entity '${this.moduleConfig.entity}' not found in BUSM`
      });
      validation.hasErrors = true;
      return validation;
    }
    
    // Validate each field
    this.moduleConfig.fields.forEach(field => {
      const busmField = busmEntity.fields.find(f => f.name === field.name);
      
      if (!busmField) {
        validation.warnings.push({
          type: 'UNKNOWN_FIELD',
          message: `Field '${field.name}' not found in BUSM`,
          field: field.name
        });
      } else if (field.type !== busmField.type) {
        validation.warnings.push({
          type: 'TYPE_MISMATCH',
          message: `Field '${field.name}' type mismatch (module: ${field.type}, BUSM: ${busmField.type})`,
          field: field.name,
          resolution: 'Using BUSM type'
        });
        // Auto-fix: use BUSM type
        field.type = busmField.type;
      }
    });
    
    console.log(`  ✓ Validation complete: ${validation.warnings.length} warnings`);
    
    return validation;
  }

  buildSchema() {
    const schema = {};
    const entityName = this.moduleConfig.entity.toLowerCase();
    
    // Build table schema
    schema[entityName] = {
      name: entityName,
      fields: this.moduleConfig.fields.map(field => ({
        name: this.toSnakeCase(field.name),
        type: this.mapFieldType(field.type),
        required: field.required || false,
        primaryKey: field.name === 'id',
        unique: field.unique || false,
        defaultValue: this.getDefaultValue(field)
      })),
      indexes: [],
      foreignKeys: []
    };
    
    // Add basic indexes
    schema[entityName].fields.forEach(field => {
      if (field.name.endsWith('_id') && !field.primaryKey) {
        schema[entityName].indexes.push({
          name: `idx_${entityName}_${field.name}`,
          column: field.name
        });
      }
    });
    
    console.log(`  ✓ Built schema for table: ${entityName}`);
    
    return schema;
  }

  async generateMigrations(schema) {
    const migrations = {
      creates: [],
      alters: [],
      timestamp: new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    };
    
    if (this.config.iteration === 1) {
      // First iteration - create all tables
      Object.values(schema).forEach(table => {
        migrations.creates.push({
          table: table.name,
          sql: this.generateCreateTable(table)
        });
      });
    } else {
      // Subsequent iterations - diff and generate changes
      const diff = this.diffSchemas(this.previousSchema, schema);
      
      diff.newTables.forEach(table => {
        migrations.creates.push({
          table: table.name,
          sql: this.generateCreateTable(table)
        });
      });
      
      diff.modifiedTables.forEach(change => {
        migrations.alters.push({
          table: change.table,
          sql: this.generateAlterTable(change)
        });
      });
    }
    
    console.log(`  ✓ Generated ${migrations.creates.length} CREATE, ${migrations.alters.length} ALTER statements`);
    
    return migrations;
  }

  generateCreateTable(table) {
    const lines = [`CREATE TABLE ${table.name} (`];
    
    // Add fields
    table.fields.forEach((field, index) => {
      let fieldDef = `  ${field.name} ${field.type}`;
      
      if (field.primaryKey) {
        fieldDef += ' PRIMARY KEY';
      }
      if (field.defaultValue) {
        fieldDef += ` DEFAULT ${field.defaultValue}`;
      }
      if (field.required && !field.primaryKey) {
        fieldDef += ' NOT NULL';
      }
      if (field.unique) {
        fieldDef += ' UNIQUE';
      }
      
      if (index < table.fields.length - 1) {
        fieldDef += ',';
      }
      
      lines.push(fieldDef);
    });
    
    lines.push(');');
    lines.push('');
    
    // Add indexes
    table.indexes.forEach(index => {
      lines.push(`CREATE INDEX ${index.name} ON ${table.name}(${index.column});`);
    });
    
    return lines.join('\n');
  }

  generateAlterTable(change) {
    const lines = [];
    
    change.addedFields.forEach(field => {
      lines.push(`ALTER TABLE ${change.table} ADD COLUMN ${field.name} ${field.type};`);
    });
    
    return lines.join('\n');
  }

  async saveMigrations(migrations) {
    // Ensure output directory exists
    await fs.mkdir(this.config.outputPath, { recursive: true });
    
    // Generate migration filename
    const filename = `${migrations.timestamp}_iter${this.config.iteration}_${this.moduleConfig.entity.toLowerCase()}.sql`;
    const filepath = path.join(this.config.outputPath, filename);
    
    // Build migration content
    const content = [
      `-- Database Generator v1.0`,
      `-- Module: ${this.moduleConfig.module}`,
      `-- Entity: ${this.moduleConfig.entity}`,
      `-- Iteration: ${this.config.iteration}`,
      `-- Generated: ${new Date().toISOString()}`,
      '',
      ...migrations.creates.map(m => m.sql),
      ...migrations.alters.map(m => m.sql)
    ].join('\n');
    
    await fs.writeFile(filepath, content);
    console.log(`  ✓ Saved migration: ${filename}`);
    
    return filepath;
  }

  async saveSchemaState(schema) {
    await fs.mkdir(this.config.statePath, { recursive: true });
    
    const filename = `iteration-${this.config.iteration}-schema.json`;
    const filepath = path.join(this.config.statePath, filename);
    
    await fs.writeFile(filepath, JSON.stringify(schema, null, 2));
    console.log(`  ✓ Saved schema state: ${filename}`);
  }

  async generateTypes(schema) {
    await fs.mkdir(this.config.typesPath, { recursive: true });
    
    const filename = `database-types-iter${this.config.iteration}.ts`;
    const filepath = path.join(this.config.typesPath, filename);
    
    const types = this.generateTypeScript(schema);
    await fs.writeFile(filepath, types);
    console.log(`  ✓ Generated TypeScript types: ${filename}`);
  }

  generateTypeScript(schema) {
    const lines = [
      `// Generated by Database Generator`,
      `// Iteration: ${this.config.iteration}`,
      `// Generated: ${new Date().toISOString()}`,
      '',
      'export interface Database {',
      '  public: {',
      '    Tables: {'
    ];
    
    Object.values(schema).forEach(table => {
      lines.push(`      ${table.name}: {`);
      lines.push('        Row: {');
      
      table.fields.forEach(field => {
        const tsType = this.mapToTypeScript(field.type);
        const optional = field.required ? '' : ' | null';
        lines.push(`          ${field.name}: ${tsType}${optional}`);
      });
      
      lines.push('        }');
      lines.push('        Insert: {');
      
      table.fields.forEach(field => {
        const tsType = this.mapToTypeScript(field.type);
        const optional = field.primaryKey || field.defaultValue ? '?' : '';
        const nullable = field.required ? '' : ' | null';
        lines.push(`          ${field.name}${optional}: ${tsType}${nullable}`);
      });
      
      lines.push('        }');
      lines.push('      }');
    });
    
    lines.push('    }');
    lines.push('  }');
    lines.push('}');
    
    return lines.join('\n');
  }

  // Helper methods
  parseYAML(content) {
    // Simple YAML parser for our use case
    const result = {};
    const lines = content.split('\n');
    let currentSection = null;
    let currentArray = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      
      if (!line.startsWith(' ') && line.endsWith(':')) {
        currentSection = line.slice(0, -1);
        result[currentSection] = currentSection === 'fields' ? [] : {};
        currentArray = currentSection === 'fields' ? result[currentSection] : null;
      } else if (line.startsWith('  - ')) {
        if (currentArray) {
          const fieldLine = line.slice(4);
          if (fieldLine.includes(':')) {
            const [name, rest] = fieldLine.split(':').map(s => s.trim());
            const parts = rest.split(' ');
            currentArray.push({
              name,
              type: parts[0],
              required: rest.includes('(required)')
            });
          }
        }
      } else if (line.startsWith('  ') && line.includes(':')) {
        const [key, value] = line.slice(2).split(':').map(s => s.trim());
        if (currentSection && typeof result[currentSection] === 'object' && !Array.isArray(result[currentSection])) {
          result[currentSection][key] = value;
        }
      }
    });
    
    return result;
  }

  extractRelationships() {
    const relationships = [];
    
    this.moduleConfig.fields.forEach(field => {
      if (field.name.endsWith('Id') && field.name !== 'id') {
        const targetEntity = field.name.slice(0, -2);
        relationships.push({
          from: this.moduleConfig.entity,
          to: targetEntity,
          field: field.name,
          type: 'many-to-one'
        });
      }
    });
    
    return relationships;
  }

  toSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  mapFieldType(type) {
    const typeMap = {
      'uuid': 'UUID DEFAULT gen_random_uuid()',
      'string': 'VARCHAR(255)',
      'email': 'VARCHAR(255)',
      'phone': 'VARCHAR(20)',
      'text': 'TEXT',
      'integer': 'INTEGER',
      'decimal': 'DECIMAL(10, 2)',
      'boolean': 'BOOLEAN',
      'datetime': 'TIMESTAMPTZ',
      'date': 'DATE',
      'enum[AccountType]': 'VARCHAR(50)',
      'enum[AccountStatus]': 'VARCHAR(50)'
    };
    
    return typeMap[type] || 'VARCHAR(255)';
  }

  mapToTypeScript(sqlType) {
    if (sqlType.includes('UUID')) return 'string';
    if (sqlType.includes('VARCHAR') || sqlType.includes('TEXT')) return 'string';
    if (sqlType.includes('INTEGER')) return 'number';
    if (sqlType.includes('DECIMAL')) return 'number';
    if (sqlType.includes('BOOLEAN')) return 'boolean';
    if (sqlType.includes('TIMESTAMP') || sqlType.includes('DATE')) return 'string';
    return 'string';
  }

  getDefaultValue(field) {
    if (field.name === 'id') return 'gen_random_uuid()';
    if (field.name === 'createdAt') return 'NOW()';
    if (field.name === 'status') return "'Active'";
    return null;
  }

  diffSchemas(oldSchema, newSchema) {
    const diff = {
      newTables: [],
      modifiedTables: [],
      deletedTables: []
    };
    
    // For now, simple implementation
    Object.keys(newSchema).forEach(tableName => {
      if (!oldSchema || !oldSchema[tableName]) {
        diff.newTables.push(newSchema[tableName]);
      }
    });
    
    return diff;
  }

  handleValidationErrors(validation) {
    console.log('\n❌ Validation Failed\n');
    
    if (validation.errors.length > 0) {
      console.log('Blocking Errors:');
      validation.errors.forEach(error => {
        console.log(`  - ${error.message}`);
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log('\nWarnings:');
      validation.warnings.forEach(warning => {
        console.log(`  - ${warning.message}`);
        if (warning.resolution) {
          console.log(`    Resolution: ${warning.resolution}`);
        }
      });
    }
    
    console.log('\nPlease fix these issues and try again.');
  }

  printSuccessReport(migrations) {
    console.log('\n✅ Database Generation Complete!\n');
    console.log('Summary:');
    console.log(`  • Iteration: ${this.config.iteration}`);
    console.log(`  • Tables created: ${migrations.creates.length}`);
    console.log(`  • Tables modified: ${migrations.alters.length}`);
    console.log('\nNext steps:');
    console.log('  1. Review the generated migration');
    console.log('  2. Apply to Supabase: supabase db push');
    console.log('  3. Test with your application');
  }
}

// Export for use
module.exports = PrototypeDatabaseGenerator;

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node database-generator.js <module-name> [phase] [iteration]');
    console.log('Example: node database-generator.js account 1 1');
    process.exit(1);
  }
  
  const [moduleName, phase = 1, iteration = 1] = args;
  
  const generator = new PrototypeDatabaseGenerator({
    iteration: parseInt(iteration)
  });
  
  generator.generate(moduleName, parseInt(phase)).then(result => {
    if (!result.success) {
      process.exit(1);
    }
  });
}