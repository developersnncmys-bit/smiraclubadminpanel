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

/** '2026-09-02' -> '02 Sep 2026'. Leaves already-formatted dates alone. */
export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
  { id: 'ENQ-2041', name: 'Siddhesh Rane', phone: '+91 98201 44521', email: 'siddhesh.r@gmail.com', destination: 'Bali', pax: 2, travelDate: '18 Sep 2026', budget: 185000, status: 'Interested', source: 'Instagram', owner: 'Ritik', label: 'Honeymoon', created: '04 Aug 2026' },
  { id: 'ENQ-2040', name: 'Jayashree Patil', phone: '+91 90045 88120', email: 'jaya.patil@outlook.com', destination: 'Kerala', pax: 4, travelDate: '02 Oct 2026', budget: 96000, status: 'New', source: 'Website', owner: 'Unassigned', label: 'Family', created: '04 Aug 2026' },
  { id: 'ENQ-2039', name: 'Ridhima Param', phone: '+91 98670 21188', email: 'ridhima.p@gmail.com', destination: 'Maldives', pax: 2, travelDate: '25 Dec 2026', budget: 340000, status: 'Quoted', source: 'Referral', owner: 'Sneha', label: 'Luxury', created: '03 Aug 2026' },
  { id: 'ENQ-2038', name: 'Aadarsh Bhatia', phone: '+91 99303 76540', email: 'aadarsh938@gmail.com', destination: 'Dubai', pax: 3, travelDate: '11 Sep 2026', budget: 148000, status: 'Contacted', source: 'Google Ads', owner: 'Ritik', label: 'Shopping', created: '03 Aug 2026' },
  { id: 'ENQ-2037', name: 'Divya Sharma', phone: '+91 90821 33012', email: 'divya.sharma@gmail.com', destination: 'Switzerland', pax: 2, travelDate: '05 Nov 2026', budget: 420000, status: 'Interested', source: 'Walk-in', owner: 'Kabir', label: 'Anniversary', created: '02 Aug 2026' },
  { id: 'ENQ-2036', name: 'Ajay Panchmukh', phone: '+91 88790 12234', email: 'ajay.p@yahoo.com', destination: 'Thailand', pax: 6, travelDate: '20 Aug 2026', budget: 210000, status: 'Booked', source: 'WhatsApp', owner: 'Sneha', label: 'Group', created: '02 Aug 2026' },
  { id: 'ENQ-2035', name: 'Suhas Bansode', phone: '+91 97654 44001', email: 'suhas.b@gmail.com', destination: 'Ladakh', pax: 5, travelDate: '15 Sep 2026', budget: 165000, status: 'Interested', source: 'Instagram', owner: 'Kabir', label: 'Adventure', created: '01 Aug 2026' },
  { id: 'ENQ-2034', name: 'Sitaram Parab', phone: '+91 90210 87766', email: 'sitaram.parab@gmail.com', destination: 'Singapore', pax: 4, travelDate: '28 Sep 2026', budget: 232000, status: 'Quoted', source: 'Website', owner: 'Ritik', label: 'Family', created: '01 Aug 2026' },
  { id: 'ENQ-2033', name: 'Mahendra Mandhare', phone: '+91 98922 55410', email: 'mahendra.m@gmail.com', destination: 'Vietnam', pax: 2, travelDate: '09 Oct 2026', budget: 118000, status: 'Contacted', source: 'Referral', owner: 'Sneha', label: 'Couple', created: '31 Jul 2026' },
  { id: 'ENQ-2032', name: 'Sulekha Chavan', phone: '+91 91234 09876', email: 'sulekha.c@gmail.com', destination: 'Andaman', pax: 3, travelDate: '22 Aug 2026', budget: 142000, status: 'Lost', source: 'Google Ads', owner: 'Kabir', label: 'Beach', created: '31 Jul 2026' },
  { id: 'ENQ-2031', name: 'Neha Kulkarni', phone: '+91 99872 31145', email: 'neha.k@gmail.com', destination: 'Europe', pax: 2, travelDate: '14 Dec 2026', budget: 560000, status: 'Interested', source: 'Instagram', owner: 'Sneha', label: 'Luxury', created: '30 Jul 2026' },
  { id: 'ENQ-2030', name: 'Rohan Desai', phone: '+91 98111 44329', email: 'rohan.desai@gmail.com', destination: 'Bhutan', pax: 4, travelDate: '03 Nov 2026', budget: 178000, status: 'New', source: 'Website', owner: 'Unassigned', label: 'Family', created: '30 Jul 2026' },
];

