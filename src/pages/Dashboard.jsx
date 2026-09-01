import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, UsersRound, Users, CalendarCheck, Crown, UserRound,
  Handshake, Headphones, PieChart, IndianRupee, Wallet, Zap,
  MessageCircle, Warehouse, Gift, Megaphone, AlertTriangle, TrendingUp,
} from 'lucide-react';
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
import PageHeader from '../components/ui/PageHeader.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import MenuButton from '../components/ui/MenuButton.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import Block from '../components/ui/Block.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr, enquiryStatuses, bookingStatusTone, salesTrend } from '../data/mockData.js';
import { daysUntil } from '../lib/membership.js';
import { expenses as expenseBudget } from '../data/revenueData.js';
import { receivables, salary } from '../data/paymentData.js';
import { inboxStats, botSessions } from '../data/whatsappData.js';
import { rules as automationRules, history as automationHistory } from '../data/automationData.js';
import { customerRewards, referrals } from '../data/rewardsData.js';
import { offers } from '../data/offersData.js';
import { holds } from '../data/inventoryData.js';

/**
 * One module, as a line rather than a box: what it is, the one number that
 * matters, and a way in. Fifteen of these read as an index; fifteen boxes of
 * six numbers each read as a wall.
 */
function ModuleLine({ icon: Icon, label, value, note, tone = 'text-ink-900', to, alert }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-soft"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-soft text-ink-500 transition group-hover:bg-white">
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink-900">{label}</span>
        <span className="block truncate text-xs text-ink-500">{note}</span>
      </span>
      <span className={`num shrink-0 font-display text-lg font-extrabold ${alert ? 'text-rose-600' : tone}`}>
        {value}
      </span>
      <ArrowRight size={15} className="shrink-0 text-ink-300 transition group-hover:text-brand-600" />
    </button>
  );
}

