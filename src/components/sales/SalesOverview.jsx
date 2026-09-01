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
import { MessageCircle, Phone, Wallet } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import Block from '../ui/Block.jsx';
import Stat from '../ui/Stat.jsx';
import {
  statusTone,
  enquiryStatuses,
  stageProbability,
  salesTrend,
  salesActivity,
  activityKinds,
  inr,
  shortInr,
} from '../../data/mockData.js';

const OPEN = enquiryStatuses.filter((s) => !['Won', 'Lost'].includes(s));

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

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(11,21,36,0.06)',
  boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
  fontSize: 12,
  fontWeight: 600,
};

/**
 * Every block the client's Sales & Leads sheet asks for, but four views deep
 * rather than one long scroll: the numbers and the actions stay on screen, and
 * the pipeline, the performance, the team and today each get their own page.
 */
export default function SalesOverview({ view = 'Pipeline', rows, bookings, invoices = [], team, signups = [], onPickStatus, onOpen, actions }) {
  const [metric, setMetric] = useState('revenue');
  const [lostBy, setLostBy] = useState('Reason');
  const [rankBy, setRankBy] = useState('revenue');
  const [feedKind, setFeedKind] = useState('All');
  const [duePriority, setDuePriority] = useState('Overdue');

  // The page has already applied the desk filters.
  const scoped = rows;

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

  const attention = [
    { label: 'New leads', value: fresh.length, note: 'nobody has called them', tone: 'bg-rose-500', urgent: fresh.length > 0 },
    { label: 'Follow-ups due', value: followUpsDue, note: `${followUpsOverdue} already overdue`, tone: 'bg-amber-500', urgent: followUpsOverdue > 0 },
    { label: 'Lost leads', value: lost.length, note: `${share(lost.length)}% of everything`, tone: 'bg-ink-900/25', urgent: false },
  ];

  // -- Lead funnel -----------------------------------------------------------
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

  // -- Lost leads, cut the way the sheet asks --------------------------------
  const monthOf = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };
  const planOf = (e) => signups.find((sg) => sg.customer === e.name || sg.name === e.name)?.plan || 'Not a member';
  const daysToLose = (e) => {
    const from = new Date(e.created);
    const to = new Date(e.lastContact);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
    return Math.max(0, Math.round((to - from) / 86400000));
  };
  const lostDays = lost.map(daysToLose).filter((d) => d != null);
  const avgLostDays = lostDays.length
    ? Math.round(lostDays.reduce((a, b) => a + b, 0) / lostDays.length)
    : null;

  const lostCut = {
    Reason: (e) => e.lostReason || 'Not recorded',
    Executive: (e) => e.owner || 'Unassigned',
    Source: (e) => e.source || 'Unknown',
    Destination: (e) => e.destination || '—',
    Membership: planOf,
    Month: (e) => monthOf(e.lastContact || e.created),
  }[lostBy];
  const lostRows = [...new Set(lost.map(lostCut))]
    .map((label) => {
      const mine = lost.filter((e) => lostCut(e) === label);
      return {
        label,
        value: mine.length,
        display: `${mine.length} · ${inr(value(mine))}`,
        tone: 'bg-rose-400',
      };
    })
    .sort((a, b) => b.value - a.value);

  // -- Sales performance -----------------------------------------------------
  const metricLabel = { revenue: 'Revenue', closings: 'Closings', customers: 'Customers', avgDeal: 'Average deal' }[metric];
  const chart = salesTrend.map((d) => ({
    ...d,
    avgDeal: d.closings ? Math.round(d.revenue / d.closings) : 0,
  }));
  const money = metric === 'revenue' || metric === 'avgDeal';

  // -- Lead source performance ----------------------------------------------
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

  // -- Sales team performance ------------------------------------------------
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

  // -- Today's activity ------------------------------------------------------
  const feed = salesActivity.filter((a) => feedKind === 'All' || a.kind === feedKind);

  // -- Follow-up management --------------------------------------------------
  const priorityOf = (e) => {
    if (e.status === 'Lost' || e.status === 'Won') return 'Upcoming';
    if (e.priority === 'High') return 'Overdue';
    if (e.priority === 'Medium') return 'Due today';
    return 'Due tomorrow';
  };
  const dueRows = open.filter((e) => priorityOf(e) === duePriority);

  // -- Pipeline value --------------------------------------------------------
  const weighted = open.reduce((s, e) => s + Number(e.budget || 0) * (stageProbability[e.status] || 0), 0);
  const highProbability = open.filter((e) => (stageProbability[e.status] || 0) >= 0.55);

  // -- Conversion analytics --------------------------------------------------
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


  return (
    <div className="space-y-5">
      {/* ================================================================== */}
      {/* Pipeline — the money, the funnel and what needs a person           */}
      {/* ================================================================== */}
      {view === 'Pipeline' && (
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)_minmax(0,0.9fr)]">
            <section className="card relative overflow-hidden p-5">
              <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/10 blur-2xl" />
              <div className="relative">
                <p className="eyebrow">Sales revenue</p>
                <p className="num mt-2 font-display text-4xl font-extrabold leading-none text-ink-900">{inr(revenue)}</p>
                <p className="mt-1.5 text-sm text-ink-500">
                  from {won.length} won {won.length === 1 ? 'lead' : 'leads'} · average{' '}
                  {won.length ? inr(Math.round(revenue / won.length)) : '—'}
                </p>

                <div className="mt-5">
                  <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                    <span>Target {shortInr(target)}</span>
                    <span className="num">{achievement}%</span>
                  </p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                    <div
                      className={`h-full rounded-full ${achievement >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(achievement, 100)}%` }}
                    />
                  </div>
                </div>

                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-sm">
                  <Wallet size={14} className="text-ink-400" />
                  {pending ? `${inr(pending)} still to collect` : 'Everything collected'}
                </p>
              </div>
            </section>

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

          <div className="grid gap-5 xl:grid-cols-2">
            <Block title="Lead funnel" note="Click a stage to open those leads in the list">
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
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* Performance — the graph and the conversion at each step            */}
      {/* ================================================================== */}
      {view === 'Performance' && (
        <div className="space-y-5">
          <Block
            title="Sales performance"
            note="Last 30 days — the bars are what closed, the line is the daily target"
            action={
              <div className="seg">
                {[
                  ['revenue', 'Revenue'],
                  ['closings', 'Closings'],
                  ['customers', 'Customers'],
                  ['avgDeal', 'Average deal'],
                ].map(([key, label]) => (
                  <button key={key} onClick={() => setMetric(key)} className={`seg-item ${metric === key ? 'seg-item-on' : ''}`}>
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
              <Stat label="Revenue per consultant" value={team.length ? inr(Math.round(revenue / team.length)) : '—'} />
            </div>
          </Block>

          <Block title="Conversion at each step" note="How many carry from one stage to the next">
            <div className="grid gap-5 lg:grid-cols-2">
              <List rows={steps} empty="No leads to measure yet." />
              <div className="space-y-3">
                <Stat label="Overall lead to customer" value={`${share(won.length)}%`} hint={`${won.length} of ${total} leads`} />
                <Stat
                  label="Presentation to customer"
                  value={`${reached('Presentation') ? Math.round((won.length / reached('Presentation')) * 100) : 0}%`}
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
      )}

      {/* ================================================================== */}
      {/* Team & sources — who is selling, and where the leads come from     */}
      {/* ================================================================== */}
      {view === 'Team & sources' && (
        <div className="space-y-5">
          <Block
            title="How the team is doing"
            note="Live leaderboard — click anyone to open their desk"
            action={
              <select className="input h-9 w-auto py-0 text-sm" value={rankBy} onChange={(e) => setRankBy(e.target.value)}>
                <option value="revenue">Rank by revenue</option>
                <option value="closings">Rank by closings</option>
                <option value="conversion">Rank by conversion</option>
                <option value="target">Rank by target achieved</option>
              </select>
            }
          >
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr>
                    {['Consultant', 'Status', 'Leads', 'Calls', 'Follow-ups', 'Present.', 'Visits', 'Closings', 'Revenue', 'Target'].map((h) => (
                      <th key={h} className="th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {league.map((m) => {
                    const first = m.name.split(' ')[0];
                    const mine = rows.filter((e) => e.owner === first);
                    return (
                      <tr
                        key={m.id}
                        className="cursor-pointer border-b border-ink-900/[0.05] transition hover:bg-surface-soft"
                        onClick={() => actions.openTeam()}
                      >
                        <td className="td">
                          <span className="flex items-center gap-2.5">
                            <Avatar name={m.name} size="sm" />
                            <span className="font-bold text-ink-900">{m.name}</span>
                          </span>
                        </td>
                        <td className="td">
                          <Badge tone={m.live === 'Online' ? 'green' : m.live === 'Offline' ? 'slate' : 'sky'} dot>
                            {m.live}
                          </Badge>
                        </td>
                        <td className="td num">{mine.length}</td>
                        <td className="td num">{m.calls ?? 0}</td>
                        <td className="td num">{m.followUps ?? 0}</td>
                        <td className="td num">{m.presentations ?? 0}</td>
                        <td className="td num">{m.visits ?? 0}</td>
                        <td className="td num font-bold text-emerald-600">{m.bookings ?? 0}</td>
                        <td className="td num font-bold text-brand-700">{m.revenue ? inr(m.revenue) : '—'}</td>
                        <td className="td num text-ink-500">
                          {m.target ? `${Math.round((m.revenue / m.target) * 100)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Block>

          <div className="grid gap-5 xl:grid-cols-2">
            <Block title="Where the leads come from" note="Leads, how many qualified, and what they were worth">
              <div className="-mx-5 overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse">
                  <thead>
                    <tr>
                      {['Source', 'Leads', 'Qualified', 'Present.', 'Won', 'Conversion', 'Revenue'].map((h) => (
                        <th key={h} className="th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sourceRows.map((r) => (
                      <tr key={r.source} className="border-b border-ink-900/[0.05]">
                        <td className="td font-bold text-ink-900">{r.source}</td>
                        <td className="td num">{r.leads}</td>
                        <td className="td num">{r.qualified}</td>
                        <td className="td num">{r.presentations}</td>
                        <td className="td num font-bold text-emerald-600">{r.won}</td>
                        <td className="td num">{r.conversion}%</td>
                        <td className="td num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</td>
                      </tr>
                    ))}
                    {sourceRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="td py-6 text-center text-ink-500">No leads in this view.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Block>

            <Block
              title="Why leads said no"
              note={lost.length ? `${lost.length} lost, worth ${inr(value(lost))}` : 'Nothing lost in this view'}
              action={
                <div className="seg">
                  {['Reason', 'Executive', 'Source', 'Destination', 'Membership', 'Month'].map((k) => (
                    <button
                      key={k}
                      onClick={() => setLostBy(k)}
                      className={`seg-item ${lostBy === k ? 'seg-item-on' : ''}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              }
            >
              <List empty="No leads lost yet." rows={lostRows} />
              {lost.length > 0 && (
                <div className="mt-4 grid gap-3 border-t border-ink-900/[0.07] pt-3 sm:grid-cols-3">
                  <Stat
                    label="Average time before losing"
                    value={avgLostDays == null ? '—' : `${avgLostDays} days`}
                    hint="created to last contact"
                  />
                  <Stat
                    label="Top reason"
                    value={
                      [...new Set(lost.map((e) => e.lostReason).filter(Boolean))]
                        .map((r) => ({ r, n: lost.filter((e) => e.lostReason === r).length }))
                        .sort((a, b) => b.n - a.n)[0]?.r || '—'
                    }
                  />
                  <Stat label="Value lost" value={inr(value(lost))} tone="text-rose-600" />
                </div>
              )}
            </Block>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* Today — the feed and the follow-ups                                */}
      {/* ================================================================== */}
      {view === 'Today' && (
        <div className="space-y-5">
          <Block
            title="Follow-ups"
            note={`${followUpsDue} due today · ${followUpsDone} done · ${followUpsOverdue} overdue`}
          >
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Due today" value={followUpsDue} />
              <Stat label="Completed" value={followUpsDone} tone="text-emerald-600" />
              <Stat label="Overdue" value={followUpsOverdue} tone={followUpsOverdue ? 'text-rose-600' : 'text-ink-900'} />
              <Stat label="Success rate" value={`${followUpsDue ? Math.round((followUpsDone / followUpsDue) * 100) : 0}%`} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['Overdue', 'Due today', 'Due tomorrow', 'Upcoming'].map((p) => (
                <button
                  key={p}
                  onClick={() => setDuePriority(p)}
                  className={`chip border ${duePriority === p ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-900/10 bg-white text-ink-600'}`}
                >
                  {p}
                  <span className="num ml-1.5 text-ink-400">{open.filter((e) => priorityOf(e) === p).length}</span>
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
                    <button className="btn-line btn-sm" onClick={() => actions.note(`Follow-up on ${e.name} rescheduled`)}>
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
        </div>
      )}
    </div>
  );
}
