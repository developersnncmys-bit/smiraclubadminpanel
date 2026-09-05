/**
 * Users and roles, built to the client's sheet: who can sign in, what each
 * role may see and do, who reports to whom, what needs approving, and every
 * login and change the panel has recorded.
 *
 * The principle the sheet ends on, and the one this module follows:
 * User → Role → Team → Branch → Permissions → Data access → Approval rights
 * → Performance.
 */

/** The colours the live strip uses, and what each one means. */
export const liveStates = [
  { key: 'Online', dot: 'bg-emerald-500', tone: 'green' },
  { key: 'Away', dot: 'bg-amber-400', tone: 'amber' },
  { key: 'Offline', dot: 'bg-rose-500', tone: 'rose' },
  { key: 'On call', dot: 'bg-sky-500', tone: 'sky' },
  { key: 'Customer meeting', dot: 'bg-violet-500', tone: 'violet' },
  { key: 'Follow-up', dot: 'bg-orange-500', tone: 'amber' },
  { key: 'On leave', dot: 'bg-ink-900', tone: 'slate' },
];

/** What a role can be allowed to do with a module. */
export const permissionLevels = [
  'View',
  'Create',
  'Edit',
  'Delete',
  'Approve',
  'Financial access',
  'Export',
  'Assign',
  'Restricted',
];

/** How far a role can see. */
export const dataScopes = ['Own', 'Own team', 'Own branch', 'All'];

/** What a role may sign off on. */
export const approvalRights = ['Membership', 'Refund', 'Discount', 'Payment'];

/** The nine modules a role is switched on or off against. */
export const permissionModules = [
  'CRM',
  'Membership',
  'Booking',
  'Finance',
  'Customer',
  'Inventory',
  'Vendors',
  'WhatsApp',
  'Reports',
];

/** Every screen the role system controls, and what sits inside it. */
export const moduleAccess = {
  CRM: [
    'Leads',
    'Lead allocation',
    'Follow-ups',
    'Calls',
    'Presentations',
    'Visits',
    'Sales pipeline',
    'Lost leads',
    'Customer conversion',
  ],
  Membership: [
    'Membership plans',
    'Membership sales',
    'Activation',
    'Membership validity',
    'Benefits',
    'Upgrades',
    'Renewals',
    'Cancellation',
  ],
  Booking: [
    'Hotel booking',
    'Villa booking',
    'Package booking',
    'Transport',
    'International trips',
    'Domestic trips',
    'Booking requests',
    'Confirmations',
    'Rescheduling',
    'Cancellation',
  ],
  'Travel inventory': [
    'Hotels',
    'Villas',
    'Packages',
    'Rooms',
    'Rates',
    'Availability',
    'Blackout dates',
    'B2B rates',
    'Contracts',
  ],
  Finance: [
    'Payments',
    'Pending payments',
    'Refunds',
    'Receipts',
    'Invoices',
    'Commission',
    'Revenue',
    'Outstanding amounts',
  ],
  Customer: [
    'Customer profile',
    'Family members',
    'Travel history',
    'Booking history',
    'Membership history',
    'Preferences',
    'Complaints',
    'Documents',
  ],
  Marketing: [
    'Offers',
    'Promotions',
    'Campaigns',
    'Coupons',
    'Lead sources',
    'WhatsApp campaigns',
  ],
  Rewards: [
    'Gift allocation',
    'Refer and earn',
    'Booking milestones',
    'Coupons',
    'Travel gifts',
    'Reward redemption',
  ],
  Partner: ['All partner details'],
};

/**
 * The roles the agency runs on. `can` holds the permission levels the role
 * carries on each module it is allowed near.
 */