export const sources = [
  { name: 'Instagram', value: 46, color: '#f9714a' },
  { name: 'Website', value: 38, color: '#14a58c' },
  { name: 'Google Ads', value: 31, color: '#0ea5e9' },
  { name: 'Referral', value: 27, color: '#7c5cff' },
  { name: 'Walk-in', value: 16, color: '#f5b73c' },
  { name: 'WhatsApp', value: 10, color: '#6dd9c3' },
];

// -- Packages ---------------------------------------------------------------
export const packages = [
  { id: 'PKG-01', name: 'Bali Honeymoon Escape', destination: 'Bali, Indonesia', startDate: '2026-09-02', days: 7, nights: 6, price: 92500, type: 'Honeymoon', rating: 4.8, sold: 42, seats: 8, gradient: 'from-brand-500 to-ocean' },
  { id: 'PKG-02', name: 'Maldives Overwater Luxury', destination: 'Malé, Maldives', startDate: '2026-09-15', days: 6, nights: 5, price: 168000, type: 'Luxury', rating: 4.9, sold: 24, seats: 4, gradient: 'from-ocean to-grape' },
  { id: 'PKG-03', name: 'Kerala Backwaters Family', destination: 'Kochi · Alleppey', startDate: '2026-08-24', days: 6, nights: 5, price: 34500, type: 'Family', rating: 4.6, sold: 78, seats: 22, gradient: 'from-brand-600 to-brand-300' },
  { id: 'PKG-04', name: 'Dubai City & Desert', destination: 'Dubai, UAE', startDate: '2026-09-11', days: 5, nights: 4, price: 58900, type: 'City break', rating: 4.5, sold: 61, seats: 15, gradient: 'from-gold to-coral' },
  { id: 'PKG-05', name: 'Swiss Alps Grand Tour', destination: 'Zurich · Interlaken', startDate: '2026-10-05', days: 9, nights: 8, price: 212000, type: 'Luxury', rating: 4.9, sold: 18, seats: 6, gradient: 'from-grape to-ocean' },
  { id: 'PKG-06', name: 'Thailand Island Hopper', destination: 'Phuket · Krabi', startDate: '2026-08-20', days: 7, nights: 6, price: 47800, type: 'Group', rating: 4.4, sold: 95, seats: 30, gradient: 'from-coral to-gold' },
  { id: 'PKG-07', name: 'Ladakh Road Expedition', destination: 'Leh · Nubra · Pangong', startDate: '2026-09-26', days: 8, nights: 7, price: 39900, type: 'Adventure', rating: 4.7, sold: 53, seats: 12, gradient: 'from-brand-700 to-brand-400' },
  { id: 'PKG-08', name: 'Singapore + Malaysia Combo', destination: 'Singapore · KL', startDate: '2026-10-18', days: 7, nights: 6, price: 76400, type: 'Family', rating: 4.5, sold: 37, seats: 18, gradient: 'from-ocean to-brand-400' },
];

export const topDestinations = [
  { name: 'Bali', bookings: 42, revenue: 3885000 },
  { name: 'Thailand', bookings: 38, revenue: 1816400 },
  { name: 'Dubai', bookings: 31, revenue: 1825900 },
  { name: 'Kerala', bookings: 28, revenue: 966000 },
  { name: 'Maldives', bookings: 19, revenue: 3192000 },
  { name: 'Ladakh', bookings: 16, revenue: 638400 },
];

