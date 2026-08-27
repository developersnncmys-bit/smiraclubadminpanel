/**
 * WhatsApp, built to the client's sheet: the inbox, the bot that answers
 * first, the rules that fire on their own, the campaigns that go out, and
 * how all of it lands back in the CRM.
 */

export const conversationCategories = [
  'New lead',
  'Hot lead',
  'Follow-up',
  'Membership enquiry',
  'Hotel booking',
  'Package enquiry',
  'Payment',
  'Cancellation or reschedule',
  'Complaint',
  'Existing member',
  'VIP member',
  'Closed',
];

export const categoryTone = {
  'New lead': 'sky',
  'Hot lead': 'rose',
  'Follow-up': 'amber',
  'Membership enquiry': 'violet',
  'Hotel booking': 'teal',
  'Package enquiry': 'teal',
  Payment: 'green',
  'Cancellation or reschedule': 'amber',
  Complaint: 'rose',
  'Existing member': 'green',
  'VIP member': 'amber',
  Closed: 'slate',
};

/** How the bot scores somebody from what they asked. */
export const leadScoring = {
  Hot: [
    'Asked for the membership price',
    'Wants a presentation',
    'Planning travel now',
    'Asked to book',
    'Replied more than once',
  ],
  Warm: ['Viewed the offers', 'Asked general questions', 'Downloaded the brochure'],
  Cold: ['No response', 'Information request only'],
};

/** The journeys the bot can walk somebody down. */
export const botJourneys = [
  'Welcome',
  'Explore Smira Club',
  'Membership',
  'Hotel booking',
  'Travel packages',
  'Offers',
  'Become a member',
  'Talk to an expert',
  'Existing member',
  'Support',
];

/** The welcome flow, as the client wrote it. */
export const welcomeFlow = {
  incoming: 'Hi',
  reply: 'Welcome to Smira Club 👋 How can we help you today?',
  buttons: ['Explore membership', 'Hotel booking', 'Travel packages', 'Talk to an expert'],
  membershipBranch: [
    'Membership plans',
    'Benefits',
    'Free hotel stay',
    'Offers',
    'Testimonials',
    'Request a presentation',
    'Talk to sales',
  ],
};

/** What happens to a lead the moment it arrives. */
export const leadAutomationFlow = [
  'Website form submitted',
  'Lead created in the CRM',
  'WhatsApp welcome message',
  'Bot qualifies the customer',
  'Lead score generated',
  'Assigned to a travel expert',
  'Staff notified',
  'Call or presentation',
  'Follow-up automation',
  'Membership conversion',
];

/** Rules that run without anyone pressing anything. */
export const automationRules = [
  { id: 'WA-01', name: 'New lead', when: 'A new lead is created', then: 'Send the WhatsApp welcome message', runs: 148, status: 'On' },
  { id: 'WA-02', name: 'No response', when: 'The customer has not replied for 24 hours', then: 'Send a follow-up', runs: 96, status: 'On' },
  { id: 'WA-03', name: 'Presentation', when: 'A presentation is booked', then: 'Send the confirmation and a reminder', runs: 34, status: 'On' },
  { id: 'WA-04', name: 'Missed follow-up', when: 'Staff have not completed a follow-up', then: 'Notify the manager', runs: 12, status: 'On' },
  { id: 'WA-05', name: 'Membership purchased', when: 'A payment succeeds', then: 'Send the membership activation message', runs: 21, status: 'On' },
  { id: 'WA-06', name: 'Booking', when: 'A booking is confirmed', then: 'Send the confirmation and itinerary', runs: 26, status: 'On' },
  { id: 'WA-07', name: 'Birthday', when: "It is the customer's birthday", then: 'Send a personal greeting and an offer', runs: 18, status: 'On' },
  { id: 'WA-08', name: 'Renewal', when: 'A membership is close to expiry', then: 'Start the renewal campaign', runs: 9, status: 'Off' },
];

/** Who a campaign can be sent to. */
export const segments = [
  'All members',
  'Silver',
  'Gold',
  'Platinum',
  'Non-members',
  'Expiring members',
  'Inactive members',
  'Frequent travellers',
  'Customers who have not booked',
  'Customers who enquired',
  'Lost leads',
  'Hot leads',
  'By location',
  'By lead source',
];

