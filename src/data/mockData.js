// ---------------------------------------------------------------------------
// Demo dataset for the Smira Club travel-agency admin panel.
// Everything here is fake but internally consistent, so charts, tables and
// counters agree with each other while the client reviews the design.
// ---------------------------------------------------------------------------

export const inr = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const shortInr = (n) => {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return inr(n);
};

/** '02 Sep 2026' -> '2026-09-02', the only format a date input accepts. */
export const toISODate = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Spelled out rather than left to toLocaleDateString, which renders September
// as "Sept" in some engines and "Sep" in others.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-09-02' -> '02 Sep 2026'. Leaves unparseable values alone. */
export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const days = [
  '29 Jul', '30 Jul', '31 Jul', '01 Aug', '02 Aug', '03 Aug', '04 Aug',
];

// -- Headline KPIs ----------------------------------------------------------
export const kpis = {
  enquiries: { value: 168, delta: 12.4, series: [22, 18, 26, 31, 24, 20, 27] },
  bookings: { value: 54, delta: 8.1, series: [6, 5, 9, 11, 7, 8, 8] },
  travellers: { value: 212, delta: 15.6, series: [24, 19, 33, 42, 28, 30, 36] },
  revenue: { value: 4265000, delta: -3.2, series: [520, 480, 720, 910, 610, 540, 485] },
};

export const microStats = [
  { label: 'Enquiries contacted', value: '86%', tone: 'brand' },
  { label: 'Enquiry → booking', value: '32%', tone: 'ocean' },
  { label: 'Avg. ticket size', value: '₹78,980', tone: 'grape' },
  { label: 'Upcoming departures', value: '19', tone: 'coral' },
];

// -- Business report trends -------------------------------------------------
export const trends = {
  enquiries: {
    stats: [
      { label: 'Created', value: 168, tone: 'brand' },
      { label: 'Assigned', value: 151, tone: 'ocean' },
      { label: 'Untouched', value: 17, tone: 'gold' },
      { label: 'No task', value: 23, tone: 'coral' },
      { label: 'Stale', value: 9, tone: 'grape' },
    ],
    series: days.map((d, i) => ({
      day: d,
      value: [22, 18, 26, 31, 24, 20, 27][i],
      converted: [5, 4, 8, 11, 7, 6, 9][i],
    })),
    keys: [
      { key: 'value', name: 'Enquiries', color: '#14a58c' },
      { key: 'converted', name: 'Converted', color: '#0ea5e9' },
    ],
  },
  calls: {
    stats: [
      { label: 'Outgoing', value: 412, tone: 'brand' },
      { label: 'Incoming', value: 286, tone: 'ocean' },
      { label: 'Missed', value: 74, tone: 'coral' },
      { label: 'Answered', value: 624, tone: 'brand' },
      { label: 'Answer rate', value: '82%', tone: 'grape' },
      { label: 'Avg. talk time', value: '3m 12s', tone: 'gold' },
    ],
    series: days.map((d, i) => ({
      day: d,
      value: [88, 64, 95, 112, 79, 71, 89][i],
      converted: [12, 9, 14, 19, 11, 10, 13][i],
    })),
    keys: [
      { key: 'value', name: 'Calls', color: '#0ea5e9' },
      { key: 'converted', name: 'Follow-ups', color: '#7c5cff' },
    ],
  },
  activity: {
    stats: [
      { label: 'Status updated', value: 1284, tone: 'brand' },
      { label: 'Itinerary sent', value: 342, tone: 'ocean' },
      { label: 'WhatsApp sent', value: 918, tone: 'brand' },
      { label: 'Quotes shared', value: 176, tone: 'grape' },
      { label: 'Docs collected', value: 94, tone: 'gold' },
      { label: 'Visa filed', value: 38, tone: 'coral' },
    ],
    series: days.map((d, i) => ({
      day: d,
      value: [420, 365, 512, 604, 448, 396, 470][i],
      converted: [120, 98, 141, 176, 132, 110, 138][i],
    })),
    keys: [
      { key: 'value', name: 'Activities', color: '#7c5cff' },
      { key: 'converted', name: 'Customer touches', color: '#14a58c' },
    ],
  },
  sales: {
    stats: [
      { label: 'Booked value', value: '₹42.65 L', tone: 'brand' },
      { label: 'Collected', value: '₹31.20 L', tone: 'ocean' },
      { label: 'Outstanding', value: '₹11.45 L', tone: 'coral' },
      { label: 'Refunds', value: '₹1.10 L', tone: 'gold' },
      { label: 'Avg. margin', value: '18.4%', tone: 'grape' },
    ],
    series: days.map((d, i) => ({
      day: d,
      value: [520, 480, 720, 910, 610, 540, 485][i],
      converted: [380, 350, 540, 690, 470, 410, 360][i],
    })),
    keys: [
      { key: 'value', name: 'Booked (₹K)', color: '#f9714a' },
      { key: 'converted', name: 'Collected (₹K)', color: '#14a58c' },
    ],
  },
};

