// ---------------------------------------------------------------------------
// Seed records for the modules built out from the client's product map.
// Same rule as the main dataset: fake, but internally consistent.
// ---------------------------------------------------------------------------

// -- Vendors (the client calls these partners) -------------------------------
export const partners = [
  { id: 'PTR-01', name: 'Wanderlust Travels', type: 'Sub-agent', city: 'Nashik', contact: 'Nilesh Pawar', phone: '+91 98220 41155', commission: 8, bookings: 14, sourced: 1180000, owed: 42400, paid: 52000, status: 'Active' },
  { id: 'PTR-02', name: 'Skyline Corporate Desk', type: 'Corporate', city: 'Mumbai', contact: 'Farah Khan', phone: '+91 99674 22013', commission: 5, bookings: 22, sourced: 2640000, owed: 0, paid: 132000, status: 'Active' },
];

// -- Travel inventory -------------------------------------------------------
export const inventory = [
  // Hotels — what the room is, what it costs a night, how many are free
  { id: 'TIV-01', kind: 'Hotels', name: 'Ayana Resort & Spa', location: 'Jimbaran, Bali', stars: 5, roomType: 'Ocean view suite', mealPlan: 'Breakfast included', rooms: 20, booked: 12, price: 42000, supplier: 'Bali Sunrise DMC', status: 'Available' },
  { id: 'TIV-02', kind: 'Hotels', name: 'Atlantis The Palm', location: 'Palm Jumeirah, Dubai', stars: 5, roomType: 'Deluxe king', mealPlan: 'Half board', rooms: 14, booked: 9, price: 36500, supplier: 'Gulf Stays LLC', status: 'Limited' },

  // Packages — the trip itself: how long, what it costs a head, seats left
  { id: 'TIV-05', kind: 'Packages', name: 'Bali Honeymoon Escape', location: 'Bali, Indonesia', days: 7, nights: 6, departure: '02 Sep 2026', seats: 25, booked: 18, price: 92500, supplier: 'Bali Sunrise DMC', status: 'Available' },
  { id: 'TIV-06', kind: 'Packages', name: 'Kerala Backwaters Family', location: 'Kochi · Alleppey', days: 6, nights: 5, departure: '24 Aug 2026', seats: 30, booked: 22, price: 34500, supplier: 'Kerala Houseboat Collective', status: 'Limited' },

  // Villas — bedrooms and how many people sleep there
  { id: 'TIV-09', kind: 'Villas', name: 'Villa Seminyak — private pool', location: 'Seminyak, Bali', bedrooms: 3, guests: 6, price: 54000, nights: 1, supplier: 'Bali Sunrise DMC', status: 'Sold out', booked: 8, rooms: 8 },
  { id: 'TIV-10', kind: 'Villas', name: 'Casa Alibaug — beachfront', location: 'Alibaug, Maharashtra', bedrooms: 4, guests: 10, price: 28000, nights: 1, supplier: 'Konkan Retreats', status: 'Available', booked: 2, rooms: 6 },

  // Lifestyle — the extras, and who provides them
  { id: 'TIV-13', kind: 'Lifestyle', name: 'Airport lounge pass', category: 'Lounge', location: 'All Indian airports', price: 1200, rooms: 100, booked: 61, supplier: 'DreamFolks', status: 'Available' },
  { id: 'TIV-14', kind: 'Lifestyle', name: 'Schengen visa filing', category: 'Visa', location: 'Mumbai centre', price: 4500, rooms: 40, booked: 12, supplier: 'VFS partner desk', status: 'Available' },
];

// -- Lifestyle add-ons ------------------------------------------------------
export const lifestyle = [
  { id: 'LIF-01', name: 'Schengen visa filing', category: 'Visa', price: 4500, supplier: 'VFS partner desk', sold: 38, margin: 1800, status: 'Active' },
  { id: 'LIF-02', name: 'Travel insurance — family', category: 'Insurance', price: 2400, supplier: 'Reliance General', sold: 52, margin: 720, status: 'Active' },
];

// -- Automation rules -------------------------------------------------------
export const automations = [
  { id: 'AUT-01', name: 'Ringing rules', description: 'Chase leads whose phone rang but nobody answered', trigger: 'Call ends without an answer', conditions: ['Enquiry status is New', 'Enquiry status is Contacted'], days: [{ day: 1, actions: ['Send WhatsApp: sorry we missed you'] }, { day: 3, actions: ['Create a call-back task for the owner'] }], runs: 2496, completed: 2496, errors: 0, leads: 2496, lastRun: 'a month ago', status: 'Active' },
  { id: 'AUT-02', name: 'Not interested rules', description: 'Park leads that said no, and keep them for a later offer', trigger: 'Enquiry marked Lost', conditions: ['Reason is Not interested'], days: [{ day: 1, actions: ['Move to the nurture list'] }, { day: 30, actions: ['Send seasonal offer'] }], runs: 2200, completed: 2200, errors: 0, leads: 2200, lastRun: '22 days ago', status: 'Active' },
];

// -- Notification rules -----------------------------------------------------
export const notificationRules = [
  { id: 'NTF-01', event: 'New enquiry received', inApp: true, email: true, whatsapp: true, audience: 'Assigned consultant', status: 'On' },
  { id: 'NTF-02', event: 'Payment received', inApp: true, email: true, whatsapp: false, audience: 'Owner and accounts', status: 'On' },
];

