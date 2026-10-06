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

/** What management wants out of the programme. */
export const reportGroups = {
  Rewards: ['Rewards issued', 'Rewards redeemed', 'Rewards expired', 'Rewards cancelled', 'Reward cost', 'Reward liability', 'Most popular rewards'],
  Referral: ['Total referrals', 'Successful referrals', 'Conversion %', 'Revenue from referrals', 'Top referrers', 'Referral reward cost'],
  Loyalty: ['Repeat booking rate', 'Average bookings per customer', 'Customer lifetime value', 'VIP customers', 'Dormant customers', 'Most engaged customers'],
  Product: ['Hotel reward performance', 'Villa reward performance', 'Package reward performance', 'Restaurant reward performance'],
  Team: ['Which staff generated the most referrals', 'Which staff generated repeat bookings', 'Which team member holds customers longest'],
};

