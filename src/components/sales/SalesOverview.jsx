import {
  Users,
  UserPlus,
  PhoneCall,
  Trophy,
  XCircle,
  IndianRupee,
  Upload,
  Plus,
  UserCheck,
  MessageCircle,
  FileText,
  Download,
  ArrowRight,
} from 'lucide-react';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { statusTone, enquiryStatuses, inr, shortInr } from '../../data/mockData.js';

/** Label, value and a proportional bar — the one chart shape this page uses. */
function Bars({ rows, max, tone = 'bg-brand-500', empty = 'Nothing to show yet.' }) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-ink-500">{empty}</p>;
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3.5">
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
              className={`h-full rounded-full transition-all ${r.tone || tone}`}
              style={{ width: `${Math.round((r.value / top) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A number with its caption, on the soft fill. */
function Stat({ label, value, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

/**
 * Every block on the client's Sales & Leads sheet, laid out as one board:
 * the numbers at the top, then nine cards of the same shape so the page
 * reads left to right without a single nested tab.
 */
export default function SalesOverview({ rows, bookings, team, onPickStatus, onOpen, actions }) {
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
  const reasons = [...new Set(lost.map((e) => e.lostReason).filter(Boolean))];

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

  const quick = [
    { icon: Plus, label: 'Add lead', run: actions.add },
    { icon: Upload, label: 'Import leads', run: actions.importLeads },
    { icon: UserCheck, label: 'Assign unassigned', run: actions.assign },
    { icon: MessageCircle, label: 'WhatsApp blast', run: actions.broadcast },
    { icon: FileText, label: 'Open the lead list', run: actions.showList },
    { icon: Download, label: 'Export leads', run: actions.exportLeads },
  ];

  return (
    <div className="space-y-6">
      {/* 1 · Top KPI cards */}
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

      {/* 11 · Quick actions, up top where the desk starts its day */}
      <div className="card flex flex-wrap items-center gap-2 px-4 py-3.5">
        <p className="eyebrow mr-1">Quick actions</p>
        {quick.map((q) => (
          <button key={q.label} className="btn-ghost btn-sm" onClick={q.run}>
            <q.icon size={14} /> {q.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* 2 · Lead funnel */}
        <Card
          eyebrow="Lead funnel"
          title="Where every lead sits"
          subtitle="Click a stage to open it in the list"
        >
          <ul className="space-y-2.5">
            {enquiryStatuses.map((status) => {
              const n = by((e) => e.status === status).length;
              return (
                <li key={status}>
                  <button
                    onClick={() => onPickStatus(status)}
                    className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-surface-soft"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone={statusTone[status]}>{status}</Badge>
                      <span className="num text-sm">
                        <b className="text-ink-900">{n}</b>
                        <span className="ml-1.5 text-xs text-ink-500">{share(n)}%</span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-soft">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${share(n)}%` }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* 3 · Sales performance */}
        <Card eyebrow="Sales performance" title="What the desk closed" subtitle="Enquiries that became trips">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Won value" value={inr(value(won))} tone="text-brand-700" />
            <Stat
              label="Average deal"
              value={won.length ? inr(Math.round(value(won) / won.length)) : '—'}
            />
            <Stat label="Win rate" value={`${share(won.length)}%`} />
            <Stat label="Trips confirmed" value={bookings.length} />
          </div>
          <p className="mt-4 text-sm text-ink-600">
            {won.length} of {total} enquiries became trips worth {inr(value(won))}.
          </p>
        </Card>

        {/* 8 · Sales pipeline value */}
        <Card
          eyebrow="Sales pipeline value"
          title="Money still in play"
          subtitle={`${inr(value(open))} across ${open.length} open leads`}
        >
          <Bars
            rows={enquiryStatuses
              .filter((s) => !['Booked', 'Lost'].includes(s))
              .map((s) => {
                const v = value(by((e) => e.status === s));
                return { label: s, value: v, display: v ? inr(v) : '—' };
              })}
          />
        </Card>

        {/* 4 · Lead source performance */}
        <Card eyebrow="Lead source performance" title="Which channels bring business" subtitle="Leads, and how many closed">
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
        </Card>

        {/* 5 · Sales team performance */}
        <Card eyebrow="Sales team performance" title="Per consultant" subtitle="Leads held and revenue booked">
          <ul className="space-y-3">
            {owners
              .map((o) => {
                const all = by((e) => e.owner === o);
                const w = all.filter((e) => e.status === 'Booked').length;
                const rev = bookings
                  .filter((b) => b.owner === o)
                  .reduce((s, b) => s + Number(b.amount || 0), 0);
                return { owner: o, leads: all.length, won: w, rev };
              })
              .sort((a, b) => b.rev - a.rev || b.leads - a.leads)
              .map((r) => (
                <li key={r.owner} className="flex items-center gap-3">
                  {r.owner === 'Unassigned' ? (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500">
                      <UserPlus size={15} />
                    </span>
                  ) : (
                    <Avatar name={r.owner} size="sm" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{r.owner}</p>
                    <p className="num text-xs text-ink-500">
                      {r.leads} leads · {r.won} won
                    </p>
                  </div>
                  <span className="num shrink-0 text-sm font-bold text-brand-700">
                    {r.rev ? shortInr(r.rev) : '—'}
                  </span>
                </li>
              ))}
          </ul>
        </Card>

        {/* 6 · Today's sales activity */}
        <Card
          eyebrow="Today's sales activity"
          title="What the desk did today"
          subtitle={`${team.filter((m) => m.status === 'Active').length} desks active`}
        >
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Calls" value={activity.calls} />
            <Stat label="Follow-ups" value={activity.followUps} />
            <Stat label="Itineraries sent" value={activity.presentations} />
            <Stat label="Customer visits" value={activity.visits} />
          </div>
        </Card>

        {/* 7 · Follow-up management */}
        <Card
          eyebrow="Follow-up management"
          title="Waiting on a chase"
          subtitle={`${open.length} leads open`}
          className="xl:col-span-2"
        >
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {open
              .slice()
              .sort((a, b) => Number(b.budget || 0) - Number(a.budget || 0))
              .slice(0, 6)
              .map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => onOpen(e)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-soft"
                  >
                    <Avatar name={e.name} size="sm" />
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
                    <ArrowRight size={15} className="shrink-0 text-ink-300" />
                  </button>
                </li>
              ))}
            {open.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink-500">
                Nothing waiting on a follow-up.
              </li>
            )}
          </ul>
        </Card>

        {/* 9 · Lost lead analysis */}
        <Card
          eyebrow="Lost lead analysis"
          title="Why leads go"
          subtitle={lost.length ? `${inr(value(lost))} walked away` : 'Nothing lost in this view'}
        >
          <Bars
            tone="bg-rose-400"
            empty="No leads lost in this view."
            rows={reasons
              .map((r) => ({ label: r, value: lost.filter((e) => e.lostReason === r).length }))
              .sort((a, b) => b.value - a.value)}
          />
          {lost.length > 0 && (
            <p className="mt-4 border-t border-ink-900/[0.07] pt-3 text-xs text-ink-500">
              Most lost through{' '}
              <b className="text-ink-700">
                {sources
                  .map((s) => ({ s, n: lost.filter((e) => e.source === s).length }))
                  .sort((a, b) => b.n - a.n)[0]?.s || '—'}
              </b>
            </p>
          )}
        </Card>

        {/* 10 · Conversion analytics */}
        <Card
          eyebrow="Conversion analytics"
          title="Win rate by trip type"
          subtitle="Which trips actually close"
          className="xl:col-span-2"
        >
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
        </Card>
      </div>
    </div>
  );
}
