/**
 * Partners, built to the client's sheet: how one is onboarded, the bookings
 * that pass through them, the tickets they raise, how they are scored and
 * what they are owed.
 */

export const onboardingFlow = [
  'Registration',
  'Documents submitted',
  'Admin review',
  'Verification',
  'Approved',
  'Active',
];

export const approvalStates = [
  'Pending review',
  'Documents required',
  'Verification pending',
  'Approved',
  'Rejected',
  'Suspended',
];

/**
 * The eight a partner can be filed under. The website's Become a Partner form
 * offers the same eight, so an owner cannot apply as something the desk has no
 * filter for.
 */
export const partnerCategories = [
  'Hotel',
  'Villa',
  'Package',
  'Lifestyle',
  'Transport',
  'Restaurant',
  'Activity',
  'Spa',
];

/** The pipeline a booking walks with a partner. */
export const partnerPipeline = [
  'New request',
  'Sent to partner',
  'Partner accepted',
  'Payment collected',
  'Customer confirmation',
  'Confirmed',
  'Completed',
];

export const pipelineExits = [
  'Partner declined',
  'Partner rejected',
  'Customer cancelled',
  'Partner cancelled',
  'Reschedule requested',
  'No-show',
  'Refund requested',
  'Dispute',
];

/** What a partner raises a ticket about. */
export const partnerTicketKinds = [
  'Booking confirmation',
  'Availability issue',
  'Rate mismatch',
  'Customer issue',
  'Cancellation',
  'Reschedule',
  'Payment',
  'Commission',
  'Payout',
  'Document issue',
  'Technical issue',
  'Other',
];

/** Money moves down this line before a partner is paid. */
export const settlementFlow = [
  'Booking completed',
  'Commission calculated',
  'Settlement generated',
  'Admin approved',
  'Partner paid',
  'Settlement closed',
];

/** What the panel sends a partner. */
export const partnerMessageKinds = [
  'New booking request',
  'Booking confirmation',
  'Availability request',
  'Reminder',
  'Cancellation',
  'Reschedule',
  'Payment notification',
  'Settlement notification',
  'Document reminder',
  'Partner announcement',
];

export const partners = [
  {
    id: 'PTR-01',
    name: 'Ayana Resort & Spa',
    category: 'Hotel',
    location: 'Jimbaran, Bali',
    businessType: 'Resort',
    contact: 'Wayan Sudira',
    phone: '+62 361 702222',
    whatsapp: '+62 361 702222',
    email: 'res@balisunrise.com',
    gst: '—',
    pan: '—',
    upi: '—',
    bank: 'Bank Mandiri · ****4471',
    registration: 'PT-BALI-2019-8841',
    contract: 'Contract 2026-A',
    commission: 12,
    submitted: '14 Jan 2026',
    verification: 'Verified',
    approval: 'Approved',
    stage: 'Active',
    status: 'Active',
    bookings: 125,
    confirmed: 118,
    cancelled: 5,
    failed: 2,
    revenue: 420000,
    commissionEarned: 50400,
    payable: 121000,
    paid: 260000,
    responseMins: 12,
    rating: 4.7,
    repeat: 42,
    rooms: 20,
    ratePlan: 'Contract 2026-A · ocean view suite ₹42,000',
    documents: [
      { name: 'Business registration', status: 'Verified' },
      { name: 'Contract', status: 'Verified' },
      { name: 'Bank details', status: 'Verified' },
      { name: 'Tax certificate', status: 'Verified' },
    ],
    activity: [
      { at: '29 Jul 2026', text: 'Confirmed BKG-8821 within 12 minutes' },
      { at: '02 Aug 2026', text: 'Settlement SET-01 generated' },
    ],
  },
  {
    id: 'PTR-02',
    name: 'Atlantis The Palm',
    category: 'Hotel',
    location: 'Malé, Maldives',
    businessType: 'Resort',
    contact: 'Imran Haleem',
    phone: '+960 664 0011',
    whatsapp: '+960 664 0011',
    email: 'bookings@gulfstays.com',
    gst: '—',
    pan: '—',
    upi: '—',
    bank: 'Bank of Maldives · ****9930',
    registration: 'MV-STAYS-2021-3390',
    contract: 'Contract 2026-M',
    commission: 10,
    submitted: '02 Mar 2026',
    verification: 'Verified',
    approval: 'Approved',
    stage: 'Active',
    status: 'Active',
    bookings: 68,
    confirmed: 61,
    cancelled: 4,
    failed: 3,
    revenue: 336000,
    commissionEarned: 33600,
    payable: 214000,
    paid: 96000,
    responseMins: 25,
    rating: 4.5,
    repeat: 18,
    rooms: 14,
    ratePlan: 'Contract 2026-M · overwater villa ₹67,200',
    documents: [
      { name: 'Business registration', status: 'Verified' },
      { name: 'Contract', status: 'Verified' },
      { name: 'Bank details', status: 'Pending' },
      { name: 'Tax certificate', status: 'Verified' },
    ],
    activity: [
      { at: '04 Aug 2026', text: 'Sent BKG-8820 for confirmation' },
      { at: '05 Aug 2026', text: 'Bank details reminder sent' },
    ],
  },
];