export const roles = [
  {
    id: 'ROL-01',
    name: 'Owner / Super admin',
    department: 'Management',
    reportsTo: '—',
    dashboard: 'Business overview',
    scope: 'All',
    approvals: ['Membership', 'Refund', 'Discount', 'Payment'],
    modules: ['CRM', 'Membership', 'Booking', 'Finance', 'Customer', 'Inventory', 'Vendors', 'WhatsApp', 'Reports'],
    can: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Financial access', 'Export', 'Assign'],
  },
  {
    id: 'ROL-02',
    name: 'Business head',
    department: 'Management',
    reportsTo: 'Owner / Super admin',
    dashboard: 'Business overview',
    scope: 'All',
    approvals: ['Membership', 'Refund', 'Discount'],
    modules: ['CRM', 'Membership', 'Booking', 'Finance', 'Customer', 'WhatsApp', 'Reports'],
    can: ['View', 'Create', 'Edit', 'Approve', 'Financial access', 'Export', 'Assign'],
  },
  {
    id: 'ROL-03',
    name: 'Branch business manager',
    department: 'Sales',
    reportsTo: 'Business head',
    dashboard: 'Sales dashboard',
    scope: 'Own branch',
    approvals: ['Membership', 'Discount'],
    modules: ['CRM', 'Membership', 'Booking', 'Customer', 'WhatsApp', 'Reports'],
    can: ['View', 'Create', 'Edit', 'Approve', 'Export', 'Assign'],
  },
  {
    id: 'ROL-04',
    name: 'Assistant branch manager',
    department: 'Sales',
    reportsTo: 'Branch business manager',
    dashboard: 'Sales dashboard',
    scope: 'Own team',
    approvals: ['Discount'],
    modules: ['CRM', 'Membership', 'Booking', 'Customer', 'WhatsApp'],
    can: ['View', 'Create', 'Edit', 'Assign'],
  },
  {
    id: 'ROL-05',
    name: 'Sales head',
    department: 'Sales',
    reportsTo: 'Business head',
    dashboard: 'Sales dashboard',
    scope: 'All',
    approvals: ['Discount'],
    modules: ['CRM', 'Membership', 'Booking', 'Customer', 'Reports'],
    can: ['View', 'Create', 'Edit', 'Approve', 'Export', 'Assign'],
  },
  {
    id: 'ROL-06',
    name: 'Travel expert',
    department: 'Sales',
    reportsTo: 'Assistant branch manager',
    dashboard: 'My sales dashboard',
    scope: 'Own',
    approvals: [],
    modules: ['CRM', 'Membership', 'Booking', 'Customer', 'WhatsApp'],
    can: ['View', 'Create', 'Edit'],
  },
  {
    id: 'ROL-07',
    name: 'Field officer',
    department: 'Field team',
    reportsTo: 'Travel expert',
    dashboard: 'My sales dashboard',
    scope: 'Own',
    approvals: [],
    modules: ['CRM', 'Customer'],
    can: ['View', 'Edit'],
  },
  {
    id: 'ROL-08',
    name: 'Operations manager',
    department: 'Operations',
    reportsTo: 'Business head',
    dashboard: 'Booking dashboard',
    scope: 'All',
    approvals: ['Membership'],
    modules: ['Booking', 'Inventory', 'Vendors', 'Customer', 'Reports'],
    can: ['View', 'Create', 'Edit', 'Approve', 'Export', 'Assign'],
  },
  {
    id: 'ROL-09',
    name: 'Finance',
    department: 'Accounts',
    reportsTo: 'Business head',
    dashboard: 'Finance dashboard',
    scope: 'All',
    approvals: ['Refund', 'Payment'],
    modules: ['Finance', 'Booking', 'Membership', 'Reports'],
    can: ['View', 'Edit', 'Approve', 'Financial access', 'Export'],
  },
  {
    id: 'ROL-10',
    name: 'Support executive',
    department: 'Support',
    reportsTo: 'Operations manager',
    dashboard: 'My sales dashboard',
    scope: 'Own team',
    approvals: [],
    modules: ['Customer', 'Booking', 'WhatsApp'],
    can: ['View', 'Create', 'Edit'],
  },
];

