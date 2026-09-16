/**
 * What a partner sees after they are approved.
 *
 * The client's sheet specifies this as a screen of the partner's own, not the
 * desk's. It lives here because the desk needs to see it too: when a hotelier
 * rings to say a booking has not arrived, whoever picks up has to be looking
 * at the same screen they are describing.
 */

/** The figures across the top of a partner's morning. */
export const partnerToday = [
  { key: 'bookings', label: 'Total bookings', hint: 'this month' },
  { key: 'upcoming', label: 'Upcoming check-ins', hint: 'next 7 days' },
  { key: 'today', label: "Today's check-ins" },
  { key: 'rooms', label: 'Available rooms', hint: 'tonight' },
  { key: 'revenue', label: 'Revenue', money: true, hint: 'this month' },
  { key: 'pending', label: 'Pending payments', money: true },
  { key: 'cancellations', label: 'Cancellations', hint: 'this month' },
];

/** The twelve places a partner can go, in the sheet's order. */
export const partnerSections = [
  { key: 'property', label: 'My property', note: 'Name, address, description and photographs' },
  { key: 'rooms', label: 'Rooms and inventory', note: 'Categories, occupancy and how many are released' },
  { key: 'rates', label: 'Rates and offers', note: 'Standard tariff, Smira rate, weekday and weekend' },
  { key: 'calendar', label: 'Availability calendar', note: 'Closed dates, blackout dates, stop sell' },
  { key: 'bookings', label: 'Bookings', note: 'Requests to accept, and everything confirmed' },
  { key: 'customers', label: 'Customers', note: 'Who is staying, and who has stayed before' },
  { key: 'payments', label: 'Payments', note: 'What is owed, what has settled' },
  { key: 'reports', label: 'Reports', note: 'Occupancy, revenue and cancellation over time' },
  { key: 'reviews', label: 'Reviews', note: 'What members said, and the right of reply' },
  { key: 'documents', label: 'Documents', note: 'Registration, PAN, GST and the agreement' },
  { key: 'support', label: 'Support', note: 'Raise a ticket with the partnerships desk' },
  { key: 'profile', label: 'Profile', note: 'Contact person, bank account, password' },
];

/**
 * The booking request a partner answers.
 *
 * Accept and reject are the whole point of the screen: until one of them is
 * pressed the member is waiting, and the desk's follow-up clock is running.
 */
export const partnerRequestCard = {
  id: 'SC12345',
  property: 'Forest Resort',
  guest: 'Rahul Sharma',
  checkIn: '20 Sept 2026',
  checkOut: '22 Sept 2026',
  room: 'Deluxe',
  guests: '2 adults',
  mealPlan: 'Breakfast + dinner',
  amount: 7000,
  status: 'Confirmed',
  actions: ['Accept', 'Reject', 'Edit', 'Contact support'],
};

/** The five steps of the listing form, as the panel reviews them. */
export const listingSteps = [
  {
    step: 1,
    title: 'Account and property',
    fields: [
      'Full name, email, mobile with OTP, alternate number, password',
      'Account type — hotel or property, or a channel manager',
      'Property type — hotel, resort, homestay, villa, camp, lifestyle',
      'Property name, star category, contact, description, booking start date',
      'Address, landmark, city, state, country, PIN, latitude and longitude',
    ],
    note: 'Address verification is mandatory',
  },
  {
    step: 2,
    title: 'Rooms',
    fields: [
      'A category per room type — name, type, count, size, bed type',
      'Adults, children, maximum occupancy, extra bed',
      'Room amenities and description',
      'Property photos — exterior, lobby, reception, restaurant, pool, facilities',
      'Room photos — room, bathroom, view, amenities',
    ],
  },
  {
    step: 3,
    title: 'Amenities and rules',
    fields: [
      'Popular — Wi-Fi, pool, parking, restaurant, breakfast, room service, AC, TV, gym, spa, kids play area, conference room, pet friendly',
      'Facilities — garden, beach access, bar, indoor and outdoor games, bonfire, airport transfer, laundry, elevator, power backup',
      'Rules — valid ID, couple friendly, pets, smoking, alcohol, visitors, child policy, extra bed policy, food policy',
    ],
  },
  {
    step: 4,
    title: 'Pricing and inventory',
    fields: [
      'Standard tariff and Smira partner rate',
      'Weekday, weekend, extra adult and child rates',
      'Meal plan — EP room only, CP breakfast, MAP breakfast and dinner, AP all meals',
      'Inventory — total rooms, available rooms, closed dates, blackout dates',
      'Check-in and check-out time',
      'Cancellation — free until, charge, no-show policy',
    ],
  },
  {
    step: 5,
    title: 'Ownership and legal',
    fields: [
      'Ownership type — self, company, family, lease or other',
      'Property registration or ownership proof, lease agreement, authorisation',
      'PAN, GST, TAN if applicable',
      'Bank — account holder, bank, account number, IFSC, branch, cancelled cheque',
      'Partner agreement, ticked',
    ],
  },
];

/** What the desk does with it once the partner presses submit. */
export const verificationFlow = [
  'Submitted',
  'Admin review',
  'Approved or needs changes',
  'Contract',
  'Live',
];

/** The three routes a booking takes to reach a partner. */
export const bookingRoutes = [
  {
    key: 'availability',
    title: 'Reserve now / check availability',
    steps: [
      'Member selects the hotel, dates, guests and rooms',
      'CRM creates an availability request',
      'Request sent to the partner',
      'Partner answers available or not available',
      'Desk reviews and confirms back to the member',
      'Member accepts and pays',
      'Booking confirmed',
    ],
  },
  {
    key: 'direct',
    title: 'Direct partner booking',
    steps: [
      'Member selects the hotel, date and room',
      'CRM creates the booking',
      'Request sent to the partner',
      'Partner confirms — status becomes Partner confirmed',
      'Payment taken — status becomes Booking confirmed',
      'Confirmation and voucher to the member',
    ],
  },
  {
    key: 'api',
    title: 'Book now — live API',
    steps: [
      'Member searches and sees live availability',
      'Selects room, meal plan and enters guest details',
      'Pays against the booking summary',
      'API booking request and confirmation',
      'Booking ID and voucher issued',
      'WhatsApp and email to the member, notification to the partner',
      'CRM updated and settlement queued',
    ],
  },
];
