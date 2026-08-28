/**
 * Offers and promotions, built to the client's sheet: what the homepage shows,
 * who is allowed to use an offer, where it appears, what it costs the margin,
 * and every redemption that came of it.
 */

/** The homepage rows the admin can reorder and publish. */
export const homepageSections = [
  { name: 'Hero offers', live: true, offers: 2 },
  { name: 'Trending offers', live: true, offers: 3 },
  { name: 'Exclusive member offers', live: true, offers: 2 },
  { name: 'Weekend deals', live: true, offers: 2 },
  { name: 'Holiday deals', live: false, offers: 1 },
  { name: 'Near you', live: true, offers: 4 },
  { name: 'Lifestyle offers', live: true, offers: 5 },
  { name: 'Last-minute deals', live: false, offers: 1 },
  { name: 'Premium offers', live: true, offers: 2 },
  { name: 'Recommended for you', live: true, offers: 6 },
];

/** Everything an offer can be. */
export const offerTypes = {
  'Holiday and travel': [
    'Free hotel stay', 'Hotel discount', 'Villa offer', 'Resort offer', 'Weekend getaway',
    'Holiday package', 'International package', 'Domestic package', 'Early-bird offer',
    'Last-minute deal', 'Couple package', 'Family package',
  ],
  Lifestyle: [
    'Restaurant', 'Spa', 'Salon', 'Water park', 'Theme park', 'Entertainment', 'Movie',
    'Gaming', 'Adventure', 'Shopping', 'Events',
  ],
  Membership: [
    'New member offer', 'Renewal offer', 'Upgrade offer', 'Birthday offer', 'Anniversary offer',
    'Referral offer', 'Welcome gift', 'Booking milestone reward',
  ],
};

/** What the customer actually gets. */
export const benefitTypes = [
  'Flat ₹ discount', 'Percentage discount', 'Free item', 'Free night', 'Free upgrade',
  'Buy 1 get 1', 'Cashback', 'Coupon', 'Gift', 'Reward points', 'Membership benefit',
  'Special member rate',
];

/** Who is allowed to use it. */
export const membershipEligibility = [
  'All members', 'Silver', 'Gold', 'Platinum', 'Non-members', 'New members',
  'Existing members', 'Renewed members',
];

export const customerConditions = [
  'Minimum booking value', 'Minimum number of nights', 'Minimum number of guests',
  'First booking only', 'Repeat booking', 'New customer only', 'Specific customer segment',
  'Referral customers', 'Birthday month', 'Anniversary month',
];

/** When it can be used. */
export const validityControls = [
  'Booking date', 'Travel date', 'Weekdays', 'Weekends', 'Public holidays',
  'Long weekends', 'Blackout dates', 'Seasonal periods',
];

/** How often it can be used. */
export const usageControls = [
  'Total redemption limit', 'Per customer limit', 'Per membership limit', 'Daily redemption limit',
  'Weekly limit', 'Monthly limit', 'First 100 customers', 'One-time use', 'Multiple use',
  'Minimum booking amount',
];

/** Where it shows up. */
export const distribution = {
  Website: ['Homepage', 'Offers page', 'Hotel listing', 'Villa listing', 'Package page', 'Membership page', 'Checkout', 'Popup', 'Exit intent', 'Search results'],
  App: ['Home banner', 'Push notification', 'Offers section', 'Member dashboard', 'Booking page'],
  CRM: ['Lead profile', 'Customer profile', 'Sales dashboard', 'Follow-up reminder', 'WhatsApp campaign'],
  WhatsApp: ['Automatic campaign', 'Customer-specific offer', 'Abandoned booking offer', 'Renewal offer', 'Birthday offer'],
};

/** What each plan is allowed to see. */
export const tierAccess = [
  { tier: 'Silver', gets: 'Basic offers' },
  { tier: 'Gold', gets: 'Better discounts and lifestyle offers' },
  { tier: 'Platinum', gets: 'Premium hotel and villa offers, special lifestyle benefits' },
  { tier: 'Diamond', gets: 'Exclusive offers, upgrades and premium experiences' },
  { tier: 'Crown', gets: 'VIP and highest-value offers' },
];

