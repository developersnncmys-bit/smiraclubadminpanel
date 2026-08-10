import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Download, FileSpreadsheet } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import SourceDonut from '../components/dashboard/SourceDonut.jsx';
import TopDestinations from '../components/dashboard/TopDestinations.jsx';
import { trends, shortInr } from '../data/mockData.js';
import { downloadCsv } from '../lib/csv.js';
import { useApp } from '../store/AppStore.jsx';

const funnel = [
  { stage: 'Enquiries', value: 168, fill: '#14a58c' },
  { stage: 'Contacted', value: 151, fill: '#0ea5e9' },
  { stage: 'Quoted', value: 96, fill: '#7c5cff' },
  { stage: 'Booked', value: 54, fill: '#f9714a' },
];

const monthly = [
  { month: 'Mar', booked: 3120, collected: 2680, bookings: 38 },
  { month: 'Apr', booked: 3860, collected: 3210, bookings: 44 },
  { month: 'May', booked: 4520, collected: 3720, bookings: 51 },
  { month: 'Jun', booked: 4180, collected: 3640, bookings: 47 },
  { month: 'Jul', booked: 5240, collected: 4310, bookings: 61 },
  { month: 'Aug', booked: 4265, collected: 3120, bookings: 54 },
];

export default function Reports() {
  const { toast, range } = useApp();

  const exportMonthly = () =>
    downloadCsv('smira-club-monthly-report', monthly, [
      { key: 'month', header: 'Month' },
      { key: 'booked', header: 'Booked (INR thousands)' },
      { key: 'collected', header: 'Collected (INR thousands)' },
      { key: 'bookings', header: 'Bookings' },
    ]);

  const printReport = () => {
    toast('Opening print dialog — choose “Save as PDF”', 'info');
    setTimeout(() => window.print(), 400);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle={`Deeper analysis across the whole agency · ${range}`}>
        <button className="btn-ghost" onClick={exportMonthly}>
          <FileSpreadsheet size={16} /> Export Excel
        </button>
        <button className="btn-primary" onClick={printReport}>
          <Download size={16} /> Download PDF
        </button>
      </PageHeader>

      <Card
        title="Booked vs collected"
        subtitle="Last 6 months, amounts in ₹ thousands"
        className="mb-6"
      >
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6d7c93', fontWeight: 600 }} dy={8} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} width={56} tick={{ fontSize: 12, fill: '#96a2b4' }} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={40} tick={{ fontSize: 12, fill: '#96a2b4' }} />
              <Tooltip
                cursor={{ fill: 'rgba(20,165,140,0.06)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(11,21,36,0.06)',
                  boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }} />
              <Bar yAxisId="left" dataKey="booked" name="Booked (₹K)" fill="#14a58c" radius={[8, 8, 4, 4]} barSize={26} />
              <Bar yAxisId="left" dataKey="collected" name="Collected (₹K)" fill="#a8ebda" radius={[8, 8, 4, 4]} barSize={26} />
              <Line yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#f9714a" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card title="Conversion funnel" subtitle="From first enquiry to confirmed booking">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart data={funnel} innerRadius="30%" outerRadius="100%" startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" background cornerRadius={8} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(11,21,36,0.06)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {funnel.map((f, i) => (
              <li key={f.stage} className="flex items-center gap-3 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.fill }} />
                <span className="flex-1 font-semibold text-ink-700">{f.stage}</span>
                <span className="font-bold text-ink-900">{f.value}</span>
                <span className="w-12 text-right text-xs text-ink-500">
                  {i === 0 ? '100%' : `${Math.round((f.value / funnel[0].value) * 100)}%`}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <SourceDonut />
        <TopDestinations />
      </div>

      <Card title="Sales snapshot" subtitle="Current period totals">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {trends.sales.stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-ink-900/[0.07] bg-surface-soft/60 px-4 py-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{s.label}</p>
              <p className="mt-1 font-display text-xl font-extrabold text-ink-900">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-400">
          Peak month so far: July at {shortInr(5240000)} booked value.
        </p>
      </Card>
    </>
  );
}
