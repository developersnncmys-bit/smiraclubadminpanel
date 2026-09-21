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
export const inventory = [
  {
    id: 'INV-H01',
    category: 'Hotels',
    name: 'Ayana Resort & Spa',
    code: 'AYA-BAL',
    destination: 'Bali, Indonesia',
    grade: '5★',
    vendor: 'Ayana Resort & Spa',
    units: 42,
    booked: 24,
    blocked: 2,
    baseRate: 34000,
    markup: 8000,
    memberDiscount: 4200,
    status: 'Active',
    confirmation: 'Confirmed',
    contractEnds: '31 Dec 2026',
    rateEnds: '30 Sep 2026',
    address: 'Jimbaran Bay, Badung, Bali 80364',
    gps: '-8.7810, 115.1560',
    checkIn: '2:00 pm',
    checkOut: '12:00 noon',
    contact: '+62 361 702222',
    amenities: ['Private beach', 'Spa', 'Three pools', 'Airport transfer'],
    description: 'Cliff-top resort over Jimbaran Bay, the agency\'s first choice for honeymoons.',
    rooms: [
      { type: 'Ocean view suite', count: 20, occupancy: 2, extraBed: true, child: 'Under 6 free', meal: 'Breakfast', rack: 46000, b2b: 34000, smira: 42000, member: 37800, weekend: 48300, seasonal: 52500, blackout: '—' },
      { type: 'Garden villa', count: 22, occupancy: 4, extraBed: true, child: 'Under 6 free', meal: 'Half board', rack: 58000, b2b: 44000, smira: 52000, member: 46800, weekend: 59800, seasonal: 65000, blackout: '—' },
    ],
    allocation: { tiers: {"Silver":4,"Gold":5,"Platinum":5,"Diamond":3,"Crown":1}, channels: {"Website":5,"App":2,"CRM":5,"WhatsApp":1,"Travel expert":3,"Branch":2,"Corporate or B2B":4}, buffer: 2 },
  },
  {
    id: 'INV-H02',
    category: 'Hotels',
    name: 'Atlantis The Palm',
    code: 'ATL-MLE',
    destination: 'Malé, Maldives',
    grade: '5★',
    vendor: 'Atlantis The Palm',
    units: 28,
    booked: 21,
    blocked: 0,
    baseRate: 52000,
    markup: 15200,
    memberDiscount: 6700,
    status: 'Limited',
    confirmation: 'Waiting',
    contractEnds: '18 Sep 2026',
    rateEnds: '31 Aug 2026',
    address: 'Crescent Road, The Palm, Malé',
    gps: '4.1755, 73.5093',
    checkIn: '3:00 pm',
    checkOut: '11:00 am',
    contact: '+960 664 0011',
    amenities: ['Overwater villas', 'House reef', 'Speedboat transfer', 'Kids club'],
    description: 'Overwater villas with a house reef, sold mostly to Platinum members.',
    rooms: [
      { type: 'Overwater villa', count: 16, occupancy: 2, extraBed: false, child: 'Not permitted', meal: 'Half board', rack: 74000, b2b: 52000, smira: 67200, member: 60500, weekend: 77280, seasonal: 84000, blackout: '—' },
      { type: 'Beach villa', count: 12, occupancy: 3, extraBed: true, child: 'Under 12 half', meal: 'Full board', rack: 62000, b2b: 46000, smira: 56000, member: 50400, weekend: 64400, seasonal: 70000, blackout: '—' },
    ],
    allocation: { tiers: {"Silver":2,"Gold":3,"Platinum":4,"Diamond":2,"Crown":1}, channels: {"Website":4,"App":2,"CRM":2,"WhatsApp":1,"Travel expert":2,"Branch":1,"Corporate or B2B":2}, buffer: 2 },
  },
];

/** Day by day availability, for the calendar. */
export const availability = [
  { date: '26 Aug 2026', item: 'INV-H01', left: 18, rate: 42000, note: '' },
  { date: '27 Aug 2026', item: 'INV-H01', left: 14, rate: 42000, note: '' },
];

/** Stock held for a booking that has not been paid for yet. */
export const holds = [
  { id: 'HLD-01', item: 'INV-H02', units: 2, customer: 'Ananya Deshmukh', channel: 'CRM', heldFor: 30, minutesLeft: 12, stage: 'Awaiting payment' },
  { id: 'HLD-02', item: 'INV-H01', units: 1, customer: 'Website enquiry', channel: 'Website', heldFor: 30, minutesLeft: 3, stage: 'Awaiting payment' },
];

/** Dates nothing can be sold on. */
export const blackouts = [
  { item: 'INV-H02', from: '29 Aug 2026', to: '31 Aug 2026', reason: 'Resort maintenance' },
  { item: 'INV-H01', from: '24 Dec 2026', to: '02 Jan 2027', reason: 'Owner stay' },
];

/** What is about to run out. */
export const contractAlerts = [
  { kind: 'Vendor contract expiry', item: 'INV-H02', on: '18 Sep 2026' },
  { kind: 'Rate expiry', item: 'INV-H02', on: '31 Aug 2026' },
];

/** The five tiers stock can be reserved for. */
export const membershipTiers = ['Silver', 'Gold', 'Platinum', 'Diamond', 'Crown'];

/**
 * How each rate type is worked out from the vendor rate. `on` says what the
 * adjustment applies to, `pct` how much it moves the selling rate by.
 */
export const rateRules = [
  { type: 'Standard rate', on: 'Selling rate', pct: 0, note: 'Vendor rate plus the markup' },
  { type: 'B2B rate', on: 'Selling rate', pct: -12, note: 'Agents and corporate desks' },
  { type: 'Member rate', on: 'Selling rate', pct: -10, note: 'Anyone on a plan' },
  { type: 'Weekend rate', on: 'Selling rate', pct: 15, note: 'Friday to Sunday' },
  { type: 'Seasonal rate', on: 'Selling rate', pct: 25, note: 'Peak months' },
  { type: 'Festival rate', on: 'Selling rate', pct: 35, note: 'Diwali, Christmas, New Year' },
  { type: 'Corporate rate', on: 'Selling rate', pct: -8, note: 'Contracted companies' },
  { type: 'Promotional rate', on: 'Selling rate', pct: -18, note: 'Campaign windows only' },
  { type: 'Package rate', on: 'Selling rate', pct: -15, note: 'When sold inside a package' },
  { type: 'Last-minute rate', on: 'Selling rate', pct: -22, note: 'Inside seven days of travel' },
];

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
