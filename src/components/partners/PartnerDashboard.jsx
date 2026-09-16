import { useState } from 'react';
import { Check, X, Pencil, Headphones, ChevronRight } from 'lucide-react';
import Block from '../ui/Block.jsx';
import Stat from '../ui/Stat.jsx';
import Badge from '../ui/Badge.jsx';
import { inr } from '../../data/mockData.js';
import {
  partnerToday,
  partnerSections,
  partnerRequestCard,
  listingSteps,
  verificationFlow,
  bookingRoutes,
} from '../../data/partnerDashboard.js';

/**
 * The partner's own screen, shown inside the desk's panel.
 *
 * Two audiences, one screen. A hotelier ringing to say a booking has not
 * arrived describes what is in front of them, and whoever picks up needs to be
 * looking at the same thing rather than translating between two layouts. So
 * this is the partner's dashboard as specified, not a desk-shaped summary of
 * it — the same seven figures, the same twelve sections, the same request card
 * with Accept and Reject on it.
 *
 * The figures come from the partner record the desk already holds, so picking
 * a different partner above changes everything below.
 */

const icons = { Accept: Check, Reject: X, Edit: Pencil, 'Contact support': Headphones };

export default function PartnerDashboard({ partner, requests = [], onPick, list = [] }) {
  const [tab, setTab] = useState('Dashboard');

  /** Their numbers, from the record rather than invented. */
  const mine = requests.filter((r) => r.partner === partner?.name);
  const values = {
    bookings: partner?.bookings ?? 0,
    upcoming: mine.filter((r) => r.stage !== 'Completed').length,
    today: 0,
    rooms: partner?.rooms ?? 0,
    revenue: partner?.revenue ?? 0,
    pending: Math.max(0, (partner?.payable ?? 0) - (partner?.paid ?? 0)),
    cancellations: partner?.cancelled ?? 0,
  };

  if (!partner) {
    return (
      <Block title="Partner dashboard" note="Pick a partner to see their screen" wide>
        <p className="py-6 text-center text-sm text-ink-500">
          No partner selected. Choose one from the Partners list.
        </p>
      </Block>
    );
  }

  return (
    <>
      <Block
        title={`${partner.name} — their dashboard`}
        note="Exactly what the partner sees after approval"
        wide
        action={
          list.length > 1 && (
            <select
              className="input h-9 w-auto py-0 text-sm"
              value={partner.id}
              onChange={(e) => onPick?.(list.find((p) => p.id === e.target.value))}
            >
              {list.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )
        }
      >
        {/* -- Today's overview ------------------------------------------- */}
        <p className="eyebrow mb-2">Today&rsquo;s overview</p>
        <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {partnerToday.map((t) => (
            <Stat
              key={t.key}
              label={t.label}
              value={t.money ? inr(values[t.key]) : values[t.key]}
              hint={t.hint}
              tone={
                t.key === 'pending' && values.pending
                  ? 'text-amber-600'
                  : t.key === 'revenue'
                    ? 'text-brand-700'
                    : undefined
              }
            />
          ))}
        </div>

        {/* -- The request waiting on them -------------------------------- */}
        <div className="mt-6 rounded-xl border border-ink-900/[0.07] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-base font-extrabold text-ink-900">
              Booking #{partnerRequestCard.id}
            </p>
            <Badge tone="green" dot>
              {partnerRequestCard.status}
            </Badge>
          </div>

          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Property', partnerRequestCard.property],
              ['Guest', partnerRequestCard.guest],
              ['Check-in', partnerRequestCard.checkIn],
              ['Check-out', partnerRequestCard.checkOut],
              ['Room', partnerRequestCard.room],
              ['Guests', partnerRequestCard.guests],
              ['Meal plan', partnerRequestCard.mealPlan],
              ['Amount', inr(partnerRequestCard.amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="text-ink-500">{k}</dt>
                <dd className="font-semibold text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-900/[0.07] pt-4">
            {partnerRequestCard.actions.map((a, i) => {
              const Icon = icons[a];
              return (
                <span
                  key={a}
                  className={
                    i === 0
                      ? 'btn-action btn-sm pointer-events-none'
                      : 'btn-line btn-sm pointer-events-none'
                  }
                >
                  {Icon && <Icon size={13} />} {a}
                </span>
              );
            })}
            <span className="self-center text-xs text-ink-400">
              — the partner presses these, not the desk
            </span>
          </div>
        </div>

        {/* -- Where they can go ------------------------------------------ */}
        <p className="eyebrow mb-2 mt-6">Everything they can manage</p>
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {partnerSections.map((s) => (
            <li
              key={s.key}
              className="flex items-start gap-2.5 rounded-xl border border-ink-900/[0.07] px-3.5 py-2.5"
            >
              <ChevronRight size={15} className="mt-0.5 shrink-0 text-brand-500" />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink-900">{s.label}</span>
                <span className="block text-xs text-ink-500">{s.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </Block>

      {/* -- What they filled in to get here ------------------------------ */}
      <Block title="The listing form" note="The five steps every application walks" wide>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {listingSteps.map((s) => (
            <li key={s.step} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-700">
                  {s.step}
                </span>
                <span className="text-sm font-bold text-ink-900">{s.title}</span>
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {s.fields.map((f) => (
                  <li key={f} className="text-xs leading-relaxed text-ink-600">
                    {f}
                  </li>
                ))}
              </ul>
              {s.note && (
                <p className="mt-2.5 text-xs font-semibold text-amber-600">{s.note}</p>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
          {verificationFlow.map((v, i) => (
            <span key={v} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-ink-300">→</span>}
              <span className="rounded-lg bg-surface-soft px-2 py-1 font-semibold">{v}</span>
            </span>
          ))}
        </div>
      </Block>

      {/* -- How work reaches them ---------------------------------------- */}
      <Block title="How a booking reaches a partner" note="Three routes, one confirmed booking" wide>
        <div className="grid gap-3 lg:grid-cols-3">
          {bookingRoutes.map((r) => (
            <div key={r.key} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="text-sm font-bold text-ink-900">{r.title}</p>
              <ol className="mt-2.5 space-y-1.5">
                {r.steps.map((step, i) => (
                  <li key={step} className="flex gap-2 text-xs leading-relaxed text-ink-600">
                    <span className="num shrink-0 font-bold text-ink-400">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Block>
    </>
  );
}
