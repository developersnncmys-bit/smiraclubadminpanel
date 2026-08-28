import { useState } from 'react';
import {
  Gift,
  Plus,
  Share2,
  Truck,
  CheckCircle2,
  Circle,
  MessageCircle,
  Ticket,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr } from '../data/mockData.js';
import {
  ruleControls,
  rewardTriggers,
  catalogue,
  lifecycle,
  lifecycleTone,
  autoApproved,
  needsApproval,
  dispatchFlow,
  rewardRules,
  milestones,
  customerRewards,
  dispatches,
  referralPipeline,
  referralControls,
  referralRule,
  referrals,
  referralAutomation,
  campaigns,
  campaignControls,
  whatsappMessages,
  staffCoupons,
  reportGroups,
  roi,
} from '../data/rewardsData.js';

const SECTIONS = [
  'Dashboard',
  'Rule builder',
  'Rules',
  'Catalogue',
  'Milestones',
  'Customer rewards',
  'Refer and earn',
  'Approvals',
  'Gift dispatch',
  'Cost and ROI',
  'Campaigns',
  'WhatsApp',
  'Staff coupons',
  'Reports',
];

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

function Stat({ label, value, hint, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-xl font-extrabold ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

function Table({ head, rows, empty = 'Nothing here yet.', foot }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ink-900/[0.07] text-left">
            {head.map((h) => (
              <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/[0.07]">
          {rows.map((r) => (
            <tr key={r.key} className="hover:bg-surface-soft">
              {r.cells.map((c, i) => (
                <td key={i} className={`py-2.5 ${i === 0 ? 'font-bold text-ink-900' : 'text-ink-700'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-6 text-center text-ink-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
        {foot && (
          <tfoot>
            <tr className="border-t-2 border-ink-900/[0.12] bg-surface-soft">
              {foot.map((c, i) => (
                <td key={i} className={`py-2.5 ${i === 0 ? 'font-extrabold text-ink-900' : 'num font-bold text-ink-900'}`}>
                  {c}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/** A chain of steps, with everything up to `at` marked done. */
function Flow({ steps, at = -1 }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-300">→</span>}
          <span
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold ${
              at < 0 ? 'bg-surface-soft text-ink-700' : i <= at ? 'bg-brand-50 text-brand-700' : 'bg-surface-soft text-ink-400'
            }`}
          >
            {at >= 0 && (i <= at ? <CheckCircle2 size={13} /> : <Circle size={13} />)}
            {s}
          </span>
        </span>
      ))}
    </div>
  );
}

/**
 * Rewards, refer and earn as the client's sheet describes it: the rules that
 * hand something out, what it costs the company, the referral chain, and the
 * gift that has to physically arrive.
 */
export default function Rewards() {
  const { toast } = useApp();
  const [section, setSection] = useState('Dashboard');
  const [draft, setDraft] = useState({
    trigger: 'Booking completed',
    type: 'Villa',
    count: 2,
    gives: 'Dinner coupon',
    value: 1000,
    valid: 60,
    max: 1,
  });

  const issued = customerRewards.length;
  const available = customerRewards.filter((r) => r.stage === 'Available').length;
  const pending = customerRewards.filter((r) => ['Earned', 'Pending'].includes(r.stage)).length;
  const redeemed = customerRewards.filter((r) => r.stage === 'Redeemed').length;
  const faceValue = customerRewards.reduce((s, r) => s + r.value, 0);
  const companyCost = customerRewards.reduce((s, r) => s + r.cost, 0);
  const liability = customerRewards
    .filter((r) => ['Earned', 'Pending', 'Approved', 'Available'].includes(r.stage))
    .reduce((s, r) => s + r.value, 0);

  const successful = referrals.filter((r) => r.verified).length;
  const referralRevenue = referrals.reduce((s, r) => s + r.value, 0);
  const referralCost = referrals.reduce((s, r) => s + r.rewardValue, 0);
  const conversion = referrals.length ? Math.round((successful / referrals.length) * 100) : 0;
  const roiMultiple = roi.rewardCost ? Math.round(roi.revenueFromRewarded / roi.rewardCost) : 0;

  const toDispatch = dispatches.filter((d) => d.stage !== 'Delivered');
  const awaitingApproval = customerRewards.filter((r) => r.stage === 'Pending');

  const body = {
    Dashboard: (
      <>
        <div className="grid gap-4 xl:col-span-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section className="card relative overflow-hidden p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-500/12 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Given to members</p>
              <p className="num mt-2 font-display text-4xl font-extrabold leading-none text-ink-900">{inr(faceValue)}</p>
              <p className="mt-1.5 text-sm text-ink-500">
                {issued} rewards · costing the company {inr(companyCost)}
              </p>
              <div className="mt-5">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  <span>What it actually costs us</span>
                  <span className="num">{Math.round((companyCost / Math.max(1, faceValue)) * 100)}%</span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${Math.round((companyCost / Math.max(1, faceValue)) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-sm">
                <Gift size={14} className="text-ink-400" />
                {roiMultiple}× revenue for every rupee of reward
              </p>
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Where the rewards are</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Ready to use', value: available, tone: 'bg-emerald-500' },
                { label: 'Waiting on us', value: pending, tone: 'bg-amber-500' },
                { label: 'Already used', value: redeemed, tone: 'bg-ink-900/25' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-2xl font-extrabold text-ink-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Needs a person</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Gifts to send out', value: toDispatch.length, tone: 'bg-rose-500' },
                { label: 'Waiting on approval', value: awaitingApproval.length, tone: 'bg-amber-500' },
                { label: 'Referrals in flight', value: referrals.length - successful, tone: 'bg-sky-500' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-2xl font-extrabold text-ink-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="card grid divide-y divide-ink-900/[0.07] sm:grid-cols-2 sm:divide-y-0 xl:col-span-2 xl:grid-cols-3 2xl:grid-cols-6 sm:[&>*:not(:first-child)]:border-l sm:[&>*]:border-ink-900/[0.07]">
          {[
            { label: 'Live rules', value: rewardRules.filter((r) => r.status === 'Active').length, hint: `of ${rewardRules.length}` },
            { label: 'Reward liability', value: inr(liability), hint: 'still to be claimed' },
            { label: 'Referrals', value: referrals.length, hint: `${successful} successful` },
            { label: 'Referral conversion', value: `${conversion}%` },
            { label: 'Live campaigns', value: campaigns.filter((c) => c.status === 'Live').length },
            { label: 'Staff coupons', value: staffCoupons.length, hint: `${shortInr(staffCoupons.reduce((s, c) => s + c.revenue, 0))} sold` },
          ].map((g) => (
            <div key={g.label} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{g.label}</p>
              <p className="num mt-1.5 font-display text-2xl font-extrabold text-ink-900">{g.value}</p>
              {g.hint && <p className="mt-0.5 text-xs text-ink-400">{g.hint}</p>}
            </div>
          ))}
        </div>

        <Block title="Every reward walks this line" note="It can be reversed if the booking behind it is cancelled" wide>
          <Flow steps={lifecycle} />
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
            <AlertTriangle size={15} className="shrink-0 text-amber-500" />
            Two villa bookings earn a dinner coupon — if one booking is later cancelled, the panel holds or reverses
            the reward on its own. That is what stops the system being played.
          </p>
        </Block>
      </>
    ),

    'Rule builder': (
      <Block
        title="Create a reward"
        note="No developer needed — this is how a campaign gets built"
        wide
        action={
          <button className="btn-primary btn-sm" onClick={() => toast('Reward rule created and switched on')}>
            <Plus size={14} /> Create reward
          </button>
        }
      >
        <div className="space-y-4 rounded-xl border border-ink-900/[0.07] p-5">
          {[
            ['When', <select key="t" className="input h-9 w-auto py-0 text-sm" value={draft.trigger} onChange={(e) => setDraft({ ...draft, trigger: e.target.value })}>
              {rewardTriggers.map((t) => <option key={t}>{t}</option>)}
            </select>],
            ['And', <span key="c" className="flex flex-wrap items-center gap-2">
              <select className="input h-9 w-auto py-0 text-sm" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                {['Villa', 'Hotel', 'Package', 'Membership', 'Restaurant'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <span className="text-sm text-ink-500">bookings completed</span>
              <input type="number" min="1" className="input h-9 w-20 py-0 text-sm" value={draft.count} onChange={(e) => setDraft({ ...draft, count: e.target.value })} />
            </span>],
            ['Then', <select key="g" className="input h-9 w-auto py-0 text-sm" value={draft.gives} onChange={(e) => setDraft({ ...draft, gives: e.target.value })}>
              {Object.values(catalogue).flat().map((c) => <option key={c}>{c}</option>)}
            </select>],
            ['Worth', <span key="v" className="flex flex-wrap items-center gap-2">
              <input type="number" className="input h-9 w-32 py-0 text-sm" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
              <span className="text-sm text-ink-500">valid for</span>
              <input type="number" className="input h-9 w-20 py-0 text-sm" value={draft.valid} onChange={(e) => setDraft({ ...draft, valid: e.target.value })} />
              <span className="text-sm text-ink-500">days, maximum</span>
              <input type="number" className="input h-9 w-16 py-0 text-sm" value={draft.max} onChange={(e) => setDraft({ ...draft, max: e.target.value })} />
              <span className="text-sm text-ink-500">per customer</span>
            </span>],
          ].map(([label, control]) => (
            <div key={label} className="flex flex-wrap items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">{label}</span>
              {control}
            </div>
          ))}

          <div className="rounded-xl bg-surface-soft p-4">
            <p className="eyebrow">Reads as</p>
            <p className="mt-1.5 text-sm text-ink-800">
              When <b>{draft.trigger.toLowerCase()}</b> and the customer has completed <b>{draft.count}</b>{' '}
              {draft.type.toLowerCase()} bookings, give them a <b>{draft.gives.toLowerCase()}</b> worth{' '}
              <b>{inr(draft.value)}</b> — valid {draft.valid} days, {draft.max} per customer.
            </p>
          </div>
        </div>

        <p className="eyebrow mt-5">Everything the admin can set</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ruleControls.map((c) => (
            <span key={c} className="chip text-ink-600">
              {c}
            </span>
          ))}
        </div>
      </Block>
    ),

    Rules: (
      <Block title="Reward rules" note="What each one hands out, and what it costs us" wide>
        <Table
          head={['Rule', 'When', 'Conditions', 'Gives', 'Customer value', 'Company cost', 'Valid for', 'Maximum', 'Earned', 'Status']}
          rows={rewardRules.map((r) => ({
            key: r.id,
            cells: [
              r.name,
              <Badge tone="violet">{r.when}</Badge>,
              <span className="text-xs text-ink-500">{r.conditions.join(' · ')}</span>,
              r.gives,
              <span className="num font-bold text-ink-900">{inr(r.value)}</span>,
              <span className="num text-rose-600">{inr(r.cost)}</span>,
              r.validFor,
              r.max,
              <span className="num">{r.earned}</span>,
              <Badge tone={r.status === 'Active' ? 'green' : 'slate'} dot>
                {r.status}
              </Badge>,
            ],
          }))}
          foot={['Total', '', '', '', inr(rewardRules.reduce((s, r) => s + r.value * r.earned, 0)), inr(rewardRules.reduce((s, r) => s + r.cost * r.earned, 0)), '', '', rewardRules.reduce((s, r) => s + r.earned, 0), '']}
        />
      </Block>
    ),

    Catalogue: (
      <Block title="Reward catalogue" note="Not just coupons — gifts, money, experiences and travel" wide>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(catalogue).map(([group, list]) => (
            <div key={group} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">{group}</p>
              <ul className="mt-2 space-y-1.5">
                {list.map((c) => (
                  <li key={c} className="text-sm text-ink-700">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Block>
    ),

    Milestones: (
      <Block title="Booking milestones" note="The more they book, the better it gets" wide>
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(milestones).map(([product, steps]) => (
            <div key={product} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">{product}</p>
              <ol className="mt-3 space-y-3 border-l border-ink-900/[0.07] pl-4">
                {steps.map((s) => (
                  <li key={s.at} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                    <p className="text-sm font-bold text-ink-900">{s.gives}</p>
                    <p className="num text-xs text-ink-500">{s.at}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-400">
          These are examples, not fixed rules — every step is editable from the rule builder.
        </p>
      </Block>
    ),

    'Customer rewards': (
      <Block title="What each member has earned" note="Progress, what it unlocked and where it stands" wide>
        <ul className="space-y-3">
          {customerRewards.map((r) => (
            <li key={r.id} className="rounded-xl border border-ink-900/[0.07] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={r.customer} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink-900">
                    {r.customer} <span className="text-xs font-semibold text-ink-400">{r.membership}</span>
                  </span>
                  <span className="block text-xs text-ink-500">
                    {r.reward} · {r.reason} · earned {r.earnedOn} · expires {r.expires}
                  </span>
                </span>
                <span className="num text-sm font-bold text-brand-700">{inr(r.value)}</span>
                <Badge tone={lifecycleTone[r.stage]} dot>
                  {r.stage}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  {r.progress.label}
                  <span className="num text-ink-900">
                    {r.progress.done}/{r.progress.needed}
                    {r.progress.done >= r.progress.needed && ' ✅'}
                  </span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full ${r.progress.done >= r.progress.needed ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, Math.round((r.progress.done / r.progress.needed) * 100))}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Block>
    ),

    'Refer and earn': (
      <>
        <Block title="Refer and earn" note="Who brought whom, and what it earned them" wide>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Referrals" value={referrals.length} />
            <Stat label="Successful" value={successful} tone="text-emerald-600" />
            <Stat label="Conversion" value={`${conversion}%`} />
            <Stat label="Revenue from referrals" value={inr(referralRevenue)} tone="text-brand-700" />
          </div>

          <div className="mt-4">
            <Table
              head={['Referrer', 'Referred', 'Shared on', 'Stage', 'Membership bought', 'Value', 'Their reward', 'Verified']}
              rows={referrals.map((r) => ({
                key: r.id,
                cells: [
                  <span className="flex items-center gap-2.5">
                    <Avatar name={r.referrer} size="sm" /> {r.referrer}
                  </span>,
                  r.referred,
                  <span className="num">{r.sharedOn}</span>,
                  <Badge tone={r.stage === 'Reward unlocked' ? 'green' : 'sky'} dot>
                    {r.stage}
                  </Badge>,
                  r.membership,
                  <span className="num">{r.value ? inr(r.value) : '—'}</span>,
                  <span className="num text-brand-700">{r.rewardValue ? inr(r.rewardValue) : r.reward}</span>,
                  r.verified ? <Badge tone="green">Yes</Badge> : <Badge tone="amber">Not yet</Badge>,
                ],
              }))}
            />
          </div>
        </Block>

        <Block title="The referral pipeline" note="Every referral sits at one of these" wide>
          <Flow steps={referralPipeline} at={referralPipeline.indexOf(referrals[0].stage)} />
          <p className="eyebrow mt-5">What the panel does the moment it converts</p>
          <ol className="mt-2 space-y-2 border-l border-ink-900/[0.07] pl-4">
            {referralAutomation.map((a) => (
              <li key={a} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                <p className="text-sm text-ink-800">{a}</p>
              </li>
            ))}
          </ol>
        </Block>

        <Block title="The referral reward" note="What a successful referral is worth, and the limits on it" wide>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <Stat label="Gives" value={referralRule.gives} />
            <Stat label="Maximum discount" value={inr(referralRule.maxDiscount)} />
            <Stat label="Minimum booking" value={inr(referralRule.minBooking)} />
            <Stat label="Expiry" value={referralRule.expiry} />
            <Stat label="Referrals a month" value={referralRule.perMonth} />
            <Stat label="Can be combined" value={referralRule.combinable ? 'Yes' : 'No'} />
          </div>
          <p className="eyebrow mt-5">All of it is the admin's to change</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {referralControls.map((c) => (
              <span key={c} className="chip text-ink-600">
                {c}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    Approvals: (
      <>
        <Block title="What needs signing off" note="Most rewards go through on their own" wide>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">Straight through</p>
              <ul className="mt-2 space-y-1.5">
                {autoApproved.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-ink-700">
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-600" /> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">Needs a person</p>
              <ul className="mt-2 space-y-1.5">
                {needsApproval.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-ink-700">
                    <Circle size={14} className="shrink-0 text-amber-500" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="eyebrow mt-5">Waiting on approval</p>
          <ul className="mt-2 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {awaitingApproval.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Avatar name={r.customer} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink-900">{r.customer}</span>
                  <span className="block text-xs text-ink-500">
                    {r.reward} · {r.reason} · {inr(r.value)}
                  </span>
                </span>
                <button className="btn-ghost btn-sm" onClick={() => toast(`${r.reward} approved for ${r.customer}`)}>
                  Approve
                </button>
                <button className="btn-ghost btn-sm" onClick={() => toast(`${r.reward} rejected`)}>
                  Reject
                </button>
              </li>
            ))}
            {awaitingApproval.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink-500">Nothing waiting.</li>
            )}
          </ul>
          <button className="btn-ghost mt-3" onClick={() => toast('All pending rewards approved')}>
            Approve everything pending
          </button>
        </Block>
      </>
    ),

    'Gift dispatch': (
      <Block title="Getting the gift there" note="Approved, packed, dispatched, delivered" wide>
        <Table
          head={['Gift', 'Customer', 'Why', 'Courier', 'AWB', 'Dispatched', 'Delivered', 'Proof', 'Staff', 'Stage']}
          rows={dispatches.map((d) => ({
            key: d.id,
            cells: [
              d.gift,
              d.customer,
              d.reason,
              d.courier,
              <span className="num">{d.awb}</span>,
              <span className="num">{d.dispatched}</span>,
              <span className="num">{d.delivered}</span>,
              d.proof,
              d.staff,
              <Badge tone={d.stage === 'Delivered' ? 'green' : 'amber'} dot>
                {d.stage}
              </Badge>,
            ],
          }))}
        />
        <div className="mt-4">
          <Flow steps={dispatchFlow} />
        </div>
        <button className="btn-ghost mt-4" onClick={() => toast('Marked as dispatched')}>
          <Truck size={15} /> Mark the next one dispatched
        </button>
      </Block>
    ),

    'Cost and ROI': (
      <>
        <Block title="What a reward really costs" note="What the customer sees against what we pay" wide>
          <Table
            head={['Reward', 'Customer value', 'Company cost', 'Difference', 'Times earned', 'Total face value', 'Total cost']}
            rows={rewardRules.map((r) => ({
              key: r.id,
              cells: [
                r.gives,
                <span className="num">{inr(r.value)}</span>,
                <span className="num text-rose-600">{inr(r.cost)}</span>,
                <span className="num text-emerald-600">{inr(r.value - r.cost)}</span>,
                <span className="num">{r.earned}</span>,
                <span className="num">{inr(r.value * r.earned)}</span>,
                <span className="num font-bold text-ink-900">{inr(r.cost * r.earned)}</span>,
              ],
            }))}
            foot={[
              'Total', '', '', '',
              rewardRules.reduce((s, r) => s + r.earned, 0),
              inr(rewardRules.reduce((s, r) => s + r.value * r.earned, 0)),
              inr(rewardRules.reduce((s, r) => s + r.cost * r.earned, 0)),
            ]}
          />
        </Block>

        <Block title="Is the programme worth it" note="Revenue from rewarded customers against what the rewards cost">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Revenue from rewarded customers" value={inr(roi.revenueFromRewarded)} tone="text-brand-700" />
            <Stat label="Reward cost" value={inr(roi.rewardCost)} tone="text-rose-600" />
          </div>
          <div className="mt-4 rounded-xl bg-surface-soft p-5 ring-1 ring-ink-900/[0.05]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Return</p>
            <p className="num mt-2 font-display text-3xl font-extrabold text-ink-900">{roiMultiple}×</p>
            <p className="mt-1.5 text-sm text-ink-500">revenue for every rupee spent on rewards</p>
          </div>
        </Block>

        <Block title="Reward liability" note="What members could still claim">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Face value outstanding" value={inr(liability)} tone="text-amber-600" />
            <Stat
              label="What that would cost us"
              value={inr(
                customerRewards
                  .filter((r) => ['Earned', 'Pending', 'Approved', 'Available'].includes(r.stage))
                  .reduce((s, r) => s + r.cost, 0)
              )}
            />
          </div>
        </Block>
      </>
    ),

    Campaigns: (
      <>
        <Block
          title="Campaigns"
          note="Temporary rules, with a budget and an end date"
          wide
          action={
            <button className="btn-ghost btn-sm" onClick={() => setSection('Rule builder')}>
              <Plus size={14} /> New campaign
            </button>
          }
        >
          <Table
            head={['Campaign', 'The offer', 'Runs', 'Audience', 'Budget', 'Used', 'Limit', 'Cities', 'Status']}
            rows={campaigns.map((c) => ({
              key: c.id,
              cells: [
                c.name,
                c.rule,
                <span className="num">
                  {c.from} → {c.to}
                </span>,
                `${c.audience} · ${c.level}`,
                <span className="num">{inr(c.budget)}</span>,
                <span className="num text-amber-600">{inr(c.used)}</span>,
                c.limit,
                c.cities,
                <Badge tone={c.status === 'Live' ? 'green' : 'sky'} dot>
                  {c.status}
                </Badge>,
              ],
            }))}
          />
          <p className="eyebrow mt-5">What the admin sets on a campaign</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {campaignControls.map((c) => (
              <span key={c} className="chip text-ink-600">
                {c}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    WhatsApp: (
      <Block title="What the member is told" note="Every reward sets off a message" wide>
        <ul className="space-y-3">
          {whatsappMessages.map((m) => (
            <li key={m.when} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <MessageCircle size={14} className="text-emerald-600" /> {m.when}
              </p>
              <p className="mt-2 inline-block rounded-2xl rounded-tr-sm bg-emerald-500 px-3.5 py-2 text-sm text-white">
                {m.text}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-400">These run through the same WhatsApp automation as the rest of the panel.</p>
      </Block>
    ),

    'Staff coupons': (
      <Block
        title="Staff coupon codes"
        note="So a sale can be traced back to whoever brought it in"
        wide
        action={
          <button className="btn-ghost btn-sm" onClick={() => toast('Coupon code created')}>
            <Plus size={14} /> Create code
          </button>
        }
      >
        <Table
          head={['Code', 'Staff', 'What it gives', 'Valid till', 'Times used', 'Revenue brought in', 'Status']}
          rows={staffCoupons.map((c) => ({
            key: c.code,
            cells: [
              <span className="num flex items-center gap-2 text-brand-700">
                <Ticket size={14} /> {c.code}
              </span>,
              c.staff,
              c.gives,
              <span className="num">{c.validTill}</span>,
              <span className="num">{c.used}</span>,
              <span className="num font-bold text-brand-700">{inr(c.revenue)}</span>,
              <Badge tone="green" dot>
                {c.status}
              </Badge>,
            ],
          }))}
          foot={['Total', '', '', '', staffCoupons.reduce((s, c) => s + c.used, 0), inr(staffCoupons.reduce((s, c) => s + c.revenue, 0)), '']}
        />
      </Block>
    ),

    Reports: (
      <Block title="What management gets" note="Every report the programme produces" wide>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Object.entries(reportGroups).map(([group, list]) => (
            <div key={group} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">{group}</p>
              <ul className="mt-2 space-y-1.5">
                {list.map((r) => (
                  <li key={r}>
                    <button onClick={() => toast(`${r} ready`)} className="text-left text-sm text-ink-700 hover:text-brand-700">
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="Rewards, refer and earn" subtitle="What members earn, what it costs us, and how it reaches them">
        <button className="btn-ghost" onClick={() => setSection('Refer and earn')}>
          <Share2 size={16} /> Referrals
        </button>
        <button className="btn-primary" onClick={() => setSection('Rule builder')}>
          <Plus size={16} /> Create reward
        </button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
              section === s
                ? 'bg-ink-900 text-white shadow-sm'
                : 'bg-white text-ink-600 ring-1 ring-ink-900/[0.07] hover:text-ink-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">{body[section]}</div>
    </>
  );
}
