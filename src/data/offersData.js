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
export const offers = [];

/** Lifestyle offers come from vendors, and redeem differently. */
export const lifestyleCategories = ['Restaurants', 'Spa', 'Salon', 'Movies', 'Theme parks', 'Water parks', 'Gaming', 'Adventure', 'Shopping', 'Events'];

export const lifestyleOffers = [];

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

export const redemptions = [];

/** How an offer gets published. */
export const approvalFlow = ['Draft', 'Submitted', 'Manager review', 'Approved', 'Live'];

export const approvalHistory = [];

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
export const notifications = [];

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