/** Requests sitting with partners right now. */
export const partnerRequests = [
  {
    id: 'PRQ-01',
    booking: 'BKG-8820',
    partner: 'Atlantis The Palm',
    customer: 'Ananya Deshmukh',
    membership: 'MSU-04',
    service: 'Overwater villa · 2 rooms',
    checkIn: '15 Sep 2026',
    checkOut: '20 Sep 2026',
    guests: 2,
    rooms: 2,
    request: 'Speedboat transfer on arrival',
    occasion: 'Anniversary',
    amount: 336000,
    commission: 33600,
    payout: 214000,
    stage: 'Sent to partner',
    sentAt: '04 Aug 2026',
    payment: 'Paid in full',
    partnerConfirmed: 'Waiting on the hotel',
    trail: [
      { at: '04 Aug 2026, 10:12 am', text: 'Booking request sent to the partner over WhatsApp' },
      { at: '04 Aug 2026, 11:40 am', text: 'Partner opened the request' },
      { at: '05 Aug 2026, 09:05 am', text: 'Reminder sent — no confirmation yet' },
    ],
  },
  {
    id: 'PRQ-02',
    booking: 'BKG-8821',
    partner: 'Ayana Resort & Spa',
    customer: 'Rohan Bhatt',
    membership: 'MSU-03',
    service: 'Ocean view suite · 1 room',
    checkIn: '02 Sep 2026',
    checkOut: '08 Sep 2026',
    guests: 2,
    rooms: 1,
    request: 'Late check-out, high floor',
    occasion: 'Honeymoon',
    amount: 185000,
    commission: 22200,
    payout: 121000,
    stage: 'Completed',
    sentAt: '29 Jul 2026',
    payment: 'Paid in full',
    partnerConfirmed: 'Confirmed 30 Jul 2026',
    trail: [
      { at: '29 Jul 2026, 02:15 pm', text: 'Booking request sent to the partner' },
      { at: '30 Jul 2026, 10:02 am', text: 'Partner confirmed the ocean view suite' },
      { at: '30 Jul 2026, 10:04 am', text: 'Confirmation sent to Rohan Bhatt' },
      { at: '08 Aug 2026, 06:30 pm', text: 'Stay completed — settlement queued' },
    ],
  },
];

/** Tickets partners have raised with the desk. */
export const partnerTickets = [
  {
    id: 'PTK-01',
    partner: 'Atlantis The Palm',
    kind: 'Rate mismatch',
    about: 'BKG-8820',
    detail: 'Contract rate for September differs from the rate on the booking request.',
    owner: 'Kabir',
    raised: '05 Aug 2026',
    stage: 'Partner communication',
    resolution: '',
  },
  {
    id: 'PTK-02',
    partner: 'Atlantis The Palm',
    kind: 'Payout',
    about: 'SET-02',
    detail: 'Asking when the pending payout of ₹2,14,000 will be released.',
    owner: 'Sneha',
    raised: '13 Aug 2026',
    stage: 'Assigned',
    resolution: '',
  },
];

/** Money owed, and how far along each settlement is. */
export const settlements = [
  {
    id: 'SET-01',
    partner: 'Ayana Resort & Spa',
    period: 'July 2026',
    bookingValue: 185000,
    commission: 22200,
    payable: 121000,
    tax: 6100,
    adjustment: 0,
    stage: 'Partner paid',
    paidOn: '10 Aug 2026',
  },
  {
    id: 'SET-02',
    partner: 'Atlantis The Palm',
    period: 'August 2026',
    bookingValue: 336000,
    commission: 33600,
    payable: 214000,
    tax: 10700,
    adjustment: 0,
    stage: 'Settlement generated',
    paidOn: '—',
  },
];