/** The offers themselves. */
export const offers = [
  {
    id: 'OFR-01',
    name: 'Weekend villa escape',
    code: 'WEEKEND25',
    category: 'Holiday and travel',
    sub: 'Villa offer',
    benefit: 'Percentage discount',
    headline: 'Get 25% off on weekend villas',
    tiers: ['Gold', 'Platinum'],
    from: '01 Sep 2026',
    to: '30 Sep 2026',
    travelFrom: '01 Sep 2026',
    travelTo: '31 Oct 2026',
    blackout: 'Diwali, Christmas, New Year',
    totalLimit: 500,
    perCustomer: 1,
    minBooking: 10000,
    used: 128,
    views: 4820,
    clicks: 946,
    enquiries: 212,
    bookings: 74,
    revenue: 1480000,
    discountCost: 296000,
    vendorCost: 940000,
    where: ['Homepage', 'Offers page', 'WhatsApp campaign'],
    stage: 'Approved',
    status: 'Live',
  },
  {
    id: 'OFR-02',
    name: 'Gold member Goa exclusive',
    code: 'GOAGOLD3K',
    category: 'Holiday and travel',
    sub: 'Hotel discount',
    benefit: 'Flat ₹ discount',
    headline: 'Gold member exclusive — ₹3,000 off Goa villa bookings',
    tiers: ['Gold'],
    from: '15 Aug 2026',
    to: '31 Oct 2026',
    travelFrom: '15 Aug 2026',
    travelTo: '30 Nov 2026',
    blackout: 'New Year',
    totalLimit: 200,
    perCustomer: 2,
    minBooking: 25000,
    used: 46,
    views: 2140,
    clicks: 512,
    enquiries: 98,
    bookings: 31,
    revenue: 868000,
    discountCost: 93000,
    vendorCost: 610000,
    where: ['Member dashboard', 'Customer profile', 'Push notification'],
    stage: 'Approved',
    status: 'Live',
  },
  {
    id: 'OFR-03',
    name: 'Birthday hotel upgrade',
    code: 'BDAYUP',
    category: 'Membership',
    sub: 'Birthday offer',
    benefit: 'Free upgrade',
    headline: 'Birthday special — enjoy an exclusive hotel upgrade',
    tiers: ['Platinum'],
    from: '01 Jan 2026',
    to: '31 Dec 2026',
    travelFrom: '01 Jan 2026',
    travelTo: '31 Dec 2026',
    blackout: '—',
    totalLimit: 0,
    perCustomer: 1,
    minBooking: 0,
    used: 18,
    views: 640,
    clicks: 288,
    enquiries: 61,
    bookings: 18,
    revenue: 402000,
    discountCost: 54000,
    vendorCost: 286000,
    where: ['WhatsApp campaign', 'Member dashboard'],
    stage: 'Approved',
    status: 'Live',
  },
  {
    id: 'OFR-04',
    name: 'Monsoon spa treat',
    code: 'SPA20',
    category: 'Lifestyle',
    sub: 'Spa',
    benefit: 'Percentage discount',
    headline: '20% off at Serene Spa, Mumbai',
    tiers: ['All members'],
    from: '01 Jul 2026',
    to: '31 Aug 2026',
    travelFrom: '01 Jul 2026',
    travelTo: '31 Aug 2026',
    blackout: '—',
    totalLimit: 300,
    perCustomer: 3,
    minBooking: 0,
    used: 62,
    views: 1560,
    clicks: 402,
    enquiries: 44,
    bookings: 62,
    revenue: 96000,
    discountCost: 19200,
    vendorCost: 64000,
    where: ['Offers page', 'Offers section'],
    stage: 'Manager review',
    status: 'Scheduled',
  },
];

/** Lifestyle offers come from vendors, and redeem differently. */
export const lifestyleCategories = ['Restaurants', 'Spa', 'Salon', 'Movies', 'Theme parks', 'Water parks', 'Gaming', 'Adventure', 'Shopping', 'Events'];

export const lifestyleOffers = [
  {
    id: 'LSO-01', vendor: 'Serene Spa & Wellness', category: 'Spa', location: 'Mumbai',
    offer: '20% off any treatment', original: 2500, member: 2000, discount: 20,
    validity: '31 Aug 2026', days: 'Mon–Thu', redemption: 'QR at the counter',
    bookingRequired: true, channel: 'Direct booking', code: 'SPA20', redemptions: 62, revenue: 96000, settlement: 18400,
  },
  {
    id: 'LSO-02', vendor: 'Bay Leaf Restaurant', category: 'Restaurants', location: 'Pune',
    offer: 'Buy 1 get 1 on mains', original: 1800, member: 900, discount: 50,
    validity: '30 Sep 2026', days: 'All days', redemption: 'Coupon code',
    bookingRequired: false, channel: 'External booking', code: 'BAYB1G1', redemptions: 34, revenue: 30600, settlement: 6100,
  },
];