/** Which role each of the desk's people carries. */
export const roleOf = {
  'USR-02': 'Assistant branch manager',
  'USR-04': 'Travel expert',
  'USR-05': 'Travel expert',
  'USR-06': 'Travel expert',
  'USR-07': 'Branch business manager',
  'USR-08': 'Field officer',
  'USR-09': 'Operations manager',
  'USR-10': 'Owner / Super admin',
  'USR-11': 'Finance',
  'USR-12': 'Travel expert',
};

/**
 * The employment and login record the sheet's "Add new user" form collects,
 * kept beside the team rather than inside them.
 */
export const accounts = {
  'USR-02': {
    joined: '12 Feb 2023', designation: 'Assistant Branch Manager', employment: 'Permanent',
    aadhaar: '**** **** 4471', family: ['Aditi Kulkarni (spouse)', 'Ira Kulkarni (daughter)'],
    username: 'sneha@smiraclub.com', twoFactor: true, webAccess: true, mobileAccess: true,
    devices: 'Office laptop, personal mobile', lastLogin: '05 Sep 2026, 09:04 am',
    loginTime: '09:04 am', logoutTime: '—', ip: '103.21.58.14', browser: 'Chrome on Windows',
    failedLogins: 0, sessions: 2, leadSources: ['Instagram', 'Referral'], territory: 'Mumbai west',
    segment: 'Premium families', products: ['Gold Voyager', 'Platinum Elite'], categories: ['Hotel', 'Package'],
  },
  'USR-04': {
    joined: '03 Jul 2024', designation: 'Travel Consultant', employment: 'Permanent',
    aadhaar: '**** **** 9932', family: ['Meera Menon (spouse)'],
    username: 'kabir@smiraclub.com', twoFactor: false, webAccess: true, mobileAccess: true,
    devices: 'Office desktop', lastLogin: '05 Sep 2026, 09:22 am',
    loginTime: '09:22 am', logoutTime: '—', ip: '103.21.58.19', browser: 'Chrome on Windows',
    failedLogins: 1, sessions: 1, leadSources: ['Website', 'Google Ads'], territory: 'Mumbai central',
    segment: 'First-time travellers', products: ['Silver Explorer', 'Gold Voyager'], categories: ['Package'],
  },
  'USR-05': {
    joined: '19 Jan 2025', designation: 'Travel Consultant', employment: 'Permanent',
    aadhaar: '**** **** 2210', family: ['Sunita Sharma (mother)'],
    username: 'rahul@smiraclub.com', twoFactor: false, webAccess: true, mobileAccess: true,
    devices: 'Office desktop, personal mobile', lastLogin: '05 Sep 2026, 08:58 am',
    loginTime: '08:58 am', logoutTime: '—', ip: '103.21.58.22', browser: 'Edge on Windows',
    failedLogins: 0, sessions: 1, leadSources: ['Instagram', 'Campaign'], territory: 'Thane',
    segment: 'Young couples', products: ['Silver Explorer'], categories: ['Hotel'],
  },
  'USR-06': {
    joined: '02 Jun 2025', designation: 'Travel Consultant', employment: 'Probation',
    aadhaar: '**** **** 6654', family: [],
    username: 'amit@smiraclub.com', twoFactor: false, webAccess: true, mobileAccess: false,
    devices: 'Office desktop', lastLogin: '04 Sep 2026, 06:40 pm',
    loginTime: '10:10 am', logoutTime: '06:40 pm', ip: '103.21.58.31', browser: 'Chrome on Windows',
    failedLogins: 3, sessions: 0, leadSources: ['Website'], territory: 'Pune east',
    segment: 'Walk-ins', products: ['Silver Explorer'], categories: ['Hotel'],
  },
  'USR-07': {
    joined: '08 Aug 2022', designation: 'Branch Business Manager', employment: 'Permanent',
    aadhaar: '**** **** 1187', family: ['Rohit Nair (spouse)', 'Kiara Nair (daughter)', 'Vivaan Nair (son)'],
    username: 'priya@smiraclub.com', twoFactor: true, webAccess: true, mobileAccess: true,
    devices: 'Office laptop, personal mobile', lastLogin: '05 Sep 2026, 08:41 am',
    loginTime: '08:41 am', logoutTime: '—', ip: '49.36.180.7', browser: 'Safari on macOS',
    failedLogins: 0, sessions: 3, leadSources: ['Referral', 'Existing member'], territory: 'Pune',
    segment: 'Premium families', products: ['Platinum Elite'], categories: ['Package', 'International trip'],
  },
  'USR-08': {
    joined: '15 Mar 2025', designation: 'Field Officer', employment: 'Permanent',
    aadhaar: '**** **** 8890', family: ['Nasreen Shaikh (spouse)'],
    username: 'imran@smiraclub.com', twoFactor: false, webAccess: false, mobileAccess: true,
    devices: 'Company mobile only', lastLogin: '05 Sep 2026, 09:35 am',
    loginTime: '09:35 am', logoutTime: '—', ip: '106.51.22.90', browser: 'Chrome on Android',
    failedLogins: 0, sessions: 1, leadSources: ['Field team'], territory: 'Mumbai suburbs',
    segment: 'Home visits', products: [], categories: [],
  },
  'USR-09': {
    joined: '21 Nov 2023', designation: 'Visa and Documentation', employment: 'Permanent',
    aadhaar: '**** **** 3345', family: ['Anand Rao (spouse)'],
    username: 'divya@smiraclub.com', twoFactor: true, webAccess: true, mobileAccess: true,
    devices: 'Office desktop', lastLogin: '05 Sep 2026, 09:12 am',
    loginTime: '09:12 am', logoutTime: '—', ip: '103.21.58.44', browser: 'Chrome on Windows',
    failedLogins: 0, sessions: 1, leadSources: [], territory: 'All branches',
    segment: 'Documentation', products: [], categories: ['International trip'],
  },
  'USR-10': {
    joined: '01 Apr 2019', designation: 'Owner', employment: 'Permanent',
    aadhaar: '**** **** 0021', family: ['Anjali Joshi (spouse)', 'Arya Joshi (daughter)'],
    username: 'vikram@smiraclub.com', twoFactor: true, webAccess: true, mobileAccess: true,
    devices: 'Office laptop, personal mobile, tablet', lastLogin: '05 Sep 2026, 07:50 am',
    loginTime: '07:50 am', logoutTime: '—', ip: '49.36.180.2', browser: 'Safari on macOS',
    failedLogins: 0, sessions: 4, leadSources: [], territory: 'All branches',
    segment: 'All', products: ['Silver Explorer', 'Gold Voyager', 'Platinum Elite'],
    categories: ['Hotel', 'Villa', 'Package', 'Transport', 'International trip'],
  },
  'USR-11': {
    joined: '05 Sep 2023', designation: 'Accounts Executive', employment: 'Permanent',
    aadhaar: '**** **** 7712', family: ['Ramesh Pillai (father)'],
    username: 'neha@smiraclub.com', twoFactor: true, webAccess: true, mobileAccess: false,
    devices: 'Office desktop', lastLogin: '04 Sep 2026, 07:05 pm',
    loginTime: '09:30 am', logoutTime: '07:05 pm', ip: '103.21.58.51', browser: 'Chrome on Windows',
    failedLogins: 0, sessions: 0, leadSources: [], territory: 'All branches',
    segment: 'Collections', products: [], categories: [],
  },
  'USR-12': {
    joined: '11 Aug 2026', designation: 'Travel Consultant', employment: 'Probation',
    aadhaar: '**** **** 5567', family: [],
    username: 'farhan@smiraclub.com', twoFactor: false, webAccess: true, mobileAccess: true,
    devices: 'Office desktop', lastLogin: '02 Sep 2026, 05:20 pm',
    loginTime: '10:00 am', logoutTime: '05:20 pm', ip: '49.36.180.19', browser: 'Chrome on Windows',
    failedLogins: 2, sessions: 0, leadSources: ['Website'], territory: 'Pune west',
    segment: 'Walk-ins', products: ['Silver Explorer'], categories: ['Hotel'],
  },
};

