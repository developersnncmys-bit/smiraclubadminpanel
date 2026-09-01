import { useState } from 'react';
import {
  Megaphone,
  Plus,
  GripVertical,
  Eye,
  MousePointerClick,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Send,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr } from '../data/mockData.js';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import {
  homepageSections,
  offerTypes,
  benefitTypes,
  membershipEligibility,
  customerConditions,
  validityControls,
  usageControls,
  distribution,
  tierAccess,
  offers,
  lifestyleCategories,
  lifestyleOffers,
  campaigns,
  redemptionStates,
  redemptions,
  approvalFlow,
  approvalHistory,
  personalisationSignals,
  smartExamples,
  offerAutomation,
  notifications,
  fraudControls,
  minimumMargin,
  connectedModules,
  topDestinations,
} from '../data/offersData.js';

const SECTIONS = [
  'Dashboard',
  'Homepage',
  'Offers',
  'Create offer',
  'Distribution',
  'Campaigns',
  'Lifestyle',
  'Smart engine',
  'Margin control',
  'Membership tiers',
  'Automation',
  'Approvals',
  'Redemptions',
  'Fraud controls',
];

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

/** Selling price − vendor cost − discount, as a share of what was sold. */
const marginOf = (o) => {
  const net = o.revenue - o.vendorCost - o.discountCost;
  return { net, pct: o.revenue ? Math.round((net / o.revenue) * 100) : 0 };
};

/**
 * Offers and promotions as the client's sheet describes it: not a banner, but
 * a rule that knows who gets it, what they get, where they can use it, how
 * many times, what it costs and what it brings back.
 */
