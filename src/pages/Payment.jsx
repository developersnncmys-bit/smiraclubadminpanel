import { useState } from 'react';
import {
  Wallet,
  Search,
  Download,
  Send,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { downloadCsv } from '../lib/csv.js';
import { inr, shortInr } from '../data/mockData.js';
import { expenses as expenseBudget, openingCash } from '../data/revenueData.js';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import {
  paymentStatuses,
  statusTone,
  paymentModes,
  paymentLinks,
  gateways,
  collectionBuckets,
  chaseFlow,
  refundFlow,
  refundRequests,
  receivables,
  salary,
  commissionRules,
  expenseCategories,
  expenseFlow,
  expenseEntries,
  paymentPermissions,
} from '../data/paymentData.js';

const SECTIONS = [
  'Overview',
  'Transactions',
  'Collections',
  'Membership',
  'Bookings',
  'Gateways',
  'Invoices',
  'Refunds',
  'Salary',
  'Commission',
  'Expenses',
  'Vendors',
  'Permissions',
];

function Table({ head, rows, empty = 'Nothing here yet.', foot }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ink-900/[0.07] text-left">
            {head.map((h) => (
              <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/[0.07]">
          {rows.map((r) => (
            <tr key={r.key} className="hover:bg-surface-soft">
              {r.cells.map((c, i) => (
                <td key={i} className={`py-2.5 ${i === 0 ? 'font-bold text-ink-900' : 'text-ink-700'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-6 text-center text-ink-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
        {foot && (
          <tfoot>
            <tr className="border-t-2 border-ink-900/[0.12] bg-surface-soft">
              {foot.map((c, i) => (
                <td key={i} className={`py-2.5 ${i === 0 ? 'font-extrabold text-ink-900' : 'num font-bold text-ink-900'}`}>
                  {c}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/** A chain of steps — the shape the flows on this page use. */
function Flow({ steps, at = -1 }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-300">→</span>}
          <span
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold ${
              at < 0 ? 'bg-surface-soft text-ink-700' : i <= at ? 'bg-brand-50 text-brand-700' : 'bg-surface-soft text-ink-400'
            }`}
          >
            {at >= 0 && (i <= at ? <CheckCircle2 size={13} /> : <Circle size={13} />)}
            {s}
          </span>
        </span>
      ))}
    </div>
  );
}

const yesNo = (v) =>
  v === 'Yes' ? (
    <Badge tone="green">Yes</Badge>
  ) : v === 'No' ? (
    <Badge tone="rose">No</Badge>
  ) : (
    <Badge tone="amber">{v}</Badge>
  );

/**
 * Payments as the client's sheet lays them out: what has been collected,
 * what is still owed and who is chasing it, what goes back out in refunds,
 * salary, commission and expenses — and who is allowed to touch any of it.
 */
export default function Payment() {
  const {
    invoices, payments, bookings, memberSignups, customers, team, range, toast,
  } = useApp();

  const [section, setSection] = useState('Overview');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [mode, setMode] = useState('All');
  const [bucket, setBucket] = useState('All');

  // -- Money in ---------------------------------------------------------------
  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const membershipPaid = memberSignups.reduce((s, m) => s + Number(m.paid || 0), 0);
  const totalCollection = collected + membershipPaid;
  const outstanding = invoices.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paid || 0)), 0);
  const membershipPending = memberSignups.reduce(
    (s, m) => s + Math.max(0, Number(m.amount || 0) - Number(m.paid || 0)),
    0
  );
  const receivable = outstanding + membershipPending;
  const markup = bookings.reduce(
    (s, b) => s + Math.max(0, Number(b.amount || 0) - Number(b.vendorContact?.payable || 0)),
    0
  );
  const refunded = refundRequests
    .filter((r) => r.stage === 'Refund processed')
    .reduce((s, r) => s + Number(r.refund || 0), 0);

  // -- Money out --------------------------------------------------------------
  const sum = (list) => list.reduce((s, x) => s + Number(x.amount || 0), 0);
  const officeCost = sum(expenseBudget.office);
  const businessCost = sum(expenseBudget.business);
  const netOf = (p) =>
    p.basic + p.incentives + p.attendance + p.sales + p.closing + p.commission + p.allowances - p.deductions - p.advances;
  const staffPayable = salary.reduce((s, p) => s + netOf(p), 0);
  const staffPaid = salary.filter((p) => p.status === 'Paid').reduce((s, p) => s + netOf(p), 0);
  const companyExpenses = officeCost + businessCost;
  const netProfit = totalCollection + markup - companyExpenses - staffPayable;

  const vendorPayable = bookings.reduce((s, b) => s + Number(b.vendorContact?.payable || 0), 0);

  // -- Every transaction, from what the panel already knows -------------------
  const transactions = [
    ...payments.map((p) => {
      const inv = invoices.find((i) => i.id === p.invoice);
      const bk = bookings.find((b) => b.id === inv?.booking);
      return {
        key: p.id,
        id: p.id,
        customer: p.customer,
        product: bk ? `${bk.bookingType || 'Package'} · ${bk.hotel || bk.pkg}` : 'Booking',
        amount: Number(p.amount || 0),
        tax: Number(bk?.charges?.taxes || 0),
        discount: Number(bk?.charges?.membershipDiscount || 0) + Number(bk?.charges?.offerDiscount || 0),
        mode: p.mode,
        gateway: p.mode === 'Cash' ? '—' : 'Razorpay',
        employee: bk?.owner || '—',
        branch: bk?.owner === 'Sneha' ? 'Mumbai' : 'Pune',
        date: p.date,
        status: p.status === 'Success' ? 'Paid' : p.status,
        txn: bk?.payment?.txnId || '—',
      };
    }),
    ...memberSignups
      .filter((m) => Number(m.paid || 0) > 0)
      .map((m) => ({
        key: `MEM-${m.id}`,
        id: m.id,
        customer: m.name,
        product: `${m.plan} membership`,
        amount: Number(m.paid || 0),
        tax: Math.round(Number(m.paid || 0) * 0.152),
        discount: 0,
        mode: 'UPI',
        gateway: 'Razorpay',
        employee: m.expert || '—',
        branch: m.branch || '—',
        date: m.startedOn || m.received,
        status: Number(m.paid) >= Number(m.amount) ? 'Paid' : 'Partially paid',
        txn: `TXN-${m.id}`,
      })),
  ];

  const txRows = transactions.filter((t) => {
    if (status !== 'All' && t.status !== status) return false;
    if (mode !== 'All' && t.mode !== mode) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [t.id, t.customer, t.product, t.txn, t.employee].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  });

  const dueRows = receivables.filter((r) => bucket === 'All' || r.bucket === bucket);

  const exportTransactions = () =>
    downloadCsv('smira-club-transactions', transactions, [
      { key: 'id', header: 'Transaction' },
      { key: 'customer', header: 'Customer' },
      { key: 'product', header: 'Product' },
      { key: 'amount', header: 'Amount' },
      { key: 'tax', header: 'Tax' },
      { key: 'discount', header: 'Discount' },
      { key: 'mode', header: 'Payment mode' },
      { key: 'gateway', header: 'Gateway' },
      { key: 'employee', header: 'Employee' },
      { key: 'branch', header: 'Branch' },
      { key: 'date', header: 'Date' },
      { key: 'status', header: 'Status' },
    ]);

  const body = {
    Overview: (
      <>
        <div className="grid gap-4 xl:col-span-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section className="card relative overflow-hidden p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Total collection</p>
              <p className="num mt-2 font-display text-4xl font-extrabold leading-none text-ink-900">{inr(totalCollection)}</p>
              <p className="mt-1.5 text-sm text-ink-500">
                {inr(membershipPaid)} memberships · {inr(collected)} bookings
              </p>
              <div className="mt-5">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  <span>Of everything billed</span>
                  <span className="num">
                    {Math.round((totalCollection / Math.max(1, totalCollection + receivable)) * 100)}%
                  </span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.round((totalCollection / Math.max(1, totalCollection + receivable)) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-sm">
                <Wallet size={14} className="text-ink-400" />
                {inr(receivable)} still to come in
              </p>
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Still owed to us</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'On bookings', value: outstanding, tone: 'bg-amber-500' },
                { label: 'On memberships', value: membershipPending, tone: 'bg-rose-500' },
                { label: 'Refunds to pay out', value: refundRequests.reduce((s, r) => s + Number(r.refund || 0), 0), tone: 'bg-violet-500' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-lg font-extrabold text-ink-900">{shortInr(r.value)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">What goes back out</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Staff payments', value: staffPayable, tone: 'bg-sky-500' },
                { label: 'Company expenses', value: companyExpenses, tone: 'bg-amber-500' },
                { label: 'Vendors', value: vendorPayable, tone: 'bg-ink-900/25' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-lg font-extrabold text-ink-900">{shortInr(r.value)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="card grid divide-y divide-ink-900/[0.07] sm:grid-cols-2 sm:divide-y-0 xl:col-span-2 xl:grid-cols-3 2xl:grid-cols-6 sm:[&>*:not(:first-child)]:border-l sm:[&>*]:border-ink-900/[0.07]">
          {[
            { label: 'Today', value: inr(payments.filter((p) => p.date === '28 Aug 2026').reduce((s, p) => s + p.amount, 0)), hint: "today's payments" },
            { label: 'Membership revenue', value: inr(membershipPaid) },
            { label: 'Booking revenue', value: inr(markup), hint: 'markup kept' },
            { label: 'Refunds', value: inr(refunded) },
            { label: 'Receivable', value: inr(receivable), hint: 'customer money pending' },
            { label: 'Net profit', value: inr(netProfit), hint: 'after everything out', tone: netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600' },
          ].map((g) => (
            <div key={g.label} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{g.label}</p>
              <p className={`num mt-1.5 font-display text-2xl font-extrabold ${g.tone || 'text-ink-900'}`}>{g.value}</p>
              {g.hint && <p className="mt-0.5 text-xs text-ink-400">{g.hint}</p>}
            </div>
          ))}
        </div>

        <Block title="What every payment carries" note="A payment is never just an amount — it is tied to all of this" wide>
          <div className="flex flex-wrap gap-2">
            {paymentLinks.map((l) => (
              <span key={l} className="chip text-ink-600">
                <Link2 size={12} /> {l}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    Transactions: (
      <Block
        title="All transactions"
        note="Every payment, with what it was for and who took it"
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input h-9 w-44 py-0 pl-9 text-sm"
                placeholder="Search transactions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="input h-9 w-auto py-0 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All statuses</option>
              {paymentStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select className="input h-9 w-auto py-0 text-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="All">All modes</option>
              {paymentModes.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <button className="btn-ghost btn-sm" onClick={exportTransactions}>
              <Download size={14} /> Export
            </button>
          </div>
        }
      >
        <Table
          head={['Transaction', 'Customer', 'Product', 'Amount', 'Tax', 'Discount', 'Mode', 'Gateway', 'Employee', 'Branch', 'Date', 'Status']}
          empty="No transaction matches this view."
          rows={txRows.map((t) => ({
            key: t.key,
            cells: [
              <span className="num text-brand-700">{t.id}</span>,
              t.customer,
              t.product,
              <span className="num font-bold text-ink-900">{inr(t.amount)}</span>,
              <span className="num">{t.tax ? inr(t.tax) : '—'}</span>,
              <span className="num text-emerald-600">{t.discount ? `− ${inr(t.discount)}` : '—'}</span>,
              t.mode,
              t.gateway,
              t.employee,
              t.branch,
              <span className="num">{t.date}</span>,
              <Badge tone={statusTone[t.status] || 'slate'} dot>
                {t.status}
              </Badge>,
            ],
          }))}
          foot={['Total', '', '', inr(txRows.reduce((s, t) => s + t.amount, 0)), '', '', '', '', '', '', '', '']}
        />
        <p className="mt-3 text-xs text-ink-400">
          Statuses run {paymentStatuses.join(' → ')}.
        </p>
      </Block>
    ),

    Collections: (
      <>
        <Block
          title="Who owes what"
          note="Pending payments by how late they are"
          wide
          action={
            <div className="flex flex-wrap gap-1.5">
              {['All', ...collectionBuckets].map((b) => (
                <button
                  key={b}
                  onClick={() => setBucket(b)}
                  className={`chip ${bucket === b ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600'}`}
                >
                  {b}
                  <span className="num ml-1.5 text-ink-400">
                    {b === 'All' ? receivables.length : receivables.filter((r) => r.bucket === b).length}
                  </span>
                </button>
              ))}
            </div>
          }
        >
          <Table
            head={['Customer', 'What for', 'Salesperson', 'Amount', 'Due', 'Overdue by', 'Last reminder', 'Next follow-up', 'Call', 'WhatsApp', '']}
            empty="Nothing outstanding in this bucket."
            rows={dueRows.map((r) => ({
              key: r.id,
              cells: [
                <span className="flex items-center gap-2.5">
                  <Avatar name={r.customer} size="sm" /> {r.customer}
                </span>,
                r.product,
                r.salesperson,
                <span className="num font-bold text-amber-600">{inr(r.amount)}</span>,
                <span className="num">{r.due}</span>,
                <Badge tone={r.bucket === 'Due today' ? 'sky' : 'rose'}>{r.bucket}</Badge>,
                <span className="num">{r.lastReminder}</span>,
                <span className="num">{r.nextFollowUp}</span>,
                r.call,
                r.whatsapp,
                <span className="flex gap-1.5">
                  <button className="btn-ghost btn-sm" onClick={() => toast(`Payment link sent to ${r.customer}`)}>
                    <Send size={13} /> Send link
                  </button>
                  <button className="btn-ghost btn-sm" onClick={() => toast(`${inr(r.amount)} marked collected`)}>
                    Collect
                  </button>
                </span>,
              ],
            }))}
          />
        </Block>

        <Block title="What the panel does about it" note="Nobody has to remember to chase" wide>
          <Flow steps={chaseFlow} />
        </Block>
      </>
    ),

    Membership: (
      <Block title="Membership payments" note="Price, discount and tax, then what is actually in" wide>
        <Table
          head={['Member', 'Plan', 'Price', 'Tax', 'Final amount', 'Paid', 'Pending', 'Method', 'Salesperson', 'Branch', 'Status']}
          rows={memberSignups.map((m) => {
            const pending = Math.max(0, Number(m.amount || 0) - Number(m.paid || 0));
            return {
              key: m.id,
              cells: [
                m.name,
                m.plan,
                <span className="num">{inr(Math.round(Number(m.amount || 0) / 1.18))}</span>,
                <span className="num">{inr(Number(m.amount || 0) - Math.round(Number(m.amount || 0) / 1.18))}</span>,
                <span className="num font-bold text-ink-900">{inr(m.amount || 0)}</span>,
                <span className="num text-emerald-600">{inr(m.paid || 0)}</span>,
                <span className={`num ${pending ? 'font-bold text-amber-600' : ''}`}>{pending ? inr(pending) : '—'}</span>,
                Number(m.paid) ? 'UPI' : '—',
                m.expert || '—',
                m.branch || '—',
                <Badge tone={pending === 0 && m.paid ? 'green' : m.paid ? 'amber' : 'sky'} dot>
                  {pending === 0 && m.paid ? 'Paid' : m.paid ? 'Partially paid' : 'Pending'}
                </Badge>,
              ],
            };
          })}
          foot={[
            'Total', '', '', '',
            inr(memberSignups.reduce((s, m) => s + Number(m.amount || 0), 0)),
            inr(membershipPaid),
            inr(membershipPending),
            '', '', '', '',
          ]}
        />
        <p className="mt-3 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
          A part payment writes the rest into the books on its own — ₹50,000 sold with ₹20,000 paid leaves a ₹30,000
          receivable without anyone typing it.
        </p>
      </Block>
    ),

    Bookings: (
      <Block title="Booking payments" note="What the customer paid, what the hotel takes, what is left" wide>
        <Table
          head={['Booking', 'Customer', 'Booking amount', 'Hotel or vendor cost', 'Markup', 'GST and tax', 'Gateway charge', 'Net booking profit', 'Collected', 'Balance']}
          rows={bookings.map((b) => {
            const cost = Number(b.vendorContact?.payable || 0);
            const gross = Number(b.amount || 0);
            const mk = Math.max(0, gross - cost);
            const gatewayFee = Math.round(gross * 0.02);
            return {
              key: b.id,
              cells: [
                <span className="num text-brand-700">{b.id}</span>,
                b.customer,
                <span className="num">{inr(gross)}</span>,
                <span className="num text-rose-600">{inr(cost)}</span>,
                <span className="num text-emerald-600">{inr(mk)}</span>,
                <span className="num">{inr(Number(b.charges?.taxes || 0))}</span>,
                <span className="num">{inr(gatewayFee)}</span>,
                <span className="num font-bold text-brand-700">{inr(mk - gatewayFee)}</span>,
                <span className="num">{inr(b.paid || 0)}</span>,
                <span className={`num ${gross - Number(b.paid || 0) ? 'font-bold text-amber-600' : ''}`}>
                  {gross - Number(b.paid || 0) ? inr(gross - Number(b.paid || 0)) : 'Settled'}
                </span>,
              ],
            };
          })}
        />
      </Block>
    ),

    Gateways: (
      <Block title="Gateways" note="Where money arrives, what it costs and whether it has settled" wide>
        <Table
          head={['Gateway', 'Successful', 'Pending', 'Failed', 'Fee', 'Settlement', 'Settled amount', 'Reconciliation']}
          rows={gateways.map((g) => ({
            key: g.name,
            cells: [
              g.name,
              <span className="num font-bold text-emerald-600">{g.successful}</span>,
              <span className="num text-amber-600">{g.pending}</span>,
              <span className="num text-rose-600">{g.failed}</span>,
              <span className="num">{g.fee ? `${g.fee}%` : 'free'}</span>,
              g.settlement,
              <span className="num font-bold text-ink-900">{inr(g.settled)}</span>,
              <Badge tone={g.status === 'Reconciled' ? 'green' : 'amber'} dot>
                {g.status}
              </Badge>,
            ],
          }))}
          foot={[
            'Total',
            gateways.reduce((s, g) => s + g.successful, 0),
            gateways.reduce((s, g) => s + g.pending, 0),
            gateways.reduce((s, g) => s + g.failed, 0),
            '', '',
            inr(gateways.reduce((s, g) => s + g.settled, 0)),
            '',
          ]}
        />
      </Block>
    ),

    Invoices: (
      <Block
        title="Invoices and receipts"
        note="Raised the moment a sale closes, receipted the moment money lands"
        wide
      >
        <Table
          head={['Invoice', 'Customer', 'For', 'Base amount', 'Discount', 'Tax', 'Total', 'Paid', 'Balance', 'Status', '']}
          rows={invoices.map((i) => {
            const b = bookings.find((x) => x.id === i.booking);
            const balance = Number(i.amount) - Number(i.paid);
            return {
              key: i.id,
              cells: [
                <span className="num text-brand-700">{i.id}</span>,
                i.customer,
                b ? `${b.bookingType || 'Package'} · ${b.hotel || b.pkg}` : 'Booking',
                <span className="num">{inr(Number(b?.charges?.base || i.amount))}</span>,
                <span className="num text-emerald-600">
                  {b?.charges?.membershipDiscount ? `− ${inr(b.charges.membershipDiscount + (b.charges.offerDiscount || 0))}` : '—'}
                </span>,
                <span className="num">{inr(Number(b?.charges?.taxes || 0))}</span>,
                <span className="num font-bold text-ink-900">{inr(i.amount)}</span>,
                <span className="num text-emerald-600">{inr(i.paid)}</span>,
                <span className={`num ${balance ? 'font-bold text-amber-600' : ''}`}>{balance ? inr(balance) : '—'}</span>,
                <Badge tone={i.status === 'Paid' ? 'green' : i.status === 'Partial' ? 'amber' : 'rose'} dot>
                  {i.status}
                </Badge>,
                <span className="flex gap-1.5">
                  <button className="btn-ghost btn-sm" onClick={() => toast(`Invoice ${i.id} sent`)}>
                    <Send size={13} /> Send
                  </button>
                  <button className="btn-ghost btn-sm" onClick={() => toast(`Receipt for ${i.id} generated`)}>
                    <Receipt size={13} /> Receipt
                  </button>
                </span>,
              ],
            };
          })}
        />
      </Block>
    ),

    Refunds: (
      <>
        <Block title="Refunds and cancellations" note="Money only goes back out with two approvals" wide>
          <Table
            head={['Request', 'Customer', 'Original payment', 'Paid', 'Cancellation charge', 'Refund', 'Reason', 'Stage', 'Approved by', '']}
            empty="No refund requests."
            rows={refundRequests.map((r) => ({
              key: r.id,
              cells: [
                <span className="num text-brand-700">{r.id}</span>,
                r.customer,
                <span className="num">{r.original}</span>,
                <span className="num">{inr(r.amount)}</span>,
                <span className="num text-rose-600">{inr(r.charges)}</span>,
                <span className="num font-bold text-ink-900">{inr(r.refund)}</span>,
                r.reason,
                <Badge tone="amber" dot>
                  {r.stage}
                </Badge>,
                r.approvedBy,
                <button className="btn-ghost btn-sm" onClick={() => toast(`${r.id} approved`)}>
                  Approve
                </button>,
              ],
            }))}
          />
          <div className="mt-4">
            <Flow steps={refundFlow} at={refundRequests[0] ? refundFlow.indexOf(refundRequests[0].stage) : -1} />
          </div>
        </Block>
      </>
    ),

    Salary: (
      <Block title="Salary and incentives" note="Basic, incentives and commission, less deductions and advances" wide>
        <Table
          head={['Employee', 'Basic', 'Incentives', 'Attendance', 'Sales', 'Closing', 'Commission', 'Allowances', 'Deductions', 'Advances', 'Net payable', 'Status']}
          rows={salary.map((p) => ({
            key: p.name,
            cells: [
              <span className="flex items-center gap-2.5">
                <Avatar name={p.name} size="sm" /> {p.name}
              </span>,
              <span className="num">{inr(p.basic)}</span>,
              <span className="num">{inr(p.incentives)}</span>,
              <span className="num">{inr(p.attendance)}</span>,
              <span className="num">{inr(p.sales)}</span>,
              <span className="num">{inr(p.closing)}</span>,
              <span className="num">{inr(p.commission)}</span>,
              <span className="num">{inr(p.allowances)}</span>,
              <span className="num text-rose-600">− {inr(p.deductions)}</span>,
              <span className="num text-rose-600">− {inr(p.advances)}</span>,
              <span className="num font-bold text-brand-700">{inr(netOf(p))}</span>,
              <Badge tone={p.status === 'Paid' ? 'green' : 'amber'} dot>
                {p.status}
              </Badge>,
            ],
          }))}
          foot={['Total', '', '', '', '', '', '', '', '', '', inr(staffPayable), '']}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Total salary payable" value={inr(staffPayable)} />
          <Stat label="Paid" value={inr(staffPaid)} tone="text-emerald-600" />
          <Stat label="Pending" value={inr(staffPayable - staffPaid)} tone="text-amber-600" />
        </div>
      </Block>
    ),

    Commission: (
      <Block title="Sales commission" note="Worked out by the panel — nobody adds this up by hand" wide>
        <Table
          head={['Employee', 'Memberships closed', 'Per closing', 'Incentive earned', 'Revenue booked', 'Commission on revenue', 'Total']}
          rows={team.map((m) => {
            const first = m.name.split(' ')[0];
            const closings = memberSignups.filter((s) => s.expert === first && Number(s.paid || 0) > 0).length;
            const incentive = closings * commissionRules.perClosing;
            const revenue = Number(m.revenue || 0);
            const rate = revenue > 700000 ? 3 : revenue > 300000 ? 2 : 1;
            const onRevenue = Math.round((revenue * rate) / 100);
            return {
              key: m.id,
              cells: [
                <span className="flex items-center gap-2.5">
                  <Avatar name={m.name} size="sm" /> {m.name}
                </span>,
                <span className="num">{closings}</span>,
                <span className="num">{inr(commissionRules.perClosing)}</span>,
                <span className="num">{inr(incentive)}</span>,
                <span className="num">{revenue ? inr(revenue) : '—'}</span>,
                <span className="num">
                  {rate}% · {inr(onRevenue)}
                </span>,
                <span className="num font-bold text-brand-700">{inr(incentive + onRevenue)}</span>,
              ],
            };
          })}
        />
        <p className="mt-3 text-xs text-ink-400">{commissionRules.note}</p>
      </Block>
    ),

    Expenses: (
      <>
        <Block
          title="Company expenses"
          note="Every spend, and where it has got to"
          wide
          action={
            <button className="btn-ghost btn-sm" onClick={() => toast('Expense raised for approval')}>
              Raise an expense
            </button>
          }
        >
          <Table
            head={['Expense', 'Category', 'What for', 'Amount', 'Raised by', 'Stage', 'Date']}
            rows={expenseEntries.map((e) => ({
              key: e.id,
              cells: [
                <span className="num text-brand-700">{e.id}</span>,
                e.category,
                e.detail,
                <span className="num font-bold text-ink-900">{inr(e.amount)}</span>,
                e.raisedBy,
                <Badge tone={e.stage === 'Paid' ? 'green' : e.stage === 'Approval' ? 'amber' : 'sky'} dot>
                  {e.stage}
                </Badge>,
                <span className="num">{e.on}</span>,
              ],
            }))}
            foot={['Total', '', '', inr(expenseEntries.reduce((s, e) => s + e.amount, 0)), '', '', '']}
          />
          <div className="mt-4">
            <Flow steps={expenseFlow} />
          </div>
          <p className="eyebrow mt-5">Categories</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {expenseCategories.map((c) => (
              <span key={c} className="chip text-ink-500">
                {c}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    Vendors: (
      <Block title="Vendor and partner payable" note="What the hotels are owed against each booking" wide>
        <Table
          head={['Vendor', 'Booking', 'Customer', 'Vendor cost', 'Amount payable', 'Amount paid', 'Pending', 'Due date', 'Status']}
          rows={bookings.map((b) => {
            const payable = Number(b.vendorContact?.payable || 0);
            const paid = b.confirmation?.status === 'Hotel confirmed' ? payable : 0;
            return {
              key: b.id,
              cells: [
                b.vendor,
                <span className="num text-brand-700">{b.id}</span>,
                b.customer,
                <span className="num">{inr(payable)}</span>,
                <span className="num font-bold text-ink-900">{inr(payable)}</span>,
                <span className="num text-emerald-600">{inr(paid)}</span>,
                <span className={`num ${payable - paid ? 'font-bold text-amber-600' : ''}`}>
                  {payable - paid ? inr(payable - paid) : '—'}
                </span>,
                <span className="num">{b.checkIn}</span>,
                <Badge tone={payable - paid ? 'amber' : 'green'} dot>
                  {payable - paid ? 'Pending' : 'Paid'}
                </Badge>,
              ],
            };
          })}
          foot={['Total', '', '', '', inr(vendorPayable), '', '', '', '']}
        />
      </Block>
    ),

    Permissions: (
      <Block title="Who can touch the money" note="Every role, set separately" wide>
        <Table
          head={['Role', 'View', 'Collect', 'Refund', 'Salary', 'Expenses', 'Reports']}
          rows={paymentPermissions.map((p) => ({
            key: p.role,
            cells: [
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand-600" /> {p.role}
              </span>,
              yesNo(p.view),
              yesNo(p.collect),
              yesNo(p.refund),
              yesNo(p.salary),
              yesNo(p.expenses),
              yesNo(p.reports),
            ],
          }))}
        />
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
          <AlertTriangle size={15} className="shrink-0 text-amber-500" />
          Refunds always need permission — no role can send money back on its own.
        </p>
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="Payment" subtitle={`Money in, money out and who is chasing it · ${range.toLowerCase()}`}>
        <button className="btn-ghost" onClick={exportTransactions}>
          <Download size={16} /> Export
        </button>
        <button className="btn-primary" onClick={() => setSection('Collections')}>
          <Send size={16} /> Send a payment link
        </button>
      </PageHeader>

      <SectionTabs
        className="mb-5"
        items={SECTIONS}
        value={section}
        onChange={setSection}
      />

      <div className="grid gap-5 xl:grid-cols-2">{body[section]}</div>
    </>
  );
}
