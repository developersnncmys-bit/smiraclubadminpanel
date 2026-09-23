/**
 * Travel inventory, built to the client's sheet: what the agency holds, what
 * it costs, who supplies it, who it is reserved for, and what is about to
 * run out or expire.
 */

/** Everything the agency can hold, and what has to be managed for each. */
export const categories = [
  { key: 'Hotels', icon: '🏨', manage: '3★ / 4★ / 5★, rooms, rates, meal plans' },
  { key: 'Villas', icon: '🏡', manage: 'Villas, occupancy, amenities, availability' },
  { key: 'Flights', icon: '✈️', manage: 'Routes, airline, fare, seats' },
  { key: 'Transport', icon: '🚗', manage: 'Cars, buses, transfers, drivers' },
  { key: 'Packages', icon: '🌴', manage: 'Domestic and international packages' },
  { key: 'Activities', icon: '🎢', manage: 'Water parks, theme parks, adventure' },
  { key: 'Restaurants', icon: '🍽️', manage: 'Dining inventory, offers, tables' },
  { key: 'Spa and salon', icon: '💆', manage: 'Services, slots, offers' },
  { key: 'Attractions', icon: '🎟️', manage: 'Tickets, entry passes, experiences' },
  { key: 'Experiences', icon: '🛥️', manage: 'Yacht, cruise, balloon, helicopter' },
];

/** The rate engine: one base rate, then everything derived from it. */
export const rateTypes = [
  'Standard rate',
  'B2B rate',
  'Member rate',
  'Weekend rate',
  'Seasonal rate',
  'Festival rate',
  'Corporate rate',
  'Promotional rate',
  'Package rate',
  'Last-minute rate',
];

export const salesChannels = ['Website', 'App', 'CRM', 'WhatsApp', 'Travel expert', 'Branch', 'Corporate or B2B'];

/** How a booking actually eats into stock. */
export const integrationFlow = [
  'Customer booking request',
  'Booking team',
  'Package or hotel selected',
  'Availability check',
  'Inventory reserved',
  'Payment',
  'Booking confirmed',
  'Inventory deducted',
  'Vendor confirmation',
  'Voucher generated',
  'Customer WhatsApp',
];

/** What the panel does on its own. */
export const automation = {
  Daily: ['Availability sync', 'Rate sync', 'Sold-out alerts', 'Low inventory alerts'],
  Booking: ['Inventory hold', 'Inventory deduction', 'Vendor confirmation', 'Voucher generation'],
  Pricing: ['Dynamic markup', 'Weekend pricing', 'Seasonal pricing', 'Demand-based pricing'],
  CRM: [
    'Recommend available hotels',
    'Recommend packages',
    'Hide unavailable inventory',
    'Show membership-eligible inventory',
  ],
};

/** Who can touch what. */
export const inventoryRoles = [
  { role: 'Super admin', access: 'Everything' },
  { role: 'Inventory manager', access: 'Inventory, rates and allocation' },
  { role: 'Vendor manager', access: 'Vendor inventory' },
  { role: 'Package manager', access: 'Packages' },
  { role: 'Branch manager', access: 'View, with limited booking access' },
  { role: 'Travel expert', access: 'Search, availability and reservation' },
  { role: 'Finance', access: 'Cost, selling price, markup and profit' },
];

/** The stock itself. Rates build up base → markup → selling → member. */
export const inventory = [];

/** Day by day availability, for the calendar. */
export const availability = [];

/** Stock held for a booking that has not been paid for yet. */
export const holds = [];

/** Dates nothing can be sold on. */
export const blackouts = [];

/** What is about to run out. */
export const contractAlerts = [];

/** The five tiers stock can be reserved for. */
export const membershipTiers = ['Silver', 'Gold', 'Platinum', 'Diamond', 'Crown'];

/**
 * How each rate type is worked out from the vendor rate. `on` says what the
 * adjustment applies to, `pct` how much it moves the selling rate by.
 */
export const rateRules = [];

/** How every vendor is actually performing on the stock they supply. */
export const vendorScores = {
  'Ayana Resort & Spa': { confirmationRate: 94, responseMins: 12, cancellationRate: 4, priceIndex: 96, bookingSuccess: 91, activeContracts: 2, payable: 121000, cancellations: 5 },
  'Atlantis The Palm': { confirmationRate: 88, responseMins: 34, cancellationRate: 7, priceIndex: 108, bookingSuccess: 82, activeContracts: 1, payable: 186000, cancellations: 8 },
  'Goa Villa Collective': { confirmationRate: 97, responseMins: 8, cancellationRate: 2, priceIndex: 92, bookingSuccess: 95, activeContracts: 1, payable: 42000, cancellations: 1 },
  'Bali Sunrise DMC': { confirmationRate: 91, responseMins: 21, cancellationRate: 5, priceIndex: 99, bookingSuccess: 88, activeContracts: 3, payable: 64000, cancellations: 3 },
  'Skyline Transfers': { confirmationRate: 99, responseMins: 5, cancellationRate: 1, priceIndex: 89, bookingSuccess: 98, activeContracts: 1, payable: 18000, cancellations: 0 },
  'IndiGo Airlines': { confirmationRate: 100, responseMins: 2, cancellationRate: 3, priceIndex: 101, bookingSuccess: 97, activeContracts: 1, payable: 96000, cancellations: 2 },
  'Serene Spa & Wellness': { confirmationRate: 93, responseMins: 18, cancellationRate: 3, priceIndex: 94, bookingSuccess: 90, activeContracts: 1, payable: 22000, cancellations: 1 },
  'Coastal Dining Group': { confirmationRate: 86, responseMins: 40, cancellationRate: 9, priceIndex: 103, bookingSuccess: 79, activeContracts: 1, payable: 14000, cancellations: 4 },
  'Bali Attractions Co': { confirmationRate: 95, responseMins: 15, cancellationRate: 2, priceIndex: 97, bookingSuccess: 93, activeContracts: 2, payable: 31000, cancellations: 1 },
  'Blue Horizon Charters': { confirmationRate: 90, responseMins: 26, cancellationRate: 6, priceIndex: 106, bookingSuccess: 85, activeContracts: 1, payable: 78000, cancellations: 2 },
};

/** What the panel raises against inventory the moment it happens. */
export const inventoryAlertKinds = [
  'Sold out',
  'Low availability',
  'Missing rate',
  'Waiting on the vendor',
  'Contract expiring',
  'Rate expiring',
  'Allocation used up',
  'Blackout starting',
  'Hold about to time out',
];

/** The feeds the panel pulls stock and rates from. */
export const integrations = [
  { name: 'Channel manager', kind: 'Availability and rates', status: 'Connected', lastSync: '05 Sep 2026, 09:30 am', expires: '15 Oct 2026' },
  { name: 'Hotel extranet', kind: 'Rooms and allotment', status: 'Connected', lastSync: '05 Sep 2026, 08:00 am', expires: '31 Dec 2026' },
  { name: 'Flight GDS', kind: 'Fares and seats', status: 'Connected', lastSync: '05 Sep 2026, 09:45 am', expires: '30 Nov 2026' },
  { name: 'Transport partner API', kind: 'Vehicles and drivers', status: 'Needs attention', lastSync: '03 Sep 2026, 06:10 pm', expires: '20 Sep 2026' },
  { name: 'Activities aggregator', kind: 'Tickets and slots', status: 'Not connected', lastSync: '—', expires: '—' },
];
