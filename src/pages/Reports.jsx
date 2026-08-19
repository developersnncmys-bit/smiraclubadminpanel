import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Download, FileSpreadsheet } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import SourceDonut from '../components/dashboard/SourceDonut.jsx';
import TopDestinations from '../components/dashboard/TopDestinations.jsx';
import { inr, shortInr } from '../data/mockData.js';
import { downloadCsv } from '../lib/csv.js';
import SalesInsights from '../components/sales/SalesInsights.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';

// No month-by-month history in the demo store, so the trend is seeded.
const monthly = [
  { month: 'Mar', booked: 3120, collected: 2680 },
  { month: 'Apr', booked: 3860, collected: 3210 },
  { month: 'May', booked: 4520, collected: 3720 },
  { month: 'Jun', booked: 4180, collected: 3640 },
  { month: 'Jul', booked: 5240, collected: 4310 },
  { month: 'Aug', booked: 4265, collected: 3120 },
];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(11,21,36,0.06)',
  boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
  fontSize: 12,
  fontWeight: 600,
};

export default function Reports() {
  const { enquiries, bookings, invoices, team, owner, range, toast } = useApp();

  const scopedEnquiries = byOwner(enquiries, owner);
  const scopedBookings = byOwner(bookings, owner);

  const bookedValue = scopedBookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const avgTrip = scopedBookings.length ? Math.round(bookedValue / scopedBookings.length) : 0;

  // Same four stages as the dashboard, from the same list, so they always agree.
  const total = scopedEnquiries.length;
  const funnel = [
    { stage: 'Enquiries received', value: total, colour: 'bg-brand-500' },
    {
      stage: 'Contacted',
      value: scopedEnquiries.filter((e) => e.status !== 'New').length,
      colour: 'bg-sky-500',
    },
    {
      stage: 'Quotation sent',
      value: scopedEnquiries.filter((e) => ['Quoted', 'Booked'].includes(e.status)).length,
      colour: 'bg-violet-500',
    },
    {
      stage: 'Booked',
      value: scopedEnquiries.filter((e) => e.status === 'Booked').length,
      colour: 'bg-orange-500',
    },
  ];
  const share = (n) => (total ? Math.round((n / total) * 100) : 0);

  const headline = [
    { label: 'Booked value', value: inr(bookedValue), note: `${scopedBookings.length} trips` },
    { label: 'Money collected', value: inr(collected), note: 'Across all invoices' },
    { label: 'Average trip value', value: inr(avgTrip), note: 'Per booking' },
    { label: 'Enquiries', value: total, note: `${share(funnel[3].value)}% became trips` },
  ];

  const exportMonthly = () =>
    downloadCsv('smira-club-monthly-report', monthly, [
      { key: 'month', header: 'Month' },
      { key: 'booked', header: 'Booked (INR thousands)' },
      { key: 'collected', header: 'Collected (INR thousands)' },
    ]);

  const printReport = () => {
    toast('Opening print dialog — choose “Save as PDF”', 'info');
    setTimeout(() => window.print(), 400);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle={`How the agency is doing · ${range.toLowerCase()}`}>
        <button className="btn-ghost" onClick={exportMonthly}>
          <FileSpreadsheet size={16} /> Export Excel
        </button>
        <button className="btn-primary" onClick={printReport}>
          <Download size={16} /> Download PDF
        </button>
      </PageHeader>

      {/* The four numbers worth knowing */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {headline.map((h) => (
          <div key={h.label} className="card p-5">
            <p className="text-sm font-semibold text-ink-500">{h.label}</p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-ink-900 num">{h.value}</p>
            <p className="mt-1 text-xs text-ink-400">{h.note}</p>
          </div>
        ))}
      </div>

      {/* One chart, two bars, no second axis */}
      <Card
        eyebrow="Last 6 months"
        title="Booked against collected"
        subtitle="How much was sold each month, and how much of it came in"
        className="mt-6"
        action={
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-ink-700">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Booked
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-700">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-200" /> Collected
            </span>
          </div>
        }
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6d7c93', fontWeight: 600 }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={60}
                tick={{ fontSize: 12, fill: '#96a2b4' }}
                tickFormatter={(v) => shortInr(v * 1000)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(20,165,140,0.06)' }}
                formatter={(v, name) => [shortInr(v * 1000), name]}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="booked" name="Booked" fill="#0b8472" radius={[8, 8, 4, 4]} barSize={28} />
              <Bar dataKey="collected" name="Collected" fill="#a8ebda" radius={[8, 8, 4, 4]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* A funnel you can actually read */}
        <Card
          eyebrow="Conversion"
          title="From enquiry to booking"
          subtitle={`Out of ${total} enquiries this period`}
        >
          <ul className="space-y-4">
            {funnel.map((f) => (
              <li key={f.stage}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-ink-700">{f.stage}</span>
                  <span className="shrink-0 text-sm">
                    <b className="text-ink-900 num">{f.value}</b>
                    <span className="ml-1.5 text-xs font-semibold text-ink-500 num">
                      {share(f.value)}%
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full transition-all ${f.colour}`}
                    style={{ width: `${share(f.value)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <SourceDonut />
        <TopDestinations />
      </div>

      {/* The sales blocks the client listed — the lead table itself stays on Sales & Leads. */}
      <div className="mt-8">
        <p className="eyebrow">Sales and leads</p>
        <h2 className="mt-1 font-display text-lg font-extrabold text-ink-900">Lead analytics</h2>
        <p className="mb-4 mt-0.5 text-sm text-ink-500">
          Funnel, sources, team and follow-ups for the same period
        </p>
        <SalesInsights rows={scopedEnquiries} bookings={scopedBookings} team={team} />
      </div>
    </>
  );
}
