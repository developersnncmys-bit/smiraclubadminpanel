/**
 * The numbers Report & Analytics needs that no other screen keeps: what each
 * channel costs, how members use the app, and the reports that go out on a
 * schedule.
 */

/** Every channel the sheet asks the lead report to track. */
export const leadSources = [
  'Facebook Ads',
  'Instagram',
  'WhatsApp',
  'Website',
  'Google Ads',
  'Referral',
  'Field team',
  'Existing member',
  'Campaign',
  'Other',
];

/** Every state a booking can be reported in. */
export const bookingStates = [
  'Confirmed',
  'Part paid',
  'Pending',
  'Completed',
  'Cancelled',
  'Rescheduled',
  'Failed',
  'No-show',
];

/** And everything the agency sells. */
export const bookingKinds = [
  'Hotel',
  'Villa',
  'Package',
  'Transport',
  'International trip',
  'Restaurant',
];

/** Where a membership can stand on the membership report. */
export const membershipStates = [
  'Active',
  'Pending activation',
  'Activated',
  'Expiring soon',
  'Expired',
  'Suspended',
  'Cancelled',
];

/** What the agency spends on each channel, for cost per lead and ROI. */
export const sourceCosts = {
  Website: 18000,
  Instagram: 42000,
  'Google Ads': 56000,
  'Facebook Ads': 24000,
  WhatsApp: 6000,
  Referral: 0,
  'Walk-in': 0,
  'Field team': 30000,
  Campaign: 22000,
  'Existing member': 0,
  Other: 0,
};

/** How members actually use the app and the website. */
export const engagementStats = {
  logins: 168,
  searches: 412,
  wishlist: 37,
  inquiries: 24,
  bookings: 2,
  offersViewed: 96,
  giftsClaimed: 3,
  referrals: 5,
  whatsapp: 143,
};

/** Messages and automation, for the WhatsApp report. */
export const messagingStats = {
  sent: 312,
  delivered: 298,
  read: 241,
  replied: 88,
  templates: 6,
  campaigns: 2,
};

/** Reports that go out without anyone asking. */
export const scheduledReports = [
  {
    id: 'SCH-01',
    name: 'Sales report',
    every: 'Daily',
    at: '8:00 pm',
    module: 'Sales',
    recipients: ['Admin', 'Sales manager'],
    format: 'PDF',
    status: 'On',
  },
  {
    id: 'SCH-02',
    name: 'Team performance',
    every: 'Weekly',
    at: 'Monday, 9:00 am',
    module: 'Team',
    recipients: ['Admin', 'Branch manager'],
    format: 'Excel',
    status: 'On',
  },
  {
    id: 'SCH-03',
    name: 'Business performance',
    every: 'Monthly',
    at: '1st, 10:00 am',
    module: 'Revenue',
    recipients: ['Admin', 'Business manager', 'Finance'],
    format: 'PDF',
    status: 'On',
  },
];

export const reportRecipients = [
  'Admin',
  'Branch manager',
  'Business manager',
  'Finance',
  'Sales manager',
];

/** What the custom report builder can be pointed at. */
export const reportModules = {
  Sales: ['Salesperson', 'Lead source', 'Stage', 'Month', 'Branch'],
  Leads: ['Source', 'Owner', 'Status', 'Label', 'Month'],
  Membership: ['Plan', 'Status', 'Consultant', 'Branch', 'Month'],
  Members: ['Engagement', 'Renewal stage', 'Plan', 'City'],
  Bookings: ['Type', 'Hotel', 'Destination', 'Consultant', 'Status', 'Month'],
  Revenue: ['Source', 'Plan', 'Consultant', 'Month', 'Branch'],
  Team: ['Employee', 'Team', 'Manager', 'Branch', 'Date'],
  Partners: ['Vendor', 'Hotel', 'Destination', 'Month'],
  Support: ['Category', 'Executive', 'Priority', 'SLA state', 'Month'],
};

export const reportMeasures = [
  'Count',
  'Revenue',
  'Conversion %',
  'Average value',
  'Target vs achievement',
  'Cost and ROI',
];
