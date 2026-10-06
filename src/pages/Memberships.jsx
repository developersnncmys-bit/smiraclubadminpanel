import { useState } from 'react';
import {
  Plus,
  Crown,
  Check,
  X,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  Sparkles,
  Gift,
  UserPlus,
  ShieldCheck,
  IndianRupee,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr, membershipAmount } from '../data/mockData.js';

const BILLING = ['One time', 'Yearly', 'Half-yearly', 'Monthly', 'Lifetime'];

// Colour handed to the public website when a plan is created; the panel's own
// look comes from VARIANTS below.
const ACCENTS = {
  slate: { gradient: 'from-slate-600 to-slate-800' },
  amber: { gradient: 'from-amber-500 to-orange-600' },
  violet: { gradient: 'from-violet-600 to-indigo-700' },
  brand: { gradient: 'from-brand-600 to-ocean' },
  sky: { gradient: 'from-sky-600 to-ocean' },
};
const ACCENT_KEYS = ['brand', 'sky', 'amber', 'violet', 'slate'];

/** The five the website's pricing page was designed in, named as it names them. */
const WEBSITE_COLOURS = ['silver', 'gold', 'platinum', 'diamond', 'crown'];

/**
 * What each tier name is actually worth, taken from the website's own
 * values, so the swatch beside the box shows the colour the member will
 * see rather than something close to it.
 */
const TIER_HEX = {
  silver: '#5f686f',
  gold: '#b8860b',
  platinum: '#4f6c80',
  diamond: '#1f8f98',
  crown: '#6e2a4f',
  slate: '#5f686f',
  amber: '#b8860b',
  violet: '#5b4a9c',
  brand: '#1b3a6b',
  sky: '#0f6f8c',
  emerald: '#12674a',
  rose: '#9c2a4f',
};
const swatchFor = (v) => {
  const key = String(v || '').trim().toLowerCase();
  if (TIER_HEX[key]) return TIER_HEX[key];
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(key) ? key : 'transparent';
};

/**
 * The plans must not read as three identical cards. The plan marked popular
 * gets the raised gold treatment, the dearest of the rest gets the dark
 * premium header, and everything else stays a plain white card — so the
 * hierarchy is obvious at a glance and survives the agency editing prices.
 */
const VARIANTS = {
  plain: {
    card: 'card',
    head: 'bg-white px-5 pb-5 pt-5',
    tile: 'bg-slate-100 text-slate-600',
    name: 'text-ink-900',
    id: 'text-ink-500',
    tagline: 'text-ink-500',
    price: 'text-ink-900',
    note: 'text-ink-500',
    pill: 'bg-slate-100 text-slate-600',
  },
  /**
   * The most popular plan is lifted a little on a wide screen. It used to
   * be ringed in amber as well, which fought with its own colour.
   */
  highlight: {
    card: 'card shadow-raised xl:-mt-3 xl:mb-3',
    head: 'px-5 pb-5 pt-5',
    tile: 'bg-slate-100 text-slate-600',
    name: 'text-ink-900',
    id: 'text-ink-500',
    tagline: 'text-ink-500',
    price: 'text-ink-900',
    note: 'text-ink-500',
    pill: 'bg-slate-100 text-slate-600',
  },
  /**
   * The dearest plan used to be painted end to end in near-black, which
   * made it the one card you could not read at a glance and the one card
   * that did not wear the colour the desk had chosen for it. Every card is
   * white now and carries its colour on its border, where it marks the
   * plan without swallowing the writing.
   */
  premium: {
    card: 'card',
    head: 'px-5 pb-5 pt-5',
    tile: 'bg-slate-100 text-slate-600',
    name: 'text-ink-900',
    id: 'text-ink-500',
    tagline: 'text-ink-500',
    price: 'text-ink-900',
    note: 'text-ink-500',
    pill: 'bg-slate-100 text-slate-600',
  },
};

/** "5 Years", "18 Months" — the way the website writes a duration. */
const yearsOf = (months) => {
  const y = Math.round((Number(months) || 0) / 12);
  return y >= 1 ? `${y} Year${y === 1 ? '' : 's'}` : `${months || 0} Months`;
};

/**
 * The four tiles the website draws for a plan, in the website's own words.
 *
 * The card used to summarise them as "150 days free stay · 60 months · 12
 * persons · 3 rooms", which is the same numbers in different words — so the
 * desk could not tell from the panel what a member would actually read.
 * These are the labels the pricing page prints, with the desk's figures in
 * them, and every one of them is a field on the form behind the pencil.
 */
