# Product Requirements Document (PRD)

---

## 1. The Core Context

### Problem Statement

For **BBB**, who struggle with basic service delivery workflows because they are an entirely paper-based company, our product provides the basis of their digital transformation, which results in increased process efficiencies and provides (for the first time) the ability to make business decisions based on actual data.

### High-Level Goals & Metrics (with Measurement Notes)

1. **Digitize and centralize Customer Records**

   - **Metric:** Percentage of active customer records entered into the digital system.
   - **Measurement Notes:** Measured by count of active customer records stored in the system vs estimated total active customers (initially from paper records).

2. **Digitize and automate Work Order management**

   - **Metric:** Percentage of work orders created, tracked, and closed via the digital system.
   - **Measurement Notes:** Measured by count of work orders processed through digital workflow vs total number of work orders executed.

3. **Implement digital Invoicing process**

   - **Metric:** Percentage of invoices generated and sent via the digital system.
   - **Measurement Notes:** Measured by count of invoices generated and sent through system vs total number of invoices issued.

4. **Enable digital Scheduling of field work**

   - **Metric:** Percentage of scheduled jobs managed via digital scheduling.
   - **Measurement Notes:** Measured by count of scheduled jobs created and tracked in scheduling module vs total scheduled jobs.

5. **Provide operational Performance Dashboards for decision making**

   - **Metric:** Number of distinct dashboards live and used by management.
   - **Measurement Notes:** Measured by count of active dashboards with user access logs indicating regular use (weekly/monthly checks).

## 2. User Personas

### Technician

- **Primary Objective:** Locate the service site, review and complete the assigned work order, take field notes as necessary, and invoice the customer if required.

### Admin

- **Primary Objective:** Create and maintain accurate customer records, ensure service agreements are up to date, and assist with scheduling as needed.

### Owner

- **Primary Objective:** Ensure the business runs efficiently, make informed business decisions based on process metrics, and fill in any role as needed to support operations.

## 3. Data Model (Conceptual)

### Customer

- Customer ID
- Name
- Company Name (if applicable)
- Primary Phone Number
- Secondary Phone Number
- Preferred Contact Method (Phone, Text, Email)
- Email Address(es)
- Billing Address
- Notes / Special Instructions
- Account Status (Active, Inactive, Archived)

### Service Location

- Location ID
- Customer ID (link to Customer)
- Service Address
- Location Type (Residential, Commercial, Other)
- Geographic Area (short text / picklist)
- Notes / Special Instructions
- Status (Active, Inactive)

### Service Location Contact

- Contact ID
- Location ID (link to Service Location)
- Name
- Phone Number(s)
- Email Address
- Role (Tenant, Property Manager, On-Site Contact, Other)
- Preferred Contact Method (Phone, Text, Email)

## 4. Functional Requirements (The Hierarchy)

### Module 1: Customer Management

#### Features

1. Create new Customer record
2. View and edit Customer record
3. Archive/deactivate Customer record
4. Search & filter Customer records
5. Add notes or special instructions to Customer record
6. View Work Order History by Service Location

#### User Stories & Acceptance Criteria

##### Feature 1: Create new Customer record

**User Story:** As an Admin, I want to create a new Customer record so that the business can track and manage the customer’s service, billing, and communication information.

**Acceptance Criteria:**

```gherkin
Given I am an Admin user
When I navigate to the 'Create New Customer' screen and enter required fields (Name, Phone, Billing Address, etc.)
Then the system shall save the new Customer record and display it in the Customer list
```

```gherkin
Given I am creating a new Customer
When I leave required fields blank and attempt to save
Then the system shall display validation errors and prevent saving until required fields are completed
```

```gherkin
Given I am creating a new Customer
When I enter a Name + Phone Number combination that matches an existing Active Customer
Then the system shall display a duplicate warning and prompt me to confirm before proceeding
```

##### Feature 2: View and edit Customer record

**User Story:** As an Admin, I want to view and edit an existing Customer record so that I can keep customer information accurate and up to date.

**Acceptance Criteria:**

```gherkin
Given I am an Admin
When I select a Customer from the Customer list
Then the system shall display the full Customer record with all editable fields and notes
```

```gherkin
Given I am viewing a Customer record
When I edit one or more fields and save the record
Then the system shall update the Customer record and display a confirmation message
```

##### Feature 3: Archive/deactivate Customer record

**User Story:** As an Admin, I want to archive a Customer record so that it is no longer active but retained for historical purposes.

**Acceptance Criteria:**

```gherkin
Given I am viewing an Active Customer record
When I select 'Archive Customer' and confirm
Then the system shall set the Customer status to 'Archived' and remove it from Active Customer lists
```

```gherkin
Given I am an Admin
When I filter the Customer list by status = Archived
Then the system shall display all Archived Customers
```

##### Feature 4: Search & filter Customer records

**User Story:** As an Admin, I want to search and filter Customer records so that I can quickly find the Customer I need.

**Acceptance Criteria:**

```gherkin
Given I am on the Customer list screen
When I enter a partial Name or Phone Number in the search box
Then the system shall display matching Customer records
```

