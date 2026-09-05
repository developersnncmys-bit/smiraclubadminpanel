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
  Search,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { downloadCsv } from '../lib/csv.js';
import { daysUntil } from '../lib/membership.js';
import { inr, shortInr, stageProbability, salesTrend } from '../data/mockData.js';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import {
  monthlyRevenue,
  expenses,
  openingCash,
  branches,
  forecast,
  revenueReports,
  previousYears,
  incentivePlan,
  revenueAlertKinds,
} from '../data/revenueData.js';

const SECTIONS = [
  'Overview',
  'Sources',
  'Sales team',
  'Branch and team',
  'Commission',
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
  const [compareBy, setCompareBy] = useState('Branch');
  const [cut, setCut] = useState({
    period: 'All', branch: 'All', seller: 'All', plan: 'All',
    source: 'All', status: 'All', text: '', min: '', max: '',
  });

  // -- Money in ---------------------------------------------------------------
  const membershipGross = memberSignups.reduce((s, m) => s + Number(m.amount || 0), 0);
  const membershipPaid = memberSignups.reduce((s, m) => s + Number(m.paid || 0), 0);
  const membershipPending = Math.max(0, membershipGross - membershipPaid);

  const bookingValue = bookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const partnerCost = bookings.reduce((s, b) => s + Number(b.vendorContact?.payable || 0), 0);
  const markup = Math.max(0, bookingValue - partnerCost);

  const membershipDiscount = memberSignups.reduce((s2, m) => {
    const plan = memberships.find((x) => x.id === m.planId);
    return s2 + Math.max(0, Number(plan?.price || 0) - Number(m.amount || 0));
  }, 0);
  const membershipRefunds = memberSignups.reduce((s2, m) => s2 + Number(m.refund || 0), 0);
  const bookingDiscount = bookings.reduce(
    (s2, b) => s2 + Number(b.charges?.membershipDiscount || 0) + Number(b.charges?.offerDiscount || 0),
    0
  );

  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const outstanding = invoices.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paid || 0)), 0);
  const refunds = 0;

  const totalRevenue = membershipPaid + markup;
  const target = team.reduce((s, m) => s + Number(m.target || 0), 0);
  const achievement = target ? Math.round((totalRevenue / target) * 100) : 0;
  const netRevenue = totalRevenue - refunds;
  const perCustomer = customers.length ? Math.round(totalRevenue / customers.length) : 0;

  /** Records carry their dates as text, so read the day off the front. */
  const dayOf = (value) => {
    const d = new Date(String(value || '').replace(/,.*$/, ''));
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const daysAgo = (value) => {
    const d = dayOf(value);
    if (!d) return null;
    const now = new Date();
    d.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.round((now - d) / 86400000);
  };
  const todayRevenue =
    payments.filter((x) => daysAgo(x.date) === 0).reduce((s2, x) => s2 + Number(x.amount || 0), 0) +
    memberSignups.filter((m) => daysAgo(m.startedOn) === 0).reduce((s2, m) => s2 + Number(m.paid || 0), 0);

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
  const line = (group, label) => Number(expenses[group].find((x) => x.label === label)?.amount || 0);
  const marketing = line('office', 'Marketing');
  const technology = line('office', 'Software and subscriptions') + line('office', 'Internet');
  const administration =
    line('office', 'Office supplies') + line('office', 'Telephone') + line('office', 'Maintenance');
  const officeOther = officeCost - marketing - technology - administration;
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
    const theirBookings = bookings.filter((b) => b.owner === first);
    const rate = revenue > 700000 ? 3 : revenue > 300000 ? 2 : 1;
    const sameMonth = (value) => {
      const d = dayOf(value);
      const now = new Date();
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    const today =
      theirMemberships.filter((x) => daysAgo(x.startedOn) === 0).reduce((s2, x) => s2 + Number(x.paid || 0), 0) +
      theirBookings.filter((b) => daysAgo(b.created) === 0).reduce((s2, b) => s2 + Number(b.paid || 0), 0);
    const month =
      theirMemberships.filter((x) => sameMonth(x.startedOn || x.received)).reduce((s2, x) => s2 + Number(x.paid || 0), 0) +
      theirBookings.filter((b) => sameMonth(b.created)).reduce((s2, b) => s2 + Number(b.paid || 0), 0);
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
      today,
      month,
      cancelled: theirBookings
        .filter((b) => b.status === 'Cancelled')
        .reduce((s2, b) => s2 + Number(b.amount || 0), 0),
      refund: theirBookings.reduce((s2, b) => s2 + Number(b.refund || 0), 0),
      rate,
      commission: Math.round((revenue * rate) / 100),
    };
  });

  const ranking = [...salesRows].sort((a, b) => b.revenue - a.revenue).map((r) => r.key);

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
        seller: b?.owner || '—',
        branch: customers.find((c) => c.name === i.customer)?.city || '—',
        plan: b?.membership || '—',
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
        seller: m.expert || '—',
        branch: m.branch || '—',
        plan: m.plan,
        gross: Number(m.amount),
        discount: 0,
        tax: 0,
        net: Number(m.amount),
        paid: Number(m.paid),
        status: Number(m.paid) >= Number(m.amount) ? 'Paid' : Number(m.paid) ? 'Partial' : 'Pending',
      })),
  ];

  /** The ledger, cut the nine ways the sheet asks for. */
  const ledgerList = (key) => [...new Set(ledger.map((l) => l[key]).filter((v) => v && v !== '—'))];
  const shownLedger = ledger.filter((l) => {
    if (cut.branch !== 'All' && l.branch !== cut.branch) return false;
    if (cut.seller !== 'All' && l.seller !== cut.seller) return false;
    if (cut.plan !== 'All' && l.plan !== cut.plan) return false;
    if (cut.source !== 'All' && l.source !== cut.source) return false;
    if (cut.status !== 'All' && l.status !== cut.status) return false;
    if (cut.min && l.net < Number(cut.min)) return false;
    if (cut.max && l.net > Number(cut.max)) return false;
    if (cut.period !== 'All') {
      const d = daysAgo(l.date);
      if (d == null || d < 0 || d > Number(cut.period)) return false;
    }
    const q = cut.text.trim().toLowerCase();
    if (q && ![l.customer, l.invoice].some((v) => String(v || '').toLowerCase().includes(q))) return false;
    return true;
  });

  // -- Branch, manager, team or one person ----------------------------------
  const groupsFor = (mode) => {
    if (mode === 'Branch') {
      return branches.map((b) => ({
        key: b.name,
        label: b.name,
        note: b.manager,
        members: team.filter((m) => m.branch === b.name),
        target: Number(b.target || 0),
      }));
    }
    if (mode === 'Manager') {
      return [...new Set(team.map((m) => m.manager).filter((x) => x && x !== '—'))].map((mg) => ({
        key: mg,
        label: mg,
        note: `${team.filter((m) => m.manager === mg).length} reporting`,
        members: team.filter((m) => m.manager === mg),
      }));
    }
    if (mode === 'Team') {
      return [...new Set(team.map((m) => m.department).filter(Boolean))].map((d) => ({
        key: d,
        label: d,
        note: `${team.filter((m) => m.department === d).length} people`,
        members: team.filter((m) => m.department === d),
      }));
    }
    return team.map((m) => ({ key: m.id, label: m.name, note: m.role, members: [m] }));
  };

  const compareRows = groupsFor(compareBy).map((g) => {
    const firsts = g.members.map((m) => m.name.split(' ')[0]);
    const mine = enquiries.filter((e) => firsts.includes(e.owner));
    const won = mine.filter((e) => e.status === 'Won');
    const theirMemberships = memberSignups.filter((m) => firsts.includes(m.expert));
    const revenue = g.members.reduce((s2, m) => s2 + Number(m.revenue || 0), 0);
    const target = g.target ?? g.members.reduce((s2, m) => s2 + Number(m.target || 0), 0);
    return {
      key: g.key,
      label: g.label,
      note: g.note,
      revenue,
      target,
      achievement: target ? Math.round((revenue / target) * 100) : 0,
      customers: new Set([...won.map((e) => e.name), ...theirMemberships.map((m) => m.name)]).size,
      conversion: mine.length ? Math.round((won.length / mine.length) * 100) : 0,
      ticket: won.length ? Math.round(won.reduce((s2, e) => s2 + Number(e.budget || 0), 0) / won.length) : 0,
      collections: theirMemberships.reduce((s2, m) => s2 + Number(m.paid || 0), 0),
      outstanding: theirMemberships.reduce((s2, m) => s2 + Math.max(0, Number(m.amount || 0) - Number(m.paid || 0)), 0),
      productivity: g.members.length
        ? Math.round(g.members.reduce((s2, m) => s2 + Number(m.productivity || 0), 0) / g.members.length)
        : 0,
    };
  });

  // -- Commission, incentive and the override a manager takes ---------------
  const commissionRows = salesRows.map((r) => {
    const member = team.find((m) => m.id === r.key);
    const reports = team.filter((m) => m.manager === member?.name);
    const overRun = Math.max(0, r.revenue - r.target);
    return {
      ...r,
      incentive: r.achievement >= 100 ? Math.round((overRun * incentivePlan.incentiveRate) / 100) : 0,
      override: Math.round(
        (reports.reduce((s2, m) => s2 + Number(m.revenue || 0), 0) * incentivePlan.overrideRate) / 100
      ),
      commissionPaid: Math.round(((r.revenue - r.pending) * r.rate) / 100),
      commissionDue: Math.round((r.pending * r.rate) / 100),
    };
  });

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
    ...payments
      .filter((x) => x.status && x.status !== 'Success')
      .map((x) => ({ key: `fail-${x.id}`, level: 'critical', text: `${x.customer}'s payment of ${inr(x.amount)} did not go through` })),
    ...bookings
      .filter((b) => Number(b.refund || 0) > 0)
      .map((b) => ({ key: `ref-${b.id}`, level: 'warning', text: `${b.customer} has asked for ${inr(b.refund)} back on ${b.id}` })),
    ...memberSignups
      .filter((m) => {
        const plan = memberships.find((x) => x.id === m.planId);
        const top = memberships.reduce((a, b) => (Number(b.price || 0) > Number(a.price || 0) ? b : a), memberships[0]);
        const spend = Number(customers.find((c) => c.name === m.name)?.spend || 0);
        return plan && top && plan.id !== top.id && spend >= 200000;
      })
      .map((m) => ({
        key: `up-${m.id}`,
        level: 'positive',
        text: `${m.name} spends enough to be worth moving off ${m.plan}`,
      })),
    ...(achievement >= 100 ? [{ key: 'target', level: 'positive', text: `Target beaten — ${achievement}% of ${inr(target)}` }] : []),
    ...(growth < 0 ? [{ key: 'down', level: 'critical', text: `Revenue is ${Math.abs(growth)}% below last month` }] : []),
    ...customers
      .filter((c) => Number(c.spend || 0) >= 300000)
      .map((c) => ({ key: `vip-${c.id}`, level: 'positive', text: `${c.name} has spent ${inr(c.spend)} — worth a call` })),
  ];

  /** The same money at four grains, the way the sheet's graph asks for it. */
  const chart = (() => {
    if (grain === 'Daily') return salesTrend.map((d) => ({ label: `${d.day}`, revenue: d.revenue, target: d.target }));
    if (grain === 'Weekly') {
      const weeks = [];
      for (let i = 0; i < salesTrend.length; i += 7) {
        const slice = salesTrend.slice(i, i + 7);
        weeks.push({
          label: `W${weeks.length + 1}`,
          revenue: slice.reduce((s2, d) => s2 + Number(d.revenue || 0), 0),
          target: slice.reduce((s2, d) => s2 + Number(d.target || 0), 0),
        });
      }
      return weeks;
    }
    if (grain === 'Yearly') {
      return [
        ...previousYears.map((y) => ({ label: y.year, revenue: y.revenue, target: y.target })),
        {
          label: 'This year',
          revenue: monthlyRevenue.reduce((s2, m) => s2 + monthTotal(m), 0),
          target: monthlyRevenue.reduce((s2, m) => s2 + Number(m.target || 0), 0),
        },
      ];
    }
    return monthlyRevenue.map((m) => ({ label: m.month, revenue: monthTotal(m), target: m.target }));
  })();

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
          <section className="card relative overflow-hidden p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Total revenue</p>
              <p className="num mt-2 font-display text-4xl font-extrabold leading-none text-ink-900">{inr(totalRevenue)}</p>
              <p className="mt-1.5 text-sm text-ink-500">
                {inr(membershipPaid)} memberships · {inr(markup)} booking markup
              </p>
              <div className="mt-5">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  <span>Target {shortInr(target)}</span>
                  <span className="num">{achievement}%</span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full ${achievement >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(achievement, 100)}%` }}
                  />
                </div>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-sm">
                {growth >= 0 ? <TrendingUp size={14} className="text-emerald-600" /> : <TrendingDown size={14} className="text-rose-600" />}
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
        <div className="card grid divide-y divide-ink-900/[0.07] sm:grid-cols-2 sm:divide-y-0 xl:col-span-2 xl:grid-cols-4 2xl:grid-cols-7 sm:[&>*:not(:first-child)]:border-l sm:[&>*]:border-ink-900/[0.07]">
          {[
            { label: 'Today', value: inr(todayRevenue), hint: todayRevenue ? 'banked today' : 'nothing banked yet' },
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
              {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((g) => (
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

        <Block title="Revenue by product" note="Every plan and every kind of booking, and what is kept on it" wide>
          <Table
            head={['Product', 'Units', 'Value', 'Cost', 'Margin', 'Margin %']}
            rows={[
              ...memberships.map((plan) => {
                const mine = memberSignups.filter((m) => m.planId === plan.id);
                const value = mine.reduce((s2, m) => s2 + Number(m.paid || 0), 0);
                return {
                  key: plan.id,
                  cells: [
                    plan.name,
                    <span className="num">{mine.length}</span>,
                    <span className="num">{value ? inr(value) : '—'}</span>,
                    <span className="num text-ink-400">—</span>,
                    <span className="num font-bold text-emerald-600">{value ? inr(value) : '—'}</span>,
                    <span className="num">{value ? '100%' : '—'}</span>,
                  ],
                };
              }),
              ...[...new Set(bookings.map((b) => b.bookingType || 'Package'))].map((kind) => {
                const mine = bookings.filter((b) => (b.bookingType || 'Package') === kind);
                const value = mine.reduce((s2, b) => s2 + Number(b.amount || 0), 0);
                const cost = mine.reduce((s2, b) => s2 + Number(b.vendorContact?.payable || 0), 0);
                return {
                  key: `booking-${kind}`,
                  cells: [
                    `${kind} bookings`,
                    <span className="num">{mine.length}</span>,
                    <span className="num">{inr(value)}</span>,
                    <span className="num text-rose-600">{inr(cost)}</span>,
                    <span className="num font-bold text-emerald-600">{inr(Math.max(0, value - cost))}</span>,
                    <span className="num">{value ? `${Math.round(((value - cost) / value) * 100)}%` : '—'}</span>,
                  ],
                };
              }),
            ]}
          />
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
            head={['Rank', 'Consultant', "Today's sales", 'This month', 'Revenue', 'Memberships', 'Average ticket', 'Conversion', 'Target', 'Achieved', 'Pending', 'Cancelled', 'Refunds', 'Slab', 'Commission']}
            rows={salesRows.map((r) => ({
              key: r.key,
              cells: [
                <span className="num font-extrabold text-ink-900">#{ranking.indexOf(r.key) + 1}</span>,
                <span className="flex items-center gap-2.5">
                  <Avatar name={r.name} size="sm" /> {r.name}
                </span>,
                <span className="num">{r.today ? inr(r.today) : '—'}</span>,
                <span className="num">{r.month ? inr(r.month) : '—'}</span>,
                <span className="num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</span>,
                <span className="num">{r.memberships}</span>,
                <span className="num">{r.ticket ? inr(r.ticket) : '—'}</span>,
                <span className="num">{r.conversion}%</span>,
                <span className="num">{r.target ? shortInr(r.target) : '—'}</span>,
                <span className={`num font-bold ${r.achievement >= 100 ? 'text-emerald-600' : 'text-ink-700'}`}>
                  {r.target ? `${r.achievement}%` : '—'}
                </span>,
                <span className={`num ${r.pending ? 'font-bold text-amber-600' : ''}`}>{r.pending ? inr(r.pending) : '—'}</span>,
                <span className={`num ${r.cancelled ? 'text-rose-600' : 'text-ink-400'}`}>{r.cancelled ? inr(r.cancelled) : '—'}</span>,
                <span className={`num ${r.refund ? 'text-rose-600' : 'text-ink-400'}`}>{r.refund ? inr(r.refund) : '—'}</span>,
                <span className="num">{r.rate}%</span>,
                <span className="num font-bold text-ink-900">{inr(r.commission)}</span>,
              ],
            }))}
            foot={[
              '',
              'Total',
              inr(salesRows.reduce((s, r) => s + r.today, 0)),
              inr(salesRows.reduce((s, r) => s + r.month, 0)),
              inr(salesRows.reduce((s, r) => s + r.revenue, 0)),
              salesRows.reduce((s, r) => s + r.memberships, 0),
              '', '', '', '',
              inr(salesRows.reduce((s, r) => s + r.pending, 0)),
              inr(salesRows.reduce((s, r) => s + r.cancelled, 0)),
              inr(salesRows.reduce((s, r) => s + r.refund, 0)),
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

    'Branch and team': (
      <Block
        title="Compare the desks"
        note="Branch, manager, team or one person — the same nine numbers"
        wide
        action={
          <div className="flex flex-wrap gap-1.5">
            {['Branch', 'Manager', 'Team', 'Individual'].map((mode) => (
              <button
                key={mode}
                onClick={() => setCompareBy(mode)}
                className={`chip ${compareBy === mode ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        }
      >
        <Table
          head={[compareBy, 'Revenue', 'Target', 'Achievement', 'Customers', 'Conversion', 'Average ticket', 'Collections', 'Outstanding', 'Productivity']}
          empty="Nothing to compare at this level."
          rows={compareRows.map((r) => ({
            key: r.key,
            cells: [
              <span className="block">
                <span className="block font-bold text-ink-900">{r.label}</span>
                <span className="block text-xs font-normal text-ink-400">{r.note}</span>
              </span>,
              <span className="num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</span>,
              <span className="num">{r.target ? shortInr(r.target) : '—'}</span>,
              <span className={`num font-bold ${r.achievement >= 100 ? 'text-emerald-600' : 'text-ink-700'}`}>
                {r.target ? `${r.achievement}%` : '—'}
              </span>,
              <span className="num">{r.customers}</span>,
              <span className="num">{r.conversion}%</span>,
              <span className="num">{r.ticket ? inr(r.ticket) : '—'}</span>,
              <span className="num text-emerald-600">{r.collections ? inr(r.collections) : '—'}</span>,
              <span className={`num ${r.outstanding ? 'font-bold text-amber-600' : ''}`}>
                {r.outstanding ? inr(r.outstanding) : '—'}
              </span>,
              <span className="num">{r.productivity}%</span>,
            ],
          }))}
          foot={[
            'Total',
            inr(compareRows.reduce((s, r) => s + r.revenue, 0)),
            shortInr(compareRows.reduce((s, r) => s + r.target, 0)),
            '', '', '', '',
            inr(compareRows.reduce((s, r) => s + r.collections, 0)),
            inr(compareRows.reduce((s, r) => s + r.outstanding, 0)),
            '',
          ]}
        />
      </Block>
    ),

    Commission: (
      <Block title="Commission and incentive" note="Worked out on its own, from revenue and what has been collected" wide>
        <Table
          head={['Employee', 'Memberships sold', 'Revenue', 'Slab', 'Commission earned', 'Incentive', 'Override', 'Paid', 'Pending']}
          rows={commissionRows.map((r) => ({
            key: r.key,
            cells: [
              <span className="flex items-center gap-2.5">
                <Avatar name={r.name} size="sm" /> {r.name}
              </span>,
              <span className="num">{r.memberships}</span>,
              <span className="num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</span>,
              <span className="num">{r.rate}%</span>,
              <span className="num font-bold text-ink-900">{inr(r.commission)}</span>,
              <span className={`num ${r.incentive ? 'font-bold text-emerald-600' : 'text-ink-400'}`}>
                {r.incentive ? inr(r.incentive) : '—'}
              </span>,
              <span className={`num ${r.override ? 'text-ink-800' : 'text-ink-400'}`}>
                {r.override ? inr(r.override) : '—'}
              </span>,
              <span className="num text-emerald-600">{inr(r.commissionPaid)}</span>,
              <span className={`num ${r.commissionDue ? 'font-bold text-amber-600' : 'text-ink-400'}`}>
                {r.commissionDue ? inr(r.commissionDue) : '—'}
              </span>,
            ],
          }))}
          foot={[
            'Total',
            commissionRows.reduce((s, r) => s + r.memberships, 0),
            inr(commissionRows.reduce((s, r) => s + r.revenue, 0)),
            '',
            inr(commissionRows.reduce((s, r) => s + r.commission, 0)),
            inr(commissionRows.reduce((s, r) => s + r.incentive, 0)),
            inr(commissionRows.reduce((s, r) => s + r.override, 0)),
            inr(commissionRows.reduce((s, r) => s + r.commissionPaid, 0)),
            inr(commissionRows.reduce((s, r) => s + r.commissionDue, 0)),
          ]}
        />
        <p className="mt-3 text-xs text-ink-400">{incentivePlan.note}. Paid is commission on money already in; pending is commission on money still owed.</p>
      </Block>
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
            <Stat label="Cancelled" value={bookings.filter((b) => b.status === 'Cancelled').length} />
          </div>
        </Block>

        <Block title="Payment details" note="Customer by customer, what was billed and what arrived" wide>
          <Table
            head={['Customer', 'Invoice', 'Membership', 'Sale amount', 'Received', 'Balance', 'Mode', 'Transaction', 'Payment date', 'Due date', 'Collected by', 'Status']}
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
                  <span className={`num ${balance && daysAgo(i.due) > 0 ? 'font-bold text-rose-600' : ''}`}>{i.due || '—'}</span>,
                  b?.owner || '—',
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
        note={`${shownLedger.length} of ${ledger.length} entries · gross to balance`}
        wide
        action={
          <button
            className="btn-line btn-sm"
            onClick={() =>
              exportAs('smira-club-revenue-ledger', shownLedger, [
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
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              className="input h-9 w-48 py-0 pl-9 text-sm"
              placeholder="Customer or invoice…"
              value={cut.text}
              onChange={(e) => setCut({ ...cut, text: e.target.value })}
            />
          </div>
          {[
            ['period', 'Any date', [['0', 'Today'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['365', 'This year']]],
            ['branch', 'Every branch', ledgerList('branch').map((v) => [v, v])],
            ['seller', 'Every salesperson', ledgerList('seller').map((v) => [v, v])],
            ['plan', 'Every membership', ledgerList('plan').map((v) => [v, v])],
            ['source', 'Every source', ledgerList('source').map((v) => [v, v])],
            ['status', 'Any status', ledgerList('status').map((v) => [v, v])],
          ].map(([key, label, options]) => (
            <select
              key={key}
              className="input h-9 w-auto py-0 text-sm"
              value={cut[key]}
              onChange={(e) => setCut({ ...cut, [key]: e.target.value })}
            >
              <option value="All">{label}</option>
              {options.map(([value, text]) => (
                <option key={value} value={value}>{text}</option>
              ))}
            </select>
          ))}
          <input
            className="input h-9 w-24 py-0 text-sm"
            type="number"
            placeholder="Min ₹"
            value={cut.min}
            onChange={(e) => setCut({ ...cut, min: e.target.value })}
          />
          <input
            className="input h-9 w-24 py-0 text-sm"
            type="number"
            placeholder="Max ₹"
            value={cut.max}
            onChange={(e) => setCut({ ...cut, max: e.target.value })}
          />
        </div>

        <Table
          head={['Date', 'Customer', 'Salesperson', 'Branch', 'Source', 'Invoice', 'Gross', 'Discount', 'Tax', 'Net', 'Paid', 'Balance', 'Status']}
          empty="Nothing in the ledger matches this cut."
          rows={shownLedger.map((l) => ({
            key: l.key,
            cells: [
              <span className="num">{l.date}</span>,
              l.customer,
              l.seller,
              l.branch,
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
            'Total', '', '', '', '', '',
            inr(shownLedger.reduce((s, l) => s + l.gross, 0)),
            inr(shownLedger.reduce((s, l) => s + l.discount, 0)),
            inr(shownLedger.reduce((s, l) => s + l.tax, 0)),
            inr(shownLedger.reduce((s, l) => s + l.net, 0)),
            inr(shownLedger.reduce((s, l) => s + l.paid, 0)),
            inr(shownLedger.reduce((s, l) => s + (l.net - l.paid), 0)),
            '',
          ]}
        />
      </Block>
    ),

    Membership: (
      <Block title="Revenue by membership" note="What each plan actually earns" wide>
        <Table
          head={['Plan', 'Units sold', 'Gross sales', 'Discounts', 'Net revenue', 'Average price', 'Collected', 'Outstanding', 'Refunds', 'Renewal revenue', 'Upgrade revenue']}
          rows={memberships.map((p) => {
            const mine = memberSignups.filter((m) => m.planId === p.id);
            const gross = mine.reduce((s, m) => s + Number(m.amount || 0), 0);
            const paid = mine.reduce((s, m) => s + Number(m.paid || 0), 0);
            const renewals = mine.filter((m) => m.renewal?.stage === 'Renewed').reduce((s, m) => s + Number(m.amount || 0), 0);
            const upgrades = mine.filter((m) => m.movement === 'Upgrade').reduce((s, m) => s + Number(m.paid || 0), 0);
            const refunded = mine.reduce((s, m) => s + Number(m.refund || 0), 0);
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
                <span className={`num ${refunded ? 'text-rose-600' : 'text-ink-400'}`}>{refunded ? inr(refunded) : '—'}</span>,
                <span className="num">{renewals ? inr(renewals) : '—'}</span>,
                <span className={`num ${upgrades ? 'font-bold text-emerald-600' : 'text-ink-400'}`}>{upgrades ? inr(upgrades) : '—'}</span>,
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
            '', '', '',
          ]}
        />
      </Block>
    ),

    Customers: (
      <Block title="Revenue by customer" note="What each member is worth, and what comes next" wide>
        <Table
          head={['Customer', 'Total purchases', 'Membership', 'Bookings', 'Add-ons', 'Renewals', 'Upgrades', 'Referrals', 'Payments', 'Refunds', 'Outstanding', 'Lifetime value', 'Last transaction', 'Next renewal', 'Next expected']}
          rows={customers.map((c) => {
            const plan = memberSignups.find((m) => m.id === c.membership);
            const theirBookings = bookings.filter((b) => b.customer === c.name);
            const due = theirBookings.reduce((s, b) => s + Math.max(0, Number(b.amount || 0) - Number(b.paid || 0)), 0);
            const ltv = Number(c.spend || 0) + Number(plan?.paid || 0);
            const addOns = theirBookings.reduce(
              (s2, b) => s2 + Number(b.charges?.meals || 0) + Number(b.charges?.extra || 0),
              0
            );
            const theirPayments = payments.filter((x) => x.customer === c.name);
            const refunded = theirBookings.reduce((s2, b) => s2 + Number(b.refund || 0), 0);
            /** When they are likely to buy again, from how often they have. */
            const nextExpected = (() => {
              const last = dayOf(c.lastBooking);
              const trips = Number(c.trips || 0);
              if (!last || trips < 1) return '—';
              const gap = Math.round(365 / trips);
              const due = new Date(last.getTime() + gap * 86400000);
              return due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            })();
            return {
              key: c.id,
              cells: [
                <span className="flex items-center gap-2.5">
                  <Avatar name={c.name} size="sm" /> {c.name}
                </span>,
                <span className="num">{inr(c.spend || 0)}</span>,
                plan ? plan.plan : '—',
                <span className="num">{theirBookings.length}</span>,
                <span className={`num ${addOns ? '' : 'text-ink-400'}`}>{addOns ? inr(addOns) : '—'}</span>,
                <span className="num">{plan?.renewal?.stage === 'Renewed' ? 1 : 0}</span>,
                <span className="num">{plan?.movement === 'Upgrade' ? 1 : 0}</span>,
                <span className="num">{c.referral?.converted ?? 0}</span>,
                <span className="num">{theirPayments.length}</span>,
                <span className={`num ${refunded ? 'text-rose-600' : 'text-ink-400'}`}>{refunded ? inr(refunded) : '—'}</span>,
                <span className={`num ${due ? 'font-bold text-amber-600' : ''}`}>{due ? inr(due) : '—'}</span>,
                <span className="num font-bold text-brand-700">{inr(ltv)}</span>,
                <span className="num">{c.lastBooking || '—'}</span>,
                <span className="num">{plan?.expiresOn || '—'}</span>,
                <span className="num text-ink-500">{nextExpected}</span>,
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
        <div className="mt-5 rounded-xl bg-surface-soft p-5 ring-1 ring-ink-900/[0.05]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Forecast revenue</p>
          <p className="num mt-2 font-display text-3xl font-extrabold text-ink-900">{inr(forecastTotal)}</p>
          <p className="mt-1.5 text-sm text-ink-500">
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
                <Line2 label="Discount given" value={membershipDiscount ? `− ${inr(membershipDiscount)}` : inr(0)} />
                <Line2 label="Net membership revenue" value={inr(membershipGross - membershipDiscount)} />
                <Line2 label="Payment received" value={inr(membershipPaid)} tone="text-emerald-600" />
                <Line2 label="Pending payment" value={inr(membershipPending)} tone="text-amber-600" />
                <Line2 label="Refunds" value={membershipRefunds ? `− ${inr(membershipRefunds)}` : inr(0)} tone="text-rose-600" />
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
                <Line2 label="Discounts given" value={bookingDiscount ? `− ${inr(bookingDiscount)}` : inr(0)} />
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
              <Line2 label="Salaries" value={inr(line('staff', 'Salaries'))} />
              <Line2 label="Office" value={inr(officeOther)} />
              <Line2 label="Marketing" value={inr(marketing)} />
              <Line2 label="Technology" value={inr(technology)} />
              <Line2 label="Administration" value={inr(administration)} />
              <Line2 label="Other expenses" value={inr(staffCost - line('staff', 'Salaries'))} />
              <Line2 label="Total expenses" value={inr(totalExpenses)} bold tone="text-rose-600" />

              <div className="mt-5 rounded-xl bg-surface-soft p-4 ring-1 ring-ink-900/[0.05]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Net company profit</p>
                <p className={`num mt-1.5 font-display text-3xl font-extrabold ${profit >= 0 ? '' : 'text-rose-600'}`}>
                  {inr(profit)}
                </p>
                <p className="mt-1 text-sm text-ink-500">Profit margin {margin}%</p>
              </div>
            </ul>
          </div>
        </Block>

        <Block title="Company profit" note="Total income less total expenses, line by line" wide>
          <Table
            head={['KPI', 'Amount']}
            rows={[
              ['Membership revenue', inr(membershipPaid)],
              ['Booking markup', inr(markup)],
              ['Total revenue', inr(netRevenue)],
              ['Staff cost', inr(staffCost)],
              ['Office expenses', inr(officeCost - marketing)],
              ['Marketing expenses', inr(marketing)],
              ['Other expenses', inr(businessCost)],
              ['Total expenses', inr(totalExpenses)],
              ['Company profit', inr(profit)],
              ['Profit margin', `${margin}%`],
            ].map(([label, value]) => ({
              key: label,
              cells: [
                label,
                <span
                  className={`num font-bold ${
                    label === 'Company profit'
                      ? profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      : label.includes('expense') || label === 'Staff cost' ? 'text-rose-600' : 'text-ink-900'
                  }`}
                >
                  {value}
                </span>,
              ],
            }))}
          />
          <p className="mt-3 text-xs text-ink-400">
            Total income is membership revenue plus booking markup plus other revenue. Total expenses are staff cost,
            office, marketing, partner and vendor costs and everything else.
          </p>
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
            <Line2 label="Other collections" value={inr(0)} />
            <p className="eyebrow mb-1 mt-3">Cash out</p>
            <Line2 label="Salaries paid" value={inr(staffCost)} tone="text-rose-600" />
            <Line2 label="Vendor and partner payments" value={inr(line('business', 'Partner payments') + line('business', 'Vendor payments'))} tone="text-rose-600" />
            <Line2 label="Office expenses paid" value={inr(officeCost - marketing)} tone="text-rose-600" />
            <Line2 label="Marketing paid" value={inr(marketing)} tone="text-rose-600" />
            <Line2 label="Refunds" value={inr(line('business', 'Refunds') + membershipRefunds)} tone="text-rose-600" />
            <Line2 label="Closing cash" value={inr(closingCash)} bold tone={closingCash >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
          </ul>
        </Block>

        <Block title="Staff cost" note="What the desk costs against what it earns">
          <ul className="mb-4">
            {expenses.staff.map((x) => (
              <Line2 key={x.label} label={x.label} value={inr(x.amount)} />
            ))}
            <Line2 label="Total staff cost" value={inr(staffCost)} bold tone="text-rose-600" />
          </ul>
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
        <p className="eyebrow mt-4">What the panel watches for</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {revenueAlertKinds.map((k) => (
            <span key={k} className="chip text-ink-500">{k}</span>
          ))}
        </div>
      </Block>
    ),

    Reports: (
      <Block
        title="Revenue reports"
        note="Pull any of these for the period on screen"
        wide
        action={
          <div className="flex gap-1.5">
            <button className="btn-line btn-sm" onClick={() => exportAs('smira-club-revenue-ledger', ledger, [{ key: 'date', header: 'Date' }, { key: 'customer', header: 'Customer' }, { key: 'net', header: 'Net' }, { key: 'paid', header: 'Paid' }])}>
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button className="btn-line btn-sm" onClick={printPdf}>
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
        <button className="btn-line" onClick={() => setSection('Reports')}>
          <FileSpreadsheet size={16} /> Reports
        </button>
        <button className="btn-action" onClick={printPdf}>
          <Download size={16} /> Download PDF
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
