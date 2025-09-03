# SME Entity Selector Product Requirements Document (PRD)

---

## 1. The Core Context

### Problem Statement

**Current Conditions:**
For **Subject Matter Experts (SMEs)** working with service industry software factory implementations, the following conditions exist:

1. **Business knowledge trapped in SME's head** - No way to directly translate business requirements into technical specifications
2. **Technical barrier to entity selection** - SMEs can't configure which entities are needed without developer intervention
3. **Discovery Canvas to Pipeline gap** - Rich business context from discovery doesn't translate to factory pipeline inputs
4. **Manual entity mapping** - Developers must interpret SME requirements and manually create entity configurations
5. **Lost business context** - Technical pipeline loses sight of business rationale for entity choices
6. **No validation of entity relationships** - Can't verify that selected entities actually support intended workflows
7. **SME dependency bottleneck** - Developers constantly need SME clarification during implementation

**Impacts of These Conditions:**
These conditions result in:
- **Misaligned implementations** - Technical team builds wrong entities based on misunderstood requirements
- **Multiple discovery rounds** - SME has to re-explain business logic multiple times
- **Implementation delays** - Waiting for SME clarification blocks factory pipeline execution
- **Poor entity selection** - Missing key entities or including unnecessary ones
- **Business logic errors** - Incorrect entity relationships lead to workflow problems
- **Rework cycles** - Discovering entity problems after generation requires starting over
- **SME frustration** - Business experts feel disconnected from technical implementation

**Our Solution:**
SME Entity Selector provides **business-friendly interface** that bridges the gap between **Discovery Canvas findings** and **factory pipeline requirements**. It enables SMEs to directly configure entity selection through:
- Visual entity selection from business model (BUSM)
- Master View pattern configuration with business terminology
- Contextual modal configuration for child record access
- Direct export to Stage 1 pipeline requirements
- Business workflow validation against selected entities

This results in **SME ownership** of entity decisions, **elimination of translation errors**, **faster pipeline execution**, and **preserved business context** through the entire implementation process.

### High-Level Goals & Metrics

1. **Enable SME direct entity configuration**
   - **Metric:** % of entity configurations created by SME vs developer
   - **Target:** 80%+ SME-created configurations within 3 months

2. **Reduce discovery-to-pipeline time**
   - **Metric:** Hours from completed Discovery Canvas to Stage 1 pipeline execution
   - **Target:** < 2 hours (vs current ~8-16 hours)

3. **Eliminate entity selection errors**
   - **Metric:** % of implementations requiring entity changes post-generation
   - **Target:** < 10% entity rework rate

4. **Preserve business context through pipeline**
   - **Metric:** % of business rationale captured in pipeline outputs
   - **Target:** 100% business context preserved in generated artifacts

5. **Increase SME confidence in technical implementation**
   - **Metric:** SME satisfaction score with entity selection process
   - **Target:** 4.5/5 rating on configuration experience

## 2. User Personas

### Primary SME (Subject Matter Expert)
- **Profile:** Business expert in service industry operations (pest control, HVAC, field service)
- **Technical Level:** Limited - understands business processes, not technical implementation
- **Primary Objective:** Translate business workflow knowledge into entity requirements that drive software generation
- **Pain Points:** Can't directly configure technical requirements, loses control after discovery phase
- **Success Looks Like:** Can independently configure entity selection and see it flow through to working software

### Secondary Factory Developer
- **Profile:** Technical implementer working with factory pipelines
- **Primary Objective:** Consume SME entity configurations to execute Stage 1 pipeline without interpretation
- **Pain Points:** Constantly interpreting SME intent, translating business language to technical specs
- **Success Looks Like:** Clear, complete entity configurations that require no SME follow-up

### Tertiary Claude Code Agent
- **Profile:** AI agent executing factory pipeline stages
- **Primary Objective:** Generate accurate UI components based on SME-configured entity relationships
- **Pain Points:** Ambiguous entity selections, missing business context for relationship decisions
- **Success Looks Like:** Complete entity configuration with business rationale for AI decision-making

## 3. Data Model (Conceptual)

### Key Entities

#### EntitySelection
- Central entity representing SME's entity choices for a specific project
- Links to Discovery Canvas findings
- Contains business rationale for each entity choice
- Exports to Stage 1 pipeline format