export const campaigns = [
  { id: 'CMP-01', name: 'Monsoon Bali offer', segment: 'Hot leads', sent: 120, delivered: 118, read: 96, replied: 31, leads: 12, sales: 3, on: '18 Aug 2026' },
  { id: 'CMP-02', name: 'Gold renewal reminder', segment: 'Expiring members', sent: 42, delivered: 42, read: 38, replied: 14, leads: 6, sales: 2, on: '20 Aug 2026' },
  { id: 'CMP-03', name: 'Platinum free-stay nudge', segment: 'Inactive members', sent: 64, delivered: 61, read: 40, replied: 9, leads: 4, sales: 1, on: '22 Aug 2026' },
];

/** Approved templates, grouped the way the sheet groups them. */
export const templates = {
  Sales: [
    'Welcome',
    'Membership introduction',
    'Offer',
    'Follow-up',
    'Presentation invitation',
    'Presentation reminder',
    'Payment reminder',
    'Closing message',
  ],
  Booking: [
    'Booking enquiry',
    'Booking confirmation',
    'Payment confirmation',
    'Hotel confirmation',
    'Travel itinerary',
    'Cancellation',
    'Reschedule',
  ],
  'Customer relationship': [
    'Birthday',
    'Anniversary',
    'Welcome member',
    'Membership activation',
    'Renewal',
    'Special offer',
  ],
};

export const templateSupports = ['Text', 'Image', 'Video', 'PDF', 'Buttons', 'Dynamic customer data'];
export const templateExample = 'Hi {{customer_name}}, your {{membership_plan}} membership is now active.';

/** Where every bot session ended. */
export const botSessions = {
  total: 412,
  completed: 268,
  transferred: 96,
  abandoned: 48,
  leadsCreated: 74,
  bookingsCreated: 11,
  ticketsCreated: 9,
  salesGenerated: 6,
};

/** What the website hands over to WhatsApp. */
export const websiteFlow = [
  'Chat on WhatsApp on the website',
  'Opens WhatsApp',
  'Customer enters the chatbot',
  'CRM identifies or creates the customer',
  'Conversation saved automatically',
];

export const enquiryFlow = ['Name, mobile and travel requirement submitted', 'CRM lead', 'WhatsApp message', 'Employee assigned', 'Follow-up task'];

/** WhatsApp written back into the customer's own history. */
export const crmTimeline = [
  'Lead created',
  'WhatsApp started',
  'Bot qualification',
  'Travel expert assigned',
  'Call completed',
  'Presentation scheduled',
  'Follow-up',
  'Payment',
  'Membership activated',
  'Hotel booking',
  'Post-trip feedback',
];

/** The stack, top to bottom. */
export const architecture = [
  'Website or app',
  'WhatsApp',
  'Chatbot',
  'WhatsApp inbox',
  'CRM',
  'Lead management',
  'Sales team',
  'Membership and payment',
  'Booking system',
  'Customer service',
];

/** What the admin can reach. */
export const controlCentre = {
  WhatsApp: ['API connection', 'Numbers', 'Templates', 'Campaigns', 'Broadcasts', 'Automation', 'Chatbot', 'Staff assignment', 'Business hours', 'Auto replies'],
  Chatbot: ['Flow builder', 'Questions', 'Buttons', 'Conditions', 'Lead qualification', 'Human handover', 'Knowledge and FAQ', 'Multiple journeys'],
  CRM: ['Lead creation', 'Assignment rules', 'Lead scoring', 'Follow-ups', 'Tasks', 'Sales pipeline', 'Customer history'],
  Reports: ['WhatsApp analytics', 'Chatbot analytics', 'Staff performance', 'Campaign ROI', 'Lead conversion', 'Sales conversion', 'Revenue'],
};

