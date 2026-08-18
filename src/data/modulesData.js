// ---------------------------------------------------------------------------
// Seed records for the modules built out from the client's product map.
// Same rule as the main dataset: fake, but internally consistent.
// ---------------------------------------------------------------------------

// -- Partners ---------------------------------------------------------------
export const partners = [
  { id: 'PTR-01', name: 'Wanderlust Travels', type: 'Sub-agent', city: 'Nashik', contact: 'Nilesh Pawar', phone: '+91 98220 41155', commission: 8, bookings: 14, sourced: 1180000, owed: 42400, paid: 52000, status: 'Active' },
  { id: 'PTR-02', name: 'Skyline Corporate Desk', type: 'Corporate', city: 'Mumbai', contact: 'Farah Khan', phone: '+91 99674 22013', commission: 5, bookings: 22, sourced: 2640000, owed: 0, paid: 132000, status: 'Active' },
  { id: 'PTR-03', name: 'Hilltop Holidays', type: 'Sub-agent', city: 'Pune', contact: 'Rohit Deshpande', phone: '+91 90280 77341', commission: 10, bookings: 9, sourced: 720000, owed: 72000, paid: 0, status: 'Active' },
  { id: 'PTR-04', name: 'Coastal Getaways', type: 'Affiliate', city: 'Goa', contact: 'Maria Fernandes', phone: '+91 98501 30022', commission: 6, bookings: 4, sourced: 310000, owed: 18600, paid: 0, status: 'On hold' },
  { id: 'PTR-05', name: 'Nomad Referral Club', type: 'Affiliate', city: 'Bengaluru', contact: 'Arjun Rao', phone: '+91 97400 11882', commission: 4, bookings: 11, sourced: 890000, owed: 0, paid: 35600, status: 'Active' },
];

// -- Travel inventory -------------------------------------------------------
export const inventory = [
  { id: 'INV-01', item: 'Bali — Ayana Resort', kind: 'Hotel', supplier: 'Bali Sunrise DMC', season: 'Sep – Nov 2026', held: 20, sold: 12, release: '15 Aug 2026', cost: 42000, status: 'Confirmed' },
  { id: 'INV-02', item: 'Mumbai → Malé seats', kind: 'Flight', supplier: 'Emirates Holidays Desk', season: 'Dec 2026', held: 30, sold: 24, release: '01 Oct 2026', cost: 38500, status: 'Confirmed' },
  { id: 'INV-03', item: 'Kerala houseboat — deluxe', kind: 'Cruise', supplier: 'Kerala Houseboat Collective', season: 'Aug – Oct 2026', held: 12, sold: 5, release: '20 Aug 2026', cost: 18500, status: 'Confirmed' },
  { id: 'INV-04', item: 'Dubai desert safari coaches', kind: 'Transport', supplier: 'Gulf Transfers LLC', season: 'Sep 2026', held: 8, sold: 8, release: '05 Sep 2026', cost: 9500, status: 'Sold out' },
  { id: 'INV-05', item: 'Ladakh camp — Pangong', kind: 'Camp', supplier: 'Himalayan Base Co.', season: 'Jun – Sep 2026', held: 15, sold: 3, release: '30 Aug 2026', cost: 12000, status: 'Provisional' },
  { id: 'INV-06', item: 'Swiss rail passes', kind: 'Rail', supplier: 'Alpine Rail Partners', season: 'Oct – Dec 2026', held: 25, sold: 6, release: '12 Sep 2026', cost: 21500, status: 'Confirmed' },
];

