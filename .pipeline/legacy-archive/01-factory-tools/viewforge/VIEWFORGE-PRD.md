# ViewForge 2.0 Product Requirements Document (PRD)

---

## 1. The Core Context

### Problem Statement

**Current Conditions:**
For **software factory operators (humans and AI agents like Claude Code)** working with the three-line progressive factory, the following conditions exist:

1. **Manual configuration repetition** - Each factory line requires separate configuration
2. **No visual configuration tools** - Everything is code-based, requiring deep technical knowledge
3. **Lost context between handoffs** - Each operator must reverse-engineer intent from code
4. **No configuration validation** - Can't verify completeness until generation fails
5. **Inconsistent field naming** - Same field called different names in different places
6. **No relationship visibility** - Can't see or configure related entity fields
7. **No single source of truth** - Configurations scattered across multiple files and formats

**Impacts of These Conditions:**
These conditions result in:
- **Configuration drift** - Each iteration diverges from the original intent
- **Repeated manual corrections** - Same fixes applied multiple times across lines
- **Wasted operator time** - Hours spent on configuration instead of innovation
- **Unpredictable factory output** - Never sure what will be generated
- **Extensive rework** - Discovering missing fields after generation
- **Fear of change** - Can't confidently evolve the factory without breaking existing configs
- **Knowledge silos** - Only the original configurator understands the setup
- **Failed iterations** - Generation fails due to incomplete configurations

**Our Solution:**
ViewForge 2.0 provides **a visual configuration system** that serves as the **single source of truth** for all factory lines. It ensures **conceptual precision and contextual consistency** through:
- Visual field selection with relationship support
- Hierarchy-aware configuration scoping
- Live preview of configured output
- Validated JSON export with full context
- Configuration reuse across projects

This results in **controlled evolution** of factory output, **elimination of configuration drift**, **preserved context** through the entire pipeline, and the ability to **confidently improve** factory capabilities knowing changes will propagate predictably.

### High-Level Goals & Metrics (with Measurement Notes)

1. **Eliminate configuration drift across factory lines**
   - **Metric:** Configuration consistency score (% of fields/settings matching across lines)
   - **Measurement Notes:** Measured by comparing generated outputs from same configuration across Concept, Prototype, and Production lines

2. **Reduce time to configure new views**
   - **Metric:** Average time from start to exported JSON configuration
   - **Measurement Notes:** Measured from entity selection to successful JSON export, tracked per session

3. **Ensure configuration accuracy and completeness**
   - **Metric:** Configuration error rate (errors found post-generation vs total configurations)
   - **Measurement Notes:** Tracked by counting generator failures or manual corrections needed after generation

4. **Enable configuration reuse across projects**
   - **Metric:** Configuration reuse rate (% of configs used in multiple projects)
   - **Measurement Notes:** Tracked by configuration library usage and import frequency

5. **Preserve context through handoffs**
   - **Metric:** Handoff success rate (% of handoffs requiring no clarification)
   - **Measurement Notes:** Measured by tracking questions/clarifications needed when configuration moves between operators or lines

6. **Support controlled factory evolution**
   - **Metric:** Change propagation accuracy (% of changes correctly applied across all lines)
   - **Measurement Notes:** Measured when configuration updates are made and validated across all three lines

7. **Accelerate factory improvement cycles**
   - **Metric:** Time from pattern identification to deployment across all lines
   - **Measurement Notes:** Tracked from pattern creation to successful use in all three factory lines

8. **Reduce custom code requirements**
   - **Metric:** Configuration vs custom code ratio (% handled by configuration)
   - **Measurement Notes:** Measured by comparing configured features vs hand-coded exceptions

## 2. User Personas

### Factory Developer (Human)
- **Primary Objective:** Configure precise UI specifications that will generate consistent output across all three factory lines, ensuring the concept is faithfully preserved through to production
- **Pain Points:** Manually maintaining consistency, remembering field names, tracking what changed between iterations
- **Success Looks Like:** One configuration that "just works" across all lines

