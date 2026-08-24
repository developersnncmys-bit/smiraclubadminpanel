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
export const enquiryStatuses = ['New', 'Contacted', 'Interested', 'Quoted', 'Booked', 'Lost'];

export const statusTone = {
  New: 'sky',
  Contacted: 'violet',
  Interested: 'amber',
  Quoted: 'teal',
  Booked: 'green',
  Lost: 'rose',
};

export const enquiries = [
  { id: 'ENQ-2041', name: 'Siddhesh Rane', phone: '+91 98201 44521', email: 'siddhesh.r@gmail.com', destination: 'Bali', pax: 2, travelDate: '18 Sep 2026', budget: 185000, status: 'Interested', source: 'Instagram', owner: 'Kabir', label: 'Honeymoon', created: '04 Aug 2026' },
  { id: 'ENQ-2040', name: 'Jayashree Patil', phone: '+91 90045 88120', email: 'jaya.patil@outlook.com', destination: 'Kerala', pax: 4, travelDate: '02 Oct 2026', budget: 96000, status: 'New', source: 'Website', owner: 'Unassigned', label: 'Family', created: '04 Aug 2026' },
];

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
export const bookings = [
  { id: 'BKG-8821', customer: 'Rohan Bhatt', pkg: 'Bali Honeymoon Escape', destination: 'Bali, Indonesia', departure: '02 Sep 2026', nights: 6, pax: 2, amount: 185000, paid: 185000, status: 'Confirmed', owner: 'Sneha' },
  { id: 'BKG-8820', customer: 'Ananya Deshmukh', pkg: 'Maldives Overwater Luxury', destination: 'Malé, Maldives', departure: '15 Sep 2026', nights: 5, pax: 2, amount: 336000, paid: 150000, status: 'Part paid', owner: 'Kabir' },
];

export const bookingStatusTone = {
  Confirmed: 'green',
  'Part paid': 'amber',
  Pending: 'sky',
  Completed: 'violet',
  Cancelled: 'rose',
};

// -- Customers --------------------------------------------------------------
export const customers = [
  { id: 'CUS-512', name: 'Ananya Deshmukh', phone: '+91 98330 21145', email: 'ananya.d@gmail.com', city: 'Pune', trips: 1, spend: 336000, tier: 'Gold', last: '04 Aug 2026', dob: '1994-06-19', special: '2022-03-08', specialLabel: 'Anniversary', source: 'Website', address: '31 Koregaon Park Annexe, Pune 411001', giftsGiven: [] },
  { id: 'CUS-511', name: 'Rohan Bhatt', phone: '+91 99201 55420', email: 'rohan.bhatt@outlook.com', city: 'Mumbai', trips: 1, spend: 185000, tier: 'Gold', last: '28 Jul 2026', dob: '1989-01-24', special: '2017-05-21', specialLabel: 'Anniversary', source: 'Website', address: 'A-1202 Oberoi Splendor, Jogeshwari East, Mumbai 400060', giftsGiven: [{ gift: 'Welcome travel kit on joining', date: '05 Aug 2026' }] },
];

// -- Tasks ------------------------------------------------------------------
export const tasks = [
  { id: 'TSK-311', title: 'Share revised Bali itinerary', customer: 'Siddhesh Rane', type: 'Send itinerary', due: '04 Aug 2026, 11:45 am', owner: 'Kabir', bucket: 'today', priority: 'High', note: 'Client wants a pool villa option and a private candlelight dinner added.' },
  { id: 'TSK-310', title: 'Collect passport copies', customer: 'Rohan Bhatt', type: 'Documents', due: '04 Aug 2026, 04:30 pm', owner: 'Sneha', bucket: 'today', priority: 'High', note: '2 of 6 passports still pending. Visa filing deadline is 08 Aug.' },
];

