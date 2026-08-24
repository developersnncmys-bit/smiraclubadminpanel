import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Crown,
  ChevronLeft,
  ChevronRight,
  Gift,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  CalendarClock,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { signupTone, activationStages, inr } from '../../data/mockData.js';
import { membershipStanding } from '../../lib/membership.js';

const digits = (phone) => String(phone || '').replace(/[^\d]/g, '');

/** Label over value. */
function Field({ label, children }) {
  return (
    <div className="border-b border-ink-900/[0.07] px-4 py-2.5">
      <p className="eyebrow">{label}</p>
      <div className="mt-1 text-sm text-ink-800">{children}</div>
    </div>
  );
}

function Stat({ label, value, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-lg font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

/**
 * The 360° member view from the client's sheet: who they are, the membership
 * itself, what the plan gives them, how much of it they have used, what they
 * have paid, and the trail of everything that has happened.
 */
export default function MemberProfile({ member, list, plan, bookings = [], onClose, onJump, actions }) {
  if (!member) return null;

  const m = member;
  const index = list.findIndex((x) => x.id === m.id);
  const standing = membershipStanding(m);
  const phone = digits(m.phone);
  const balance = Math.max(0, Number(m.amount || 0) - Number(m.paid || 0));
  const stageAt = activationStages.indexOf(m.activation?.stage);
  const theirTrips = bookings.filter((b) => b.customer === m.name);

  const used = (m.benefits || []).reduce((s, b) => s + Number(b.used || 0), 0);
  const allocated = (m.benefits || []).reduce((s, b) => s + Number(b.allocated || 0), 0);

  const quick = [
    { icon: Phone, tone: 'bg-sky-500', label: 'Call', run: () => { window.location.href = `tel:${phone}`; } },
    { icon: MessageCircle, tone: 'bg-emerald-500', label: 'WhatsApp', run: () => window.open(`https://wa.me/${phone}`, '_blank') },
    { icon: Mail, tone: 'bg-sky-500', label: 'Email', run: () => { window.location.href = `mailto:${m.email}`; } },
    { icon: CheckCircle2, tone: 'bg-brand-600', label: 'Activate membership', run: () => actions.note(`${m.name}'s membership activated`) },
    { icon: ArrowUpRight, tone: 'bg-violet-500', label: 'Upgrade plan', run: () => actions.note('Upgrade quote drafted') },
    { icon: CalendarClock, tone: 'bg-amber-500', label: 'Extend membership', run: () => actions.note('Membership extended by 12 months') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[1000px] flex-col bg-surface-base shadow-lift">
        <header className="flex items-center gap-3 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">Member profile</h2>
          <Badge tone={signupTone[m.status] || 'slate'} dot>
            {m.status}
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <span className="num text-sm font-semibold text-ink-500">
              {index + 1} / {list.length}
            </span>
            <button onClick={() => onJump(index - 1)} disabled={index <= 0} className="icon-btn h-8 w-8 disabled:opacity-40" title="Previous">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => onJump(index + 1)} disabled={index >= list.length - 1} className="icon-btn h-8 w-8 disabled:opacity-40" title="Next">
              <ChevronRight size={15} />
            </button>
            <button onClick={onClose} className="icon-btn h-8 w-8">
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Member information */}
          <section className="card h-fit overflow-hidden">
            <div className="px-4 pb-4 pt-5 text-center">
              <Avatar name={m.name} size="lg" className="mx-auto" />
              <p className="mt-3 font-display text-lg font-extrabold text-ink-900">{m.name}</p>
              <p className="num text-sm text-ink-500">{m.id}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Badge tone="teal">
                  <Crown size={11} /> {m.plan}
                </Badge>
                {standing && (
                  <Badge tone={standing.tone === 'rose' ? 'rose' : standing.tone === 'amber' ? 'amber' : 'green'}>
                    {standing.headline}
                  </Badge>
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quick.map((q) => (
                  <button
                    key={q.label}
                    onClick={q.run}
                    title={q.label}
                    className={`grid h-9 w-9 place-items-center rounded-full text-white transition hover:opacity-90 ${q.tone}`}
                  >
                    <q.icon size={15} />
                  </button>
                ))}
              </div>
            </div>

            <Field label="Mobile">
              <span className="num">{m.phone}</span>
            </Field>
            <Field label="Email">{m.email}</Field>
            <Field label="Address">{m.address || m.city || 'Not on record'}</Field>
            <Field label="Family members">{m.family ?? m.members}</Field>
            <Field label="Registered on">{m.received}</Field>
            <Field label="Branch">{m.branch || '—'}</Field>
            <Field label="Travel expert">{m.expert || 'Not assigned'}</Field>
            <Field label="Field officer">{m.fieldOfficer || '—'}</Field>
          </section>

          <div className="space-y-5">
            {/* The membership itself */}
            <section className="card p-5">
              <h3 className="font-display text-base font-extrabold text-ink-900">Membership</h3>
              <p className="mt-0.5 text-sm text-ink-500">{standing?.note || 'Not started yet'}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Stat label="Plan" value={m.plan} />
                <Stat label="Activated" value={m.startedOn || '—'} />
                <Stat label="Expires" value={m.expiresOn || '—'} />
                <Stat label="Members covered" value={m.members} />
              </div>
              {plan && (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Stat label="Duration" value={plan.duration || '12 months'} />
                  <Stat label="Rooms" value={plan.rooms ?? '—'} />
                  <Stat label="Free stay nights" value={plan.freeStay?.nights ?? 0} />
                  <Stat label="Discount" value={`${plan.discount}%`} />
                </div>
              )}
            </section>

            {/* Activation run */}
            <section className="card p-5">
              <h3 className="font-display text-base font-extrabold text-ink-900">Activation</h3>
              <p className="mt-0.5 text-sm text-ink-500">
                {m.activation?.date && m.activation.date !== '—'
                  ? `Activated on ${m.activation.date}`
                  : `Deadline ${m.activation?.deadline || '—'}`}
              </p>
              <ul className="mt-4 space-y-1.5">
                {activationStages.map((stage, i) => {
                  const done = stageAt >= i;
                  return (
                    <li key={stage} className="flex items-center gap-2.5 text-sm">
                      {done ? (
                        <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                      ) : (
                        <Circle size={15} className="shrink-0 text-ink-300" />
                      )}
                      <span className={done ? 'font-semibold text-ink-800' : 'text-ink-400'}>{stage}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Stat label="Contacted" value={m.activation?.contacted ? 'Yes' : 'No'} />
                <Stat label="Explained" value={m.activation?.explained ? 'Yes' : 'No'} />
                <Stat label="Documents" value={m.activation?.documents ? 'Verified' : 'Pending'} />
                <Stat label="Welcome gift" value={m.activation?.gift || '—'} />
              </div>
            </section>

            {/* Benefits and usage */}
            <section className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-extrabold text-ink-900">Benefits</h3>
                <p className="num text-sm text-ink-500">
                  {used} of {allocated} used · saved {inr(m.saving || 0)}
                </p>
              </div>
              <ul className="mt-4 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                {(m.benefits || []).map((b) => (
                  <li key={b.name} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                        <Gift size={13} className="shrink-0 text-brand-600" /> {b.name}
                      </span>
                      <span className="num text-sm text-ink-700">
                        {b.used} used · {Math.max(0, b.allocated - b.used)} left
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${b.allocated ? Math.round((b.used / b.allocated) * 100) : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
                {(m.benefits || []).length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-ink-500">No benefits allocated yet.</li>
                )}
              </ul>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Stat label="Upcoming bookings" value={theirTrips.filter((b) => b.status !== 'Cancelled').length} />
                <Stat label="Cancelled bookings" value={theirTrips.filter((b) => b.status === 'Cancelled').length} />
                <Stat label="Saving so far" value={inr(m.saving || 0)} tone="text-brand-700" />
              </div>
            </section>

            {/* Money */}
            <section className="card p-5">
              <h3 className="font-display text-base font-extrabold text-ink-900">Payment</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Stat label="Membership amount" value={inr(m.amount || 0)} />
                <Stat label="Paid" value={inr(m.paid || 0)} tone="text-emerald-600" />
                <Stat
                  label="Pending"
                  value={balance ? inr(balance) : 'Nothing due'}
                  tone={balance ? 'text-rose-600' : 'text-ink-900'}
                />
              </div>
              {m.quote && (
                <p className="mt-3 text-sm text-ink-600">
                  Quotation <b className="text-ink-900">{m.quote}</b> was raised for this membership.
                </p>
              )}
              <button className="btn-ghost mt-4" onClick={() => actions.recordPayment()}>
                Record a payment
              </button>
            </section>

            {/* The trail */}
            <section className="card p-5">
              <h3 className="font-display text-base font-extrabold text-ink-900">Everything that has happened</h3>
              <ol className="mt-4 space-y-3 border-l border-ink-900/[0.07] pl-4">
                {(m.timeline || []).map((t) => (
                  <li key={`${t.step}-${t.at}`} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                    <p className="text-sm font-bold text-ink-900">{t.step}</p>
                    <p className="text-xs text-ink-500">
                      {t.at} · {t.note}
                    </p>
                  </li>
                ))}
                {(m.timeline || []).length === 0 && (
                  <li className="text-sm text-ink-500">Nothing recorded yet.</li>
                )}
              </ol>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
