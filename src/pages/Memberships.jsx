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
  UserPlus,
  IndianRupee,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, membershipAmount } from '../data/mockData.js';

const BILLING = ['Yearly', 'Half-yearly', 'Monthly', 'Lifetime'];

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
  highlight: {
    card: 'card ring-2 ring-amber-400 shadow-raised xl:-mt-3 xl:mb-3',
    head: 'bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-500/25 px-5 pb-5 pt-5',
    tile: 'bg-amber-400 text-white',
    name: 'text-ink-900',
    id: 'text-amber-700',
    tagline: 'text-ink-600',
    price: 'text-ink-900',
    note: 'text-amber-800',
    pill: 'bg-amber-100 text-amber-800',
  },
  premium: {
    card: 'card',
    head: 'bg-gradient-to-br from-ink-900 via-ink-800 to-grape px-5 pb-5 pt-5',
    tile: 'bg-white/15 text-white',
    name: 'text-white',
    id: 'text-white/55',
    tagline: 'text-white/70',
    price: 'text-white',
    note: 'text-white/70',
    pill: 'bg-white/15 text-white',
  },
};

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

export default function Memberships() {
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
    { name: 'price', label: 'Price per member (₹)', type: 'number', required: true },
    { name: 'discount', label: 'Package discount (%)', type: 'number', help: 'Members get this off every package' },
    { name: 'rewardRate', label: 'Reward points per ₹100', type: 'number', help: '1 point = ₹1 off a future trip' },
    { name: 'welcomeBonus', label: 'Welcome bonus points', type: 'number', help: 'Credited the day they join' },
    { name: 'tagline', label: 'Tagline shown on the website', type: 'text', full: true },
  ];

  const savePlan = (values) => {
    if (editing) {
      update('memberships', editing.id, values);
    } else {
      const accent = ACCENT_KEYS[memberships.length % ACCENT_KEYS.length];
      create('memberships', {
        ...values,
        features: [],
        rewardRate: Number(values.rewardRate) || 1,
        welcomeBonus: Number(values.welcomeBonus) || 0,
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

  return (
    <>
      <PageHeader
        title="Memberships"
        subtitle="Plans published on your website — features here are what members get"
      >
        <button className="btn-ghost" onClick={simulateSignup}>
          <Sparkles size={16} /> Simulate signup
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Add plan
        </button>
      </PageHeader>

      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Globe} label="Live on website" value={`${published.length} / ${memberships.length}`} />
        <StatCard icon={UserPlus} label="Website signups" value={memberSignups.length} />
        <StatCard icon={ShieldCheck} label="Active members" value={activeMembers} />
        <StatCard icon={IndianRupee} label="Membership value" value={inr(membershipRevenue)} skin="brand" />
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
          return (
            <article
              key={plan.id}
              className={`flex flex-col overflow-hidden transition ${variant.card}`}
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
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${variant.tile}`}>
                      <Crown size={18} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <p className={`truncate font-display text-base font-extrabold ${variant.name}`}>
                        {plan.name}
                      </p>
                      <p className={`truncate text-xs ${variant.id}`}>{plan.id}</p>
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
                  <span className={`chip ${variant.pill}`}>{plan.discount}% off packages</span>
                  <span className={`chip ${variant.pill}`}>
                    <Gift size={11} /> {plan.rewardRate || 0} pts / ₹100
                  </span>
                  <span className={`chip ${variant.pill}`}>{plan.members} members</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col border-t border-ink-900/[0.07] px-5 pb-5 pt-4">
                {/* How the reward actually pays out, in the member's words */}
                <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-brand-50 px-3 py-2.5">
                  <Gift size={15} className="mt-0.5 shrink-0 text-brand-600" />
                  <p className="text-xs leading-relaxed text-brand-900">
                    Earns <b>{plan.rewardRate || 0} points</b> per ₹100 spent
                    {plan.welcomeBonus ? (
                      <>
                        {' '}
                        and <b>{Number(plan.welcomeBonus).toLocaleString('en-IN')} points</b> on
                        joining
                      </>
                    ) : null}
                    . 1 point = ₹1 off the next trip.
                  </p>
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
                    placeholder="Add a feature…"
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
        initial={editing || { billing: 'Yearly', discount: 5 }}
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