/** Stage, count, and how much carried from the stage before it. */
function Funnel({ steps, tone = 'bg-brand-500' }) {
  const top = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ul className="space-y-2.5">
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
            <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.round((s.value / top) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The dashboard: what the money did, where the work is, and one line per
 * module so nothing is hidden but nothing shouts either.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState('Overview');
  const {
    team, enquiries, bookings, memberSignups, memberships, customers,
    invoices, payments, tickets, partners, inventory, range,
  } = useApp();

  // -- Money -----------------------------------------------------------------
  const won = enquiries.filter((e) => e.status === 'Won');
  const openLeads = enquiries.filter((e) => !['Won', 'Lost'].includes(e.status));
  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const outstanding = invoices.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paid || 0)), 0);
  const membershipPaid = memberSignups.reduce((s, m) => s + Number(m.paid || 0), 0);
  const membershipDue = memberSignups.reduce((s, m) => s + Math.max(0, Number(m.amount || 0) - Number(m.paid || 0)), 0);
  const bookingValue = bookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const partnerCost = bookings.reduce((s, b) => s + Number(b.vendorContact?.payable || 0), 0);
  const markup = Math.max(0, bookingValue - partnerCost);
  // The company's revenue is what the desk booked — the same roll-up Team
  // Status reports, so profit and achievement agree across the panel.
  const revenue = team.reduce((s, m) => s + Number(m.revenue || 0), 0);
  const target = team.reduce((s, m) => s + Number(m.target || 0), 0);
  const achievement = target ? Math.round((revenue / target) * 100) : 0;

  const sum = (list) => list.reduce((s, x) => s + Number(x.amount || 0), 0);
  const officeCost = sum(expenseBudget.office);
  const staffCost = sum(expenseBudget.staff);
  const businessCost = sum(expenseBudget.business);
  const totalExpenses = officeCost + staffCost + businessCost;
  const profit = revenue - totalExpenses;
  const margin = revenue ? Math.round((profit / revenue) * 100) : 0;

  // -- Counts ----------------------------------------------------------------
  const activeMembers = memberSignups.filter((m) => m.status === 'Active');
  const expiringSoon = memberSignups.filter((m) => { const l = daysUntil(m.expiresOn); return l != null && l >= 0 && l <= 30; });
  const pendingActivation = memberSignups.filter((m) => m.activation && m.activation.stage !== 'Activated');
  const freeUnits = (i) => Math.max(0, Number(i.units || 0) - Number(i.booked || 0) - Number(i.blocked || 0));
  const freeInventory = inventory.reduce((s, i) => s + freeUnits(i), 0);
  const soldOut = inventory.filter((i) => freeUnits(i) === 0);
  const openTickets = tickets.filter((t) => !['Closed', 'Customer confirmed'].includes(t.stage));
  const breached = tickets.filter((t) => t.slaState === 'Breached');
  const online = team.filter((m) => m.live === 'Online').length;
  const failedJobs = automationHistory.filter((h) => h.status === 'Failed').length;

  const alerts = [
    ...(outstanding ? [{ level: 'critical', text: `${inr(outstanding)} outstanding on bookings`, to: '/payment' }] : []),
    ...(breached.length ? [{ level: 'critical', text: `${breached.length} complaint past its SLA`, to: '/support' }] : []),
    ...(inboxStats.unanswered ? [{ level: 'critical', text: `${inboxStats.unanswered} WhatsApp chats unanswered`, to: '/whatsapp' }] : []),
    ...(soldOut.length ? [{ level: 'warning', text: `${soldOut.length} inventory items sold out`, to: '/inventory' }] : []),
    ...(expiringSoon.length ? [{ level: 'warning', text: `${expiringSoon.length} membership expiring within 30 days`, to: '/customers' }] : []),
    ...(pendingActivation.length ? [{ level: 'warning', text: `${pendingActivation.length} membership waiting on activation`, to: '/customers' }] : []),
    ...(holds.length ? [{ level: 'warning', text: `${holds.length} inventory holds about to expire`, to: '/inventory' }] : []),
    ...(failedJobs ? [{ level: 'warning', text: `${failedJobs} automation job failed`, to: '/automation' }] : []),
  ];

  /** The things the day starts with, wherever they live. */
  const quickActions = [
    { label: 'Add lead', icon: Users, run: () => navigate('/enquiries?new=1') },
    { label: 'New booking', icon: CalendarCheck, run: () => navigate('/bookings') },
    { label: 'Add member', icon: UserRound, run: () => navigate('/customers') },
    { label: 'Create ticket', icon: Headphones, run: () => navigate('/support') },
    { label: 'Record payment', icon: Wallet, run: () => navigate('/payment') },
    { label: 'Add partner', icon: Handshake, run: () => navigate('/partners') },
    { label: 'Team status', icon: UsersRound, run: () => navigate('/team') },
    { label: 'All reports', icon: PieChart, run: () => navigate('/reports') },
  ];

  /** The money, as three steps rather than a table. */
  const moneySteps = [
    { label: 'Revenue', value: revenue, tone: 'bg-brand-500', text: 'text-brand-700' },
    { label: 'Costs', value: totalExpenses, tone: 'bg-rose-400', text: 'text-rose-600' },
    { label: 'Profit', value: profit, tone: 'bg-emerald-500', text: 'text-emerald-600' },
  ];
  const moneyTop = Math.max(1, ...moneySteps.map((s) => Math.abs(s.value)));

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`The whole business on one page · ${range.toLowerCase()}`} />

      {/* One bar: what to start, and how the day stands */}
      <section className="card flex flex-wrap items-center gap-3 px-5 py-3.5">
        <h2 className="font-display text-base font-extrabold text-ink-900">Today</h2>

        <SectionTabs
          items={[
            { key: 'Overview', label: 'Overview' },
            { key: 'Work', label: 'Work' },
            { key: 'Modules', label: 'Modules', count: 15 },
          ]}
          value={section}
          onChange={setSection}
        />

        <MenuButton
          label="Quick actions"
          icon={Zap}
          variant="action"
          width="w-[250px]"
          items={quickActions.map((q) => ({ key: q.label, label: q.label, icon: q.icon }))}
          onSelect={(key) => quickActions.find((q) => q.label === key)?.run()}
        />

        <p className="num ml-auto text-sm text-ink-500">
          {online} of {team.length} online · {openLeads.length} open leads · {openTickets.length} open complaints
        </p>
      </section>

      <div className="mt-4">
        <KpiRow
          cols={6}
          items={[
            { label: 'Revenue', value: shortInr(revenue), icon: IndianRupee, tone: 'text-brand-700', progress: achievement, hint: `of ${shortInr(target)} target` },
            { label: 'Costs', value: shortInr(totalExpenses), icon: Wallet, hint: 'office, staff and business' },
            { label: 'Profit', value: shortInr(profit), icon: TrendingUp, tone: profit >= 0 ? 'text-emerald-600' : 'text-rose-600', hint: `${margin}% margin` },
            { label: 'Open leads', value: openLeads.length, icon: Users, hint: `${shortInr(openLeads.reduce((s, e) => s + Number(e.budget || 0), 0))} in play` },
            { label: 'Trips', value: bookings.length, icon: CalendarCheck, hint: `${shortInr(bookingValue)} booked` },
            { label: 'Outstanding', value: shortInr(outstanding + membershipDue), icon: AlertTriangle, tone: outstanding + membershipDue ? 'text-amber-600' : 'text-ink-900', hint: 'still to collect' },
          ]}
        />
      </div>

      {section === 'Overview' && (
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Block
          title="Money"
          note="Last 30 days — the bars are what closed, the line is the daily target"
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#96a2b4' }} dy={6} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={58}
                  tick={{ fontSize: 11, fill: '#96a2b4' }}
                  tickFormatter={(v) => shortInr(v)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(20,165,140,0.06)' }}
                  formatter={(v, name) => [name === 'Closings' ? v : inr(v), name]}
                  labelFormatter={(d) => `Day ${d}`}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(11,21,36,0.06)',
                    boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#0b8472" radius={[6, 6, 3, 3]} maxBarSize={16} />
                <Line type="monotone" dataKey="target" name="Daily target" stroke="#f0a04b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Where the money came from — the tiles above say how much */}
          <div className="mt-4 grid grid-cols-2 divide-ink-900/[0.07] rounded-xl border border-ink-900/[0.07] sm:grid-cols-4 sm:divide-x">
            {[
              ['Membership', team.reduce((a, m) => a + Number(m.revenueDetail?.sources?.Membership || 0), 0), 'text-ink-900'],
              ['Booking', team.reduce((a, m) => a + Number(m.revenueDetail?.sources?.Booking || 0), 0), 'text-ink-900'],
              ['Add-ons', team.reduce((a, m) => a + Number(m.revenueDetail?.sources?.Addons || 0), 0), 'text-ink-900'],
              ['Collected', team.reduce((a, m) => a + Number(m.revenueDetail?.collected || 0), 0), 'text-emerald-600'],
            ].map(([label, v, tone]) => (
              <div key={label} className="px-4 py-3">
                <p className={`num truncate font-display text-lg font-extrabold leading-none ${tone}`}>{shortInr(v)}</p>
                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Needs a person" note="Straight from the data, most serious first">
          <ul className="space-y-1.5">
            {alerts.slice(0, 6).map((a) => (
              <li key={a.text}>
                <button
                  onClick={() => navigate(a.to)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-soft"
                >
                  <span
                    className={`h-8 w-1.5 shrink-0 rounded-full ${a.level === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`}
                  />
                  <span className="min-w-0 flex-1 text-sm text-ink-800">{a.text}</span>
                  <ArrowRight size={15} className="shrink-0 text-ink-300 transition group-hover:text-brand-600" />
                </button>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="rounded-xl bg-surface-soft px-4 py-8 text-center text-sm text-ink-500">
                Nothing needs attention.
              </li>
            )}
          </ul>
        </Block>
        </div>
      )}

      {section === 'Work' && (
        <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Block
          title="Leads"
          note={`${enquiries.length} in the pipeline · ${enquiries.length ? Math.round((won.length / enquiries.length) * 100) : 0}% become customers`}
          action={
            <button className="btn-line btn-sm" onClick={() => navigate('/enquiries')}>
              Open
            </button>
          }
        >
          <Funnel
            steps={enquiryStatuses
              .filter((s) => !['Lost'].includes(s))
              .map((s) => ({ label: s, value: enquiries.filter((e) => e.status === s).length }))}
          />
        </Block>

        <Block
          title="Trips"
          note={`${bookings.length} on the books · ${inr(bookingValue)} booked`}
          action={
            <button className="btn-line btn-sm" onClick={() => navigate('/bookings')}>
              Open
            </button>
          }
        >
          <ul className="space-y-2.5">
            {['Confirmed', 'Part paid', 'Pending', 'Completed', 'Cancelled'].map((s) => {
              const at = bookings.filter((b) => b.status === s);
              return (
                <li key={s} className="flex items-center justify-between gap-3 rounded-xl bg-surface-soft px-3.5 py-2.5">
                  <Badge tone={bookingStatusTone[s]} dot>
                    {s}
                  </Badge>
                  <span className="num text-sm">
                    <b className="text-ink-900">{at.length}</b>
                    <span className="ml-2 text-xs text-ink-500">
                      {at.length ? inr(at.reduce((sum, b) => sum + Number(b.amount || 0), 0)) : '—'}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block
          title="The desk today"
          note={`${online} of ${team.length} online`}
          action={
            <button className="btn-line btn-sm" onClick={() => navigate('/team')}>
              Open
            </button>
          }
        >
          <ul className="space-y-2">
            {team.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5 rounded-xl bg-surface-soft px-3 py-2.5">
                <Avatar name={m.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                  <span className="num block truncate text-xs text-ink-500">
                    {m.calls ?? 0} calls · {m.followUps ?? 0} follow-ups · {m.bookings ?? 0} closed
                  </span>
                </span>
                <Badge tone={m.live === 'Online' ? 'green' : 'slate'} dot>
                  {m.live}
                </Badge>
              </li>
            ))}
          </ul>
        </Block>
        </div>
      )}

      {section === 'Modules' && (
        <div className="mt-5">
      <Block
        title="Every module"
        note="One number from each, and a way in"
        wide
        action={
          <button className="btn-line btn-sm" onClick={() => navigate('/reports')}>
            <PieChart size={14} /> All reports
          </button>
        }
      >
        <div className="grid gap-x-6 gap-y-0.5 lg:grid-cols-2 2xl:grid-cols-3">
          <ModuleLine
            icon={Crown}
            label="Membership"
            note={`${activeMembers.length} active · ${pendingActivation.length} to activate`}
            value={inr(membershipPaid)}
            tone="text-brand-700"
            to="/customers"
          />
          <ModuleLine
            icon={UserRound}
            label="Members"
            note={`${customers.reduce((s, c) => s + Number(c.referral?.total || 0), 0)} referrals · ${customerRewards.filter((r) => ['Earned', 'Pending'].includes(r.stage)).length} gifts pending`}
            value={customers.length}
            to="/customers"
          />
          <ModuleLine
            icon={Handshake}
            label="Partners"
            note={`${partners.filter((p) => p.status === 'Active').length} active · ${shortInr(partners.reduce((s, p) => s + Number(p.payable || 0), 0))} payout due`}
            value={partners.length}
            to="/partners"
          />
          <ModuleLine
            icon={Headphones}
            label="Support"
            note={`${openTickets.length} open · ${breached.length} past SLA`}
            value={tickets.length}
            alert={breached.length > 0}
            to="/support"
          />
          <ModuleLine
            icon={Warehouse}
            label="Travel inventory"
            note={`${freeInventory} units free · ${soldOut.length} sold out`}
            value={shortInr(
              inventory.reduce((s, i) => s + freeUnits(i) * (Number(i.baseRate || 0) + Number(i.markup || 0)), 0)
            )}
            tone="text-brand-700"
            to="/inventory"
          />
          <ModuleLine
            icon={Wallet}
            label="Payment"
            note={`${payments.length} receipts · ${receivables.length} chases · ${salary.filter((p) => p.status !== 'Paid').length} salary pending`}
            value={shortInr(collected + membershipPaid)}
            tone="text-emerald-600"
            to="/payment"
          />
          <ModuleLine
            icon={IndianRupee}
            label="Revenue"
            note={`${inr(totalExpenses)} out · ${margin}% margin`}
            value={inr(profit)}
            tone={profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}
            to="/revenue"
          />
          <ModuleLine
            icon={MessageCircle}
            label="WhatsApp"
            note={`${inboxStats.leads} leads · bot handled ${Math.round((botSessions.completed / botSessions.total) * 100)}%`}
            value={inboxStats.conversationsToday}
            alert={inboxStats.unanswered > 0}
            to="/whatsapp"
          />
          <ModuleLine
            icon={Zap}
            label="Automation"
            note={`${automationRules.filter((r) => r.status === 'On').length} rules on · ${failedJobs} failed`}
            value={automationRules.reduce((s, r) => s + r.runs, 0)}
            to="/automation"
          />
          <ModuleLine
            icon={Gift}
            label="Rewards and referrals"
            note={`${referrals.filter((r) => r.verified).length} successful referrals · ${inr(customerRewards.reduce((s, r) => s + r.cost, 0))} cost`}
            value={customerRewards.length}
            to="/rewards"
          />
          <ModuleLine
            icon={Megaphone}
            label="Offers"
            note={`${offers.filter((o) => o.status === 'Live').length} live · ${offers.reduce((s, o) => s + o.used, 0)} redeemed`}
            value={shortInr(offers.reduce((s, o) => s + o.revenue, 0))}
            tone="text-brand-700"
            to="/offers"
          />
          <ModuleLine
            icon={Users}
            label="Sales and leads"
            note={`${openLeads.length} open · ${inr(openLeads.reduce((s, e) => s + Number(e.budget || 0), 0))} in play`}
            value={enquiries.length}
            to="/enquiries"
          />
          <ModuleLine
            icon={CalendarCheck}
            label="Booking"
            note={`${bookings.filter((b) => b.confirmation?.status !== 'Hotel confirmed').length} waiting on hotels`}
            value={bookings.length}
            to="/bookings"
          />
          <ModuleLine
            icon={UsersRound}
            label="Team status"
            note={`${team.reduce((s, m) => s + Number(m.calls || 0), 0)} calls today`}
            value={`${online}/${team.length}`}
            to="/team"
          />
          <ModuleLine
            icon={PieChart}
            label="Report and analytics"
            note="Fifteen reports over the same data"
            value="15"
            to="/reports"
          />
        </div>
      </Block>
        </div>
      )}

    </>
  );
}
