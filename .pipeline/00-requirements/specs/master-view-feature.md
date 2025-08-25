# Master View Feature Definition
**Version**: 1.0  
**Created**: August 2025  
**Module**: Accounts

## 1. Vision

Provide a **'single pane of glass'** to enable users to access ALL account data from one location. The Master View allows users to see all current information without navigating to several different modules or screens, which is the 'traditional' approach.

## 2. User Value

This will save **hundreds of navigational clicks per day**, and make it easy for users to find the information they are looking for quickly, whether answering customer queries or providing support to technicians on their routes.

## 3. Three-Column Concept

### How It Works:
- **Column 1**: List of accounts with super-efficient card view
  - Search and filtering capabilities
  - Quick limit/find accounts
  - Selection drives Columns 2 & 3

- **Column 2**: Service Locations for selected account
  - All locations related to the account
  - Card format for quick scanning
  - Selection drives Column 3

- **Column 3**: Work Orders for selected service location
  - All work orders for the location
  - Card format for consistency
  - Full detail access on selection

### The Card Experience Philosophy:
**"Everything happens based on the record the user selects. They see what they want, when they want, and nothing else."**

## 4. Information Architecture

### Account Card (Column 1) - Selected State Shows:
a. Account details not viewable from the card  
b. View account contacts, along with communication log for each  
c. Service agreement(s) for that account  
d. Account financial data  

### Service Location Card (Column 2) - Selected State Shows:
a. Service location details not viewable from the card  
b. View service location contacts, along with communication log for each  

### Work Order Card (Column 3) - Selected State Shows:
a. All work order details not viewable from the card  

## 5. User Workflows

### Primary Use Cases:
1. **Customer Call**: "What's the status of my service?"
   - Search account → Select location → View recent work orders
   - Time: <10 seconds vs 2-3 minutes traditional

2. **Tech Support**: "What am I supposed to do at this location?"
   - Find account → Select location → See work order details
   - All context visible immediately

3. **Account Review**: "Show me everything for ABC Company"
   - Select account → See all locations → Review all activity
   - Complete picture without screen switching

## 6. Technical Constraints

The biggest constraint is more UX than technical. This is not a complex system, but the data display approach is definitely different and must be carefully thought through.

### Key Considerations:
- **State Management**: What's selected in Column 1 drives 2 & 3
- **Performance**: Cards must load instantly
- **Responsive Design**: How does 3-column work on tablets?
- **Data Density**: Show enough but not too much
- **Selection Clarity**: User must always know what's selected

## Success Criteria

The Master View succeeds when:
1. Users can find any information in <15 seconds
2. Zero navigation to other screens for common tasks
3. Tech support calls reduce by 50%
4. Users say "I can't work without this"

## 7. Target Personas

This desktop-only application serves three primary personas:

### 1. Business Owners
- Need high-level oversight of all operations
- Focus on account health and financial data
- Make strategic decisions from the Master View

### 2. Operations Managers
- Coordinate service delivery across accounts
- Monitor work order completion and issues
- Support field technicians with information

### 3. Admins
- Manage account data and relationships
- Handle customer service inquiries
- Maintain system data integrity

**Important Note**: Field technicians will NOT have access to this part of the system. All technician access will be via mobile application. They are NOT part of our design criteria for the Accounts, Operations, or Administration modules.

---

*This is our north star for all Master View user stories.*