// -- Lifestyle add-ons ------------------------------------------------------
export const lifestyle = [
  { id: 'LIF-01', name: 'Schengen visa filing', category: 'Visa', price: 4500, supplier: 'VFS partner desk', sold: 38, margin: 1800, status: 'Active' },
  { id: 'LIF-02', name: 'Travel insurance — family', category: 'Insurance', price: 2400, supplier: 'Reliance General', sold: 52, margin: 720, status: 'Active' },
  { id: 'LIF-03', name: 'Airport lounge pass', category: 'Lounge', price: 1200, supplier: 'DreamFolks', sold: 61, margin: 400, status: 'Active' },
  { id: 'LIF-04', name: 'Private airport transfer', category: 'Transfer', price: 3200, supplier: 'Gulf Transfers LLC', sold: 44, margin: 900, status: 'Active' },
  { id: 'LIF-05', name: 'Candlelight beach dinner', category: 'Experience', price: 8500, supplier: 'Bali Sunrise DMC', sold: 17, margin: 2600, status: 'Active' },
  { id: 'LIF-06', name: 'Forex card loading', category: 'Forex', price: 500, supplier: 'BookMyForex', sold: 29, margin: 500, status: 'Paused' },
];

// -- Automation rules -------------------------------------------------------
export const automations = [
  { id: 'AUT-01', name: 'Assign website enquiries by destination', trigger: 'New enquiry from Website', action: 'Assign to the destination specialist', runs: 46, lastRun: '04 Aug 2026', status: 'On' },
  { id: 'AUT-02', name: 'Payment reminder before due date', trigger: 'Invoice due in 3 days', action: 'Send WhatsApp reminder to the customer', runs: 118, lastRun: '04 Aug 2026', status: 'On' },
  { id: 'AUT-03', name: 'Birthday greeting', trigger: "Traveller's birthday", action: 'Send greeting with a member offer', runs: 74, lastRun: '03 Aug 2026', status: 'On' },
  { id: 'AUT-04', name: 'Quote gone quiet', trigger: 'Quotation not viewed for 4 days', action: 'Create a follow-up task for the owner', runs: 31, lastRun: '02 Aug 2026', status: 'On' },
  { id: 'AUT-05', name: 'Document chase before departure', trigger: '10 days before departure', action: 'Ask for passport and visa copies', runs: 22, lastRun: '01 Aug 2026', status: 'Off' },
];

// -- Notification rules -----------------------------------------------------
export const notificationRules = [
  { id: 'NTF-01', event: 'New enquiry received', inApp: true, email: true, whatsapp: true, audience: 'Assigned consultant', status: 'On' },
  { id: 'NTF-02', event: 'Payment received', inApp: true, email: true, whatsapp: false, audience: 'Owner and accounts', status: 'On' },
  { id: 'NTF-03', event: 'Invoice overdue', inApp: true, email: true, whatsapp: true, audience: 'Owner and accounts', status: 'On' },
  { id: 'NTF-04', event: 'Departure in 7 days', inApp: true, email: false, whatsapp: true, audience: 'Assigned consultant', status: 'On' },
  { id: 'NTF-05', event: 'Membership signup', inApp: true, email: true, whatsapp: false, audience: 'Owner', status: 'On' },
  { id: 'NTF-06', event: 'Weekly summary', inApp: false, email: true, whatsapp: false, audience: 'Owner', status: 'Off' },
];

// -- Offers and promotions --------------------------------------------------
export const offers = [
  { id: 'OFR-01', code: 'MONSOON15', title: 'Monsoon Kerala — 15% off', discount: 15, kind: 'Percent', appliesTo: 'Kerala packages', validTill: '30 Sep 2026', used: 24, limit: 100, status: 'Running' },
  { id: 'OFR-02', code: 'HONEY5000', title: 'Honeymoon flat ₹5,000 off', discount: 5000, kind: 'Flat', appliesTo: 'Honeymoon packages', validTill: '31 Dec 2026', used: 11, limit: 50, status: 'Running' },
  { id: 'OFR-03', code: 'GOLDONLY', title: 'Gold member early access', discount: 10, kind: 'Percent', appliesTo: 'Gold Voyager members', validTill: '31 Mar 2027', used: 6, limit: 0, status: 'Running' },
  { id: 'OFR-04', code: 'DIWALI20', title: 'Diwali festive sale', discount: 20, kind: 'Percent', appliesTo: 'All packages', validTill: '15 Nov 2026', used: 0, limit: 200, status: 'Scheduled' },
  { id: 'OFR-05', code: 'SUMMER10', title: 'Summer getaway', discount: 10, kind: 'Percent', appliesTo: 'All packages', validTill: '30 Jun 2026', used: 87, limit: 100, status: 'Expired' },
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
  { id: 'ROL-03', name: 'Travel consultant', people: 2, description: 'Works their own leads and bookings', canDelete: false, canExport: false, areas: ['Sales & leads', 'Bookings', 'Travellers'] },
  { id: 'ROL-04', name: 'Visa & documentation', people: 1, description: 'Documents and departure readiness only', canDelete: false, canExport: false, areas: ['Bookings', 'Travellers'] },
  { id: 'ROL-05', name: 'Accounts', people: 1, description: 'Invoices, payments and financial reports', canDelete: false, canExport: true, areas: ['Finance', 'Reports'] },
];

