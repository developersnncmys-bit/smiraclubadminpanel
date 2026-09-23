/**
 * Support and complaints, built to the client's sheet: the funnel a ticket
 * walks down, the categories they raise them under, the SLA each priority
 * carries, and the escalation ladder above it.
 */

export const ticketStages = [
  'New',
  'Assigned',
  'In progress',
  'Waiting',
  'Escalated',
  'Resolved',
  'Customer confirmed',
  'Closed',
];

export const stageTone = {
  New: 'sky',
  Assigned: 'violet',
  'In progress': 'amber',
  Waiting: 'slate',
  Escalated: 'rose',
  Resolved: 'teal',
  'Customer confirmed': 'green',
  Closed: 'slate',
};

/** Every category the desk raises a ticket under, and what sits inside it. */
export const ticketCategories = {
  Booking: [
    'Hotel booking issue',
    'Booking confirmation',
    'Cancellation',
    'Rescheduling',
    'Hotel availability',
    'Check-in problem',
    'Wrong booking details',
    'No-show',
  ],
  Membership: [
    'Membership activation',
    'Membership benefits',
    'Membership validity',
    'Renewal',
    'Upgrade or downgrade',
    'Membership card or code',
    'Free stay issue',
  ],
  Payment: [
    'Payment failed',
    'Payment pending',
    'Refund',
    'Duplicate payment',
    'Invoice',
    'EMI or payment issue',
  ],
  'Hotel or partner': [
    'Hotel service complaint',
    'Room quality',
    'Food or meals',
    'Hotel denied booking',
    'Partner dispute',
    'Incorrect information',
  ],
  'Customer service': [
    'Sales promise complaint',
    'Executive behaviour',
    'Travel expert issue',
    'Field officer issue',
    'WhatsApp support',
    'Call-back request',
  ],
  'Gift or reward': [
    'Gift pending',
    'Gift delivery',
    'Reward issue',
    'Referral reward',
    'Birthday or anniversary gift',
  ],
};

/** First response and resolution targets, in minutes and hours. */
export const priorities = [
  { key: 'Critical', tone: 'rose', firstResponse: 15, resolution: 4, note: 'Payment fraud, booking about to fail' },
  { key: 'High', tone: 'amber', firstResponse: 30, resolution: 8, note: 'Booking problem, member is travelling soon' },
  { key: 'Medium', tone: 'sky', firstResponse: 60, resolution: 24, note: 'General member request' },
  { key: 'Low', tone: 'slate', firstResponse: 120, resolution: 48, note: 'Information request' },
];

/** Who a ticket climbs to, and why it climbs. */
export const escalationLevels = [
  'Level 1 — Support executive',
  'Level 2 — Support manager',
  'Level 3 — Operations manager',
  'Level 4 — Senior management',
];

export const escalationTriggers = [
  'SLA breached',
  'Complaint raised again',
  'VIP or Crown member',
  'Hotel refusing service',
  'Payment or refund dispute',
  'Customer asked for a manager',
  'Several unresolved attempts',
];

/** The desks a ticket can be transferred to. */
export const supportDepartments = [
  'Support',
  'Bookings',
  'Payments',
  'Membership',
  'Operations',
  'Partner desk',
  'Customer service',
];

/** What the panel does on its own once a complaint lands. */
export const supportAutomation = [
  'Create a ticket from a WhatsApp complaint',
  'Create a ticket from the website or app',
  'Assign it on the category',
  'Send the acknowledgement',
  'Notify the assigned executive',
  'Start the SLA timer',
  'Remind before the SLA breaches',
  'Escalate overdue complaints',
  'Notify the manager',
  'Send the resolution message',
  'Ask the customer to rate it',
  'Create a follow-up on a poor rating',
  'Keep the whole complaint history',
];

export const tickets = [];
