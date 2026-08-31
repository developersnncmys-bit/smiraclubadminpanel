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

export const enquiries = [
  { id: 'ENQ-2041', name: 'Siddhesh Rane', phone: '+91 98201 44521', email: 'siddhesh.r@gmail.com', destination: 'Bali', pax: 2, travelDate: '18 Sep 2026', budget: 185000, status: 'Interested', source: 'Instagram', owner: 'Kabir', label: 'Honeymoon', created: '04 Aug 2026', lastContact: 'Yesterday', nextFollowUp: 'Today 4:00 pm', priority: 'High' },
  { id: 'ENQ-2039', name: 'Rohan Bhatt', phone: '+91 99201 55420', email: 'rohan.bhatt@outlook.com', destination: 'Bali', pax: 2, travelDate: '02 Sep 2026', budget: 185000, status: 'Won', source: 'Referral', owner: 'Sneha', label: 'Honeymoon', created: '22 Jul 2026', lastContact: '28 Jul 2026', nextFollowUp: 'Departure call 30 Aug', priority: 'High' },
  { id: 'ENQ-2038', name: 'Ananya Deshmukh', phone: '+91 98330 21145', email: 'ananya.d@gmail.com', destination: 'Maldives', pax: 2, travelDate: '15 Sep 2026', budget: 336000, status: 'Won', source: 'Website', owner: 'Kabir', label: 'Luxury', created: '20 Jul 2026', lastContact: '01 Aug 2026', nextFollowUp: 'Balance payment 28 Aug', priority: 'High' },
  { id: 'ENQ-2037', name: 'Farhan Qureshi', phone: '+91 98203 71190', email: 'farhan.q@gmail.com', destination: 'Turkey', pax: 2, travelDate: '12 Oct 2026', budget: 264000, status: 'Lost', source: 'Instagram', owner: 'Sneha', label: 'Couple', created: '19 Jul 2026', lastContact: '29 Jul 2026', nextFollowUp: '—', priority: 'Low', lostReason: 'Price too high' },
  { id: 'ENQ-2036', name: 'Pooja Salvi', phone: '+91 90040 66218', email: 'pooja.salvi@gmail.com', destination: 'Goa', pax: 5, travelDate: '18 Aug 2026', budget: 74000, status: 'Lost', source: 'Google Ads', owner: 'Kabir', label: 'Family', created: '18 Jul 2026', lastContact: '26 Jul 2026', nextFollowUp: '—', priority: 'Low', lostReason: 'No response' },
  { id: 'ENQ-2040', name: 'Jayashree Patil', phone: '+91 90045 88120', email: 'jaya.patil@outlook.com', destination: 'Kerala', pax: 4, travelDate: '02 Oct 2026', budget: 96000, status: 'New', source: 'Website', owner: 'Unassigned', label: 'Family', created: '04 Aug 2026', lastContact: 'Not yet', nextFollowUp: 'Today 6:00 pm', priority: 'Medium' },
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
  {
    id: 'BKG-8821', customer: 'Rohan Bhatt', membership: 'Gold Voyager', bookingType: 'Package',
    hotel: 'Ayana Resort & Spa', vendor: 'Bali Sunrise DMC', destination: 'Bali, Indonesia',
    pkg: 'Bali Honeymoon Escape', departure: '02 Sep 2026', checkIn: '02 Sep 2026', checkOut: '08 Sep 2026',
    nights: 6, pax: 2, adults: 2, children: 0, infants: 0, rooms: 1, roomType: 'Ocean view suite',
    mealPlan: 'Breakfast included', amount: 185000, paid: 185000, status: 'Confirmed', owner: 'Sneha',
    assignedRole: 'Travel expert', created: '28 Jul 2026', source: 'Referral', freeStay: false,
    occasion: 'Honeymoon', specialNote: 'Cake and flowers in the room on arrival',
    specialRequests: 'Late check-out if possible, high floor',
    charges: { base: 168000, membershipDiscount: 16800, offerDiscount: 0, meals: 12000, taxes: 21800, extra: 0 },
    payment: { method: 'UPI', txnId: 'TXN-8841127', date: '02 Aug 2026', invoice: 'INV-4412' },
    confirmation: { status: 'Hotel confirmed', deadline: '20 Aug 2026', sent: '29 Jul 2026', voucher: 'BV-8821' },
    vendorContact: { person: 'Wayan Sudira', phone: '+62 361 702222', email: 'res@balisunrise.com', ratePlan: 'Contract 2026-A', payable: 121000 },
    handledBy: { created: 'Sneha', handled: 'Sneha', confirmed: 'Sneha', modified: '—', cancelled: '—' },
    documents: [
      { name: 'Government ID', status: 'Uploaded' },
      { name: 'Booking voucher', status: 'Uploaded' },
      { name: 'Payment receipt', status: 'Uploaded' },
      { name: 'Invoice', status: 'Uploaded' },
      { name: 'Hotel confirmation', status: 'Uploaded' },
    ],
  },
  {
    id: 'BKG-8820', customer: 'Ananya Deshmukh', membership: 'Platinum Elite', bookingType: 'Hotel',
    hotel: 'Atlantis The Palm', vendor: 'Gulf Stays LLC', destination: 'Malé, Maldives',
    pkg: 'Maldives Overwater Luxury', departure: '15 Sep 2026', checkIn: '15 Sep 2026', checkOut: '20 Sep 2026',
    nights: 5, pax: 2, adults: 2, children: 0, infants: 0, rooms: 2, roomType: 'Overwater villa',
    mealPlan: 'Half board', amount: 336000, paid: 150000, status: 'Part paid', owner: 'Kabir',
    assignedRole: 'Frontliner', created: '01 Aug 2026', source: 'Website', freeStay: true, freeNights: 2,
    occasion: 'Anniversary', specialNote: 'Two free-stay nights applied from the Platinum plan',
    specialRequests: 'Airport transfer by speedboat',
    charges: { base: 310000, membershipDiscount: 46500, offerDiscount: 5000, meals: 28000, taxes: 49500, extra: 0 },
    payment: { method: 'Bank transfer', txnId: 'TXN-8840119', date: '03 Aug 2026', invoice: 'INV-4411' },
    confirmation: { status: 'Sent to hotel', deadline: '30 Aug 2026', sent: '04 Aug 2026', voucher: '—' },
    vendorContact: { person: 'Imran Haleem', phone: '+960 664 0011', email: 'bookings@gulfstays.com', ratePlan: 'Contract 2026-M', payable: 214000 },
    handledBy: { created: 'Kabir', handled: 'Kabir', confirmed: '—', modified: 'Sneha', cancelled: '—' },
    documents: [
      { name: 'Government ID', status: 'Uploaded' },
      { name: 'Booking voucher', status: 'Pending' },
      { name: 'Payment receipt', status: 'Uploaded' },
      { name: 'Invoice', status: 'Uploaded' },
      { name: 'Hotel confirmation', status: 'Waiting' },
    ],
  },
];

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
export const customers = [
  {
    id: 'CUS-512', name: 'Ananya Deshmukh', phone: '+91 98330 21145', email: 'ananya.d@gmail.com',
    city: 'Pune', trips: 1, spend: 336000, tier: 'Gold', last: '04 Aug 2026',
    dob: '1994-06-19', special: '2022-03-08', specialLabel: 'Anniversary',
    childBirthday: '2019-09-02', source: 'Website',
    address: '31 Koregaon Park Annexe, Pune 411001', giftsGiven: [],
    membership: 'MSU-04', expert: 'Sneha', family: 4,
    preferences: ['Beach', 'Luxury stays', 'Direct flights'],
    engagement: 'Active', lastBooking: '04 Aug 2026', lastInteraction: '05 Aug 2026',
    lastMessage: 'WhatsApp — payment link sent', satisfaction: 4, complaint: '',
    referral: { code: 'ANANYA10', total: 2, qualified: 1, converted: 0, earned: 0, redeemed: 0, pending: 2500 },
    communication: [
      { at: '05 Aug 2026', kind: 'WhatsApp', text: 'Payment link for the Platinum membership' },
      { at: '04 Aug 2026', kind: 'Call', text: 'Sneha explained the plan benefits' },
    ],
  },
  {
    id: 'CUS-511', name: 'Rohan Bhatt', phone: '+91 99201 55420', email: 'rohan.bhatt@outlook.com',
    city: 'Mumbai', trips: 1, spend: 185000, tier: 'Gold', last: '28 Jul 2026',
    dob: '1989-01-24', special: '2017-05-21', specialLabel: 'Anniversary',
    childBirthday: '2015-08-30', source: 'Website',
    address: 'A-1202 Oberoi Splendor, Jogeshwari East, Mumbai 400060',
    giftsGiven: [{ gift: 'Welcome travel kit on joining', date: '05 Aug 2026' }],
    membership: 'MSU-03', expert: 'Sneha', family: 3,
    preferences: ['Honeymoon', 'Island stays', 'Vegetarian meals'],
    engagement: 'Highly engaged', lastBooking: '28 Jul 2026', lastInteraction: '18 Aug 2026',
    lastMessage: 'Call — renewal conversation', satisfaction: 5, complaint: '',
    referral: { code: 'ROHAN15', total: 3, qualified: 2, converted: 1, earned: 5000, redeemed: 0, pending: 2500 },
    communication: [
      { at: '18 Aug 2026', kind: 'Call', text: 'Renewal discussed — interested after the Bali trip' },
      { at: '28 Jul 2026', kind: 'WhatsApp', text: 'Bali booking confirmation sent' },
      { at: '11 Sep 2025', kind: 'Meeting', text: 'Membership handover and welcome kit' },
    ],
  },
];

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
export const rewardGrants = [
  {
    id: 'RWD-01', member: 'Rohan Bhatt', kind: 'Welcome gift', gift: 'Welcome travel kit on joining',
    eligibility: 'On joining Gold Voyager', assigned: '05 Aug 2026', due: '12 Aug 2026',
    officer: 'Ritik', stage: 'Delivered', proof: 'Signed handover slip', notes: 'Handed over at the Mumbai desk',
  },
  {
    id: 'RWD-02', member: 'Rohan Bhatt', kind: 'Birthday gift', gift: 'Birthday greeting card and cake voucher',
    eligibility: 'Birthday 24 Jan', assigned: '—', due: '24 Jan 2027',
    officer: 'Ritik', stage: 'Eligible', proof: '—', notes: 'Queue with the January batch',
  },
  {
    id: 'RWD-03', member: 'Ananya Deshmukh', kind: 'Membership gift', gift: 'Platinum luggage set',
    eligibility: 'On activating Platinum Elite', assigned: '—', due: '11 Aug 2026',
    officer: 'Ritik', stage: 'Pending', proof: '—', notes: 'Waiting on the membership payment',
  },
  {
    id: 'RWD-04', member: 'Rohan Bhatt', kind: 'Referral reward', gift: '₹5,000 travel credit',
    eligibility: '1 referral converted', assigned: '02 Aug 2026', due: '20 Aug 2026',
    officer: 'Sneha', stage: 'Approved', proof: '—', notes: 'Credit to be applied on the next booking',
  },
];

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
export const tasks = [
  { id: 'TSK-311', title: 'Share revised Bali itinerary', customer: 'Siddhesh Rane', type: 'Send itinerary', due: '04 Aug 2026, 11:45 am', owner: 'Kabir', bucket: 'today', priority: 'High', note: 'Client wants a pool villa option and a private candlelight dinner added.' },
  { id: 'TSK-310', title: 'Collect passport copies', customer: 'Rohan Bhatt', type: 'Documents', due: '04 Aug 2026, 04:30 pm', owner: 'Sneha', bucket: 'today', priority: 'High', note: '2 of 6 passports still pending. Visa filing deadline is 08 Aug.' },
  { id: 'TSK-325', title: 'Call Meera Iyer on the Andaman quote', customer: 'Meera Iyer', lead: 'LEAD-2291', type: 'Call', due: '31 Aug 2026, 04:30 pm', created: '31 Aug 2026, 09:40 am', owner: 'Rahul', createdBy: 'Vikram', bucket: 'today', priority: 'High', status: 'In progress', lastAction: 'Called at 3:12 pm — connected', nextAction: 'Share the 4N5D quote', note: 'Wants a beachfront resort and a private ferry transfer.' },
  { id: 'TSK-324', title: 'Day 3 follow-up — Nikhil Sethi', customer: 'Nikhil Sethi', lead: 'LEAD-2284', type: 'Follow-up', due: '31 Aug 2026, 02:00 pm', created: '28 Aug 2026, 11:10 am', owner: 'Rahul', createdBy: 'Rahul', bucket: 'overdue', priority: 'High', status: 'Overdue', lastAction: 'Presentation completed on 29 Aug', nextAction: 'Call and re-pitch Gold Voyager', note: 'Presentation done, decision pending since Friday.' },
  { id: 'TSK-323', title: 'Send Kerala package on WhatsApp', customer: 'Farhan Qureshi', lead: 'LEAD-2288', type: 'WhatsApp', due: '31 Aug 2026, 05:00 pm', created: '31 Aug 2026, 10:05 am', owner: 'Rahul', createdBy: 'Rahul', bucket: 'today', priority: 'Medium', status: 'Pending', lastAction: 'Quote drafted', nextAction: 'Send the PDF and confirm receipt', note: '' },
  { id: 'TSK-322', title: 'Platinum walkthrough — Sanjana Kapoor', customer: 'Sanjana Kapoor', lead: 'LEAD-2279', type: 'Presentation', due: '31 Aug 2026, 03:00 pm', created: '29 Aug 2026, 04:20 pm', owner: 'Priya', createdBy: 'Priya', bucket: 'today', priority: 'High', status: 'In progress', lastAction: 'Walkthrough started at 3:00 pm', nextAction: 'Send inclusions and the payment link', note: 'Family of four, Europe in December.' },
  { id: 'TSK-321', title: 'Home visit — Powai', customer: 'Sanjana Kapoor', lead: 'LEAD-2279', type: 'Customer Visit', due: '31 Aug 2026, 02:15 pm', created: '30 Aug 2026, 06:00 pm', owner: 'Imran', createdBy: 'Priya', bucket: 'today', priority: 'High', status: 'In progress', lastAction: 'Checked in at 2:15 pm', nextAction: 'Check out and log the outcome', note: 'Field officer assigned by Priya.' },
  { id: 'TSK-320', title: 'Collect ₹1,86,000 balance on BKG-8824', customer: 'Ananya Deshmukh', lead: 'LEAD-2266', type: 'Payment Follow-up', due: '30 Aug 2026, 06:00 pm', created: '26 Aug 2026, 12:30 pm', owner: 'Neha', createdBy: 'Vikram', bucket: 'overdue', priority: 'High', status: 'Overdue', lastAction: 'Reminder sent on 28 Aug', nextAction: 'Send a payment link and call', note: 'Balance due before the 28th — now overdue.' },
  { id: 'TSK-319', title: 'Membership activation — Rohan Bhatt', customer: 'Rohan Bhatt', lead: 'LEAD-2271', type: 'Membership Activation', due: '31 Aug 2026, 06:00 pm', created: '30 Aug 2026, 10:00 am', owner: 'Divya', createdBy: 'Sneha', bucket: 'today', priority: 'Medium', status: 'In progress', lastAction: 'Payment confirmed', nextAction: 'Issue the membership card', note: 'Gold Voyager, paid in full.' },
  { id: 'TSK-318', title: 'File Schengen visa — Kapoor party', customer: 'Sanjana Kapoor', lead: 'LEAD-2279', type: 'Documentation', due: '31 Aug 2026, 06:00 pm', created: '29 Aug 2026, 09:15 am', owner: 'Divya', createdBy: 'Divya', bucket: 'today', priority: 'High', status: 'In progress', lastAction: 'Passports collected', nextAction: 'Submit at the VFS centre', note: '' },
  { id: 'TSK-317', title: 'Retry call — Ritu Malhotra', customer: 'Ritu Malhotra', lead: 'LEAD-2290', type: 'Call', due: '31 Aug 2026, 04:30 pm', created: '31 Aug 2026, 11:00 am', owner: 'Amit', createdBy: 'Vikram', bucket: 'today', priority: 'Medium', status: 'Pending', lastAction: 'Two attempts — not answered', nextAction: 'Third attempt before end of day', note: 'Two attempts, not answered.' },
  { id: 'TSK-316', title: 'Final follow-up — Dhruv Malhotra', customer: 'Dhruv Malhotra', lead: 'LEAD-2277', type: 'Follow-up', due: '30 Aug 2026, 05:00 pm', created: '24 Aug 2026, 03:40 pm', owner: 'Amit', createdBy: 'Amit', bucket: 'overdue', priority: 'High', status: 'Overdue', lastAction: 'Fifth follow-up on 27 Aug', nextAction: 'Close or mark lost', note: 'Sixth touch. No response since the 27th.' },
  { id: 'TSK-315', title: 'Booking follow-up — BKG-8821', customer: 'Siddhesh Rane', lead: 'LEAD-2263', type: 'Booking Follow-up', due: '31 Aug 2026, 01:00 pm', created: '30 Aug 2026, 02:00 pm', owner: 'Kabir', createdBy: 'Vikram', bucket: 'done', priority: 'Medium', status: 'Completed', lastAction: 'Hotel voucher shared', nextAction: '—', note: 'Hotel confirmation shared with the customer.' },
  { id: 'TSK-314', title: 'Day 1 follow-up — Aarti Menon', customer: 'Aarti Menon', lead: 'LEAD-2293', type: 'Follow-up', due: '31 Aug 2026, 11:30 am', created: '30 Aug 2026, 05:30 pm', owner: 'Priya', createdBy: 'Priya', bucket: 'done', priority: 'Medium', status: 'Completed', lastAction: 'Called at 11:20 am', nextAction: 'Day 3 on 02 Sep', note: '' },
  { id: 'TSK-313', title: 'Schedule the Vashi visit', customer: 'Karan Shetty', lead: 'LEAD-2286', type: 'Customer Visit', due: '31 Aug 2026, 12:00 pm', created: '29 Aug 2026, 06:15 pm', owner: 'Imran', createdBy: 'Vikram', bucket: 'done', priority: 'Medium', status: 'Completed', lastAction: 'Visit completed at 12:10 pm', nextAction: 'Send the meeting notes', note: 'Membership discussed, closing likely.' },
  { id: 'TSK-312', title: 'Reconcile yesterday’s UPI collections', customer: '—', lead: '—', type: 'Documentation', due: '31 Aug 2026, 10:00 am', created: '30 Aug 2026, 07:00 pm', owner: 'Neha', createdBy: 'Vikram', bucket: 'overdue', priority: 'Medium', status: 'Overdue', lastAction: 'Statement downloaded', nextAction: 'Match the gateway settlement file', note: 'Blocked — employee has not logged in today.' },
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
export const memberSignups = [
  {
    id: 'MSU-09', name: 'Siddhesh Rane', email: 'siddhesh.r@gmail.com', phone: '+91 98201 44521', city: 'Mumbai',
    address: '12 Carter Road, Bandra West, Mumbai 400050', family: 2, branch: 'Mumbai',
    planId: 'MEM-01', plan: 'Silver Explorer', members: 2, source: 'Instagram', received: '04 Oct 2025',
    status: 'Active', quote: '', startedOn: '04 Oct 2025', expiresOn: '03 Oct 2026',
    amount: 5899, paid: 5899, expert: 'Kabir', fieldOfficer: 'Ritik',
    activation: { stage: 'Activated', date: '05 Oct 2025', deadline: '11 Oct 2025', contacted: true, explained: true, documents: true, gift: 'Given' },
    renewal: { stage: 'Renewal contacted', contactedOn: '14 Aug 2026', note: 'Asked for a Gold upgrade quote' },
    benefits: [
      { name: 'Free hotel stays', allocated: 1, used: 0 },
      { name: 'Luxury hotel discounts', allocated: 4, used: 1 },
      { name: 'Travel packages', allocated: 2, used: 1 },
      { name: 'Transport benefits', allocated: 2, used: 0 },
      { name: 'Restaurant benefits', allocated: 4, used: 2 },
    ],
    saving: 18400,
    timeline: [
      { step: 'Lead created', at: '28 Sep 2025', note: 'Came in from Instagram' },
      { step: 'Membership sold', at: '04 Oct 2025', note: 'Silver Explorer, 2 members' },
      { step: 'Payment', at: '04 Oct 2025', note: '₹5,899 by UPI' },
      { step: 'Activation', at: '05 Oct 2025', note: 'Welcome kit handed over' },
      { step: 'Expert call', at: '06 Oct 2025', note: 'Kabir explained the benefits' },
      { step: 'Benefit used', at: '18 Feb 2026', note: 'Restaurant benefit — Goa' },
      { step: 'Follow-up', at: '14 Aug 2026', note: 'Renewal conversation started' },
    ],
  },
  {
    id: 'MSU-04', name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98330 21145', city: 'Pune',
    address: '31 Koregaon Park Annexe, Pune 411001', family: 4, branch: 'Pune',
    planId: 'MEM-03', plan: 'Platinum Elite', members: 4, source: 'Website', received: '04 Aug 2026',
    status: 'New', quote: '', amount: 35396, paid: 0, expert: 'Sneha', fieldOfficer: '—',
    activation: { stage: 'Payment pending', date: '—', deadline: '11 Aug 2026', contacted: true, explained: false, documents: false, gift: 'Not given' },
    renewal: { stage: '—', contactedOn: '—', note: '' },
    benefits: [
      { name: 'Free hotel stays', allocated: 2, used: 0 },
      { name: 'Luxury hotel discounts', allocated: 8, used: 0 },
      { name: 'Travel packages', allocated: 4, used: 0 },
      { name: 'Transport benefits', allocated: 4, used: 0 },
      { name: 'Restaurant benefits', allocated: 8, used: 0 },
    ],
    saving: 0,
    timeline: [
      { step: 'Lead created', at: '04 Aug 2026', note: 'Signed up on the website' },
      { step: 'Membership sold', at: '04 Aug 2026', note: 'Platinum Elite, 4 members' },
      { step: 'Follow-up', at: '05 Aug 2026', note: 'Sneha called about the payment link' },
    ],
  },
  {
    id: 'MSU-03', name: 'Rohan Bhatt', email: 'rohan.bhatt@outlook.com', phone: '+91 99201 55420', city: 'Mumbai',
    address: 'A-1202 Oberoi Splendor, Jogeshwari East, Mumbai 400060', family: 3, branch: 'Mumbai',
    planId: 'MEM-02', plan: 'Gold Voyager', members: 2, source: 'Website', received: '10 Sep 2025',
    status: 'Active', quote: 'QUO-1189', startedOn: '10 Sep 2025', expiresOn: '09 Sep 2026',
    amount: 23598, paid: 23598, expert: 'Sneha', fieldOfficer: 'Ritik',
    activation: { stage: 'Activated', date: '11 Sep 2025', deadline: '17 Sep 2025', contacted: true, explained: true, documents: true, gift: 'Given' },
    renewal: { stage: 'Renewal interested', contactedOn: '18 Aug 2026', note: 'Will renew after the Bali trip' },
    benefits: [
      { name: 'Free hotel stays', allocated: 2, used: 1 },
      { name: 'Luxury hotel discounts', allocated: 6, used: 3 },
      { name: 'Travel packages', allocated: 3, used: 1 },
      { name: 'Transport benefits', allocated: 3, used: 1 },
      { name: 'Restaurant benefits', allocated: 6, used: 4 },
    ],
    saving: 42600,
    timeline: [
      { step: 'Lead created', at: '02 Sep 2025', note: 'Website enquiry' },
      { step: 'Membership sold', at: '10 Sep 2025', note: 'Gold Voyager, 2 members' },
      { step: 'Payment', at: '10 Sep 2025', note: '₹23,598 by bank transfer' },
      { step: 'Activation', at: '11 Sep 2025', note: 'Welcome kit handed over' },
      { step: 'Expert call', at: '12 Sep 2025', note: 'Sneha walked through the plan' },
      { step: 'Hotel booking', at: '28 Jul 2026', note: 'BKG-8821 — Bali, 10% member discount' },
      { step: 'Renewal', at: '18 Aug 2026', note: 'Interested, expires 09 Sep 2026' },
    ],
  },
];

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
  {
    id: 'USR-02', empId: 'EMP-102', name: 'Sneha Kulkarni', role: 'Senior Travel Consultant',
    department: 'Sales desk', email: 'sneha@smiraclub.com', phone: '+91 98211 44556', status: 'Active',
    live: 'Online', attendance: 'Present',
    activity: 'On call with Ridhima Param', activityType: 'Calling leads', activityStarted: '03:12 pm',
    lastActive: '2 min ago', lastActivityKind: 'Lead call',
    // Attendance for today, and the month behind it
    day: {
      login: '09:58 am', logout: '—', working: '6h 12m', breaks: '38m', idle: '12m',
      lateBy: 0, mode: 'Office', source: 'Web app', regularisation: 'None pending', attendancePct: 96,
    },
    // The client's per-column detail
    callDetail: { connected: 2, notAnswered: 1, busy: 0, wrongNumber: 0, interested: 1, notInterested: 0, callback: 1, avgDuration: '4m 20s', talkTime: '12m' },
    presentationDetail: { scheduled: 1, completed: 1, cancelled: 0, noShow: 0, rescheduled: 0, converted: 1, pending: 0 },
    visitDetail: { scheduled: 0, completed: 0, upcoming: 0, cancelled: 0, noShow: 0, converted: 0, revenue: 0 },
    followUpDetail: { due: 1, completed: 1, pending: 0, overdue: 0, missed: 0, rescheduled: 0 },
    taskDetail: { pending: 1, overdue: 0, inProgress: 1, cancelled: 0, rescheduled: 0 },
    pipeline: { fresh: 0, contacted: 0, interested: 0, presentation: 0, visit: 0, hot: 0, closing: 1 },
    salesDetail: { today: 0, mtd: 1, closings: 1, pending: 0, cancelled: 0, avgTicket: 185000, byPlan: { Silver: 1, Gold: 0, Platinum: 0 } },
    revenueDetail: { today: 0, mtd: 185000, previous: 142000, collected: 185000, pending: 0, refund: 0, outstanding: 0,
      sources: { Membership: 5899, Booking: 179101, Addons: 0 } },
    targets: { leads: 4, calls: 10, presentations: 2, visits: 1, closings: 2, revenue: 300000 },
    score: { attendance: 10, calls: 12, connected: 8, followUps: 15, presentations: 13, visits: 4, closings: 16, discipline: 4 },
    notices: [
      { level: 'positive', text: 'Closed Bali Honeymoon Escape — ₹1,85,000', at: '11:20 am' },
      { level: 'warning', text: 'One callback requested and not yet booked', at: '01:05 pm' },
    ],
    attendanceFlags: [],
    activityLog: [
      { at: '03:12 pm', kind: 'Lead call', text: 'On call with Ridhima Param' },
      { at: '02:35 pm', kind: 'WhatsApp follow-up', text: 'Sent the Bali inclusions sheet' },
      { at: '01:20 pm', kind: 'Presentation', text: 'Gold Voyager walkthrough — Rohan Bhatt' },
      { at: '11:20 am', kind: 'Closing', text: 'Closed Bali Honeymoon Escape — ₹1,85,000' },
      { at: '09:58 am', kind: 'Login', text: 'Logged in from the office — web app' },
    ],
    followUpMix: { day1: 1, day3: 0, day6: 0, final: 0, payment: 0, presentation: 0, visit: 0, membership: 0 },
    leadMix: { fresh: 0, contacted: 0, interested: 0, presentationPending: 0, presentationDone: 1, visitScheduled: 0, followUpPending: 0, hot: 0, warm: 1, cold: 0, noResponse: 0, closed: 1, lost: 0 },
    current: { customer: 'Ridhima Param', next: 'Send revised quote by 5:00 pm' },
    tasksDone: 1, tasksTotal: 2, leads: 1, followUps: 1, calls: 3, presentations: 1, visits: 0,
    bookings: 1, enquiries: 2, revenue: 185000, target: 300000, productivity: 82, alerts: 1,
  },
  {
    id: 'USR-04', empId: 'EMP-104', name: 'Kabir Menon', role: 'Travel Consultant',
    department: 'Sales desk', email: 'kabir@smiraclub.com', phone: '+91 90045 22119', status: 'Active',
    live: 'On customer visit', attendance: 'Present',
    activity: 'Customer meeting — Bandra', activityType: 'Customer visit', activityStarted: '02:40 pm',
    lastActive: '9 min ago', lastActivityKind: 'Visit check-in',
    day: {
      login: '10:22 am', logout: '—', working: '5h 48m', breaks: '52m', idle: '26m',
      lateBy: 22, mode: 'Field', source: 'Mobile app', geo: 'Bandra, Mumbai — geo verified', regularisation: 'Late login — pending', attendancePct: 88,
    },
    callDetail: { connected: 1, notAnswered: 1, busy: 0, wrongNumber: 0, interested: 1, notInterested: 0, callback: 0, avgDuration: '6m 05s', talkTime: '9m' },
    presentationDetail: { scheduled: 2, completed: 1, cancelled: 0, noShow: 1, rescheduled: 0, converted: 1, pending: 1 },
    visitDetail: { scheduled: 1, completed: 1, upcoming: 0, cancelled: 0, noShow: 0, converted: 1, revenue: 336000 },
    followUpDetail: { due: 2, completed: 1, pending: 0, overdue: 1, missed: 0, rescheduled: 0 },
    taskDetail: { pending: 1, overdue: 1, inProgress: 0, cancelled: 0, rescheduled: 0 },
    pipeline: { fresh: 0, contacted: 0, interested: 1, presentation: 0, visit: 1, hot: 1, closing: 1 },
    salesDetail: { today: 1, mtd: 1, closings: 1, pending: 1, cancelled: 0, avgTicket: 336000, byPlan: { Silver: 0, Gold: 1, Platinum: 0 } },
    revenueDetail: { today: 336000, mtd: 336000, previous: 210000, collected: 150000, pending: 186000, refund: 0, outstanding: 186000,
      sources: { Membership: 23598, Booking: 312402, Addons: 0 } },
    targets: { leads: 4, calls: 10, presentations: 2, visits: 2, closings: 2, revenue: 400000 },
    score: { attendance: 7, calls: 9, connected: 6, followUps: 10, presentations: 14, visits: 9, closings: 16, discipline: 3 },
    notices: [
      { level: 'critical', text: 'Follow-up on Siddhesh Rane is overdue', at: '12:40 pm' },
      { level: 'warning', text: 'Logged in 22 minutes late — regularisation pending', at: '10:22 am' },
      { level: 'positive', text: 'Maldives visit converted — ₹3,36,000', at: '03:05 pm' },
    ],
    attendanceFlags: ['Late login', 'Attendance regularisation pending'],
    visitTrack: { stage: 'Meeting', place: 'Bandra, Mumbai', checkIn: '02:40 pm', checkOut: '—' },
    activityLog: [
      { at: '02:40 pm', kind: 'Visit check-in', text: 'Checked in at Bandra — Ananya Deshmukh' },
      { at: '01:55 pm', kind: 'En route', text: 'Left for the Bandra customer meeting' },
      { at: '12:40 pm', kind: 'Follow-up', text: 'Follow-up on Siddhesh Rane went overdue' },
      { at: '10:22 am', kind: 'Login', text: 'Logged in 22 minutes late — mobile app' },
    ],
    followUpMix: { day1: 1, day3: 1, day6: 0, final: 0, payment: 0, presentation: 0, visit: 0, membership: 0 },
    leadMix: { fresh: 0, contacted: 0, interested: 1, presentationPending: 1, presentationDone: 1, visitScheduled: 1, followUpPending: 1, hot: 1, warm: 0, cold: 0, noResponse: 0, closed: 1, lost: 0 },
    current: { customer: 'Ananya Deshmukh', next: 'Collect balance ₹1,86,000 by 28 Aug' },
    tasksDone: 0, tasksTotal: 1, leads: 1, followUps: 1, calls: 2, presentations: 1, visits: 1,
    bookings: 1, enquiries: 2, revenue: 336000, target: 400000, productivity: 74, alerts: 2,
  },
  {
    id: 'USR-05', empId: 'EMP-101', name: 'Rahul Sharma', role: 'Travel Consultant',
    department: 'Lead desk', email: 'rahul@smiraclub.com', phone: '+91 98765 43210', status: 'Active',
    live: 'Online', attendance: 'Present',
    activity: 'Calling fresh leads from the Instagram campaign', activityType: 'Calling leads', activityStarted: '03:12 pm',
    lastActive: '1 min ago', lastActivityKind: 'Lead call',
    day: {
      login: '09:32 am', logout: '—', working: '7h 04m', breaks: '26m', idle: '08m',
      lateBy: 0, mode: 'Office', source: 'Web app', regularisation: 'None pending', attendancePct: 98,
    },
    attendanceFlags: [],
    activityLog: [
      { at: '03:12 pm', kind: 'Lead call', text: 'Calling Meera Iyer — Andaman enquiry' },
      { at: '02:48 pm', kind: 'WhatsApp follow-up', text: 'Sent Kerala quote to Farhan Qureshi' },
      { at: '02:05 pm', kind: 'Presentation', text: 'Gold Voyager walkthrough with Nikhil Sethi' },
      { at: '01:10 pm', kind: 'Break', text: 'Lunch break — 26 minutes' },
      { at: '11:40 am', kind: 'Lead qualification', text: 'Qualified 6 website leads' },
      { at: '09:32 am', kind: 'Login', text: 'Logged in from the office — web app' },
    ],
    callDetail: { connected: 21, notAnswered: 14, busy: 5, wrongNumber: 3, interested: 9, notInterested: 6, callback: 4, avgDuration: '3m 48s', talkTime: '1h 22m' },
    presentationDetail: { scheduled: 5, completed: 4, cancelled: 0, noShow: 1, rescheduled: 1, converted: 1, pending: 2 },
    visitDetail: { scheduled: 1, completed: 0, upcoming: 1, cancelled: 0, noShow: 0, converted: 0, revenue: 0 },
    followUpDetail: { due: 8, completed: 5, pending: 2, overdue: 1, missed: 0, rescheduled: 1 },
    followUpMix: { day1: 3, day3: 2, day6: 1, final: 1, payment: 1, presentation: 0, visit: 0, membership: 0 },
    taskDetail: { pending: 4, overdue: 2, inProgress: 2, cancelled: 0, rescheduled: 1 },
    pipeline: { fresh: 24, contacted: 18, interested: 14, presentation: 9, visit: 4, hot: 7, closing: 3 },
    leadMix: { fresh: 24, contacted: 18, interested: 14, presentationPending: 5, presentationDone: 4, visitScheduled: 4, followUpPending: 8, hot: 7, warm: 12, cold: 9, noResponse: 6, closed: 3, lost: 2 },
    salesDetail: { today: 1, mtd: 3, closings: 3, pending: 2, cancelled: 0, avgTicket: 140000, byPlan: { Silver: 2, Gold: 1, Platinum: 0 } },
    revenueDetail: { today: 96000, mtd: 420000, previous: 385000, collected: 340000, pending: 80000, refund: 0, outstanding: 80000,
      sources: { Membership: 41000, Booking: 349000, Addons: 30000 } },
    targets: { leads: 40, calls: 45, presentations: 5, visits: 2, closings: 4, revenue: 500000 },
    score: { attendance: 10, calls: 14, connected: 9, followUps: 12, presentations: 13, visits: 5, closings: 18, discipline: 5 },
    notices: [
      { level: 'warning', text: 'Lead workload is 85 — highest on the desk', at: '09:40 am' },
      { level: 'warning', text: 'One follow-up on Meera Iyer is overdue', at: '02:20 pm' },
      { level: 'positive', text: 'Closed Andaman Island Hopper — ₹96,000', at: '12:15 pm' },
    ],
    current: { customer: 'Meera Iyer', next: 'Send Andaman quote by 5:30 pm' },
    tasksDone: 6, tasksTotal: 10, leads: 85, followUps: 8, calls: 47, presentations: 4, visits: 1,
    bookings: 3, enquiries: 12, revenue: 420000, target: 500000, productivity: 86, alerts: 2,
  },
  {
    id: 'USR-06', empId: 'EMP-103', name: 'Amit Verma', role: 'Travel Consultant',
    department: 'Lead desk', email: 'amit@smiraclub.com', phone: '+91 99201 33447', status: 'Active',
    live: 'Idle', attendance: 'Present',
    activity: 'No activity since the last call ended', activityType: 'Idle', activityStarted: '02:26 pm',
    lastActive: '34 min ago', lastActivityKind: 'Lead call',
    day: {
      login: '10:04 am', logout: '—', working: '5h 22m', breaks: '1h 05m', idle: '48m',
      lateBy: 4, mode: 'Office', source: 'Web app', regularisation: 'None pending', attendancePct: 91,
    },
    attendanceFlags: ['Excessive break', 'Low working hours', 'No calls in the last 34 minutes', 'Screen idle timer running'],
    activityLog: [
      { at: '02:26 pm', kind: 'Lead call', text: 'Called Ritu Malhotra — not answered' },
      { at: '01:15 pm', kind: 'Break', text: 'Break — 1h 05m' },
      { at: '11:52 am', kind: 'WhatsApp follow-up', text: 'Followed up with 4 cold leads' },
      { at: '10:04 am', kind: 'Login', text: 'Logged in 4 minutes late — web app' },
    ],
    callDetail: { connected: 6, notAnswered: 9, busy: 2, wrongNumber: 1, interested: 2, notInterested: 4, callback: 1, avgDuration: '2m 10s', talkTime: '21m' },
    presentationDetail: { scheduled: 2, completed: 1, cancelled: 1, noShow: 0, rescheduled: 0, converted: 0, pending: 1 },
    visitDetail: { scheduled: 0, completed: 0, upcoming: 0, cancelled: 0, noShow: 0, converted: 0, revenue: 0 },
    followUpDetail: { due: 7, completed: 2, pending: 3, overdue: 2, missed: 1, rescheduled: 0 },
    followUpMix: { day1: 2, day3: 2, day6: 1, final: 1, payment: 0, presentation: 1, visit: 0, membership: 0 },
    taskDetail: { pending: 5, overdue: 3, inProgress: 1, cancelled: 1, rescheduled: 0 },
    pipeline: { fresh: 12, contacted: 9, interested: 5, presentation: 2, visit: 1, hot: 2, closing: 0 },
    leadMix: { fresh: 12, contacted: 9, interested: 5, presentationPending: 1, presentationDone: 1, visitScheduled: 0, followUpPending: 7, hot: 2, warm: 6, cold: 11, noResponse: 8, closed: 0, lost: 4 },
    salesDetail: { today: 0, mtd: 1, closings: 1, pending: 1, cancelled: 1, avgTicket: 68000, byPlan: { Silver: 1, Gold: 0, Platinum: 0 } },
    revenueDetail: { today: 0, mtd: 68000, previous: 154000, collected: 40000, pending: 28000, refund: 0, outstanding: 28000,
      sources: { Membership: 5899, Booking: 62101, Addons: 0 } },
    targets: { leads: 30, calls: 35, presentations: 4, visits: 1, closings: 3, revenue: 300000 },
    score: { attendance: 6, calls: 6, connected: 4, followUps: 5, presentations: 6, visits: 2, closings: 6, discipline: 2 },
    notices: [
      { level: 'critical', text: 'No activity for 34 minutes', at: '03:00 pm' },
      { level: 'critical', text: 'Two follow-ups overdue, one missed', at: '01:30 pm' },
      { level: 'warning', text: 'Break time 1h 05m — above the 45 minute limit', at: '02:20 pm' },
    ],
    current: { customer: 'Ritu Malhotra', next: 'Retry the call before 4:30 pm' },
    tasksDone: 2, tasksTotal: 9, leads: 38, followUps: 7, calls: 18, presentations: 1, visits: 0,
    bookings: 1, enquiries: 7, revenue: 68000, target: 300000, productivity: 37, alerts: 3,
  },
  {
    id: 'USR-07', empId: 'EMP-105', name: 'Priya Nair', role: 'Senior Travel Consultant',
    department: 'Sales desk', email: 'priya@smiraclub.com', phone: '+91 98330 77218', status: 'Active',
    live: 'In meeting', attendance: 'Work from home',
    activity: 'Platinum plan walkthrough — Sanjana Kapoor', activityType: 'Presentation', activityStarted: '03:00 pm',
    lastActive: 'now', lastActivityKind: 'Presentation',
    day: {
      login: '09:12 am', logout: '—', working: '7h 26m', breaks: '22m', idle: '05m',
      lateBy: 0, mode: 'WFH', source: 'Web app', regularisation: 'Approved', attendancePct: 97,
    },
    attendanceFlags: [],
    activityLog: [
      { at: '03:00 pm', kind: 'Presentation', text: 'Platinum walkthrough with Sanjana Kapoor' },
      { at: '01:35 pm', kind: 'Payment follow-up', text: 'Collected ₹1,20,000 from Dhruv Malhotra' },
      { at: '11:20 am', kind: 'Lead call', text: 'Closed Santorini package — ₹5,40,000' },
      { at: '09:12 am', kind: 'Login', text: 'Logged in from home — regularisation approved' },
    ],
    callDetail: { connected: 14, notAnswered: 5, busy: 1, wrongNumber: 0, interested: 8, notInterested: 2, callback: 3, avgDuration: '6m 32s', talkTime: '1h 34m' },
    presentationDetail: { scheduled: 4, completed: 3, cancelled: 0, noShow: 0, rescheduled: 1, converted: 2, pending: 1 },
    visitDetail: { scheduled: 1, completed: 1, upcoming: 0, cancelled: 0, noShow: 0, converted: 1, revenue: 540000 },
    followUpDetail: { due: 6, completed: 6, pending: 0, overdue: 0, missed: 0, rescheduled: 0 },
    followUpMix: { day1: 2, day3: 1, day6: 1, final: 0, payment: 1, presentation: 1, visit: 0, membership: 0 },
    taskDetail: { pending: 2, overdue: 0, inProgress: 1, cancelled: 0, rescheduled: 0 },
    pipeline: { fresh: 6, contacted: 8, interested: 9, presentation: 6, visit: 3, hot: 5, closing: 4 },
    leadMix: { fresh: 6, contacted: 8, interested: 9, presentationPending: 1, presentationDone: 3, visitScheduled: 1, followUpPending: 0, hot: 5, warm: 7, cold: 3, noResponse: 2, closed: 4, lost: 1 },
    salesDetail: { today: 1, mtd: 4, closings: 4, pending: 1, cancelled: 0, avgTicket: 232000, byPlan: { Silver: 0, Gold: 2, Platinum: 2 } },
    revenueDetail: { today: 540000, mtd: 928000, previous: 610000, collected: 808000, pending: 120000, refund: 0, outstanding: 120000,
      sources: { Membership: 118000, Booking: 730000, Addons: 80000 } },
    targets: { leads: 25, calls: 30, presentations: 5, visits: 2, closings: 4, revenue: 800000 },
    score: { attendance: 10, calls: 13, connected: 10, followUps: 15, presentations: 14, visits: 9, closings: 19, discipline: 5 },
    notices: [
      { level: 'positive', text: 'Target achieved — 116% of ₹8,00,000', at: '11:20 am' },
      { level: 'positive', text: 'Highest conversion on the desk — 67%', at: '02:40 pm' },
    ],
    current: { customer: 'Sanjana Kapoor', next: 'Send Platinum inclusions and payment link' },
    tasksDone: 7, tasksTotal: 9, leads: 34, followUps: 6, calls: 20, presentations: 3, visits: 1,
    bookings: 4, enquiries: 9, revenue: 928000, target: 800000, productivity: 95, alerts: 0,
  },
  {
    id: 'USR-08', empId: 'EMP-106', name: 'Imran Shaikh', role: 'Field Officer',
    department: 'Field team', email: 'imran@smiraclub.com', phone: '+91 90820 11994', status: 'Active',
    live: 'On customer visit', attendance: 'Field visit',
    activity: 'Home visit — Powai, Sanjana Kapoor', activityType: 'Customer visit', activityStarted: '02:15 pm',
    lastActive: '6 min ago', lastActivityKind: 'Visit check-in',
    day: {
      login: '09:48 am', logout: '—', working: '6h 40m', breaks: '35m', idle: '18m',
      lateBy: 0, mode: 'Field', source: 'Mobile app', geo: 'Powai, Mumbai — geo verified', regularisation: 'None pending', attendancePct: 94,
    },
    attendanceFlags: [],
    visitTrack: { stage: 'Meeting', place: 'Powai, Mumbai', checkIn: '02:15 pm', checkOut: '—' },
    activityLog: [
      { at: '02:15 pm', kind: 'Visit check-in', text: 'Checked in at Powai — Sanjana Kapoor' },
      { at: '01:30 pm', kind: 'En route', text: 'Left the office for the Powai visit' },
      { at: '12:10 pm', kind: 'Customer visit', text: 'Completed Vashi visit — membership discussed' },
      { at: '09:48 am', kind: 'Login', text: 'Logged in from the field — mobile app' },
    ],
    callDetail: { connected: 5, notAnswered: 3, busy: 0, wrongNumber: 0, interested: 3, notInterested: 1, callback: 1, avgDuration: '4m 02s', talkTime: '24m' },
    presentationDetail: { scheduled: 2, completed: 2, cancelled: 0, noShow: 0, rescheduled: 0, converted: 1, pending: 1 },
    visitDetail: { scheduled: 4, completed: 2, upcoming: 1, cancelled: 0, noShow: 1, converted: 1, revenue: 268000 },
    followUpDetail: { due: 4, completed: 3, pending: 1, overdue: 0, missed: 0, rescheduled: 1 },
    followUpMix: { day1: 1, day3: 1, day6: 0, final: 0, payment: 0, presentation: 0, visit: 2, membership: 0 },
    taskDetail: { pending: 2, overdue: 0, inProgress: 1, cancelled: 0, rescheduled: 1 },
    pipeline: { fresh: 3, contacted: 5, interested: 6, presentation: 3, visit: 7, hot: 4, closing: 2 },
    leadMix: { fresh: 3, contacted: 5, interested: 6, presentationPending: 0, presentationDone: 2, visitScheduled: 4, followUpPending: 1, hot: 4, warm: 5, cold: 2, noResponse: 1, closed: 2, lost: 0 },
    salesDetail: { today: 1, mtd: 2, closings: 2, pending: 1, cancelled: 0, avgTicket: 134000, byPlan: { Silver: 1, Gold: 1, Platinum: 0 } },
    revenueDetail: { today: 132000, mtd: 268000, previous: 198000, collected: 268000, pending: 0, refund: 0, outstanding: 0,
      sources: { Membership: 29497, Booking: 238503, Addons: 0 } },
    targets: { leads: 15, calls: 12, presentations: 2, visits: 5, closings: 2, revenue: 250000 },
    score: { attendance: 9, calls: 8, connected: 7, followUps: 12, presentations: 11, visits: 10, closings: 14, discipline: 4 },
    notices: [
      { level: 'positive', text: 'Vashi visit converted — ₹1,32,000', at: '12:10 pm' },
      { level: 'warning', text: 'One visit marked no-show yesterday', at: '09:50 am' },
    ],
    current: { customer: 'Sanjana Kapoor', next: 'Check out and log the visit outcome' },
    tasksDone: 4, tasksTotal: 6, leads: 22, followUps: 4, calls: 8, presentations: 2, visits: 4,
    bookings: 2, enquiries: 5, revenue: 268000, target: 250000, productivity: 75, alerts: 1,
  },
  {
    id: 'USR-09', empId: 'EMP-107', name: 'Divya Rao', role: 'Visa & Documentation',
    department: 'Operations', email: 'divya@smiraclub.com', phone: '+91 98676 20031', status: 'Active',
    live: 'On break', attendance: 'Late',
    activity: 'Tea break', activityType: 'Break', activityStarted: '03:05 pm',
    lastActive: '11 min ago', lastActivityKind: 'Documentation',
    day: {
      login: '10:48 am', logout: '—', working: '4h 32m', breaks: '48m', idle: '22m',
      lateBy: 18, mode: 'Office', source: 'Web app', regularisation: 'Late login — pending', attendancePct: 84,
    },
    attendanceFlags: ['Late login', 'Attendance regularisation pending', 'Screen idle timer running'],
    activityLog: [
      { at: '03:05 pm', kind: 'Break', text: 'Tea break' },
      { at: '02:10 pm', kind: 'Documentation', text: 'Filed 3 Schengen visa applications' },
      { at: '12:25 pm', kind: 'Documentation', text: 'Collected passports — Rohan Bhatt party' },
      { at: '10:48 am', kind: 'Login', text: 'Logged in 18 minutes late — regularisation pending' },
    ],
    callDetail: { connected: 3, notAnswered: 1, busy: 0, wrongNumber: 0, interested: 0, notInterested: 0, callback: 0, avgDuration: '5m 10s', talkTime: '16m' },
    presentationDetail: { scheduled: 0, completed: 0, cancelled: 0, noShow: 0, rescheduled: 0, converted: 0, pending: 0 },
    visitDetail: { scheduled: 0, completed: 0, upcoming: 0, cancelled: 0, noShow: 0, converted: 0, revenue: 0 },
    followUpDetail: { due: 5, completed: 3, pending: 1, overdue: 1, missed: 0, rescheduled: 0 },
    followUpMix: { day1: 0, day3: 0, day6: 0, final: 0, payment: 0, presentation: 0, visit: 0, membership: 5 },
    taskDetail: { pending: 3, overdue: 1, inProgress: 2, cancelled: 0, rescheduled: 0 },
    pipeline: { fresh: 0, contacted: 0, interested: 0, presentation: 0, visit: 0, hot: 0, closing: 0 },
    leadMix: { fresh: 0, contacted: 0, interested: 0, presentationPending: 0, presentationDone: 0, visitScheduled: 0, followUpPending: 1, hot: 0, warm: 0, cold: 0, noResponse: 0, closed: 0, lost: 0 },
    salesDetail: { today: 0, mtd: 0, closings: 0, pending: 0, cancelled: 0, avgTicket: 0, byPlan: { Silver: 0, Gold: 0, Platinum: 0 } },
    revenueDetail: { today: 0, mtd: 0, previous: 0, collected: 0, pending: 0, refund: 0, outstanding: 0,
      sources: { Membership: 0, Booking: 0, Addons: 0 } },
    targets: { leads: 0, calls: 8, presentations: 0, visits: 0, closings: 0, revenue: 0 },
    score: { attendance: 5, calls: 8, connected: 7, followUps: 11, presentations: 0, visits: 0, closings: 0, discipline: 4 },
    notices: [
      { level: 'warning', text: 'Logged in 18 minutes late — regularisation pending', at: '10:48 am' },
      { level: 'warning', text: 'One membership activation follow-up is overdue', at: '01:40 pm' },
    ],
    current: { customer: 'Rohan Bhatt', next: 'Submit the visa file before 6:00 pm' },
    tasksDone: 5, tasksTotal: 9, leads: 0, followUps: 5, calls: 4, presentations: 0, visits: 0,
    bookings: 0, enquiries: 0, revenue: 0, target: 0, productivity: 62, alerts: 2,
  },
  {
    id: 'USR-10', empId: 'EMP-108', name: 'Vikram Joshi', role: 'Owner',
    department: 'Management', email: 'vikram@smiraclub.com', phone: '+91 98190 55127', status: 'Active',
    live: 'Offline', attendance: 'Half day',
    activity: 'Logged out after the partner meeting', activityType: 'Internal meeting', activityStarted: '12:40 pm',
    lastActive: '2h 10m ago', lastActivityKind: 'Internal meeting',
    day: {
      login: '09:05 am', logout: '01:30 pm', working: '4h 25m', breaks: '20m', idle: '10m',
      lateBy: 0, mode: 'Office', source: 'Web app', regularisation: 'Half day — approved', attendancePct: 90,
    },
    attendanceFlags: ['Early logout'],
    activityLog: [
      { at: '01:30 pm', kind: 'Logout', text: 'Logged out — half day approved' },
      { at: '12:40 pm', kind: 'Internal meeting', text: 'Partner rate review with Skyline DMC' },
      { at: '10:15 am', kind: 'Lead call', text: 'Called two high-value referrals' },
      { at: '09:05 am', kind: 'Login', text: 'Logged in from the office — web app' },
    ],
    callDetail: { connected: 4, notAnswered: 1, busy: 0, wrongNumber: 0, interested: 2, notInterested: 0, callback: 1, avgDuration: '7m 40s', talkTime: '32m' },
    presentationDetail: { scheduled: 1, completed: 1, cancelled: 0, noShow: 0, rescheduled: 0, converted: 1, pending: 0 },
    visitDetail: { scheduled: 0, completed: 0, upcoming: 0, cancelled: 0, noShow: 0, converted: 0, revenue: 0 },
    followUpDetail: { due: 2, completed: 2, pending: 0, overdue: 0, missed: 0, rescheduled: 0 },
    followUpMix: { day1: 1, day3: 0, day6: 0, final: 1, payment: 0, presentation: 0, visit: 0, membership: 0 },
    taskDetail: { pending: 1, overdue: 0, inProgress: 0, cancelled: 0, rescheduled: 0 },
    pipeline: { fresh: 2, contacted: 3, interested: 3, presentation: 1, visit: 0, hot: 2, closing: 1 },
    leadMix: { fresh: 2, contacted: 3, interested: 3, presentationPending: 0, presentationDone: 1, visitScheduled: 0, followUpPending: 0, hot: 2, warm: 2, cold: 1, noResponse: 0, closed: 1, lost: 0 },
    salesDetail: { today: 0, mtd: 1, closings: 1, pending: 0, cancelled: 0, avgTicket: 310000, byPlan: { Silver: 0, Gold: 0, Platinum: 1 } },
    revenueDetail: { today: 0, mtd: 310000, previous: 275000, collected: 310000, pending: 0, refund: 0, outstanding: 0,
      sources: { Membership: 47000, Booking: 263000, Addons: 0 } },
    targets: { leads: 10, calls: 10, presentations: 1, visits: 0, closings: 1, revenue: 300000 },
    score: { attendance: 7, calls: 10, connected: 9, followUps: 15, presentations: 12, visits: 0, closings: 15, discipline: 5 },
    notices: [
      { level: 'positive', text: 'Skyline DMC agreed to a 4% better rate', at: '12:40 pm' },
    ],
    current: { customer: 'Skyline DMC', next: 'Circulate the revised rate card tomorrow' },
    tasksDone: 3, tasksTotal: 4, leads: 11, followUps: 2, calls: 5, presentations: 1, visits: 0,
    bookings: 1, enquiries: 3, revenue: 310000, target: 300000, productivity: 73, alerts: 0,
  },
  {
    id: 'USR-11', empId: 'EMP-109', name: 'Neha Pillai', role: 'Accounts',
    department: 'Accounts', email: 'neha@smiraclub.com', phone: '+91 99872 40556', status: 'Active',
    live: 'Not logged in', attendance: 'Absent',
    activity: 'Has not logged in today', activityType: 'No activity', activityStarted: '—',
    lastActive: 'yesterday, 06:40 pm', lastActivityKind: 'Payment follow-up',
    day: {
      login: '—', logout: '—', working: '0h 00m', breaks: '0m', idle: '—',
      lateBy: 0, mode: 'Office', source: '—', regularisation: 'None pending', attendancePct: 78,
    },
    attendanceFlags: ['No login', 'Missing logout yesterday'],
    activityLog: [
      { at: 'Yesterday 06:40 pm', kind: 'Payment follow-up', text: 'Chased ₹1,86,000 outstanding on BKG-8824' },
      { at: 'Yesterday 03:20 pm', kind: 'Documentation', text: 'Reconciled the day’s UPI collections' },
    ],
    callDetail: { connected: 0, notAnswered: 0, busy: 0, wrongNumber: 0, interested: 0, notInterested: 0, callback: 0, avgDuration: '—', talkTime: '0m' },
    presentationDetail: { scheduled: 0, completed: 0, cancelled: 0, noShow: 0, rescheduled: 0, converted: 0, pending: 0 },
    visitDetail: { scheduled: 0, completed: 0, upcoming: 0, cancelled: 0, noShow: 0, converted: 0, revenue: 0 },
    followUpDetail: { due: 6, completed: 0, pending: 3, overdue: 3, missed: 0, rescheduled: 0 },
    followUpMix: { day1: 0, day3: 0, day6: 0, final: 0, payment: 6, presentation: 0, visit: 0, membership: 0 },
    taskDetail: { pending: 4, overdue: 3, inProgress: 0, cancelled: 0, rescheduled: 0 },
    pipeline: { fresh: 0, contacted: 0, interested: 0, presentation: 0, visit: 0, hot: 0, closing: 0 },
    leadMix: { fresh: 0, contacted: 0, interested: 0, presentationPending: 0, presentationDone: 0, visitScheduled: 0, followUpPending: 3, hot: 0, warm: 0, cold: 0, noResponse: 0, closed: 0, lost: 0 },
    salesDetail: { today: 0, mtd: 0, closings: 0, pending: 0, cancelled: 0, avgTicket: 0, byPlan: { Silver: 0, Gold: 0, Platinum: 0 } },
    revenueDetail: { today: 0, mtd: 0, previous: 0, collected: 0, pending: 0, refund: 0, outstanding: 0,
      sources: { Membership: 0, Booking: 0, Addons: 0 } },
    targets: { leads: 0, calls: 6, presentations: 0, visits: 0, closings: 0, revenue: 0 },
    score: { attendance: 0, calls: 0, connected: 0, followUps: 0, presentations: 0, visits: 0, closings: 0, discipline: 2 },
    notices: [
      { level: 'critical', text: 'Absent — no login recorded today', at: '10:00 am' },
      { level: 'critical', text: 'Three payment follow-ups overdue', at: '10:00 am' },
    ],
    current: { customer: 'Ananya Deshmukh', next: 'Collect ₹1,86,000 balance — overdue' },
    tasksDone: 0, tasksTotal: 4, leads: 0, followUps: 6, calls: 0, presentations: 0, visits: 0,
    bookings: 0, enquiries: 0, revenue: 0, target: 0, productivity: 12, alerts: 2,
  },
  {
    id: 'USR-12', empId: 'EMP-110', name: 'Farhan Qureshi', role: 'Travel Consultant',
    department: 'Sales desk', email: 'farhan@smiraclub.com', phone: '+91 98204 66713', status: 'Active',
    live: 'Leave', attendance: 'Leave',
    activity: 'On approved leave', activityType: 'No activity', activityStarted: '—',
    lastActive: '2 days ago', lastActivityKind: 'Lead call',
    day: {
      login: '—', logout: '—', working: '0h 00m', breaks: '0m', idle: '—',
      lateBy: 0, mode: 'Leave', source: '—', regularisation: 'Leave — approved', attendancePct: 88,
    },
    attendanceFlags: [],
    activityLog: [
      { at: '2 days ago', kind: 'Lead call', text: 'Handed 14 leads to Rahul before leave' },
    ],
    callDetail: { connected: 0, notAnswered: 0, busy: 0, wrongNumber: 0, interested: 0, notInterested: 0, callback: 0, avgDuration: '—', talkTime: '0m' },
    presentationDetail: { scheduled: 0, completed: 0, cancelled: 0, noShow: 0, rescheduled: 1, converted: 0, pending: 1 },
    visitDetail: { scheduled: 0, completed: 0, upcoming: 0, cancelled: 0, noShow: 0, converted: 0, revenue: 0 },
    followUpDetail: { due: 0, completed: 0, pending: 0, overdue: 0, missed: 0, rescheduled: 3 },
    followUpMix: { day1: 0, day3: 0, day6: 0, final: 0, payment: 0, presentation: 0, visit: 0, membership: 0 },
    taskDetail: { pending: 0, overdue: 0, inProgress: 0, cancelled: 0, rescheduled: 3 },
    pipeline: { fresh: 4, contacted: 6, interested: 2, presentation: 1, visit: 0, hot: 1, closing: 0 },
    leadMix: { fresh: 4, contacted: 6, interested: 2, presentationPending: 1, presentationDone: 0, visitScheduled: 0, followUpPending: 0, hot: 1, warm: 3, cold: 4, noResponse: 2, closed: 0, lost: 1 },
    salesDetail: { today: 0, mtd: 1, closings: 1, pending: 0, cancelled: 0, avgTicket: 118000, byPlan: { Silver: 1, Gold: 0, Platinum: 0 } },
    revenueDetail: { today: 0, mtd: 118000, previous: 240000, collected: 118000, pending: 0, refund: 0, outstanding: 0,
      sources: { Membership: 5899, Booking: 112101, Addons: 0 } },
    targets: { leads: 25, calls: 30, presentations: 4, visits: 1, closings: 3, revenue: 300000 },
    score: { attendance: 0, calls: 0, connected: 0, followUps: 0, presentations: 0, visits: 0, closings: 5, discipline: 3 },
    notices: [
      { level: 'warning', text: '14 leads reassigned to Rahul while on leave', at: '2 days ago' },
    ],
    current: { customer: '—', next: 'Back on the desk from Monday' },
    tasksDone: 0, tasksTotal: 0, leads: 17, followUps: 0, calls: 0, presentations: 0, visits: 0,
    bookings: 1, enquiries: 4, revenue: 118000, target: 300000, productivity: 8, alerts: 1,
  },
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
export const salesActivity = [
  { id: 'ACT-S1', at: '10:05 am', who: 'Kabir', kind: 'Calls', text: 'Called Siddhesh Rane about the Bali itinerary' },
  { id: 'ACT-S2', at: '10:22 am', who: 'Sneha', kind: 'Presentations', text: 'Sent the Maldives itinerary to Ananya Deshmukh' },
  { id: 'ACT-S3', at: '10:48 am', who: 'Kabir', kind: 'Visits', text: 'Completed the customer visit in Bandra' },
  { id: 'ACT-S4', at: '11:15 am', who: 'Sneha', kind: 'Follow-ups', text: 'Moved Siddhesh Rane to Interested' },
  { id: 'ACT-S5', at: '11:42 am', who: 'Sneha', kind: 'Closings', text: 'Closed Bali Honeymoon Escape — ₹1,85,000' },
  { id: 'ACT-S6', at: '12:05 pm', who: 'System', kind: 'Follow-ups', text: '1 follow-up is now overdue' },
  { id: 'ACT-S7', at: '12:40 pm', who: 'Kabir', kind: 'WhatsApp', text: 'WhatsApped the Goa quote to Jayashree Patil' },
  { id: 'ACT-S8', at: '01:20 pm', who: 'System', kind: 'Payments', text: 'Received ₹1,50,000 against INV-4411' },
  { id: 'ACT-S9', at: '02:35 pm', who: 'Kabir', kind: 'Tasks', text: 'Created a task — collect passport copies' },
];

export const activityKinds = ['All', 'Calls', 'Follow-ups', 'Presentations', 'Visits', 'Closings', 'Payments', 'WhatsApp', 'Tasks'];