### Claude Code (AI Agent)
- **Primary Objective:** Consume configuration to generate accurate UI components, understand context from previous iterations, and maintain conceptual integrity while adding line-appropriate enhancements
- **Pain Points:** Ambiguous specifications, missing context, inconsistent field naming, unclear relationships between entities
- **Success Looks Like:** Clear, complete configurations that require no guesswork or assumptions

### Factory Architect (Human)
- **Primary Objective:** Evolve the factory's capabilities by improving patterns, adding new view types, and ensuring all improvements propagate correctly through the system
- **Pain Points:** Testing pattern changes across all lines, ensuring backwards compatibility, documenting pattern evolution
- **Success Looks Like:** Confident deployment of factory improvements with predictable results

### Future Personas (To Be Automated)

#### QA Specialist (Future Agent)
- **Primary Objective:** Validate configurations generate correct output, ensure all acceptance criteria are met

#### Business Analyst (Future Human/Agent)
- **Primary Objective:** Define what views are needed, which fields matter to end users, what workflows to support

#### DevOps Engineer (Future Agent)
- **Primary Objective:** Deploy generated components, manage configuration versions, handle rollbacks

#### Project Manager (Future Agent)
- **Primary Objective:** Track configuration progress, manage iterations, ensure deliverables meet timeline

## 3. Data Model (Conceptual)

[See VIEWFORGE-ERD.md for complete entity relationship diagram]

### Key Entities

#### Configuration
- Central entity representing UI configuration at any scope level
- Always belongs to an Application
- Optionally scoped to Module, SubModule, or UserStory
- Supports parent-child composition for complex layouts

#### Hierarchy Entities
- **Application**: Top-level container (e.g., "Field Service Management")
- **Module**: Functional area (e.g., "Customer Management")
- **SubModule**: Logical grouping (e.g., "Customer Accounts")
- **UserStory**: Specific feature (e.g., "View customer details")

#### Supporting Entities
- **FieldSelection**: Individual field configurations
- **LayoutRule**: Display and arrangement rules
- **ExportHistory**: Audit trail of generations
- **ConfigurationVersion**: Complete version history

## 4. Functional Requirements (The Hierarchy)

### Module 1: Configuration Management

#### Features

1. Create new Configuration at any scope level
2. Edit existing Configuration
3. Clone Configuration (with modifications)
4. Compose Configurations (parent-child)
5. Version Configuration changes
6. Export Configuration package
7. Import Configuration from JSON
8. Search and filter Configurations

#### User Stories & Acceptance Criteria

##### Feature 1: Create new Configuration at any scope level

**User Story:** As a Factory Developer, I want to create configurations at different scope levels (app, module, submodule, story) so that I can define UI behavior at the appropriate level of abstraction.

**Acceptance Criteria:**

```gherkin
Given I am creating a new configuration
When I select scope level "module"
Then the system shall require Application and Module selection
And allow optional SubModule and UserStory selection
```

```gherkin
Given I am creating a module-level configuration
When I save the configuration
Then the system shall set config_scope to "module"
And populate app_id and module_id
And leave submodule_id and story_id as null
```

```gherkin
Given I am creating a story-level configuration
When I do not select a parent module
Then the system shall display an error requiring module context
```

##### Feature 2: Edit existing Configuration

**User Story:** As a Factory Developer, I want to edit configurations while preserving version history so that I can improve configurations while maintaining traceability.

**Acceptance Criteria:**

```gherkin
Given I am editing an existing configuration
When I save changes
Then the system shall create a new version
And maintain a link to the previous version
And preserve the original version unchanged
```

```gherkin
Given I am editing a configuration with child configurations
When I change a structural element
Then the system shall warn about impacts to child configurations
And allow me to proceed or cancel
```

##### Feature 3: Clone Configuration

**User Story:** As a Factory Developer, I want to clone existing configurations so that I can quickly create similar configurations without starting from scratch.

**Acceptance Criteria:**