/** Campaigns bundle offers together. */
export const campaigns = [
  {
    id: 'OCM-01',
    name: 'Monsoon holiday sale',
    from: '01 Sep 2026',
    to: '30 Sep 2026',
    includes: ['Hotel discount', 'Villa discount', 'Package offer', 'Restaurant offer', 'Spa offer', 'Referral bonus', 'Membership upgrade offer'],
    revenue: 2480000,
    leads: 186,
    bookings: 105,
    redemptions: 190,
    conversion: 56,
    discountCost: 408000,
    profit: 612000,
    bestOffer: 'Weekend villa escape',
    bestLocation: 'Goa',
    bestTier: 'Gold',
    status: 'Live',
  },
];

/** Where a redemption stands. */
export const redemptionStates = ['Reserved', 'Applied', 'Redeemed', 'Cancelled', 'Expired', 'Refunded', 'Fraud or blocked'];

export const redemptions = [
  { id: 'RDM-01', customer: 'Rohan Bhatt', offer: 'Weekend villa escape', booking: 'BKG-8821', discount: 2000, date: 'Today', status: 'Redeemed' },
  { id: 'RDM-02', customer: 'Ananya Deshmukh', offer: 'Monsoon spa treat', booking: 'BKG-8820', discount: 500, date: 'Today', status: 'Applied' },
  { id: 'RDM-03', customer: 'Siddhesh Rane', offer: 'Gold member Goa exclusive', booking: '—', discount: 1200, date: 'Yesterday', status: 'Cancelled' },
];

/** How an offer gets published. */
export const approvalFlow = ['Draft', 'Submitted', 'Manager review', 'Approved', 'Live'];

export const approvalHistory = [
  { offer: 'Monsoon spa treat', by: 'Sneha', action: 'Submitted for review', at: '22 Aug 2026, 11:04 am' },
  { offer: 'Weekend villa escape', by: 'Sneha', action: 'Created', at: '18 Aug 2026, 09:40 am' },
  { offer: 'Weekend villa escape', by: 'Kabir', action: 'Approved — margin is healthy', at: '18 Aug 2026, 04:12 pm' },
];

/** What the smart engine reads before deciding what to show. */
export const personalisationSignals = [
  'Membership tier', 'Customer location', 'Previous bookings', 'Favourite destination',
  'Booking frequency', 'Spending history', 'Last booking date', 'Birthday', 'Anniversary',
  'Referral activity', 'Abandoned booking', 'Membership expiry', 'Upgrade opportunity',
];

export const smartExamples = [
  {
    customer: 'Gold member, recently searched Goa villas',
    shows: 'Gold member exclusive — get ₹3,000 off Goa villa bookings.',
  },
  {
    customer: 'Platinum member with a birthday this week',
    shows: 'Birthday special — enjoy an exclusive hotel upgrade.',
  },
];

/** Offers that fire on their own. */
export const offerAutomation = [
  { when: 'Membership purchased', then: 'Welcome offer' },
  { when: 'Membership expiring in 30 days', then: 'Renewal offer' },
  { when: 'No booking for 90 days', then: 'Reactivation offer' },
  { when: 'Birthday in 7 days', then: 'Birthday offer' },
  { when: 'Abandoned booking', then: 'Limited-time discount' },
  { when: 'Two villa bookings completed', then: 'Unlock a reward' },
  { when: 'Referred a member', then: 'Referral benefit' },
];

/** What an offer can send. */
export const notifications = [
  { channel: 'Push', text: 'Weekend deal! Get 25% off on selected villas.' },
  { channel: 'WhatsApp', text: 'Hi Rahul, your Gold membership has unlocked an exclusive offer.' },
  { channel: 'CRM task', text: 'Follow-up task created for the sales desk on a high-value offer.' },
];

/** Stopping the same coupon being used twice. */
export const fraudControls = [
  'Duplicate coupon detection', 'Multiple account detection', 'Device and IP monitoring',
  'Redemption frequency', 'Suspicious usage alerts', 'Vendor misuse detection',
  'Manual block', 'Customer block', 'Coupon cancellation', 'Redemption reversal',
];

/** Below this margin, somebody has to sign it off. */
export const minimumMargin = 15;

/** The modules an offer touches. */
export const connectedModules = [
  'Membership engine', 'Booking engine', 'Travel inventory', 'CRM',
  'Rewards, refer and earn', 'WhatsApp automation', 'Payment and revenue', 'Vendor management',
];

export const topDestinations = ['Goa', 'Lonavala', 'Dubai', 'Manali', 'Bali'];
