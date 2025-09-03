#!/usr/bin/env node

/**
 * ViewForge Bridge - Stage 1 to ViewForge Configuration Translator
 * Transforms base system configurations into ViewForge-compatible format
 * Called by Prototype Line Orchestrator to enable ViewForge integration
 */

const fs = require('fs').promises;
const path = require('path');

class ViewForgeBridge {
  constructor() {
    this.universalEntities = [
      'ACCOUNT', 'SERVICE_LOCATION', 'WORK_ORDER', 'SERVICE_ITEM', 
      'INVOICE', 'PAYMENT', 'CONTACT', 'ORGANIZATION',
      'EQUIPMENT', 'INVENTORY', 'SCHEDULE', 'TERRITORY',
      'CUSTOMER', 'TECHNICIAN', 'VEHICLE', 'ROUTE', 'CONTRACT'
    ];
    
    this.domainMappings = {
      pestControl: {
        displayName: "Pest Control Management",
        integrationTypes: {
          "SERVICE_LOCATION": ["address-validation", "geographic-display"],
          "WORK_ORDER": ["chemical-registry-lookup", "safety-validation"],
          "ACCOUNT": ["customer-communication", "service-history"]
        }
      },
      hvac: {
        displayName: "HVAC Service Management", 
        integrationTypes: {
          "EQUIPMENT": ["equipment-diagnostics", "parts-lookup"],
          "SERVICE_LOCATION": ["address-validation", "climate-data"],
          "WORK_ORDER": ["parts-ordering", "service-documentation"]
        }
      }
    };
  }

