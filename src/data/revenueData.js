/**
 * The money the rest of the panel cannot work out on its own: what the agency
 * spends, what it opened the month with, and how commission is paid.
 */

/** Six months of revenue, so this month has something to be compared with. */
export const monthlyRevenue = [
  { month: 'Mar', membership: 18000, markup: 42000, other: 6000, target: 80000 },
  { month: 'Apr', membership: 24000, markup: 58000, other: 8000, target: 90000 },
  { month: 'May', membership: 29000, markup: 61000, other: 9000, target: 100000 },
  { month: 'Jun', membership: 21000, markup: 74000, other: 7000, target: 100000 },
  { month: 'Jul', membership: 23598, markup: 64000, other: 11000, target: 110000 },
  { month: 'Aug', membership: 5899, markup: 122000, other: 9000, target: 120000 },
];

/** What the agency pays out, grouped the way the client's sheet groups it. */
export const expenses = {
  office: [
    { label: 'Rent', amount: 85000 },
    { label: 'Electricity', amount: 12400 },
    { label: 'Internet', amount: 4200 },
    { label: 'Software and subscriptions', amount: 18600 },
    { label: 'Marketing', amount: 96000 },
    { label: 'Travel', amount: 14500 },
    { label: 'Telephone', amount: 6800 },
    { label: 'Office supplies', amount: 5400 },
    { label: 'Maintenance', amount: 7200 },
  ],
  staff: [
    { label: 'Salaries', amount: 246000 },
    { label: 'Incentives', amount: 32000 },
    { label: 'Sales commission', amount: 18500 },
    { label: 'Bonuses', amount: 12000 },
    { label: 'Reimbursements', amount: 8400 },
    { label: 'Advances', amount: 15000 },
  ],
  business: [
    { label: 'Partner payments', amount: 121000 },
    { label: 'Vendor payments', amount: 46000 },
    { label: 'Payment gateway charges', amount: 6700 },
    { label: 'Refunds', amount: 0 },
    { label: 'Operational expenses', amount: 21000 },
  ],
};

/** Cash the month opened with, for the closing position. */
export const openingCash = 640000;

/** How much of a sale a consultant keeps. */
export const commissionSlabs = [
  { upTo: 300000, rate: 1 },
  { upTo: 700000, rate: 2 },
  { upTo: Infinity, rate: 3 },
];

export const branches = [
  { name: 'Mumbai', manager: 'Sneha Kulkarni', target: 400000 },
  { name: 'Pune', manager: 'Kabir Menon', target: 300000 },
];

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
