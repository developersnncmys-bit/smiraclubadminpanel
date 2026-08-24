import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Luggage,
  IndianRupee,
  RefreshCw,
  Mail,
  UserCheck,
  Repeat2,
  Ticket,
  PlaneTakeoff,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import TrendReports from '../components/dashboard/TrendReports.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { kpis, shortInr, inr } from '../data/mockData.js';

/**
 * Headline tiles, the ratios underneath them, then the business reports panel
 * — the shape the client asked for, matching the CRM they use.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { enquiries, bookings, owner, range, refresh, toast, settings } = useApp();

  const scopedEnquiries = byOwner(enquiries, owner);
  const scopedBookings = byOwner(bookings, owner);
  const travellers = scopedBookings.reduce((s, b) => s + Number(b.pax || 0), 0);
  const revenue = scopedBookings.reduce((s, b) => s + Number(b.amount || 0), 0);

  const contacted = scopedEnquiries.filter((e) => e.status !== 'New').length;
  const booked = scopedEnquiries.filter((e) => e.status === 'Won').length;
  const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '0%');

  const ratios = [
    {
      icon: UserCheck,
      label: 'Enquiries contacted',
      value: pct(contacted, scopedEnquiries.length),
      to: '/enquiries',
      tone: 'text-brand-600',
    },
    {
      icon: Repeat2,
      label: 'Enquiry → booking',
      value: pct(booked, scopedEnquiries.length),
      to: '/enquiries',
      tone: 'text-sky-600',
    },
    {
      icon: Ticket,
      label: 'Average trip value',
      value: scopedBookings.length ? inr(Math.round(revenue / scopedBookings.length)) : '—',
      to: '/bookings',
      tone: 'text-violet-600',
    },
    {
      icon: PlaneTakeoff,
      label: 'Upcoming departures',
      value: scopedBookings.filter((b) =>
        ['Confirmed', 'Part paid', 'Pending'].includes(b.status)
      ).length,
      to: '/bookings',
      tone: 'text-orange-600',
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

      {/* Headline tiles */}
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

      {/* The ratios that explain them */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ratios.map(({ icon: Icon, label, value, to, tone }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="card card-hover flex items-center gap-3 px-5 py-4 text-left"
          >
            <Icon size={17} strokeWidth={2.2} className={`shrink-0 ${tone}`} />
            <span className="flex-1 truncate text-sm font-semibold text-ink-600">{label}</span>
            <span className="num shrink-0 font-display text-lg font-extrabold text-ink-900">
              {value}
            </span>
          </button>
        ))}
      </div>

      {/* Business reports */}
      <div className="mt-6">
        <TrendReports />
      </div>
    </>
  );
}
