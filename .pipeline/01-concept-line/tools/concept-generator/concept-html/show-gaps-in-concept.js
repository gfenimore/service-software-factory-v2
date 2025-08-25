/**
 * Extension to show "Needs Definition" in Concept wireframes
 * Makes gaps visible to stakeholders for feedback
 */

class ConceptWithGaps {
  
  /**
   * Generate HTML markers for undefined rules
   */
  static generateNeedsDefinitionMarker(text = "Needs Definition") {
    return `<span class="needs-definition" title="Business rule needs stakeholder input">❓ ${text}</span>`;
  }
  
  /**
   * Show gaps in field display
   */
  static showFieldGaps(field, rules) {
    let html = '';
    
    // Check if validation pattern is needed
    if (rules?.validation?.patterns?.[field] === 'NEEDS_DEFINITION') {
      html += this.generateNeedsDefinitionMarker('Format?');
    }
    
    // Check if field requirement is uncertain
    if (field.includes('NEEDS DEFINITION')) {
      html += this.generateNeedsDefinitionMarker();
    }
    
    return html;
  }
  
  /**
   * Show gaps in state transitions
   */
  static showStateGaps(state, transitions) {
    let html = '';
    
    transitions.forEach(nextState => {
      if (nextState.includes('NEEDS_DEFINITION')) {
        html += `<span class="state-gap">❓ ${nextState.replace('NEEDS_DEFINITION:', '')}</span>`;
      } else {
        html += `<span class="state-transition">${nextState}</span>`;
      }
    });
    
    return html;
  }
  
  /**
   * Generate a gaps summary section
   */
  static generateGapsSummary(gaps) {
    if (!gaps || gaps.length === 0) return '';
    
    return `
    <div class="gaps-summary">
      <h3>📋 Business Rules Needing Definition</h3>
      <div class="gaps-list">
        ${gaps.map(gap => `
          <div class="gap-item">
            <span class="gap-category">${gap.category}</span>
            <span class="gap-question">${gap.question}</span>
            <button onclick="markForDiscussion('${gap.id}')" class="btn-discuss">
              Flag for Discussion
            </button>
          </div>
        `).join('')}
      </div>
    </div>`;
  }
  
  /**
   * CSS styles for gaps display
   */
  static getGapStyles() {
    return `
    .needs-definition {
      display: inline-block;
      background: #fff3cd;
      color: #856404;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-left: 8px;
      cursor: help;
      border: 1px dashed #ffc107;
    }
    
    .state-gap {
      display: inline-block;
      background: #ffe5e5;
      color: #d32f2f;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin: 0 4px;
      border: 1px dashed #f44336;
    }
    
    .gaps-summary {
      background: #f8f9fa;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .gaps-summary h3 {
      color: #856404;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .gap-item {
      display: flex;
      align-items: center;
      padding: 8px;
      margin: 5px 0;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #ffc107;
    }
    
    .gap-category {
      font-weight: bold;
      color: #495057;
      margin-right: 10px;
      min-width: 120px;
    }
    
    .gap-question {
      flex: 1;
      color: #6c757d;
    }
    
    .btn-discuss {
      padding: 4px 12px;
      background: #ffc107;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      color: #212529;
    }
    
    .btn-discuss:hover {
      background: #ffb300;
    }
    
    /* Visual indicator for undefined requirements */
    .undefined-requirement {
      border: 2px dashed #ffc107 !important;
      background: #fffbf0 !important;
      position: relative;
    }
    
    .undefined-requirement::after {
      content: "Needs business rule";
      position: absolute;
      top: -10px;
      right: 10px;
      background: #ffc107;
      color: #212529;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }
    `;
  }
}

/**
 * Example usage in wireframe
 */
function generateExampleWithGaps() {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Account Form - With Business Gaps</title>
    <style>
      ${ConceptWithGaps.getGapStyles()}
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Account Setup</h1>
      
      <!-- Show gaps summary at top -->
      ${ConceptWithGaps.generateGapsSummary([
        { id: 1, category: 'Validation', question: 'What phone number format should we accept?' },
        { id: 2, category: 'State Rule', question: 'Can suspended accounts be reactivated automatically?' },
        { id: 3, category: 'Required Field', question: 'Is service address always required?' }
      ])}
      
      <!-- Form with gap indicators -->
      <form>
        <div class="form-group">
          <label>
            Account Name 
            <span class="required">*</span>
          </label>
          <input type="text" placeholder="Required, must be unique">
        </div>
        
        <div class="form-group">
          <label>
            Phone Number
            ${ConceptWithGaps.generateNeedsDefinitionMarker('Format?')}
          </label>
          <input type="text" placeholder="Format needs definition" class="undefined-requirement">
        </div>
        
        <div class="form-group">
          <label>
            Service Address
            ${ConceptWithGaps.generateNeedsDefinitionMarker('Required?')}
          </label>
          <input type="text" placeholder="Requirement needs definition">
        </div>
        
        <div class="form-group">
          <label>Account Type <span class="required">*</span></label>
          <select>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Industrial ${ConceptWithGaps.generateNeedsDefinitionMarker('Special rules?')}</option>
          </select>
        </div>
      </form>
      
      <!-- State transitions with gaps -->
      <div class="state-section">
        <h3>Status Workflow</h3>
        <div>
          Prospect → Active, Declined
        </div>
        <div>
          Active → Suspended, ${ConceptWithGaps.generateNeedsDefinitionMarker('Renewal?')}
        </div>
        <div>
          Suspended → Active, ${ConceptWithGaps.generateNeedsDefinitionMarker('Auto-reactivate?')}
        </div>
      </div>
    </div>
    
    <script>
      function markForDiscussion(gapId) {
        alert('Gap #' + gapId + ' marked for stakeholder discussion');
        // In real app, this would save to a tracking system
      }
    </script>
  </body>
  </html>`;
  
  return html;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConceptWithGaps, generateExampleWithGaps };
}