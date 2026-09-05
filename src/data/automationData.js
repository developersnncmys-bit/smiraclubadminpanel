/**
 * Automation, built to the client's sheet: what starts a rule, what it checks,
 * what it does, and the log that proves it happened.
 */

/** Everything that can start an automation. */
export const triggers = [
  'New lead',
  'Lead status changed',
  'Lead assigned',
  'Call completed',
  'No answer',
  'Follow-up due',
  'Presentation scheduled',
  'Presentation completed',
  'Customer visit',
  'Membership sold',
  'Payment received',
  'Payment failed',
  'Payment overdue',
  'Membership activated',
  'Membership expiring',
  'Booking created',
  'Booking confirmed',
  'Booking cancelled',
  'Travel completed',
  'Feedback received',
  'Referral created',
  'Staff login or logout',
  'Attendance status changed',
  'Target achieved',
  'Custom date and time',
  'Manual trigger',
];

/** What a rule can check before it fires. */
export const conditionFields = [
  'Lead source',
  'Lead quality',
  'Branch',
  'Department',
  'Team',
  'Employee',
  'Product',
  'Membership',
  'Customer type',
  'Amount',
  'Discount',
  'Travel date',
];

export const operators = ['is', 'is not', 'is more than', 'is less than', 'contains', 'is empty'];

/** What a rule can do. */
export const actions = [
  'Assign to an employee',
  'Assign to a team',
  'Send a WhatsApp message',
  'Send an email or SMS',
  'Create a call task',
  'Create a follow-up',
  'Book a presentation',
  'Notify the manager',
  'Escalate',
  'Change the stage',
  'Add a tag',
  'Ask for approval',
  'Send a payment link',
  'Generate a voucher',
];

/** The builder itself, in the shape the sheet draws it. */
export const builderShape = [
  'WHEN [select trigger]',
  'IF [field] [operator] [value]',
  'AND / OR [add condition]',
  'THEN [select action]',
  'WAIT [time]',
  'THEN [next action]',
  'ELSE [alternative action]',
];

/** The rules already running. */
export const rules = [
  {
    id: 'AUT-01',
    name: 'Website lead to the Mumbai desk',
    when: 'New lead',
    conditions: [{ field: 'Lead source', op: 'is', value: 'Website' }, { field: 'Branch', op: 'is', value: 'Mumbai' }],
    steps: [
      { wait: 'Immediately', action: 'Assign to the Mumbai team' },
      { wait: 'Immediately', action: 'Send the WhatsApp welcome message' },
      { wait: 'After 10 minutes', action: 'Create a first-call task' },
    ],
    runs: 148,
    completed: 141,
    errors: 2,
    status: 'On',
    lastRun: 'Today, 12:31 pm',
  },
  {
    id: 'AUT-02',
    name: 'No answer sequence',
    when: 'No answer',
    conditions: [{ field: 'Lead quality', op: 'is not', value: 'Cold' }],
    steps: [
      { wait: 'After 2 hours', action: 'Create a call task' },
      { wait: 'After 3 days', action: 'Send a WhatsApp follow-up' },
      { wait: 'After 6 days', action: 'Send the presentation invitation' },
      { wait: 'After 7 days', action: 'Escalate to the manager' },
    ],
    runs: 96,
    completed: 88,
    errors: 1,
    status: 'On',
    lastRun: 'Today, 11:05 am',
  },
  {
    id: 'AUT-03',
    name: 'Refund over ten thousand',
    when: 'Payment received',
    conditions: [{ field: 'Amount', op: 'is more than', value: '₹10,000' }],
    steps: [
      { wait: 'Immediately', action: 'Ask the manager for approval' },
      { wait: 'After 24 hours', action: 'Escalate to finance' },
    ],
    runs: 12,
    completed: 11,
    errors: 0,
    status: 'On',
    lastRun: 'Yesterday, 4:40 pm',
  },
  {
    id: 'AUT-04',
    name: 'Membership expiring',
    when: 'Membership expiring',
    conditions: [{ field: 'Membership', op: 'is not', value: 'Cancelled' }],
    steps: [
      { wait: '45 days before', action: 'Start the renewal campaign' },
      { wait: '15 days before', action: 'Create a renewal call task' },
      { wait: '7 days before', action: 'Notify the manager' },
    ],
    runs: 9,
    completed: 9,
    errors: 0,
    status: 'Off',
    lastRun: '22 Aug 2026',
  },
];

/** The stages a lead walks, which the admin owns. */
export const leadStages = [
  'Fresh data',
  'First call',
  'Ringing',
  'Connected',
  'Details sent',
  'Presentation scheduled',
  'Presentation done',
  'Interested',
  'Negotiation',
  'Visit scheduled',
  'Payment pending',
  'Closed won',
];

