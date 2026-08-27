import { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { downloadCsv } from '../lib/csv.js';
import { daysUntil } from '../lib/membership.js';
import { inr, shortInr, stageProbability, salesTrend } from '../data/mockData.js';
import {
  monthlyRevenue,
  expenses,
  openingCash,
  branches,
  forecast,
  revenueReports,
} from '../data/revenueData.js';

const SECTIONS = [
  'Overview',
  'Sources',
  'Sales team',
  'Collections',
  'Ledger',
  'Membership',
  'Customers',
  'Forecast',
  'Money in and out',
  'Profit and loss',
  'Alerts',
  'Reports',
];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(11,21,36,0.06)',
  boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
  fontSize: 12,
  fontWeight: 600,
};

function Block({ title, note, wide, action, children }) {
  return (
    <section className={`card p-5 ${wide ? 'xl:col-span-2' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-extrabold text-ink-900">{title}</h3>
          {note && <p className="mt-0.5 text-sm text-ink-500">{note}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, hint, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-xl font-extrabold ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

/** A table that takes plain rows, so every part of the page reads the same. */
function Table({ head, rows, empty = 'Nothing to show yet.', foot }) {
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

/** The money line every P&L row uses. */
function Line2({ label, value, tone = 'text-ink-800', bold }) {
  return (
    <li className={`flex items-baseline justify-between gap-4 py-2 ${bold ? 'border-t border-ink-900/[0.07] pt-2.5' : ''}`}>
      <span className={`text-sm ${bold ? 'font-extrabold text-ink-900' : 'text-ink-600'}`}>{label}</span>
      <span className={`num text-sm ${bold ? 'font-extrabold' : 'font-bold'} ${tone}`}>{value}</span>
    </li>
  );
}

/**
 * Revenue as the client's sheet lays it out: what came in, what it cost,
 * what is left — money in, money out, and the profit between them.
 */
export default function Revenue() {
  const {
    bookings, invoices, payments, memberSignups, memberships,
    customers, team, enquiries, range, toast,
  } = useApp();

  const [section, setSection] = useState('Overview');
  const [grain, setGrain] = useState('Monthly');

  // -- Money in ---------------------------------------------------------------
  const membershipGross = memberSignups.reduce((s, m) => s + Number(m.amount || 0), 0);
  const membershipPaid = memberSignups.reduce((s, m) => s + Number(m.paid || 0), 0);
  const membershipPending = Math.max(0, membershipGross - membershipPaid);

  const bookingValue = bookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const partnerCost = bookings.reduce((s, b) => s + Number(b.vendorContact?.payable || 0), 0);
  const markup = Math.max(0, bookingValue - partnerCost);

  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const outstanding = invoices.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paid || 0)), 0);
  const refunds = 0;

  const totalRevenue = membershipPaid + markup;
  const target = team.reduce((s, m) => s + Number(m.target || 0), 0);
  const achievement = target ? Math.round((totalRevenue / target) * 100) : 0;
  const netRevenue = totalRevenue - refunds;
  const perCustomer = customers.length ? Math.round(totalRevenue / customers.length) : 0;

  const thisMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const lastMonth = monthlyRevenue[monthlyRevenue.length - 2];
  const monthTotal = (m) => m.membership + m.markup + m.other;
  const growth = lastMonth && monthTotal(lastMonth)
    ? Math.round(((monthTotal(thisMonth) - monthTotal(lastMonth)) / monthTotal(lastMonth)) * 100)
    : 0;

  // -- Money out --------------------------------------------------------------
  const sum = (list) => list.reduce((s, x) => s + Number(x.amount || 0), 0);
  const officeCost = sum(expenses.office);
  const staffCost = sum(expenses.staff);
  const businessCost = sum(expenses.business);
  const marketing = expenses.office.find((x) => x.label === 'Marketing')?.amount || 0;
  const totalExpenses = officeCost + staffCost + businessCost;
  const profit = netRevenue - totalExpenses;
  const margin = netRevenue ? Math.round((profit / netRevenue) * 100) : 0;
  const staffRatio = netRevenue ? Math.round((staffCost / netRevenue) * 100) : 0;

  // -- Cash -------------------------------------------------------------------
  const cashIn = membershipPaid + collected;
  const cashOut = staffCost + officeCost + businessCost;
  const closingCash = openingCash + cashIn - cashOut;

  // -- Where revenue comes from ----------------------------------------------
  const sources = [
    { label: 'Membership sales', track: 'Sold, quantity, revenue', qty: memberSignups.filter((m) => m.paid > 0).length, amount: membershipPaid },
    { label: 'Hotel bookings', track: 'Booking value, margin', qty: bookings.filter((b) => b.bookingType === 'Hotel').length, amount: bookings.filter((b) => b.bookingType === 'Hotel').reduce((s, b) => s + Number(b.amount || 0) - Number(b.vendorContact?.payable || 0), 0) },
    { label: 'Villa bookings', track: 'Booking value, margin', qty: bookings.filter((b) => b.bookingType === 'Villa').length, amount: 0 },
    { label: 'Travel packages', track: 'Package revenue', qty: bookings.filter((b) => (b.bookingType || 'Package') === 'Package').length, amount: bookings.filter((b) => (b.bookingType || 'Package') === 'Package').reduce((s, b) => s + Number(b.amount || 0) - Number(b.vendorContact?.payable || 0), 0) },
    { label: 'Restaurant', track: 'Commission on the bill', qty: 0, amount: 0 },
    { label: 'Activities', track: 'Revenue or commission', qty: 0, amount: 0 },
    { label: 'Renewals', track: 'Renewal revenue', qty: memberSignups.filter((m) => m.renewal?.stage === 'Renewed').length, amount: 0 },
    { label: 'Upgrades', track: 'Upgrade revenue', qty: 0, amount: 0 },
    { label: 'Add-ons', track: 'Additional revenue', qty: 0, amount: 0 },
    { label: 'Referral sales', track: 'Referral-generated revenue', qty: customers.reduce((s, c) => s + Number(c.referral?.converted || 0), 0), amount: 0 },
  ];

  // -- Per consultant ---------------------------------------------------------
  const salesRows = team.map((m) => {
    const first = m.name.split(' ')[0];
    const mine = enquiries.filter((e) => e.owner === first);
    const won = mine.filter((e) => e.status === 'Won');
    const revenue = Number(m.revenue || 0);
    const theirMemberships = memberSignups.filter((s) => s.expert === first);
    const rate = revenue > 700000 ? 3 : revenue > 300000 ? 2 : 1;
    return {
      key: m.id,
      name: m.name,
      revenue,
      memberships: theirMemberships.length,
      target: Number(m.target || 0),
      achievement: m.target ? Math.round((revenue / m.target) * 100) : 0,
      ticket: won.length ? Math.round(won.reduce((s, e) => s + Number(e.budget || 0), 0) / won.length) : 0,
      conversion: mine.length ? Math.round((won.length / mine.length) * 100) : 0,
      pending: theirMemberships.reduce((s, x) => s + Math.max(0, Number(x.amount || 0) - Number(x.paid || 0)), 0),
      rate,
      commission: Math.round((revenue * rate) / 100),
    };
  });

  // -- The ledger, from invoices and membership sales -------------------------
  const ledger = [
    ...invoices.map((i) => {
      const b = bookings.find((x) => x.id === i.booking);
      const gross = Number(b?.charges?.base || i.amount);
      const discount = Number(b?.charges?.membershipDiscount || 0) + Number(b?.charges?.offerDiscount || 0);
      const tax = Number(b?.charges?.taxes || 0);
      return {
        key: i.id,
        date: i.issued,
        customer: i.customer,
        source: b ? `${b.bookingType || 'Package'} booking` : 'Booking',
        invoice: i.id,
        gross,
        discount,
        tax,
        net: Number(i.amount),
        paid: Number(i.paid),
        status: i.status,
      };
    }),
    ...memberSignups
      .filter((m) => Number(m.amount || 0) > 0)
      .map((m) => ({
        key: m.id,
        date: m.startedOn || m.received,
        customer: m.name,
        source: `${m.plan} membership`,
        invoice: m.quote || '—',
        gross: Number(m.amount),
        discount: 0,
        tax: 0,
        net: Number(m.amount),
        paid: Number(m.paid),
        status: Number(m.paid) >= Number(m.amount) ? 'Paid' : Number(m.paid) ? 'Partial' : 'Pending',
      })),
  ];

  // -- Forecast ---------------------------------------------------------------
  const openLeads = enquiries.filter((e) => !['Won', 'Lost'].includes(e.status));
  const pipeline = openLeads.reduce((s, e) => s + Number(e.budget || 0), 0);
  const weighted = openLeads.reduce((s, e) => s + Number(e.budget || 0) * (stageProbability[e.status] || 0), 0);
  const expectedCollections = Math.round(outstanding * forecast.expectedCollectionRate);
  const forecastTotal = totalRevenue + Math.round(weighted) + expectedCollections;

  // -- Alerts -----------------------------------------------------------------
  const alerts = [
    ...invoices
      .filter((i) => Number(i.paid) < Number(i.amount))
      .map((i) => ({
        key: `pay-${i.id}`,
        level: Number(i.amount) - Number(i.paid) > 100000 ? 'critical' : 'warning',
        text: `${i.customer} still owes ${inr(Number(i.amount) - Number(i.paid))} on ${i.id}`,
      })),
    ...memberSignups
      .filter((m) => Number(m.paid || 0) < Number(m.amount || 0))
      .map((m) => ({
        key: `mem-${m.id}`,
        level: 'warning',
        text: `${m.name}'s ${m.plan} fee of ${inr(Number(m.amount) - Number(m.paid))} has not been collected`,
      })),
    ...memberSignups
      .filter((m) => { const l = daysUntil(m.expiresOn); return l != null && l >= 0 && l <= 45; })
      .map((m) => ({
        key: `ren-${m.id}`,
        level: 'warning',
        text: `${m.name}'s membership renews in ${daysUntil(m.expiresOn)} days — ${inr(m.amount)} at stake`,
      })),
    ...(achievement >= 100 ? [{ key: 'target', level: 'positive', text: `Target beaten — ${achievement}% of ${inr(target)}` }] : []),
    ...(growth < 0 ? [{ key: 'down', level: 'critical', text: `Revenue is ${Math.abs(growth)}% below last month` }] : []),
    ...customers
      .filter((c) => Number(c.spend || 0) >= 300000)
      .map((c) => ({ key: `vip-${c.id}`, level: 'positive', text: `${c.name} has spent ${inr(c.spend)} — worth a call` })),
  ];

  const chart = (grain === 'Daily' ? salesTrend.map((d) => ({ label: `${d.day}`, revenue: d.revenue, target: d.target })) : monthlyRevenue.map((m) => ({ label: m.month, revenue: monthTotal(m), target: m.target })));

  const exportAs = (name, rows, columns) => {
    downloadCsv(name, rows, columns);
    toast(`${name} exported`);
  };
  const printPdf = () => {
    toast('Opening the print dialog — choose “Save as PDF”', 'info');
    setTimeout(() => window.print(), 400);
  };

  const body = {
    Overview: (
      <>
        {/* The headline: what came in, what is left, what is still owed */}
        <div className="grid gap-4 xl:col-span-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section className="card relative overflow-hidden bg-ink-900 p-5 text-white">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/20 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Total revenue</p>
              <p className="num mt-2 font-display text-4xl font-extrabold leading-none">{inr(totalRevenue)}</p>
              <p className="mt-1.5 text-sm text-white/60">
                {inr(membershipPaid)} memberships · {inr(markup)} booking markup
              </p>
              <div className="mt-5">
                <p className="flex items-baseline justify-between text-xs font-semibold text-white/60">
                  <span>Target {shortInr(target)}</span>
                  <span className="num text-white">{achievement}%</span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className={`h-full rounded-full ${achievement >= 100 ? 'bg-emerald-400' : 'bg-brand-400'}`}
                    style={{ width: `${Math.min(achievement, 100)}%` }}
                  />
                </div>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
                {growth >= 0 ? <TrendingUp size={14} className="text-emerald-300" /> : <TrendingDown size={14} className="text-rose-300" />}
                {growth >= 0 ? `${growth}% up on last month` : `${Math.abs(growth)}% down on last month`}
              </p>
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">What is left after costs</p>
            <p className={`num mt-2 font-display text-3xl font-extrabold leading-none ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {inr(profit)}
            </p>
            <p className="mt-1 text-sm text-ink-500">{margin}% of everything that came in</p>
            <ul className="mt-4 space-y-1">
              <Line2 label="Money in" value={inr(netRevenue)} tone="text-brand-700" />
              <Line2 label="Money out" value={inr(totalExpenses)} tone="text-rose-600" />
              <Line2 label="Company profit" value={inr(profit)} bold tone={profit >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Still to reach the bank</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Pending on bookings', value: outstanding, tone: 'bg-amber-500' },
                { label: 'Pending on memberships', value: membershipPending, tone: 'bg-rose-500' },
                { label: 'Collected so far', value: collected + membershipPaid, tone: 'bg-emerald-500' },
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

        {/* Everything else in one strip */}
        <div className="card grid divide-y divide-ink-900/[0.07] sm:grid-cols-2 sm:divide-y-0 xl:col-span-2 xl:grid-cols-3 2xl:grid-cols-6 sm:[&>*:not(:first-child)]:border-l sm:[&>*]:border-ink-900/[0.07]">
          {[
            { label: 'This month', value: inr(monthTotal(thisMonth)), hint: `${growth >= 0 ? '+' : ''}${growth}% on last month` },
            { label: 'Collected', value: inr(collected + membershipPaid), hint: 'in the bank' },
            { label: 'Pending', value: inr(outstanding + membershipPending), hint: 'still to collect' },
            { label: 'Refunds', value: inr(refunds), hint: 'given back' },
            { label: 'Net revenue', value: inr(netRevenue), hint: 'after refunds' },
            { label: 'Per customer', value: inr(perCustomer), hint: 'average revenue' },
          ].map((g) => (
            <div key={g.label} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{g.label}</p>
              <p className="num mt-1.5 font-display text-2xl font-extrabold text-ink-900">{g.value}</p>
              <p className="mt-0.5 text-xs text-ink-400">{g.hint}</p>
            </div>
          ))}
        </div>

        <Block
          title="Revenue against target"
          note="Bars are what came in, the line is what was asked for"
          wide
          action={
            <div className="flex gap-1.5">
              {['Daily', 'Monthly'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGrain(g)}
                  className={`chip ${grain === g ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#96a2b4' }} dy={6} />
                <YAxis tickLine={false} axisLine={false} width={58} tick={{ fontSize: 11, fill: '#96a2b4' }} tickFormatter={shortInr} />
                <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" name="Revenue" fill="#0b8472" radius={[6, 6, 3, 3]} maxBarSize={26} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#f0a04b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Block>

        <Block title="Revenue by branch" note="Each desk against what it was asked for" wide>
          <Table
            head={['Branch', 'Manager', 'Revenue', 'Target', 'Achievement', 'Customers']}
            rows={branches.map((b) => {
              const mine = team.filter((m) => m.name === b.manager);
              const revenue = mine.reduce((s, m) => s + Number(m.revenue || 0), 0);
              return {
                key: b.name,
                cells: [
                  b.name,
                  b.manager,
                  <span className="num font-bold text-brand-700">{inr(revenue)}</span>,
                  <span className="num">{inr(b.target)}</span>,
                  <span className={`num font-bold ${revenue >= b.target ? 'text-emerald-600' : 'text-ink-700'}`}>
                    {Math.round((revenue / b.target) * 100)}%
                  </span>,
                  <span className="num">{customers.filter((c) => c.branch === b.name || c.city === b.name).length}</span>,
                ],
              };
            })}
          />
        </Block>
      </>
    ),

    Sources: (
      <>
        <Block title="Where the money comes from" note="Every stream the agency earns on" wide>
          <Table
            head={['Revenue source', 'What is tracked', 'Count', 'Revenue']}
            rows={sources.map((s) => ({
              key: s.label,
              cells: [
                s.label,
                <span className="text-ink-500">{s.track}</span>,
                <span className="num">{s.qty || '—'}</span>,
                <span className={`num font-bold ${s.amount ? 'text-brand-700' : 'text-ink-400'}`}>
                  {s.amount ? inr(s.amount) : '—'}
                </span>,
              ],
            }))}
            foot={['Total', '', sources.reduce((s, x) => s + x.qty, 0), inr(sources.reduce((s, x) => s + x.amount, 0))]}
          />
        </Block>

        <Block title="Revenue funnel" note="How a lead turns into money" wide>
          <ul className="grid gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {[
              ['Leads', enquiries.length],
              ['Qualified', enquiries.filter((e) => !['New', 'Lost'].includes(e.status)).length],
              ['Presentations', enquiries.filter((e) => ['Presentation', 'Visit scheduled', 'Closing', 'Won'].includes(e.status)).length],
              ['Customers', customers.length],
              ['Membership sold', memberSignups.length],
              ['Payment received', payments.length],
              ['Booking or usage', bookings.length],
              ['Renewal', memberSignups.filter((m) => m.renewal?.stage && m.renewal.stage !== '—').length],
            ].map(([label, n]) => (
              <li key={label} className="rounded-xl bg-surface-soft px-4 py-3">
                <p className="text-xs font-bold text-ink-700">{label}</p>
                <p className="num mt-1 font-display text-lg font-extrabold text-ink-900">{n}</p>
              </li>
            ))}
          </ul>
        </Block>
      </>
    ),

    'Sales team': (
      <>
        <Block title="Revenue by consultant" note="What each of them brought in, and what they earn on it" wide>
          <Table
            head={['Consultant', 'Revenue', 'Memberships', 'Average ticket', 'Conversion', 'Target', 'Achieved', 'Pending', 'Slab', 'Commission']}
            rows={salesRows.map((r) => ({
              key: r.key,
              cells: [
                <span className="flex items-center gap-2.5">
                  <Avatar name={r.name} size="sm" /> {r.name}
                </span>,
                <span className="num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</span>,
                <span className="num">{r.memberships}</span>,
                <span className="num">{r.ticket ? inr(r.ticket) : '—'}</span>,
                <span className="num">{r.conversion}%</span>,
                <span className="num">{r.target ? shortInr(r.target) : '—'}</span>,
                <span className={`num font-bold ${r.achievement >= 100 ? 'text-emerald-600' : 'text-ink-700'}`}>
                  {r.target ? `${r.achievement}%` : '—'}
                </span>,
                <span className={`num ${r.pending ? 'font-bold text-amber-600' : ''}`}>{r.pending ? inr(r.pending) : '—'}</span>,
                <span className="num">{r.rate}%</span>,
                <span className="num font-bold text-ink-900">{inr(r.commission)}</span>,
              ],
            }))}
            foot={[
              'Total',
              inr(salesRows.reduce((s, r) => s + r.revenue, 0)),
              salesRows.reduce((s, r) => s + r.memberships, 0),
              '', '', '', '',
              inr(salesRows.reduce((s, r) => s + r.pending, 0)),
              '',
              inr(salesRows.reduce((s, r) => s + r.commission, 0)),
            ]}
          />
          <p className="mt-3 text-xs text-ink-400">
            Commission follows the slab: 1% up to {shortInr(300000)}, 2% to {shortInr(700000)}, 3% above it.
          </p>
        </Block>
      </>
    ),

    Collections: (
      <>
        <Block title="Payment status" note="Where every rupee that was billed sits" wide>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <Stat label="Paid" value={inr(collected + membershipPaid)} tone="text-emerald-600" />
            <Stat label="Partly paid" value={invoices.filter((i) => i.paid > 0 && i.paid < i.amount).length} />
            <Stat label="Pending" value={inr(outstanding + membershipPending)} tone="text-amber-600" />
            <Stat label="Overdue" value={invoices.filter((i) => i.status === 'Overdue').length} tone="text-rose-600" />
            <Stat label="Failed" value={payments.filter((p) => p.status !== 'Success').length} />
            <Stat label="Refunded" value={inr(refunds)} />
          </div>
        </Block>

        <Block title="Payment details" note="Customer by customer, what was billed and what arrived" wide>
          <Table
            head={['Customer', 'Invoice', 'Membership', 'Sale amount', 'Received', 'Balance', 'Mode', 'Transaction', 'Date', 'Status']}
            rows={invoices.map((i) => {
              const b = bookings.find((x) => x.id === i.booking);
              const balance = Number(i.amount) - Number(i.paid);
              return {
                key: i.id,
                cells: [
                  i.customer,
                  <span className="num text-brand-700">{i.id}</span>,
                  b?.membership || '—',
                  <span className="num">{inr(i.amount)}</span>,
                  <span className="num text-emerald-600">{inr(i.paid)}</span>,
                  <span className={`num font-bold ${balance ? 'text-amber-600' : 'text-ink-400'}`}>
                    {balance ? inr(balance) : 'Settled'}
                  </span>,
                  b?.payment?.method || '—',
                  <span className="num text-ink-500">{b?.payment?.txnId || '—'}</span>,
                  <span className="num">{i.issued}</span>,
                  <Badge tone={i.status === 'Paid' ? 'green' : i.status === 'Partial' ? 'amber' : 'rose'} dot>
                    {i.status}
                  </Badge>,
                ],
              };
            })}
          />
        </Block>
      </>
    ),

    Ledger: (
      <Block
        title="Revenue ledger"
        note="Every rupee earned, gross to balance"
        wide
        action={
          <button
            className="btn-ghost btn-sm"
            onClick={() =>
              exportAs('smira-club-revenue-ledger', ledger, [
                { key: 'date', header: 'Date' },
                { key: 'customer', header: 'Customer' },
                { key: 'source', header: 'Source' },
                { key: 'invoice', header: 'Invoice' },
                { key: 'gross', header: 'Gross' },
                { key: 'discount', header: 'Discount' },
                { key: 'tax', header: 'Tax' },
                { key: 'net', header: 'Net' },
                { key: 'paid', header: 'Paid' },
                { key: 'status', header: 'Status' },
              ])
            }
          >
            <Download size={14} /> Export
          </button>
        }
      >
        <Table
          head={['Date', 'Customer', 'Source', 'Invoice', 'Gross', 'Discount', 'Tax', 'Net', 'Paid', 'Balance', 'Status']}
          rows={ledger.map((l) => ({
            key: l.key,
            cells: [
              <span className="num">{l.date}</span>,
              l.customer,
              l.source,
              <span className="num text-brand-700">{l.invoice}</span>,
              <span className="num">{inr(l.gross)}</span>,
              <span className="num text-emerald-600">{l.discount ? `− ${inr(l.discount)}` : '—'}</span>,
              <span className="num">{l.tax ? inr(l.tax) : '—'}</span>,
              <span className="num font-bold text-ink-900">{inr(l.net)}</span>,
              <span className="num">{inr(l.paid)}</span>,
              <span className={`num font-bold ${l.net - l.paid ? 'text-amber-600' : 'text-ink-400'}`}>
                {l.net - l.paid ? inr(l.net - l.paid) : '—'}
              </span>,
              <Badge tone={l.status === 'Paid' ? 'green' : l.status === 'Partial' ? 'amber' : 'rose'}>{l.status}</Badge>,
            ],
          }))}
          foot={[
            'Total', '', '', '',
            inr(ledger.reduce((s, l) => s + l.gross, 0)),
            inr(ledger.reduce((s, l) => s + l.discount, 0)),
            inr(ledger.reduce((s, l) => s + l.tax, 0)),
            inr(ledger.reduce((s, l) => s + l.net, 0)),
            inr(ledger.reduce((s, l) => s + l.paid, 0)),
            inr(ledger.reduce((s, l) => s + (l.net - l.paid), 0)),
            '',
          ]}
        />
      </Block>
    ),

    Membership: (
      <Block title="Revenue by membership" note="What each plan actually earns" wide>
        <Table
          head={['Plan', 'Units sold', 'Gross sales', 'Discounts', 'Net revenue', 'Average price', 'Collected', 'Outstanding', 'Renewal revenue']}
          rows={memberships.map((p) => {
            const mine = memberSignups.filter((m) => m.planId === p.id);
            const gross = mine.reduce((s, m) => s + Number(m.amount || 0), 0);
            const paid = mine.reduce((s, m) => s + Number(m.paid || 0), 0);
            const renewals = mine.filter((m) => m.renewal?.stage === 'Renewed').reduce((s, m) => s + Number(m.amount || 0), 0);
            return {
              key: p.id,
              cells: [
                p.name,
                <span className="num">{mine.length}</span>,
                <span className="num">{inr(gross)}</span>,
                <span className="num">—</span>,
                <span className="num font-bold text-brand-700">{inr(gross)}</span>,
                <span className="num">{mine.length ? inr(Math.round(gross / mine.length)) : '—'}</span>,
                <span className="num text-emerald-600">{inr(paid)}</span>,
                <span className={`num ${gross - paid ? 'font-bold text-amber-600' : ''}`}>
                  {gross - paid ? inr(gross - paid) : '—'}
                </span>,
                <span className="num">{renewals ? inr(renewals) : '—'}</span>,
              ],
            };
          })}
          foot={[
            'Total',
            memberSignups.length,
            inr(membershipGross),
            '',
            inr(membershipGross),
            '',
            inr(membershipPaid),
            inr(membershipPending),
            '',
          ]}
        />
      </Block>
    ),

    Customers: (
      <Block title="Revenue by customer" note="What each member is worth, and what comes next" wide>
        <Table
          head={['Customer', 'Total purchases', 'Membership', 'Bookings', 'Referrals', 'Outstanding', 'Lifetime value', 'Last transaction', 'Next renewal']}
          rows={customers.map((c) => {
            const plan = memberSignups.find((m) => m.id === c.membership);
            const theirBookings = bookings.filter((b) => b.customer === c.name);
            const due = theirBookings.reduce((s, b) => s + Math.max(0, Number(b.amount || 0) - Number(b.paid || 0)), 0);
            const ltv = Number(c.spend || 0) + Number(plan?.paid || 0);
            return {
              key: c.id,
              cells: [
                <span className="flex items-center gap-2.5">
                  <Avatar name={c.name} size="sm" /> {c.name}
                </span>,
                <span className="num">{inr(c.spend || 0)}</span>,
                plan ? plan.plan : '—',
                <span className="num">{theirBookings.length}</span>,
                <span className="num">{c.referral?.converted ?? 0}</span>,
                <span className={`num ${due ? 'font-bold text-amber-600' : ''}`}>{due ? inr(due) : '—'}</span>,
                <span className="num font-bold text-brand-700">{inr(ltv)}</span>,
                <span className="num">{c.lastBooking || '—'}</span>,
                <span className="num">{plan?.expiresOn || '—'}</span>,
              ],
            };
          })}
        />
      </Block>
    ),

    Forecast: (
      <Block title="What is likely to come in" note="Today's revenue, plus what the pipeline should turn into" wide>
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Revenue so far" value={inr(totalRevenue)} tone="text-brand-700" />
          <Stat label="Pipeline" value={inr(pipeline)} hint={`${openLeads.length} open leads`} />
          <Stat label="Weighted pipeline" value={inr(Math.round(weighted))} hint="by the stage each sits at" />
          <Stat label="Expected collections" value={inr(expectedCollections)} hint="85% of what is owed" />
        </div>
        <div className="mt-5 rounded-xl bg-ink-900 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Forecast revenue</p>
          <p className="num mt-2 font-display text-3xl font-extrabold">{inr(forecastTotal)}</p>
          <p className="mt-1.5 text-sm text-white/60">
            {inr(totalRevenue)} earned + {inr(Math.round(weighted))} weighted pipeline + {inr(expectedCollections)} expected
            collections
          </p>
        </div>
      </Block>
    ),

    'Money in and out': (
      <>
        <Block title="Money in" note="Two streams: memberships sold, and the markup on every booking" wide>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">A · Membership selling</p>
              <ul className="mt-2">
                <Line2 label="Membership sold" value={`${memberSignups.length}`} />
                <Line2 label="Gross membership price" value={inr(membershipGross)} />
                <Line2 label="Payment received" value={inr(membershipPaid)} tone="text-emerald-600" />
                <Line2 label="Pending payment" value={inr(membershipPending)} tone="text-amber-600" />
                <Line2 label="Sales commission" value={inr(salesRows.reduce((s, r) => s + r.commission, 0))} />
                <Line2
                  label="Net membership contribution"
                  value={inr(membershipPaid - salesRows.reduce((s, r) => s + r.commission, 0))}
                  bold
                  tone="text-brand-700"
                />
              </ul>
            </div>

            <div className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">B · Booking markup</p>
              <ul className="mt-2">
                <Line2 label="Booking value" value={inr(bookingValue)} />
                <Line2 label="Partner or hotel cost" value={inr(partnerCost)} tone="text-rose-600" />
                <Line2 label="Markup" value={inr(markup)} tone="text-emerald-600" />
                <Line2 label="Taxes billed" value={inr(bookings.reduce((s, b) => s + Number(b.charges?.taxes || 0), 0))} />
                <Line2 label="Payment gateway charges" value={inr(expenses.business.find((x) => x.label === 'Payment gateway charges')?.amount || 0)} tone="text-rose-600" />
                <Line2
                  label="Net booking profit"
                  value={inr(markup - (expenses.business.find((x) => x.label === 'Payment gateway charges')?.amount || 0))}
                  bold
                  tone="text-brand-700"
                />
              </ul>
              <p className="mt-3 rounded-lg bg-surface-soft px-3 py-2 text-xs text-ink-600">
                A booking works like this: hotel costs ₹8,000, the customer pays ₹10,000, so ₹2,000 is ours.
              </p>
            </div>
          </div>
        </Block>

        <Block title="Money out" note="Everything the agency pays for" wide>
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ['Office expenses', expenses.office, officeCost],
              ['Staff payments', expenses.staff, staffCost],
              ['Business expenses', expenses.business, businessCost],
            ].map(([title, list, total]) => (
              <div key={title} className="rounded-xl border border-ink-900/[0.07] p-4">
                <p className="eyebrow">{title}</p>
                <ul className="mt-2">
                  {list.map((x) => (
                    <Line2 key={x.label} label={x.label} value={inr(x.amount)} />
                  ))}
                  <Line2 label="Total" value={inr(total)} bold tone="text-rose-600" />
                </ul>
              </div>
            ))}
          </div>
        </Block>
      </>
    ),

    'Profit and loss': (
      <>
        <Block title="Profit and loss" note="Revenue down to what the company actually keeps" wide>
          <div className="grid gap-5 lg:grid-cols-2">
            <ul>
              <p className="eyebrow mb-1">Revenue</p>
              <Line2 label="Membership" value={inr(membershipPaid)} />
              <Line2 label="Booking markup" value={inr(markup)} />
              <Line2 label="Other income" value={inr(0)} />
              <Line2 label="Total revenue" value={inr(netRevenue)} bold tone="text-brand-700" />

              <p className="eyebrow mb-1 mt-5">Direct costs</p>
              <Line2 label="Booking partner costs" value={inr(expenses.business.find((x) => x.label === 'Partner payments')?.amount || 0)} />
              <Line2 label="Payment charges" value={inr(expenses.business.find((x) => x.label === 'Payment gateway charges')?.amount || 0)} />
              <Line2 label="Sales commissions" value={inr(expenses.staff.find((x) => x.label === 'Sales commission')?.amount || 0)} />
              <Line2
                label="Gross profit"
                value={inr(
                  netRevenue -
                    (expenses.business.find((x) => x.label === 'Partner payments')?.amount || 0) -
                    (expenses.business.find((x) => x.label === 'Payment gateway charges')?.amount || 0) -
                    (expenses.staff.find((x) => x.label === 'Sales commission')?.amount || 0)
                )}
                bold
                tone="text-emerald-600"
              />
            </ul>

            <ul>
              <p className="eyebrow mb-1">Operating expenses</p>
              <Line2 label="Salaries" value={inr(expenses.staff.find((x) => x.label === 'Salaries')?.amount || 0)} />
              <Line2 label="Office" value={inr(officeCost - marketing)} />
              <Line2 label="Marketing" value={inr(marketing)} />
              <Line2 label="Other staff payments" value={inr(staffCost - (expenses.staff.find((x) => x.label === 'Salaries')?.amount || 0))} />
              <Line2 label="Total expenses" value={inr(totalExpenses)} bold tone="text-rose-600" />

              <div className="mt-5 rounded-xl bg-ink-900 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Net company profit</p>
                <p className={`num mt-1.5 font-display text-3xl font-extrabold ${profit >= 0 ? '' : 'text-rose-300'}`}>
                  {inr(profit)}
                </p>
                <p className="mt-1 text-sm text-white/60">Profit margin {margin}%</p>
              </div>
            </ul>
          </div>
        </Block>

        <Block title="Profit by business" note="Memberships against bookings">
          <Table
            head={['Business', 'Revenue', 'Cost', 'Profit', 'Margin']}
            rows={[
              {
                key: 'membership',
                cells: [
                  'Membership',
                  <span className="num">{inr(membershipPaid)}</span>,
                  <span className="num">{inr(expenses.staff.find((x) => x.label === 'Sales commission')?.amount || 0)}</span>,
                  <span className="num font-bold text-emerald-600">
                    {inr(membershipPaid - (expenses.staff.find((x) => x.label === 'Sales commission')?.amount || 0))}
                  </span>,
                  <span className="num">
                    {membershipPaid
                      ? `${Math.round(((membershipPaid - (expenses.staff.find((x) => x.label === 'Sales commission')?.amount || 0)) / membershipPaid) * 100)}%`
                      : '—'}
                  </span>,
                ],
              },
              {
                key: 'booking',
                cells: [
                  'Booking',
                  <span className="num">{inr(bookingValue)}</span>,
                  <span className="num">{inr(partnerCost)}</span>,
                  <span className="num font-bold text-emerald-600">{inr(markup)}</span>,
                  <span className="num">{bookingValue ? `${Math.round((markup / bookingValue) * 100)}%` : '—'}</span>,
                ],
              },
            ]}
          />
        </Block>

        <Block title="Cash flow" note="What actually moved through the bank">
          <ul>
            <Line2 label="Opening cash" value={inr(openingCash)} />
            <p className="eyebrow mb-1 mt-3">Cash in</p>
            <Line2 label="Membership payments received" value={inr(membershipPaid)} />
            <Line2 label="Booking payments received" value={inr(collected)} />
            <p className="eyebrow mb-1 mt-3">Cash out</p>
            <Line2 label="Salaries paid" value={inr(staffCost)} tone="text-rose-600" />
            <Line2 label="Vendor and partner payments" value={inr(businessCost)} tone="text-rose-600" />
            <Line2 label="Office and marketing" value={inr(officeCost)} tone="text-rose-600" />
            <Line2 label="Closing cash" value={inr(closingCash)} bold tone={closingCash >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
          </ul>
        </Block>

        <Block title="Staff cost" note="What the desk costs against what it earns">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Total staff cost" value={inr(staffCost)} tone="text-rose-600" />
            <Stat label="Revenue per employee" value={team.length ? inr(Math.round(netRevenue / team.length)) : '—'} />
            <Stat
              label="Staff cost ratio"
              value={`${staffRatio}%`}
              hint="of revenue"
              tone={staffRatio > 50 ? 'text-rose-600' : 'text-ink-900'}
            />
          </div>
        </Block>
      </>
    ),

    Alerts: (
      <Block title="Revenue alerts" note="What the desk should act on right now" wide>
        <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
          {alerts.map((a) => (
            <li key={a.key} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  a.level === 'critical'
                    ? 'bg-rose-100 text-rose-700'
                    : a.level === 'positive'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {a.level === 'positive' ? <TrendingUp size={15} /> : <AlertTriangle size={15} />}
              </span>
              <span className="min-w-0 flex-1 text-sm text-ink-800">{a.text}</span>
              <Badge tone={a.level === 'critical' ? 'rose' : a.level === 'positive' ? 'green' : 'amber'}>
                {a.level}
              </Badge>
            </li>
          ))}
          {alerts.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-ink-500">Nothing needs attention.</li>
          )}
        </ul>
      </Block>
    ),

    Reports: (
      <Block
        title="Revenue reports"
        note="Pull any of these for the period on screen"
        wide
        action={
          <div className="flex gap-1.5">
            <button className="btn-ghost btn-sm" onClick={() => exportAs('smira-club-revenue-ledger', ledger, [{ key: 'date', header: 'Date' }, { key: 'customer', header: 'Customer' }, { key: 'net', header: 'Net' }, { key: 'paid', header: 'Paid' }])}>
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button className="btn-ghost btn-sm" onClick={printPdf}>
              <FileText size={14} /> PDF
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          {revenueReports.map((r) => (
            <button key={r} className="chip text-ink-600 hover:text-ink-900" onClick={() => toast(`${r} report ready`)}>
              <ArrowRight size={13} /> {r}
            </button>
          ))}
        </div>
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="Revenue" subtitle={`Money in, money out and what is left · ${range.toLowerCase()}`}>
        <button className="btn-ghost" onClick={() => setSection('Reports')}>
          <FileSpreadsheet size={16} /> Reports
        </button>
        <button className="btn-primary" onClick={printPdf}>
          <Download size={16} /> Download PDF
        </button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
              section === s
                ? 'bg-ink-900 text-white shadow-sm'
                : 'bg-white text-ink-600 ring-1 ring-ink-900/[0.07] hover:text-ink-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">{body[section]}</div>
    </>
  );
}