export default function Offers() {
  const { toast } = useApp();
  const [section, setSection] = useState('Dashboard');
  const [draft, setDraft] = useState({
    name: 'Weekend villa escape',
    code: 'WEEKEND25',
    category: 'Holiday and travel',
    benefit: 'Percentage discount',
    value: 25,
    tier: 'Gold',
    condition: 'Minimum booking value',
    minBooking: 10000,
    total: 500,
    perCustomer: 1,
  });

  const live = offers.filter((o) => o.status === 'Live');
  const views = offers.reduce((s, o) => s + o.views, 0);
  const clicks = offers.reduce((s, o) => s + o.clicks, 0);
  const enquiries = offers.reduce((s, o) => s + o.enquiries, 0);
  const bookings = offers.reduce((s, o) => s + o.bookings, 0);
  const revenue = offers.reduce((s, o) => s + o.revenue, 0);
  const discountCost = offers.reduce((s, o) => s + o.discountCost, 0);
  const netMargin = offers.reduce((s, o) => s + marginOf(o).net, 0);
  const roi = discountCost ? Math.round(revenue / discountCost) : 0;
  const lowMargin = offers.filter((o) => marginOf(o).pct < minimumMargin);
  const awaiting = offers.filter((o) => o.stage !== 'Approved');

  const body = {
    Dashboard: (
      <>
        <div className="grid gap-4 xl:col-span-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section className="card relative overflow-hidden p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/12 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Revenue from offers</p>
              <p className="num mt-2 font-display text-4xl font-extrabold leading-none text-ink-900">{inr(revenue)}</p>
              <p className="mt-1.5 text-sm text-ink-500">
                {bookings} bookings · {inr(discountCost)} given away in discount
              </p>
              <div className="mt-5">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  <span>Margin left after the offer</span>
                  <span className="num">{Math.round((netMargin / Math.max(1, revenue)) * 100)}%</span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${Math.max(0, Math.round((netMargin / Math.max(1, revenue)) * 100))}%` }}
                  />
                </div>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-sm">
                <Megaphone size={14} className="text-ink-400" />
                {roi}× revenue for every rupee discounted
              </p>
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">The funnel</p>
            <ul className="mt-3 space-y-2.5">
              {[
                { label: 'Viewed', value: views, tone: 'bg-sky-500' },
                { label: 'Clicked', value: clicks, tone: 'bg-violet-500' },
                { label: 'Enquired', value: enquiries, tone: 'bg-amber-500' },
                { label: 'Booked', value: bookings, tone: 'bg-emerald-500' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-2.5">
                  <span className={`h-8 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-lg font-extrabold text-ink-900">{r.value.toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Needs a person</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Below the margin floor', value: lowMargin.length, tone: 'bg-rose-500' },
                { label: 'Waiting on approval', value: awaiting.length, tone: 'bg-amber-500' },
                { label: 'Live right now', value: live.length, tone: 'bg-emerald-500' },
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
            { label: 'Offers', value: offers.length, hint: `${live.length} live` },
            { label: 'Click rate', value: `${Math.round((clicks / Math.max(1, views)) * 100)}%` },
            { label: 'Conversion', value: `${Math.round((bookings / Math.max(1, clicks)) * 100)}%`, hint: 'click to booking' },
            { label: 'Redemptions', value: offers.reduce((s, o) => s + o.used, 0) },
            { label: 'Net margin', value: shortInr(netMargin), tone: 'text-brand-700' },
            { label: 'Lifestyle offers', value: lifestyleOffers.length },
          ].map((g) => (
            <div key={g.label} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{g.label}</p>
              <p className={`num mt-1.5 font-display text-2xl font-extrabold ${g.tone || 'text-ink-900'}`}>{g.value}</p>
              {g.hint && <p className="mt-0.5 text-xs text-ink-400">{g.hint}</p>}
            </div>
          ))}
        </div>

        <Block title="Top offers" note="Ranked by what they brought in" wide>
          <Table
            head={['Offer', 'Views', 'Clicks', 'Enquiries', 'Bookings', 'Revenue', 'Discount', 'Net margin', 'Margin %']}
            rows={[...offers]
              .sort((a, b) => b.revenue - a.revenue)
              .map((o) => {
                const m = marginOf(o);
                return {
                  key: o.id,
                  cells: [
                    o.name,
                    <span className="num">{o.views.toLocaleString('en-IN')}</span>,
                    <span className="num">{o.clicks}</span>,
                    <span className="num">{o.enquiries}</span>,
                    <span className="num">{o.bookings}</span>,
                    <span className="num font-bold text-brand-700">{inr(o.revenue)}</span>,
                    <span className="num text-rose-600">{inr(o.discountCost)}</span>,
                    <span className="num">{inr(m.net)}</span>,
                    <span className={`num font-bold ${m.pct < minimumMargin ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {m.pct}%
                    </span>,
                  ],
                };
              })}
          />
          <p className="eyebrow mt-5">Top destinations</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topDestinations.map((d) => (
              <span key={d} className="chip text-ink-600">
                {d}
              </span>
            ))}
          </div>
        </Block>

        <Block title="An offer is a business rule, not a banner" note="It knows all of this before it ever appears" wide>
          <Flow steps={['Who gets it', 'What they get', 'When they get it', 'Where they can use it', 'How many times', 'What it costs us', 'What it brings back']} />
          <p className="eyebrow mt-5">It talks to</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {connectedModules.map((m) => (
              <span key={m} className="chip text-ink-600">
                {m}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    Homepage: (
      <Block
        title="Homepage offer control"
        note="Drag, reorder, publish — this is what the website shows"
        wide
        action={
          <button className="btn-line btn-sm" onClick={() => toast('Homepage published')}>
            <Send size={14} /> Publish
          </button>
        }
      >
        <ul className="space-y-2">
          {homepageSections.map((s, i) => (
            <li key={s.name} className="flex items-center gap-3 rounded-xl border border-ink-900/[0.07] px-4 py-2.5">
              <GripVertical size={15} className="shrink-0 text-ink-300" />
              <span className="num w-6 shrink-0 text-sm font-bold text-ink-400">{i + 1}</span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-ink-800">{s.name}</span>
              <span className="num text-xs text-ink-500">{s.offers} offers</span>
              <Badge tone={s.live ? 'green' : 'slate'} dot>
                {s.live ? 'Live' : 'Hidden'}
              </Badge>
              <button className="btn-line btn-sm" onClick={() => toast(`${s.name} ${s.live ? 'hidden' : 'published'}`)}>
                {s.live ? 'Hide' : 'Show'}
              </button>
            </li>
          ))}
        </ul>
      </Block>
    ),

    Offers: (
      <Block
        title="Every offer"
        note="What it gives, who it is for, when it runs and how much is left"
        wide
        action={
          <button className="btn-action btn-sm" onClick={() => setSection('Create offer')}>
            <Plus size={14} /> New offer
          </button>
        }
      >
        <Table
          head={['Offer', 'Code', 'Category', 'Gives', 'For', 'Runs', 'Used', 'Per customer', 'Minimum booking', 'Status']}
          rows={offers.map((o) => ({
            key: o.id,
            cells: [
              <span>
                {o.name}
                <span className="block text-xs font-normal text-ink-500">{o.headline}</span>
              </span>,
              <span className="num text-brand-700">{o.code}</span>,
              <span>
                {o.category}
                <span className="block text-xs text-ink-400">{o.sub}</span>
              </span>,
              o.benefit,
              <span className="flex flex-wrap gap-1">
                {o.tiers.map((t) => (
                  <Badge key={t} tone="teal">
                    {t}
                  </Badge>
                ))}
              </span>,
              <span className="num text-xs">
                {o.from} → {o.to}
              </span>,
              <span className="num">
                {o.used}
                {o.totalLimit ? ` / ${o.totalLimit}` : ''}
              </span>,
              <span className="num">{o.perCustomer}</span>,
              <span className="num">{o.minBooking ? inr(o.minBooking) : '—'}</span>,
              <Badge tone={o.status === 'Live' ? 'green' : 'sky'} dot>
                {o.status}
              </Badge>,
            ],
          }))}
        />
        <p className="mt-3 text-xs text-ink-400">
          Blackout dates apply per offer — the weekend villa deal is off over Diwali, Christmas and New Year.
        </p>
      </Block>
    ),

    'Create offer': (
      <>
        <Block
          title="Create an offer"
          note="Name it, choose what it gives, then who and how often"
          wide
          action={
            <button className="btn-action btn-sm" onClick={() => toast('Offer sent for approval')}>
              <Plus size={14} /> Save and submit
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Offer name</label>
              <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Offer code</label>
              <input className="input" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {Object.keys(offerTypes).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sub-category</label>
              <select className="input">
                {offerTypes[draft.category].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">What the customer gets</label>
              <select className="input" value={draft.benefit} onChange={(e) => setDraft({ ...draft, benefit: e.target.value })}>
                {benefitTypes.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Value</label>
              <input type="number" className="input" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
            </div>
            <div>
              <label className="label">Who it is for</label>
              <select className="input" value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value })}>
                {membershipEligibility.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Condition</label>
              <select className="input" value={draft.condition} onChange={(e) => setDraft({ ...draft, condition: e.target.value })}>
                {customerConditions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Minimum booking (₹)</label>
              <input type="number" className="input" value={draft.minBooking} onChange={(e) => setDraft({ ...draft, minBooking: e.target.value })} />
            </div>
            <div>
              <label className="label">Total redemptions</label>
              <input type="number" className="input" value={draft.total} onChange={(e) => setDraft({ ...draft, total: e.target.value })} />
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-800">
            <b>{draft.name}</b> — {draft.benefit.toLowerCase()} of{' '}
            <b>
              {draft.benefit === 'Percentage discount' ? `${draft.value}%` : inr(draft.value)}
            </b>{' '}
            for <b>{draft.tier}</b>, on bookings over {inr(draft.minBooking)}, {draft.perCustomer} per customer, capped
            at {draft.total} redemptions. Code <b className="num">{draft.code}</b>.
          </p>
        </Block>

        <Block title="Everything else the admin sets" note="Validity, usage and eligibility" wide>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['When it can be used', validityControls],
              ['How often', usageControls],
              ['Who qualifies', customerConditions],
            ].map(([title, list]) => (
              <div key={title} className="rounded-xl border border-ink-900/[0.07] p-4">
                <p className="eyebrow">{title}</p>
                <ul className="mt-2 space-y-1.5">
                  {list.map((x) => (
                    <li key={x} className="text-sm text-ink-700">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Block>
      </>
    ),

    Distribution: (
      <Block title="Where the offer shows up" note="One offer, wherever the customer is" wide>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(distribution).map(([channel, spots]) => (
            <div key={channel} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">{channel}</p>
              <ul className="mt-2 space-y-1.5">
                {spots.map((s) => (
                  <li key={s} className="text-sm text-ink-700">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="eyebrow mt-5">Where each live offer is placed</p>
        <div className="mt-2">
          <Table
            head={['Offer', 'Appears on']}
            rows={offers.map((o) => ({
              key: o.id,
              cells: [
                o.name,
                <span className="flex flex-wrap gap-1.5">
                  {o.where.map((w) => (
                    <span key={w} className="chip text-ink-600">
                      {w}
                    </span>
                  ))}
                </span>,
              ],
            }))}
          />
        </div>
      </Block>
    ),

    Campaigns: (
      <Block title="Campaigns" note="A season's worth of offers, run and measured together" wide>
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-xl border border-ink-900/[0.07] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-display text-base font-extrabold text-ink-900">{c.name}</p>
                <p className="num text-sm text-ink-500">
                  {c.from} → {c.to}
                </p>
              </div>
              <Badge tone="green" dot>
                {c.status}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {c.includes.map((i) => (
                <span key={i} className="chip text-ink-600">
                  {i}
                </span>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <Stat label="Campaign revenue" value={inr(c.revenue)} tone="text-brand-700" />
              <Stat label="Leads generated" value={c.leads} />
              <Stat label="Bookings" value={c.bookings} />
              <Stat label="Redemptions" value={c.redemptions} />
              <Stat label="Discount cost" value={inr(c.discountCost)} tone="text-rose-600" />
              <Stat label="Profit generated" value={inr(c.profit)} tone="text-emerald-600" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Stat label="Conversion" value={`${c.conversion}%`} />
              <Stat label="Best offer" value={c.bestOffer} />
              <Stat label="Best location" value={c.bestLocation} />
              <Stat label="Best tier" value={c.bestTier} />
            </div>
          </div>
        ))}
      </Block>
    ),

    Lifestyle: (
      <Block title="Lifestyle marketplace" note="Vendor offers, with how each one is redeemed" wide>
        <Table
          head={['Vendor', 'Category', 'Location', 'Offer', 'Original', 'Member price', 'Discount', 'Valid till', 'Days', 'Redeemed by', 'Redemptions', 'Settlement due']}
          rows={lifestyleOffers.map((l) => ({
            key: l.id,
            cells: [
              l.vendor,
              <Badge tone="teal">{l.category}</Badge>,
              l.location,
              l.offer,
              <span className="num">{inr(l.original)}</span>,
              <span className="num font-bold text-brand-700">{inr(l.member)}</span>,
              <span className="num">{l.discount}%</span>,
              <span className="num">{l.validity}</span>,
              l.days,
              <span>
                {l.redemption}
                <span className="block text-xs text-ink-400">
                  {l.bookingRequired ? 'Booking required' : 'No booking needed'} · {l.channel}
                </span>
              </span>,
              <span className="num">{l.redemptions}</span>,
              <span className="num text-amber-600">{inr(l.settlement)}</span>,
            ],
          }))}
        />
        <p className="eyebrow mt-5">Categories</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {lifestyleCategories.map((c) => (
            <span key={c} className="chip text-ink-600">
              {c}
            </span>
          ))}
        </div>
      </Block>
    ),

    'Smart engine': (
      <>
        <Block title="The panel picks the offer" note="Same page, different customer, different offer" wide>
          <div className="grid gap-4 sm:grid-cols-2">
            {smartExamples.map((e) => (
              <div key={e.customer} className="rounded-xl border border-ink-900/[0.07] p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                  <Sparkles size={14} className="text-violet-500" /> {e.customer}
                </p>
                <p className="mt-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">{e.shows}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="What it reads before deciding" note="Thirteen signals off the customer's own record" wide>
          <div className="flex flex-wrap gap-2">
            {personalisationSignals.map((s) => (
              <span key={s} className="chip text-ink-600">
                {s}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    'Margin control': (
      <Block title="What the discount does to the margin" note={`Anything under ${minimumMargin}% needs signing off`} wide>
        <Table
          head={['Offer', 'Revenue', 'Vendor cost', 'Discount given', 'Net margin', 'Margin %', '']}
          rows={offers.map((o) => {
            const m = marginOf(o);
            return {
              key: o.id,
              cells: [
                o.name,
                <span className="num">{inr(o.revenue)}</span>,
                <span className="num text-rose-600">− {inr(o.vendorCost)}</span>,
                <span className="num text-rose-600">− {inr(o.discountCost)}</span>,
                <span className="num font-bold text-ink-900">{inr(m.net)}</span>,
                <span className={`num font-bold ${m.pct < minimumMargin ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {m.pct}%
                </span>,
                m.pct < minimumMargin ? (
                  <Badge tone="rose" dot>
                    <AlertTriangle size={11} /> Approval required
                  </Badge>
                ) : (
                  <Badge tone="green" dot>
                    Healthy
                  </Badge>
                ),
              ],
            };
          })}
          foot={['Total', inr(revenue), '', inr(discountCost), inr(netMargin), `${Math.round((netMargin / Math.max(1, revenue)) * 100)}%`, '']}
        />
        <p className="mt-3 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
          A hotel sells at ₹8,000 with a ₹5,500 vendor cost and a ₹1,000 customer discount — that leaves ₹1,500 gross
          margin. Drop below the floor and the panel raises <b>Low margin offer — approval required</b>.
        </p>
      </Block>
    ),

    'Membership tiers': (
      <Block title="What each plan can see" note="The admin decides exactly what a tier gets access to" wide>
        <Table
          head={['Tier', 'What they get', 'Live offers for them']}
          rows={tierAccess.map((t) => ({
            key: t.tier,
            cells: [
              t.tier,
              t.gets,
              <span className="num">
                {offers.filter((o) => o.tiers.includes(t.tier) || o.tiers.includes('All members')).length}
              </span>,
            ],
          }))}
        />
      </Block>
    ),

    Automation: (
      <>
        <Block title="Offers that fire on their own" note="No one has to remember to send these" wide>
          <Table
            head={['When this happens', 'Send this offer']}
            rows={offerAutomation.map((a) => ({ key: a.when, cells: [a.when, a.then] }))}
          />
        </Block>

        <Block title="What the customer is told" note="Push, WhatsApp and a task for the desk" wide>
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.channel} className="rounded-xl border border-ink-900/[0.07] p-4">
                <p className="eyebrow">{n.channel}</p>
                <p className="mt-1.5 text-sm text-ink-800">{n.text}</p>
              </li>
            ))}
          </ul>
        </Block>
      </>
    ),

    Approvals: (
      <>
        <Block title="How an offer gets published" note="Draft through to live, with a trail" wide>
          <Flow steps={approvalFlow} at={approvalFlow.indexOf('Manager review')} />
          <div className="mt-4">
            <Table
              head={['Offer', 'Stage', 'Status', '']}
              rows={offers.map((o) => ({
                key: o.id,
                cells: [
                  o.name,
                  <Badge tone={o.stage === 'Approved' ? 'green' : 'amber'} dot>
                    {o.stage}
                  </Badge>,
                  o.status,
                  o.stage === 'Approved' ? (
                    '—'
                  ) : (
                    <span className="flex gap-1.5">
                      <button className="btn-line btn-sm" onClick={() => toast(`${o.name} approved`)}>
                        Approve
                      </button>
                      <button className="btn-line btn-sm" onClick={() => toast(`${o.name} sent back`)}>
                        Send back
                      </button>
                    </span>
                  ),
                ],
              }))}
            />
          </div>
        </Block>

        <Block title="Approval history" note="Who did what, and when" wide>
          <ol className="space-y-3 border-l border-ink-900/[0.07] pl-4">
            {approvalHistory.map((h) => (
              <li key={`${h.offer}-${h.at}`} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                <p className="text-sm font-bold text-ink-900">
                  {h.offer} — {h.action}
                </p>
                <p className="num text-xs text-ink-500">
                  {h.by} · {h.at}
                </p>
              </li>
            ))}
          </ol>
        </Block>
      </>
    ),

    Redemptions: (
      <Block title="Every redemption" note="Who used what, against which booking" wide>
        <Table
          head={['Customer', 'Offer', 'Booking', 'Discount', 'Date', 'Status', '']}
          rows={redemptions.map((r) => ({
            key: r.id,
            cells: [
              <span className="flex items-center gap-2.5">
                <Avatar name={r.customer} size="sm" /> {r.customer}
              </span>,
              r.offer,
              <span className="num text-brand-700">{r.booking}</span>,
              <span className="num font-bold text-ink-900">{inr(r.discount)}</span>,
              r.date,
              <Badge
                tone={
                  r.status === 'Redeemed' ? 'green' : r.status === 'Applied' ? 'sky' : r.status === 'Cancelled' ? 'rose' : 'slate'
                }
                dot
              >
                {r.status}
              </Badge>,
              <button className="btn-line btn-sm" onClick={() => toast(`${r.id} reversed`)}>
                Reverse
              </button>,
            ],
          }))}
          foot={['Total', '', '', inr(redemptions.reduce((s, r) => s + r.discount, 0)), '', '', '']}
        />
        <p className="mt-3 text-xs text-ink-400">A redemption can be: {redemptionStates.join(' · ')}.</p>
      </Block>
    ),

    'Fraud controls': (
      <Block title="Stopping the same coupon twice" note="What the panel watches, and what the desk can do" wide>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {fraudControls.map((f) => (
            <div key={f} className="flex items-center gap-2.5 rounded-xl border border-ink-900/[0.07] px-4 py-3">
              <ShieldAlert size={15} className="shrink-0 text-rose-500" />
              <span className="text-sm text-ink-700">{f}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
          <AlertTriangle size={15} className="shrink-0 text-amber-500" />
          A blocked redemption reverses the discount on the booking it was applied to, so the money never leaves.
        </p>
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="Offers and promotions" subtitle="Who gets it, what it costs us, and what it brings back">
        <button className="btn-line" onClick={() => setSection('Homepage')}>
          <Eye size={16} /> Homepage
        </button>
        <button className="btn-action" onClick={() => setSection('Create offer')}>
          <Plus size={16} /> New offer
        </button>
      </PageHeader>

      <SectionTabs
        className="mb-5"
        items={SECTIONS}
        value={section}
        onChange={setSection}
      />

      <div className="grid gap-5 xl:grid-cols-2">{body[section]}</div>
    </>
  );
}
