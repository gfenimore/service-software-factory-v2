# Master View Feature - Product Requirements Document (PRD)

**Version**: 1.0  
**Created**: August 2025  
**Module**: Accounts  
**Status**: Draft  
**Owner**: Product Team  

## Executive Summary

The Master View feature provides a unified "single pane of glass" interface that enables users to access all account data from one location. This three-column layout eliminates the need for navigation between multiple modules and screens, delivering significant efficiency gains for daily operations.

## Problem Statement

### Current Pain Points
- Users navigate multiple screens to access complete account information
- Hundreds of unnecessary clicks per day across common workflows
- Fragmented data access leads to inefficient customer support
- Support technicians lack immediate context for field work
- Time-consuming information gathering delays customer service

### Business Impact
- Customer calls take 2-3 minutes vs potential <10 seconds
- Fragmented workflow reduces productivity
- Increased support overhead due to incomplete information access

## Solution Overview

### Core Concept: Three-Column Architecture

**Column 1: Account Selection**
- Super-efficient card view of accounts
- Search and filtering capabilities
- Quick account discovery and selection
- Drives content for Columns 2 & 3

**Column 2: Service Locations**
- All locations related to selected account
- Card format for quick scanning
- Location selection drives Column 3

**Column 3: Work Orders**
- All work orders for selected service location
- Card format for consistency
- Full detail access on selection

### Design Philosophy
*"Everything happens based on the record the user selects. They see what they want, when they want, and nothing else."*

## Required Entities for ViewForge Configuration

The following entities must be configured in ViewForge to support the Master View feature:

### Primary Entities
1. **Accounts** - Main customer accounts displayed in Column 1
2. **Service Locations** - Physical locations tied to accounts (Column 2)  
3. **Work Orders** - Service work orders tied to locations (Column 3)

### Supporting Entities
4. **Contacts** - Contact information for accounts and service locations
5. **Communication Log** - Communication history tied to contacts
6. **Service Agreements** - Contractual agreements tied to accounts
7. **Financial Data** - Account financial information and history

### Entity Relationships
- Accounts → Service Locations (one-to-many)
- Service Locations → Work Orders (one-to-many)
- Accounts → Contacts (one-to-many)
- Service Locations → Contacts (one-to-many)
- Contacts → Communication Log (one-to-many)
- Accounts → Service Agreements (one-to-many)
- Accounts → Financial Data (one-to-many)

## User Stories & Acceptance Criteria

### Epic 1: Account Management
**As a** business owner  
**I want to** view comprehensive account information instantly  
**So that** I can make informed decisions without screen navigation

**Acceptance Criteria:**
- Account card displays in Column 1 with search/filter
- Selected account reveals: account details, contacts with communication log, service agreements, financial data
- All information loads in <2 seconds

### Epic 2: Service Location Overview
**As an** operations manager  
**I want to** see all service locations for an account  
**So that** I can coordinate service delivery efficiently

**Acceptance Criteria:**
- Column 2 displays all locations for selected account
- Location cards show essential identifying information
- Selected location reveals: location details, contacts with communication log

### Epic 3: Work Order Visibility
**As an** admin handling customer inquiries  
**I want to** see all work orders for a service location  
**So that** I can provide immediate status updates

**Acceptance Criteria:**
- Column 3 displays all work orders for selected location
- Work order cards show status and essential details
- Selected work order reveals complete work order information

## User Workflows

### Primary Use Case 1: Customer Support Call
**Scenario**: "What's the status of my service?"
**Flow**: Search account → Select location → View recent work orders
**Target Time**: <10 seconds (vs current 2-3 minutes)

### Primary Use Case 2: Technical Support
**Scenario**: "What am I supposed to do at this location?"
**Flow**: Find account → Select location → See work order details
**Outcome**: All context visible immediately

### Primary Use Case 3: Account Review
**Scenario**: "Show me everything for ABC Company"
**Flow**: Select account → See all locations → Review all activity
**Outcome**: Complete picture without screen switching

## Target Users

### 1. Business Owners
- **Needs**: High-level oversight of all operations
- **Focus**: Account health and financial data
- **Usage**: Strategic decision making from Master View

### 2. Operations Managers
- **Needs**: Coordinate service delivery across accounts
- **Focus**: Work order completion and issue monitoring
- **Usage**: Support field technicians with information

### 3. Admins
- **Needs**: Manage account data and customer service
- **Focus**: Data integrity and customer inquiries
- **Usage**: Handle customer service requests efficiently

**Note**: Field technicians are excluded from this system design as they access information via mobile application.

## Technical Requirements

### Performance Requirements
- Card views must load instantly
- Information retrieval in <2 seconds
- Responsive performance across all data volumes

### State Management
- Column 1 selection drives Columns 2 & 3
- Clear visual indication of current selections
- Maintain state during session

### Responsive Design
- Three-column layout optimization for desktop
- Tablet adaptation strategy required
- Mobile access not in scope (see Target Users)

### Data Display
- Optimal information density per card
- Progressive disclosure of details
- Consistent card format across columns

## Success Metrics

### Quantitative Goals
1. Information retrieval time: <15 seconds for any query
2. Tech support call reduction: 50%
3. Navigation clicks reduced by hundreds per day per user

### Qualitative Goals
1. Zero navigation to other screens for common tasks
2. User satisfaction: "I can't work without this"
3. Complete workflow containment within Master View

## Technical Considerations

### Primary Constraints
- UX design complexity over technical implementation
- Data display strategy requires careful planning
- State management across three interdependent columns

### Implementation Risks
- Column interdependency complexity
- Performance with large datasets
- User adaptation to new workflow paradigm

## Dependencies

### Internal
- Account data API
- Service location data access
- Work order management system
- User authentication and permissions

### External
- None identified

## Timeline & Milestones

*To be defined during implementation planning*

## Appendix

### Related Documents
- User workflow analysis
- Current system navigation audit
- Performance benchmarks

---

*This PRD serves as the north star for all Master View feature development and user stories.*