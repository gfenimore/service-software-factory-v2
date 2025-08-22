plField Configurator with Relations - Requirements Document

## 1. System Overview

### 1.1 Purpose
A visual field configuration system that allows users to design display layouts for entity views by selecting and arranging fields from the primary entity and its related entities through drag-and-drop or double-click interactions.

### 1.2 Target Users
- System administrators
- Power users configuring UI layouts
- Business analysts defining data display requirements

### 1.3 Core Value Proposition
- **Visual Configuration**: No-code approach to defining entity display layouts
- **Relationship Support**: Include fields from related entities with single-level joins
- **Live Preview**: Real-time visualization of configured layouts
- **Context Awareness**: Different configurations for different display contexts

---

## 2. Functional Requirements

### 2.1 Entity and Relationship Management

#### 2.1.1 Primary Entity Support
- **Requirement**: System must support configuration for primary entities (Account, Service Location, Work Order)
- **Data Model**: Each entity has direct fields accessible via `entity.fieldName` pattern

#### 2.1.2 Related Entity Support  
- **Requirement**: System must support single-level relationships (1:1 only for current scope)
- **Supported Relationships**:
  - Account → Primary Contact (1:1)
  - Account → Billing Address (1:1) 
  - Account → Service Contract (1:1)
- **Field Access Pattern**: `relatedEntity.fieldName` (e.g., `primaryContact.email`)
- **Join Limitation**: Maximum one SQL join per configuration to maintain performance

#### 2.1.3 Field Type Support
- **Requirement**: System must support any field type without formatting restrictions
- **Examples**: text, currency, email, phone, status, date, number
- **Display**: Field type shown as badge for reference only

### 2.2 User Interface Components

#### 2.2.1 Three-Panel Layout
- **Left Panel**: Field selector with entity relationship tabs
- **Center Panel**: Configuration builder with drag-drop zones  
- **Right Panel**: Live preview of configured layout

#### 2.2.2 Entity Relationship Tabs (Left Panel)
- **Requirement**: Tabbed interface showing available entities
- **Tab Content**: 
  - Primary entity tab (always first, active by default)
  - Related entity tabs with relationship indicators
  - Field count badges on each tab
- **Field Organization**: Fields grouped by logical categories (Core Information, Financial, etc.)

#### 2.2.3 Configuration Builder (Center Panel)
- **Requirement**: Row-based layout configuration with predefined structure
- **Layout Structure**:
  - **Header Section**: Single row only, labeled "Header" (not editable)
  - **Body Section**: Maximum 3 rows, labeled "Row 1", "Row 2", "Row 3"
- **Row Components**: 
  - Fixed row labels (not user-editable)
  - Drop zone for fields
  - Visual feedback for drag operations
- **Field Display**: Shows field name with source entity indicator ([A], [PC], [BA], [SC])
- **Layout Constraints**: Total maximum of 4 configured rows (1 header + 3 body)

#### 2.2.4 Live Preview (Right Panel)
- **Requirement**: Real-time preview of configured layout with sample data
- **Preview Structure**:
  - **Card Header**: Displays fields from Header configuration row
  - **Card Body**: Displays fields from Body rows (Row 1, Row 2, Row 3) as separate sections
  - **Section Mapping**: Each configured row becomes a distinct visual section in preview
- **Preview Elements**:
  - Header section (styled differently from body sections)
  - Body sections matching configuration rows
  - Data source legend
  - Performance indicator (join count)
- **Layout Constraints**: Preview reflects the 1 header + 3 body row limitation

### 2.3 Drag and Drop Functionality

#### 2.3.1 Field Selection Methods
- **Method 1**: Drag field from left panel to center panel row
- **Method 2**: Double-click field to add to next available position
- **Requirement**: Both methods must provide immediate visual feedback

#### 2.3.2 Field Manipulation
- **Add Fields**: Drag from left panel or double-click to add to configuration
- **Remove Fields**: Drag from configuration back to left panel or double-click to remove
- **Reorder Fields**: Drag fields within rows to change order
- **Move Between Rows**: Drag fields between different configuration rows

#### 2.3.3 Visual Feedback
- **Drag States**: Visual indicators for drag start, drag over valid targets, drop zones
- **Field States**: Different visual states for available, configured, and dragging fields
- **Drop Validation**: Clear indication of valid/invalid drop targets

### 2.4 Context Management

#### 2.4.1 Configuration Contexts
- **Supported Contexts**: List View Card, Detail Header, Compact Card, Mobile Card
- **Extensibility**: Support for adding new contexts
- **Context Switching**: Ability to switch between contexts and maintain separate configurations

#### 2.4.2 Entity Selection
- **Requirement**: Dropdown to select primary entity being configured
- **Supported Entities**: Account, Service Location, Work Order (extensible)

### 2.5 Configuration Actions

#### 2.5.1 Save Configuration
- **Requirement**: Persist current field configuration
- **Scope**: Save per entity + context combination

#### 2.5.2 Export Configuration  
- **Requirement**: Export configuration as JSON
- **Format**: Structured data including field paths, display order, and metadata

#### 2.5.3 Reset Configuration
- **Requirement**: Clear current configuration and return to empty state
- **Confirmation**: Require user confirmation before reset

---

## 3. Technical Requirements

### 3.1 Data Model Structure

#### 3.1.1 Field Definition Schema
```javascript
{
  fieldName: string,           // Display name
  fieldPath: string,           // Data access path (e.g., "account.accountName")
  fieldType: string,           // Data type for reference
  sourceEntity: string,        // Source entity identifier
  relationshipType?: string    // "direct" | "1:1" | "1:many"
}
```