const websiteStats = (plan) => [
  { figure: `${plan.freeStay?.nights ?? 0} Days`, note: 'Free Hotel Stay' },
  { figure: yearsOf(plan.durationMonths ?? plan.freeStay?.validityMonths), note: 'Membership Validity' },
  { figure: `${plan.persons ?? 0} Persons`, note: 'Covered per stay' },
  { figure: `${plan.rooms ?? 0} Room${(plan.rooms ?? 0) === 1 ? '' : 's'}`, note: 'Allowed Per Booking' },
];

// Stand-ins for real website traffic so the incoming flow can be demonstrated.
const VISITORS = [
  { name: 'Pooja Ramteke', email: 'pooja.r@gmail.com', phone: '+91 98700 41182', city: 'Nagpur' },
  { name: 'Imran Shaikh', email: 'imran.shaikh@gmail.com', phone: '+91 99870 22314', city: 'Mumbai' },
  { name: 'Kavya Reddy', email: 'kavya.reddy@outlook.com', phone: '+91 97411 55093', city: 'Bengaluru' },
  { name: 'Harsh Vora', email: 'harsh.vora@gmail.com', phone: '+91 98250 77410', city: 'Ahmedabad' },
];

function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>;
}

function Switch({ on }) {
  return (
    <span
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? 'bg-brand-600' : 'bg-ink-900/15'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          on ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </span>
  );
}

