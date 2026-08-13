import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Users, PhoneCall, Activity, IndianRupee, TrendingUp, Plus, X } from 'lucide-react';
import { trends } from '../../data/mockData.js';

const tabs = [
  { key: 'enquiries', label: 'Enquiries Trend', icon: Users },
  { key: 'calls', label: 'Calls Trend', icon: PhoneCall },
  { key: 'activity', label: 'Activity Trend', icon: Activity },
  { key: 'sales', label: 'Sales Trend', icon: IndianRupee },
];

const statTones = {
  brand: 'border-brand-500/25 bg-brand-50/70 text-brand-700',
  ocean: 'border-sky-500/25 bg-sky-50/70 text-sky-700',
  grape: 'border-violet-500/25 bg-violet-50/70 text-violet-700',
  coral: 'border-orange-500/25 bg-orange-50/70 text-orange-700',
  gold: 'border-amber-500/25 bg-amber-50/70 text-amber-700',
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-ink-900/[0.07] bg-white/95 px-3.5 py-2.5 shadow-lift backdrop-blur">
      <p className="mb-1.5 text-xs font-bold text-ink-900">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-xs text-ink-600">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}
          <span className="ml-auto font-bold text-ink-900">{p.value.toLocaleString('en-IN')}</span>
        </p>
      ))}
    </div>
  );
}

const REPORT_PRESETS = ['Team scorecard', 'Destination mix', 'Payment ageing', 'Source ROI'];

export default function TrendReports() {
  const [tab, setTab] = useState('enquiries');
  const [reports, setReports] = useState(['Trends & Analytics']);
  const [activeReport, setActiveReport] = useState('Trends & Analytics');
  const data = trends[tab];

  const addReport = () => {
    const next = REPORT_PRESETS.find((r) => !reports.includes(r));
    if (!next) return;
    setReports((r) => [...r, next]);
    setActiveReport(next);
  };

  const closeReport = (name) => {
    if (reports.length === 1) return;
    const rest = reports.filter((r) => r !== name);
    setReports(rest);
    if (activeReport === name) setActiveReport(rest[0]);
  };

  return (
    <section className="card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2 className="mt-1 font-display text-base font-extrabold text-ink-900">Business reports</h2>
        </div>
        <p className="text-xs text-ink-400">Use + to add another report tab</p>
      </header>

      {/* Report workspace tabs */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-5 pt-4">
        {reports.map((name) => (
          <span
            key={name}
            className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              activeReport === name
                ? 'border-brand-600 bg-white text-ink-900'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <button onClick={() => setActiveReport(name)}>{name}</button>
            {reports.length > 1 && (
              <button onClick={() => closeReport(name)} title="Close report">
                <X size={14} className="text-ink-400 transition hover:text-rose-600" />
              </button>
            )}
          </span>
        ))}
        <button
          onClick={addReport}
          disabled={reports.length === REPORT_PRESETS.length + 1}
          title="Add report"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-dashed border-ink-900/15 text-ink-500 transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-40"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="border-t border-ink-900/[0.07]">
        <div className="flex items-start gap-3.5 px-5 py-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <TrendingUp size={19} strokeWidth={2.3} />
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900">{activeReport}</h3>
            <p className="mt-0.5 text-sm text-ink-500">
              {activeReport === 'Trends & Analytics'
                ? 'Visualise performance trends across enquiries, calls, activities and sales'
                : `Custom report · connect this to your live data to populate ${activeReport.toLowerCase()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Metric tabs */}
      <div className="no-scrollbar flex overflow-x-auto border-y border-ink-900/[0.07] bg-surface-soft/50">
        {tabs.map(({ key, label, icon: Icon }) => {
          const on = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-5 py-3 text-sm font-bold transition ${
                on
                  ? 'border-b-2 border-brand-600 bg-white text-brand-700'
                  : 'border-b-2 border-transparent text-ink-500 hover:text-ink-800'
              }`}
            >
              <Icon size={17} strokeWidth={2.2} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-3 p-5">
        {data.stats.map((s) => (
          <div
            key={s.label}
            className={`min-w-[140px] flex-1 rounded-xl border px-4 py-3 ${statTones[s.tone] || statTones.brand}`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[320px] px-2 pb-5 pr-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.series} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {data.keys.map((k) => (
                <linearGradient key={k.key} id={`grad-${tab}-${k.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={k.color} stopOpacity={0.32} />
                  <stop offset="95%" stopColor={k.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#6d7c93', fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#96a2b4' }}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(11,21,36,0.12)', strokeWidth: 1 }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#4a5a73', paddingTop: 8 }}
            />
            {data.keys.map((k) => (
              <Area
                key={k.key}
                type="monotone"
                dataKey={k.key}
                name={k.name}
                stroke={k.color}
                strokeWidth={2.6}
                fill={`url(#grad-${tab}-${k.key})`}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
