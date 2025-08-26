/**
 * Field Configuration System
 * Maps BUSM fields to card template slots
 */

class FieldConfiguration {
  constructor() {
    // Load BUSM for field validation
    this.busm = null;
    this.patterns = {
      compact: {
        maxFields: 5,
        slots: ['title', 'badge', 'metadata']
      },
      list: {
        maxFields: 4,
        slots: ['avatar', 'primary', 'secondary', 'action']
      },
      data: {
        maxFields: 8,
        slots: ['title', 'badge', 'fields']
      },
      metric: {
        maxFields: 6,
        slots: ['label', 'value', 'badge', 'metrics']
      }
    };
  }

  /**
   * Configure fields for Account cards
   */
  getAccountCardConfig(pattern = 'compact') {
    const configs = {
      compact: {
        pattern: 'compact',
        fields: {
          title: 'AccountName',
          badge: 'AccountStatus',
          metadata: [
            'AccountType',
            'BillingCity',
            { field: 'ServiceLocations', format: '{{count}} locations' }
          ]
        }
      },
      list: {
        pattern: 'list',
        fields: {
          avatar: { field: 'AccountName', format: 'initials' },
          primary: 'AccountName',
          secondary: { 
            fields: ['PrimaryContact.FullName', 'PrimaryContact.PreferredContact'],
            format: '{{0}} • {{1}}'
          },
          action: { field: 'AccountStatus', format: 'badge' }
        }
      },
      data: {
        pattern: 'data',
        fields: {
          title: 'AccountName',
          badge: 'AccountStatus',
          fields: [
            { label: 'Type', value: 'AccountType' },
            { label: 'Primary Contact', value: 'PrimaryContact.FullName' },
            { label: 'Phone', value: 'PrimaryContact.Phone', format: 'phone' },
            { label: 'Email', value: 'PrimaryContact.Email', format: 'email' },
            { label: 'Address', value: 'BillingAddress', format: 'address' },
            { label: 'Locations', value: 'ServiceLocations', format: 'count' }
          ]
        }
      }
    };
    
    return configs[pattern] || configs.compact;
  }

  /**
   * Configure fields for Service Location cards
   */
  getLocationCardConfig(pattern = 'list') {
    const configs = {
      compact: {
        pattern: 'compact',
        fields: {
          title: 'LocationName',
          badge: 'LocationStatus',
          metadata: [
            'LocationType',
            'ServiceAddress.City',
            { field: 'WorkOrders', format: '{{count}} work orders' }
          ]
        }
      },
      list: {
        pattern: 'list',
        fields: {
          avatar: { field: 'LocationType', format: 'icon' },
          primary: 'LocationName',
          secondary: 'ServiceAddress',
          action: { field: 'LocationStatus', format: 'badge' }
        }
      },
      metric: {
        pattern: 'metric',
        fields: {
          label: 'Location',
          value: 'LocationName',
          badge: 'LocationStatus',
          metrics: [
            { label: 'Open WOs', value: 'OpenWorkOrders' },
            { label: 'This Month', value: 'MonthlyWorkOrders' },
            { label: 'Equipment', value: 'EquipmentCount' }
          ]
        }
      }
    };
    
    return configs[pattern] || configs.list;
  }

  /**
   * Configure fields for Work Order cards
   */
  getWorkOrderCardConfig(pattern = 'data') {
    const configs = {
      compact: {
        pattern: 'compact',
        fields: {
          title: { fields: ['WorkOrderNumber', 'Title'], format: '#{{0}} - {{1}}' },
          badge: 'Status',
          metadata: [
            'Priority',
            'DueDate',
            'AssignedTo'
          ]
        }
      },
      list: {
        pattern: 'list',
        fields: {
          avatar: { field: 'Priority', format: 'priority-icon' },
          primary: { fields: ['WorkOrderNumber', 'Title'], format: '#{{0}} - {{1}}' },
          secondary: { fields: ['DueDate', 'AssignedTo'], format: 'Due {{0}} • {{1}}' },
          action: { field: 'Status', format: 'badge' }
        }
      },
      data: {
        pattern: 'data',
        fields: {
          title: { fields: ['WorkOrderNumber', 'Title'], format: '#{{0}} - {{1}}' },
          badge: 'Status',
          fields: [
            { label: 'Priority', value: 'Priority' },
            { label: 'Type', value: 'WorkOrderType' },
            { label: 'Due Date', value: 'DueDate', format: 'date' },
            { label: 'Assigned To', value: 'AssignedTo' },
            { label: 'Location', value: 'ServiceLocation.LocationName' },
            { label: 'Estimated Hours', value: 'EstimatedHours' },
            { label: 'Created', value: 'CreatedDate', format: 'date' },
            { label: 'Customer', value: 'Account.AccountName' }
          ]
        }
      }
    };
    
    return configs[pattern] || configs.data;
  }

