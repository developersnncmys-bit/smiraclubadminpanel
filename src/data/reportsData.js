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

/** Reports that go out without anyone asking. */
export const scheduledReports = [];

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