/** Not every employee should see everything — the sheet calls this critical. */
export const visibilityRules = [
  {
    role: 'Frontliner',
    sees: ['Assigned leads', 'Their own calls', 'Their own follow-ups'],
    hidden: ["Other teams' leads", 'Full payment details', 'Branch revenue'],
  },
  {
    role: 'Travel expert',
    sees: ['Assigned customers', 'Their presentations', 'Their membership sales'],
    hidden: ["Other experts' customers", 'Commission of others', 'Partner contracts'],
  },
  {
    role: 'Branch manager',
    sees: ['The entire branch', 'Branch leads', 'Branch sales', 'Branch collections'],
    hidden: ['Other branches', 'Company profit and loss'],
  },
  {
    role: 'Business head',
    sees: ['All branches', 'All sales', 'All revenue', 'Profit and margins'],
    hidden: ['Nothing — the whole business is visible'],
  },
];

/** Who reports to whom, top to bottom. */
export const hierarchy = [
  'Business head',
  'Branch business manager',
  'Assistant branch manager',
  'Travel expert',
  'Field officer',
];

/** The actions that cannot happen without someone signing them off. */
export const approvalFlows = [
  { area: 'Membership', flow: 'Salesperson creates a membership', approver: 'Manager approves' },
  { area: 'Discount', flow: 'Employee requests a special discount', approver: 'Manager approves' },
  { area: 'Refund', flow: 'Booking refund requested', approver: 'Finance or manager approves' },
  { area: 'Booking', flow: 'Booking created', approver: 'Operations confirms' },
  { area: 'Inventory', flow: 'New hotel or rate added', approver: 'Inventory manager approves' },
  { area: 'Reward', flow: 'Special reward issued', approver: 'Manager approves' },
];

