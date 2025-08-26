/**
 * ViewForge Transformer
 * Transforms ViewForge v3 configuration to simplified wireframe format
 * Focuses on: What to show and where clicks go
 */

class ViewForgeTransformer {
  constructor(busm, gapLogger) {
    this.busm = busm;
    this.gapLogger = gapLogger;
  }

  /**
   * Transform v3 config to simplified format
   */
  transformV3ToSimplified(v3Config) {
    // Generate unique ID if not present
    const id = v3Config.id || this.generateId(v3Config);
    
    // Transform to simplified format
    const simplified = {
      id: id,
      type: this.mapViewType(v3Config.type),
      entity: v3Config.entity,
      title: v3Config.title || `${v3Config.entity} ${v3Config.type}`,
      
      display: this.transformDisplay(v3Config),
      navigation: this.extractNavigation(v3Config),
      dataSource: this.defineDataSource(v3Config)
    };
    
    // Log any gaps found during transformation
    this.checkForGaps(v3Config, simplified);
    
    return simplified;
  }

  /**
   * Generate ID from entity and type
   */
  generateId(config) {
    const entity = config.entity.toLowerCase();
    const type = config.type.toLowerCase();
    return `${entity}-${type}`;
  }

  /**
   * Map v3 view types to simplified types
   */
  mapViewType(v3Type) {
    const typeMap = {
      'table': 'list',
      'grid': 'list',
      'form': 'form',
      'detail': 'detail',
      'card': 'detail'
    };
    
    return typeMap[v3Type] || 'list';
  }

  /**
   * Transform display configuration
   */
  transformDisplay(v3Config) {
    const display = {
      fields: [],
      actions: v3Config.actions || []
    };
    
    // Transform fields
    if (v3Config.fields) {
      display.fields = v3Config.fields.map(field => {
        const transformed = {
          path: field.name,
          label: field.label || this.generateLabel(field.name)
        };
        
        // Add interactive properties
        if (field.sortable !== undefined) {
          transformed.sortable = field.sortable;
        }
        
        // Check if field is a relationship (has dot notation)
        if (field.name.includes('.')) {
          transformed.clickable = true;
          
          // Log that we're assuming navigation for relationship
          this.gapLogger.log({
            category: 'ASSUMED_NAVIGATION',
            field: field.name,
            assumption: 'Relationship fields are clickable',
            impact: 'LOW'
          });
        }
        
        // Check if field type indicates it should be clickable
        if (field.type === 'relationship' || field.clickable) {
          transformed.clickable = true;
        }
        
        return transformed;
      });
    }
    
    return display;
  }

  /**
   * Extract navigation rules from v3 config and relationships
   */
  extractNavigation(v3Config) {
    const navigation = {
      onRowClick: {},
      onFieldClick: {},
      onActionClick: {}
    };
    
    // Handle row click navigation
    if (v3Config.rowClick) {
      const targetView = this.determineTargetView(v3Config.entity, v3Config.rowClick);
      navigation.onRowClick = {
        target: targetView,
        params: [this.getPrimaryKey(v3Config.entity)]
      };
    }
    
    // Extract field-based navigation from relationships
    if (v3Config.fields) {
      v3Config.fields.forEach(field => {
        if (field.name.includes('.')) {
          const [relationName, fieldName] = field.name.split('.');
          const relationship = this.busm.getRelationship(v3Config.entity, relationName);
          
          if (relationship) {
            navigation.onFieldClick[field.name] = {
              target: `${relationship.targetEntity.toLowerCase()}-detail`,
              params: [`${relationName}.${relationship.targetKey}`]
            };
          } else {
            this.gapLogger.log({
              category: 'MISSING_RELATIONSHIP',
              entity: v3Config.entity,
              field: field.name,
              expected: 'Relationship definition in BUSM',
              assumption: 'No navigation for this field',
              impact: 'MEDIUM',
              suggestedFix: `Define relationship ${relationName} in BUSM`
            });
          }
        }
      });
    }
    
    // Handle action navigation
    if (v3Config.actions) {
      v3Config.actions.forEach(action => {
        navigation.onActionClick[action] = this.generateActionNavigation(
          v3Config.entity,
          action
        );
      });
    }
    
    return navigation;
  }