// -- Bookings ---------------------------------------------------------------
export const bookings = [
  { id: 'BKG-8821', customer: 'Ajay Panchmukh', pkg: 'Thailand Island Hopper', destination: 'Phuket · Krabi', departure: '20 Aug 2026', nights: 6, pax: 6, amount: 286800, paid: 286800, status: 'Confirmed', owner: 'Sneha' },
  { id: 'BKG-8820', customer: 'Priya Nair', pkg: 'Kerala Backwaters Family', destination: 'Kochi · Alleppey', departure: '24 Aug 2026', nights: 5, pax: 4, amount: 138000, paid: 70000, status: 'Part paid', owner: 'Ritik' },
  { id: 'BKG-8819', customer: 'Vikram Shetty', pkg: 'Bali Honeymoon Escape', destination: 'Bali, Indonesia', departure: '02 Sep 2026', nights: 6, pax: 2, amount: 185000, paid: 185000, status: 'Confirmed', owner: 'Kabir' },
  { id: 'BKG-8818', customer: 'Farhan Qureshi', pkg: 'Dubai City & Desert', destination: 'Dubai, UAE', departure: '11 Sep 2026', nights: 4, pax: 3, amount: 176700, paid: 50000, status: 'Part paid', owner: 'Ritik' },
  { id: 'BKG-8817', customer: 'Meera Iyer', pkg: 'Maldives Overwater Luxury', destination: 'Malé, Maldives', departure: '15 Sep 2026', nights: 5, pax: 2, amount: 336000, paid: 336000, status: 'Confirmed', owner: 'Sneha' },
  { id: 'BKG-8816', customer: 'Suhas Bansode', pkg: 'Ladakh Road Expedition', destination: 'Leh · Pangong', departure: '15 Sep 2026', nights: 7, pax: 5, amount: 199500, paid: 100000, status: 'Part paid', owner: 'Kabir' },
  { id: 'BKG-8815', customer: 'Sitaram Parab', pkg: 'Singapore + Malaysia Combo', destination: 'Singapore · KL', departure: '28 Sep 2026', nights: 6, pax: 4, amount: 305600, paid: 0, status: 'Pending', owner: 'Ritik' },
  { id: 'BKG-8814', customer: 'Anita Deshmukh', pkg: 'Bali Honeymoon Escape', destination: 'Bali, Indonesia', departure: '06 Oct 2026', nights: 6, pax: 2, amount: 185000, paid: 90000, status: 'Part paid', owner: 'Sneha' },
  { id: 'BKG-8813', customer: 'Rahul Menon', pkg: 'Swiss Alps Grand Tour', destination: 'Zurich · Interlaken', departure: '05 Nov 2026', nights: 8, pax: 2, amount: 424000, paid: 150000, status: 'Part paid', owner: 'Kabir' },
  { id: 'BKG-8812', customer: 'Tanvi Joshi', pkg: 'Thailand Island Hopper', destination: 'Phuket · Krabi', departure: '18 Jul 2026', nights: 6, pax: 3, amount: 143400, paid: 143400, status: 'Completed', owner: 'Sneha' },
  { id: 'BKG-8811', customer: 'Imran Shaikh', pkg: 'Dubai City & Desert', destination: 'Dubai, UAE', departure: '09 Jul 2026', nights: 4, pax: 5, amount: 294500, paid: 294500, status: 'Completed', owner: 'Ritik' },
  { id: 'BKG-8810', customer: 'Kiran Rao', pkg: 'Kerala Backwaters Family', destination: 'Kochi · Alleppey', departure: '01 Jul 2026', nights: 5, pax: 2, amount: 69000, paid: 20000, status: 'Cancelled', owner: 'Kabir' },
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
  { id: 'CUS-512', name: 'Ananya Deshmukh', phone: '+91 98330 21145', email: 'ananya.d@gmail.com', city: 'Pune', trips: 0, spend: 0, tier: 'Silver', last: '—', dob: '1994-06-19', special: '2022-03-08', specialLabel: 'Anniversary', source: 'Website' },
  { id: 'CUS-511', name: 'Rohan Bhatt', phone: '+91 99201 55420', email: 'rohan.bhatt@outlook.com', city: 'Mumbai', trips: 1, spend: 96000, tier: 'Silver', last: '12 Jul 2026', dob: '1989-01-24', special: '2017-05-21', specialLabel: 'Anniversary', source: 'Website' },
  { id: 'CUS-510', name: 'Meher Shaikh', phone: '+91 97027 66311', email: 'meher.s@gmail.com', city: 'Nashik', trips: 1, spend: 78500, tier: 'Silver', last: '02 Jun 2026', dob: '1996-10-03', special: '2024-02-11', specialLabel: 'Spouse birthday', source: 'Website' },
  { id: 'CUS-509', name: 'Vikas Rane', phone: '+91 98194 30078', email: 'vikas.rane@gmail.com', city: 'Thane', trips: 2, spend: 214000, tier: 'Gold', last: '28 Jul 2026', dob: '1986-04-12', special: '2013-09-30', specialLabel: 'Anniversary', source: 'Website' },
  { id: 'CUS-501', name: 'Ajay Panchmukh', phone: '+91 88790 12234', email: 'ajay.p@yahoo.com', city: 'Pune', trips: 4, spend: 742000, tier: 'Platinum', last: '20 Aug 2026', dob: '1984-03-18', special: '2011-11-27', specialLabel: 'Anniversary', source: 'Referral' },
  { id: 'CUS-502', name: 'Meera Iyer', phone: '+91 98211 55420', email: 'meera.iyer@gmail.com', city: 'Mumbai', trips: 3, spend: 688000, tier: 'Platinum', last: '15 Sep 2026', dob: '1990-07-05', special: '2016-02-14', specialLabel: 'Anniversary', source: 'Instagram' },
  { id: 'CUS-503', name: 'Vikram Shetty', phone: '+91 99870 11223', email: 'vikram.s@gmail.com', city: 'Bengaluru', trips: 2, spend: 371000, tier: 'Gold', last: '02 Sep 2026', dob: '1987-12-01', special: '2019-06-09', specialLabel: 'Anniversary', source: 'Walk-in' },
  { id: 'CUS-504', name: 'Priya Nair', phone: '+91 90040 88991', email: 'priya.nair@gmail.com', city: 'Kochi', trips: 3, spend: 298000, tier: 'Gold', last: '24 Aug 2026', dob: '1992-09-23', special: '2021-01-30', specialLabel: 'Anniversary', source: 'Website' },
  { id: 'CUS-505', name: 'Farhan Qureshi', phone: '+91 98333 21100', email: 'farhan.q@gmail.com', city: 'Hyderabad', trips: 2, spend: 254000, tier: 'Gold', last: '11 Sep 2026', dob: '1985-05-14', special: '2014-08-22', specialLabel: 'Anniversary', source: 'Google Ads' },
  { id: 'CUS-506', name: 'Tanvi Joshi', phone: '+91 97655 43210', email: 'tanvi.joshi@gmail.com', city: 'Nashik', trips: 1, spend: 143400, tier: 'Silver', last: '18 Jul 2026', dob: '1995-11-08', special: '2023-04-16', specialLabel: 'Spouse birthday', source: 'Instagram' },
  { id: 'CUS-507', name: 'Rahul Menon', phone: '+91 98860 77120', email: 'rahul.menon@gmail.com', city: 'Chennai', trips: 1, spend: 424000, tier: 'Gold', last: '05 Nov 2026', dob: '1981-02-27', special: '2009-10-11', specialLabel: 'Anniversary', source: 'Referral' },
  { id: 'CUS-508', name: 'Anita Deshmukh', phone: '+91 91450 20033', email: 'anita.d@gmail.com', city: 'Nagpur', trips: 2, spend: 267000, tier: 'Silver', last: '06 Oct 2026', dob: '1993-08-30', special: '2018-12-05', specialLabel: 'Child birthday', source: 'Walk-in' },
];

