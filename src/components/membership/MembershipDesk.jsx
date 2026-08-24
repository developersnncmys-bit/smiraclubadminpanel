import { useState } from 'react';
import {
  UserPlus,
  Crown,
  CheckCircle2,
  UserCheck,
  CalendarClock,
  ArrowUpRight,
  Gift,
  Wallet,
  Search,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import {
  signupTone,
  activationStages,
  renewalStages,
  memberships as allPlans,
  benefitKinds,
  inr,
  shortInr,
} from '../../data/mockData.js';
import { daysUntil } from '../../lib/membership.js';

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

/** One number with its caption. */
function Stat({ label, value, hint, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-xl font-extrabold ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

/** Label, value, proportional bar. */
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
            <div className={`h-full rounded-full ${r.tone || 'bg-brand-500'}`} style={{ width: `${Math.round((r.value / top) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Membership management as the client's tab describes it: the members table
 * with their filters, the activation run, the renewal ladder, what benefits
 * have actually been used, and where the membership money comes from.
 */
export default function MembershipDesk({ rows, plans = allPlans, onOpen, actions }) {
  const [status, setStatus] = useState('All');
  const [plan, setPlan] = useState('All');
  const [expiring, setExpiring] = useState('All');
  const [query, setQuery] = useState('');

  const left = (m) => daysUntil(m.expiresOn);
  const isActive = (m) => m.status === 'Active' && (left(m) == null || left(m) >= 0);
  const isExpired = (m) => m.status === 'Expired' || (m.expiresOn && (left(m) ?? 0) < 0);

  const matches = (m) => {
    if (status !== 'All' && m.status !== status) return false;
    if (plan !== 'All' && m.plan !== plan) return false;
    if (expiring !== 'All') {
      const l = left(m);
      if (l == null || l < 0 || l > Number(expiring)) return false;
    }
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [m.name, m.id, m.phone, m.email, m.plan, m.expert].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  };
  const list = rows.filter(matches);

  const active = rows.filter(isActive);
  const pending = rows.filter((m) => m.activation && m.activation.stage !== 'Activated');
  const expired = rows.filter(isExpired);
  const revenue = rows.reduce((s, m) => s + Number(m.paid || 0), 0);
  const due = rows.reduce((s, m) => s + Math.max(0, Number(m.amount || 0) - Number(m.paid || 0)), 0);
  const soon = (days) => rows.filter((m) => { const l = left(m); return l != null && l >= 0 && l <= days; });

  const kpis = [
    { label: 'Members', value: rows.length, hint: `${active.length} active` },
    { label: 'Awaiting activation', value: pending.length, tone: pending.length ? 'text-amber-600' : undefined },
    { label: 'Expiring in 30 days', value: soon(30).length, tone: soon(30).length ? 'text-amber-600' : undefined },
    { label: 'Expired', value: expired.length, tone: expired.length ? 'text-rose-600' : undefined },
    { label: 'Membership revenue', value: shortInr(revenue), tone: 'text-brand-700' },
    { label: 'Still to collect', value: shortInr(due), tone: due ? 'text-amber-600' : undefined },
    {
      label: 'Average membership',
      value: rows.length ? inr(Math.round(rows.reduce((s, m) => s + Number(m.amount || 0), 0) / rows.length)) : '—',
    },
    { label: 'Benefits saving', value: shortInr(rows.reduce((s, m) => s + Number(m.saving || 0), 0)), hint: 'given to members' },
  ];

  const quick = [
    { icon: UserPlus, label: 'Add member', run: actions.addMember },
    { icon: Crown, label: 'Create membership', run: actions.createMembership },
    { icon: CheckCircle2, label: 'Activate membership', run: () => actions.note('Pick a member to activate') },
    { icon: UserCheck, label: 'Assign travel expert', run: () => actions.note('Pick a member to assign') },
    { icon: CalendarClock, label: 'Extend membership', run: () => actions.note('Pick a member to extend') },
    { icon: ArrowUpRight, label: 'Upgrade plan', run: () => actions.note('Pick a member to upgrade') },
    { icon: Gift, label: 'Add benefit', run: actions.editPlans },
    { icon: Wallet, label: 'Record payment', run: actions.recordPayment },
  ];

  const usedOf = (m) => (m.benefits || []).reduce((s, b) => s + Number(b.used || 0), 0);
  const allocatedOf = (m) => (m.benefits || []).reduce((s, b) => s + Number(b.allocated || 0), 0);

  return (
    <div className="space-y-6">
      {/* Numbers first */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {kpis.map((k) => (
          <div key={k.label} className="card px-4 py-4">
            <p className="text-sm font-semibold text-ink-500">{k.label}</p>
            <p className={`num mt-1 font-display text-2xl font-extrabold ${k.tone || 'text-ink-900'}`}>{k.value}</p>
            {k.hint && <p className="mt-0.5 text-xs text-ink-400">{k.hint}</p>}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card flex flex-wrap items-center gap-2 px-4 py-3.5">
        <p className="eyebrow mr-1">Quick actions</p>
        {quick.map((q) => (
          <button key={q.label} className="btn-ghost btn-sm" onClick={q.run}>
            <q.icon size={14} /> {q.label}
          </button>
        ))}
      </div>

      {/* The members table, with their filters */}
      <Block
        title="Members"
        note="Everyone on a plan, and where their membership stands"
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input h-9 w-44 py-0 pl-9 text-sm"
                placeholder="Search members…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="input h-9 w-auto py-0 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All statuses</option>
              {['Active', 'New', 'Quoted', 'Expired', 'Suspended'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select className="input h-9 w-auto py-0 text-sm" value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="All">All plans</option>
              {plans.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </select>
            <select className="input h-9 w-auto py-0 text-sm" value={expiring} onChange={(e) => setExpiring(e.target.value)}>
              <option value="All">Any expiry</option>
              <option value="7">Expiring in 7 days</option>
              <option value="15">Expiring in 15 days</option>
              <option value="30">Expiring in 30 days</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-ink-900/[0.07] text-left">
                {['Member', 'Membership', 'Status', 'Start date', 'Expiry', 'Rooms', 'Benefits used', 'Amount', 'Expert', ''].map((h) => (
                  <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[0.07]">
              {list.map((m) => {
                const l = left(m);
                const p = plans.find((x) => x.id === m.planId);
                return (
                  <tr key={m.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => onOpen(m)}>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={m.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-ink-900">{m.name}</span>
                          <span className="num block text-xs text-ink-400">{m.id}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1.5 font-semibold text-ink-800">
                        <Crown size={12} className="text-brand-600" /> {m.plan}
                      </span>
                      <span className="num block text-xs text-ink-400">{m.members} members</span>
                    </td>
                    <td className="py-2.5">
                      <Badge tone={signupTone[m.status] || 'slate'} dot>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="num py-2.5 text-ink-700">{m.startedOn || '—'}</td>
                    <td className="num py-2.5">
                      <span className="block text-ink-700">{m.expiresOn || '—'}</span>
                      {l != null && (
                        <span className={`block text-xs font-bold ${l < 0 ? 'text-rose-600' : l <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {l < 0 ? `expired ${Math.abs(l)}d ago` : `${l} days left`}
                        </span>
                      )}
                    </td>
                    <td className="num py-2.5 text-ink-700">{p?.rooms ?? '—'}</td>
                    <td className="num py-2.5 text-ink-700">
                      {usedOf(m)} of {allocatedOf(m)}
                    </td>
                    <td className="num py-2.5">
                      <span className="block font-bold text-ink-900">{inr(m.amount || 0)}</span>
                      {Number(m.paid || 0) < Number(m.amount || 0) && (
                        <span className="block text-xs font-bold text-amber-600">
                          {inr(Number(m.amount || 0) - Number(m.paid || 0))} due
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-ink-700">{m.expert || '—'}</td>
                    <td className="py-2.5 text-right">
                      <button className="btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(m); }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-ink-500">
                    No member matches this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Block>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Activation management */}
        <Block title="Activation" note="Every new membership, from payment to activated">
          <ul className="space-y-2">
            {activationStages.map((stage) => {
              const at = rows.filter((m) => m.activation?.stage === stage);
              return (
                <li key={stage} className="rounded-xl border border-ink-900/[0.07] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-ink-800">{stage}</span>
                    <span className="num text-sm font-bold text-ink-900">{at.length}</span>
                  </div>
                  {at.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onOpen(m)}
                      className="mt-2 flex w-full items-center gap-2.5 rounded-lg bg-surface-soft px-3 py-2 text-left"
                    >
                      <Avatar name={m.name} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink-800">{m.name}</span>
                        <span className="block truncate text-xs text-ink-500">
                          {m.plan} · expert {m.expert || 'not assigned'} · by {m.activation?.deadline}
                        </span>
                      </span>
                    </button>
                  ))}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-ink-400">
            Each membership tracks contact, explanation, documents and the welcome gift.
          </p>
        </Block>

        {/* Expiry and renewal */}
        <Block title="Expiry and renewal" note="Who to call, and how the renewal is going">
          <div className="grid gap-3 sm:grid-cols-2">
            {[45, 30, 15, 7].map((d) => (
              <Stat key={d} label={`Expiring in ${d} days`} value={soon(d).length} tone={soon(d).length ? 'text-amber-600' : 'text-ink-900'} />
            ))}
          </div>
          <div className="mt-4">
            <List
              empty="No renewals in flight."
              rows={renewalStages.map((stage) => ({
                label: stage,
                value: rows.filter((m) => m.renewal?.stage === stage).length,
                display: rows.filter((m) => m.renewal?.stage === stage).length,
                tone: stage === 'Renewal lost' ? 'bg-rose-400' : 'bg-brand-500',
              }))}
            />
          </div>
          <ul className="mt-4 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {rows
              .filter((m) => m.renewal?.stage && m.renewal.stage !== '—')
              .map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => onOpen(m)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                    <Avatar name={m.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                      <span className="block truncate text-xs text-ink-500">
                        {m.renewal.note || m.plan} · contacted {m.renewal.contactedOn}
                      </span>
                    </span>
                  </button>
                  <Badge tone={m.renewal.stage === 'Renewal lost' ? 'rose' : 'sky'}>{m.renewal.stage}</Badge>
                </li>
              ))}
            {rows.filter((m) => m.renewal?.stage && m.renewal.stage !== '—').length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink-500">No renewal conversations yet.</li>
            )}
          </ul>
        </Block>

        {/* Benefits tracking */}
        <Block title="Benefits" note="What was given out, and what is still on the table" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Benefit or service', 'Allocated', 'Used', 'Remaining'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {benefitKinds.map((kind) => {
                  const allocated = rows.reduce(
                    (s, m) => s + Number((m.benefits || []).find((b) => b.name === kind)?.allocated || 0),
                    0
                  );
                  const used = rows.reduce(
                    (s, m) => s + Number((m.benefits || []).find((b) => b.name === kind)?.used || 0),
                    0
                  );
                  return (
                    <tr key={kind}>
                      <td className="py-2.5 font-semibold text-ink-800">{kind}</td>
                      <td className="num py-2.5 text-ink-700">{allocated}</td>
                      <td className="num py-2.5 font-bold text-emerald-600">{used}</td>
                      <td className="num py-2.5 text-ink-700">{Math.max(0, allocated - used)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Block>

        {/* Membership revenue */}
        <Block title="Membership revenue" note="Where the membership money comes from" wide>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Collected" value={inr(revenue)} tone="text-brand-700" />
            <Stat label="Pending" value={inr(due)} tone={due ? 'text-amber-600' : 'text-ink-900'} />
            <Stat label="New memberships" value={rows.filter((m) => !m.renewal?.stage || m.renewal.stage === '—').length} />
            <Stat label="Renewals in flight" value={rows.filter((m) => m.renewal?.stage && m.renewal.stage !== '—').length} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="eyebrow mb-2">By plan</p>
              <List
                rows={plans.map((p) => {
                  const mine = rows.filter((m) => m.planId === p.id);
                  const v = mine.reduce((s, m) => s + Number(m.paid || 0), 0);
                  return { label: `${p.name} · ${mine.length}`, value: v, display: v ? inr(v) : '—' };
                })}
              />
            </div>
            <div>
              <p className="eyebrow mb-2">By consultant</p>
              <List
                empty="Nobody has sold a membership yet."
                rows={[...new Set(rows.map((m) => m.expert).filter(Boolean))].map((e) => {
                  const mine = rows.filter((m) => m.expert === e);
                  const v = mine.reduce((s, m) => s + Number(m.paid || 0), 0);
                  return { label: `${e} · ${mine.length}`, value: v, display: v ? inr(v) : '—' };
                })}
              />
            </div>
          </div>
        </Block>
      </div>
    </div>
  );
}