// -- Enquiries (leads) ------------------------------------------------------
export const liveStatuses = [
  'Online',
  'Idle',
  'In meeting',
  'On customer visit',
  'On break',
  'Offline',
  'Leave',
  'Not logged in',
];

export const attendanceStates = [
  'Present',
  'Absent',
  'Leave',
  'Late',
  'Half day',
  'Not logged in',
  'Work from home',
  'Field visit',
];

export const enquiryStatuses = [
  'New',
  'Contacted',
  'Interested',
  'Details sent',
  'Presentation',
  'Visit scheduled',
  'Closing',
  'Won',
  'Lost',
];

/** How likely each stage is to close — used for the weighted pipeline. */
export const stageProbability = {
  New: 0.05,
  Contacted: 0.1,
  Interested: 0.25,
  'Details sent': 0.4,
  Presentation: 0.55,
  'Visit scheduled': 0.7,
  Closing: 0.85,
  Won: 1,
  Lost: 0,
};

/** Why leads are marked lost, as the client listed them. */
export const lostReasons = [
  'Price too high',
  'Not interested',
  'No response',
  'Went to a competitor',
  'Wrong number',
  'Duplicate lead',
  'Not eligible',
  'Travel plan cancelled',
  'Payment issue',
  'Membership not suitable',
  'Follow-up failed',
  'Other',
];

export const leadSources = [
  'Website',
  'Facebook',
  'Instagram',
  'Google Ads',
  'WhatsApp',
  'Referral',
  'Walk-in',
  'Calling data',
  'Partner',
  'Campaign',
  'Existing member',
  'Other',
];

export const statusTone = {
  New: 'sky',
  Contacted: 'violet',
  Interested: 'amber',
  'Details sent': 'sky',
  Presentation: 'violet',
  'Visit scheduled': 'teal',
  Closing: 'amber',
  Won: 'green',
  Lost: 'rose',
};

export const enquiries = [];

/** Brand colour per enquiry source; the counts come from the live list. */
export const sourceColours = {
  Instagram: '#f9714a',
  Website: '#14a58c',
  'Google Ads': '#0ea5e9',
  Referral: '#7c5cff',
  'Walk-in': '#f5b73c',
  WhatsApp: '#6dd9c3',
};

// -- Packages ---------------------------------------------------------------
export const packages = [
  { id: 'PKG-01', name: 'Bali Honeymoon Escape', destination: 'Bali, Indonesia', startDate: '2026-09-02', days: 7, nights: 6, price: 92500, type: 'Honeymoon', rating: 4.8, sold: 42, seats: 8, gradient: 'from-brand-500 to-ocean' },
  { id: 'PKG-02', name: 'Maldives Overwater Luxury', destination: 'Malé, Maldives', startDate: '2026-09-15', days: 6, nights: 5, price: 168000, type: 'Luxury', rating: 4.9, sold: 24, seats: 4, gradient: 'from-ocean to-grape' },
];

// -- Bookings ---------------------------------------------------------------
export const bookings = [];

export const bookingTypes = ['Hotel', 'Package', 'Transport', 'Villa', 'Add-on'];
export const bookingSources = ['Website', 'Walk-in', 'Referral', 'Instagram', 'WhatsApp', 'Partner', 'Existing member'];
export const paymentMethods = ['UPI', 'Card', 'Net banking', 'Cash', 'Bank transfer', 'Payment gateway'];
export const occasions = ['Birthday', 'Anniversary', 'Honeymoon', 'Family trip', 'Other'];
export const assignRoles = ['Frontliner', 'Travel expert', 'Field officer', 'Booking team', 'Manager'];

/** Where a booking sits with the hotel. */
export const confirmationStates = [
  'Waiting for hotel',
  'Sent to hotel',
  'Hotel confirmed',
  'Hotel rejected',
  'Alternative required',
];

/** Cancellations waiting on a decision, and the refund behind each. */
export const cancellationRequests = [
  { id: 'CAN-01', booking: 'BKG-8820', customer: 'Ananya Deshmukh', reason: 'Travel plan changed', value: 336000, charges: 33600, refund: 116400, requested: '20 Aug 2026', approvedBy: 'Pending', status: 'Awaiting approval' },
];

