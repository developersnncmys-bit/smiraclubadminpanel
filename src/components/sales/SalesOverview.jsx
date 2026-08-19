import {
  Upload,
  Plus,
  UserCheck,
  MessageCircle,
  FileText,
  Download,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { statusTone, enquiryStatuses, inr, shortInr } from '../../data/mockData.js';

/** A plain box: one heading, one line saying what it means, then the content. */
function Block({ title, note, wide, children }) {
  return (
    <section className={`card p-5 ${wide ? 'xl:col-span-2' : ''}`}>
      <h3 className="font-display text-base font-extrabold text-ink-900">{title}</h3>
      {note && <p className="mt-0.5 text-sm text-ink-500">{note}</p>}
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

/** One big number with its caption. */
function Stat({ label, value, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

/**
 * The same blocks the client's sheet asks for, written the way the desk
 * talks: a plain heading, a line saying what the box means, and one number
 * per row. Two columns, no tabs, no jargon.
 */
export default function SalesOverview({ rows, bookings, team, onPickStatus, onOpen, actions }) {
  const total = rows.length;
  const by = (fn) => rows.filter(fn);
  const value = (list) => list.reduce((s, e) => s + Number(e.budget || 0), 0);

  const fresh = by((e) => e.status === 'New');
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
    { label: 'All leads', value: total },
    { label: 'Not contacted', value: fresh.length, tone: fresh.length ? 'text-rose-600' : 'text-ink-900' },
    { label: 'Talked to', value: total - fresh.length },
    { label: 'Became trips', value: won.length },
    { label: 'Lost', value: lost.length },
    { label: 'Money still open', value: shortInr(value(open)), tone: 'text-brand-700' },
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
      {/* The six numbers, in plain words */}
      <div className="grid gap-4 sm:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="card px-4 py-4">
            <p className="text-sm font-semibold text-ink-500">{k.label}</p>
            <p className={`num mt-1 font-display text-2xl font-extrabold ${k.tone || 'text-ink-900'}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="card flex flex-wrap items-center gap-2 px-4 py-3.5">
        <p className="eyebrow mr-1">Quick actions</p>
        {quick.map((q) => (
          <button key={q.label} className="btn-ghost btn-sm" onClick={q.run}>
            <q.icon size={14} /> {q.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Where the leads are now" note="Click a stage to see those leads in the list">
          <ul className="space-y-2">
            {enquiryStatuses.map((status) => {
              const n = by((e) => e.status === status).length;
              return (
                <li key={status}>
                  <button
                    onClick={() => onPickStatus(status)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-soft"
                  >
                    <Badge tone={statusTone[status]}>{status}</Badge>
                    <span className="num text-sm font-bold text-ink-900">{n} leads</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block title="What we sold" note="Leads that turned into confirmed trips">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Trips confirmed" value={bookings.length} />
            <Stat label="Value of those trips" value={inr(value(won))} tone="text-brand-700" />
            <Stat
              label="Average trip"
              value={won.length ? inr(Math.round(value(won) / won.length)) : '—'}
            />
            <Stat label="Out of every 100 leads" value={`${Math.round((won.length / (total || 1)) * 100)} book`} />
          </div>
        </Block>

        <Block title="Money waiting to be closed" note="What the open leads are worth, stage by stage">
          <List
            rows={enquiryStatuses
              .filter((s) => !['Booked', 'Lost'].includes(s))
              .map((s) => {
                const v = value(by((e) => e.status === s));
                return { label: s, value: v, display: v ? inr(v) : '—' };
              })}
          />
        </Block>

        <Block title="Where the leads come from" note="Leads received from each channel">
          <List
            rows={sources
              .map((s) => {
                const all = by((e) => e.source === s);
                const w = all.filter((e) => e.status === 'Booked').length;
                return {
                  label: s,
                  value: all.length,
                  display: `${all.length} leads${w ? ` · ${w} booked` : ''}`,
                };
              })
              .sort((a, b) => b.value - a.value)}
          />
        </Block>

        <Block title="How each person is doing" note="Leads they hold, and money they have booked">
          <ul className="space-y-3.5">
            {owners
              .map((o) => {
                const all = by((e) => e.owner === o);
                const rev = bookings
                  .filter((b) => b.owner === o)
                  .reduce((s, b) => s + Number(b.amount || 0), 0);
                return { owner: o, leads: all.length, rev };
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
                    <p className="num text-xs text-ink-500">{r.leads} leads</p>
                  </div>
                  <span className="num shrink-0 text-sm font-bold text-brand-700">
                    {r.rev ? inr(r.rev) : '—'}
                  </span>
                </li>
              ))}
          </ul>
        </Block>

        <Block title="What the team did today" note="Work logged by the desk since this morning">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Calls made" value={activity.calls} />
            <Stat label="Follow-ups done" value={activity.followUps} />
            <Stat label="Itineraries sent" value={activity.presentations} />
            <Stat label="Customers visited" value={activity.visits} />
          </div>
        </Block>

        <Block
          title="Who to call next"
          note={`${open.length} leads are still open — the biggest ones first`}
          wide
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
        </Block>

        <Block
          title="Why leads said no"
          note={lost.length ? `${lost.length} leads walked away, worth ${inr(value(lost))}` : 'Nothing lost so far'}
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
        </Block>

        <Block title="Which trips close best" note="Out of the leads asking for each kind of trip">
          <List
            empty="No trip types to compare yet."
            rows={labels
              .map((l) => {
                const all = by((e) => e.label === l);
                const w = all.filter((e) => e.status === 'Booked').length;
                return {
                  label: l,
                  value: all.length,
                  display: `${w} of ${all.length} booked`,
                  tone: w ? 'bg-brand-500' : 'bg-ink-900/15',
                };
              })
              .sort((a, b) => b.value - a.value)}
          />
        </Block>
      </div>
    </div>
  );
}