/** What is actually waiting on someone right now. */
export const pendingApprovals = [
  {
    id: 'APR-08', area: 'Discount', what: '12% off the Bali package for the Kapoor party',
    raisedBy: 'Priya', approver: 'Vikram Joshi', raised: '05 Sep 2026, 09:40 am', value: 21600, status: 'Waiting',
  },
  {
    id: 'APR-07', area: 'Membership', what: 'Platinum Elite for Ananya Deshmukh',
    raisedBy: 'Sneha', approver: 'Priya Nair', raised: '04 Sep 2026, 04:15 pm', value: 35396, status: 'Waiting',
  },
  {
    id: 'APR-06', area: 'Refund', what: 'Refund on BKG-8821 after the room downgrade',
    raisedBy: 'Kabir', approver: 'Neha Pillai', raised: '04 Sep 2026, 11:20 am', value: 18000, status: 'Waiting',
  },
  {
    id: 'APR-05', area: 'Booking', what: 'BKG-8824 needs an operations confirmation',
    raisedBy: 'Kabir', approver: 'Divya Rao', raised: '03 Sep 2026, 06:05 pm', value: 186000, status: 'Approved',
  },
  {
    id: 'APR-04', area: 'Inventory', what: 'Ayana Resort 2027 contract rates',
    raisedBy: 'Divya', approver: 'Vikram Joshi', raised: '02 Sep 2026, 02:30 pm', value: 0, status: 'Approved',
  },
  {
    id: 'APR-03', area: 'Reward', what: 'Anniversary gift for Rohan Bhatt outside the plan',
    raisedBy: 'Sneha', approver: 'Priya Nair', raised: '01 Sep 2026, 12:10 pm', value: 4500, status: 'Rejected',
  },
];