/** Date changes, and what they cost. */
export const rescheduleRequests = [
  { id: 'RES-01', booking: 'BKG-8821', customer: 'Rohan Bhatt', from: '02 Sep 2026', to: '16 Sep 2026', reason: 'Visa appointment moved', availability: 'Rooms available', extra: 8000, approval: 'Approved by Sneha', status: 'Rescheduled' },
];


export const bookingStatusTone = {
  Confirmed: 'green',
  'Part paid': 'amber',
  Pending: 'sky',
  Completed: 'violet',
  Cancelled: 'rose',
};

// -- Customers --------------------------------------------------------------
export const customers = [];

/** The gifts and rewards the agency hands out, in the client's order. */
export const rewardKinds = [
  'Welcome gift',
  'Membership gift',
  'Hotel stay reward',
  'Birthday gift',
  'Anniversary gift',
  'Referral reward',
  'Special campaign',
];

/** A gift walks down this ladder before it reaches the member. */
export const rewardStages = ['Pending', 'Eligible', 'Approved', 'Assigned', 'Delivered', 'Cancelled'];

/** Gifts in flight, with who is carrying them. */
export const rewardGrants = [];

/** How engaged a member is, and how the desk should read it. */
export const engagementLevels = ['Highly engaged', 'Active', 'Low engagement', 'At risk'];

/** What the reminder engine watches. */
export const reminderKinds = [
  'Membership expiry',
  'Membership activation',
  'Unused benefits',
  'Booking opportunity',
  'Birthday',
  'Anniversary',
  'Gift collection',
  'Referral reward',
  'Pending payment',
  'Upcoming booking',
  'Renewal',
];


// -- Tasks ------------------------------------------------------------------
export const tasks = [];

// -- Quotations, invoices, payments -----------------------------------------
export const quotations = [];

export const quotationTone = {
  Draft: 'slate',
  Sent: 'sky',
  Viewed: 'violet',
  Accepted: 'green',
  Expired: 'rose',
};

// -- Membership plans -------------------------------------------------------
// Three plans published on the public website. The agency edits the feature
// list here and the website pricing page renders whatever is marked published.

export const MEMBERSHIP_GST = 18;

/**
 * Rewards are real gifts the agency hands over — a travel kit, an airport
 * transfer, a cake at the hotel. Each plan lists what its members get and the
 * desk ticks each one off per traveller as it is given.
 */
export const giftKey = (gift) => String(gift).trim().toLowerCase();

export const memberships = [
  {
    id: 'MEM-01',
    name: 'Silver Explorer',
    tagline: 'For first-time travellers testing the waters',
    price: 4999,
    billing: 'Yearly',
    discount: 5,
    gradient: 'from-slate-600 to-slate-800',
    accent: 'slate',
    popular: false,
    published: true,
    members: 1,
    freeStay: { nights: 1, rooms: 1, validity: '12 months from joining' },
    duration: '12 months',
    rooms: 1,
    persons: 2,
    services: ['Hotel booking desk', 'Trip planning', 'Airport assistance'],
    gifts: [
      'Welcome travel kit on joining',
      'Birthday greeting card',
    ],
    features: [
      '5% off on every holiday package',
      'Priority enquiry response within 4 hours',
      'Dedicated WhatsApp support desk',
      'Free travel insurance quotation',
    ],
  },
  {
    id: 'MEM-02',
    name: 'Gold Voyager',
    tagline: 'Our most-picked plan for families who travel twice a year',
    price: 9999,
    billing: 'Yearly',
    discount: 10,
    gradient: 'from-amber-500 to-orange-600',
    accent: 'amber',
    popular: true,
    published: true,
    members: 1,
    freeStay: { nights: 2, rooms: 2, validity: '12 months from joining' },
    duration: '12 months',
    rooms: 2,
    persons: 2,
    services: ['Hotel booking desk', 'Trip planning', 'Airport assistance'],
    gifts: [
      'Welcome travel kit on joining',
      'Free airport transfer on the first trip',
      'Anniversary cake at the hotel',
      '₹2,000 gift voucher every year',
    ],
    features: [
      '10% off on every holiday package',
      'Dedicated travel consultant',
      'Free visa documentation assistance',
      'Complimentary airport transfers',
      '24×7 on-trip emergency helpline',
    ],
  },
  {
    id: 'MEM-03',
    name: 'Platinum Elite',
    tagline: 'Concierge-level travel for frequent flyers',
    price: 24999,
    billing: 'Yearly',
    discount: 15,
    gradient: 'from-violet-600 to-indigo-700',
    accent: 'violet',
    popular: false,
    published: true,
    members: 1,
    freeStay: { nights: 2, rooms: 2, validity: '12 months from joining' },
    duration: '12 months',
    rooms: 2,
    persons: 2,
    services: ['Hotel booking desk', 'Trip planning', 'Airport assistance'],
    gifts: [
      'Premium luggage set on joining',
      'Free airport transfer on every trip',
      'Anniversary cake and flowers at the hotel',
      'Complimentary one-night stay every year',
      '₹5,000 gift voucher every year',
    ],
    features: [
      '15% off on every holiday package',
      'Complimentary airport lounge access',
      'Free hotel upgrades subject to availability',
      'Personal itinerary designer',
      'Zero cancellation fee once a year',
      'Family add-on members at 50%',
    ],
  },
];

