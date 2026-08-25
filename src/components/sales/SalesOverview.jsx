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
import {
  Upload,
  Plus,
  UserCheck,
  MessageCircle,
  FileText,
  Download,
  UserPlus,
  Phone,
  CalendarPlus,
  ClipboardPlus,
  Wallet,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import {
  statusTone,
  enquiryStatuses,
  stageProbability,
  leadSources,
  salesTrend,
  salesActivity,
  activityKinds,
  inr,
  shortInr,
} from '../../data/mockData.js';

const PERIODS = ['Today', 'Yesterday', 'This week', 'This month', 'All'];
const OPEN = enquiryStatuses.filter((s) => !['Won', 'Lost'].includes(s));

/** A plain box: one heading, one line saying what it means, then the content. */
function Block({ title, note, wide, action, children }) {
  return (
    <section className={`card p-5 ${wide ? 'xl:col-span-2' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-extrabold text-ink-900">{title}</h3>
          {note && <p className="mt-0.5 text-sm text-ink-500">{note}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Name on the left, number on the right, a light bar underneath. */
function List({ rows, empty = 'Nothing here yet.' }) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-ink-500">{empty}</p>;
  const top = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-semibold text-ink-700">{r.label}</span>
            <span className="num shrink-0 text-sm font-bold text-ink-900">{r.display ?? r.value}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
            <div
              className={`h-full rounded-full ${r.tone || 'bg-brand-500'}`}
              style={{ width: `${Math.round((r.value / top) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A percentage drawn as a ring, for the two numbers that carry the page. */
function Ring({ pct, label, value, tone = '#0b8472' }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, pct)) / 100;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="h-[76px] w-[76px] shrink-0 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(11,21,36,0.08)" strokeWidth="9" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${c * filled} ${c}`}
        />
      </svg>
      <div className="min-w-0">
        <p className="num font-display text-2xl font-extrabold leading-none text-ink-900">{value}</p>
        <p className="mt-1 text-sm text-ink-500">{label}</p>
      </div>
    </div>
  );
}

/** One big number with its caption. */
function Stat({ label, value, hint, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-xl font-extrabold ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(11,21,36,0.06)',
  boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
  fontSize: 12,
  fontWeight: 600,
};

/**
 * Every block on the client's Sales & Leads sheet, written the way the desk
 * talks: the numbers up top, the funnel and the money below, and the lists
 * management actually acts on — follow-ups, the team, and what was lost.
 */
export default function SalesOverview({ rows, bookings, invoices = [], team, onPickStatus, onOpen, actions }) {
  const [period, setPeriod] = useState('All');
  const [who, setWho] = useState('All');
  const [source, setSource] = useState('All');
  const [metric, setMetric] = useState('revenue');
  const [rankBy, setRankBy] = useState('revenue');
  const [feedKind, setFeedKind] = useState('All');
  const [duePriority, setDuePriority] = useState('Overdue');
  const [showBulk, setShowBulk] = useState(false);

  // -- KPI filters -----------------------------------------------------------
  const scoped = rows.filter(
    (e) => (who === 'All' || e.owner === who) && (source === 'All' || e.source === source)
  );

  const total = scoped.length;
  const by = (fn) => scoped.filter(fn);
  const share = (n) => (total ? Math.round((n / total) * 100) : 0);
  const value = (list) => list.reduce((s, e) => s + Number(e.budget || 0), 0);

  const fresh = by((e) => e.status === 'New');
  const won = by((e) => e.status === 'Won');
  const lost = by((e) => e.status === 'Lost');
  const open = by((e) => !['Won', 'Lost'].includes(e.status));
  const presented = by((e) => ['Presentation', 'Visit scheduled', 'Closing'].includes(e.status));

  const owners = ['All', ...new Set(rows.map((e) => e.owner).filter(Boolean))];
  const reasons = [...new Set(lost.map((e) => e.lostReason).filter(Boolean))];
  const sourcesUsed = [...new Set(rows.map((e) => e.source).filter(Boolean))];

  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const pending = invoices.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paid || 0)), 0);
  const present = team.filter((m) => m.attendance === 'Present').length;
  const revenue = value(won);
  const target = team.reduce((s, m) => s + Number(m.target || 0), 0);
  const achievement = target ? Math.round((revenue / target) * 100) : 0;
  const followUpsDue = team.reduce((s, m) => s + Number(m.followUpDetail?.due || 0), 0);
  const followUpsDone = team.reduce((s, m) => s + Number(m.followUpDetail?.completed || 0), 0);
  const followUpsOverdue = team.reduce((s, m) => s + Number(m.followUpDetail?.overdue || 0), 0);

  // -- 1 · The numbers that carry the page ----------------------------------
  const glance = [
    { label: 'Total leads', value: total, hint: 'new and active' },
    { label: 'Active pipeline', value: open.length, hint: 'being worked on' },
    { label: 'Presentations', value: presented.length, hint: 'sent or scheduled' },
    { label: 'Conversions', value: won.length, hint: 'closed as customers' },
    { label: 'Pending payments', value: shortInr(pending), hint: 'still to collect' },
    { label: 'Team attendance', value: `${present}/${team.length}`, hint: 'present today' },
  ];

  const attention = [
    { label: 'New leads', value: fresh.length, note: 'nobody has called them', tone: 'bg-rose-500', urgent: fresh.length > 0 },
    { label: 'Follow-ups due', value: followUpsDue, note: `${followUpsOverdue} already overdue`, tone: 'bg-amber-500', urgent: followUpsOverdue > 0 },
    { label: 'Lost leads', value: lost.length, note: `${share(lost.length)}% of everything`, tone: 'bg-ink-900/25', urgent: false },
  ];

  // -- 2 · Lead funnel -------------------------------------------------------
  const funnel = enquiryStatuses
    .filter((s) => s !== 'Lost')
    .map((stage, i, all) => {
      const n = by((e) => e.status === stage).length;
      const prev = i === 0 ? null : by((e) => e.status === all[i - 1]).length;
      return {
        stage,
        n,
        pct: share(n),
        fromPrev: prev ? Math.round((n / prev) * 100) : null,
        worth: value(by((e) => e.status === stage)),
      };
    });

  // -- 3 · Sales performance -------------------------------------------------
  const metricLabel = { revenue: 'Revenue', closings: 'Closings', customers: 'Customers', avgDeal: 'Average deal' }[metric];
  const chart = salesTrend.map((d) => ({
    ...d,
    avgDeal: d.closings ? Math.round(d.revenue / d.closings) : 0,
  }));
  const money = metric === 'revenue' || metric === 'avgDeal';

  // -- 4 · Lead source performance ------------------------------------------
  const sourceRows = sourcesUsed
    .map((s) => {
      const all = by((e) => e.source === s);
      const qualified = all.filter((e) => !['New', 'Lost'].includes(e.status)).length;
      const pres = all.filter((e) => ['Presentation', 'Visit scheduled', 'Closing', 'Won'].includes(e.status)).length;
      const w = all.filter((e) => e.status === 'Won');
      return {
        source: s,
        leads: all.length,
        qualified,
        presentations: pres,
        won: w.length,
        conversion: all.length ? Math.round((w.length / all.length) * 100) : 0,
        revenue: value(w),
      };
    })
    .sort((a, b) => b.leads - a.leads);

  // -- 5 · Sales team performance -------------------------------------------
  const rankKey = {
    revenue: (m) => Number(m.revenue || 0),
    closings: (m) => Number(m.bookings || 0),
    conversion: (m) => {
      const mine = rows.filter((e) => e.owner === m.name.split(' ')[0]);
      return mine.length ? (mine.filter((e) => e.status === 'Won').length / mine.length) * 100 : 0;
    },
    target: (m) => (m.target ? (m.revenue / m.target) * 100 : 0),
  }[rankBy];
  const league = [...team].sort((a, b) => rankKey(b) - rankKey(a));

  // -- 6 · Today's activity --------------------------------------------------
  const feed = salesActivity.filter((a) => feedKind === 'All' || a.kind === feedKind);

  // -- 7 · Follow-up management ---------------------------------------------
  const priorityOf = (e) => {
    if (e.status === 'Lost' || e.status === 'Won') return 'Upcoming';
    if (e.priority === 'High') return 'Overdue';
    if (e.priority === 'Medium') return 'Due today';
    return 'Due tomorrow';
  };
  const dueRows = open.filter((e) => priorityOf(e) === duePriority);

  // -- 8 · Pipeline value ----------------------------------------------------
  const weighted = open.reduce((s, e) => s + Number(e.budget || 0) * (stageProbability[e.status] || 0), 0);
  const highProbability = open.filter((e) => (stageProbability[e.status] || 0) >= 0.55);

  // -- 10 · Conversion analytics --------------------------------------------
  const reached = (stage) => {
    const from = enquiryStatuses.indexOf(stage);
    return by((e) => {
      const at = enquiryStatuses.indexOf(e.status);
      return e.status !== 'Lost' && at >= from;
    }).length;
  };
  const steps = [
    ['Lead → Contacted', 'New', 'Contacted'],
    ['Contacted → Interested', 'Contacted', 'Interested'],
    ['Interested → Details sent', 'Interested', 'Details sent'],
    ['Details sent → Presentation', 'Details sent', 'Presentation'],
    ['Presentation → Visit', 'Presentation', 'Visit scheduled'],
    ['Visit → Closing', 'Visit scheduled', 'Closing'],
    ['Lead → Customer', 'New', 'Won'],
  ].map(([label, from, to]) => {
    const a = reached(from);
    const b = reached(to);
    return { label, value: a ? Math.round((b / a) * 100) : 0, display: `${b} of ${a}` };
  });

  const primary = [
    { icon: Plus, label: 'Add lead', run: actions.add },
    { icon: Upload, label: 'Import leads', run: actions.importLeads },
    { icon: CalendarPlus, label: 'Create follow-up', run: () => actions.note('Follow-up scheduled') },
    { icon: UserCheck, label: 'Assign leads', run: actions.assign },
    { icon: FileText, label: 'Schedule presentation', run: () => actions.note('Presentation scheduled') },
    { icon: UserPlus, label: 'Add customer', run: actions.addCustomer },
    { icon: ClipboardPlus, label: 'Create task', run: () => actions.note('Task created') },
    { icon: Wallet, label: 'Record payment', run: actions.recordPayment },
    { icon: MessageCircle, label: 'Send WhatsApp', run: actions.broadcast },
    { icon: Download, label: 'Export leads', run: actions.exportLeads },
  ];
  const bulk = ['Bulk assign', 'Bulk WhatsApp', 'Bulk follow-up', 'Bulk change stage', 'Bulk change source', 'Bulk export'];

  return (
    <div className="space-y-6">
      {/* Filters that drive every block below */}
      <div className="card flex flex-wrap items-center gap-2 px-4 py-3">
        <p className="eyebrow mr-1">Showing</p>
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`chip ${period === p ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600 hover:text-ink-900'}`}
          >
            {p}
          </button>
        ))}
        <select className="input ml-auto h-9 w-auto py-0 text-sm" value={who} onChange={(e) => setWho(e.target.value)}>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o === 'All' ? 'All consultants' : o}
            </option>
          ))}
        </select>
        <select className="input h-9 w-auto py-0 text-sm" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="All">All sources</option>
          {leadSources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* 1 · The headline: money, conversion, and what needs a person */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)_minmax(0,0.9fr)]">
        {/* Money, on the dark tile so the eye lands here first */}
        <section className="card relative overflow-hidden bg-ink-900 p-5 text-white">
          <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Sales revenue</p>
            <p className="num mt-2 font-display text-4xl font-extrabold leading-none">{inr(revenue)}</p>
            <p className="mt-1.5 text-sm text-white/60">
              from {won.length} won {won.length === 1 ? 'lead' : 'leads'} · average{' '}
              {won.length ? inr(Math.round(revenue / won.length)) : '—'}
            </p>

            <div className="mt-5">
              <p className="flex items-baseline justify-between text-xs font-semibold text-white/60">
                <span>Target {shortInr(target)}</span>
                <span className="num text-white">{achievement}%</span>
              </p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className={`h-full rounded-full ${achievement >= 100 ? 'bg-emerald-400' : 'bg-brand-400'}`}
                  style={{ width: `${Math.min(achievement, 100)}%` }}
                />
              </div>
            </div>

            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
              <Wallet size={14} className="text-white/70" />
              {pending ? `${inr(pending)} still to collect` : 'Everything collected'}
            </p>
          </div>
        </section>

        {/* How much of the pipeline actually turns into customers */}
        <section className="card flex flex-col justify-between p-5">
          <div>
            <p className="eyebrow">Lead to customer</p>
            <div className="mt-4">
              <Ring pct={share(won.length)} value={`${share(won.length)}%`} label={`${won.length} of ${total} leads booked`} />
            </div>
          </div>
          <ul className="mt-5 space-y-2 border-t border-ink-900/[0.07] pt-4">
            {[
              ['Contacted', total - fresh.length],
              ['Presentation stage', presented.length],
              ['Still open', open.length],
            ].map(([label, n]) => (
              <li key={label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-600">{label}</span>
                <span className="num font-bold text-ink-900">{n}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* The three things that want a person today */}
        <section className="card p-5">
          <p className="eyebrow">Needs a person today</p>
          <ul className="mt-4 space-y-3">
            {attention.map((a) => (
              <li key={a.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                <span className={`h-9 w-1.5 shrink-0 rounded-full ${a.tone}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink-900">{a.label}</span>
                  <span className="block truncate text-xs text-ink-500">{a.note}</span>
                </span>
                <span className={`num font-display text-2xl font-extrabold ${a.urgent ? 'text-rose-600' : 'text-ink-900'}`}>
                  {a.value}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Everything else, on one line instead of a wall of boxes */}
      <div className="card grid divide-y divide-ink-900/[0.07] sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-3 2xl:grid-cols-6 sm:[&>*:not(:first-child)]:border-l sm:[&>*]:border-ink-900/[0.07]">
        {glance.map((g) => (
          <div key={g.label} className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{g.label}</p>
            <p className="num mt-1.5 font-display text-2xl font-extrabold text-ink-900">{g.value}</p>
            <p className="mt-0.5 text-xs text-ink-400">{g.hint}</p>
          </div>
        ))}
      </div>

      {/* 11 · Quick actions, one calm bar */}
      <div className="card p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {primary.map((q) => (
            <button
              key={q.label}
              onClick={q.run}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-surface-soft hover:text-ink-900"
            >
              <q.icon size={15} className="text-ink-400" /> {q.label}
            </button>
          ))}
          <button
            onClick={() => setShowBulk((v) => !v)}
            className={`ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
              showBulk ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-surface-soft hover:text-ink-900'
            }`}
          >
            Bulk actions
          </button>
        </div>
        {showBulk && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-ink-900/[0.07] pt-2.5">
            <p className="eyebrow mr-1">On selected leads</p>
            {bulk.map((b) => (
              <button
                key={b}
                className="chip text-ink-600 hover:text-ink-900"
                onClick={() => actions.note(`${b} — pick the leads in the list first`)}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3 · Sales performance graph */}
      <Block
        title="Sales performance"
        note="Last 30 days — the bars are what closed, the line is the daily target"
        action={
          <div className="flex flex-wrap gap-1.5">
            {[
              ['revenue', 'Revenue'],
              ['closings', 'Closings'],
              ['customers', 'Customers'],
              ['avgDeal', 'Average deal'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={`chip ${metric === key ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600'}`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <Stat label="Today's sales" value={inr(chart[chart.length - 1]?.revenue || 0)} />
          <Stat label="This week" value={inr(chart.slice(-7).reduce((s, d) => s + d.revenue, 0))} />
          <Stat label="This month" value={inr(chart.reduce((s, d) => s + d.revenue, 0))} tone="text-brand-700" />
          <Stat label="Customers" value={chart.reduce((s, d) => s + d.customers, 0)} />
          <Stat
            label="Average deal"
            value={
              chart.reduce((s, d) => s + d.closings, 0)
                ? inr(Math.round(chart.reduce((s, d) => s + d.revenue, 0) / chart.reduce((s, d) => s + d.closings, 0)))
                : '—'
            }
          />
          <Stat label="Closing rate" value={`${share(won.length)}%`} hint={`${won.length} of ${total} leads`} />
        </div>

        <div className="mt-5 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#96a2b4' }} dy={6} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={money ? 58 : 34}
                tick={{ fontSize: 11, fill: '#96a2b4' }}
                tickFormatter={(v) => (money ? shortInr(v) : v)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(20,165,140,0.06)' }}
                formatter={(v, name) => [money && name === metricLabel ? inr(v) : v, name]}
                labelFormatter={(d) => `Day ${d}`}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey={metric} name={metricLabel} fill="#0b8472" radius={[6, 6, 3, 3]} maxBarSize={18} />
              {metric === 'revenue' && (
                <Line type="monotone" dataKey="target" name="Daily target" stroke="#f0a04b" strokeWidth={2} dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Target" value={inr(target)} />
          <Stat label="Achievement" value={`${achievement}%`} tone={achievement >= 100 ? 'text-emerald-600' : 'text-ink-900'} />
          <Stat
            label="Revenue per consultant"
            value={team.length ? inr(Math.round(revenue / team.length)) : '—'}
          />
        </div>
      </Block>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* 2 · Lead funnel */}
        <Block title="Lead funnel" note="Click a stage to open those leads in the list" wide>
          <ul className="space-y-1.5">
            {funnel.map((f) => (
              <li key={f.stage}>
                <button
                  onClick={() => onPickStatus(f.stage)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-soft"
                >
                  <span className="w-36 shrink-0">
                    <Badge tone={statusTone[f.stage]}>{f.stage}</Badge>
                  </span>
                  <span className="num w-16 shrink-0 text-sm font-bold text-ink-900">{f.n} leads</span>
                  <span className="num w-14 shrink-0 text-sm text-ink-500">{f.pct}%</span>
                  <span className="num w-28 shrink-0 text-sm text-ink-500">
                    {f.fromPrev == null ? '—' : `${f.fromPrev}% of last`}
                  </span>
                  <span className="num ml-auto text-sm font-semibold text-brand-700">
                    {f.worth ? inr(f.worth) : '—'}
                  </span>
                  <span className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
                    <span className="block h-full rounded-full bg-brand-500" style={{ width: `${f.pct}%` }} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-400">
            Drop-off is what does not carry to the next stage — the “% of last” column.
          </p>
        </Block>

        {/* 8 · Sales pipeline value */}
        <Block title="Money in the pipeline" note={`${inr(value(open))} across ${open.length} open leads`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Total pipeline" value={inr(value(open))} tone="text-brand-700" />
            <Stat label="Weighted pipeline" value={inr(Math.round(weighted))} hint="value × chance of closing" />
            <Stat label="High probability" value={highProbability.length} hint="presentation stage or better" />
            <Stat label="Expected this month" value={inr(Math.round(weighted))} />
          </div>
          <div className="mt-4">
            <List
              rows={OPEN.map((s) => {
                const list = by((e) => e.status === s);
                return {
                  label: `${s} · ${list.length}`,
                  value: value(list),
                  display: value(list) ? inr(value(list)) : '—',
                };
              })}
            />
          </div>
        </Block>

        {/* 4 · Lead source performance */}
        <Block title="Where the leads come from" note="Leads, how many qualified, and what they were worth" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Source', 'Leads', 'Qualified', 'Presentations', 'Won', 'Conversion', 'Revenue'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {sourceRows.map((r) => (
                  <tr key={r.source}>
                    <td className="py-2.5 font-bold text-ink-900">{r.source}</td>
                    <td className="num py-2.5 text-ink-700">{r.leads}</td>
                    <td className="num py-2.5 text-ink-700">{r.qualified}</td>
                    <td className="num py-2.5 text-ink-700">{r.presentations}</td>
                    <td className="num py-2.5 font-bold text-emerald-600">{r.won}</td>
                    <td className="num py-2.5 text-ink-700">{r.conversion}%</td>
                    <td className="num py-2.5 font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</td>
                  </tr>
                ))}
                {sourceRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-ink-500">
                      No leads in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Block>

        {/* 5 · Sales team performance */}
        <Block
          title="How the team is doing"
          note="Live leaderboard — click anyone to open their desk"
          wide
          action={
            <select className="input h-9 w-auto py-0 text-sm" value={rankBy} onChange={(e) => setRankBy(e.target.value)}>
              <option value="revenue">Rank by revenue</option>
              <option value="closings">Rank by closings</option>
              <option value="conversion">Rank by conversion</option>
              <option value="target">Rank by target achieved</option>
            </select>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Consultant', 'Status', 'Leads', 'Calls', 'Follow-ups', 'Present.', 'Visits', 'Closings', 'Revenue', 'Target'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {league.map((m) => {
                  const first = m.name.split(' ')[0];
                  const mine = rows.filter((e) => e.owner === first);
                  return (
                    <tr key={m.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => actions.openTeam()}>
                      <td className="py-2.5">
                        <span className="flex items-center gap-2.5">
                          <Avatar name={m.name} size="sm" />
                          <span className="font-bold text-ink-900">{m.name}</span>
                        </span>
                      </td>
                      <td className="py-2.5">
                        <Badge tone={m.live === 'Online' ? 'green' : m.live === 'Offline' ? 'slate' : 'sky'} dot>
                          {m.live}
                        </Badge>
                      </td>
                      <td className="num py-2.5 text-ink-700">{mine.length}</td>
                      <td className="num py-2.5 text-ink-700">{m.calls ?? 0}</td>
                      <td className="num py-2.5 text-ink-700">{m.followUps ?? 0}</td>
                      <td className="num py-2.5 text-ink-700">{m.presentations ?? 0}</td>
                      <td className="num py-2.5 text-ink-700">{m.visits ?? 0}</td>
                      <td className="num py-2.5 font-bold text-emerald-600">{m.bookings ?? 0}</td>
                      <td className="num py-2.5 font-bold text-brand-700">{m.revenue ? inr(m.revenue) : '—'}</td>
                      <td className="num py-2.5 text-ink-500">
                        {m.target ? `${Math.round((m.revenue / m.target) * 100)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Block>

        {/* 6 · Today's sales activity */}
        <Block
          title="What is happening today"
          note="Every call, follow-up and closing as it lands"
          action={
            <select className="input h-9 w-auto py-0 text-sm" value={feedKind} onChange={(e) => setFeedKind(e.target.value)}>
              {activityKinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          }
        >
          <ul className="space-y-2.5">
            {feed.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <span className="num w-16 shrink-0 pt-0.5 text-xs font-semibold text-ink-400">{a.at}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink-700">{a.text}</span>
                  <span className="block text-xs text-ink-400">
                    {a.who} · {a.kind}
                  </span>
                </span>
              </li>
            ))}
            {feed.length === 0 && <li className="py-6 text-center text-sm text-ink-500">Nothing of that kind today.</li>}
          </ul>
        </Block>

        {/* 7 · Follow-up management */}
        <Block
          title="Follow-ups"
          note={`${followUpsDue} due today · ${followUpsDone} done · ${followUpsOverdue} overdue`}
          wide
        >
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Due today" value={followUpsDue} />
            <Stat label="Completed" value={followUpsDone} tone="text-emerald-600" />
            <Stat label="Overdue" value={followUpsOverdue} tone={followUpsOverdue ? 'text-rose-600' : 'text-ink-900'} />
            <Stat
              label="Success rate"
              value={`${followUpsDue ? Math.round((followUpsDone / followUpsDue) * 100) : 0}%`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['Overdue', 'Due today', 'Due tomorrow', 'Upcoming'].map((p) => (
              <button
                key={p}
                onClick={() => setDuePriority(p)}
                className={`chip ${duePriority === p ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600'}`}
              >
                {p}
                <span className="num ml-1.5 text-ink-400">
                  {open.filter((e) => priorityOf(e) === p).length}
                </span>
              </button>
            ))}
          </div>

          <ul className="mt-4 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {dueRows.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <button onClick={() => onOpen(e)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <Avatar name={e.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-ink-900">{e.name}</span>
                    <span className="block truncate text-xs text-ink-500">
                      {e.owner} · last contact {e.lastContact || '—'} · next {e.nextFollowUp || '—'}
                    </span>
                  </span>
                </button>
                <Badge tone={statusTone[e.status]}>{e.status}</Badge>
                <Badge tone={e.priority === 'High' ? 'rose' : e.priority === 'Medium' ? 'amber' : 'slate'}>
                  {e.priority || 'Low'}
                </Badge>
                <span className="flex shrink-0 gap-1.5">
                  <a href={`tel:${String(e.phone).replace(/[^\d]/g, '')}`} className="icon-btn h-8 w-8" title="Call">
                    <Phone size={13} />
                  </a>
                  <a
                    href={`https://wa.me/${String(e.phone).replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-btn h-8 w-8 hover:border-emerald-400 hover:text-emerald-600"
                    title="WhatsApp"
                  >
                    <MessageCircle size={13} />
                  </a>
                  <button className="btn-ghost btn-sm" onClick={() => actions.note(`Follow-up on ${e.name} rescheduled`)}>
                    Reschedule
                  </button>
                </span>
              </li>
            ))}
            {dueRows.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink-500">Nothing in this bucket.</li>
            )}
          </ul>
        </Block>

        {/* 9 · Lost lead analysis */}
        <Block
          title="Why leads said no"
          note={lost.length ? `${lost.length} lost, worth ${inr(value(lost))}` : 'Nothing lost in this view'}
        >
          <List
            empty="No leads lost yet."
            rows={reasons
              .map((r) => {
                const n = lost.filter((e) => e.lostReason === r).length;
                return { label: r, value: n, display: `${n} leads`, tone: 'bg-rose-400' };
              })
              .sort((a, b) => b.value - a.value)}
          />
          {lost.length > 0 && (
            <div className="mt-4 border-t border-ink-900/[0.07] pt-3 text-sm text-ink-600">
              <p>
                Most lost through{' '}
                <b className="text-ink-900">
                  {sourcesUsed
                    .map((s) => ({ s, n: lost.filter((e) => e.source === s).length }))
                    .sort((a, b) => b.n - a.n)[0]?.s || '—'}
                </b>
              </p>
              <p className="mt-1">
                Lost by consultant:{' '}
                {[...new Set(lost.map((e) => e.owner))]
                  .map((o) => `${o} ${lost.filter((e) => e.owner === o).length}`)
                  .join(' · ')}
              </p>
            </div>
          )}
        </Block>

        {/* 10 · Conversion analytics */}
        <Block title="Conversion at each step" note="How many carry from one stage to the next" wide>
          <div className="grid gap-5 lg:grid-cols-2">
            <List rows={steps} empty="No leads to measure yet." />
            <div className="space-y-3">
              <Stat label="Overall lead to customer" value={`${share(won.length)}%`} hint={`${won.length} of ${total} leads`} />
              <Stat
                label="Presentation to customer"
                value={`${
                  reached('Presentation') ? Math.round((won.length / reached('Presentation')) * 100) : 0
                }%`}
              />
              <div className="rounded-xl bg-surface-soft px-4 py-3.5">
                <p className="text-xs font-semibold text-ink-500">The journey, in numbers</p>
                <p className="num mt-1 text-sm font-bold text-ink-800">
                  {total} leads → {reached('Presentation')} presentations → {reached('Visit scheduled')} visits →{' '}
                  {won.length} customers
                </p>
              </div>
              <div className="rounded-xl bg-surface-soft px-4 py-3.5">
                <p className="text-xs font-semibold text-ink-500">By consultant</p>
                <ul className="mt-1.5 space-y-1 text-sm text-ink-700">
                  {owners
                    .filter((o) => o !== 'All')
                    .map((o) => {
                      const mine = scoped.filter((e) => e.owner === o);
                      const w = mine.filter((e) => e.status === 'Won').length;
                      return (
                        <li key={o} className="flex justify-between gap-3">
                          <span>{o}</span>
                          <span className="num font-bold text-ink-900">
                            {mine.length ? Math.round((w / mine.length) * 100) : 0}%
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          </div>
        </Block>
      </div>
    </div>
  );
}
