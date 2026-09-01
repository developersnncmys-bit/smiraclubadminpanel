import {
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Mail,
  Pencil,
  Receipt,
  Crown,
  CalendarDays,
  MapPin,
  Users,
  Gift,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { bookingStatusTone, signupTone, inr } from '../../data/mockData.js';
import { findMembership, membershipStanding } from '../../lib/membership.js';
import Stat from '../ui/Stat.jsx';
import Field from '../ui/Field.jsx';
import RecordTrail from '../ui/RecordTrail.jsx';

const digits = (value) => String(value || '').replace(/[^\d]/g, '');

const barTone = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  sky: 'bg-sky-500',
  slate: 'bg-ink-900/25',
};

/**
 * One trip, in full: who is travelling, what they booked, what has been paid
 * and — the part the desk keeps asking for — whether this customer holds a
 * membership and how long it still has to run.
 */
const confirmTone = {
  'Waiting for hotel': 'amber',
  'Sent to hotel': 'sky',
  'Hotel confirmed': 'green',
  'Hotel rejected': 'rose',
  'Alternative required': 'violet',
};

export default function BookingDetails({
  booking,
  list,
  customer,
  signups,
  plans,
  onClose,
  onJump,
  onEdit,
  onInvoice,
}) {
  if (!booking) return null;

  const b = booking;
  const index = list.findIndex((x) => x.id === b.id);
  const balance = Number(b.amount || 0) - Number(b.paid || 0);
  const paidPct = b.amount ? Math.round((b.paid / b.amount) * 100) : 0;

  const membership = findMembership({ ...(customer || {}), name: b.customer }, signups, plans);

  // How far along the booking is, for the flow line.
  const flowAt = {
    'Waiting for hotel': 1,
    'Sent to hotel': 2,
    'Hotel confirmed': 3,
    'Hotel rejected': 2,
    'Alternative required': 2,
  }[b.confirmation?.status] ?? 1;

  // Travellers who booked over the phone have no customer record yet; their
  // signup still carries a number worth calling.
  const person = customer ||
    (membership
      ? {
          name: b.customer,
          phone: membership.signup.phone,
          email: membership.signup.email,
          city: membership.signup.city,
        }
      : { name: b.customer });
  const phone = digits(person.phone);
  const standing = membershipStanding(membership?.signup);
  const plan = membership?.plan;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[980px] flex-col bg-surface-base shadow-lift">
        <header className="flex items-center gap-3 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">Booking {b.id}</h2>
          <Badge tone={bookingStatusTone[b.status]} dot>
            {b.status}
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <span className="num text-sm font-semibold text-ink-500">
              {index + 1} / {list.length}
            </span>
            <button
              onClick={() => onJump(index - 1)}
              disabled={index <= 0}
              className="icon-btn h-8 w-8 disabled:opacity-40"
              title="Previous"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => onJump(index + 1)}
              disabled={index >= list.length - 1}
              className="icon-btn h-8 w-8 disabled:opacity-40"
              title="Next"
            >
              <ChevronRight size={15} />
            </button>
            <button onClick={onClose} className="icon-btn h-8 w-8">
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Who is travelling */}
          <section className="card h-fit overflow-hidden">
            <div className="px-4 pb-4 pt-5 text-center">
              <Avatar name={person.name} size="lg" className="mx-auto" />
              <p className="mt-3 font-display text-lg font-extrabold text-ink-900">{person.name}</p>
              <p className="text-sm text-ink-500">
                {person.city ? `${person.city} · ` : ''}
                {b.pax} travelling
              </p>

              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => { window.location.href = `tel:${phone}`; }}
                  disabled={!phone}
                  title="Call"
                  className="icon-btn h-9 w-9 disabled:opacity-40"
                >
                  <Phone size={15} />
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/${phone}`, '_blank')}
                  disabled={!phone}
                  title="WhatsApp"
                  className="icon-btn h-9 w-9 hover:border-emerald-400 hover:text-emerald-600"
                >
                  <MessageCircle size={15} />
                </button>
                <button
                  onClick={() => { window.location.href = `mailto:${person.email}`; }}
                  disabled={!person.email}
                  title="Email"
                  className="icon-btn h-9 w-9 disabled:opacity-40"
                >
                  <Mail size={15} />
                </button>
                <button
                  onClick={() => onEdit(b)}
                  title="Edit booking"
                  className="icon-btn h-9 w-9 disabled:opacity-40"
                >
                  <Pencil size={15} />
                </button>
              </div>
            </div>

            <Field label="Phone">
              <span className="num">{person.phone || 'Not on record'}</span>
            </Field>
            <Field label="Email">{person.email || 'Not on record'}</Field>
            {person.city && <Field label="City">{person.city}</Field>}
            <Field label="Handled by">{b.owner}</Field>
          </section>

          <div className="space-y-5">
            {/* The membership question, answered first */}
            <section className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-ink-900/[0.07] px-5 py-3.5">
                <Crown size={16} className="text-brand-600" />
                <h3 className="font-display text-base font-extrabold text-ink-900">Membership</h3>
                {membership && (
                  <Badge tone={signupTone[membership.signup.status] || 'slate'} dot>
                    {membership.signup.status}
                  </Badge>
                )}
              </div>

              {!membership ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm font-semibold text-ink-700">Not a member</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
                    {person.name} has no membership on the website. A plan would take{' '}
                    {plan ? plan.discount : 5}–15% off trips like this one.
                  </p>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-lg font-extrabold text-ink-900">
                      {membership.signup.plan}
                    </p>
                    <p className={`num text-sm font-bold ${
                      standing.tone === 'rose'
                        ? 'text-rose-600'
                        : standing.tone === 'amber'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                    }`}
                    >
                      {standing.headline}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-500">{standing.note}</p>

                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-soft">
                    <div
                      className={`h-full rounded-full ${barTone[standing.tone] || barTone.slate}`}
                      style={{ width: `${standing.pct}%` }}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Stat label="Started on" value={membership.signup.startedOn || '—'} />
                    <Stat label="Expires on" value={membership.signup.expiresOn || '—'} />
                    <Stat label="Members covered" value={membership.signup.members} />
                  </div>

                  {plan && (
                    <>
                      <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
                        {plan.discount}% member discount applies to this trip — about{' '}
                        {inr(Math.round((Number(b.amount || 0) * plan.discount) / 100))} off.
                      </p>

                      {plan.gifts?.length > 0 && (
                        <div className="mt-4">
                          <p className="eyebrow">Gifts on this plan</p>
                          <ul className="mt-2 space-y-1.5">
                            {plan.gifts.map((g) => (
                              <li key={g} className="flex items-start gap-2 text-sm text-ink-700">
                                <Gift size={14} className="mt-0.5 shrink-0 text-brand-600" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>

            {/* What was booked */}
            <section className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-extrabold text-ink-900">Travel details</h3>
                <Badge tone="slate">{b.bookingType || 'Package'}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-ink-500">
                {b.hotel || b.pkg} · {b.destination}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Stat label="Check-in" value={b.checkIn || b.departure} />
                <Stat label="Check-out" value={b.checkOut || '—'} />
                <Stat label="Nights" value={b.nights} />
                <Stat label="Rooms" value={`${b.rooms || 1} · ${b.roomType || 'Standard'}`} />
                <Stat
                  label="Guests"
                  value={`${b.adults ?? b.pax} adults${b.children ? `, ${b.children} children` : ''}${
                    b.infants ? `, ${b.infants} infants` : ''
                  }`}
                />
                <Stat label="Meal plan" value={b.mealPlan || 'Room only'} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
                  <span className="eyebrow block">Occasion</span>
                  {b.occasion || 'Not recorded'}
                  {b.specialNote && <span className="mt-1 block text-xs text-ink-500">{b.specialNote}</span>}
                </p>
                <p className="rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
                  <span className="eyebrow block">Special requests</span>
                  {b.specialRequests || 'None'}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-600">
                <span>Booked {b.created || '—'}</span>
                <span>·</span>
                <span>Source {b.source || '—'}</span>
                <span>·</span>
                <span>Handled by {b.owner}{b.assignedRole ? ` (${b.assignedRole})` : ''}</span>
                {b.freeStay && <Badge tone="green">Free stay · {b.freeNights || 1} nights</Badge>}
              </div>
            </section>

            {/* Where it sits with the hotel */}
            <section className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-extrabold text-ink-900">Hotel confirmation</h3>
                <Badge tone={confirmTone[b.confirmation?.status] || 'slate'} dot>
                  {b.confirmation?.status || 'Not sent'}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Stat label="Vendor" value={b.vendor || '—'} />
                <Stat label="Sent on" value={b.confirmation?.sent || '—'} />
                <Stat label="Deadline" value={b.confirmation?.deadline || '—'} />
              </div>
              <p className="mt-3 text-sm text-ink-600">
                {b.vendorContact?.person} · {b.vendorContact?.phone} · {b.vendorContact?.ratePlan}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                <span className="font-semibold text-ink-700">Booking flow</span>
                {['Enquiry', 'Booking request', 'Sent to hotel', 'Hotel confirmed', 'Voucher sent', 'Travelled'].map(
                  (step, i) => (
                    <span key={step} className="flex items-center gap-2">
                      {i > 0 && <span className="text-ink-300">→</span>}
                      <span
                        className={
                          i <= flowAt
                            ? 'font-bold text-brand-700'
                            : 'text-ink-400'
                        }
                      >
                        {step}
                      </span>
                    </span>
                  )
                )}
              </div>
              <p className="mt-2 text-xs text-ink-400">
                A booking can also end as cancelled, rescheduled or a no-show.
              </p>
            </section>
            {/* The money */}
            <section className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-extrabold text-ink-900">Payment</h3>
                <button className="btn-line btn-sm" onClick={() => onInvoice(b)}>
                  <Receipt size={14} /> Raise invoice
                </button>
              </div>

              <ul className="mt-4 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                {[
                  ['Base tariff', b.charges?.base],
                  ['Membership discount', b.charges?.membershipDiscount ? -b.charges.membershipDiscount : 0],
                  ['Offer discount', b.charges?.offerDiscount ? -b.charges.offerDiscount : 0],
                  ['Meal charges', b.charges?.meals],
                  ['Taxes', b.charges?.taxes],
                  ['Extra charges', b.charges?.extra],
                ].map(([label, amount]) => (
                  <li key={label} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="text-ink-600">{label}</span>
                    <span className={`num font-bold ${Number(amount) < 0 ? 'text-emerald-600' : 'text-ink-900'}`}>
                      {amount ? inr(amount) : '—'}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 bg-surface-soft px-4 py-3 text-sm">
                  <span className="font-bold text-ink-900">Total</span>
                  <span className="num font-extrabold text-ink-900">{inr(b.amount)}</span>
                </li>
              </ul>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Stat label="Trip value" value={inr(b.amount)} />
                <Stat label="Received" value={inr(b.paid)} tone="text-emerald-600" />
                <Stat
                  label="Balance"
                  value={balance > 0 ? inr(balance) : 'Nothing due'}
                  tone={balance > 0 ? 'text-rose-600' : 'text-ink-900'}
                />
              </div>

              <div className="mt-4">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  Collected so far
                  <span className="num text-ink-900">{paidPct}%</span>
                </p>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full ${paidPct >= 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(paidPct, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Stat label="Paid by" value={b.payment?.method || '—'} />
                <Stat label="Transaction" value={b.payment?.txnId || '—'} />
                <Stat label="Invoice" value={b.payment?.invoice || '—'} />
              </div>
            </section>

            {/* Papers on file */}
            <section className="card p-5">
              <h3 className="font-display text-base font-extrabold text-ink-900">Documents</h3>
              <p className="mt-0.5 text-sm text-ink-500">What is on file for this booking</p>
              <ul className="mt-4 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                {(b.documents || []).map((d) => (
                  <li key={d.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="flex items-center gap-2.5 text-sm text-ink-700">
                      <FileText size={14} className="shrink-0 text-ink-400" /> {d.name}
                    </span>
                    <Badge tone={d.status === 'Uploaded' ? 'green' : d.status === 'Pending' ? 'amber' : 'slate'}>
                      {d.status}
                    </Badge>
                  </li>
                ))}
                {(b.documents || []).length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-ink-500">Nothing uploaded yet.</li>
                )}
              </ul>
            </section>
          </div>
          {/* Everything that has happened on this booking */}
          <div className="lg:col-span-2">
            <RecordTrail
              id={b.id}
              name={b.customer}
              tasks={[]}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