#### BusinessEntity
- Represents entities from BUSM model with business-friendly descriptions
- Maps technical entity names to business terminology
- Contains relationship information and business rules

#### MasterViewConfiguration  
- Captures SME's 3-column Master View configuration
- Maps entities to columns with business workflow rationale
- Defines contextual modal configurations for child records

#### WorkflowValidation
- Validates that selected entities support intended business workflows
- Cross-references Discovery Canvas persona jobs-to-be-done
- Flags missing entities or relationships

## 4. Functional Requirements

### Module 1: Discovery Canvas Integration

#### Features
1. Import Discovery Canvas findings
2. Extract entity requirements from persona jobs-to-be-done
3. Map business workflows to entity needs
4. Validate workflow coverage

#### User Stories & Acceptance Criteria

##### Feature 1: Import Discovery Canvas findings

**User Story:** As an SME, I want to import my Discovery Canvas so that entity selection is based on actual business requirements rather than starting from scratch.

**Acceptance Criteria:**

```gherkin
Given I have completed a Factory Discovery Canvas
When I import the canvas into SME Entity Selector
Then the system shall extract entity hints from all 8 sections
And pre-populate suggested entities based on persona jobs-to-be-done
```

```gherkin
Given Discovery Canvas contains Admin persona "absolute least clicks" requirement
When system analyzes workflow needs
Then Master View pattern shall be recommended as optimal solution
And 3-column layout shall be suggested for Account → ServiceLocation → WorkOrder flow
```

```gherkin
Given Discovery Canvas contains 4 standardized service personas
When system processes persona jobs-to-be-done
Then entity suggestions shall cover all persona workflow needs
And missing entity gaps shall be flagged for SME review
```

### Module 2: Entity Selection Interface

#### Features
1. Display BUSM entities with business descriptions
2. Support primary and supporting entity selection
3. Show entity relationships visually
4. Validate minimum entity requirements
5. Provide entity selection rationale capture

#### User Stories & Acceptance Criteria

##### Feature 1: Display BUSM entities with business descriptions

**User Story:** As an SME, I want to see entities described in business terms so that I can select the right ones without needing technical knowledge.

**Acceptance Criteria:**

```gherkin
Given I am selecting entities for pest control software
When I view available entities
Then ACCOUNT shall be described as "Customer businesses and residential accounts"
And SERVICE_LOCATION shall be described as "Physical locations where service is performed"
And WORK_ORDER shall be described as "Individual service tasks and appointments"
```

```gherkin
Given I am viewing entity options
When I hover over an entity card
Then system shall show sample fields in business language
And display typical use cases for this entity type
```

```gherkin
Given I am selecting entities
When I choose primary entities
Then system shall require exactly 3 for Master View pattern
And suggest optimal combinations based on service industry standards
```

##### Feature 2: Support primary and supporting entity selection

**User Story:** As an SME, I want to select both primary entities (for main columns) and supporting entities (for contextual information) so that the complete business workflow is supported.

**Acceptance Criteria:**

```gherkin
Given I am configuring Master View entities
When I select primary entities
Then system shall enforce 3-entity limit for columns
And guide me to select entities that form logical workflow progression
```

```gherkin
Given I have selected 3 primary entities
When I select supporting entities
Then system shall suggest entities related to primary selections
And show how supporting entities enable contextual information access
```

```gherkin
Given I have selected Account, ServiceLocation, WorkOrder as primary
When system suggests supporting entities
Then CONTACT, COMMUNICATION_LOG, INVOICE should be offered
And business rationale should explain how each supports admin persona workflows
```

### Module 3: Master View Configuration

#### Features
1. Map selected entities to 3-column Master View
2. Configure contextual modals for child records
3. Define entity relationships and data flow
4. Preview Master View layout
5. Validate workflow support

#### User Stories & Acceptance Criteria

##### Feature 1: Map selected entities to 3-column Master View

**User Story:** As an SME, I want to configure how my selected entities map to the Master View columns so that the layout matches my business workflow.

**Acceptance Criteria:**

```gherkin
Given I have selected Account, ServiceLocation, WorkOrder as primary entities
When I configure Master View columns
Then Column 1 should default to Account (customer entry point)
And Column 2 should default to ServiceLocation (service delivery point)  
And Column 3 should default to WorkOrder (specific work tasks)
```

