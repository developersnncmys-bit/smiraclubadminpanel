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

export const partners = [];

/** Requests sitting with partners right now. */
export const partnerRequests = [];

/** Tickets partners have raised with the desk. */
export const partnerTickets = [];

/** Money owed, and how far along each settlement is. */
export const settlements = [];
