import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  UsersRound,
  Users,
  CalendarCheck,
  Crown,
  UserRound,
  Handshake,
  Headphones,
  PieChart,
  IndianRupee,
  Wallet,
  Zap,
  MessageCircle,
  Warehouse,
  Gift,
  Megaphone,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr, enquiryStatuses, statusTone } from '../data/mockData.js';
import { daysUntil } from '../lib/membership.js';
import { expenses as expenseBudget } from '../data/revenueData.js';
import { gateways, receivables, salary } from '../data/paymentData.js';
import { inboxStats, botSessions } from '../data/whatsappData.js';
import { rules as automationRules, history as automationHistory } from '../data/automationData.js';
import { customerRewards, referrals, rewardRules } from '../data/rewardsData.js';
import { offers } from '../data/offersData.js';
import { contractAlerts, holds } from '../data/inventoryData.js';

const PERIODS = ['Today', 'This week', 'This month', 'This year'];

/** One module's card: its own headline, its numbers, and a way in. */
function Module({ title, icon: Icon, to, tone = 'text-brand-700', note, wide, children }) {
  const navigate = useNavigate();
  return (
    <section className={`card flex flex-col p-5 ${wide ? 'xl:col-span-2' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`flex items-center gap-2 font-display text-base font-extrabold text-ink-900`}>
            <Icon size={16} className={tone} /> {title}
          </p>
          {note && <p className="mt-0.5 text-sm text-ink-500">{note}</p>}
        </div>
        <button
          onClick={() => navigate(to)}
          className="icon-btn h-8 w-8 shrink-0"
          title={`Open ${title.toLowerCase()}`}
        >
          <ArrowRight size={15} />
        </button>
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

/** Label and number, the row this page is built from. */
function Row({ label, value, tone = 'text-ink-900' }) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="truncate text-sm text-ink-600">{label}</span>
      <span className={`num shrink-0 text-sm font-bold ${tone}`}>{value}</span>
    </li>
  );
}

/** A grid of small numbers for a card that leads with counts. */
function Tiles({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {items.map((t) => (
        <div key={t.label} className="rounded-xl bg-surface-soft px-3.5 py-2.5">
          <p className={`num font-display text-lg font-extrabold ${t.tone || 'text-ink-900'}`}>{t.value}</p>
          <p className="mt-0.5 truncate text-xs font-semibold text-ink-500">{t.label}</p>
        </div>
      ))}
    </div>
  );
}

/** The funnels this page draws, as stacked bars. */
function Funnel({ steps }) {
  const top = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ul className="space-y-2">
      {steps.map((s, i) => (
        <li key={s.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-semibold text-ink-700">{s.label}</span>
            <span className="num shrink-0 text-sm">
              <b className="text-ink-900">{s.value}</b>
              {i > 0 && steps[i - 1].value > 0 && (
                <span className="ml-1.5 text-xs text-ink-500">
                  {Math.round((s.value / steps[i - 1].value) * 100)}%
                </span>
              )}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-soft">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.round((s.value / top) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The dashboard the client's sheet describes: one landing page that carries a
 * headline from every module, so management sees the whole business without
 * opening anything — and can step into any of it in one click.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    team, enquiries, bookings, memberSignups, memberships, customers,
    invoices, payments, tickets, partners, inventory, range,
  } = useApp();

  const [period, setPeriod] = useState('This month');

  // -- The money and the counts, worked out once ----------------------------
  const won = enquiries.filter((e) => e.status === 'Won');
  const openLeads = enquiries.filter((e) => !['Won', 'Lost'].includes(e.status));
  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const outstanding = invoices.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paid || 0)), 0);
  const membershipPaid = memberSignups.reduce((s, m) => s + Number(m.paid || 0), 0);
  const membershipDue = memberSignups.reduce((s, m) => s + Math.max(0, Number(m.amount || 0) - Number(m.paid || 0)), 0);
  const bookingValue = bookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const partnerCost = bookings.reduce((s, b) => s + Number(b.vendorContact?.payable || 0), 0);
  const markup = Math.max(0, bookingValue - partnerCost);
  const revenue = membershipPaid + markup;
  const target = team.reduce((s, m) => s + Number(m.target || 0), 0);

  const sum = (list) => list.reduce((s, x) => s + Number(x.amount || 0), 0);
  const officeCost = sum(expenseBudget.office);
  const staffCost = sum(expenseBudget.staff);
  const businessCost = sum(expenseBudget.business);
  const totalExpenses = officeCost + staffCost + businessCost;
  const profit = revenue - totalExpenses;

  const activeMembers = memberSignups.filter((m) => m.status === 'Active');
  const expiringSoon = memberSignups.filter((m) => { const l = daysUntil(m.expiresOn); return l != null && l >= 0 && l <= 30; });
  const pendingActivation = memberSignups.filter((m) => m.activation && m.activation.stage !== 'Activated');

  const freeInventory = inventory.reduce(
    (s, i) => s + Math.max(0, Number(i.units || 0) - Number(i.booked || 0) - Number(i.blocked || 0)),
    0
  );
  const inventoryValue = inventory.reduce(
    (s, i) => s + Math.max(0, Number(i.units || 0) - Number(i.booked || 0)) * (Number(i.baseRate || 0) + Number(i.markup || 0)),
    0
  );
  const lowStock = inventory.filter((i) => {
    const free = Number(i.units || 0) - Number(i.booked || 0) - Number(i.blocked || 0);
    return free > 0 && free <= 2;
  });
  const soldOut = inventory.filter((i) => Number(i.units || 0) - Number(i.booked || 0) - Number(i.blocked || 0) === 0);

  const openTickets = tickets.filter((t) => !['Closed', 'Customer confirmed'].includes(t.stage));
  const breached = tickets.filter((t) => t.slaState === 'Breached');
  const rated = tickets.filter((t) => t.rating != null);

  // -- What management should act on before anything else --------------------
  const alerts = [
    ...(outstanding ? [{ level: 'critical', text: `${inr(outstanding)} outstanding on bookings`, to: '/payment' }] : []),
    ...(breached.length ? [{ level: 'critical', text: `${breached.length} complaint past its SLA`, to: '/support' }] : []),
    ...(soldOut.length ? [{ level: 'warning', text: `${soldOut.length} inventory items sold out`, to: '/inventory' }] : []),
    ...(expiringSoon.length ? [{ level: 'warning', text: `${expiringSoon.length} membership expiring within 30 days`, to: '/customers' }] : []),
    ...(pendingActivation.length ? [{ level: 'warning', text: `${pendingActivation.length} membership waiting on activation`, to: '/customers' }] : []),
    ...(holds.length ? [{ level: 'warning', text: `${holds.length} inventory holds about to expire`, to: '/inventory' }] : []),
    ...(automationHistory.filter((h) => h.status === 'Failed').length
      ? [{ level: 'warning', text: `${automationHistory.filter((h) => h.status === 'Failed').length} automation job failed`, to: '/automation' }]
      : []),
    ...(inboxStats.unanswered ? [{ level: 'critical', text: `${inboxStats.unanswered} WhatsApp chats unanswered`, to: '/whatsapp' }] : []),
  ];

  const online = team.filter((m) => m.live === 'Online').length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`The whole business on one page · ${range.toLowerCase()}`}>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`chip ${period === p ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* The headline, then what needs a person */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card relative overflow-hidden bg-ink-900 p-5 text-white">
          <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Revenue {period.toLowerCase()}</p>
            <p className="num mt-2 font-display text-4xl font-extrabold leading-none">{inr(revenue)}</p>
            <p className="mt-1.5 text-sm text-white/60">
              {inr(membershipPaid)} memberships · {inr(markup)} booking markup
            </p>
            <div className="mt-5">
              <p className="flex items-baseline justify-between text-xs font-semibold text-white/60">
                <span>Target {shortInr(target)}</span>
                <span className="num text-white">{target ? Math.round((revenue / target) * 100) : 0}%</span>
              </p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-brand-400"
                  style={{ width: `${Math.min(100, target ? Math.round((revenue / target) * 100) : 0)}%` }}
                />
              </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
              <TrendingUp size={14} className="text-emerald-300" />
              {inr(profit)} left after everything out
            </p>
          </div>
        </section>

        <section className="card p-5">
          <p className="eyebrow">Today across the desk</p>
          <ul className="mt-3 space-y-2.5">
            {[
              { label: 'Team online', value: `${online} of ${team.length}`, tone: 'bg-emerald-500' },
              { label: 'Open leads', value: openLeads.length, tone: 'bg-sky-500' },
              { label: 'Trips in hand', value: bookings.length, tone: 'bg-violet-500' },
              { label: 'Active members', value: activeMembers.length, tone: 'bg-amber-500' },
            ].map((r) => (
              <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-2.5">
                <span className={`h-8 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                <span className="num font-display text-lg font-extrabold text-ink-900">{r.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <p className="eyebrow">Needs a person</p>
          <ul className="mt-3 space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <li key={a.text}>
                <button
                  onClick={() => navigate(a.to)}
                  className="flex w-full items-center gap-2.5 rounded-xl bg-surface-soft px-3.5 py-2.5 text-left transition hover:bg-surface-soft/70"
                >
                  <AlertTriangle
                    size={15}
                    className={`shrink-0 ${a.level === 'critical' ? 'text-rose-500' : 'text-amber-500'}`}
                  />
                  <span className="min-w-0 flex-1 text-sm text-ink-800">{a.text}</span>
                  <ArrowRight size={14} className="shrink-0 text-ink-300" />
                </button>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="rounded-xl bg-surface-soft px-3.5 py-6 text-center text-sm text-ink-500">
                Nothing needs attention.
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* One card per module */}
      <div className="mt-5 grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        <Module title="Team status" icon={UsersRound} to="/team" note="Who is on, and what they have done today">
          <Tiles
            items={[
              { label: 'Total team', value: team.length },
              { label: 'Online', value: online, tone: 'text-emerald-600' },
              { label: 'Present', value: team.filter((m) => m.attendance === 'Present').length },
              { label: 'Calls today', value: team.reduce((s, m) => s + Number(m.calls || 0), 0) },
              { label: 'Follow-ups', value: team.reduce((s, m) => s + Number(m.followUps || 0), 0) },
              { label: 'Closings', value: team.reduce((s, m) => s + Number(m.bookings || 0), 0) },
            ]}
          />
          <ul className="mt-4 space-y-2">
            {team.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5 rounded-xl bg-surface-soft px-3 py-2">
                <Avatar name={m.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                  <span className="num block truncate text-xs text-ink-500">
                    Calls {m.calls ?? 0} · Leads {m.leads ?? 0} · Closings {m.bookings ?? 0}
                  </span>
                </span>
                <Badge tone={m.live === 'Online' ? 'green' : 'slate'} dot>
                  {m.live}
                </Badge>
              </li>
            ))}
          </ul>
        </Module>

        <Module title="Sales and leads" icon={Users} to="/enquiries" note="The funnel, stage by stage">
          <Funnel
            steps={enquiryStatuses
              .filter((s) => s !== 'Lost')
              .map((s) => ({ label: s, value: enquiries.filter((e) => e.status === s).length }))}
          />
          <ul className="mt-4 divide-y divide-ink-900/[0.07]">
            <Row label="Total leads" value={enquiries.length} />
            <Row label="Conversions" value={won.length} tone="text-emerald-600" />
            <Row
              label="Conversion rate"
              value={`${enquiries.length ? Math.round((won.length / enquiries.length) * 100) : 0}%`}
            />
            <Row label="Pipeline value" value={inr(openLeads.reduce((s, e) => s + Number(e.budget || 0), 0))} tone="text-brand-700" />
          </ul>
        </Module>

        <Module title="Booking" icon={CalendarCheck} to="/bookings" note="Where every trip stands">
          <Tiles
            items={[
              { label: 'Total', value: bookings.length },
              { label: 'Confirmed', value: bookings.filter((b) => b.status === 'Confirmed').length, tone: 'text-emerald-600' },
              { label: 'Part paid', value: bookings.filter((b) => b.status === 'Part paid').length, tone: 'text-amber-600' },
              { label: 'Waiting on hotels', value: bookings.filter((b) => b.confirmation?.status !== 'Hotel confirmed').length },
              { label: 'Travellers', value: bookings.reduce((s, b) => s + Number(b.pax || 0), 0) },
              { label: 'Free stays', value: bookings.filter((b) => b.freeStay).length },
            ]}
          />
          <ul className="mt-4 divide-y divide-ink-900/[0.07]">
            <Row label="Gross booking value" value={inr(bookingValue)} tone="text-brand-700" />
            <Row label="Collected" value={inr(collected)} tone="text-emerald-600" />
            <Row label="Pending payment" value={inr(outstanding)} tone={outstanding ? 'text-amber-600' : undefined} />
            <Row label="Net after the vendor" value={inr(markup)} />
          </ul>
        </Module>

        <Module title="Membership" icon={Crown} to="/customers" note="Plans sold, and what is running out">
          <Tiles
            items={[
              { label: 'Memberships', value: memberSignups.length },
              { label: 'Active', value: activeMembers.length, tone: 'text-emerald-600' },
              { label: 'Pending activation', value: pendingActivation.length, tone: 'text-amber-600' },
              { label: 'Expiring 30 days', value: expiringSoon.length, tone: 'text-amber-600' },
              { label: 'Revenue', value: shortInr(membershipPaid), tone: 'text-brand-700' },
              { label: 'Still to collect', value: shortInr(membershipDue) },
            ]}
          />
          <ul className="mt-4 divide-y divide-ink-900/[0.07]">
            {memberships.map((p) => (
              <Row
                key={p.id}
                label={`${p.name} · ${memberSignups.filter((m) => m.planId === p.id).length} members`}
                value={inr(memberSignups.filter((m) => m.planId === p.id).reduce((s, m) => s + Number(m.paid || 0), 0))}
              />
            ))}
          </ul>
        </Module>

        <Module title="Members" icon={UserRound} to="/customers" note="Gifts, referrals and special days">
          <Tiles
            items={[
              { label: 'Members', value: customers.length },
              { label: 'Gifts pending', value: customerRewards.filter((r) => ['Earned', 'Pending'].includes(r.stage)).length, tone: 'text-amber-600' },
              { label: 'Referrals', value: customers.reduce((s, c) => s + Number(c.referral?.total || 0), 0) },
              { label: 'Converted', value: customers.reduce((s, c) => s + Number(c.referral?.converted || 0), 0), tone: 'text-emerald-600' },
              { label: 'Member spend', value: shortInr(customers.reduce((s, c) => s + Number(c.spend || 0), 0)) },
              { label: 'At risk', value: customers.filter((c) => c.engagement === 'At risk').length, tone: 'text-rose-600' },
            ]}
          />
        </Module>

        <Module title="Partners" icon={Handshake} to="/partners" note="Who we sell through, and what they are owed">
          <Tiles
            items={[
              { label: 'Partners', value: partners.length },
              { label: 'Active', value: partners.filter((p) => p.status === 'Active').length, tone: 'text-emerald-600' },
              { label: 'Waiting approval', value: partners.filter((p) => p.approval !== 'Approved' && p.approval !== 'Suspended').length, tone: 'text-amber-600' },
              { label: 'Suspended', value: partners.filter((p) => p.status === 'Suspended').length, tone: 'text-rose-600' },
              { label: 'Partner revenue', value: shortInr(partners.reduce((s, p) => s + Number(p.revenue || 0), 0)), tone: 'text-brand-700' },
              { label: 'Payout due', value: shortInr(partners.reduce((s, p) => s + Number(p.payable || 0), 0)), tone: 'text-amber-600' },
            ]}
          />
        </Module>

        <Module title="Support and complaints" icon={Headphones} to="/support" note="Tickets, SLA and how happy people are">
          <Tiles
            items={[
              { label: 'Total tickets', value: tickets.length },
              { label: 'Open', value: openTickets.length, tone: 'text-amber-600' },
              { label: 'Escalated', value: tickets.filter((t) => (t.escalation || 1) > 1).length, tone: 'text-rose-600' },
              { label: 'SLA breached', value: breached.length, tone: 'text-rose-600' },
              { label: 'Resolved', value: tickets.filter((t) => ['Resolved', 'Customer confirmed', 'Closed'].includes(t.stage)).length, tone: 'text-emerald-600' },
              {
                label: 'Satisfaction',
                value: rated.length ? `${(rated.reduce((s, t) => s + t.rating, 0) / rated.length).toFixed(1)}/5` : '—',
                tone: 'text-amber-600',
              },
            ]}
          />
        </Module>

        <Module title="Revenue" icon={IndianRupee} to="/revenue" note="What came in, what went out, what is left">
          <ul className="divide-y divide-ink-900/[0.07]">
            <Row label="Membership revenue" value={inr(membershipPaid)} />
            <Row label="Booking markup" value={inr(markup)} />
            <Row label="Total revenue" value={inr(revenue)} tone="text-brand-700" />
            <Row label="Staff cost" value={inr(staffCost)} tone="text-rose-600" />
            <Row label="Office expenses" value={inr(officeCost)} tone="text-rose-600" />
            <Row label="Other expenses" value={inr(businessCost)} tone="text-rose-600" />
            <Row label="Total expenses" value={inr(totalExpenses)} tone="text-rose-600" />
            <Row label="Company profit" value={inr(profit)} tone={profit >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
            <Row
              label="Profit margin"
              value={`${revenue ? Math.round((profit / revenue) * 100) : 0}%`}
              tone={profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}
            />
          </ul>
        </Module>

        <Module title="Payment" icon={Wallet} to="/payment" note="Collections, gateways and what is overdue">
          <Tiles
            items={[
              { label: 'Collected', value: shortInr(collected + membershipPaid), tone: 'text-emerald-600' },
              { label: 'Receivable', value: shortInr(outstanding + membershipDue), tone: 'text-amber-600' },
              { label: 'Receipts', value: payments.length },
              { label: 'Overdue chases', value: receivables.length, tone: 'text-rose-600' },
              { label: 'Gateways live', value: gateways.length },
              { label: 'Salary pending', value: salary.filter((p) => p.status !== 'Paid').length },
            ]}
          />
        </Module>

        <Module title="Travel inventory" icon={Warehouse} to="/inventory" note="What is free, and what is running out">
          <Tiles
            items={[
              { label: 'Total units', value: inventory.reduce((s, i) => s + Number(i.units || 0), 0) },
              { label: 'Available', value: freeInventory, tone: 'text-emerald-600' },
              { label: 'Booked', value: inventory.reduce((s, i) => s + Number(i.booked || 0), 0) },
              { label: 'Low availability', value: lowStock.length, tone: 'text-amber-600' },
              { label: 'Sold out', value: soldOut.length, tone: 'text-rose-600' },
              { label: 'Inventory value', value: shortInr(inventoryValue), tone: 'text-brand-700' },
            ]}
          />
          <ul className="mt-4 space-y-1.5">
            {contractAlerts.slice(0, 3).map((c) => (
              <li key={c.kind + c.on} className="flex items-center gap-2 text-xs text-ink-600">
                <AlertTriangle size={12} className="shrink-0 text-amber-500" />
                {c.kind} — {c.on}
              </li>
            ))}
          </ul>
        </Module>

        <Module title="WhatsApp and chatbot" icon={MessageCircle} to="/whatsapp" tone="text-emerald-600" note="Today's conversations and what came of them">
          <Tiles
            items={[
              { label: 'Conversations', value: inboxStats.conversationsToday },
              { label: 'New leads', value: inboxStats.newToday },
              { label: 'Qualified', value: inboxStats.qualified },
              { label: 'Presentations', value: inboxStats.presentations },
              { label: 'Membership sales', value: inboxStats.membershipSales, tone: 'text-emerald-600' },
              { label: 'Unanswered', value: inboxStats.unanswered, tone: 'text-rose-600' },
            ]}
          />
          <ul className="mt-4 divide-y divide-ink-900/[0.07]">
            <Row label="Bot finished on its own" value={`${Math.round((botSessions.completed / botSessions.total) * 100)}%`} tone="text-emerald-600" />
            <Row label="Passed to the desk" value={botSessions.transferred} />
          </ul>
        </Module>

        <Module title="Automation" icon={Zap} to="/automation" tone="text-violet-600" note="What ran without anyone asking">
          <Tiles
            items={[
              { label: 'Active rules', value: automationRules.filter((r) => r.status === 'On').length, tone: 'text-emerald-600' },
              { label: 'Paused', value: automationRules.filter((r) => r.status !== 'On').length },
              { label: 'Runs', value: automationRules.reduce((s, r) => s + r.runs, 0) },
              { label: 'Completed', value: automationRules.reduce((s, r) => s + r.completed, 0) },
              { label: 'Errors', value: automationRules.reduce((s, r) => s + r.errors, 0), tone: 'text-rose-600' },
              {
                label: 'Success rate',
                value: `${Math.round(
                  (automationRules.reduce((s, r) => s + r.completed, 0) /
                    Math.max(1, automationRules.reduce((s, r) => s + r.runs, 0))) *
                    100
                )}%`,
              },
            ]}
          />
        </Module>

        <Module title="Rewards, refer and earn" icon={Gift} to="/rewards" tone="text-amber-600" note="What members earned, and what it cost">
          <Tiles
            items={[
              { label: 'Rewards issued', value: customerRewards.length },
              { label: 'Redeemed', value: customerRewards.filter((r) => r.stage === 'Redeemed').length, tone: 'text-emerald-600' },
              { label: 'Pending', value: customerRewards.filter((r) => ['Earned', 'Pending'].includes(r.stage)).length, tone: 'text-amber-600' },
              { label: 'Reward cost', value: inr(customerRewards.reduce((s, r) => s + r.cost, 0)), tone: 'text-rose-600' },
              { label: 'Referrals', value: referrals.length },
              { label: 'Successful', value: referrals.filter((r) => r.verified).length, tone: 'text-emerald-600' },
            ]}
          />
          <ul className="mt-4 divide-y divide-ink-900/[0.07]">
            <Row label="Live reward rules" value={rewardRules.filter((r) => r.status === 'Active').length} />
            <Row label="Face value given" value={inr(customerRewards.reduce((s, r) => s + r.value, 0))} />
          </ul>
        </Module>

        <Module title="Offers and promotions" icon={Megaphone} to="/offers" tone="text-violet-600" note="What is live, and what it is earning">
          <Tiles
            items={[
              { label: 'Active offers', value: offers.filter((o) => o.status === 'Live').length, tone: 'text-emerald-600' },
              { label: 'Scheduled', value: offers.filter((o) => o.status === 'Scheduled').length },
              { label: 'Redemptions', value: offers.reduce((s, o) => s + o.used, 0) },
              { label: 'Offer revenue', value: shortInr(offers.reduce((s, o) => s + o.revenue, 0)), tone: 'text-brand-700' },
              { label: 'Discount given', value: shortInr(offers.reduce((s, o) => s + o.discountCost, 0)), tone: 'text-rose-600' },
              { label: 'Bookings', value: offers.reduce((s, o) => s + o.bookings, 0) },
            ]}
          />
        </Module>

        <Module title="Report and analytics" icon={PieChart} to="/reports" note="Every report, one click away" wide>
          <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            {[
              { label: 'Total revenue', value: inr(revenue) },
              { label: 'New leads', value: enquiries.filter((e) => e.status === 'New').length },
              { label: 'Qualified', value: enquiries.filter((e) => !['New', 'Lost'].includes(e.status)).length },
              { label: 'Conversions', value: won.length },
              { label: 'Bookings', value: bookings.length },
              { label: 'Outstanding', value: inr(outstanding + membershipDue) },
            ].map((t) => (
              <div key={t.label} className="rounded-xl bg-surface-soft px-4 py-3">
                <p className="num font-display text-lg font-extrabold text-ink-900">{t.value}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-ink-500">{t.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Every number here opens its own report — sales, leads, membership, bookings, revenue, team, partners and
            support.
          </p>
        </Module>
      </div>
    </>
  );
}
