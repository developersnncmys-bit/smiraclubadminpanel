import { useState } from 'react';
import {
  UserPlus, Crown, CheckCircle2, UserCheck, CalendarClock, ArrowUpRight,
  Gift, Wallet, Search, Users, Clock, IndianRupee,
  Zap,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import KpiRow from '../ui/KpiRow.jsx';
import MenuButton from '../ui/MenuButton.jsx';
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
import Block from '../ui/Block.jsx';

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
export default function MembershipDesk({ rows, plans = allPlans, onOpen, actions, switcher }) {
  const [section, setSection] = useState('Members');
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

  const billed = rows.reduce((s, m) => s + Number(m.amount || 0), 0);

  const kpis = [
    {
      label: 'Members',
      value: rows.length,
      icon: Users,
      hint: `${active.length} active`,
      progress: rows.length ? Math.round((active.length / rows.length) * 100) : 0,
    },
    {
      label: 'Awaiting',
      value: pending.length,
      icon: Clock,
      tone: pending.length ? 'text-amber-600' : 'text-ink-900',
      hint: pending.length ? 'needs a person' : 'all activated',
    },
    {
      label: 'Expiring',
      value: soon(30).length,
      icon: CalendarClock,
      tone: soon(30).length ? 'text-amber-600' : 'text-ink-900',
      hint: `${expired.length} already expired`,
    },
    {
      label: 'Revenue',
      value: shortInr(revenue),
      icon: IndianRupee,
      tone: 'text-brand-700',
      progress: billed ? Math.round((revenue / billed) * 100) : 0,
      hint: `of ${shortInr(billed)} billed`,
    },
    {
      label: 'To collect',
      value: shortInr(due),
      icon: Wallet,
      tone: due ? 'text-amber-600' : 'text-ink-900',
      hint: due ? 'chase these' : 'nothing due',
    },
    {
      label: 'Benefits',
      value: shortInr(rows.reduce((s, m) => s + Number(m.saving || 0), 0)),
      icon: Gift,
      hint: `average plan ${rows.length ? shortInr(Math.round(billed / rows.length)) : '—'}`,
    },
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
      {/* Pick a plan, or start something */}
      <section className="card flex flex-wrap items-center gap-3 px-5 py-3.5">
        {switcher}

        <MenuButton
          label={plan === 'All' ? `All plans · ${rows.length}` : `${plan} · ${rows.filter((m) => m.plan === plan).length}`}
          icon={Crown}
          value={plan}
          width="w-[270px]"
          items={[
            { key: 'All', label: 'All plans', count: rows.length },
            ...allPlans.map((pl) => ({
              key: pl.name,
              label: pl.name,
              count: rows.filter((m) => m.plan === pl.name).length,
            })),
          ]}
          onSelect={setPlan}
        />

        <MenuButton
          label="Quick actions"
          icon={Zap}
          variant="action"
          width="w-[250px]"
          items={quick.map((q) => ({ key: q.label, label: q.label, icon: q.icon }))}
          onSelect={(key) => quick.find((q) => q.label === key)?.run()}
        />

        <p className="num ml-auto text-sm text-ink-500">
          {active.length} active · {pending.length} awaiting activation · {soon(30).length} expiring
        </p>
      </section>

      <KpiRow cols={6} items={kpis} />

      <div className="flex flex-wrap gap-2">
        {['Members', 'Activation & renewal', 'Benefits & money'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSection(tab)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
              section === tab
                ? 'bg-ink-900 text-white shadow-sm'
                : 'bg-white text-ink-600 ring-1 ring-ink-900/[0.07] hover:text-ink-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* The members table, with their filters */}
      {section === 'Members' && (
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
                      <button className="btn-line btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(m); }}>
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
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Activation management */}
        {section === 'Activation & renewal' && (
        <>
        <Block title="Activation" note="Every new membership, from payment to activated">
          {/* Where the new memberships are stuck */}
          <ol className="space-y-2">
            {activationStages.map((stage, i) => {
              const at = rows.filter((m) => m.activation?.stage === stage);
              const on = at.length > 0;
              return (
                <li key={stage} className="flex items-center gap-3">
                  <span
                    className={`num grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold ${
                      on ? 'bg-brand-600 text-white' : 'bg-surface-soft text-ink-400'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-[13px] ${on ? 'font-bold text-ink-900' : 'text-ink-500'}`}>
                    {stage}
                  </span>
                  <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-surface-soft">
                    <span
                      className={`block h-full rounded-full ${on ? 'bg-brand-500' : ''}`}
                      style={{ width: `${rows.length ? Math.round((at.length / rows.length) * 100) : 0}%` }}
                    />
                  </span>
                  <span className={`num w-5 shrink-0 text-right text-[13px] font-bold ${on ? 'text-ink-900' : 'text-ink-300'}`}>
                    {at.length}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Everyone waiting, with the stage they are waiting at */}
          <p className="eyebrow mb-2 mt-4">Who is waiting</p>
          <ul className="divide-y divide-ink-900/[0.07]">
            {rows
              .filter((m) => m.activation?.stage)
              .map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => onOpen(m)}
                    className="flex w-full items-center gap-2.5 rounded-lg py-2.5 text-left transition hover:bg-surface-soft"
                  >
                    <Avatar name={m.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-ink-900">{m.name}</span>
                      <span className="block truncate text-xs text-ink-500">
                        {m.plan} · expert {m.expert || 'not assigned'} · by {m.activation?.deadline}
                      </span>
                    </span>
                    <Badge tone={m.activation.stage === 'Activated' ? 'green' : 'amber'}>{m.activation.stage}</Badge>
                  </button>
                </li>
              ))}
            {rows.filter((m) => m.activation?.stage).length === 0 && (
              <li className="py-6 text-center text-sm text-ink-500">Nothing waiting to be activated.</li>
            )}
          </ul>
          <p className="mt-3 text-xs text-ink-400">
            Each membership tracks contact, explanation, documents and the welcome gift.
          </p>
        </Block>

        {/* Expiry and renewal */}
        <Block title="Expiry and renewal" note="Who to call, and how the renewal is going">
          {/* How close the expiries are */}
          <div className="grid grid-cols-2 divide-ink-900/[0.07] rounded-xl border border-ink-900/[0.07] sm:grid-cols-4 sm:divide-x">
            {[7, 15, 30, 45].map((d) => (
              <div key={d} className="px-4 py-3">
                <p className={`num font-display text-lg font-extrabold leading-none ${soon(d).length ? 'text-amber-600' : 'text-ink-300'}`}>
                  {soon(d).length}
                </p>
                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">
                  in {d} days
                </p>
              </div>
            ))}
          </div>

          {/* Where each renewal conversation has reached */}
          <p className="eyebrow mb-2 mt-4">Renewal conversations</p>
          <ol className="space-y-2">
            {renewalStages.map((stage) => {
              const at = rows.filter((m) => m.renewal?.stage === stage);
              const lost = stage === 'Renewal lost';
              return (
                <li key={stage} className="flex items-center gap-3">
                  <span className={`min-w-0 flex-1 truncate text-[13px] ${at.length ? 'font-bold text-ink-900' : 'text-ink-500'}`}>
                    {stage}
                  </span>
                  <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-surface-soft">
                    <span
                      className={`block h-full rounded-full ${lost ? 'bg-rose-400' : 'bg-brand-500'}`}
                      style={{ width: `${rows.length ? Math.round((at.length / rows.length) * 100) : 0}%` }}
                    />
                  </span>
                  <span className={`num w-5 shrink-0 text-right text-[13px] font-bold ${at.length ? 'text-ink-900' : 'text-ink-300'}`}>
                    {at.length}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="eyebrow mb-2 mt-4">Who to call</p>
          <ul className="divide-y divide-ink-900/[0.07]">
            {rows
              .filter((m) => m.renewal?.stage && m.renewal.stage !== '—')
              .map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => onOpen(m)}
                    className="flex w-full items-center gap-2.5 rounded-lg py-2.5 text-left transition hover:bg-surface-soft"
                  >
                    <Avatar name={m.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-ink-900">{m.name}</span>
                      <span className="block truncate text-xs text-ink-500">
                        {m.renewal.note || m.plan} · contacted {m.renewal.contactedOn}
                      </span>
                    </span>
                    <Badge tone={m.renewal.stage === 'Renewal lost' ? 'rose' : 'sky'}>{m.renewal.stage}</Badge>
                  </button>
                </li>
              ))}
            {rows.filter((m) => m.renewal?.stage && m.renewal.stage !== '—').length === 0 && (
              <li className="py-6 text-center text-sm text-ink-500">No renewal conversations yet.</li>
            )}
          </ul>
        </Block>

        {/* Benefits tracking */}
        </>
        )}

        {section === 'Benefits & money' && (
        <Block title="Benefits" note="What was given out, and what is still on the table" wide>
          {(() => {
            const kinds = benefitKinds
              .map((kind) => {
                const allocated = rows.reduce(
                  (s, m) => s + Number((m.benefits || []).find((b) => b.name === kind)?.allocated || 0),
                  0
                );
                const used = rows.reduce(
                  (s, m) => s + Number((m.benefits || []).find((b) => b.name === kind)?.used || 0),
                  0
                );
                return { kind, allocated, used, left: Math.max(0, allocated - used) };
              })
              .sort((a, b) => b.allocated - a.allocated);
            const allocated = kinds.reduce((s, k) => s + k.allocated, 0);
            const used = kinds.reduce((s, k) => s + k.used, 0);

            return (
              <>
                <div className="grid grid-cols-3 divide-x divide-ink-900/[0.07] rounded-xl border border-ink-900/[0.07]">
                  {[
                    ['Allocated', allocated, 'text-ink-900'],
                    ['Used', used, 'text-emerald-600'],
                    ['Still on the table', Math.max(0, allocated - used), 'text-ink-900'],
                  ].map(([label, v, tone]) => (
                    <div key={label} className="px-4 py-3">
                      <p className={`num font-display text-lg font-extrabold leading-none ${tone}`}>{v}</p>
                      <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <ul className="mt-4 space-y-2.5">
                  {kinds.map((k) => {
                    const pct = k.allocated ? Math.round((k.used / k.allocated) * 100) : 0;
                    return (
                      <li key={k.kind}>
                        <p className="flex items-baseline justify-between gap-3 text-[13px]">
                          <span className={`truncate ${k.allocated ? 'font-semibold text-ink-700' : 'text-ink-400'}`}>
                            {k.kind}
                          </span>
                          <span className="num shrink-0 text-ink-500">
                            <b className={k.used ? 'text-emerald-600' : 'text-ink-400'}>{k.used}</b> of {k.allocated} used
                            <span className="ml-2 text-ink-400">{k.left} left</span>
                          </span>
                        </p>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-soft">
                          <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            );
          })()}
        </Block>

        )}

        {section === 'Benefits & money' && (
        <Block title="Membership revenue" note="Where the membership money comes from" wide>
          <div className="grid grid-cols-2 divide-ink-900/[0.07] rounded-xl border border-ink-900/[0.07] sm:grid-cols-4 sm:divide-x">
            {[
              ['Collected', shortInr(revenue), 'text-brand-700'],
              ['Pending', shortInr(due), due ? 'text-amber-600' : 'text-ink-300'],
              ['New memberships', rows.filter((m) => !m.renewal?.stage || m.renewal.stage === '—').length, 'text-ink-900'],
              ['Renewals in flight', rows.filter((m) => m.renewal?.stage && m.renewal.stage !== '—').length, 'text-ink-900'],
            ].map(([label, v, tone]) => (
              <div key={label} className="px-4 py-3">
                <p className={`num truncate font-display text-lg font-extrabold leading-none ${tone}`}>{v}</p>
                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <p className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="font-semibold text-ink-700">Collected against billed</span>
              <span className="num font-bold text-ink-900">
                {revenue + due ? Math.round((revenue / (revenue + due)) * 100) : 0}%
              </span>
            </p>
            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <span
                className="block h-full rounded-full bg-brand-500"
                style={{ width: `${revenue + due ? Math.round((revenue / (revenue + due)) * 100) : 0}%` }}
              />
            </span>
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
        )}
      </div>
    </div>
  );
}