/** A follow-up sequence, step by step. */
export const followUpSequence = [
  { at: 'Immediately', does: 'Assign an employee' },
  { at: 'After 10 minutes', does: 'First call' },
  { at: 'After 2 hours', does: 'WhatsApp message' },
  { at: 'After 3 days', does: 'Call task' },
  { at: 'After 6 days', does: 'Presentation invitation' },
  { at: 'After 7 days', does: 'Final follow-up, then escalate to the manager' },
];

/** Rules can be cut by any of these. */
export const configureBy = ['Branch', 'Department', 'Team', 'Employee', 'Lead source', 'Product', 'Membership', 'Customer type'];

export const branchRules = [
  { branch: 'Mumbai', rule: 'New lead → Mumbai team' },
  { branch: 'Thane', rule: 'New lead → Thane team' },
  { branch: 'Any', rule: 'High-value lead → senior travel expert' },
  { branch: 'Any', rule: 'International enquiry → international travel team' },
];

export const roleRules = [
  { role: 'Lead generation executive', gets: 'Calls and lead qualification' },
  { role: 'Travel expert', gets: 'Presentations and membership closing' },
  { role: 'Field officer', gets: 'Customer visits' },
  { role: 'Branch manager', gets: 'Escalations and approvals' },
  { role: 'Finance', gets: 'Payments and refunds' },
  { role: 'Booking team', gets: 'Hotel and package booking' },
  { role: 'Admin', gets: 'Full automation control' },
];

/** Money and discounts that need a signature. */
export const approvalRules = [
  { id: 'APR-01', trigger: 'Refund over ₹10,000', chain: ['Travel expert', 'Manager approval', 'Finance approval'], limit: '₹10,000', escalation: '24 hours', auto: 'Auto-reject after 72 hours' },
  { id: 'APR-02', trigger: 'Special discount over 20%', chain: ['Travel expert', 'Manager approval'], limit: '20%', escalation: '12 hours', auto: 'Auto-approve under 10%' },
];

export const approvalSettings = ['Who approves', 'Approval limit', 'Number of levels', 'Escalation time', 'Auto-reject and auto-approve rules'];

/** WhatsApp rules and the variables every template can carry. */
export const whatsappRules = [
  { when: 'Presentation booked', then: 'Confirmation WhatsApp' },
  { when: '24 hours before', then: 'Reminder' },
  { when: '2 hours before', then: 'Reminder' },
  { when: 'Presentation completed', then: 'Thank-you and membership information' },
  { when: 'Payment pending', then: 'Payment link' },
  { when: 'Booking confirmed', then: 'Voucher' },
];

export const templateVariables = ['{Customer Name}', '{Membership}', '{Booking ID}', '{Amount}', '{Travel Date}', '{Employee Name}'];

/** Nobody is allowed to sit on a lead. */
export const escalationRules = [
  { after: '2 hours untouched', then: 'Notify the employee' },
  { after: '6 hours untouched', then: 'Notify the team leader' },
  { after: '24 hours untouched', then: 'Notify the manager and reassign' },
];

/** Ready-made automations the admin can switch on. */
export const templates = {
  Sales: ['New lead follow-up', 'No answer sequence', 'Presentation reminder', 'Missed presentation', 'Closing follow-up', 'Lost lead re-activation'],
  Membership: ['Activation', 'Welcome', 'Benefits reminder', 'Birthday', 'Anniversary', 'Renewal', 'Upgrade'],
  Booking: ['Booking request', 'Payment pending', 'Booking confirmation', 'Voucher', 'Travel reminder', 'Post-travel feedback'],
  Finance: ['Payment due', 'Payment failed', 'Payment received', 'Refund request', 'Refund approved'],
  Staff: ['Late login', 'Missing attendance', 'No CRM activity', 'Target alert', 'Performance alert'],
};

/** Fields the admin can invent, then use in a condition. */
export const customFields = [
  { name: 'Customer type', kind: 'Choice', usedIn: 'Assignment rules' },
  { name: 'Travel frequency', kind: 'Choice', usedIn: 'Follow-up timing' },
  { name: 'Preferred destination', kind: 'Text', usedIn: 'Package suggestions' },
  { name: 'Preferred hotel category', kind: 'Choice', usedIn: 'Inventory shown' },
  { name: 'Number of travellers', kind: 'Number', usedIn: 'Quotation' },
  { name: 'Annual travel budget', kind: 'Number', usedIn: 'Lead scoring' },
  { name: 'Membership interest', kind: 'Choice', usedIn: 'Membership automation' },
  { name: 'Lead quality', kind: 'Choice', usedIn: 'Escalation rules' },
  { name: 'Custom sales questions', kind: 'Text', usedIn: 'Presentation script' },
  { name: 'Custom booking questions', kind: 'Text', usedIn: 'Booking form' },
];

