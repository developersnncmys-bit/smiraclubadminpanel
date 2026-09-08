import { Send, MessageSquare } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Badge from '../ui/Badge.jsx';
import Stat from '../ui/Stat.jsx';
import { inr } from '../../data/mockData.js';
import { partnerPipeline, pipelineExits } from '../../data/partnersData.js';

/**
 * One booking as it sits with a partner.
 *
 * The sheet lists seventeen things a booking should show and the table can
 * carry about twelve before it stops being readable — so the row stays a
 * summary and the rest lives here: what the customer asked for, whether the
 * money is in, whether the partner has actually said yes, and every message
 * that has passed between the desk and them.
 *
 * The last of those matters most. "Sent to partner" three days ago means
 * something different depending on whether anybody chased it, and that is the
 * question the desk is really asking when they open a booking.
 */

const stageTone = (stage) => {
  if (stage === 'Completed' || stage === 'Confirmed') return 'green';
  if (pipelineExits.includes(stage)) return 'rose';
  return 'sky';
};

const paymentTone = (payment) => {
  const v = String(payment || '').toLowerCase();
  if (v.includes('full')) return 'green';
  if (v.includes('part') || v.includes('advance')) return 'amber';
  if (v.includes('refund')) return 'rose';
  return 'slate';
};

/** A labelled line, for the things that are just facts. */
function Line({ label, value, wide }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-800">{value || '—'}</p>
    </div>
  );
}

export default function BookingRequest({ request: r, open, onClose, onMessage }) {
  if (!r) return null;

  const reached = partnerPipeline.indexOf(r.stage);
  const ended = pipelineExits.includes(r.stage);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={`${r.booking} · ${r.partner}`}
      subtitle={`${r.customer} · sent ${r.sentAt}`}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-ink-500">
            {ended ? 'This booking left the pipeline.' : `Stage ${reached + 1} of ${partnerPipeline.length}`}
          </span>
          <button className="btn-line btn-sm" onClick={() => onMessage?.(r, 'Reminder')}>
            <Send size={13} /> Send a reminder
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* -- Where it has got to ---------------------------------------- */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Booking status</p>
          <ol className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            {partnerPipeline.map((s, i) => (
              <li key={s} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-ink-300">→</span>}
                <span
                  className={
                    i <= reached && !ended
                      ? 'rounded-lg bg-brand-50 px-2 py-1 font-bold text-brand-700'
                      : 'rounded-lg px-2 py-1 text-ink-400'
                  }
                >
                  {s}
                </span>
              </li>
            ))}
          </ol>
          {ended && (
            <p className="mt-2">
              <Badge tone="rose" dot>
                {r.stage}
              </Badge>
            </p>
          )}
        </div>

        {/* -- The money -------------------------------------------------- */}
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Booking amount" value={inr(r.amount)} tone="text-brand-700" />
          <Stat label="Smira commission" value={inr(r.commission)} tone="text-emerald-600" />
          <Stat label="Partner payout" value={inr(r.payout)} />
          <Stat label="Guests" value={`${r.guests} · ${r.rooms} rooms`} />
        </div>

        {/* -- Everything the sheet asks a booking to carry ---------------- */}
        <div className="rounded-xl border border-ink-900/[0.07] p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Line label="Booking ID" value={r.booking} />
            <Line label="Customer" value={r.customer} />
            <Line label="Membership ID" value={r.membership} />
            <Line label="Partner" value={r.partner} />
            <Line label="Property or service" value={r.service} wide />
            <Line label="Check-in" value={r.checkIn} />
            <Line label="Check-out" value={r.checkOut} />
            <Line label="Rooms" value={r.rooms} />
            <Line label="Customer request" value={r.request} wide />
            <Line label="Special occasion" value={r.occasion} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-900/[0.07] pt-4">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Payment</span>
            <Badge tone={paymentTone(r.payment)}>{r.payment || 'Not recorded'}</Badge>

            <span className="ml-3 text-xs font-bold uppercase tracking-wide text-ink-400">
              Partner confirmation
            </span>
            <Badge tone={String(r.partnerConfirmed || '').toLowerCase().startsWith('confirmed') ? 'green' : 'amber'}>
              {r.partnerConfirmed || 'Not confirmed'}
            </Badge>

            <span className="ml-3 text-xs font-bold uppercase tracking-wide text-ink-400">Stage</span>
            <Badge tone={stageTone(r.stage)} dot>
              {r.stage}
            </Badge>
          </div>
        </div>

        {/* -- What has actually been said -------------------------------- */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
            <MessageSquare size={13} /> Communication history
          </p>
          {(r.trail || []).length ? (
            <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
              {r.trail.map((t) => (
                <li key={`${t.at}-${t.text}`} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="num shrink-0 pt-0.5 text-xs text-ink-400">{t.at}</span>
                  <span className="text-sm text-ink-700">{t.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-500">
              Nothing has been sent about this booking yet.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