// -- Referrals --------------------------------------------------------------
export const referrals = [
  { id: 'REF-01', referrer: 'Ajay Panchmukh', referred: 'Siddhesh Rane', date: '28 Jul 2026', status: 'Booked', reward: 5000, rewardKind: 'Travel credit', paid: true },
  { id: 'REF-02', referrer: 'Meera Iyer', referred: 'Divya Sharma', date: '01 Aug 2026', status: 'Enquiry', reward: 5000, rewardKind: 'Travel credit', paid: false },
  { id: 'REF-03', referrer: 'Vikas Rane', referred: 'Suhas Bansode', date: '02 Aug 2026', status: 'Quoted', reward: 5000, rewardKind: 'Travel credit', paid: false },
  { id: 'REF-04', referrer: 'Priya Nair', referred: 'Mahendra Mandhare', date: '30 Jul 2026', status: 'Booked', reward: 5000, rewardKind: 'Gift voucher', paid: true },
  { id: 'REF-05', referrer: 'Vikram Shetty', referred: 'Kiran Rao', date: '03 Aug 2026', status: 'Lost', reward: 0, rewardKind: '—', paid: false },
];

// -- Website forms ----------------------------------------------------------
export const forms = [
  { id: 'FRM-01', name: 'Enquiry form', placement: 'Every package page', fields: 7, submissions: 168, routesTo: 'Sales & leads', spam: 12, status: 'Live' },
  { id: 'FRM-02', name: 'Request a callback', placement: 'Header button', fields: 3, submissions: 94, routesTo: 'Sales & leads', spam: 8, status: 'Live' },
  { id: 'FRM-03', name: 'Membership signup', placement: 'Pricing page', fields: 5, submissions: 41, routesTo: 'Membership', spam: 2, status: 'Live' },
  { id: 'FRM-04', name: 'Newsletter', placement: 'Footer', fields: 1, submissions: 612, routesTo: 'Campaigns', spam: 46, status: 'Live' },
  { id: 'FRM-05', name: 'Group tour interest', placement: 'Group tours page', fields: 6, submissions: 0, routesTo: 'Sales & leads', spam: 0, status: 'Draft' },
];

// -- Blog -------------------------------------------------------------------
export const blogs = [
  { id: 'BLG-01', title: '10 days in Bali on an Indian budget', author: 'Sneha Kulkarni', category: 'Destination guide', published: '28 Jul 2026', views: 4820, status: 'Published' },
  { id: 'BLG-02', title: 'Schengen visa from Mumbai — the 2026 checklist', author: 'Rhea Dsouza', category: 'Visa & documents', published: '22 Jul 2026', views: 7310, status: 'Published' },
  { id: 'BLG-03', title: 'Kerala backwaters with kids', author: 'Ritik Sharma', category: 'Family travel', published: '14 Jul 2026', views: 2960, status: 'Published' },
  { id: 'BLG-04', title: 'Maldives on points: is it worth it?', author: 'Kabir Menon', category: 'Luxury', published: '—', views: 0, status: 'Draft' },
  { id: 'BLG-05', title: 'Ladakh road trip: permits explained', author: 'Kabir Menon', category: 'Adventure', published: '05 Sep 2026', views: 0, status: 'Scheduled' },
];

