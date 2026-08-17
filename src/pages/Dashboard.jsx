import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { inr, shortInr } from '../data/mockData.js';

/**
 * One card per overview on the client's dashboard sheet. Each leads with a
 * single headline figure, then the two or three numbers that explain it —
 * a shape that reads in a glance instead of a list of equal rows.
 */

const TONES = {
  brand: { bar: 'bg-brand-500', tile: 'bg-brand-50 text-brand-700', hero: 'text-brand-700' },
  sky: { bar: 'bg-sky-500', tile: 'bg-sky-50 text-sky-700', hero: 'text-sky-700' },
  violet: { bar: 'bg-violet-500', tile: 'bg-violet-50 text-violet-700', hero: 'text-violet-700' },
  amber: { bar: 'bg-amber-400', tile: 'bg-amber-50 text-amber-700', hero: 'text-amber-700' },
  emerald: { bar: 'bg-emerald-500', tile: 'bg-emerald-50 text-emerald-700', hero: 'text-emerald-700' },
  rose: { bar: 'bg-rose-500', tile: 'bg-rose-50 text-rose-600', hero: 'text-rose-600' },
  slate: { bar: 'bg-ink-900/10', tile: 'bg-slate-100 text-slate-500', hero: 'text-ink-400' },
};

function Overview({ icon: Icon, eyebrow, title, tone = 'brand', hero, stats = [], footer, to, soon, blurb }) {
  const navigate = useNavigate();
  const t = TONES[soon ? 'slate' : tone];
  const cols = stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <section
      className={`card flex flex-col overflow-hidden ${soon ? '' : 'card-hover'}`}
    >
      <span className={`h-1 w-full shrink-0 ${t.bar}`} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.tile}`}>
            <Icon size={18} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-0.5 font-display text-[0.95rem] font-extrabold leading-tight text-ink-900">
              {title}
            </h2>
          </div>
          {soon && <span className="chip shrink-0 bg-ink-900/[0.06] text-ink-500">Soon</span>}
        </div>

        {soon ? (
          <p className="mt-5 flex-1 text-sm leading-relaxed text-ink-500">{blurb}</p>
        ) : (
          <>
            {/* The one number this card exists to show */}
            <div className="mt-5">
              <p className={`font-display text-[2.35rem] font-extrabold leading-none tracking-tight num ${hero.tone ? TONES[hero.tone].hero : 'text-ink-900'}`}>
                {hero.value}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-ink-500">{hero.label}</p>
            </div>

            {stats.length > 0 && (
              <div className={`mt-4 grid gap-2 ${cols}`}>
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-surface-soft px-3 py-2.5">
                    <p className={`num font-display text-base font-extrabold ${s.alert ? 'text-rose-600' : 'text-ink-900'}`}>
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold leading-tight text-ink-500">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {footer}
          </>
        )}

        <button
          onClick={() => navigate(to)}
          className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-bold text-brand-700 hover:underline"
        >
          {soon ? 'See what is planned' : 'Open'} <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

export default function Dashboard() {
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
  const upcoming = scopedBookings.filter((b) =>
    ['Confirmed', 'Part paid', 'Pending'].includes(b.status)
  ).length;

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
  const busiest = [...team].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];

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

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        <Overview
          icon={UsersRound}
          eyebrow="Team"
          title="Team status"
          to="/team"
          hero={{ value: team.length, label: 'People on the desk' }}
          stats={[
            { label: 'Active now', value: activeTeam },
            { label: 'Busiest desk', value: busiest ? busiest.name.split(' ')[0] : '—' },
          ]}
        />

        <Overview
          icon={Users}
          eyebrow="Sales"
          title="Sales & leads"
          to="/enquiries"
          tone="sky"
          hero={{ value: total, label: 'Enquiries received' }}
          stats={[
            { label: 'Need a first call', value: newLeads, alert: newLeads > 0 },
            { label: 'Became trips', value: `${conversion}%` },
          ]}
        />

        <Overview
          icon={CalendarCheck}
          eyebrow="Operations"
          title="Bookings"
          to="/bookings"
          hero={{ value: shortInr(bookedValue), label: 'Booked value' }}
          stats={[
            { label: 'Trips', value: scopedBookings.length },
            { label: 'Yet to travel', value: upcoming },
            { label: 'Travellers', value: travellers },
          ]}
        />

        <Overview
          icon={Crown}
          eyebrow="Membership"
          title="Membership"
          to="/memberships"
          tone="amber"
          hero={{ value: memberships.filter((p) => p.published).length, label: 'Plans live on the website' }}
          stats={[
            { label: 'Members', value: memberSignups.filter((s) => s.status === 'Active').length },
            { label: 'Awaiting a quote', value: awaitingQuote, alert: awaitingQuote > 0 },
          ]}
        />

        <Overview
          icon={Wallet}
          eyebrow="Finance"
          title="Payment overview"
          to="/invoices"
          tone="emerald"
          hero={{ value: inr(outstanding), label: 'Still to collect', tone: outstanding > 0 ? 'rose' : 'emerald' }}
          stats={[
            { label: 'Billed', value: shortInr(billed) },
            { label: 'Received', value: shortInr(collected) },
          ]}
          footer={
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${collectedPct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-ink-500">{collectedPct}% of everything billed is in.</p>
            </div>
          }
        />

        <Overview
          icon={Bell}
          eyebrow="Attention"
          title="Alerts"
          to="/alerts"
          tone="rose"
          hero={{
            value: alertCount,
            label: alertCount === 1 ? 'thing needs chasing' : 'things need chasing',
            tone: alertCount > 0 ? 'rose' : 'emerald',
          }}
          stats={[
            { label: 'Invoices overdue', value: overdueInvoices, alert: overdueInvoices > 0 },
            { label: 'Tasks overdue', value: overdueTasks, alert: overdueTasks > 0 },
            { label: 'Seats low', value: lowSeats },
          ]}
        />

        <Overview
          icon={PieChart}
          eyebrow="Insights"
          title="Reports & analytics"
          to="/reports"
          tone="violet"
          hero={{ value: `${conversion}%`, label: 'Enquiries that became trips' }}
          stats={[
            { label: 'Booked', value: shortInr(bookedValue) },
            { label: 'Collected', value: shortInr(collected) },
          ]}
        />

        <Overview
          icon={Globe2}
          eyebrow="Partners"
          title="Partners"
          to="/partners"
          soon
          blurb="Agents and resellers who bring you business, with the commission owed on each booking they source."
        />

        <Overview
          icon={MessageSquare}
          eyebrow="Engagement"
          title="Communication"
          to="/communication"
          soon
          blurb="Every WhatsApp, email and SMS sent to a traveller, kept in one thread against their booking."
        />

        <Overview
          icon={Headphones}
          eyebrow="Service"
          title="Support & complaints"
          to="/support"
          soon
          blurb="Tickets raised during and after a trip, with an owner and a deadline on each one."
        />
      </div>
    </>
  );
}
