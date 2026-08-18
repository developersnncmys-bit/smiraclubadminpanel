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
  Zap,
  Upload,
  Plus,
  UserCheck,
  Download,
  MessageCircle,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { statusTone, enquiryStatuses, inr, shortInr } from '../../data/mockData.js';

/** Card wrapper so every block on the page reads the same. */
function Panel({ icon: Icon, eyebrow, title, hint, children, className = '' }) {
  return (
    <section className={`card flex flex-col p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Icon size={17} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-0.5 font-display text-[0.95rem] font-extrabold leading-tight text-ink-900">
            {title}
          </h2>
        </div>
        {hint && <span className="shrink-0 text-xs font-semibold text-ink-400">{hint}</span>}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

/** Label, value and a proportional bar — used by most blocks here. */
function Bars({ rows, max, tone = 'bg-brand-500', empty = 'Nothing yet' }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="text-sm text-ink-500">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-semibold text-ink-700">{r.label}</span>
            <span className="num shrink-0 text-sm font-bold text-ink-900">
              {r.display ?? r.value}
              {r.note && <span className="ml-1.5 text-xs font-semibold text-ink-500">{r.note}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
            <div
              className={`h-full rounded-full ${r.tone || tone}`}
              style={{ width: `${Math.round((r.value / top) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The eleven blocks the client listed on their Sales & Leads sheet, in their
 * order. Everything is counted from the enquiries, bookings and team records
 * on screen, so nothing here can drift from the list underneath.
 */
export default function SalesInsights({ rows, bookings, team, activeStatus, onPickStatus, actions }) {
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

  return (
    <div className="space-y-5">
      {/* 1 — Top KPI cards */}
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

      <div className="grid gap-5 xl:grid-cols-2">
        {/* 2 — Lead funnel */}
        <Panel icon={Filter} eyebrow="Pipeline" title="Lead funnel" hint="Click a stage to filter">
          <ul className="space-y-2.5">
            {enquiryStatuses.map((status) => {
              const n = by((e) => e.status === status).length;
              const on = activeStatus === status;
              return (
                <li key={status}>
                  <button
                    onClick={() => onPickStatus(status)}
                    className={`w-full rounded-xl px-3 py-2 text-left transition ${
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
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${share(n)}%` }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* 3 — Sales performance */}
        <Panel icon={TrendingUp} eyebrow="Results" title="Sales performance">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Won value', value: inr(value(won)) },
              { label: 'Average deal', value: won.length ? inr(Math.round(value(won) / won.length)) : '—' },
              { label: 'Win rate', value: `${share(won.length)}%` },
              { label: 'Trips confirmed', value: bookings.length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-surface-soft px-3.5 py-3">
                <p className="text-xs font-semibold text-ink-500">{s.label}</p>
                <p className="num mt-1 font-display text-lg font-extrabold text-ink-900">{s.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-500">
            {won.length} of {total} enquiries became trips worth {inr(value(won))}.
          </p>
        </Panel>

        {/* 4 — Lead source performance */}
        <Panel icon={Radio} eyebrow="Channels" title="Lead source performance">
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
        </Panel>

        {/* 5 — Sales team performance */}
        <Panel icon={UsersRound} eyebrow="Desk" title="Sales team performance">
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
        </Panel>

        {/* 6 — Today's sales activity */}
        <Panel icon={Activity} eyebrow="Today" title="Sales activity today">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Calls', value: activity.calls },
              { label: 'Follow-ups', value: activity.followUps },
              { label: 'Itineraries', value: activity.presentations },
              { label: 'Visits', value: activity.visits },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-surface-soft px-3 py-2.5 text-center">
                <p className="num font-display text-xl font-extrabold text-ink-900">{s.value}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-ink-500">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-500">
            Across {team.filter((m) => m.status === 'Active').length} active desks.
          </p>
        </Panel>

        {/* 7 — Follow-up management */}
        <Panel icon={BellRing} eyebrow="Chasing" title="Follow-up management" hint={`${open.length} open`}>
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {open.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink-900">{e.name}</span>
                  <span className="block truncate text-xs text-ink-500">
                    {e.destination} · {e.owner}
                  </span>
                </span>
                <Badge tone={statusTone[e.status]}>{e.status}</Badge>
              </li>
            ))}
            {open.length === 0 && (
              <li className="px-3.5 py-4 text-sm text-ink-500">Nothing waiting on a follow-up.</li>
            )}
          </ul>
        </Panel>

        {/* 8 — Sales pipeline value */}
        <Panel icon={Layers} eyebrow="Money" title="Sales pipeline value" hint={shortInr(value(open))}>
          <Bars
            rows={enquiryStatuses
              .filter((s) => !['Booked', 'Lost'].includes(s))
              .map((s) => {
                const v = value(by((e) => e.status === s));
                return { label: s, value: v, display: v ? inr(v) : '—' };
              })}
          />
        </Panel>

        {/* 9 — Lost lead analysis */}
        <Panel
          icon={XCircle}
          eyebrow="Losses"
          title="Lost lead analysis"
          hint={lost.length ? `${shortInr(value(lost))} lost` : 'none'}
        >
          <Bars
            tone="bg-rose-400"
            empty="No leads lost in this view."
            rows={sources
              .map((s) => ({ label: s, value: lost.filter((e) => e.source === s).length }))
              .filter((r) => r.value > 0)
              .sort((a, b) => b.value - a.value)}
          />
        </Panel>

        {/* 10 — Conversion analytics */}
        <Panel icon={PieChart} eyebrow="Analytics" title="Conversion analytics">
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
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)}
          />
        </Panel>

        {/* 11 — Quick actions */}
        <Panel icon={Zap} eyebrow="Shortcuts" title="Quick actions">
          <div className="grid grid-cols-2 gap-2.5">
            <button className="btn-primary justify-start" onClick={actions.add}>
              <Plus size={15} /> Add enquiry
            </button>
            <button className="btn-ghost justify-start" onClick={actions.importLeads}>
              <Upload size={15} /> Import leads
            </button>
            <button className="btn-ghost justify-start" onClick={actions.assign}>
              <UserCheck size={15} /> Assign owner
            </button>
            <button className="btn-ghost justify-start" onClick={actions.broadcast}>
              <MessageCircle size={15} /> WhatsApp blast
            </button>
            <button className="btn-ghost col-span-2 justify-start" onClick={actions.exportCsv}>
              <Download size={15} /> Export this view
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