export default function Memberships({ embedded = false }) {
  const {
    memberships,
    memberSignups,
    settings,
    create,
    update,
    remove,
    toast,
    receiveMemberSignup,
  } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [draftFeature, setDraftFeature] = useState({});
  const [draftGift, setDraftGift] = useState({});

  const dearest = Math.max(0, ...memberships.map((p) => Number(p.price) || 0));
  const variantOf = (plan) => {
    if (plan.popular) return 'highlight';
    if (memberships.length > 1 && Number(plan.price) === dearest) return 'premium';
    return 'plain';
  };

  const published = memberships.filter((p) => p.published);
  const activeMembers = memberSignups.filter((s) => s.status === 'Active').length;
  const membershipRevenue = memberSignups
    .filter((s) => s.status !== 'Cancelled')
    .reduce((sum, s) => {
      const plan = memberships.find((p) => p.id === s.planId);
      return sum + (plan ? membershipAmount(plan, s.members).total : 0);
    }, 0);

  const planFields = [
    { name: 'name', label: 'Plan name', type: 'text', required: true },
    { name: 'billing', label: 'Billing cycle', type: 'select', options: BILLING },
    { name: 'duration', label: 'Duration', type: 'text', placeholder: '12 months' },
    { name: 'price', label: 'Price per member (₹)', type: 'number', required: true },
    { name: 'persons', label: 'Persons covered', type: 'number' },
    { name: 'rooms', label: 'Rooms per free stay', type: 'number' },
    { name: 'privileges', label: 'Preferred services a member can choose', type: 'number' },
    {
      name: 'sharingPrice',
      label: 'Membership sharing (₹)',
      type: 'number',
      help: 'What it costs to share this plan with family. Nought and the website does not offer it.',
    },
    {
      name: 'sharingLabel',
      label: 'Line under the sharing price',
      type: 'text',
      full: true,
      placeholder: 'To share your member benefits',
    },
    { name: 'freeNights', label: 'Free stay nights', type: 'number' },
    { name: 'freeValidity', label: 'Free stay validity', type: 'text', placeholder: '12 months from joining' },
    {
      name: 'accent',
      label: 'Colour',
      type: 'colour',
      options: [...WEBSITE_COLOURS, ...ACCENT_KEYS],
      swatch: swatchFor,
      placeholder: 'gold, or #b8860b',
      help: 'A tier name — silver, gold, platinum, diamond, crown — or any colour code. The website builds the card’s gradient from it.',
    },
    {
      name: 'shortLabel',
      label: 'Short name on the website',
      type: 'text',
      placeholder: 'Gold',
      help: 'The one word on the tier button. The full name above heads the card.',
    },
    { name: 'tagline', label: 'Tagline shown on the website', type: 'text' },
    {
      name: 'blurb',
      label: 'Who the plan is for',
      type: 'text',
      full: true,
      placeholder: 'For families who travel a few times a year',
      help: 'The line under the plan name on the website.',
    },
  ];

  const savePlan = ({ freeNights, freeValidity, sharingPrice, sharingLabel, ...values }) => {
    const withStay = {
      ...values,
      sharing: { price: Number(sharingPrice || 0), label: sharingLabel || '' },
      freeStay: {
        nights: Number(freeNights || 0),
        rooms: Number(values.rooms || 0),
        validity: freeValidity || '12 months from joining',
      },
    };
    if (editing) {
      update('memberships', editing.id, withStay);
    } else {
      // Unless they picked one, the next plan takes the next colour along.
      const accent = withStay.accent || ACCENT_KEYS[memberships.length % ACCENT_KEYS.length];
      create('memberships', {
        ...withStay,
        features: [],
        gifts: [],
        published: false,
        popular: false,
        members: 0,
        accent,
        gradient: ACCENTS[accent].gradient,
      });
    }
  };

  const addFeature = (plan) => {
    const text = (draftFeature[plan.id] || '').trim();
    if (!text) return;
    if (plan.features.some((f) => f.toLowerCase() === text.toLowerCase())) {
      toast('That feature is already on this plan', 'info');
      return;
    }
    update('memberships', plan.id, { features: [...plan.features, text] }, {
      message: `Feature added to ${plan.name}`,
    });
    setDraftFeature((d) => ({ ...d, [plan.id]: '' }));
  };

  const addGift = (plan) => {
    const text = (draftGift[plan.id] || '').trim();
    if (!text) return;
    const gifts = plan.gifts || [];
    if (gifts.some((g) => g.toLowerCase() === text.toLowerCase())) {
      toast('That gift is already on this plan', 'info');
      return;
    }
    update('memberships', plan.id, { gifts: [...gifts, text] }, {
      message: `Gift added to ${plan.name}`,
    });
    setDraftGift((d) => ({ ...d, [plan.id]: '' }));
  };

  const removeGift = (plan, index) =>
    update(
      'memberships',
      plan.id,
      { gifts: (plan.gifts || []).filter((_, i) => i !== index) },
      { message: `Gift removed from ${plan.name}` }
    );

  const removeFeature = (plan, index) =>
    update(
      'memberships',
      plan.id,
      { features: plan.features.filter((_, i) => i !== index) },
      { message: `Feature removed from ${plan.name}` }
    );

  const togglePublished = (plan) =>
    update(
      'memberships',
      plan.id,
      { published: !plan.published },
      { message: plan.published ? `${plan.name} hidden from the website` : `${plan.name} is live on the website` }
    );

  const makePopular = (plan) => {
    memberships.forEach((p) =>
      update('memberships', p.id, { popular: p.id === plan.id }, { silent: true })
    );
    toast(`${plan.name} is now highlighted on the website`);
  };

  /** Fakes a customer picking a plan on the public site. */
  const simulateSignup = () => {
    if (!published.length) {
      toast('Publish at least one plan before the website can take signups', 'danger');
      return;
    }
    const visitor = VISITORS[Math.floor(Math.random() * VISITORS.length)];
    const plan = published[Math.floor(Math.random() * published.length)];
    receiveMemberSignup({
      ...visitor,
      planId: plan.id,
      plan: plan.name,
      members: 1 + Math.floor(Math.random() * 4),
      source: 'Website',
      received: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
  };

  const addPlan = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <>
      {embedded ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <p className="mr-auto text-sm text-ink-500">
            Plans published on your website — features here are what members get
          </p>
          <button className="btn-line" onClick={simulateSignup}>
            <Sparkles size={16} /> Simulate signup
          </button>
          <button className="btn-action" onClick={addPlan}>
            <Plus size={16} /> Add plan
          </button>
        </div>
      ) : (
        <PageHeader
          title="Memberships"
          subtitle="Plans published on your website — features here are what members get"
        >
          <button className="btn-line" onClick={simulateSignup}>
            <Sparkles size={16} /> Simulate signup
          </button>
          <button className="btn-action" onClick={addPlan}>
            <Plus size={16} /> Add plan
          </button>
        </PageHeader>
      )}

      <div className="mb-8">
        <KpiRow
          cols={4}
          items={[
            {
              label: 'Live on website',
              value: `${published.length} / ${memberships.length}`,
              icon: Globe,
              progress: memberships.length ? Math.round((published.length / memberships.length) * 100) : 0,
            },
            { label: 'Website signups', value: memberSignups.length, icon: UserPlus },
            { label: 'Active members', value: activeMembers, icon: ShieldCheck },
            { label: 'Membership value', value: shortInr(membershipRevenue), icon: IndianRupee, tone: 'text-brand-700' },
          ]}
        />
      </div>

      {/* Plans ------------------------------------------------------------ */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Plan catalogue</Eyebrow>
          <h2 className="mt-1 font-display text-[1.05rem] font-extrabold tracking-tight text-ink-900">
            Membership plans
          </h2>
        </div>
        <p className="text-sm text-ink-500">
          Features added here appear on the website pricing page instantly.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {memberships.map((plan) => {
          const variant = VARIANTS[variantOf(plan)];
          const isPremium = variantOf(plan) === 'premium';
          const edge = swatchFor(plan.accent);
          return (
            <article
              key={plan.id}
              className={`flex flex-col overflow-hidden transition ${variant.card}`}
              /* The plan's own colour, as the border — see VARIANTS above. */
              style={edge !== 'transparent' ? { borderColor: edge, borderWidth: 2 } : undefined}
            >
              {plan.popular && (
                <p className="flex items-center justify-center gap-1.5 bg-amber-400 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-900">
                  <Crown size={12} /> Most popular
                </p>
              )}

              {/* Skinned head — this is what makes each tier look its part */}
              <div className={variant.head}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${variant.tile}`}
                      style={
                        swatchFor(plan.accent) !== 'transparent'
                          ? { background: swatchFor(plan.accent), color: '#fff' }
                          : undefined
                      }
                    >
                      <Crown size={18} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <p className={`truncate font-display text-base font-extrabold ${variant.name}`}>
                        {plan.name}
                      </p>
                      <p className={`flex items-center gap-1.5 truncate text-xs ${variant.id}`}>
                        {plan.id}
                        {plan.accent && (
                          <>
                            <span aria-hidden>·</span>
                            <span className="num">{plan.accent}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  {isPremium && (
                    <span className={`chip shrink-0 ${variant.pill}`}>Top tier</span>
                  )}
                </div>

                <p className={`mt-3 line-clamp-2 text-sm leading-relaxed ${variant.tagline}`}>
                  {plan.tagline}
                </p>

                <div className="mt-4 flex items-end gap-2">
                  <span className={`font-display text-3xl font-extrabold leading-none ${variant.price}`}>
                    {inr(plan.price)}
                  </span>
                  <span className={`pb-0.5 text-xs font-semibold ${variant.note}`}>
                    per member · {String(plan.billing || '').toLowerCase()}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`chip ${variant.pill}`}>
                    <Gift size={11} /> {(plan.gifts || []).length} gifts
                  </span>
                  <span className={`chip ${variant.pill}`}>{plan.members} members</span>
                </div>

                {/* The line under the name on the website's own card. */}
                {plan.blurb && (
                  <p className={`mt-2 text-xs leading-snug ${variant.tagline}`}>{plan.blurb}</p>
                )}

                {/* The four tiles the website draws, word for word. */}
                <dl className="mt-3 grid grid-cols-2 gap-2">
                  {websiteStats(plan).map((stat) => (
                    <div key={stat.note} className="rounded-lg bg-surface-soft px-3 py-2">
                      <dt className="text-[13px] font-extrabold text-ink-900">{stat.figure}</dt>
                      <dd className="text-[11px] leading-snug text-ink-500">{stat.note}</dd>
                    </div>
                  ))}
                </dl>

                <p className={`mt-2 text-[11px] font-semibold ${variant.note}`}>
                  {plan.privileges ?? 1} preferred services
                  {plan.sharing?.price > 0
                    ? ` · sharing ${inr(plan.sharing.price)}`
                    : ' · not shared'}
                </p>
              </div>

              <div className="flex flex-1 flex-col border-t border-ink-900/[0.07] px-5 pb-5 pt-4">
                {/* Gifts the agency actually hands over to members */}
                <div className="mb-4 rounded-lg bg-brand-50 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-800">
                      <Gift size={13} /> Gifts for members
                    </p>
                    <span className="text-xs font-semibold text-brand-700/70">
                      {(plan.gifts || []).length}
                    </span>
                  </div>

                  <ul className="mt-2 space-y-1">
                    {(plan.gifts || []).map((g, i) => (
                      <li key={g} className="group flex items-start gap-2 rounded px-1 py-0.5">
                        <Gift size={12} className="mt-1 shrink-0 text-brand-600" />
                        <span className="flex-1 text-xs leading-snug text-brand-900">{g}</span>
                        <button
                          onClick={() => removeGift(plan, i)}
                          title="Remove gift"
                          className="shrink-0 text-brand-700/40 opacity-0 transition hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"
                        >
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                    {(plan.gifts || []).length === 0 && (
                      <li className="px-1 py-1 text-xs text-brand-800/70">
                        No gifts yet — add the first one below.
                      </li>
                    )}
                  </ul>

                  <div className="mt-2 flex gap-1.5">
                    <input
                      value={draftGift[plan.id] || ''}
                      onChange={(e) => setDraftGift((d) => ({ ...d, [plan.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addGift(plan)}
                      placeholder="Add a gift…"
                      className="input border-brand-600/20 bg-white py-1.5 text-xs"
                    />
                    <button
                      onClick={() => addGift(plan)}
                      className="btn-soft shrink-0 px-2.5 py-1.5"
                      title="Add gift"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/*
                    How long the gifts are on offer. The website counts
                    down to this; left empty it counts down to nothing
                    and simply lists them, which is the honest default.
                  */}
                  <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-brand-800">
                    <span className="shrink-0">Offer ends</span>
                    <input
                      type="date"
                      value={plan.giftsEndOn || ''}
                      onChange={(e) =>
                        update('memberships', plan.id, { giftsEndOn: e.target.value }, {
                          message: e.target.value
                            ? `Gifts on ${plan.name} run to ${e.target.value}`
                            : `Gifts on ${plan.name} have no end date`,
                        })
                      }
                      className="input border-brand-600/20 bg-white py-1 text-xs"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Eyebrow>Included in this plan</Eyebrow>
                  <span className="text-xs font-semibold text-ink-400">
                    {plan.features.length} features
                  </span>
                </div>

                <ul className="mt-2.5 space-y-1">
                  {plan.features.map((f, i) => (
                    <li
                      key={f}
                      className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-surface-soft"
                    >
                      <Check size={14} className="mt-0.5 shrink-0 text-brand-600" strokeWidth={3} />
                      <span className="flex-1 text-sm leading-snug text-ink-700">{f}</span>
                      <button
                        onClick={() => removeFeature(plan, i)}
                        title="Remove feature"
                        className="shrink-0 text-ink-300 opacity-0 transition hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                  {plan.features.length === 0 && (
                    <li className="rounded-lg border border-dashed border-ink-900/10 px-3 py-3 text-xs text-ink-500">
                      No features yet — add the first one below.
                    </li>
                  )}
                </ul>

                <div className="mt-3 flex gap-2">
                  <input
                    value={draftFeature[plan.id] || ''}
                    onChange={(e) => setDraftFeature((d) => ({ ...d, [plan.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addFeature(plan)}
                    /* The website draws a feature as a heading with a
                       sentence under it when it is written this way. */
                    placeholder="Free airport transfers — on every booking"
                    className="input py-2 text-sm"
                  />
                  <button onClick={() => addFeature(plan)} className="btn-soft shrink-0 px-3 py-2" title="Add feature">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-ink-900/[0.07] pt-4">
                  <button
                    onClick={() => togglePublished(plan)}
                    className="flex items-center gap-2 text-xs font-bold"
                    title={plan.published ? 'Hide from website' : 'Publish to website'}
                  >
                    <Switch on={plan.published} />
                    <span className={plan.published ? 'text-brand-700' : 'text-ink-500'}>
                      {plan.published ? (
                        <span className="inline-flex items-center gap-1">
                          <Globe size={12} /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <EyeOff size={12} /> Hidden
                        </span>
                      )}
                    </span>
                  </button>

                  <div className="flex gap-1.5">
                    {!plan.popular && (
                      <button
                        onClick={() => makePopular(plan)}
                        title="Highlight on website"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-amber-400 hover:text-amber-600"
                      >
                        <Crown size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditing(plan);
                        setFormOpen(true);
                      }}
                      title="Edit plan"
                      className="icon-btn"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirm({ id: plan.id, label: plan.name })}
                      title="Delete plan"
                      className="icon-btn-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={savePlan}
        title={editing ? `Edit ${editing.name}` : 'Add membership plan'}
        subtitle={editing ? editing.id : 'Features are added on the plan card after saving'}
        fields={planFields}
        initial={
          editing
            ? {
                ...editing,
                freeNights: editing.freeStay?.nights ?? 0,
                freeValidity: editing.freeStay?.validity || '',
                sharingPrice: editing.sharing?.price ?? 0,
                sharingLabel: editing.sharing?.label || '',
              }
            : { billing: 'Yearly', duration: '12 months', persons: 2, rooms: 1, privileges: 1, freeNights: 1, sharingPrice: 0 }
        }
        submitLabel={editing ? 'Save changes' : 'Create plan'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('memberships', confirm.id)}
        title="Delete this plan?"
        message={`“${confirm?.label}” will disappear from the website. Members already on it keep their quotations.`}
      />
    </>
  );
}
