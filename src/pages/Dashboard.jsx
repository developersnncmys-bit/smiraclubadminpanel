import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Luggage,
  IndianRupee,
  RefreshCw,
  Mail,
  PhoneCall,
  FileText,
  Wallet,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import TrendReports from '../components/dashboard/TrendReports.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { kpis, shortInr, inr } from '../data/mockData.js';

/**
 * The dashboard reads top to bottom as a story: what needs doing today, how
 * the week is going, how an enquiry turns into a booking, and where the money
 * stands. Every heading is plain English so nobody has to decode it.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { enquiries, bookings, quotations, invoices, tasks, owner, range, refresh, toast, settings } =
    useApp();

  const scopedEnquiries = byOwner(enquiries, owner);
  const scopedBookings = byOwner(bookings, owner);
  const travellers = scopedBookings.reduce((s, b) => s + Number(b.pax || 0), 0);
  const revenue = scopedBookings.reduce((s, b) => s + Number(b.amount || 0), 0);

  // -- What needs doing right now -------------------------------------------
  const toCall = scopedEnquiries.filter((e) => e.status === 'New').length;
  const awaitingReply = quotations.filter((q) => ['Sent', 'Viewed'].includes(q.status)).length;
  const unpaid = invoices.filter((i) => i.status !== 'Paid');
  const dueToday = tasks.filter((t) => t.bucket === 'today' || t.bucket === 'overdue').length;

  const todo = [
    {
      icon: PhoneCall,
      count: toCall,
      title: 'New enquiries to call',
      hint: 'Nobody has spoken to them yet',
      to: '/enquiries',
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      icon: FileText,
      count: awaitingReply,
      title: 'Quotations waiting for a reply',
      hint: 'Sent but not accepted',
      to: '/quotations',
      tone: 'bg-violet-50 text-violet-700',
    },
    {
      icon: Wallet,
      count: unpaid.length,
      title: 'Invoices not fully paid',
      hint: 'Balance still to collect',
      to: '/invoices',
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      icon: ListTodo,
      count: dueToday,
      title: 'Tasks due today',
      hint: 'Follow-ups and documents',
      to: '/tasks',
      tone: 'bg-brand-50 text-brand-700',
    },
  ];

  // -- Enquiry journey ------------------------------------------------------
  // All four stages come from one list, so the funnel can never read over 100%.
  const total = scopedEnquiries.length;
  const contacted = scopedEnquiries.filter((e) => e.status !== 'New').length;
  const quoted = scopedEnquiries.filter((e) => ['Quoted', 'Booked'].includes(e.status)).length;
  const booked = scopedEnquiries.filter((e) => e.status === 'Booked').length;
  const share = (n) => (total ? Math.round((n / total) * 100) : 0);

  const journey = [
    { label: 'Enquiries received', value: total, note: 'Everyone who asked us' },
    { label: 'Contacted', value: contacted, note: 'We have spoken to them' },
    { label: 'Quotation sent', value: quoted, note: 'Given a price' },
    { label: 'Booked', value: booked, note: 'Trip confirmed' },
  ];

  // -- Money ----------------------------------------------------------------
  const billed = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const outstanding = Math.max(0, billed - collected);

  const departing = scopedBookings.filter((b) =>
    ['Confirmed', 'Part paid', 'Pending'].includes(b.status)
  ).length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Tuesday, 04 August 2026 · ${range}`}>
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

      {/* 1 — Work waiting on the desk */}
      <section>
        <h2 className="font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900">
          What needs your attention
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">Click any card to open the list.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {todo.map(({ icon: Icon, count, title, hint, to, tone }) => (
            <button
              key={title}
              onClick={() => navigate(to)}
              className="card card-hover flex items-center gap-4 p-4 text-left"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
                <Icon size={19} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl font-extrabold leading-none text-ink-900 num">
                  {count}
                </span>
                <span className="mt-1 block truncate text-sm font-semibold text-ink-800">
                  {title}
                </span>
                <span className="block truncate text-xs text-ink-500">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 2 — Headline numbers */}
      <section className="mt-8">
        <h2 className="font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900">
          How this period is going
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Compared with the period before · {range.toLowerCase()}.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button onClick={() => navigate('/enquiries')} className="h-full w-full text-left">
            <StatCard
              icon={Users}
              label="Enquiries"
              value={scopedEnquiries.length}
              delta={kpis.enquiries.delta}
              series={kpis.enquiries.series}
              hint="People who asked us"
              skin="brand"
            />
          </button>
          <button onClick={() => navigate('/bookings')} className="h-full w-full text-left">
            <StatCard
              icon={CalendarCheck}
              label="Bookings"
              value={scopedBookings.length}
              delta={kpis.bookings.delta}
              series={kpis.bookings.series}
              hint="Trips confirmed"
            />
          </button>
          <button onClick={() => navigate('/bookings')} className="h-full w-full text-left">
            <StatCard
              icon={Luggage}
              label="Travellers"
              value={travellers}
              delta={kpis.travellers.delta}
              series={kpis.travellers.series}
              hint="Seats sold across trips"
            />
          </button>
          <button onClick={() => navigate('/invoices')} className="h-full w-full text-left">
            <StatCard
              icon={IndianRupee}
              label="Revenue"
              value={shortInr(revenue)}
              delta={kpis.revenue.delta}
              series={kpis.revenue.series}
              hint="Value of confirmed trips"
            />
          </button>
        </div>
      </section>

      {/* 3 — The flow itself */}
      <section className="mt-8">
        <h2 className="font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900">
          How an enquiry becomes a booking
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">
          The same {total} enquiries at each step, so you can see where people drop off.
        </p>

        <div className="card mt-4 p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
            {journey.map((step, i) => (
              <div key={step.label} className="contents">
                <button
                  onClick={() => navigate('/enquiries')}
                  className="rounded-xl border border-ink-900/[0.07] px-4 py-3.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <p className="eyebrow">Step {i + 1}</p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-extrabold leading-none text-ink-900 num">
                      {step.value}
                    </span>
                    <span className="text-xs font-bold text-brand-700 num">{share(step.value)}%</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-800">{step.label}</p>
                  <p className="text-xs text-ink-500">{step.note}</p>
                </button>

                {i < journey.length - 1 && (
                  <span className="hidden justify-center text-ink-300 lg:flex">
                    <ArrowRight size={18} />
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-ink-900/[0.07] pt-3.5 text-sm text-ink-600">
            Out of <b>{total}</b> enquiries, <b>{booked}</b> turned into trips
            {total ? ` — that is ${share(booked)} out of every 100.` : '.'}
          </p>
        </div>
      </section>

      {/* 4 — Money */}
      <section className="mt-8">
        <h2 className="font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900">
          Money
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">Across every invoice raised.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Billed', value: inr(billed), note: 'Total invoiced', bar: 'bg-ink-400' },
            { label: 'Collected', value: inr(collected), note: 'Money in the bank', bar: 'bg-emerald-500' },
            { label: 'Still to collect', value: inr(outstanding), note: `${unpaid.length} invoices open`, bar: 'bg-orange-500' },
            { label: 'Upcoming departures', value: departing, note: 'Trips yet to travel', bar: 'bg-sky-500' },
          ].map((m) => (
            <div key={m.label} className="card flex items-center gap-3 p-4">
              <span className={`h-10 w-1 shrink-0 rounded-full ${m.bar}`} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink-500">{m.label}</span>
                <span className="block truncate font-display text-xl font-extrabold text-ink-900 num">
                  {m.value}
                </span>
                <span className="block truncate text-xs text-ink-400">{m.note}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5 — Deeper analysis for whoever wants it */}
      <section className="mt-8">
        <TrendReports />
      </section>
    </>
  );
}