```gherkin
Given I am mapping entities to columns
When I change column assignments
Then system shall validate that data flow makes business sense
And warn if relationships don't support the selected flow
```

```gherkin
Given I have configured column mappings
When I preview the layout
Then system shall show how Admin persona "customer call" workflow flows through columns
And demonstrate "absolute least clicks" requirement satisfaction
```

##### Feature 2: Configure contextual modals for child records

**User Story:** As an SME, I want to configure what additional information is available for each column so that admin staff can access all related records without losing context.

**Acceptance Criteria:**

```gherkin
Given I am configuring Account column contextual access
When I select child record types
Then system shall offer CONTACT, COMMUNICATION_LOG, INVOICE, PAYMENT options
And show business icons/labels that admin staff will understand
```

```gherkin
Given I am configuring contextual modals
When I select modal content
Then system shall use business-friendly terminology (e.g., "Customer Contacts" not "CONTACT entities")
And provide tooltips explaining what information each modal provides
```

```gherkin
Given I have configured all contextual modals
When I preview the experience
Then system shall simulate admin receiving customer call scenario
And demonstrate "absolute least clicks" to access all related information
```

### Module 4: Workflow Validation

#### Features
1. Validate entity selection against persona jobs-to-be-done
2. Check workflow completeness
3. Flag missing entity relationships
4. Suggest entity additions for workflow gaps

#### User Stories & Acceptance Criteria

##### Feature 1: Validate entity selection against persona jobs-to-be-done

**User Story:** As an SME, I want to validate that my entity selection supports all the persona workflows I defined so that nothing important is missing from the implementation.

**Acceptance Criteria:**

```gherkin
Given I have configured entities for Master View
When I run workflow validation
Then system shall check each persona job-to-be-done from Discovery Canvas
And verify selected entities can support the required workflow
```

```gherkin
Given Admin persona job is "access account, service locations, work history with least clicks"
When system validates entity selection  
Then Account, ServiceLocation, WorkOrder entities shall be confirmed as required
And contextual modal entities shall be validated for "complete information" access
```

```gherkin
Given Ops Manager persona job is "see up-to-the-minute work order status"
When system validates for this workflow
Then WorkOrder entity selection shall be confirmed
And system shall flag if real-time status tracking entities are missing
```

### Module 5: Pipeline Export

#### Features
1. Export configuration to Stage 1 pipeline format
2. Generate "Required Entities for ViewForge Configuration" section
3. Create business rationale documentation
4. Validate export completeness

#### User Stories & Acceptance Criteria

##### Feature 1: Export configuration to Stage 1 pipeline format

**User Story:** As an SME, I want to export my entity configuration so that the technical factory pipeline can execute without developer interpretation.

**Acceptance Criteria:**

```gherkin
Given I have completed entity selection and Master View configuration
When I export to pipeline
Then system shall generate Stage 1 compatible entity requirements
And include all primary and supporting entities with proper relationships
```

```gherkin
Given I export entity configuration
When Stage 1 pipeline reads the export
Then all required entities shall be clearly specified
And entity relationships shall be properly defined for BUSM extraction
```

```gherkin
Given I export with business rationale
When technical team reviews export
Then each entity selection shall include business justification
And persona workflow connections shall be documented for implementation context
```

## 5. Non-Functional Requirements

### Usability
- **Business Language Only** - No technical terminology visible to SME
- **Visual Entity Selection** - Click-based selection, no typing required
- **Workflow Guidance** - Step-by-step guidance through entity selection
- **Validation Feedback** - Immediate feedback on selection completeness
- **Preview Capability** - See Master View before export

### Performance
- **Fast Entity Loading** - BUSM entities load in < 2 seconds
- **Instant Preview** - Master View preview updates in < 1 second
- **Quick Export** - Pipeline export generation in < 5 seconds

### Integration
- **Discovery Canvas Import** - Seamless import from Discovery Canvas findings
- **Stage 1 Export** - Direct compatibility with existing Stage 1 pipeline
- **BUSM Integration** - Real-time reading from BUSM.mmd file
- **ViewForge Compatibility** - Can feed ViewForge for detailed field configuration if needed

### Reliability
- **Selection Validation** - Prevent invalid entity combinations
- **Workflow Completeness** - Ensure all persona needs are covered
- **Export Accuracy** - Guarantee Stage 1 pipeline can consume exports
- **Business Context Preservation** - Maintain SME rationale through export