/** The inbox itself. */
export const conversations = [
  {
    id: 'WAC-01',
    name: 'Siddhesh Rane',
    phone: '+91 98201 44521',
    category: 'Hot lead',
    source: 'Instagram',
    membership: 'Silver Explorer',
    plan: 'Silver Explorer',
    owner: 'Kabir',
    score: 'Hot',
    unread: 2,
    handledBy: 'Bot then Kabir',
    lastAt: '11:42 am',
    followUp: 'Today 4:00 pm',
    tags: ['Bali', 'Honeymoon'],
    note: 'Asked for the member price on the Bali package.',
    messages: [
      { at: '10:58 am', from: 'them', text: 'Hi' },
      { at: '10:58 am', from: 'bot', text: 'Welcome to Smira Club 👋 How can we help you today?' },
      { at: '11:01 am', from: 'them', text: 'Explore membership' },
      { at: '11:01 am', from: 'bot', text: 'Silver, Gold and Platinum — which one shall I open?' },
      { at: '11:20 am', from: 'them', text: 'What does Gold cost for two people?' },
      { at: '11:24 am', from: 'us', text: 'Gold Voyager is ₹23,598 for two, and it takes 10% off every trip.' },
      { at: '11:42 am', from: 'them', text: 'Send me the Bali itinerary too' },
    ],
  },
  {
    id: 'WAC-02',
    name: 'Ananya Deshmukh',
    phone: '+91 98330 21145',
    category: 'Payment',
    source: 'Website',
    membership: 'Platinum Elite',
    plan: 'Platinum Elite',
    owner: 'Sneha',
    score: 'Hot',
    unread: 1,
    handledBy: 'Sneha',
    lastAt: '01:20 pm',
    followUp: 'Today 6:00 pm',
    tags: ['Maldives', 'Payment'],
    note: 'Payment link did not open — support ticket TCK-1043 raised.',
    messages: [
      { at: '09:12 am', from: 'them', text: 'The payment link is not opening' },
      { at: '09:14 am', from: 'bot', text: 'Sorry about that — I have raised it with the team, they will call you.' },
      { at: '09:24 am', from: 'us', text: 'Sneha here. I have sent a fresh link, could you try once more?' },
      { at: '01:20 pm', from: 'them', text: 'Paid ₹1,50,000 now' },
    ],
  },
  {
    id: 'WAC-03',
    name: 'Jayashree Patil',
    phone: '+91 90045 88120',
    category: 'New lead',
    source: 'Website',
    membership: '',
    plan: '',
    owner: 'Unassigned',
    score: 'Warm',
    unread: 0,
    handledBy: 'Bot',
    lastAt: '12:40 pm',
    followUp: 'Today 6:00 pm',
    tags: ['Kerala', 'Family'],
    note: 'Downloaded the Kerala brochure, has not replied since.',
    messages: [
      { at: '12:31 pm', from: 'them', text: 'Kerala package for 4 people?' },
      { at: '12:31 pm', from: 'bot', text: 'Here is the Kerala Backwaters brochure 📄 — shall I have an expert call you?' },
      { at: '12:40 pm', from: 'bot', text: 'No reply yet — a follow-up is queued for 6:00 pm.' },
    ],
  },
  {
    id: 'WAC-04',
    name: 'Rohan Bhatt',
    phone: '+91 99201 55420',
    category: 'VIP member',
    source: 'Referral',
    membership: 'Gold Voyager',
    plan: 'Gold Voyager',
    owner: 'Sneha',
    score: 'Hot',
    unread: 0,
    handledBy: 'Sneha',
    lastAt: 'Yesterday',
    followUp: 'Renewal call 01 Sep',
    tags: ['Bali', 'Renewal'],
    note: 'Renewal conversation started — interested after the Bali trip.',
    messages: [
      { at: 'Yesterday', from: 'us', text: 'Your Gold membership runs out on 09 Sep — shall I hold this year\'s rate?' },
      { at: 'Yesterday', from: 'them', text: 'Yes, after we are back from Bali' },
    ],
  },
];

/** How each desk is doing on WhatsApp. */
export const staffPerformance = [
  { name: 'Sneha Kulkarni', chats: 84, leads: 22, followUps: 18, firstResponse: '2m', avgResponse: '6m', missed: 1, presentations: 5, conversions: 3, sales: 5, revenue: 185000, rating: 4.8 },
  { name: 'Kabir Menon', chats: 71, leads: 19, followUps: 16, firstResponse: '3m', avgResponse: '9m', missed: 3, presentations: 4, conversions: 2, sales: 4, revenue: 336000, rating: 4.5 },
];

/** The month so far. */
export const inboxStats = {
  conversationsToday: 38,
  conversationsMonth: 486,
  newToday: 12,
  botHandled: 268,
  humanHandled: 96,
  leads: 74,
  qualified: 41,
  presentations: 9,
  membershipSales: 3,
  bookingRequests: 17,
  unanswered: 4,
  failed: 2,
  satisfaction: 4.6,
};