  /**
   * Apply configuration to generate HTML from template
   */
  applyConfiguration(templateHtml, config, data) {
    let html = templateHtml;
    
    // Replace field placeholders with actual data
    for (const [slot, fieldConfig] of Object.entries(config.fields)) {
      const value = this.resolveFieldValue(fieldConfig, data);
      html = html.replace(new RegExp(`{{${slot}}}`, 'g'), value);
      
      // Handle arrays (like metadata)
      if (Array.isArray(fieldConfig)) {
        const values = fieldConfig.map(f => this.resolveFieldValue(f, data));
        const metadataHtml = values.map(v => `<span>${v}</span>`).join('');
        html = html.replace(new RegExp(`{{#each ${slot}}}[\\s\\S]*?{{/each}}`, 'g'), metadataHtml);
      }
    }
    
    // Apply CSS classes based on data
    if (data.AccountStatus === 'Active') {
      html = html.replace('{{badge-class}}', 'active');
    } else if (data.AccountStatus === 'Pending') {
      html = html.replace('{{badge-class}}', 'pending');
    }
    
    return html;
  }

  /**
   * Resolve field value from data using dot notation
   */
  resolveFieldValue(fieldConfig, data) {
    if (typeof fieldConfig === 'string') {
      return this.getNestedValue(data, fieldConfig);
    }
    
    if (fieldConfig.field) {
      const value = this.getNestedValue(data, fieldConfig.field);
      return this.formatValue(value, fieldConfig.format, data);
    }
    
    if (fieldConfig.fields) {
      const values = fieldConfig.fields.map(f => this.getNestedValue(data, f));
      return this.formatTemplate(fieldConfig.format, values);
    }
    
    return '';
  }

  /**
   * Get nested value using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }

  /**
   * Format value based on type
   */
  formatValue(value, format, data) {
    if (!format) return value;
    
    switch (format) {
      case 'initials':
        return value.split(' ').map(w => w[0]).join('').toUpperCase();
      case 'count':
        return Array.isArray(value) ? value.length : '0';
      case 'phone':
        return value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'badge':
        return `<span class="badge ${value.toLowerCase()}">${value}</span>`;
      case 'icon':
        const icons = {
          'Residential': '🏠',
          'Commercial': '🏢',
          'Industrial': '🏭'
        };
        return icons[value] || '📍';
      case 'priority-icon':
        const priorities = {
          'High': '🔴',
          'Medium': '🟡',
          'Low': '🟢'
        };
        return priorities[value] || '⚪';
      case 'address':
        return `${data.BillingAddress}, ${data.BillingCity}, ${data.BillingState} ${data.BillingZip}`;
      default:
        if (format.includes('{{')) {
          return format.replace('{{count}}', Array.isArray(value) ? value.length : '0')
                      .replace('{{0}}', value);
        }
        return value;
    }
  }

  /**
   * Format template with multiple values
   */
  formatTemplate(template, values) {
    return template.replace(/{{(\d+)}}/g, (match, index) => values[index] || '');
  }

  /**
   * Determine best pattern based on viewport and data density
   */
  recommendPattern(entityType, viewportWidth, itemCount) {
    const recommendations = {
      account: {
        desktop: itemCount > 10 ? 'compact' : 'list',
        tablet: 'list',
        mobile: 'compact'
      },
      location: {
        desktop: itemCount > 8 ? 'list' : 'metric',
        tablet: 'compact',
        mobile: 'compact'
      },
      workOrder: {
        desktop: itemCount > 5 ? 'list' : 'data',
        tablet: 'compact',
        mobile: 'compact'
      }
    };
    
    const viewport = viewportWidth > 1024 ? 'desktop' : 
                     viewportWidth > 768 ? 'tablet' : 'mobile';
    
    return recommendations[entityType]?.[viewport] || 'compact';
  }
}

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FieldConfiguration;
}