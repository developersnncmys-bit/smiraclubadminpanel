/**
 * Rewards, refer and earn — built to the client's sheet: what a customer has
 * to do to earn something, what they get, what it costs the company, and how
 * the gift actually reaches them.
 */

/** What the admin can set on any reward rule. */
export const ruleControls = [
  'Trigger',
  'Eligibility',
  'Number of bookings',
  'Product or category',
  'Reward type',
  'Reward value',
  'Maximum reward',
  'Expiry',
  'Minimum booking amount',
  'Applicable membership',
  'Applicable destination',
  'Applicable hotel, villa or package',
  'How many times it can be earned',
  'Redemption conditions',
];

export const rewardTriggers = [
  'Booking completed',
  'Membership purchased',
  'Package booked',
  'Villa booking',
  'Hotel booking',
  'Successful referral',
  'Birthday',
  'Anniversary',
  'Campaign',
];

/** The catalogue — the sheet is clear it is not just coupons. */
export const catalogue = {
  'Physical gifts': ['Travel bag', 'Trolley bag', 'Gift hamper', 'Dinner set', 'Merchandise', 'Jewellery or special gift', 'Birthday or anniversary gift'],
  'Financial rewards': ['₹500 booking voucher', '₹1,000 booking voucher', 'Percentage discount', 'Cashback', 'Referral discount'],
  'Experience rewards': ['Dinner coupon', 'Spa voucher', 'Restaurant coupon', 'Water park ticket', 'Theme park ticket', 'Activity voucher'],
  'Travel rewards': ['Free hotel night', 'Upgrade', 'Room upgrade', 'Package discount', 'Travel voucher', 'Airport transfer', 'Complimentary activity'],
};

/** Every reward walks this line. */
export const lifecycle = ['Earned', 'Pending', 'Approved', 'Available', 'Redeemed', 'Expired', 'Cancelled'];

export const lifecycleTone = {
  Earned: 'sky',
  Pending: 'amber',
  Approved: 'violet',
  Available: 'green',
  Redeemed: 'teal',
  Expired: 'slate',
  Cancelled: 'rose',
};

/** What goes through on its own, and what a person has to sign. */
export const autoApproved = ['Booking milestone', 'Package booking', 'Successful referral', 'Membership purchase'];
export const needsApproval = ['Physical gifts', 'High-value rewards', 'Special customer rewards', 'VIP rewards'];

/** A gift has to physically arrive. */
export const dispatchFlow = ['Approved', 'Packed', 'Dispatched', 'Delivered'];

/** The rules already live. */
export const rewardRules = [
  {
    id: 'RR-01',
    name: 'Two villa bookings, dinner on us',
    when: 'Booking completed',
    conditions: ['Booking type is Villa', 'Completed bookings = 2'],
    gives: 'Dinner coupon',
    value: 1000,
    cost: 350,
    validFor: '60 days',
    max: '1 per customer',
    status: 'Active',
    earned: 14,
  },
  {
    id: 'RR-02',
    name: 'Gold membership welcome gift',
    when: 'Membership purchased',
    conditions: ['Plan is Gold Voyager or above'],
    gives: 'Travel bag',
    value: 1500,
    cost: 600,
    validFor: '90 days',
    max: '1 per customer',
    status: 'Active',
    earned: 21,
  },
  {
    id: 'RR-03',
    name: 'Package booking travel bag',
    when: 'Package booked',
    conditions: ['Package value is ₹25,000 or more'],
    gives: 'Travel bag',
    value: 1500,
    cost: 600,
    validFor: '60 days',
    max: '2 per year',
    status: 'Active',
    earned: 9,
  },
  {
    id: 'RR-04',
    name: 'Five hotel bookings, ₹1,000 back',
    when: 'Hotel booking',
    conditions: ['Completed bookings = 5'],
    gives: '₹1,000 booking voucher',
    value: 1000,
    cost: 1000,
    validFor: '120 days',
    max: '1 per year',
    status: 'Paused',
    earned: 4,
  },
];