// Signups captured on the website pricing page and pushed into the panel.
export const memberSignups = [];

/** Where a membership is in the activation run. */
export const activationStages = [
  'Payment pending',
  'Payment completed',
  'Expert assigned',
  'Explanation completed',
  'Activated',
];

/** The renewal ladder the desk works down. */
export const renewalStages = [
  'Renewal contacted',
  'Renewal interested',
  'Renewed',
  'Renewal lost',
];

export const membershipStates = ['Active', 'New', 'Quoted', 'Expired', 'Suspended', 'Cancelled'];

/** Everything a plan can hand out, in the client's order. */
export const benefitKinds = [
  'Free hotel stays',
  'Luxury hotel discounts',
  'Travel packages',
  'Transport benefits',
  'Restaurant benefits',
  'Other offers',
];


export const signupTone = {
  New: 'amber',
  Suspended: 'rose',
  Quoted: 'sky',
  Active: 'green',
  Expired: 'slate',
  Cancelled: 'rose',
};

/** Membership fee for a plan and member count, with GST applied. */
export function membershipAmount(plan, members = 1) {
  const subtotal = Number(plan?.price || 0) * Math.max(1, Number(members) || 1);
  const tax = Math.round((subtotal * MEMBERSHIP_GST) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export const invoices = [];

export const invoiceTone = {
  Paid: 'green',
  Partial: 'amber',
  Overdue: 'rose',
  Draft: 'slate',
};

export const payments = [];

export const paymentTone = { Success: 'green', Pending: 'amber', Failed: 'rose', Refunded: 'violet' };

// -- Suppliers --------------------------------------------------------------
export const suppliers = [];

// -- Campaigns --------------------------------------------------------------
export const campaigns = [];

export const campaignTone = { Running: 'green', Paused: 'amber', Completed: 'violet', Draft: 'slate' };

// -- Team -------------------------------------------------------------------
export const team = [];

export const consultantPerformance = team
  .filter((t) => t.bookings > 0)
  .map((t) => ({ name: t.name.split(' ')[0], enquiries: t.enquiries, bookings: t.bookings, revenue: t.revenue }));

// -- Activity feed ----------------------------------------------------------
export const activityFeed = [];

export const upcomingDepartures = bookings
  .filter((b) => ['Confirmed', 'Part paid', 'Pending'].includes(b.status))
  .slice(0, 5);

// -- Thirty days behind today, for the sales performance graph --------------
export const salesTrend = [
  { day: 1, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 2, revenue: 142000, closings: 1, customers: 1, target: 40000 },
  { day: 3, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 4, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 5, revenue: 96000, closings: 1, customers: 1, target: 40000 },
  { day: 6, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 7, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 8, revenue: 178000, closings: 1, customers: 1, target: 40000 },
  { day: 9, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 10, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 11, revenue: 132000, closings: 1, customers: 1, target: 40000 },
  { day: 12, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 13, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 14, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 15, revenue: 210000, closings: 1, customers: 1, target: 40000 },
  { day: 16, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 17, revenue: 88000, closings: 1, customers: 1, target: 40000 },
  { day: 18, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 19, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 20, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 21, revenue: 164000, closings: 1, customers: 1, target: 40000 },
  { day: 22, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 23, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 24, revenue: 185000, closings: 1, customers: 1, target: 40000 },
  { day: 25, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 26, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 27, revenue: 120000, closings: 1, customers: 1, target: 40000 },
  { day: 28, revenue: 0, closings: 0, customers: 0, target: 40000 },
  { day: 29, revenue: 336000, closings: 1, customers: 1, target: 40000 },
  { day: 30, revenue: 0, closings: 0, customers: 0, target: 40000 },
];

/** The live activity feed on Sales & Leads. */
export const salesActivity = [];

export const activityKinds = ['All', 'Calls', 'Follow-ups', 'Presentations', 'Visits', 'Closings', 'Payments', 'WhatsApp', 'Tasks'];
