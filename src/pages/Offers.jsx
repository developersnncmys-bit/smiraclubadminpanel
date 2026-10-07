import { useState } from 'react';
import {
  Megaphone,
  Plus,
  Tag,
  Trash2,
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
  distribution,
  tierAccess,
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
import Table from '../components/ui/Table.jsx';

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
  /**
   * The offers are the ones on the server, not a list in this repository.
   *
   * The seed had been emptied already, so every figure on this page was
   * nought whatever the desk had running. It reads the Offers collection
   * now — the same rows the website checks a coupon against.
   */
  const { toast, create, update, remove, offers = [], live: online } = useApp();
  const [section, setSection] = useState('Dashboard');
  const [saving, setSaving] = useState(false);

  /**
   * A new offer, in the shape the server keeps one.
   *
   * These were the website's words before — "Percentage discount", a tier,
   * a condition — none of which the server has a field for, which is why
   * the form only ever raised a toast. They are its own words now, so what
   * is typed here is what a member types a code into the website and gets.
   */
  const [draft, setDraft] = useState({
    name: '',
    code: '',
    description: '',
    kind: 'Percent off',
    value: 10,
    maxDiscount: 0,
    minSpend: 0,
    appliesTo: ['Membership'],
    startsOn: '',
    endsOn: '',
    usageLimit: 0,
    status: 'Live',
  });

  const set = (k) => (e) => setDraft((o) => ({ ...o, [k]: e.target.value }));
  const setNum = (k) => (e) => setDraft((o) => ({ ...o, [k]: e.target.value === '' ? '' : Number(e.target.value) }));
  const toggleUse = (what) =>
    setDraft((o) => ({
      ...o,
      appliesTo: o.appliesTo.includes(what)
        ? o.appliesTo.filter((x) => x !== what)
        : [...o.appliesTo, what],
    }));

  const percent = draft.kind === 'Percent off';
  const moneyOff = percent || draft.kind === 'Flat off';

  /** Only the real ones — the seed rows above have no code to type. */
  const coupons = offers.filter((o) => o.code && !o.flash);

  const saveOffer = () => {
    const name = draft.name.trim();
    const code = draft.code.trim().toUpperCase();
    if (!name) return toast('Give the offer a name', 'danger');
    if (!code) return toast('Give it a code for members to type', 'danger');
    if (coupons.some((o) => (o.code || '').toUpperCase() === code))
      return toast(`${code} is already in use`, 'danger');
    if (moneyOff && !(Number(draft.value) > 0)) return toast('Put a value on it', 'danger');
    if (draft.startsOn && draft.endsOn && draft.endsOn < draft.startsOn)
      return toast('It cannot end before it starts', 'danger');

    setSaving(true);
    create('offers', {
      ...draft,
      name,
      code,
      value: Number(draft.value) || 0,
      maxDiscount: percent ? Number(draft.maxDiscount) || 0 : 0,
      minSpend: Number(draft.minSpend) || 0,
      usageLimit: Number(draft.usageLimit) || 0,
      used: 0,
    });
    setSaving(false);
    setDraft((o) => ({ ...o, name: '', code: '', description: '' }));
  };

  const live = offers.filter((o) => o.status === 'Live');
  // Nothing counts a view or a click against an offer yet, so these are
  // nought until something does — not a number this page made up.
  const add = (key) => offers.reduce((s, o) => s + Number(o[key] || 0), 0);
  const views = add('views');
  const clicks = add('clicks');
  const enquiries = add('enquiries');
  const bookings = add('bookings');
  const revenue = add('revenue');
  const discountCost = add('discountCost');
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
                  <span className="num font-display text-lg font-extrabold text-ink-900">{Number(r.value || 0).toLocaleString('en-IN')}</span>
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
                    <span className="num">{Number(o.views || 0).toLocaleString('en-IN')}</span>,
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
                {(o.tiers || []).map((t) => (
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
          note={
            online
              ? 'Name it, give it a code, say what it takes off and for how long'
              : 'Name it, give it a code, say what it takes off and for how long — not signed in, so this stays on this screen'
          }
          wide
          action={
            <button className="btn-action btn-sm" onClick={saveOffer} disabled={saving}>
              <Plus size={14} /> {saving ? 'Saving…' : 'Save offer'}
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Offer name</label>
              <input
                className="input"
                placeholder="Festive membership offer"
                value={draft.name}
                onChange={set('name')}
              />
            </div>
            <div>
              <label className="label">Coupon code</label>
              <input
                className="input num uppercase"
                placeholder="SMIRA500"
                spellCheck={false}
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
              />
              <p className="mt-1 text-xs text-ink-500">What a member types on the website.</p>
            </div>

            <div>
              <label className="label">What the customer gets</label>
              <select className="input" value={draft.kind} onChange={set('kind')}>
                {['Percent off', 'Flat off', 'Free night', 'Upgrade', 'Gift'].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{percent ? 'Percentage off' : moneyOff ? 'Amount off (₹)' : 'Value (for the books)'}</label>
              <input type="number" min="0" className="input" value={draft.value} onChange={setNum('value')} />
            </div>

            {percent && (
              <div>
                <label className="label">Most it can take off (₹)</label>
                <input type="number" min="0" className="input" value={draft.maxDiscount} onChange={setNum('maxDiscount')} />
                <p className="mt-1 text-xs text-ink-500">0 for no ceiling.</p>
              </div>
            )}
            <div>
              <label className="label">Minimum spend (₹)</label>
              <input type="number" min="0" className="input" value={draft.minSpend} onChange={setNum('minSpend')} />
              <p className="mt-1 text-xs text-ink-500">0 to let it go on anything.</p>
            </div>

            <div>
              <label className="label">Where it can be used</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Membership', 'Booking'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => toggleUse(w)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                      draft.appliesTo.includes(w)
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-ink-900/10 text-ink-600 hover:bg-surface-soft'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-500">Nothing picked means anywhere.</p>
            </div>
            <div>
              <label className="label">Total redemptions</label>
              <input type="number" min="0" className="input" value={draft.usageLimit} onChange={setNum('usageLimit')} />
              <p className="mt-1 text-xs text-ink-500">0 for no cap.</p>
            </div>

            <div>
              <label className="label">Starts on</label>
              <input type="date" className="input" value={draft.startsOn} onChange={set('startsOn')} />
            </div>
            <div>
              <label className="label">Ends on</label>
              <input type="date" className="input" value={draft.endsOn} onChange={set('endsOn')} />
            </div>

            <div>
              <label className="label">Status</label>
              <select className="input" value={draft.status} onChange={set('status')}>
                {['Live', 'Draft', 'Paused'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-500">Only a Live code works on the website.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input
                className="input"
                placeholder="Shown to the member when the code goes on"
                value={draft.description}
                onChange={set('description')}
              />
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-800">
            <b>{draft.name || 'This offer'}</b> — code <b className="num">{draft.code || '—'}</b> takes{' '}
            <b>{percent ? `${draft.value || 0}%` : moneyOff ? inr(draft.value || 0) : draft.kind.toLowerCase()}</b>
            {percent && Number(draft.maxDiscount) > 0 ? ` off, up to ${inr(draft.maxDiscount)},` : ' off'}{' '}
            {Number(draft.minSpend) > 0 ? `on anything over ${inr(draft.minSpend)}` : 'with no minimum'}, for{' '}
            <b>{draft.appliesTo.length ? draft.appliesTo.join(' and ') : 'anything'}</b>
            {Number(draft.usageLimit) > 0 ? `, capped at ${draft.usageLimit} uses` : ', uncapped'}
            {draft.endsOn ? `, until ${draft.endsOn}` : ''}.
          </p>
        </Block>

        <Block
          title="Coupon codes"
          note="What a member can type on the website right now"
          wide
        >
          {coupons.length === 0 ? (
            <p className="rounded-xl bg-surface-soft px-4 py-6 text-center text-sm text-ink-600">
              No codes yet. The one above goes live as soon as you save it.
            </p>
          ) : (
            <Table
              head={['Code', 'Offer', 'Takes off', 'Used', 'Until', 'Status', '']}
              rows={coupons.map((o) => ({
                key: o.id,
                cells: [
                  <span className="num font-semibold text-ink-900">{o.code}</span>,
                  <span className="text-ink-700">{o.name}</span>,
                  <span className="text-ink-700">
                    {o.kind === 'Percent off'
                      ? `${o.value}%${o.maxDiscount ? ` (max ${inr(o.maxDiscount)})` : ''}`
                      : o.kind === 'Flat off'
                        ? inr(o.value)
                        : o.kind}
                    {o.minSpend ? ` over ${inr(o.minSpend)}` : ''}
                  </span>,
                  <span className="num text-ink-700">
                    {o.used || 0}
                    {o.usageLimit ? ` / ${o.usageLimit}` : ''}
                  </span>,
                  <span className="text-ink-700">{o.endsOn || '—'}</span>,
                  <Badge tone={o.status === 'Live' ? 'success' : o.status === 'Paused' ? 'warning' : 'neutral'}>
                    {o.status}
                  </Badge>,
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() =>
                        update('offers', o.id, { status: o.status === 'Live' ? 'Paused' : 'Live' })
                      }
                    >
                      {o.status === 'Live' ? 'Pause' : 'Make live'}
                    </button>
                    <button
                      className="btn-ghost btn-sm text-rose-600"
                      onClick={() => remove('offers', o.id)}
                      aria-label={`Delete ${o.code}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>,
                ],
              }))}
            />
          )}

          <p className="mt-4 flex items-start gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
            <Tag size={15} className="mt-0.5 shrink-0 text-brand-600" />
            The website checks every one of these against this list when a member
            presses Apply — the dates, the cap, the minimum spend and the status.
            Pausing a code stops it being accepted on the next press.
          </p>
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
                  {(o.where || []).map((w) => (
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
              {(c.includes || []).map((i) => (
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
                {
                  // An offer saved from the form above has no tiers on it:
                  // nothing on the server records who an offer is for yet.
                  offers.filter((o) => (o.tiers || []).some((x) => x === t.tier || x === 'All members'))
                    .length
                }
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