/** Booking milestones, by product. */
export const milestones = {
  Villa: [
    { at: '1st booking', gives: 'Normal' },
    { at: '2nd booking', gives: 'Dinner coupon' },
    { at: '3rd booking', gives: 'Gift' },
    { at: '5th booking', gives: 'Free or discounted stay' },
  ],
  Hotel: [
    { at: '3 bookings', gives: '₹500 voucher' },
    { at: '5 bookings', gives: '₹1,000 voucher' },
    { at: '10 bookings', gives: 'Premium experience' },
  ],
  'Travel package': [
    { at: '₹25,000+', gives: 'Travel bag' },
    { at: '₹50,000+', gives: 'Premium travel kit' },
    { at: '₹1,00,000+', gives: 'Luxury gift' },
    { at: '₹2,00,000+', gives: 'Special experience' },
  ],
};

/** What each customer has earned, and where it has got to. */
export const customerRewards = [];

/** Physical gifts on their way to somebody. */
export const dispatches = [
  {
    id: 'GFT-01',
    customer: 'Rohan Bhatt',
    gift: 'Travel bag',
    reason: 'Package booking',
    stage: 'Pending dispatch',
    courier: '—',
    awb: '—',
    dispatched: '—',
    delivered: '—',
    proof: '—',
    staff: 'Ritik',
  },
  {
    id: 'GFT-02',
    customer: 'Siddhesh Rane',
    gift: 'Welcome travel kit',
    reason: 'Joined Silver Explorer',
    stage: 'Delivered',
    courier: 'Blue Dart',
    awb: 'BD-88410277',
    dispatched: '06 Oct 2025',
    delivered: '08 Oct 2025',
    proof: 'Signed slip',
    staff: 'Ritik',
  },
];

/** The referral pipeline, exactly as the sheet lists it. */
export const referralPipeline = [
  'Shared',
  'Lead created',
  'Contacted',
  'Interested',
  'Presentation done',
  'Membership purchased',
  'Payment verified',
  'Reward unlocked',
  'Reward redeemed',
];

/** What the admin controls on a referral reward. */
export const referralControls = [
  'Percentage',
  'Maximum discount',
  'Minimum booking value',
  'Eligible booking types',
  'Expiry',
  'Maximum referrals a month',
  'Maximum total benefit',
  'Whether rewards can be combined',
  'Whether it applies to membership, hotel, villa or package',
];

export const referralRule = {
  gives: '10% off the next eligible booking',
  maxDiscount: 5000,
  minBooking: 25000,
  expiry: '90 days',
  perMonth: 5,
  combinable: false,
};

/** Referrals in flight. */
export const referrals = [];

/** What the panel does the moment a referral converts. */
export const referralAutomation = [
  'Identifies the referrer',
  "Verifies the new member's payment",
  'Marks the referral successful',
  "Works out the referrer's reward",
  'Adds it to their wallet',
  'Applies the expiry',
  'Sends the WhatsApp message',
];

/** Temporary campaigns. */
export const campaigns = [];

export const campaignControls = [
  'Start date',
  'End date',
  'Target audience',
  'Membership level',
  'Reward',
  'Budget',
  'Usage limit',
  'Cities',
  'Product',
  'Communication',
];

/** The messages a reward sets off. */
export const whatsappMessages = [];

/** Coupon codes given to staff, so a sale can be traced back to them. */
export const staffCoupons = [
  { code: 'SNEHA10', staff: 'Sneha Kulkarni', gives: '10% off a package', validTill: '31 Dec 2026', used: 6, revenue: 285000, status: 'Active' },
  { code: 'KABIR05', staff: 'Kabir Menon', gives: '5% off a hotel booking', validTill: '31 Dec 2026', used: 3, revenue: 118000, status: 'Active' },
];

/** What management wants out of the programme. */
export const reportGroups = {
  Rewards: ['Rewards issued', 'Rewards redeemed', 'Rewards expired', 'Rewards cancelled', 'Reward cost', 'Reward liability', 'Most popular rewards'],
  Referral: ['Total referrals', 'Successful referrals', 'Conversion %', 'Revenue from referrals', 'Top referrers', 'Referral reward cost'],
  Loyalty: ['Repeat booking rate', 'Average bookings per customer', 'Customer lifetime value', 'VIP customers', 'Dormant customers', 'Most engaged customers'],
  Product: ['Hotel reward performance', 'Villa reward performance', 'Package reward performance', 'Restaurant reward performance'],
  Team: ['Which staff generated the most referrals', 'Which staff generated repeat bookings', 'Which team member holds customers longest'],
};

/** Revenue the rewarded customers brought back. */
export const roi = { revenueFromRewarded: 5000000, rewardCost: 500000 };