/** The dashboard each role opens on — nobody gets the same one. */
export const roleDashboards = [
  {
    role: 'Owner / Super admin',
    name: 'Business overview',
    tiles: ['Total revenue', 'Membership sales', 'Active members', 'Bookings', 'Pending payments', 'Profit', 'Branch performance', 'Sales performance'],
  },
  {
    role: 'Sales head',
    name: 'Sales dashboard',
    tiles: ['Leads', 'Presentations', 'Visits', 'Closings', 'Conversion', 'Revenue', 'Team ranking', 'Target vs achievement'],
  },
  {
    role: 'Travel expert',
    name: 'My sales dashboard',
    tiles: ['My leads', "Today's follow-ups", 'Presentations', 'Visits', 'Membership sales', 'Pending customers', 'My revenue'],
  },
  {
    role: 'Operations manager',
    name: 'Booking dashboard',
    tiles: ['New requests', 'Pending confirmations', "Today's check-ins", 'Upcoming trips', 'Cancellations', 'Rescheduling', 'Supplier issues'],
  },
  {
    role: 'Finance',
    name: 'Finance dashboard',
    tiles: ['Collections', 'Pending payments', 'Refunds', 'Revenue', 'Outstanding', 'Invoices'],
  },
];

/** Every change the panel has recorded, newest first. */
export const auditLog = [
  { id: 'LOG-31', at: '05 Sep 2026, 09:42 am', who: 'Priya Nair', kind: 'Approval', what: 'Requested a 12% discount on the Kapoor package' },
  { id: 'LOG-30', at: '05 Sep 2026, 09:22 am', who: 'Kabir Menon', kind: 'Login', what: 'Signed in from 103.21.58.19' },
  { id: 'LOG-29', at: '05 Sep 2026, 09:04 am', who: 'Sneha Kulkarni', kind: 'Login', what: 'Signed in from 103.21.58.14' },
  { id: 'LOG-28', at: '04 Sep 2026, 07:05 pm', who: 'Neha Pillai', kind: 'Finance', what: 'Marked INV-2041 as paid' },
  { id: 'LOG-27', at: '04 Sep 2026, 06:44 pm', who: 'Amit Verma', kind: 'Security', what: 'Three failed sign-in attempts' },
  { id: 'LOG-26', at: '04 Sep 2026, 04:15 pm', who: 'Sneha Kulkarni', kind: 'Membership', what: 'Created a Platinum Elite membership for Ananya Deshmukh' },
  { id: 'LOG-25', at: '04 Sep 2026, 11:20 am', who: 'Kabir Menon', kind: 'Refund', what: 'Raised a refund request on BKG-8821' },
  { id: 'LOG-24', at: '03 Sep 2026, 06:05 pm', who: 'Divya Rao', kind: 'Booking', what: 'Confirmed BKG-8824 with the hotel' },
  { id: 'LOG-23', at: '03 Sep 2026, 10:30 am', who: 'Vikram Joshi', kind: 'Role', what: 'Gave the Assistant branch manager role export rights' },
  { id: 'LOG-22', at: '02 Sep 2026, 02:30 pm', who: 'Vikram Joshi', kind: 'Approval', what: 'Approved the Ayana Resort 2027 contract rates' },
  { id: 'LOG-21', at: '02 Sep 2026, 09:15 am', who: 'Vikram Joshi', kind: 'User', what: 'Added Farhan Qureshi as a Travel Consultant' },
];

/** What the user list can be cut by. */
export const userFilters = [
  'Branch',
  'Department',
  'Role',
  'Team',
  'Manager',
  'Active or inactive',
  'Online or offline',
  'Date joined',
  'Performance',
  'Attendance',
  'Last active',
];

/** What management can do to a user without opening them. */
export const userQuickActions = [
  'View profile',
  'Edit',
  'Change role',
  'Assign manager',
  'Assign team',
  'Reset password',
  'Disable account',
  'View activity',
  'View performance',
  'View leads',
  'View sales',
  'View bookings',
  'Login history',
];

/** What the panel controls, straight off the sheet. */
export const modulePurpose = [
  'Who can access the system',
  'What each employee can see',
  'What each employee can create, edit or approve',
  'Which leads and customers are assigned to whom',
  'Which bookings they can handle',
  'Which financial information they can reach',
  'Who reports to whom',
  'Team targets and performance',
  'The branch and team hierarchy',
  'Activity tracking',
  'Approval workflows',
  'Login and security controls',
];