// -- Quotations, invoices, payments -----------------------------------------
export const quotations = [
  // Auto-generated from website membership signups — inclusions are snapshotted
  // from the plan at the moment the quotation was raised.
  { id: 'QUO-1190', customer: 'Siddhesh Rane', pkg: 'Bali Honeymoon Escape', pax: 2, amount: 185000, validTill: '18 Aug 2026', status: 'Sent', owner: 'Kabir', source: 'Enquiry', planId: 'MEM-02', inclusions: ['10% off on every holiday package', 'Dedicated travel consultant', '24×7 on-trip emergency helpline'] },
  { id: 'QUO-1189', customer: 'Rohan Bhatt', pkg: 'Gold Voyager membership (Yearly)', pax: 2, amount: 23598, validTill: '10 Aug 2026', status: 'Sent', owner: 'Sneha', source: 'Membership', planId: 'MEM-02', inclusions: ['10% off on every holiday package', 'Dedicated travel consultant', '24×7 on-trip emergency helpline'] },
];

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
export const memberSignups = [
  { id: 'MSU-09', name: 'Siddhesh Rane', email: 'siddhesh.r@gmail.com', phone: '+91 98201 44521', city: 'Mumbai', planId: 'MEM-01', plan: 'Silver Explorer', members: 2, source: 'Instagram', received: '04 Oct 2025', status: 'Active', quote: '', startedOn: '04 Oct 2025', expiresOn: '03 Oct 2026' },
  { id: 'MSU-04', name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98330 21145', city: 'Pune', planId: 'MEM-03', plan: 'Platinum Elite', members: 4, source: 'Website', received: '04 Aug 2026', status: 'New', quote: '' },
  { id: 'MSU-03', name: 'Rohan Bhatt', email: 'rohan.bhatt@outlook.com', phone: '+91 99201 55420', city: 'Mumbai', planId: 'MEM-02', plan: 'Gold Voyager', members: 2, source: 'Website', received: '10 Sep 2025', status: 'Active', quote: 'QUO-1189', startedOn: '10 Sep 2025', expiresOn: '09 Sep 2026' },
];

export const signupTone = {
  New: 'amber',
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

export const invoices = [
  { id: 'INV-4412', customer: 'Rohan Bhatt', booking: 'BKG-8821', issued: '02 Aug 2026', due: '10 Aug 2026', amount: 185000, paid: 185000, status: 'Paid' },
  { id: 'INV-4411', customer: 'Ananya Deshmukh', booking: 'BKG-8820', issued: '01 Aug 2026', due: '12 Aug 2026', amount: 336000, paid: 150000, status: 'Partial' },
];

export const invoiceTone = {
  Paid: 'green',
  Partial: 'amber',
  Overdue: 'rose',
  Draft: 'slate',
};

export const payments = [
  { id: 'PAY-9931', customer: 'Ananya Deshmukh', invoice: 'INV-4411', date: '03 Aug 2026', mode: 'Bank transfer', amount: 150000, status: 'Success' },
  { id: 'PAY-9930', customer: 'Rohan Bhatt', invoice: 'INV-4412', date: '02 Aug 2026', mode: 'UPI', amount: 185000, status: 'Success' },
];

export const paymentTone = { Success: 'green', Pending: 'amber', Failed: 'rose', Refunded: 'violet' };

// -- Suppliers --------------------------------------------------------------
export const suppliers = [
  { id: 'SUP-21', name: 'Bali Sunrise DMC', category: 'DMC', region: 'Indonesia', contact: 'Wayan Putra', phone: '+62 812 4455 991', rating: 4.8, bookings: 62, status: 'Active' },
  { id: 'SUP-22', name: 'Emirates Holidays Desk', category: 'Airline', region: 'UAE', contact: 'Sara Al Nuaimi', phone: '+971 50 221 4478', rating: 4.6, bookings: 48, status: 'Active' },
];

// -- Campaigns --------------------------------------------------------------
export const campaigns = [
  { id: 'CMP-77', name: 'Monsoon Kerala Flash Sale', channel: 'WhatsApp', sent: 4820, opened: 3612, clicked: 894, leads: 63, status: 'Completed', spend: 18000 },
  { id: 'CMP-76', name: 'Bali Honeymoon — Instagram', channel: 'Instagram', sent: 22400, opened: 15380, clicked: 2104, leads: 118, status: 'Running', spend: 65000 },
];

export const campaignTone = { Running: 'green', Paused: 'amber', Completed: 'violet', Draft: 'slate' };

// -- Team -------------------------------------------------------------------
export const team = [
  { id: 'USR-02', name: 'Sneha Kulkarni', role: 'Senior Travel Consultant', email: 'sneha@smiraclub.com', phone: '+91 98211 44556', status: 'Active', live: 'Online', attendance: 'Present', activity: 'On call with Ridhima Param', lastActive: '2 min ago', tasksDone: 1, tasksTotal: 2, leads: 1, followUps: 1, calls: 3, presentations: 1, visits: 0, bookings: 1, enquiries: 2, revenue: 185000, target: 300000, productivity: 82, alerts: 0 },
  { id: 'USR-04', name: 'Kabir Menon', role: 'Travel Consultant', email: 'kabir@smiraclub.com', phone: '+91 90045 22119', status: 'Active', live: 'Online', attendance: 'Present', activity: 'Building Ladakh itinerary', lastActive: '9 min ago', tasksDone: 0, tasksTotal: 1, leads: 1, followUps: 1, calls: 2, presentations: 1, visits: 1, bookings: 1, enquiries: 2, revenue: 336000, target: 400000, productivity: 74, alerts: 1 },
];

export const consultantPerformance = team
  .filter((t) => t.bookings > 0)
  .map((t) => ({ name: t.name.split(' ')[0], enquiries: t.enquiries, bookings: t.bookings, revenue: t.revenue }));

// -- Activity feed ----------------------------------------------------------
export const activityFeed = [
  { id: 1, who: 'Sneha', what: 'confirmed booking', target: 'BKG-8821 · Bali', when: '12 min ago', tone: 'green' },
  { id: 2, who: 'Kabir', what: 'sent itinerary to', target: 'Siddhesh Rane', when: '38 min ago', tone: 'sky' },
];

export const upcomingDepartures = bookings
  .filter((b) => ['Confirmed', 'Part paid', 'Pending'].includes(b.status))
  .slice(0, 5);