  /**
   * Main transformation method - Stage 1 base system to ViewForge format
   * @param {Object} baseSystemConfig - Stage 1 configuration
   * @returns {Object} ViewForge-compatible configuration
   */
  async transformToViewForge(baseSystemConfig) {
    const startTime = Date.now();
    
    try {
      console.log('🌉 Starting ViewForge Bridge transformation...');
      
      // Validate Stage 1 input
      this._validateBaseSystemConfig(baseSystemConfig);
      
      // Generate ViewForge hierarchy
      const hierarchy = this.generateViewForgeHierarchy(baseSystemConfig);
      
      // Apply domain customizations
      const enhancedConfig = this.applyDomainCustomizations(hierarchy, baseSystemConfig.domainCustomizations);
      
      // Generate integration declarations
      const withIntegrations = this._generateIntegrationDeclarations(enhancedConfig, baseSystemConfig);
      
      // Final validation
      const validationResult = this.validateViewForgeConfiguration(withIntegrations);
      
      const result = {
        status: 'SUCCESS',
        viewForgeConfig: withIntegrations,
        validation: validationResult,
        processingTimeMs: Date.now() - startTime,
        metadata: {
          sourceConfig: 'Stage1BaseSystem',
          targetFormat: 'ViewForge',
          transformedAt: new Date().toISOString(),
          entitiesMapped: this.universalEntities.length,
          domainApplied: baseSystemConfig.domainCustomizations.serviceDomain
        }
      };
      
      console.log(`✅ ViewForge Bridge transformation completed in ${result.processingTimeMs}ms`);
      return result;
      
    } catch (error) {
      console.error('❌ ViewForge Bridge transformation failed:', error.message);
      
      return {
        status: 'FAILED',
        error: {
          message: error.message,
          type: error.constructor.name,
          timestamp: new Date().toISOString()
        },
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Generate ViewForge hierarchy structure from base system
   * @param {Object} baseSystemConfig - Stage 1 configuration
   * @returns {Object} ViewForge hierarchy
   */
  generateViewForgeHierarchy(baseSystemConfig) {
    const domain = baseSystemConfig.domainCustomizations.serviceDomain;
    const domainInfo = this.domainMappings[domain];
    
    if (!domainInfo) {
      throw new Error(`Unknown service domain: ${domain}`);
    }

    return {
      application: {
        name: domainInfo.displayName,
        description: `Universal service management system for ${domain} operations`,
        domain: domain
      },
      
      hierarchy: {
        modules: [
          {
            id: 'customer-management',
            name: 'Customer Management',
            subModules: [
              {
                id: 'account-management',
                name: 'Account Management',
                userStories: this._generateAccountUserStories(baseSystemConfig)
              },
              {
                id: 'contact-management', 
                name: 'Contact Management',
                userStories: this._generateContactUserStories(baseSystemConfig)
              }
            ]
          },
          {
            id: 'service-management',
            name: 'Service Management',
            subModules: [
              {
                id: 'work-order-management',
                name: 'Work Order Management', 
                userStories: this._generateWorkOrderUserStories(baseSystemConfig)
              },
              {
                id: 'service-location-management',
                name: 'Service Location Management',
                userStories: this._generateServiceLocationUserStories(baseSystemConfig)
              }
            ]
          },
          {
            id: 'business-management',
            name: 'Business Management',
            subModules: [
              {
                id: 'invoice-management',
                name: 'Invoice Management',
                userStories: this._generateInvoiceUserStories(baseSystemConfig)
              },
              {
                id: 'payment-management',
                name: 'Payment Management', 
                userStories: this._generatePaymentUserStories(baseSystemConfig)
              }
            ]
          }
        ]
      }
    };
  }

  /**
   * Apply domain customizations to ViewForge configuration
   * @param {Object} viewForgeConfig - Base ViewForge configuration
   * @param {Object} domainCustomizations - Domain-specific customizations
   * @returns {Object} Enhanced ViewForge configuration
   */
  applyDomainCustomizations(viewForgeConfig, domainCustomizations) {
    const enhanced = JSON.parse(JSON.stringify(viewForgeConfig)); // Deep clone
    
    console.log(`  🎨 Applying ${domainCustomizations.serviceDomain} domain customizations...`);
    
    // Apply additional fields to user stories
    if (domainCustomizations.additionalFields) {
      this._applyAdditionalFields(enhanced, domainCustomizations.additionalFields);
    }
    
    // Apply business rules
    if (domainCustomizations.businessRules) {
      this._applyBusinessRules(enhanced, domainCustomizations.businessRules);
    }
    
    // Apply integration requirements
    if (domainCustomizations.integrations) {
      this._applyIntegrationRequirements(enhanced, domainCustomizations.integrations);
    }
    
    console.log(`  ✓ Applied customizations for ${Object.keys(domainCustomizations.additionalFields || {}).length} entities`);
    
    return enhanced;
  }

  /**
   * Validate ViewForge configuration format
   * @param {Object} viewForgeConfig - Configuration to validate
   * @returns {Object} Validation results
   */
  validateViewForgeConfiguration(viewForgeConfig) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      summary: ''
    };

    // Check required structure
    if (!viewForgeConfig.application) {
      validation.valid = false;
      validation.errors.push('Missing required application section');
    }
    
    if (!viewForgeConfig.hierarchy || !viewForgeConfig.hierarchy.modules) {
      validation.valid = false;
      validation.errors.push('Missing required hierarchy.modules section');
    }

    // Check module structure
    if (viewForgeConfig.hierarchy && viewForgeConfig.hierarchy.modules) {
      viewForgeConfig.hierarchy.modules.forEach((module, moduleIndex) => {
        if (!module.id || !module.name) {
          validation.errors.push(`Module ${moduleIndex}: Missing id or name`);
          validation.valid = false;
        }
        
        if (!module.subModules || module.subModules.length === 0) {
          validation.warnings.push(`Module ${module.name}: No subModules defined`);
        }
      });
    }

    validation.summary = validation.valid 
      ? `Configuration valid: ${validation.warnings.length} warnings`
      : `Configuration invalid: ${validation.errors.length} errors, ${validation.warnings.length} warnings`;
    
    console.log(`  🔍 Validation: ${validation.summary}`);
    
    return validation;
  }

  // Private helper methods

  _validateBaseSystemConfig(config) {
    if (!config) {
      throw new Error('Base system configuration is required');
    }
    
    if (!config.baseSystem) {
      throw new Error('Missing baseSystem section in configuration');
    }
    
    if (!config.domainCustomizations) {
      throw new Error('Missing domainCustomizations section in configuration');
    }
    
    if (!config.domainCustomizations.serviceDomain) {
      throw new Error('Missing serviceDomain in domainCustomizations');
    }
  }

  _generateAccountUserStories(baseSystemConfig) {
    const customFields = baseSystemConfig.domainCustomizations.additionalFields?.ACCOUNT || [];
    
    return [
      {
        id: 'account-detail-view',
        name: 'Account Details View',
        entity: 'ACCOUNT',
        viewType: 'detail',
        fields: [
          { name: 'name', label: 'Account Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
          ...customFields.map(field => ({
            name: field,
            label: this._formatFieldLabel(field),
            type: this._inferFieldType(field),
            required: false,
            custom: true
          }))
        ]
      },
      {
        id: 'account-list-view', 
        name: 'Account List View',
        entity: 'ACCOUNT',
        viewType: 'table',
        fields: [
          { name: 'name', label: 'Account Name', type: 'text', sortable: true },
          { name: 'email', label: 'Email', type: 'email', sortable: true },
          { name: 'phone', label: 'Phone', type: 'tel', sortable: false },
          ...customFields.slice(0, 2).map(field => ({ // Limit custom fields in list view
            name: field,
            label: this._formatFieldLabel(field),
            type: this._inferFieldType(field),
            sortable: true,
            custom: true
          }))
        ]
      }
    ];
  }

  _generateContactUserStories(baseSystemConfig) {
    return [
      {
        id: 'contact-detail-view',
        name: 'Contact Details View', 
        entity: 'CONTACT',
        viewType: 'detail',
        fields: [
          { name: 'name', label: 'Contact Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: false },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
          { name: 'role', label: 'Role', type: 'text', required: false }
        ]
      }
    ];
  }

  _generateWorkOrderUserStories(baseSystemConfig) {
    const customFields = baseSystemConfig.domainCustomizations.additionalFields?.WORK_ORDER || [];
    
    return [
      {
        id: 'work-order-form',
        name: 'Work Order Form',
        entity: 'WORK_ORDER', 
        viewType: 'form',
        fields: [
          { name: 'title', label: 'Work Order Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: true },
          { name: 'status', label: 'Status', type: 'select', required: true, 
            options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'] },
          ...customFields.map(field => ({
            name: field,
            label: this._formatFieldLabel(field),
            type: this._inferFieldType(field),
            required: field.includes('safety') || field.includes('required'), // Business logic
            custom: true
          }))
        ]
      }
    ];
  }

  _generateServiceLocationUserStories(baseSystemConfig) {
    const customFields = baseSystemConfig.domainCustomizations.additionalFields?.SERVICE_LOCATION || [];
    
    return [
      {
        id: 'service-location-detail',
        name: 'Service Location Details',
        entity: 'SERVICE_LOCATION',
        viewType: 'detail', 
        fields: [
          { name: 'address', label: 'Service Address', type: 'text', required: true },
          { name: 'city', label: 'City', type: 'text', required: true },
          { name: 'state', label: 'State', type: 'text', required: true },
          { name: 'zipCode', label: 'ZIP Code', type: 'text', required: true },
          ...customFields.map(field => ({
            name: field,
            label: this._formatFieldLabel(field),
            type: this._inferFieldType(field),
            required: false,
            custom: true
          }))
        ]
      }
    ];
  }

  _generateInvoiceUserStories(baseSystemConfig) {
    return [
      {
        id: 'invoice-detail-view',
        name: 'Invoice Details View',
        entity: 'INVOICE',
        viewType: 'detail',
        fields: [
          { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true },
          { name: 'amount', label: 'Amount', type: 'currency', required: true },
          { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
          { name: 'status', label: 'Status', type: 'select', required: true,
            options: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'] }
        ]
      }
    ];
  }

  _generatePaymentUserStories(baseSystemConfig) {
    return [
      {
        id: 'payment-form',
        name: 'Payment Form',
        entity: 'PAYMENT',
        viewType: 'form',
        fields: [
          { name: 'amount', label: 'Payment Amount', type: 'currency', required: true },
          { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
          { name: 'paymentMethod', label: 'Payment Method', type: 'select', required: true,
            options: ['Cash', 'Check', 'Credit Card', 'ACH', 'Wire Transfer'] },
          { name: 'reference', label: 'Reference Number', type: 'text', required: false }
        ]
      }
    ];
  }

  _applyAdditionalFields(config, additionalFields) {
    // Find user stories that match entities with additional fields
    config.hierarchy.modules.forEach(module => {
      module.subModules.forEach(subModule => {
        subModule.userStories.forEach(userStory => {
          if (additionalFields[userStory.entity]) {
            const customFields = additionalFields[userStory.entity];
            customFields.forEach(fieldName => {
              // Only add if not already present
              const existing = userStory.fields.find(f => f.name === fieldName);
              if (!existing) {
                userStory.fields.push({
                  name: fieldName,
                  label: this._formatFieldLabel(fieldName),
                  type: this._inferFieldType(fieldName),
                  required: false,
                  custom: true
                });
              }
            });
          }
        });
      });
    });
  }

  _applyBusinessRules(config, businessRules) {
    // Apply business rules as field validation or integration requirements
    businessRules.forEach(rule => {
      config.hierarchy.modules.forEach(module => {
        module.subModules.forEach(subModule => {
          subModule.userStories.forEach(userStory => {
            if (userStory.entity === rule.entity) {
              userStory.businessRules = userStory.businessRules || [];
              userStory.businessRules.push({
                id: rule.id,
                name: rule.name,
                conditions: rule.conditions,
                actions: rule.actions
              });
            }
          });
        });
      });
    });
  }

  _applyIntegrationRequirements(config, integrations) {
    // Apply integration declarations to matching fields
    integrations.forEach(integration => {
      config.hierarchy.modules.forEach(module => {
        module.subModules.forEach(subModule => {
          subModule.userStories.forEach(userStory => {
            if (userStory.entity === integration.entity) {
              userStory.fields.forEach(field => {
                if (field.name === integration.field) {
                  field.integration = {
                    type: integration.type,
                    required: integration.required
                  };
                }
              });
            }
          });
        });
      });
    });
  }

  _generateIntegrationDeclarations(config, baseSystemConfig) {
    const domain = baseSystemConfig.domainCustomizations.serviceDomain;
    const domainInfo = this.domainMappings[domain];
    
    if (!domainInfo) return config;

    // Add integrations section to configuration
    config.integrations = [];
    
    // Generate integrations based on domain mapping
    Object.keys(domainInfo.integrationTypes).forEach(entity => {
      const integrationTypes = domainInfo.integrationTypes[entity];
      integrationTypes.forEach(integrationType => {
        config.integrations.push({
          type: integrationType,
          entity: entity,
          required: integrationType.includes('validation') || integrationType.includes('safety')
        });
      });
    });

    console.log(`  🔗 Generated ${config.integrations.length} integration declarations`);
    
    return config;
  }

  _formatFieldLabel(fieldName) {
    // Convert camelCase/snake_case to display labels
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  _inferFieldType(fieldName) {
    const name = fieldName.toLowerCase();
    
    if (name.includes('email')) return 'email';
    if (name.includes('phone')) return 'tel';
    if (name.includes('date')) return 'date';
    if (name.includes('amount') || name.includes('price') || name.includes('cost')) return 'currency';
    if (name.includes('notes') || name.includes('description') || name.includes('comment')) return 'textarea';
    if (name.includes('status') || name.includes('type') || name.includes('category')) return 'select';
    if (name.includes('frequency')) return 'select';
    
    return 'text'; // default
  }

  /**
   * Get component status for monitoring
   * @returns {Object} Current component status
   */
  getStatus() {
    return {
      component: 'ViewForge Bridge',
      version: '1.0.0',
      status: 'ready',
      capabilities: [
        'Stage 1 to ViewForge transformation',
        'Domain customization application',
        'ViewForge hierarchy generation',
        'Integration declaration mapping'
      ],
      supportedDomains: Object.keys(this.domainMappings)
    };
  }
}

// CLI Support
if (require.main === module) {
  const bridge = new ViewForgeBridge();
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
ViewForge Bridge - Stage 1 to ViewForge Configuration Translator

Usage:
  node viewforge-bridge.js [options]

Options:
  --input <path>          Path to Stage 1 configuration file
  --output <path>         Path to output ViewForge configuration
  --domain <domain>       Service domain (pestControl, hvac)
  --help, -h              Show this help message

Example:
  node viewforge-bridge.js --input ./stage1-config.json --output ./viewforge-config.json --domain pestControl
`);
    process.exit(0);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf('--input');
  const outputIndex = args.indexOf('--output');
  
  if (inputIndex === -1) {
    console.error('❌ Missing required --input parameter');
    process.exit(1);
  }

  const inputPath = args[inputIndex + 1];
  const outputPath = args[outputIndex + 1] || './viewforge-config.json';

  // Run transformation
  (async () => {
    try {
      console.log(`🌉 ViewForge Bridge v${bridge.getStatus().version}`);
      console.log(`📥 Input: ${inputPath}`);
      console.log(`📤 Output: ${outputPath}`);
      
      // Read Stage 1 configuration
      const configData = await fs.readFile(inputPath, 'utf8');
      const baseSystemConfig = JSON.parse(configData);
      
      // Transform to ViewForge format
      const result = await bridge.transformToViewForge(baseSystemConfig);
      
      if (result.status === 'SUCCESS') {
        // Write ViewForge configuration
        await fs.writeFile(outputPath, JSON.stringify(result.viewForgeConfig, null, 2), 'utf8');
        
        console.log('\n✅ Transformation completed successfully');
        console.log(`📊 Entities mapped: ${result.metadata.entitiesMapped}`);
        console.log(`🎨 Domain applied: ${result.metadata.domainApplied}`);
        console.log(`⏱️ Processing time: ${result.processingTimeMs}ms`);
        console.log(`📁 ViewForge config saved to: ${outputPath}`);
        
        process.exit(0);
      } else {
        console.error('\n❌ Transformation failed');
        console.error(`Error: ${result.error.message}`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('\n💥 Bridge execution failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = ViewForgeBridge;