// -- Tasks ------------------------------------------------------------------
export const tasks = [
  { id: 'TSK-311', title: 'Share revised Bali itinerary', customer: 'Siddhesh Rane', type: 'Send itinerary', due: '04 Aug 2026, 11:45 am', owner: 'Ritik', bucket: 'today', priority: 'High', note: 'Client wants a pool villa option and a private candlelight dinner added.' },
  { id: 'TSK-310', title: 'Collect passport copies', customer: 'Ajay Panchmukh', type: 'Documents', due: '04 Aug 2026, 04:30 pm', owner: 'Sneha', bucket: 'today', priority: 'High', note: '2 of 6 passports still pending. Visa filing deadline is 08 Aug.' },
  { id: 'TSK-309', title: 'Follow-up call for Maldives quote', customer: 'Ridhima Param', type: 'Call', due: '05 Aug 2026, 10:00 am', owner: 'Sneha', bucket: 'upcoming', priority: 'Medium', note: 'Quote sent 03 Aug. Compare with competitor pricing before the call.' },
  { id: 'TSK-308', title: 'Confirm hotel with DMC', customer: 'Meera Iyer', type: 'Supplier', due: '06 Aug 2026, 12:00 pm', owner: 'Kabir', bucket: 'upcoming', priority: 'High', note: 'Awaiting written confirmation for the overwater villa upgrade.' },
  { id: 'TSK-307', title: 'Send balance payment reminder', customer: 'Sitaram Parab', type: 'Payment', due: '07 Aug 2026, 09:30 am', owner: 'Ritik', bucket: 'upcoming', priority: 'Medium', note: '₹3,05,600 fully outstanding, departure in 8 weeks.' },
  { id: 'TSK-306', title: 'Visa appointment slot booking', customer: 'Rahul Menon', type: 'Visa', due: '02 Aug 2026, 03:00 pm', owner: 'Kabir', bucket: 'overdue', priority: 'High', note: 'Schengen slots filling fast — escalate to the visa desk.' },
  { id: 'TSK-305', title: 'Re-engage lost enquiry', customer: 'Sulekha Chavan', type: 'Call', due: '01 Aug 2026, 05:00 pm', owner: 'Kabir', bucket: 'overdue', priority: 'Low', note: 'Client said budget is tight; offer the 3N Andaman variant instead.' },
  { id: 'TSK-304', title: 'Share group discount sheet', customer: 'Suhas Bansode', type: 'Send quote', due: '31 Jul 2026, 06:00 pm', owner: 'Kabir', bucket: 'overdue', priority: 'Medium', note: 'Group of 5 — apply the 8% early-bird slab.' },
  { id: 'TSK-303', title: 'Airport transfer confirmation', customer: 'Tanvi Joshi', type: 'Supplier', due: '17 Jul 2026, 08:00 am', owner: 'Sneha', bucket: 'done', priority: 'Medium', note: 'Confirmed with the Phuket transfer partner.' },
  { id: 'TSK-302', title: 'Post-trip feedback call', customer: 'Imran Shaikh', type: 'Call', due: '14 Jul 2026, 11:00 am', owner: 'Ritik', bucket: 'done', priority: 'Low', note: 'Rated 5/5. Asked about a Europe trip next summer.' },
];