// -- Offers and promotions --------------------------------------------------
export const offers = [
  { id: 'OFR-01', code: 'MONSOON15', title: 'Monsoon Kerala — 15% off', discount: 15, kind: 'Percent', appliesTo: 'Kerala packages', validTill: '30 Sep 2026', used: 24, limit: 100, status: 'Running' },
  { id: 'OFR-02', code: 'HONEY5000', title: 'Honeymoon flat ₹5,000 off', discount: 5000, kind: 'Flat', appliesTo: 'Honeymoon packages', validTill: '31 Dec 2026', used: 11, limit: 50, status: 'Running' },
];

// -- Roles ------------------------------------------------------------------
export const permissionAreas = [
  'Sales & leads',
  'Bookings',
  'Membership',
  'Finance',
  'Travellers',
  'Reports',
  'Settings',
];

export const roles = [
  { id: 'ROL-01', name: 'Owner', people: 1, description: 'Full access, including finance and settings', canDelete: true, canExport: true, areas: [...permissionAreas] },
  { id: 'ROL-02', name: 'Senior consultant', people: 1, description: 'Sells and quotes, sees team reports', canDelete: false, canExport: true, areas: ['Sales & leads', 'Bookings', 'Membership', 'Travellers', 'Reports'] },
];

// -- Referrals --------------------------------------------------------------
export const referrals = [
  { id: 'REF-01', referrer: 'Ajay Panchmukh', referred: 'Siddhesh Rane', date: '28 Jul 2026', status: 'Booked', reward: 5000, rewardKind: 'Travel credit', paid: true },
  { id: 'REF-02', referrer: 'Meera Iyer', referred: 'Divya Sharma', date: '01 Aug 2026', status: 'Enquiry', reward: 5000, rewardKind: 'Travel credit', paid: false },
];

// -- Website forms ----------------------------------------------------------
export const forms = [
  { id: 'FRM-01', name: 'Enquiry form', description: 'Main enquiry form on every package page', listName: 'Default lead list', responses: 168, lastResponse: '2 hours ago', createdBy: 'Dushyant Kale', createdOn: '12 Jun 2026', status: 'Live' },
  { id: 'FRM-02', name: 'Request a callback', description: 'Short form behind the header button', listName: 'Callback list', responses: 94, lastResponse: 'yesterday', createdBy: 'Sneha Kulkarni', createdOn: '02 Jul 2026', status: 'Live' },
];

export const formLists = ['Default lead list', 'Callback list', 'Membership list', 'Newsletter list'];

// -- Blog -------------------------------------------------------------------
export const blogs = [
  { id: 'BLG-01', title: '10 days in Bali on an Indian budget', author: 'Sneha Kulkarni', category: 'Destination guide', published: '28 Jul 2026', views: 4820, status: 'Published' },
  { id: 'BLG-02', title: 'Schengen visa from Mumbai — the 2026 checklist', author: 'Rhea Dsouza', category: 'Visa & documents', published: '22 Jul 2026', views: 7310, status: 'Published' },
];

// -- Banners ----------------------------------------------------------------
export const banners = [
  { id: 'BNR-01', title: 'Monsoon Kerala sale', placement: 'Home hero', starts: '01 Aug 2026', ends: '30 Sep 2026', clicks: 1840, impressions: 24600, status: 'Live' },
  { id: 'BNR-02', title: 'Honeymoon collection', placement: 'Packages top strip', starts: '15 Jul 2026', ends: '31 Dec 2026', clicks: 960, impressions: 18200, status: 'Live' },
];

// -- SEO --------------------------------------------------------------------
export const seoPages = [
  { id: 'SEO-01', page: '/', title: 'Smira Club — Curated holidays from Mumbai', description: 'Handcrafted holiday packages, visas and memberships for Indian travellers.', keyword: 'travel agency mumbai', position: 6, score: 88, indexed: true },
  { id: 'SEO-02', page: '/packages/bali-honeymoon', title: 'Bali honeymoon packages from India', description: 'Seven-day Bali honeymoon with pool villa, transfers and candlelight dinner.', keyword: 'bali honeymoon package', position: 3, score: 92, indexed: true },
];

// -- API keys and webhooks --------------------------------------------------
export const apiKeys = [
  { id: 'API-01', name: 'Website enquiry form', key: 'sk_live_7f2a••••••4c91', scope: 'Create enquiries', created: '12 Jun 2026', lastUsed: '04 Aug 2026', calls: 1840, status: 'Active' },
  { id: 'API-02', name: 'Razorpay webhook', key: 'sk_live_b39d••••••11ae', scope: 'Record payments', created: '02 Mar 2026', lastUsed: '04 Aug 2026', calls: 612, status: 'Active' },
];

// -- Lead activity ----------------------------------------------------------
// Everything that has happened to an enquiry, newest last. The panel appends
// to this whenever the desk acts on a lead.
export const activities = [
  { id: 'ACT-01', lead: 'ENQ-2041', kind: 'created', text: 'New lead created', meta: 'Source: Instagram', who: 'System', at: '04 Aug 2026, 09:12 am' },
  { id: 'ACT-02', lead: 'ENQ-2041', kind: 'automation', text: "Automation: Interested rules — moved to list 'Interested'", who: 'System', at: '04 Aug 2026, 09:13 am' },
];
