import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  UsersRound,
  Users,
  CalendarCheck,
  Crown,
  Globe2,
  MessageSquare,
  Headphones,
  PieChart,
  Wallet,
  Bell,
  RefreshCw,
  Mail,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { inr, shortInr } from '../data/mockData.js';

// No month-by-month history in the demo store, so the trend is seeded.
const monthly = [
  { month: 'Mar', booked: 3120 },
  { month: 'Apr', booked: 3860 },
  { month: 'May', booked: 4520 },
  { month: 'Jun', booked: 4180 },
  { month: 'Jul', booked: 5240 },
  { month: 'Aug', booked: 4265 },
];

/** One line in the module rail. */
function RailRow({ icon: Icon, label, value, to, tone = 'text-ink-900', alert, soon }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-soft"
    >
      <Icon size={16} strokeWidth={2.1} className={`shrink-0 ${soon ? 'text-ink-300' : 'text-ink-400'}`} />
      <span className={`flex-1 truncate text-sm font-semibold ${soon ? 'text-ink-400' : 'text-ink-700'}`}>
        {label}
      </span>

      {soon ? (
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-ink-300">Soon</span>
      ) : (
        <span className={`num shrink-0 text-sm font-extrabold ${alert ? 'text-rose-600' : tone}`}>
          {value}
        </span>
      )}

      <ArrowUpRight
        size={14}
        className="shrink-0 text-ink-300 opacity-0 transition group-hover:opacity-100"
      />
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    enquiries,
    bookings,
    invoices,
    tasks,
    packages,
    memberships,
    memberSignups,
    team,
    owner,
    range,
    refresh,
    toast,
    settings,
  } = useApp();

  const scopedEnquiries = byOwner(enquiries, owner);
  const scopedBookings = byOwner(bookings, owner);

  const total = scopedEnquiries.length;
  const newLeads = scopedEnquiries.filter((e) => e.status === 'New').length;
  const booked = scopedEnquiries.filter((e) => e.status === 'Booked').length;
  const conversion = total ? Math.round((booked / total) * 100) : 0;

  const bookedValue = scopedBookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const travellers = scopedBookings.reduce((s, b) => s + Number(b.pax || 0), 0);

  const billed = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const outstanding = Math.max(0, billed - collected);
  const collectedPct = billed ? Math.round((collected / billed) * 100) : 0;

  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue').length;
  const overdueTasks = tasks.filter((t) => t.bucket === 'overdue').length;
  const lowSeats = packages.filter((p) => Number(p.seats) <= 8).length;
  const awaitingQuote = memberSignups.filter((s) => s.status === 'New').length;
  const alertCount = overdueInvoices + overdueTasks + lowSeats + awaitingQuote;

  const activeTeam = team.filter((t) => t.status === 'Active').length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Every part of the business at a glance · ${range.toLowerCase()}`}
      >
        <button className="btn-ghost" onClick={refresh}>
          <RefreshCw size={16} /> Refresh
        </button>
        <button
          className="btn-primary"
          onClick={() => toast(`Daily report emailed to ${settings.agency.email}`)}
        >
          <Mail size={16} /> Daily email report
        </button>
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---- The money story, told once, in full ---- */}
        <section className="card overflow-hidden">
          <div className="border-b border-ink-900/[0.07] bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 px-6 py-6 text-white">
            <p className="eyebrow text-white/50">This period · {range.toLowerCase()}</p>

            <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-5">
              <div>
                <p className="font-display text-[2.75rem] font-extrabold leading-none tracking-tight num">
                  {inr(bookedValue)}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white/60">Booked value</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold leading-none num text-emerald-300">
                  {inr(collected)}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white/60">Collected</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold leading-none num text-orange-300">
                  {inr(outstanding)}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white/60">Still to collect</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${collectedPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/60">
                {collectedPct}% of everything billed has come in.
              </p>
            </div>
          </div>

          {/* Four figures that explain the headline */}
          <div className="grid grid-cols-2 divide-x divide-y divide-ink-900/[0.07] sm:grid-cols-4 sm:divide-y-0">
            {[
              { label: 'Enquiries', value: total, hint: `${newLeads} need a call`, to: '/enquiries' },
              { label: 'Trips', value: scopedBookings.length, hint: `${travellers} travellers`, to: '/bookings' },
              { label: 'Conversion', value: `${conversion}%`, hint: 'enquiry to trip', to: '/reports' },
              {
                label: 'Needs chasing',
                value: alertCount,
                hint: alertCount ? 'open items' : 'all clear',
                to: '/alerts',
                alert: alertCount > 0,
              },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => navigate(s.to)}
                className="px-5 py-4 text-left transition hover:bg-surface-soft"
              >
                <p className="eyebrow">{s.label}</p>
                <p
                  className={`mt-1.5 font-display text-2xl font-extrabold leading-none num ${
                    s.alert ? 'text-rose-600' : 'text-ink-900'
                  }`}
                >
                  {s.value}
                </p>
                <p className="mt-1 truncate text-xs text-ink-500">{s.hint}</p>
              </button>
            ))}
          </div>

          {/* Where the year has gone */}
          <div className="border-t border-ink-900/[0.07] px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Booked value by month</p>
              <button
                onClick={() => navigate('/reports')}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
              >
                Full reports <ArrowRight size={14} />
              </button>
            </div>

            <div className="mt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#6d7c93', fontWeight: 600 }}
                    dy={8}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(20,165,140,0.06)' }}
                    formatter={(v) => [shortInr(v * 1000), 'Booked']}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(11,21,36,0.06)',
                      boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="booked" fill="#0b8472" radius={[8, 8, 4, 4]} barSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ---- Every module, one line each ---- */}
        <aside className="card flex h-fit flex-col overflow-hidden">
          <div className="border-b border-ink-900/[0.07] px-4 py-3.5">
            <p className="eyebrow">Across the business</p>
            <p className="mt-0.5 text-sm text-ink-500">Tap a line to open it.</p>
          </div>

          <div className="divide-y divide-ink-900/[0.07]">
            <RailRow icon={UsersRound} label="Team status" value={`${activeTeam} active`} to="/team" />
            <RailRow icon={Users} label="Sales & leads" value={total} to="/enquiries" />
            <RailRow icon={CalendarCheck} label="Bookings" value={scopedBookings.length} to="/bookings" />
            <RailRow
              icon={Crown}
              label="Membership"
              value={`${memberships.filter((p) => p.published).length} live`}
              to="/memberships"
            />
            <RailRow
              icon={Wallet}
              label="Payments"
              value={`${collectedPct}% in`}
              to="/invoices"
              tone="text-emerald-700"
            />
            <RailRow
              icon={Bell}
              label="Alerts"
              value={alertCount}
              to="/alerts"
              alert={alertCount > 0}
            />
            <RailRow icon={PieChart} label="Reports & analytics" value={`${conversion}%`} to="/reports" />
            <RailRow icon={Globe2} label="Partners" to="/partners" soon />
            <RailRow icon={MessageSquare} label="Communication" to="/communication" soon />
            <RailRow icon={Headphones} label="Support & complaints" to="/support" soon />
          </div>

          {alertCount > 0 && (
            <div className="border-t border-ink-900/[0.07] bg-rose-50/60 px-4 py-3">
              <p className="text-xs font-semibold text-rose-800">
                {overdueTasks > 0 && `${overdueTasks} task${overdueTasks > 1 ? 's' : ''} overdue`}
                {overdueTasks > 0 && awaitingQuote > 0 && ' · '}
                {awaitingQuote > 0 && `${awaitingQuote} signup${awaitingQuote > 1 ? 's' : ''} to quote`}
                {lowSeats > 0 && ` · ${lowSeats} package${lowSeats > 1 ? 's' : ''} nearly full`}
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