```gherkin
Given I am viewing a configuration
When I select "Clone Configuration"
Then the system shall create a copy with a new ID
And append "_copy" to the name
And maintain a reference to the source configuration
```

```gherkin
Given I am cloning a configuration with parent-child relationships
When I confirm the clone operation
Then the system shall ask whether to clone child configurations
And maintain relationship structure if requested
```

##### Feature 4: Compose Configurations (parent-child)

**User Story:** As a Factory Developer, I want to compose configurations from smaller parts so that I can build complex layouts from reusable components.

**Acceptance Criteria:**

```gherkin
Given I am creating a module layout configuration
When I add child configurations
Then the system shall allow selecting existing configurations
And create parent-child relationships
And show the composition hierarchy
```

```gherkin
Given I have a parent configuration with children
When I export the parent
Then the system shall include all child configurations
And maintain the relationship structure in the export
```

### Module 2: Field Configuration

#### Features

1. Select fields from BUSM registry
2. Configure field display properties
3. Set field-level rules
4. Define field relationships
5. Preview field layout
6. Bulk field operations
7. Field search and filter

#### User Stories & Acceptance Criteria

##### Feature 1: Select fields from BUSM registry

**User Story:** As a Factory Developer, I want to select fields from the authoritative BUSM registry so that field names and types are consistent across all configurations.

**Acceptance Criteria:**

```gherkin
Given I am configuring fields for entity "Account"
When I open the field selector
Then the system shall display all fields from BUSM.account
And show field type, required status, and description
```

```gherkin
Given I am selecting fields
When I select a field with a foreign key relationship
Then the system shall offer to include related entity fields
And show the relationship path (e.g., account.serviceLocation.name)
```

```gherkin
Given I have selected fields
When I search for a field name
Then the system shall filter the available fields
And highlight matching text
```

##### Feature 2: Configure field display properties

**User Story:** As a Factory Developer, I want to configure how each field displays so that the generated UI matches user needs.

**Acceptance Criteria:**

```gherkin
Given I have selected a field
When I configure display properties
Then I can set: width, alignment, format, label override
And the system shall preview the changes
```

```gherkin
Given I am configuring a date field
When I select format options
Then the system shall offer standard date formats
And allow custom format strings
```

### Module 3: Layout Configuration

#### Features

1. Select layout pattern (table, master-detail, inline-expansion)
2. Configure pattern-specific settings
3. Define responsive behavior
4. Set layout-level rules
5. Preview layout
6. Configure navigation flow

#### User Stories & Acceptance Criteria

##### Feature 1: Select layout pattern

**User Story:** As a Factory Developer, I want to select from proven layout patterns so that I can quickly configure standard UI layouts without custom code.

**Acceptance Criteria:**

```gherkin
Given I am configuring a list view
When I select layout pattern
Then the system shall offer: table, card grid, list
And show a preview of each pattern
```

```gherkin
Given I have selected master-detail pattern
When I configure the pattern
Then I must specify: master entity, detail entity, relationship
And the system shall validate the relationship exists
```

```gherkin
Given I have selected inline-expansion pattern
When I configure the pattern
Then I must specify: collapsed view fields, expanded view fields
And the system shall ensure collapsed fields are subset of expanded
```

### Module 4: Export and Generation

#### Features

1. Export configuration as JSON
2. Validate configuration completeness
3. Generate for specific factory line
4. Export configuration package
5. Preview generated output
6. Track export history

#### User Stories & Acceptance Criteria

##### Feature 1: Export configuration as JSON

**User Story:** As a Factory Developer, I want to export configurations as JSON so that generators can consume them to create UI components.

**Acceptance Criteria:**

```gherkin
Given I have completed a configuration
When I select "Export JSON"
Then the system shall generate valid JSON
And include all configuration metadata
And validate against the configuration schema
```

```gherkin
Given I am exporting a configuration with children
When I export
Then the system shall include all child configurations
And maintain parent-child relationships in the JSON structure
```

```gherkin
Given I export a configuration
When the export completes
Then the system shall record in ExportHistory
And maintain the export for audit purposes
```

