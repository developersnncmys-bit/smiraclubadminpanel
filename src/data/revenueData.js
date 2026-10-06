/**
 * How the agency pays commission, and what it wants to be told about.
 *
 * What it earned and what it spent are not here any more: those were six
 * invented months, a table of expenses, two previous years, an opening
 * balance and two branches with named managers. The Revenue page reads
 * all of it from the server now. What is left is policy — rates the
 * agency sets rather than figures anybody can look up.
 */

/** How much of a sale a consultant keeps. */
export const commissionSlabs = [
  { upTo: 300000, rate: 1 },
  { upTo: 700000, rate: 2 },
  { upTo: Infinity, rate: 3 },
];

/** What sits on top of commission. */
export const incentivePlan = {
  incentiveRate: 2,
  overrideRate: 0.5,
  note: '2% of everything above target, and a 0.5% override on the team a manager carries',
};

/** What the pipeline is expected to bring in. */
export const forecast = {
  expectedCollectionRate: 0.85,
  note: 'Open leads weighted by the stage they sit at',
};

/** The alerts the desk wants raised the moment they happen. */
export const revenueAlertKinds = [
  'Payment overdue',
  'Large pending payment',
  'Refund requested',
  'Failed payment',
  'Target achieved',
  'Revenue declining',
  'High-value customer',
  'Renewal due',
  'Upgrade opportunity',
];

/** Everything the revenue module can export. */
export const revenueReports = [
  'Daily revenue',
  'Monthly revenue',
  'Salesperson revenue',
  'Branch revenue',
  'Membership revenue',
  'Collection',
  'Outstanding',
  'Refund',
  'Commission',
  'Renewal revenue',
  'Customer lifetime value',
  'Revenue forecast',
  'Profitability',
];