// -- Banners ----------------------------------------------------------------
export const banners = [
  { id: 'BNR-01', title: 'Monsoon Kerala sale', placement: 'Home hero', starts: '01 Aug 2026', ends: '30 Sep 2026', clicks: 1840, impressions: 24600, status: 'Live' },
  { id: 'BNR-02', title: 'Honeymoon collection', placement: 'Packages top strip', starts: '15 Jul 2026', ends: '31 Dec 2026', clicks: 960, impressions: 18200, status: 'Live' },
  { id: 'BNR-03', title: 'Membership — join now', placement: 'Sidebar', starts: '01 Aug 2026', ends: '31 Mar 2027', clicks: 412, impressions: 9800, status: 'Live' },
  { id: 'BNR-04', title: 'Diwali festive teaser', placement: 'Home hero', starts: '20 Oct 2026', ends: '15 Nov 2026', clicks: 0, impressions: 0, status: 'Scheduled' },
  { id: 'BNR-05', title: 'Summer getaway', placement: 'Home hero', starts: '01 Apr 2026', ends: '30 Jun 2026', clicks: 2210, impressions: 31400, status: 'Ended' },
];

// -- SEO --------------------------------------------------------------------
export const seoPages = [
  { id: 'SEO-01', page: '/', title: 'Smira Club — Curated holidays from Mumbai', description: 'Handcrafted holiday packages, visas and memberships for Indian travellers.', keyword: 'travel agency mumbai', position: 6, score: 88, indexed: true },
  { id: 'SEO-02', page: '/packages/bali-honeymoon', title: 'Bali honeymoon packages from India', description: 'Seven-day Bali honeymoon with pool villa, transfers and candlelight dinner.', keyword: 'bali honeymoon package', position: 3, score: 92, indexed: true },
  { id: 'SEO-03', page: '/packages/kerala-backwaters', title: 'Kerala backwaters family package', description: 'Six-day Kerala houseboat holiday for families, with transfers included.', keyword: 'kerala family package', position: 11, score: 74, indexed: true },
  { id: 'SEO-04', page: '/membership', title: 'Smira Club membership plans', description: 'Silver, Gold and Platinum plans with package discounts and priority support.', keyword: 'travel club membership india', position: 24, score: 61, indexed: true },
  { id: 'SEO-05', page: '/blog/schengen-visa-checklist', title: 'Schengen visa checklist 2026', description: 'Every document you need for a Schengen visa from Mumbai in 2026.', keyword: 'schengen visa checklist', position: 2, score: 95, indexed: true },
  { id: 'SEO-06', page: '/contact', title: 'Contact Smira Club', description: 'Talk to a travel consultant in Andheri East, Mumbai.', keyword: '', position: 0, score: 42, indexed: false },
];

// -- API keys and webhooks --------------------------------------------------
export const apiKeys = [
  { id: 'API-01', name: 'Website enquiry form', key: 'sk_live_7f2a••••••4c91', scope: 'Create enquiries', created: '12 Jun 2026', lastUsed: '04 Aug 2026', calls: 1840, status: 'Active' },
  { id: 'API-02', name: 'Razorpay webhook', key: 'sk_live_b39d••••••11ae', scope: 'Record payments', created: '02 Mar 2026', lastUsed: '04 Aug 2026', calls: 612, status: 'Active' },
  { id: 'API-03', name: 'Tally accounting sync', key: 'sk_live_c80f••••••7d22', scope: 'Read invoices', created: '18 Jan 2026', lastUsed: '03 Aug 2026', calls: 240, status: 'Active' },
  { id: 'API-04', name: 'WhatsApp Business API', key: 'sk_live_4e61••••••90bb', scope: 'Send messages', created: '05 May 2026', lastUsed: '04 Aug 2026', calls: 3120, status: 'Active' },
  { id: 'API-05', name: 'Old website (retired)', key: 'sk_live_19cc••••••33fa', scope: 'Create enquiries', created: '20 Nov 2025', lastUsed: '14 Feb 2026', calls: 410, status: 'Revoked' },
];
