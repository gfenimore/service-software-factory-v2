# US--002: Service Locations Column

**Priority**: High  
**Category**: locations  

**Requirements Mapped**: 5  

## User Story
As a user, I want to see locations for the selected account so I can navigate to specific service locations

## Acceptance Criteria

- [ ] Display locations for selected account only [Requirements: NAV-002]
- [ ] Show service status indicators for each location [Requirements: VIS-002]
- [ ] Display next service date for each location
- [ ] Click on location loads related work orders [Requirements: NAV-003]
- [ ] Support location search within selected account [Requirements: NAV-002, DAT-001]
- [ ] Emit location:selected event when location is selected [Requirements: NAV-002, EVT-002]

## Mapped Requirements
- **NAV-002**: System must preserve context when navigating between entities
- **NAV-003**: Common tasks must be completed in 1-2 clicks (reduced from 5-7)
- **DAT-001**: Accounts column must display all accounts with search/filter
- **VIS-002**: Visual status indicators (active/inactive) must be shown
- **EVT-002**: System must emit location:selected event when location is selected

## Technical Notes
- This story was generated with automatic requirement mapping
- All acceptance criteria should be validated against requirements.json
- Use CONCEPT-GENERATOR validation to verify implementation

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All mapped requirements validated
- [ ] Unit tests written and passing
- [ ] Code review completed
- [ ] Documentation updated
