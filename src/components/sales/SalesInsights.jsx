import { useState } from 'react';
import {
  Users,
  UserPlus,
  PhoneCall,
  Trophy,
  XCircle,
  IndianRupee,
  Filter,
  TrendingUp,
  Radio,
  UsersRound,
  Activity,
  BellRing,
  Layers,
  PieChart,
  Upload,
  Plus,
  UserCheck,
  MessageCircle,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { statusTone, enquiryStatuses, inr, shortInr } from '../../data/mockData.js';

/** Label, value and a proportional bar — the one chart shape this panel uses. */
function Bars({ rows, max, tone = 'bg-brand-500', empty = 'Nothing to show yet.' }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-ink-500">{empty}</p>;
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-semibold text-ink-700">{r.label}</span>
            <span className="num shrink-0 text-sm font-bold text-ink-900">
              {r.display ?? r.value}
              {r.note && <span className="ml-1.5 text-xs font-semibold text-ink-500">{r.note}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-soft">
            <div
              className={`h-full rounded-full transition-all ${r.tone || tone}`}
              style={{ width: `${Math.round((r.value / top) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The blocks from the client's Sales & Leads sheet, but shown one at a time
 * behind tabs rather than stacked ten deep. The page stays one screen tall
 * and the lead list is never more than a scroll away.
 */
export default function SalesInsights({ rows, bookings, team, activeStatus, onPickStatus, actions }) {
  const [tab, setTab] = useState('funnel');

  const total = rows.length;
  const by = (fn) => rows.filter(fn);
  const share = (n) => (total ? Math.round((n / total) * 100) : 0);
  const value = (list) => list.reduce((s, e) => s + Number(e.budget || 0), 0);

  const fresh = by((e) => e.status === 'New');
  const contacted = by((e) => e.status !== 'New');
  const won = by((e) => e.status === 'Booked');
  const lost = by((e) => e.status === 'Lost');
  const open = by((e) => !['Booked', 'Lost'].includes(e.status));

  const sources = [...new Set(rows.map((e) => e.source).filter(Boolean))];
  const labels = [...new Set(rows.map((e) => e.label).filter(Boolean))];
  const owners = [...new Set(rows.map((e) => e.owner).filter(Boolean))];

  const activity = team.reduce(
    (a, m) => ({
      calls: a.calls + Number(m.calls || 0),
      followUps: a.followUps + Number(m.followUps || 0),
      presentations: a.presentations + Number(m.presentations || 0),
      visits: a.visits + Number(m.visits || 0),
    }),
    { calls: 0, followUps: 0, presentations: 0, visits: 0 }
  );

  const kpis = [
    { icon: Users, label: 'Total leads', value: total, hint: 'in this view' },
    { icon: UserPlus, label: 'New', value: fresh.length, hint: 'never contacted', alert: fresh.length > 0 },
    { icon: PhoneCall, label: 'Contacted', value: contacted.length, hint: `${share(contacted.length)}% of leads` },
    { icon: Trophy, label: 'Converted', value: won.length, hint: `${share(won.length)}% win rate` },
    { icon: XCircle, label: 'Lost', value: lost.length, hint: `${share(lost.length)}% of leads` },
    { icon: IndianRupee, label: 'Pipeline value', value: shortInr(value(open)), hint: 'still open' },
  ];

  const tabs = [
    { key: 'funnel', label: 'Lead funnel', icon: Filter },
    { key: 'performance', label: 'Sales performance', icon: TrendingUp },
    { key: 'sources', label: 'Sources', icon: Radio },
    { key: 'team', label: 'Team', icon: UsersRound },
    { key: 'activity', label: 'Activity today', icon: Activity },
    { key: 'followups', label: 'Follow-ups', icon: BellRing },
    { key: 'pipeline', label: 'Pipeline value', icon: Layers },
    { key: 'lost', label: 'Lost leads', icon: XCircle },
    { key: 'conversion', label: 'Conversion', icon: PieChart },
  ];

  const hint = {
    funnel: 'Click a stage to filter the list below',
    performance: 'What the desk has actually closed',
    sources: 'Which channels bring business',
    team: 'Leads and revenue per consultant',
    activity: "Today's calls, follow-ups and visits",
    followups: 'Leads waiting on a chase',
    pipeline: 'Money sitting at each stage',
    lost: 'Where leads are being lost',
    conversion: 'Win rate by trip type',
  }[tab];

  return (
    <div>
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="card px-4 py-3.5">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink-500">
              <k.icon size={13} className="shrink-0 text-ink-400" /> {k.label}
            </p>
            <p
              className={`num mt-1.5 font-display text-2xl font-extrabold leading-none ${
                k.alert ? 'text-rose-600' : 'text-ink-900'
              }`}
            >
              {k.value}
            </p>
            <p className="mt-1 truncate text-xs text-ink-400">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Quick actions, kept to one line */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-ghost btn-sm" onClick={actions.assign}>
          <UserCheck size={14} /> Assign unassigned
        </button>
        <button className="btn-ghost btn-sm" onClick={actions.broadcast}>
          <MessageCircle size={14} /> WhatsApp blast
        </button>
        <button className="btn-ghost btn-sm" onClick={actions.importLeads}>
          <Upload size={14} /> Import leads
        </button>
        <button className="btn-ghost btn-sm" onClick={actions.add}>
          <Plus size={14} /> Add enquiry
        </button>
      </div>

      {/* One panel, one view at a time */}
      <section className="card mt-5 overflow-hidden">
        <div className="no-scrollbar flex overflow-x-auto border-b border-ink-900/[0.07] bg-surface-soft/50">
          {tabs.map(({ key, label, icon: Icon }) => {
            const on = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${
                  on
                    ? 'border-brand-600 bg-white text-brand-700'
                    : 'border-transparent text-ink-500 hover:text-ink-800'
                }`}
              >
                <Icon size={15} strokeWidth={2.2} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
          <h2 className="font-display text-base font-extrabold text-ink-900">
            {tabs.find((t) => t.key === tab).label}
          </h2>
          <p className="text-xs text-ink-500">{hint}</p>
        </div>

        <div className="px-5 pb-5 pt-4">
          {tab === 'funnel' && (
            <ul className="space-y-3">
              {enquiryStatuses.map((status) => {
                const n = by((e) => e.status === status).length;
                const on = activeStatus === status;
                return (
                  <li key={status}>
                    <button
                      onClick={() => onPickStatus(status)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-left transition ${
                        on ? 'bg-brand-50 ring-1 ring-brand-600/25' : 'hover:bg-surface-soft'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge tone={statusTone[status]}>{status}</Badge>
                        <span className="num text-sm">
                          <b className="text-ink-900">{n}</b>
                          <span className="ml-1.5 text-xs text-ink-500">{share(n)}%</span>
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-soft">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${share(n)}%` }} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === 'performance' && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Won value', value: inr(value(won)) },
                  { label: 'Average deal', value: won.length ? inr(Math.round(value(won) / won.length)) : '—' },
                  { label: 'Win rate', value: `${share(won.length)}%` },
                  { label: 'Trips confirmed', value: bookings.length },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-surface-soft px-4 py-3.5">
                    <p className="text-xs font-semibold text-ink-500">{s.label}</p>
                    <p className="num mt-1 font-display text-xl font-extrabold text-ink-900">{s.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-ink-600">
                {won.length} of {total} enquiries became trips worth {inr(value(won))}.
              </p>
            </>
          )}

          {tab === 'sources' && (
            <Bars
              rows={sources
                .map((s) => {
                  const all = by((e) => e.source === s);
                  const w = all.filter((e) => e.status === 'Booked').length;
                  return {
                    label: s,
                    value: all.length,
                    display: all.length,
                    note: `· ${w} won`,
                    tone: w > 0 ? 'bg-brand-500' : 'bg-ink-900/20',
                  };
                })
                .sort((a, b) => b.value - a.value)}
            />
          )}

          {tab === 'team' && (
            <Bars
              rows={owners
                .map((o) => {
                  const all = by((e) => e.owner === o);
                  const w = all.filter((e) => e.status === 'Booked').length;
                  const rev = bookings
                    .filter((b) => b.owner === o)
                    .reduce((s, b) => s + Number(b.amount || 0), 0);
                  return {
                    label: o,
                    value: all.length,
                    display: all.length,
                    note: rev ? `· ${shortInr(rev)}` : `· ${w} won`,
                    tone: o === 'Unassigned' ? 'bg-rose-400' : 'bg-brand-500',
                  };
                })
                .sort((a, b) => b.value - a.value)}
            />
          )}

          {tab === 'activity' && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Calls', value: activity.calls },
                  { label: 'Follow-ups', value: activity.followUps },
                  { label: 'Itineraries sent', value: activity.presentations },
                  { label: 'Customer visits', value: activity.visits },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-surface-soft px-4 py-3.5 text-center">
                    <p className="num font-display text-2xl font-extrabold text-ink-900">{s.value}</p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-ink-600">
                Across {team.filter((m) => m.status === 'Active').length} active desks today.
              </p>
            </>
          )}

          {tab === 'followups' && (
            <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
              {open.slice(0, 8).map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink-900">{e.name}</span>
                    <span className="block truncate text-xs text-ink-500">
                      {e.destination} · {e.pax} pax · {e.owner}
                    </span>
                  </span>
                  <span className="num hidden shrink-0 text-sm font-semibold text-ink-700 sm:block">
                    {inr(e.budget)}
                  </span>
                  <Badge tone={statusTone[e.status]}>{e.status}</Badge>
                </li>
              ))}
              {open.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-ink-500">
                  Nothing waiting on a follow-up.
                </li>
              )}
            </ul>
          )}

          {tab === 'pipeline' && (
            <Bars
              rows={enquiryStatuses
                .filter((s) => !['Booked', 'Lost'].includes(s))
                .map((s) => {
                  const v = value(by((e) => e.status === s));
                  return { label: s, value: v, display: v ? inr(v) : '—' };
                })}
            />
          )}

          {tab === 'lost' && (
            <Bars
              tone="bg-rose-400"
              empty="No leads lost in this view."
              rows={sources
                .map((s) => ({ label: s, value: lost.filter((e) => e.source === s).length }))
                .filter((r) => r.value > 0)
                .sort((a, b) => b.value - a.value)}
            />
          )}

          {tab === 'conversion' && (
            <Bars
              empty="No labelled enquiries yet."
              max={100}
              rows={labels
                .map((l) => {
                  const all = by((e) => e.label === l);
                  const w = all.filter((e) => e.status === 'Booked').length;
                  const rate = all.length ? Math.round((w / all.length) * 100) : 0;
                  return { label: l, value: rate, display: `${rate}%`, note: `of ${all.length}` };
                })
                .sort((a, b) => b.value - a.value)}
            />
          )}
        </div>
      </section>
    </div>
  );
}