## 6. Technical Constraints

### Must Use
- Read directly from BUSM.mmd file
- Export JSON format compatible with Stage 1 pipeline
- Pure HTML/JavaScript (no build step)
- Business-friendly terminology only

### Must Not Use
- Technical database terminology
- Complex configuration requirements
- Multi-step setup processes
- Developer-dependent workflows

## 7. Success Criteria

### MVP Success (Week 1)
- [ ] Import Discovery Canvas persona jobs-to-be-done
- [ ] Select 7 entities (3 primary + 4 supporting) from BUSM
- [ ] Configure basic Master View column mapping
- [ ] Export Stage 1 compatible entity requirements

### Full Success (Week 2)
- [ ] Complete contextual modal configuration
- [ ] Workflow validation against persona jobs-to-be-done
- [ ] Master View preview with business workflow simulation
- [ ] Business rationale capture and export
- [ ] End-to-end SME → Stage 1 pipeline flow

### Production Ready (Week 3)
- [ ] Error handling for invalid entity combinations
- [ ] Comprehensive workflow validation
- [ ] Export audit trail and versioning
- [ ] SME training materials and guidance
- [ ] Integration testing with full factory pipeline

## 8. Integration Points

### Discovery Canvas Input
- Import all 8 sections of Discovery Canvas
- Extract persona jobs-to-be-done for workflow validation
- Use business context for entity selection guidance
- Preserve business rationale through configuration

### BUSM Model Integration
- Read entity definitions from BUSM.mmd
- Map technical names to business terminology
- Extract entity relationships for validation
- Provide business descriptions for each entity

### Stage 1 Pipeline Output
- Generate "Required Entities for ViewForge Configuration" section
- Export entity list with relationships
- Include business rationale for each selection
- Validate export format compatibility

### ViewForge Handoff (Optional)
- Can export to ViewForge for detailed field configuration
- Maintains entity selections and Master View configuration
- Preserves business context for technical configuration

## 9. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SME overwhelmed by entity choices | High | Medium | Guided workflow, suggested defaults from Discovery Canvas |
| Wrong entity selection impacts entire pipeline | High | Low | Workflow validation, preview capability, undo functionality |
| BUSM model changes break entity display | Medium | Low | Schema versioning, graceful degradation |
| Export format incompatible with Stage 1 | High | Low | Format validation, integration testing |
| SME selects too few/many entities | Medium | Medium | Validation rules, workflow completeness checking |

## 10. Future Enhancements (Post-MVP)

1. **AI Entity Suggestions** - Machine learning recommendations based on industry patterns
2. **Multi-Industry Templates** - Pre-configured entity selections for different service industries
3. **Workflow Simulation** - Interactive preview of complete user workflows
4. **Team Collaboration** - Multiple SMEs can contribute to entity selection
5. **Advanced Validation** - Business rule validation beyond entity relationships
6. **Export Templates** - Multiple export formats for different pipeline stages
7. **Analytics Dashboard** - Track entity selection patterns and success rates

---

## Appendices

### A. Glossary
- **SME**: Subject Matter Expert with deep business knowledge but limited technical expertise
- **Entity**: A "thing" the business needs to track (Account, WorkOrder, etc.)
- **Master View**: 3-column layout pattern optimized for service industry workflows
- **Contextual Modal**: Pop-up/slide-out access to related records without losing main context
- **Discovery Canvas**: Business requirements gathering document with 8 structured sections

### B. Entity Selection Examples

#### Service Industry Standard Entities
- **Primary Entities** (Master View columns): Account, ServiceLocation, WorkOrder
- **Supporting Entities** (contextual access): Contact, CommunicationLog, Invoice, Payment, ServiceAgreement, Material, Employee

#### Business Terminology Mapping
- ACCOUNT → "Customer Accounts" 
- SERVICE_LOCATION → "Service Addresses"
- WORK_ORDER → "Service Appointments"
- CONTACT → "Customer Contacts"
- COMMUNICATION_LOG → "Customer Communications"

### C. Workflow Examples

#### Admin Persona Workflow
1. Customer calls → Search in Master View
2. Account appears in Column 1 → Click for contextual contact info
3. Service locations load in Column 2 → Access service history
4. Work orders appear in Column 3 → View appointment details
5. All related information accessible with minimal clicks

---

*End of SME Entity Selector PRD v1.0*