// CONCEPT LINE: Mock Data - No types needed!
// This is for rapid validation only

export const MOCK_LOCATIONS = [
  {
    id: 1,
    name: "Downtown Service Center",
    address: "123 Main St, Springfield, IL 62701",
    status: "active",
    accountName: "Springfield Municipal",
    accountId: 101,
    contactCount: 3,
    contacts: ["John Smith", "Jane Doe", "Bob Wilson"],
    lastService: "2 days ago",
    upcomingJobs: 5,
    coordinates: { lat: 39.7817, lng: -89.6501 }
  },
  {
    id: 2,
    name: "North Side Facility",
    address: "456 Oak Ave, Springfield, IL 62702",
    status: "active",
    accountName: "Regional Hospital",
    accountId: 102,
    contactCount: 7,
    contacts: ["Dr. Sarah Johnson", "Mike Brown"],
    lastService: "Today",
    upcomingJobs: 12,
    coordinates: { lat: 39.8167, lng: -89.6435 }
  },
  {
    id: 3,
    name: "Old Warehouse",
    address: "789 Industrial Blvd, Springfield, IL 62703",
    status: "inactive",
    accountName: "ABC Manufacturing",
    accountId: 103,
    contactCount: 1,
    contacts: ["Tom Anderson"],
    lastService: "6 months ago",
    upcomingJobs: 0,
    coordinates: { lat: 39.7684, lng: -89.6981 }
  },
  {
    id: 4,
    name: "Tech Campus Building A",
    address: "321 Innovation Dr, Springfield, IL 62704",
    status: "active",
    accountName: "TechCorp Industries",
    accountId: 104,
    contactCount: 5,
    contacts: ["Alice Chen", "David Park"],
    lastService: "1 week ago",
    upcomingJobs: 8,
    coordinates: { lat: 39.7956, lng: -89.6789 }
  },
  {
    id: 5,
    name: "Riverside Plaza",
    address: "555 River Rd, Springfield, IL 62705",
    status: "active",
    accountName: "Riverside Management",
    accountId: 105,
    contactCount: 4,
    contacts: ["Carol White", "Jim Black"],
    lastService: "3 days ago",
    upcomingJobs: 3,
    coordinates: { lat: 39.7723, lng: -89.6234 }
  },
  {
    id: 6,
    name: "Airport Hangar 7",
    address: "100 Aviation Way, Springfield, IL 62706",
    status: "active",
    accountName: "Capital City Airport",
    accountId: 106,
    contactCount: 2,
    contacts: ["Captain Rogers", "Lisa Flight"],
    lastService: "2 weeks ago",
    upcomingJobs: 2,
    coordinates: { lat: 39.8445, lng: -89.6778 }
  },
  {
    id: 7,
    name: "University Science Center",
    address: "900 College Ave, Springfield, IL 62707",
    status: "active",
    accountName: "State University",
    accountId: 107,
    contactCount: 8,
    contacts: ["Prof. Williams", "Dean Martinez"],
    lastService: "Yesterday",
    upcomingJobs: 15,
    coordinates: { lat: 39.7312, lng: -89.6167 }
  },
  {
    id: 8,
    name: "Abandoned Mall",
    address: "2000 Commerce St, Springfield, IL 62708",
    status: "inactive",
    accountName: "Legacy Properties",
    accountId: 108,
    contactCount: 0,
    contacts: [],
    lastService: "1 year ago",
    upcomingJobs: 0,
    coordinates: { lat: 39.7589, lng: -89.7012 }
  }
];

export const MOCK_ACCOUNTS = [
  { id: 101, name: "Springfield Municipal", locationCount: 1 },
  { id: 102, name: "Regional Hospital", locationCount: 1 },
  { id: 103, name: "ABC Manufacturing", locationCount: 1 },
  { id: 104, name: "TechCorp Industries", locationCount: 1 },
  { id: 105, name: "Riverside Management", locationCount: 1 },
  { id: 106, name: "Capital City Airport", locationCount: 1 },
  { id: 107, name: "State University", locationCount: 1 },
  { id: 108, name: "Legacy Properties", locationCount: 1 }
];

// Debug helper - concept mode encourages console.log!
console.log("📍 Mock Locations Loaded:", MOCK_LOCATIONS.length);
console.log("🏢 Mock Accounts Loaded:", MOCK_ACCOUNTS.length);