  /**
   * Define data source configuration
   */
  defineDataSource(v3Config) {
    const dataSource = {
      entity: v3Config.entity,
      includes: [],
      orderBy: null,
      limit: 25
    };
    
    // Extract relationships to include
    if (v3Config.fields) {
      const relationships = new Set();
      v3Config.fields.forEach(field => {
        if (field.name.includes('.')) {
          const [relationName] = field.name.split('.');
          relationships.add(relationName);
        }
      });
      dataSource.includes = Array.from(relationships);
    }
    
    // Handle pagination settings
    if (v3Config.settings) {
      if (v3Config.settings.pageSize) {
        dataSource.limit = v3Config.settings.pageSize;
      }
      if (v3Config.settings.orderBy) {
        dataSource.orderBy = v3Config.settings.orderBy;
      }
    }
    
    // Default sort by first field if not specified
    if (!dataSource.orderBy && v3Config.fields && v3Config.fields.length > 0) {
      dataSource.orderBy = v3Config.fields[0].name;
      
      this.gapLogger.log({
        category: 'MISSING_SORT',
        entity: v3Config.entity,
        expected: 'Sort order specification',
        assumption: `Sorting by first field: ${dataSource.orderBy}`,
        impact: 'LOW',
        suggestedFix: 'Add orderBy to ViewForge settings'
      });
    }
    
    return dataSource;
  }

  /**
   * Helper: Generate label from field name
   */
  generateLabel(fieldName) {
    // Remove relationship prefix if present
    const name = fieldName.includes('.') 
      ? fieldName.split('.').pop() 
      : fieldName;
    
    // Convert camelCase to Title Case
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Helper: Determine target view for navigation
   */
  determineTargetView(entity, action) {
    const entityLower = entity.toLowerCase();
    
    switch(action) {
      case 'view':
      case 'detail':
        return `${entityLower}-detail`;
      case 'edit':
        return `${entityLower}-form`;
      case 'create':
        return `${entityLower}-form`;
      default:
        return `${entityLower}-${action}`;
    }
  }

  /**
   * Helper: Get primary key for entity
   */
  getPrimaryKey(entityName) {
    const entity = this.busm.getEntity(entityName);
    if (entity && entity.primaryKey) {
      return entity.primaryKey;
    }
    
    // Assume standard naming convention
    const assumed = `${entityName.toLowerCase()}Id`;
    
    this.gapLogger.log({
      category: 'MISSING_PRIMARY_KEY',
      entity: entityName,
      expected: 'Primary key definition',
      assumption: `Using ${assumed}`,
      impact: 'HIGH',
      suggestedFix: 'Define primary key in BUSM'
    });
    
    return assumed;
  }

  /**
   * Helper: Generate action navigation
   */
  generateActionNavigation(entity, action) {
    const entityLower = entity.toLowerCase();
    const primaryKey = this.getPrimaryKey(entity);
    
    switch(action) {
      case 'view':
        return {
          target: `${entityLower}-detail`,
          params: [primaryKey]
        };
      case 'edit':
        return {
          target: `${entityLower}-form`,
          mode: 'edit',
          params: [primaryKey]
        };
      case 'create':
        return {
          target: `${entityLower}-form`,
          mode: 'create'
        };
      case 'delete':
        return {
          confirm: true,
          action: `delete${entity}`,
          params: [primaryKey]
        };
      default:
        return {
          action: action,
          params: [primaryKey]
        };
    }
  }

  /**
   * Check for gaps in configuration
   */
  checkForGaps(v3Config, simplified) {
    // Check for missing title
    if (!v3Config.title) {
      this.gapLogger.log({
        category: 'MISSING_TITLE',
        view: simplified.id,
        assumption: `Generated: ${simplified.title}`,
        impact: 'LOW',
        suggestedFix: 'Add title to ViewForge config'
      });
    }
    
    // Check for missing navigation
    if (!v3Config.rowClick && simplified.type === 'list') {
      this.gapLogger.log({
        category: 'MISSING_ROW_NAVIGATION',
        view: simplified.id,
        expected: 'Row click behavior',
        assumption: 'No row click navigation',
        impact: 'MEDIUM',
        suggestedFix: 'Add rowClick to ViewForge config'
      });
    }
    
    // Check for missing actions
    if (!v3Config.actions || v3Config.actions.length === 0) {
      this.gapLogger.log({
        category: 'MISSING_ACTIONS',
        view: simplified.id,
        expected: 'User actions (view, edit, delete)',
        assumption: 'No actions available',
        impact: 'MEDIUM',
        suggestedFix: 'Add actions array to ViewForge config'
      });
    }
  }
}

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViewForgeTransformer;
}