#### 3.1.2 Configuration Schema
```javascript
{
  entityType: string,          // Primary entity being configured
  contextType: string,         // Display context
  header: {
    rowId: "header",
    rowLabel: "Header",        // Fixed label
    fields: [                  // Array of field objects
      {
        path: string,          // Data access path (e.g., "account.accountName")
        source: string,        // Source entity (e.g., "account", "primaryContact")
        type: string,          // Field type for rendering
        label: string          // Display label
      }
    ]
  },
  body: [                      // Always contains exactly 3 rows
    {
      rowId: "row1",
      rowLabel: "Row 1",       // Fixed label
      fields: [...]            // Same field object structure as header
    },
    {
      rowId: "row2", 
      rowLabel: "Row 2",
      fields: [...]            // May be empty array but row must exist
    },
    {
      rowId: "row3",
      rowLabel: "Row 3", 
      fields: [...]            // May be empty array but row must exist
    }
  ],
  metadata: {
    version: string,           // Semantic version (e.g., "1.0.3")
    createdAt: timestamp,      // ISO 8601 format
    modifiedAt: timestamp,     // ISO 8601 format
    previousVersion: string,   // For rollback capability
    changeNotes: string,       // Description of changes
    joinCount: number,         // Count of unique related entities used
    joinSources: [string],     // List of related entities (e.g., ["primaryContact"])
    totalFields: number,       // Total configured fields across all rows
    performanceImpact: string  // "low" (0-1 joins), "medium" (2-3), "high" (4+)
  }
}
```

### 3.2 Performance Constraints

#### 3.2.1 Join Limitations
- **Maximum Joins**: Single join per configuration
- **Validation**: System must prevent configurations requiring multiple joins
- **Warning System**: Alert users when approaching join limits

#### 3.2.2 Field Limits
- **Recommended Maximum**: 12-15 fields per configuration for optimal performance
- **UI Guidance**: Visual indicators when approaching recommended limits

### 3.3 Visual Design Implementation
- **Styling Approach**: Pure black and white design with no colors
- **Design Philosophy**: Configuration tool aesthetics - functional over decorative
- **Visual Elements**: 
  - Black text on white backgrounds
  - Gray borders and dividers (#ccc, #ddd range)
  - White text on black for high contrast elements
  - No brand colors, gradients, or decorative styling

### 3.4 Browser Compatibility
- **HTML5 Drag and Drop API**: Required for drag functionality
- **Modern Browser Support**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

---

## 4. User Experience Requirements

### 4.1 Interaction Patterns

#### 4.1.1 Discoverability
- **Field Availability**: Clear indication of which fields are available vs. already configured
- **Relationship Context**: Visual indicators showing which entity each field belongs to
- **Action Affordances**: Clear visual cues for draggable elements and drop zones

#### 4.1.2 Error Prevention
- **Duplicate Prevention**: Prevent adding the same field multiple times
- **Join Validation**: Prevent configurations that would require multiple joins
- **Row Limitations**: Enforce single header row and maximum 3 body rows
- **Context Awareness**: Show relevant fields based on selected context

#### 4.1.3 Feedback and Confirmation
- **Immediate Feedback**: Real-time preview updates as fields are added/removed
- **Action Confirmation**: Confirm destructive actions (reset, remove multiple fields)
- **Progress Indication**: Show configuration completeness and performance impact

### 4.2 Visual Design Constraints
- **Color Scheme**: Pure black and white only - no colors, gradients, or branding
- **Rationale**: This is a configuration tool; styling happens downstream in the actual implementation
- **Visual Hierarchy**: Use typography, spacing, and contrast only (no color coding)
- **Interactive States**: Use opacity, borders, and shadows for hover/active states

### 4.3 Responsive Design
- **Minimum Width**: 1200px for optimal three-panel layout
- **Panel Flexibility**: Panels should resize appropriately for different screen sizes
- **Mobile Consideration**: Touch-friendly interactions for tablet use

---

## 5. Integration Requirements

### 5.1 Data Source Integration
- **Entity Schema**: Must integrate with existing entity definitions
- **Relationship Mapping**: Must read relationship definitions from data model
- **Field Metadata**: Must access field type and validation information

### 5.2 Output Integration
- **Configuration Export**: Generated configurations must be consumable by rendering components
- **JSON Format**: Standard format for configuration persistence and transfer
- **Version Compatibility**: Maintain backward compatibility with existing configurations

---

## 6. Success Criteria

### 6.1 Functional Success
- ✅ Users can configure field layouts without technical knowledge
- ✅ All drag-and-drop interactions work smoothly across supported browsers
- ✅ Live preview accurately reflects final rendered output
- ✅ Configurations can be saved, loaded, and exported successfully

### 6.2 Performance Success
- ✅ Configuration changes reflect in preview within 100ms
- ✅ Drag operations feel responsive with minimal lag
- ✅ System prevents performance-degrading configurations

### 6.3 Usability Success
- ✅ New users can create basic configurations within 5 minutes
- ✅ Complex configurations (8+ fields, multiple entities) can be created within 15 minutes
- ✅ Error states are clear and recovery paths are obvious

---

## 7. Future Considerations

### 7.1 Potential Enhancements
- **Multi-level Relationships**: Support for nested relationships (account.primaryContact.address.city)
- **Conditional Fields**: Show/hide fields based on other field values
- **Field Formatting**: Apply display formatting rules per field type
- **Template System**: Pre-built configuration templates for common use cases
- **Bulk Operations**: Select and manipulate multiple fields simultaneously

### 7.2 Scalability Considerations
- **Entity Extensibility**: Easy addition of new entity types
- **Relationship Complexity**: Framework for handling more complex relationship patterns
- **Performance Optimization**: Caching and optimization for large field sets
