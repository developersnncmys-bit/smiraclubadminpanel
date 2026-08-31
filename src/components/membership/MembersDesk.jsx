import { useState } from 'react';
import {
  Users,
  HeartHandshake,
  MessageCircle,
  Gift,
  Share2,
  RefreshCw,
  Cake,
  Phone,
  Plus,
  ArrowRight,
  AlertTriangle,
  Crown,
  CheckCircle2,
  CalendarClock,
  Clock,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import {
  rewardStages,
  rewardKinds,
  engagementLevels,
  reminderKinds,
  signupTone,
  inr,
  shortInr,
} from '../../data/mockData.js';
import { daysUntil } from '../../lib/membership.js';
import Block from '../ui/Block.jsx';
import Stat from '../ui/Stat.jsx';
import SectionTabs from '../ui/SectionTabs.jsx';
import KpiRow from '../ui/KpiRow.jsx';

const TABS = [
  { key: 'members', label: 'Members', icon: Users },
  { key: 'retention', label: 'Retention', icon: HeartHandshake },
  { key: 'engagement', label: 'Engagement', icon: MessageCircle },
  { key: 'rewards', label: 'Rewards', icon: Gift },
  { key: 'referrals', label: 'Referrals', icon: Share2 },
  { key: 'renewals', label: 'Renewals', icon: RefreshCw },
];

const engagementTone = {
  'Highly engaged': 'green',
  Active: 'sky',
  'Low engagement': 'amber',
  'At risk': 'rose',
};

/** Days to the next time this date comes round. */
function daysToNext(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
  return Math.round((next - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}

/**
 * The Members tab of the client's sheet: one CRM view of every member with
 * retention, engagement, rewards, referrals and renewals behind it — and,
 * the part they care most about, a next action against every member.
 */
export default function MembersDesk({ members, signups, rewards, bookings, onOpen, onOpenMembership, actions }) {
  const [tab, setTab] = useState('members');

  /** The membership record behind a member, if they hold one. */
  const planOf = (c) => signups.find((s) => s.id === c.membership) || null;
  const daysLeft = (c) => daysUntil(planOf(c)?.expiresOn);
  const benefitsLeft = (c) => {
    const s = planOf(c);
    if (!s) return 0;
    return (s.benefits || []).reduce((n, b) => n + Math.max(0, Number(b.allocated || 0) - Number(b.used || 0)), 0);
  };
  const rewardsFor = (c) => rewards.filter((r) => r.member === c.name);
  const sinceContact = (c) => {
    const d = new Date(c.lastInteraction);
    if (Number.isNaN(d.getTime())) return null;
    return Math.max(0, Math.round((new Date() - d) / 86400000));
  };

  /**
   * Every member needs one thing to do next — the sheet is explicit about
   * this, so the whole desk hangs off it.
   */
  const nextAction = (c) => {
    const s = planOf(c);
    const left = daysLeft(c);
    const bday = daysToNext(c.dob);
    const anniversary = daysToNext(c.special);
    const gap = sinceContact(c);
    const reasons = [];

    if (s && s.status !== 'Active' && Number(s.paid || 0) < Number(s.amount || 0)) {
      reasons.push({ text: 'Chase the membership payment', kind: 'Pending payment', urgent: true });
    }
    if (s && s.activation && s.activation.stage !== 'Activated') {
      reasons.push({ text: 'Finish the activation', kind: 'Membership activation', urgent: true });
    }
    if (left != null && left < 0) reasons.push({ text: 'Renew — the membership has lapsed', kind: 'Renewal', urgent: true });
    else if (left != null && left <= 45) reasons.push({ text: `Send the renewal offer — ${left} days left`, kind: 'Renewal', urgent: left <= 15 });
    if (bday != null && bday <= 30) reasons.push({ text: `Send a birthday offer — ${bday} days away`, kind: 'Birthday' });
    if (anniversary != null && anniversary <= 30) {
      reasons.push({ text: `Send an anniversary wish — ${anniversary} days away`, kind: 'Anniversary' });
    }
    if (benefitsLeft(c) > 0) reasons.push({ text: `Remind about ${benefitsLeft(c)} unused benefits`, kind: 'Unused benefits' });
    if (rewardsFor(c).some((r) => ['Eligible', 'Approved', 'Assigned'].includes(r.stage))) {
      reasons.push({ text: 'A gift is waiting to be handed over', kind: 'Gift collection' });
    }
    if (gap != null && gap >= 30) reasons.push({ text: `No contact for ${gap} days — call them`, kind: 'Retention', urgent: true });

    return reasons.length ? reasons : [{ text: 'Nothing pending — send a trip idea', kind: 'Booking opportunity' }];
  };

  const atRisk = members.filter(
    (c) => c.engagement === 'At risk' || (sinceContact(c) ?? 0) >= 30 || (daysLeft(c) ?? 99) < 0
  );
  const expiringSoon = members.filter((c) => { const l = daysLeft(c); return l != null && l >= 0 && l <= 45; });
  const totalReferrals = members.reduce((s, c) => s + Number(c.referral?.total || 0), 0);
  const converted = members.reduce((s, c) => s + Number(c.referral?.converted || 0), 0);
  const rewardsDue = rewards.filter((r) => !['Delivered', 'Cancelled'].includes(r.stage));

  const kpis = [
    { icon: Users, label: 'Total members', value: members.length },
    { icon: CheckCircle2, label: 'Active', value: signups.filter((s) => s.status === 'Active').length, tone: 'text-emerald-600' },
    { icon: CalendarClock, label: 'Expiring soon', value: expiringSoon.length, tone: expiringSoon.length ? 'text-amber-600' : undefined },
    { icon: Clock, label: 'Pending activation', value: signups.filter((s) => s.activation && s.activation.stage !== 'Activated').length },
    { icon: AlertTriangle, label: 'At risk', value: atRisk.length, tone: atRisk.length ? 'text-rose-600' : undefined },
    { icon: Gift, label: 'Gifts to hand over', value: rewardsDue.length },
    { label: 'Referrals', value: totalReferrals, hint: `${converted} converted` },
    { label: 'Member spend', value: shortInr(members.reduce((s, c) => s + Number(c.spend || 0), 0)), tone: 'text-brand-700' },
  ];

  /** The badge line from their example — status, birthday, benefits, renewal. */
  const badges = (c) => {
    const s = planOf(c);
    const left = daysLeft(c);
    const bday = daysToNext(c.dob);
    const out = [];
    if (s) out.push({ tone: signupTone[s.status] || 'slate', text: s.status, dot: true });
    if (bday != null && bday <= 60) out.push({ tone: 'violet', text: `Birthday in ${bday} days` });
    if (rewardsFor(c).some((r) => r.stage === 'Eligible')) out.push({ tone: 'amber', text: 'Reward eligible' });
    if (benefitsLeft(c) > 0) out.push({ tone: 'sky', text: `${benefitsLeft(c)} benefits unused` });
    if (left != null) out.push({ tone: left < 0 ? 'rose' : left <= 45 ? 'amber' : 'green', text: left < 0 ? 'Membership lapsed' : `Renewal in ${left} days` });
    if (Number(c.referral?.converted || 0) > 0) out.push({ tone: 'green', text: `${c.referral.converted} successful referrals` });
    return out;
  };

  return (
    <div className="space-y-6">
      <KpiRow items={kpis} cols={8} />

      {/* The six views the sheet asks for */}
      <SectionTabs items={TABS} value={tab} onChange={setTab}>
        <button className="btn-primary ml-auto" onClick={actions.addMember}>
          <Plus size={16} /> Add member
        </button>
      </SectionTabs>

      {/* -- Members ------------------------------------------------------- */}
      {tab === 'members' && (
        <div className="grid gap-5 xl:grid-cols-2">
          {members.map((c) => {
            const s = planOf(c);
            const actionsList = nextAction(c);
            return (
              <article key={c.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <button onClick={() => onOpen(c)} className="text-left">
                        <p className="font-display text-base font-extrabold text-ink-900">{c.name}</p>
                        <p className="num text-xs text-ink-400">
                          {c.id} · {c.phone}
                        </p>
                      </button>
                      {s && (
                        <button
                          onClick={() => onOpenMembership(s)}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
                        >
                          <Crown size={13} /> {s.plan}
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {badges(c).map((b) => (
                        <Badge key={b.text} tone={b.tone} dot={b.dot}>
                          {b.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Trips" value={c.trips ?? 0} />
                  <Stat label="Spend" value={shortInr(c.spend || 0)} />
                  <Stat label="Benefits left" value={benefitsLeft(c)} />
                  <Stat label="Engagement" value={c.engagement || '—'} />
                </div>

                {/* The bit the client cares about most */}
                <div className="mt-4 rounded-xl border border-brand-600/20 bg-brand-50/60 p-4">
                  <p className="eyebrow text-brand-700">Next action</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {actionsList.map((a) => (
                      <li key={a.text} className="flex items-start gap-2 text-sm text-ink-800">
                        <ArrowRight size={14} className={`mt-0.5 shrink-0 ${a.urgent ? 'text-rose-600' : 'text-brand-600'}`} />
                        <span>
                          {a.text} <span className="text-xs text-ink-500">· {a.kind}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`tel:${String(c.phone).replace(/[^\d]/g, '')}`} className="btn-ghost btn-sm">
                      <Phone size={13} /> Call
                    </a>
                    <a
                      href={`https://wa.me/${String(c.phone).replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost btn-sm"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                    <button className="btn-ghost btn-sm" onClick={() => actions.note(`Offer sent to ${c.name}`)}>
                      Send offer
                    </button>
                    <button className="btn-ghost btn-sm" onClick={() => actions.note(`Follow-up task created for ${c.name}`)}>
                      Create task
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {members.length === 0 && (
            <div className="card border-dashed p-14 text-center text-sm text-ink-500">No members yet.</div>
          )}
        </div>
      )}

      {/* -- Retention ----------------------------------------------------- */}
      {tab === 'retention' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <Block title="Where each member stands" note="Last booking, last contact and what is left unused" wide>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-sm">
                <thead>
                  <tr className="border-b border-ink-900/[0.07] text-left">
                    {['Member', 'Last booking', 'Last contact', 'Benefits used', 'Benefits left', 'Membership ends', 'Satisfaction', 'Risk'].map((h) => (
                      <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/[0.07]">
                  {members.map((c) => {
                    const s = planOf(c);
                    const used = (s?.benefits || []).reduce((n, b) => n + Number(b.used || 0), 0);
                    const gap = sinceContact(c);
                    const risk = atRisk.includes(c);
                    return (
                      <tr key={c.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => onOpen(c)}>
                        <td className="py-2.5 font-bold text-ink-900">{c.name}</td>
                        <td className="num py-2.5 text-ink-700">{c.lastBooking || '—'}</td>
                        <td className="num py-2.5 text-ink-700">
                          {c.lastInteraction || '—'}
                          {gap != null && <span className="ml-1.5 text-xs text-ink-400">{gap}d ago</span>}
                        </td>
                        <td className="num py-2.5 text-ink-700">{used}</td>
                        <td className="num py-2.5 font-bold text-amber-600">{benefitsLeft(c)}</td>
                        <td className="num py-2.5 text-ink-700">{s?.expiresOn || '—'}</td>
                        <td className="num py-2.5 text-ink-700">{c.satisfaction ? `${c.satisfaction}/5` : '—'}</td>
                        <td className="py-2.5">
                          <Badge tone={risk ? 'rose' : 'green'} dot>
                            {risk ? 'At risk' : 'Healthy'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Block>

          <Block title="Retention alerts" note="What the desk should act on first" wide>
            <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
              {members.flatMap((c) => {
                const out = [];
                const gap = sinceContact(c);
                const left = daysLeft(c);
                if (gap != null && gap >= 30) out.push([c, `No activity for ${gap} days`]);
                if (benefitsLeft(c) > 0) out.push([c, `${benefitsLeft(c)} benefits still unused`]);
                if (left != null && left <= 45) out.push([c, left < 0 ? 'Membership has lapsed' : `Membership ends in ${left} days`]);
                if (c.complaint) out.push([c, `Previous complaint — ${c.complaint}`]);
                return out.map(([member, text]) => (
                  <li key={`${member.id}-${text}`} className="flex items-center gap-3 px-4 py-3">
                    <AlertTriangle size={15} className="shrink-0 text-amber-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink-900">{member.name}</span>
                      <span className="block truncate text-xs text-ink-500">{text}</span>
                    </span>
                    <button className="btn-ghost btn-sm" onClick={() => onOpen(member)}>
                      Open
                    </button>
                  </li>
                ));
              })}
            </ul>
          </Block>
        </div>
      )}

      {/* -- Engagement ---------------------------------------------------- */}
      {tab === 'engagement' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <Block title="How engaged everyone is" note="Highly engaged, active, low or at risk">
            <ul className="space-y-3">
              {engagementLevels.map((level) => {
                const at = members.filter((c) => c.engagement === level);
                return (
                  <li key={level} className="rounded-xl border border-ink-900/[0.07] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone={engagementTone[level]}>{level}</Badge>
                      <span className="num text-sm font-bold text-ink-900">{at.length}</span>
                    </div>
                    {at.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onOpen(c)}
                        className="mt-2 flex w-full items-center gap-2.5 rounded-lg bg-surface-soft px-3 py-2 text-left"
                      >
                        <Avatar name={c.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink-800">{c.name}</span>
                          <span className="block truncate text-xs text-ink-500">{c.lastMessage || 'No recent contact'}</span>
                        </span>
                      </button>
                    ))}
                  </li>
                );
              })}
            </ul>
          </Block>

          <Block title="Special days" note="Birthdays and anniversaries coming up">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Today" value={members.filter((c) => daysToNext(c.dob) === 0 || daysToNext(c.special) === 0).length} />
              <Stat
                label="Next 7 days"
                value={members.filter((c) => [daysToNext(c.dob), daysToNext(c.special)].some((d) => d != null && d <= 7)).length}
              />
              <Stat
                label="Next 30 days"
                value={members.filter((c) => [daysToNext(c.dob), daysToNext(c.special)].some((d) => d != null && d <= 30)).length}
              />
            </div>
            <ul className="mt-4 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
              {members
                .flatMap((c) => [
                  { c, kind: 'Birthday', at: c.dob, days: daysToNext(c.dob) },
                  { c, kind: c.specialLabel || 'Anniversary', at: c.special, days: daysToNext(c.special) },
                  { c, kind: "Child's birthday", at: c.childBirthday, days: daysToNext(c.childBirthday) },
                ])
                .filter((d) => d.days != null)
                .sort((a, b) => a.days - b.days)
                .slice(0, 6)
                .map((d) => (
                  <li key={`${d.c.id}-${d.kind}`} className="flex items-center gap-3 px-4 py-3">
                    <Cake size={15} className="shrink-0 text-violet-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink-900">{d.c.name}</span>
                      <span className="block truncate text-xs text-ink-500">
                        {d.kind} · in {d.days} days
                      </span>
                    </span>
                    <button className="btn-ghost btn-sm" onClick={() => actions.note(`Personalised offer sent to ${d.c.name}`)}>
                      Send offer
                    </button>
                    <button className="btn-ghost btn-sm" onClick={() => actions.note(`Gift assigned to ${d.c.name}`)}>
                      Assign gift
                    </button>
                  </li>
                ))}
            </ul>
          </Block>

          <Block title="Engagement centre" note="What can go out to members from here" wide>
            <div className="flex flex-wrap gap-2">
              {[
                'WhatsApp campaign', 'New hotel offers', 'Weekend offers', 'Travel packages',
                'Membership expiry note', 'Birthday wishes', 'Anniversary wishes',
                'Special member offers', 'Unused benefit reminder', 'Personalised recommendation',
              ].map((c) => (
                <button key={c} className="chip text-ink-600 hover:text-ink-900" onClick={() => actions.note(`${c} queued`)}>
                  {c}
                </button>
              ))}
            </div>
            <p className="mt-4 eyebrow">Reminders the panel watches</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {reminderKinds.map((r) => (
                <span key={r} className="chip text-ink-500">
                  {r}
                </span>
              ))}
            </div>
          </Block>
        </div>
      )}

      {/* -- Rewards ------------------------------------------------------- */}
      {tab === 'rewards' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <Block title="Gifts and rewards" note="Every gift, and how far along it is" wide>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-ink-900/[0.07] text-left">
                    {['Member', 'Gift', 'Type', 'Eligibility', 'Assigned', 'Due', 'Field officer', 'Proof', 'Stage'].map((h) => (
                      <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/[0.07]">
                  {rewards.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-soft">
                      <td className="py-2.5 font-bold text-ink-900">{r.member}</td>
                      <td className="py-2.5 text-ink-800">{r.gift}</td>
                      <td className="py-2.5 text-ink-600">{r.kind}</td>
                      <td className="py-2.5 text-ink-600">{r.eligibility}</td>
                      <td className="num py-2.5 text-ink-600">{r.assigned}</td>
                      <td className="num py-2.5 text-ink-600">{r.due}</td>
                      <td className="py-2.5 text-ink-600">{r.officer}</td>
                      <td className="py-2.5 text-ink-500">{r.proof}</td>
                      <td className="py-2.5">
                        <Badge
                          tone={
                            r.stage === 'Delivered' ? 'green' : r.stage === 'Cancelled' ? 'rose' : r.stage === 'Pending' ? 'slate' : 'amber'
                          }
                          dot
                        >
                          {r.stage}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {rewards.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-ink-500">
                        No gifts in flight.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-400">Stages: {rewardStages.join(' → ')}</p>
          </Block>

          <Block title="By kind of gift" note="What the agency hands out most">
            <ul className="space-y-2.5">
              {rewardKinds.map((k) => {
                const n = rewards.filter((r) => r.kind === k).length;
                return (
                  <li key={k} className="flex items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-2.5">
                    <span className="text-sm font-semibold text-ink-700">{k}</span>
                    <span className="num text-sm font-bold text-ink-900">{n}</span>
                  </li>
                );
              })}
            </ul>
          </Block>

          <Block title="Waiting to be handed over" note="Approved or assigned, not yet delivered">
            <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
              {rewardsDue.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <Gift size={15} className="shrink-0 text-brand-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink-900">{r.member}</span>
                    <span className="block truncate text-xs text-ink-500">
                      {r.gift} · due {r.due} · {r.officer}
                    </span>
                  </span>
                  <button className="btn-ghost btn-sm" onClick={() => actions.note(`${r.gift} marked delivered`)}>
                    Mark delivered
                  </button>
                </li>
              ))}
              {rewardsDue.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-ink-500">Everything has been handed over.</li>
              )}
            </ul>
          </Block>
        </div>
      )}

      {/* -- Referrals ----------------------------------------------------- */}
      {tab === 'referrals' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <Block title="Refer and earn" note="Who is bringing people in, and what they have earned" wide>
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Total referrals" value={totalReferrals} />
              <Stat label="Qualified" value={members.reduce((s, c) => s + Number(c.referral?.qualified || 0), 0)} />
              <Stat label="Converted" value={converted} tone="text-emerald-600" />
              <Stat
                label="Rewards pending"
                value={inr(members.reduce((s, c) => s + Number(c.referral?.pending || 0), 0))}
                tone="text-amber-600"
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-ink-900/[0.07] text-left">
                    {['Member', 'Referral code', 'Referrals', 'Qualified', 'Converted', 'Earned', 'Redeemed', 'Pending'].map((h) => (
                      <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/[0.07]">
                  {members.map((c) => (
                    <tr key={c.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => onOpen(c)}>
                      <td className="py-2.5 font-bold text-ink-900">{c.name}</td>
                      <td className="num py-2.5 text-brand-700">{c.referral?.code || '—'}</td>
                      <td className="num py-2.5 text-ink-700">{c.referral?.total ?? 0}</td>
                      <td className="num py-2.5 text-ink-700">{c.referral?.qualified ?? 0}</td>
                      <td className="num py-2.5 font-bold text-emerald-600">{c.referral?.converted ?? 0}</td>
                      <td className="num py-2.5 text-ink-700">{inr(c.referral?.earned || 0)}</td>
                      <td className="num py-2.5 text-ink-700">{inr(c.referral?.redeemed || 0)}</td>
                      <td className="num py-2.5 font-bold text-amber-600">{inr(c.referral?.pending || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-400">
              Each member has a code and a share link; rewards are released once a referral converts.
            </p>
          </Block>
        </div>
      )}

      {/* -- Renewals ------------------------------------------------------ */}
      {tab === 'renewals' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <Block title="Renewal pipeline" note="90 → 60 → 30 → 15 → 7 days → expired" wide>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {[90, 60, 30, 15, 7].map((d) => {
                const at = members.filter((c) => { const l = daysLeft(c); return l != null && l >= 0 && l <= d; });
                return <Stat key={d} label={`Within ${d} days`} value={at.length} tone={d <= 15 && at.length ? 'text-amber-600' : 'text-ink-900'} />;
              })}
              <Stat
                label="Expired"
                value={members.filter((c) => (daysLeft(c) ?? 1) < 0).length}
                tone="text-rose-600"
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-ink-900/[0.07] text-left">
                    {['Member', 'Expiry', 'Eligibility', 'Benefits consumed', 'Renewal offer', 'Probability', 'Assigned', 'Last contact', 'Next follow-up'].map((h) => (
                      <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/[0.07]">
                  {members.map((c) => {
                    const s = planOf(c);
                    const l = daysLeft(c);
                    const used = (s?.benefits || []).reduce((n, b) => n + Number(b.used || 0), 0);
                    const allocated = (s?.benefits || []).reduce((n, b) => n + Number(b.allocated || 0), 0);
                    const consumed = allocated ? Math.round((used / allocated) * 100) : 0;
                    const probability = Math.min(95, consumed + (c.engagement === 'Highly engaged' ? 40 : 15));
                    return (
                      <tr key={c.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => onOpen(c)}>
                        <td className="py-2.5 font-bold text-ink-900">{c.name}</td>
                        <td className="num py-2.5 text-ink-700">
                          {s?.expiresOn || '—'}
                          {l != null && (
                            <span className={`ml-1.5 text-xs font-bold ${l < 0 ? 'text-rose-600' : l <= 45 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {l < 0 ? 'lapsed' : `${l}d`}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-ink-600">{s ? (l != null && l <= 90 ? 'Eligible now' : 'Not yet') : 'No membership'}</td>
                        <td className="num py-2.5 text-ink-700">{consumed}%</td>
                        <td className="py-2.5 text-ink-600">{s ? `${s.plan} at last year's rate` : '—'}</td>
                        <td className="num py-2.5 font-bold text-ink-900">{s ? `${probability}%` : '—'}</td>
                        <td className="py-2.5 text-ink-600">{c.expert || '—'}</td>
                        <td className="num py-2.5 text-ink-600">{c.lastInteraction || '—'}</td>
                        <td className="py-2.5 text-ink-600">{s?.renewal?.stage && s.renewal.stage !== '—' ? s.renewal.stage : 'Not started'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Block>
        </div>
      )}
    </div>
  );
}