```gherkin
Given I am on the Customer list screen
When I select a filter for Customer Status (Active, Inactive, Archived)
Then the system shall display only Customers matching the selected Status
```

##### Feature 5: Add notes or special instructions

**User Story:** As an Admin, I want to add notes or special instructions to a Customer record so that Technicians and Admins can be aware of important customer-specific information.

**Acceptance Criteria:**

```gherkin
Given I am viewing a Customer record
When I enter text in the Notes field and save
Then the system shall update the Customer record to include the new Notes
```

```gherkin
Given I am viewing a Customer record
When the page loads
Then the Notes field shall be displayed and editable
```

##### Feature 6: View Work Order History by Service Location

**User Story:** As an Admin or Owner, I want to view a Customer’s Work Order history grouped by Service Location so that I can understand past service patterns and issues.

**Acceptance Criteria:**

```gherkin
Given I am viewing a Customer record
When I select 'View Work Order History'
Then the system shall display a list of Work Orders grouped by Service Location
```

```gherkin
Given I am viewing Work Order History for a Customer
When I apply filters (Date Range, Work Order Status)
Then the system shall display only matching Work Orders grouped by Service Location
```

### Module 2: Service Location & Contact Management

#### Features

1. Create new Service Location linked to Customer
2. View and edit Service Location record
3. Archive/deactivate Service Location
4. Add notes or special instructions to Service Location
5. Create and manage Service Location Contact(s)
6. View list of Service Locations for a Customer
7. View list of Service Location Contacts per Location

#### User Stories & Acceptance Criteria

##### Feature 1: Create new Service Location linked to Customer

**User Story:** As an Admin, I want to create a new Service Location linked to an existing Customer so that I can manage service at different locations for that Customer.

**Acceptance Criteria:**

```gherkin
Given I am viewing a Customer record
When I select 'Add Service Location' and enter required fields
Then the system shall create a new Service Location linked to that Customer
```

```gherkin
Given I am adding a Service Location
When I leave required fields blank and attempt to save
Then the system shall display validation errors and prevent saving
```

##### Feature 2: View and edit Service Location record

**User Story:** As an Admin, I want to view and edit Service Location records so that I can keep location information current and accurate.

**Acceptance Criteria:**

```gherkin
Given I am viewing a Customer record
When I select a Service Location
Then the system shall display the Service Location details and Contacts
```

```gherkin
Given I am viewing a Service Location
When I edit one or more fields and save
Then the system shall update the Service Location record and display a confirmation message
```

##### Feature 3: Archive/deactivate Service Location

**User Story:** As an Admin, I want to archive a Service Location so that it is no longer used but retained for historical records.

**Acceptance Criteria:**

```gherkin
Given I am viewing an Active Service Location
When I select 'Archive Service Location' and confirm
Then the system shall set the Service Location status to 'Inactive' or 'Archived' and remove it from Active lists
```

```gherkin
Given I am viewing a Customer’s Service Locations
When I apply filter for Status = Archived
Then the system shall display only Archived Service Locations
```

##### Feature 4: Add notes or special instructions to Service Location

**User Story:** As an Admin, I want to add notes or special instructions to a Service Location so that Technicians are aware of any location-specific considerations.

**Acceptance Criteria:**

```gherkin
Given I am viewing a Service Location
When I enter text in the Notes field and save
Then the system shall update the Notes and display them on the Service Location record
```

```gherkin
Given a Technician is assigned to a Work Order for this Service Location
When the Technician views the Work Order
Then the Notes from the Service Location shall be displayed
```

##### Feature 5: Create and manage Service Location Contact(s)

**User Story:** As an Admin, I want to create and manage one or more Contacts for each Service Location so that we can communicate with the correct person for each location.

**Acceptance Criteria:**

```gherkin
Given I am viewing a Service Location
When I select 'Add Contact' and enter required fields
Then the system shall add the Contact linked to that Service Location
```

```gherkin
Given I am viewing a Service Location Contact
When I edit one or more fields and save
Then the system shall update the Contact record
```

```gherkin
Given I am viewing a Service Location Contact
When I select 'Archive Contact' and confirm
Then the system shall mark the Contact as Archived and remove it from Active lists
```

##### Feature 6: View list of Service Locations for a Customer

**User Story:** As an Admin, I want to view a list of all Service Locations for a Customer so that I can quickly manage their various locations.

**Acceptance Criteria:**

```gherkin
Given I am viewing a Customer record
When I select 'Service Locations'
Then the system shall display a list of all Service Locations linked to that Customer
```

##### Feature 7: View list of Service Location Contacts per Location

**User Story:** As an Admin, I want to view all Contacts for a Service Location so that I can quickly find and communicate with the correct person.

**Acceptance Criteria:**

```gherkin
Given I am viewing a Service Location
When I select 'Contacts'
Then the system shall display a list of all Contacts linked to that Service Location
```

---

# End of PRD (Modules 1 & 2)

---



Please combine this PRD into a single MD file?