### Module 5: Context and Organization

#### Features

1. Navigate hierarchy (App → Module → SubModule → Story)
2. View configurations by scope
3. Track configuration dependencies
4. Manage configuration lifecycle
5. Search across all configurations
6. View configuration impact analysis

#### User Stories & Acceptance Criteria

##### Feature 1: Navigate hierarchy

**User Story:** As a Factory Developer, I want to navigate the application hierarchy so that I can understand context and find related configurations.

**Acceptance Criteria:**

```gherkin
Given I am viewing an application
When I navigate the hierarchy
Then I can drill down: App → Module → SubModule → Story
And see configurations at each level
```

```gherkin
Given I am viewing a story
When I look at the breadcrumb
Then I can see: App > Module > SubModule > Story
And click any level to navigate there
```

## 5. Non-Functional Requirements

### Performance
- Configuration load time < 2 seconds
- Export generation < 5 seconds
- Support 1000+ fields per entity
- Handle 100+ concurrent configurations

### Usability
- Zero color dependency (B&W only for Concept Line)
- Keyboard navigation support
- Clear error messages with resolution steps
- Undo/redo for all operations

### Reliability
- Auto-save every 5 minutes
- Configuration validation before export
- Graceful handling of invalid data
- Recovery from interrupted sessions

### Security
- No sensitive data in configurations
- Audit trail for all changes
- Version control integration ready
- Export sanitization

### Compatibility
- JSON schema versioning
- Backwards compatibility for 2 major versions
- Cross-browser support (Chrome, Firefox, Safari)
- Generator version compatibility matrix

## 6. Technical Constraints

### Must Use
- Pure JavaScript (no build step for MVP)
- JSON for data exchange
- Git for version control
- Black and white UI only

### Must Not Use
- External dependencies for core functionality
- Proprietary formats
- Color as information carrier
- Database for MVP (localStorage only)

## 7. Success Criteria

### MVP Success (Week 1)
- [ ] Configure single entity fields
- [ ] Export valid JSON
- [ ] Load configuration in generator
- [ ] Generate concept line HTML

### Full Success (Week 3)
- [ ] All scope levels functional
- [ ] Parent-child composition working
- [ ] Three layout patterns implemented
- [ ] Relationship fields supported
- [ ] Import/export fully functional
- [ ] Version history tracked

## 8. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| BUSM schema changes | High | Medium | Version schema, migration tools |
| Configuration complexity | High | High | Templates, wizards, examples |
| Generator incompatibility | High | Low | Schema validation, version checking |
| Performance with large configs | Medium | Medium | Pagination, lazy loading |
| Lost work | High | Low | Auto-save, localStorage, version control |

## 9. Future Enhancements (Post-MVP)

1. **Visual preview** - Real-time preview of configured UI
2. **Collaborative editing** - Multiple users configuring simultaneously
3. **AI-assisted configuration** - Smart defaults and suggestions
4. **Configuration marketplace** - Share and reuse configurations
5. **Advanced patterns** - Wizards, workflows, dashboards
6. **Rule builder** - Visual rule creation for conditions
7. **Performance analytics** - Track which configs are slow
8. **A/B testing** - Compare configuration effectiveness

---

## Appendices

### A. Glossary
- **Factory Line**: One of three progressive stages (Concept, Prototype, Production)
- **BUSM**: Business Model registry containing authoritative field definitions
- **Configuration Scope**: Level at which configuration applies (app, module, submodule, story)
- **Composition**: Parent-child relationship between configurations

### B. References
- [VIEWFORGE-ERD.md](./VIEWFORGE-ERD.md) - Complete entity relationship diagram
- [VIEWFORGE-REQUIREMENTS-V2.md](./VIEWFORGE-REQUIREMENTS-V2.md) - Original requirements
- [CONCEPT-LINE-PRINCIPLES.md](./CONCEPT-LINE-PRINCIPLES.md) - B&W only principles

---

*End of PRD*