/** Every automated action, logged. */
export const history = [
  { at: '10:00 am', lead: 'ENQ-2040', text: 'Lead created', rule: 'AUT-01', status: 'Done' },
  { at: '10:01 am', lead: 'ENQ-2040', text: 'Assigned to Kabir', rule: 'AUT-01', status: 'Done' },
  { at: '10:02 am', lead: 'ENQ-2040', text: 'WhatsApp welcome sent', rule: 'AUT-01', status: 'Done' },
  { at: '12:00 pm', lead: 'ENQ-2040', text: 'Call task created', rule: 'AUT-01', status: 'Done' },
  { at: '11:05 am', lead: 'ENQ-2041', text: 'Follow-up reminder sent', rule: 'AUT-02', status: 'Done' },
  { at: 'Yesterday', lead: 'ENQ-2041', text: 'Manager escalation', rule: 'AUT-02', status: 'Done' },
  { at: 'Yesterday', lead: 'MSU-04', text: 'Payment link resend failed — number not on WhatsApp', rule: 'AUT-03', status: 'Failed' },
];

/** What the admin panel holds under automation. */
export const structure = [
  'Automation dashboard',
  'Workflow builder',
  'Triggers',
  'Conditions',
  'Actions',
  'Follow-up sequences',
  'WhatsApp templates',
  'Email and SMS templates',
  'Escalation rules',
  'Approval rules',
  'Branch rules',
  'Team rules',
  'Membership automation',
  'Sales automation',
  'Booking automation',
  'Payment automation',
  'Renewal automation',
  'Staff automation',
  'Custom fields',
  'Automation templates',
  'Automation logs',
  'Failed jobs',
  'API and webhooks',
  'Automation permissions',
];

/** How long a step can wait before the next one runs. */
export const waitOptions = [
  'Immediately',
  'After 10 minutes',
  'After 30 minutes',
  'After 2 hours',
  'After 6 hours',
  'After 24 hours',
  'After 3 days',
  'After 6 days',
  'After 7 days',
];

/** Who a rule can hand something to. */
export const recipients = [
  'The employee',
  'The team leader',
  'The branch manager',
  'The business head',
  'Finance',
  'The booking team',
];

/** Runs that did not finish, and why. */
export const failedJobs = [
  {
    id: 'JOB-118', rule: 'Payment reminder on an overdue invoice', ran: '05 Sep 2026, 09:12 am',
    target: 'INV-2044 · Ananya Deshmukh', reason: 'WhatsApp template not approved', attempts: 3, stage: 'Failed',
  },
  {
    id: 'JOB-117', rule: 'Website lead to the Mumbai desk', ran: '04 Sep 2026, 06:40 pm',
    target: 'LEAD-2293 · Aarti Menon', reason: 'No Mumbai executive was online', attempts: 2, stage: 'Retrying',
  },
  {
    id: 'JOB-114', rule: 'Renewal campaign 45 days out', ran: '03 Sep 2026, 08:00 am',
    target: 'MSU-03 · Rohan Bhatt', reason: 'Mobile number failed validation', attempts: 5, stage: 'Given up',
  },
];

/** Where the panel pushes and pulls automation events. */
export const webhooks = [
  { name: 'Website lead form', direction: 'Incoming', url: 'https://smiraclub.com/api/hooks/lead', event: 'New lead', status: 'Live', lastFired: '05 Sep 2026, 09:41 am' },
  { name: 'WhatsApp delivery receipts', direction: 'Incoming', url: 'https://smiraclub.com/api/hooks/wa', event: 'Message delivered or read', status: 'Live', lastFired: '05 Sep 2026, 09:44 am' },
  { name: 'Payment gateway callback', direction: 'Incoming', url: 'https://smiraclub.com/api/hooks/pay', event: 'Payment received or failed', status: 'Live', lastFired: '05 Sep 2026, 08:20 am' },
  { name: 'Accounting export', direction: 'Outgoing', url: 'https://books.smiraclub.com/api/entries', event: 'Payment received', status: 'Paused', lastFired: '02 Sep 2026, 07:00 pm' },
  { name: 'Booking confirmation to the vendor', direction: 'Outgoing', url: 'https://partners.smiraclub.com/confirm', event: 'Booking confirmed', status: 'Live', lastFired: '04 Sep 2026, 06:05 pm' },
];

/** Who may touch the automations. */
export const automationPermissions = [
  { role: 'Super admin', create: 'Yes', edit: 'Yes', switchOff: 'Yes', approvals: 'Yes', logs: 'Everything' },
  { role: 'Business head', create: 'Yes', edit: 'Yes', switchOff: 'Yes', approvals: 'Yes', logs: 'Everything' },
  { role: 'Branch manager', create: 'Branch rules only', edit: 'Branch rules only', switchOff: 'Branch rules only', approvals: 'Up to the limit', logs: 'Own branch' },
  { role: 'Sales head', create: 'Sales rules only', edit: 'Sales rules only', switchOff: 'No', approvals: 'Discounts only', logs: 'Own team' },
  { role: 'Travel expert', create: 'No', edit: 'No', switchOff: 'No', approvals: 'No', logs: 'Own leads' },
  { role: 'Finance', create: 'Payment rules only', edit: 'Payment rules only', switchOff: 'Payment rules only', approvals: 'Refunds and payments', logs: 'Money only' },
];