// -- Quotations, invoices, payments -----------------------------------------
export const quotations = [
  // Auto-generated from website membership signups — inclusions are snapshotted
  // from the plan at the moment the quotation was raised.
  { id: 'QUO-1190', customer: 'Vikas Rane', pkg: 'Gold Voyager membership (Yearly)', pax: 3, amount: 35396, validTill: '04 Aug 2026', status: 'Accepted', owner: 'Sneha', source: 'Membership', planId: 'MEM-02', inclusions: ['10% off on every holiday package', 'Dedicated travel consultant', '24×7 on-trip emergency helpline'] },
  { id: 'QUO-1189', customer: 'Rohan Bhatt', pkg: 'Gold Voyager membership (Yearly)', pax: 2, amount: 23598, validTill: '10 Aug 2026', status: 'Sent', owner: 'Sneha', source: 'Membership', planId: 'MEM-02', inclusions: ['10% off on every holiday package', 'Dedicated travel consultant', '24×7 on-trip emergency helpline'] },
  { id: 'QUO-1188', customer: 'Meher Shaikh', pkg: 'Silver Explorer membership (Yearly)', pax: 1, amount: 5899, validTill: '09 Aug 2026', status: 'Viewed', owner: 'Ritik', source: 'Membership', planId: 'MEM-01', inclusions: ['5% off on every holiday package', 'Priority enquiry response within 4 hours', 'Dedicated WhatsApp support desk'] },
  { id: 'QUO-1187', customer: 'Ridhima Param', pkg: 'Maldives Overwater Luxury', pax: 2, amount: 336000, validTill: '12 Aug 2026', status: 'Sent', owner: 'Sneha' },
  { id: 'QUO-1186', customer: 'Sitaram Parab', pkg: 'Singapore + Malaysia Combo', pax: 4, amount: 305600, validTill: '10 Aug 2026', status: 'Viewed', owner: 'Ritik' },
  { id: 'QUO-1185', customer: 'Divya Sharma', pkg: 'Swiss Alps Grand Tour', pax: 2, amount: 424000, validTill: '18 Aug 2026', status: 'Sent', owner: 'Kabir' },
  { id: 'QUO-1184', customer: 'Neha Kulkarni', pkg: 'Europe Highlights 10N', pax: 2, amount: 560000, validTill: '20 Aug 2026', status: 'Draft', owner: 'Sneha' },
  { id: 'QUO-1183', customer: 'Suhas Bansode', pkg: 'Ladakh Road Expedition', pax: 5, amount: 199500, validTill: '08 Aug 2026', status: 'Accepted', owner: 'Kabir' },
  { id: 'QUO-1182', customer: 'Sulekha Chavan', pkg: 'Andaman Beach Break', pax: 3, amount: 142000, validTill: '02 Aug 2026', status: 'Expired', owner: 'Kabir' },
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
    members: 24,
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
    members: 41,
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
    members: 12,
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
  { id: 'MSU-04', name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98330 21145', city: 'Pune', planId: 'MEM-03', plan: 'Platinum Elite', members: 4, source: 'Website', received: '04 Aug 2026', status: 'New', quote: '' },
  { id: 'MSU-03', name: 'Rohan Bhatt', email: 'rohan.bhatt@outlook.com', phone: '+91 99201 55420', city: 'Mumbai', planId: 'MEM-02', plan: 'Gold Voyager', members: 2, source: 'Website', received: '03 Aug 2026', status: 'Quoted', quote: 'QUO-1189' },
  { id: 'MSU-02', name: 'Meher Shaikh', email: 'meher.s@gmail.com', phone: '+91 97027 66311', city: 'Nashik', planId: 'MEM-01', plan: 'Silver Explorer', members: 1, source: 'Website', received: '02 Aug 2026', status: 'Quoted', quote: 'QUO-1188' },
  { id: 'MSU-01', name: 'Vikas Rane', email: 'vikas.rane@gmail.com', phone: '+91 98194 30078', city: 'Thane', planId: 'MEM-02', plan: 'Gold Voyager', members: 3, source: 'Website', received: '28 Jul 2026', status: 'Active', quote: 'QUO-1190' },
];

export const signupTone = {
  New: 'amber',
  Quoted: 'sky',
  Active: 'green',
  Cancelled: 'rose',
};

/** Membership fee for a plan and member count, with GST applied. */
export function membershipAmount(plan, members = 1) {
  const subtotal = Number(plan?.price || 0) * Math.max(1, Number(members) || 1);
  const tax = Math.round((subtotal * MEMBERSHIP_GST) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export const invoices = [
  { id: 'INV-4412', customer: 'Ajay Panchmukh', booking: 'BKG-8821', issued: '02 Aug 2026', due: '10 Aug 2026', amount: 286800, paid: 286800, status: 'Paid' },
  { id: 'INV-4411', customer: 'Meera Iyer', booking: 'BKG-8817', issued: '01 Aug 2026', due: '12 Aug 2026', amount: 336000, paid: 336000, status: 'Paid' },
  { id: 'INV-4410', customer: 'Priya Nair', booking: 'BKG-8820', issued: '31 Jul 2026', due: '14 Aug 2026', amount: 138000, paid: 70000, status: 'Partial' },
  { id: 'INV-4409', customer: 'Farhan Qureshi', booking: 'BKG-8818', issued: '30 Jul 2026', due: '20 Aug 2026', amount: 176700, paid: 50000, status: 'Partial' },
  { id: 'INV-4408', customer: 'Sitaram Parab', booking: 'BKG-8815', issued: '29 Jul 2026', due: '05 Aug 2026', amount: 305600, paid: 0, status: 'Overdue' },
  { id: 'INV-4407', customer: 'Rahul Menon', booking: 'BKG-8813', issued: '28 Jul 2026', due: '25 Aug 2026', amount: 424000, paid: 150000, status: 'Partial' },
  { id: 'INV-4406', customer: 'Tanvi Joshi', booking: 'BKG-8812', issued: '02 Jul 2026', due: '12 Jul 2026', amount: 143400, paid: 143400, status: 'Paid' },
];

export const invoiceTone = {
  Paid: 'green',
  Partial: 'amber',
  Overdue: 'rose',
  Draft: 'slate',
};

export const payments = [
  { id: 'PAY-9931', customer: 'Meera Iyer', invoice: 'INV-4411', date: '03 Aug 2026', mode: 'Bank transfer', amount: 186000, status: 'Success' },
  { id: 'PAY-9930', customer: 'Ajay Panchmukh', invoice: 'INV-4412', date: '02 Aug 2026', mode: 'UPI', amount: 286800, status: 'Success' },
  { id: 'PAY-9929', customer: 'Rahul Menon', invoice: 'INV-4407', date: '01 Aug 2026', mode: 'Card', amount: 150000, status: 'Success' },
  { id: 'PAY-9928', customer: 'Priya Nair', invoice: 'INV-4410', date: '31 Jul 2026', mode: 'UPI', amount: 70000, status: 'Success' },
  { id: 'PAY-9927', customer: 'Farhan Qureshi', invoice: 'INV-4409', date: '30 Jul 2026', mode: 'Cash', amount: 50000, status: 'Success' },
  { id: 'PAY-9926', customer: 'Kiran Rao', invoice: 'INV-4399', date: '28 Jul 2026', mode: 'UPI', amount: 20000, status: 'Refunded' },
  { id: 'PAY-9925', customer: 'Imran Shaikh', invoice: 'INV-4396', date: '26 Jul 2026', mode: 'Bank transfer', amount: 294500, status: 'Success' },
];

export const paymentTone = { Success: 'green', Pending: 'amber', Failed: 'rose', Refunded: 'violet' };

// -- Suppliers --------------------------------------------------------------
export const suppliers = [
  { id: 'SUP-21', name: 'Bali Sunrise DMC', category: 'DMC', region: 'Indonesia', contact: 'Wayan Putra', phone: '+62 812 4455 991', rating: 4.8, bookings: 62, status: 'Active' },
  { id: 'SUP-22', name: 'Emirates Holidays Desk', category: 'Airline', region: 'UAE', contact: 'Sara Al Nuaimi', phone: '+971 50 221 4478', rating: 4.6, bookings: 48, status: 'Active' },
  { id: 'SUP-23', name: 'Lagoon Resorts Maldives', category: 'Hotel', region: 'Maldives', contact: 'Ahmed Rasheed', phone: '+960 779 3321', rating: 4.9, bookings: 24, status: 'Active' },
  { id: 'SUP-24', name: 'Alps Rail & Coach', category: 'Transport', region: 'Switzerland', contact: 'Lukas Meier', phone: '+41 79 220 1188', rating: 4.7, bookings: 17, status: 'Active' },
  { id: 'SUP-25', name: 'Backwater Cruises Kerala', category: 'Hotel', region: 'India', contact: 'Joseph Thomas', phone: '+91 98470 11223', rating: 4.4, bookings: 71, status: 'Active' },
  { id: 'SUP-26', name: 'Phuket Coast Tours', category: 'DMC', region: 'Thailand', contact: 'Nattapong S.', phone: '+66 81 334 5566', rating: 4.2, bookings: 88, status: 'On hold' },
  { id: 'SUP-27', name: 'VisaExpress Consultants', category: 'Visa', region: 'Global', contact: 'Rhea Dsouza', phone: '+91 98200 44117', rating: 4.5, bookings: 134, status: 'Active' },
];

// -- Campaigns --------------------------------------------------------------
export const campaigns = [
  { id: 'CMP-77', name: 'Monsoon Kerala Flash Sale', channel: 'WhatsApp', sent: 4820, opened: 3612, clicked: 894, leads: 63, status: 'Completed', spend: 18000 },
  { id: 'CMP-76', name: 'Bali Honeymoon — Instagram', channel: 'Instagram', sent: 22400, opened: 15380, clicked: 2104, leads: 118, status: 'Running', spend: 65000 },
  { id: 'CMP-75', name: 'Dubai Long Weekend', channel: 'Email', sent: 7600, opened: 2812, clicked: 421, leads: 34, status: 'Running', spend: 12000 },
  { id: 'CMP-74', name: 'Early Bird Europe 2027', channel: 'Google Ads', sent: 18900, opened: 11240, clicked: 1876, leads: 91, status: 'Running', spend: 84000 },
  { id: 'CMP-73', name: 'Ladakh Bike Expedition', channel: 'WhatsApp', sent: 3100, opened: 2440, clicked: 512, leads: 41, status: 'Paused', spend: 9500 },
];

export const campaignTone = { Running: 'green', Paused: 'amber', Completed: 'violet', Draft: 'slate' };

// -- Team -------------------------------------------------------------------
export const team = [
  { id: 'USR-01', name: 'Dushyant Kale', role: 'Owner', email: 'dushyant@smiraclub.com', phone: '+91 98200 11223', enquiries: 0, bookings: 0, revenue: 0, status: 'Active' },
  { id: 'USR-02', name: 'Sneha Kulkarni', role: 'Senior Travel Consultant', email: 'sneha@smiraclub.com', phone: '+91 98211 44556', enquiries: 62, bookings: 21, revenue: 1684000, status: 'Active' },
  { id: 'USR-03', name: 'Ritik Sharma', role: 'Travel Consultant', email: 'ritik@smiraclub.com', phone: '+91 99303 88110', enquiries: 58, bookings: 17, revenue: 1215000, status: 'Active' },
  { id: 'USR-04', name: 'Kabir Menon', role: 'Travel Consultant', email: 'kabir@smiraclub.com', phone: '+91 90045 22119', enquiries: 48, bookings: 16, revenue: 1366000, status: 'Active' },
  { id: 'USR-05', name: 'Rhea Dsouza', role: 'Visa & Documentation', email: 'rhea@smiraclub.com', phone: '+91 98200 44117', enquiries: 0, bookings: 0, revenue: 0, status: 'Active' },
  { id: 'USR-06', name: 'Amit Patil', role: 'Accounts', email: 'amit@smiraclub.com', phone: '+91 97654 33221', enquiries: 0, bookings: 0, revenue: 0, status: 'Invited' },
];

export const consultantPerformance = team
  .filter((t) => t.bookings > 0)
  .map((t) => ({ name: t.name.split(' ')[0], enquiries: t.enquiries, bookings: t.bookings, revenue: t.revenue }));

// -- Activity feed ----------------------------------------------------------
export const activityFeed = [
  { id: 1, who: 'Sneha', what: 'confirmed booking', target: 'BKG-8817 · Maldives', when: '12 min ago', tone: 'green' },
  { id: 2, who: 'Ritik', what: 'sent itinerary to', target: 'Siddhesh Rane', when: '38 min ago', tone: 'sky' },
  { id: 3, who: 'System', what: 'received payment', target: '₹1,86,000 · INV-4411', when: '1 hr ago', tone: 'green' },
  { id: 4, who: 'Kabir', what: 'marked enquiry lost', target: 'Sulekha Chavan', when: '2 hrs ago', tone: 'rose' },
  { id: 5, who: 'Rhea', what: 'filed visa application', target: 'Rahul Menon · Schengen', when: '3 hrs ago', tone: 'violet' },
  { id: 6, who: 'Sneha', what: 'created quotation', target: 'QUO-1187 · Maldives', when: '5 hrs ago', tone: 'amber' },
  { id: 7, who: 'Ritik', what: 'added new enquiry', target: 'Jayashree Patil', when: '6 hrs ago', tone: 'sky' },
];

export const upcomingDepartures = bookings
  .filter((b) => ['Confirmed', 'Part paid', 'Pending'].includes(b.status))
  .slice(0, 5);
