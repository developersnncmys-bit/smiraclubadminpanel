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
  Hammer,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { inr } from '../data/mockData.js';

/**
 * One card per overview in the client's dashboard sheet, in their order:
 * team, sales, bookings, membership, partners, communication, support,
 * reports, payment, alerts. Each card shows a few live numbers and opens the
 * page behind it; the ones we have not built say so.
 */

function Overview({ icon: Icon, eyebrow, title, rows, footer, to, soon, tone = 'brand' }) {
  const navigate = useNavigate();
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slate-100 text-slate-500',
  };

  return (
    <section className={`card flex flex-col p-5 ${soon ? 'opacity-80' : 'card-hover'}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[soon ? 'slate' : tone]}`}>
          <Icon size={18} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-0.5 font-display text-[0.95rem] font-extrabold leading-tight text-ink-900">
            {title}
          </h2>
        </div>
        {soon && (
          <span className="chip shrink-0 bg-ink-900/[0.06] text-ink-500">
            <Hammer size={11} /> Soon
          </span>
        )}
      </div>

      <dl className="mt-4 flex-1 space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-ink-500">{r.label}</dt>
            <dd
              className={`num shrink-0 font-display text-base font-extrabold ${
                r.alert ? 'text-rose-600' : 'text-ink-900'
              }`}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      {footer}

      <button
        onClick={() => navigate(to)}
        className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-brand-700 hover:underline"
      >
        {soon ? 'See what is planned' : 'Open'} <ArrowRight size={14} />
      </button>
    </section>
  );
}

export default function Dashboard() {
  const {
    enquiries,
    bookings,
    quotations,
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

  // -- Sales ----------------------------------------------------------------
  const total = scopedEnquiries.length;
  const newLeads = scopedEnquiries.filter((e) => e.status === 'New').length;
  const booked = scopedEnquiries.filter((e) => e.status === 'Booked').length;
  const conversion = total ? Math.round((booked / total) * 100) : 0;

  // -- Bookings -------------------------------------------------------------
  const bookedValue = scopedBookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const travellers = scopedBookings.reduce((s, b) => s + Number(b.pax || 0), 0);
  const upcoming = scopedBookings.filter((b) =>
    ['Confirmed', 'Part paid', 'Pending'].includes(b.status)
  ).length;

  // -- Money ----------------------------------------------------------------
  const billed = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const outstanding = Math.max(0, billed - collected);
  const collectedPct = billed ? Math.round((collected / billed) * 100) : 0;

  // -- Alerts, all counted from real records --------------------------------
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue').length;
  const overdueTasks = tasks.filter((t) => t.bucket === 'overdue').length;
  const lowSeats = packages.filter((p) => Number(p.seats) <= 8).length;
  const awaitingQuote = memberSignups.filter((s) => s.status === 'New').length;
  const alertCount = overdueInvoices + overdueTasks + lowSeats + awaitingQuote;

  // -- Team -----------------------------------------------------------------
  const activeTeam = team.filter((t) => t.status === 'Active').length;
  const busiest = [...team].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Every part of the business at a glance · ${range.toLowerCase()}`}>
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
          rows={[
            { label: 'People on the desk', value: team.length },
            { label: 'Active right now', value: activeTeam },
            { label: 'Busiest desk', value: busiest ? busiest.name.split(' ')[0] : '—' },
          ]}
        />

        <Overview
          icon={Users}
          eyebrow="Sales"
          title="Sales & leads"
          to="/enquiries"
          tone="sky"
          rows={[
            { label: 'Enquiries received', value: total },
            { label: 'Waiting for a first call', value: newLeads, alert: newLeads > 0 },
            { label: 'Turned into trips', value: `${conversion}%` },
          ]}
        />

        <Overview
          icon={CalendarCheck}
          eyebrow="Operations"
          title="Bookings"
          to="/bookings"
          rows={[
            { label: 'Trips confirmed', value: scopedBookings.length },
            { label: 'Yet to travel', value: upcoming },
            { label: 'Booked value', value: inr(bookedValue) },
            { label: 'Travellers', value: travellers },
          ]}
        />

        <Overview
          icon={Crown}
          eyebrow="Membership"
          title="Membership"
          to="/memberships"
          tone="amber"
          rows={[
            { label: 'Plans live on the website', value: memberships.filter((p) => p.published).length },
            { label: 'Members', value: memberSignups.filter((s) => s.status === 'Active').length },
            { label: 'Signups awaiting a quote', value: awaitingQuote, alert: awaitingQuote > 0 },
          ]}
        />

        <Overview
          icon={Globe2}
          eyebrow="Partners"
          title="Partners"
          to="/partners"
          soon
          rows={[
            { label: 'Partner accounts', value: '—' },
            { label: 'Bookings sourced', value: '—' },
            { label: 'Commission owed', value: '—' },
          ]}
        />

        <Overview
          icon={MessageSquare}
          eyebrow="Engagement"
          title="Communication"
          to="/communication"
          soon
          rows={[
            { label: 'Messages sent', value: '—' },
            { label: 'Awaiting a reply', value: '—' },
            { label: 'Templates in use', value: '—' },
          ]}
        />

        <Overview
          icon={Headphones}
          eyebrow="Service"
          title="Support & complaints"
          to="/support"
          soon
          rows={[
            { label: 'Open tickets', value: '—' },
            { label: 'Breaching today', value: '—' },
            { label: 'Resolved this month', value: '—' },
          ]}
        />

        <Overview
          icon={PieChart}
          eyebrow="Insights"
          title="Reports & analytics"
          to="/reports"
          tone="violet"
          rows={[
            { label: 'Booked value', value: inr(bookedValue) },
            { label: 'Money collected', value: inr(collected) },
            { label: 'Enquiry to booking', value: `${conversion}%` },
          ]}
        />

        <Overview
          icon={Wallet}
          eyebrow="Finance"
          title="Payment overview"
          to="/invoices"
          rows={[
            { label: 'Billed', value: inr(billed) },
            { label: 'Received', value: inr(collected) },
            { label: 'Still to collect', value: inr(outstanding), alert: outstanding > 0 },
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
          rows={[
            { label: 'Invoices overdue', value: overdueInvoices, alert: overdueInvoices > 0 },
            { label: 'Tasks overdue', value: overdueTasks, alert: overdueTasks > 0 },
            { label: 'Packages nearly full', value: lowSeats },
            { label: 'Signups without a quote', value: awaitingQuote, alert: awaitingQuote > 0 },
          ]}
          footer={
            <p className="mt-4 rounded-xl bg-surface-soft px-3.5 py-2.5 text-xs text-ink-600">
              {alertCount === 0
                ? 'Nothing needs chasing right now.'
                : `${alertCount} ${alertCount === 1 ? 'thing needs' : 'things need'} chasing today.`}
            </p>
          }
        />
      </div>
    </>
  );
}
