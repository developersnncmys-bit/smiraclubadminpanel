import { useNavigate } from 'react-router-dom';
import { Users, CalendarCheck, Luggage, IndianRupee, RefreshCw, Mail } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import TrendReports from '../components/dashboard/TrendReports.jsx';
import TopDestinations from '../components/dashboard/TopDestinations.jsx';
import TaskSnapshot from '../components/dashboard/TaskSnapshot.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { kpis, shortInr, inr } from '../data/mockData.js';

const microBars = {
  brand: 'bg-brand-500',
  ocean: 'bg-sky-500',
  grape: 'bg-violet-500',
  coral: 'bg-orange-500',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { enquiries, bookings, owner, range, refresh, toast, settings } = useApp();

  // Live figures from the store so every add/edit elsewhere shows up here.
  const scopedEnquiries = byOwner(enquiries, owner);
  const scopedBookings = byOwner(bookings, owner);
  const travellers = scopedBookings.reduce((s, b) => s + Number(b.pax || 0), 0);
  const revenue = scopedBookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const contacted = scopedEnquiries.filter((e) => e.status !== 'New').length;
  const booked = scopedEnquiries.filter((e) => e.status === 'Booked').length;

  const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '0%');

  const microStats = [
    { label: 'Enquiries contacted', value: pct(contacted, scopedEnquiries.length), tone: 'brand', to: '/enquiries' },
    { label: 'Enquiry → booking', value: pct(booked, scopedEnquiries.length), tone: 'ocean', to: '/enquiries' },
    {
      label: 'Avg. ticket size',
      value: scopedBookings.length ? inr(Math.round(revenue / scopedBookings.length)) : '—',
      tone: 'grape',
      to: '/bookings',
    },
    {
      label: 'Upcoming departures',
      value: scopedBookings.filter((b) => ['Confirmed', 'Part paid', 'Pending'].includes(b.status)).length,
      tone: 'coral',
      to: '/bookings',
    },
  ];

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

      {/* Headline KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button onClick={() => navigate('/enquiries')} className="h-full w-full text-left">
          <StatCard
            icon={Users}
            label="Enquiries"
            value={scopedEnquiries.length}
            delta={kpis.enquiries.delta}
            series={kpis.enquiries.series}
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
          />
        </button>
        <button onClick={() => navigate('/bookings')} className="h-full w-full text-left">
          <StatCard
            icon={Luggage}
            label="Travellers"
            value={travellers}
            delta={kpis.travellers.delta}
            series={kpis.travellers.series}
          />
        </button>
        <button onClick={() => navigate('/invoices')} className="h-full w-full text-left">
          <StatCard
            icon={IndianRupee}
            label="Revenue"
            value={shortInr(revenue)}
            delta={kpis.revenue.delta}
            series={kpis.revenue.series}
          />
        </button>
      </div>

      {/* Secondary ratios */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {microStats.map((m) => (
          <button
            key={m.label}
            onClick={() => navigate(m.to)}
            className="card card-hover flex items-center gap-3 px-5 py-4 text-left"
          >
            <span className={`h-9 w-1.5 rounded-full ${microBars[m.tone] || microBars.brand}`} />
            <span className="flex-1 text-sm font-semibold text-ink-500">{m.label}</span>
            <span className="font-display text-lg font-extrabold text-ink-900">{m.value}</span>
          </button>
        ))}
      </div>

      {/* Business reports */}
      <div className="mt-6">
        <TrendReports />
      </div>

      {/* Insight grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <TopDestinations />
        <TaskSnapshot />
        <ActivityFeed />
      </div>
    </>
  );
}
