/**
 * Payments, built to the client's sheet: every rupee in and out, what is
 * still owed, who is allowed to touch it, and what the panel chases on its
 * own.
 */

export const paymentStatuses = ['Paid', 'Partially paid', 'Pending', 'Failed', 'Refunded', 'Cancelled'];

export const statusTone = {
  Paid: 'green',
  'Partially paid': 'amber',
  Pending: 'sky',
  Failed: 'rose',
  Refunded: 'violet',
  Cancelled: 'slate',
};

export const paymentModes = ['UPI', 'Card', 'Net banking', 'Cash', 'Bank transfer', 'Cheque', 'Payment gateway'];

/** Everything a payment is tied to the moment it lands. */
export const paymentLinks = [
  'Customer',
  'Lead',
  'Sales employee',
  'Branch',
  'Membership',
  'Booking',
  'Invoice',
  'Payment gateway',
  'Payment mode',
  'Commission or incentive',
  'Refund',
  'Accounting entry',
];

/** The gateways money arrives through. */
export const gateways = [
  { name: 'Razorpay', successful: 18, pending: 2, failed: 1, fee: 2.1, settlement: 'T+2', settled: 386000, status: 'Reconciled' },
  { name: 'Cashfree', successful: 6, pending: 0, failed: 0, fee: 1.9, settlement: 'T+2', settled: 122000, status: 'Reconciled' },
  { name: 'PhonePe', successful: 4, pending: 1, failed: 0, fee: 1.8, settlement: 'T+1', settled: 64000, status: 'Awaiting' },
  { name: 'UPI', successful: 11, pending: 0, failed: 1, fee: 0, settlement: 'Instant', settled: 185000, status: 'Reconciled' },
  { name: 'Bank transfer', successful: 3, pending: 1, failed: 0, fee: 0, settlement: 'Manual', settled: 150000, status: 'Awaiting' },
  { name: 'Cash', successful: 2, pending: 0, failed: 0, fee: 0, settlement: 'Same day', settled: 18000, status: 'Reconciled' },
];

/** How overdue a pending payment is. */
export const collectionBuckets = ['Due today', '1 day overdue', '3 days', '7 days', '15 days', '30+ days'];

/** What the panel does about a payment nobody has made. */
export const chaseFlow = [
  'Payment due',
  'WhatsApp reminder',
  'CRM task',
  'Salesperson notified',
  'Manager alerted',
  'Escalation',
];

/** Money going back out needs three signatures. */
export const refundFlow = ['Refund request', 'Manager approval', 'Finance approval', 'Refund processed'];

export const refundRequests = [
  {
    id: 'REF-01',
    customer: 'Ananya Deshmukh',
    original: 'PAY-9931',
    booking: 'BKG-8820',
    amount: 150000,
    refund: 116400,
    charges: 33600,
    reason: 'Travel plan changed',
    stage: 'Manager approval',
    approvedBy: 'Pending',
    processedBy: '—',
    txnId: '—',
    on: '—',
  },
];

/** What is still owed, and how the chase is going. */
export const receivables = [
  {
    id: 'RCV-01',
    customer: 'Ananya Deshmukh',
    product: 'Maldives Overwater Luxury',
    salesperson: 'Kabir',
    amount: 186000,
    due: '28 Aug 2026',
    bucket: 'Due today',
    lastReminder: '26 Aug 2026',
    nextFollowUp: '28 Aug 2026, 5:00 pm',
    call: 'Answered',
    whatsapp: 'Read',
  },
  {
    id: 'RCV-02',
    customer: 'Ananya Deshmukh',
    product: 'Platinum Elite membership',
    salesperson: 'Sneha',
    amount: 35396,
    due: '11 Aug 2026',
    bucket: '15 days',
    lastReminder: '24 Aug 2026',
    nextFollowUp: '29 Aug 2026, 11:00 am',
    call: 'No answer',
    whatsapp: 'Delivered',
  },
];

/** Payroll, the way the sheet lays it out. */
export const salary = [
  {
    name: 'Sneha Kulkarni',
    basic: 62000,
    incentives: 9000,
    attendance: 2000,
    sales: 5000,
    closing: 4000,
    commission: 3700,
    allowances: 4000,
    deductions: 3200,
    advances: 5000,
    status: 'Paid',
    paidOn: '01 Aug 2026',
  },
  {
    name: 'Kabir Menon',
    basic: 54000,
    incentives: 7000,
    attendance: 1000,
    sales: 4000,
    closing: 2000,
    commission: 3360,
    allowances: 3500,
    deductions: 2800,
    advances: 10000,
    status: 'Pending',
    paidOn: '—',
  },
];

/** What a closing is worth to whoever made it. */
export const commissionRules = {
  perClosing: 5000,
  note: 'Every membership closing pays a flat incentive, worked out by the panel.',
};

/** Company spend, and where each one has got to. */
export const expenseCategories = [
  'Rent',
  'Electricity',
  'Internet',
  'Marketing',
  'Office expenses',
  'Travel',
  'Staff salary',
  'Incentives',
  'Software',
  'Vendor payments',
  'Bank charges',
  'Gateway charges',
  'Miscellaneous',
];

export const expenseFlow = ['Expense', 'Approval', 'Payment', 'Accounting'];

export const expenseEntries = [
  { id: 'EXP-01', category: 'Rent', detail: 'Andheri office — August', amount: 85000, raisedBy: 'Amit', stage: 'Paid', on: '02 Aug 2026' },
  { id: 'EXP-02', category: 'Marketing', detail: 'Instagram campaign — Bali', amount: 96000, raisedBy: 'Sneha', stage: 'Approval', on: '18 Aug 2026' },
  { id: 'EXP-03', category: 'Software', detail: 'CRM and WhatsApp API', amount: 18600, raisedBy: 'Amit', stage: 'Paid', on: '05 Aug 2026' },
  { id: 'EXP-04', category: 'Gateway charges', detail: 'Razorpay fees — August', amount: 6700, raisedBy: 'System', stage: 'Accounting', on: '26 Aug 2026' },
];

/** Who is allowed to do what with money. */
export const paymentPermissions = [
  { role: 'Super admin', view: 'Everything', collect: 'Yes', refund: 'Yes', salary: 'Yes', expenses: 'Yes', reports: 'Everything' },
  { role: 'Finance', view: 'Everything', collect: 'Yes', refund: 'Yes', salary: 'Yes', expenses: 'Yes', reports: 'Everything' },
  { role: 'Branch manager', view: 'Everything', collect: 'Yes', refund: 'Limited', salary: 'No', expenses: 'Request', reports: 'Branch' },
  { role: 'Travel expert', view: 'Their customers', collect: 'Yes', refund: 'No', salary: 'No', expenses: 'No', reports: 'Own' },
  { role: 'Field officer', view: 'Their customers', collect: 'Request', refund: 'No', salary: 'No', expenses: 'No', reports: 'Own' },
  { role: 'Lead generation', view: 'Limited', collect: 'No', refund: 'No', salary: 'No', expenses: 'No', reports: 'Own' },
];
