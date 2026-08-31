import { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Paperclip,
  ArrowUpRight,
  UserCheck,
  Star,
  AlertTriangle,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { stageTone, ticketStages, priorities, escalationLevels } from '../../data/supportData.js';
import { inr } from '../../data/mockData.js';
import Stat from '../ui/Stat.jsx';
import Field from '../ui/Field.jsx';

const digits = (phone) => String(phone || '').replace(/[^\d]/g, '');
const slaTone = { Within: 'green', Approaching: 'amber', Breached: 'rose' };

/**
 * One ticket, end to end: who is complaining and what they are worth, what
 * the complaint is, everything that has been said, and the resolution the
 * desk has to write before it can close.
 */
export default function TicketDetails({ ticket, list, customer, bookings = [], onClose, onJump, onUpdate, actions }) {
  const [note, setNote] = useState('');
  const [resolution, setResolution] = useState(ticket?.resolution?.note || '');

  if (!ticket) return null;

  const t = ticket;
  const index = list.findIndex((x) => x.id === t.id);
  const phone = digits(t.phone);
  const priority = priorities.find((p) => p.key === t.priority);
  const theirBookings = bookings.filter((b) => b.customer === t.customer);
  const spend = theirBookings.reduce((s, b) => s + Number(b.amount || 0), 0);

  const addNote = () => {
    if (!note.trim()) return;
    onUpdate(t.id, {
      timeline: [...(t.timeline || []), { at: 'just now', who: 'You', channel: 'Internal note', text: note.trim() }],
    });
    setNote('');
    actions.note('Internal note added');
  };

  const resolve = () => {
    if (!resolution.trim()) {
      actions.note('Write what was done before resolving this', 'danger');
      return;
    }
    onUpdate(t.id, {
      stage: 'Resolved',
      resolution: { ...(t.resolution || {}), note: resolution.trim(), contacted: true, confirmed: false },
      timeline: [...(t.timeline || []), { at: 'just now', who: 'You', channel: 'Resolution', text: resolution.trim() }],
    });
    actions.note(`${t.id} marked resolved — waiting on the customer to confirm`);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[1020px] flex-col bg-surface-base shadow-lift">
        <header className="flex flex-wrap items-center gap-2.5 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="num font-display text-lg font-extrabold text-ink-900">{t.id}</h2>
          <Badge tone={stageTone[t.stage]} dot>
            {t.stage}
          </Badge>
          <Badge tone={priority?.tone || 'slate'}>{t.priority}</Badge>
          <Badge tone={slaTone[t.slaState] || 'slate'}>SLA {t.slaState.toLowerCase()}</Badge>
          <div className="ml-auto flex items-center gap-2">
            <span className="num text-sm font-semibold text-ink-500">
              {index + 1} / {list.length}
            </span>
            <button onClick={() => onJump(index - 1)} disabled={index <= 0} className="icon-btn h-8 w-8 disabled:opacity-40">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => onJump(index + 1)} disabled={index >= list.length - 1} className="icon-btn h-8 w-8 disabled:opacity-40">
              <ChevronRight size={15} />
            </button>
            <button onClick={onClose} className="icon-btn h-8 w-8">
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          {/* Who is complaining */}
          <section className="card h-fit overflow-hidden">
            <div className="px-4 pb-4 pt-5 text-center">
              <Avatar name={t.customer} size="lg" className="mx-auto" />
              <p className="mt-3 font-display text-lg font-extrabold text-ink-900">{t.customer}</p>
              <p className="num text-sm text-ink-500">{t.phone}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {t.membership && (
                  <Badge tone="teal">
                    <Crown size={11} /> {t.membership}
                  </Badge>
                )}
                {t.previousComplaints > 0 && (
                  <Badge tone="amber">{t.previousComplaints} earlier complaints</Badge>
                )}
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <a href={`tel:${phone}`} className="icon-btn h-9 w-9 disabled:opacity-40" title="Call">
                  <Phone size={15} />
                </a>
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn h-9 w-9 hover:border-emerald-400 hover:text-emerald-600"
                  title="WhatsApp"
                >
                  <MessageCircle size={15} />
                </a>
                <button
                  onClick={() => actions.escalate(t)}
                  className="icon-btn-danger h-9 w-9"
                  title="Escalate"
                >
                  <ArrowUpRight size={15} />
                </button>
                <button
                  onClick={() => actions.assign(t)}
                  className="icon-btn h-9 w-9 disabled:opacity-40"
                  title="Reassign"
                >
                  <UserCheck size={15} />
                </button>
              </div>
            </div>

            <Field label="Membership expiry">{t.membershipExpiry || '—'}</Field>
            <Field label="Total bookings">{theirBookings.length}</Field>
            <Field label="Total spend">{inr(spend)}</Field>
            <Field label="Relationship manager">{customer?.expert || t.executive}</Field>
            <Field label="Assigned executive">{t.executive}</Field>
            <Field label="Department">{t.department}</Field>
            <Field label="Escalation">{escalationLevels[(t.escalation || 1) - 1]}</Field>
          </section>

          <div className="space-y-5">
            {/* The complaint */}
            <section className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-extrabold text-ink-900">
                    {t.category} · {t.subCategory}
                  </h3>
                  <p className="mt-0.5 text-sm text-ink-500">
                    Raised {t.created} · last updated {t.updated}
                  </p>
                </div>
                <Badge tone={slaTone[t.slaState] || 'slate'} dot>
                  Due {t.slaDeadline}
                </Badge>
              </div>

              <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">{t.description}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Stat label="Booking" value={t.booking} />
                <Stat label="Hotel or partner" value={t.hotel} />
                <Stat label="First response" value={t.firstResponseMins ? `${t.firstResponseMins} min` : '—'} />
                <Stat
                  label="Resolution time"
                  value={t.resolutionMins ? `${Math.round(t.resolutionMins / 60)} hrs` : 'Open'}
                  tone={t.resolutionMins ? 'text-emerald-600' : 'text-amber-600'}
                />
              </div>

              {t.attachments?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {t.attachments.map((a) => (
                    <span key={a} className="chip text-ink-600">
                      <Paperclip size={12} /> {a}
                    </span>
                  ))}
                </div>
              )}

              {t.slaState === 'Breached' && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  The SLA has been breached, so this was escalated automatically.
                </p>
              )}

              {/* Where the ticket sits */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {ticketStages.map((stage, i) => {
                  const at = ticketStages.indexOf(t.stage);
                  return (
                    <span key={stage} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-ink-300">→</span>}
                      <button
                        onClick={() => onUpdate(t.id, { stage })}
                        className={`chip ${i <= at ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-500'}`}
                      >
                        {stage}
                      </button>
                    </span>
                  );
                })}
              </div>
            </section>

            {/* Everything that has been said */}
            <section className="card p-5">
              <h3 className="font-display text-base font-extrabold text-ink-900">Conversation</h3>
              <p className="mt-0.5 text-sm text-ink-500">Calls, WhatsApp, emails, internal notes and partner replies</p>
              <ol className="mt-4 space-y-3 border-l border-ink-900/[0.07] pl-4">
                {(t.timeline || []).map((e, i) => (
                  <li key={`${e.at}-${i}`} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                    <p className="text-sm text-ink-800">{e.text}</p>
                    <p className="text-xs text-ink-500">
                      {e.who} · {e.channel} · {e.at}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex gap-2">
                <input
                  className="input"
                  placeholder="Add an internal note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                />
                <button className="btn-primary shrink-0" onClick={addNote}>
                  Add
                </button>
              </div>
            </section>

            {/* Resolution */}
            <section className="card p-5">
              <h3 className="font-display text-base font-extrabold text-ink-900">Resolution</h3>
              <p className="mt-0.5 text-sm text-ink-500">
                A ticket cannot be closed without saying what was done.
              </p>

              <textarea
                className="input mt-4 min-h-[90px] resize-y"
                placeholder="What was done, and what the customer was told…"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />

              {t.resolution && (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Stat label="Action taken" value={t.resolution.action || '—'} />
                  <Stat label="Refund" value={t.resolution.refund ? inr(t.resolution.refund) : 'None'} />
                  <Stat label="Compensation" value={t.resolution.compensation ? inr(t.resolution.compensation) : 'None'} />
                  <Stat label="Partner response" value={t.resolution.partner || '—'} />
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary" onClick={resolve}>
                  Mark resolved
                </button>
                <button
                  className="btn-ghost"
                  disabled={t.stage !== 'Resolved' && t.stage !== 'Customer confirmed'}
                  onClick={() =>
                    onUpdate(t.id, {
                      stage: 'Customer confirmed',
                      resolution: { ...(t.resolution || {}), confirmed: true },
                    })
                  }
                >
                  Customer confirmed
                </button>
                <button
                  className="btn-ghost disabled:opacity-40"
                  disabled={!t.resolution?.note || t.stage === 'Closed'}
                  onClick={() => onUpdate(t.id, { stage: 'Closed' })}
                  title={t.resolution?.note ? 'Close the ticket' : 'Write the resolution first'}
                >
                  Close ticket
                </button>
              </div>
            </section>

            {/* How it felt to the customer */}
            <section className="card p-5">
              <h3 className="font-display text-base font-extrabold text-ink-900">How was your support experience?</h3>
              <p className="mt-0.5 text-sm text-ink-500">Asked automatically once the ticket is resolved</p>
              <div className="mt-3 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => onUpdate(t.id, { rating: n })} title={`${n} star`}>
                    <Star
                      size={22}
                      className={n <= (t.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-ink-300'}
                    />
                  </button>
                ))}
                <span className="num ml-2 text-sm font-bold text-ink-700">
                  {t.rating ? `${t.rating} of 5` : 'Not rated yet'}
                </span>
              </div>
              {t.rating != null && t.rating <= 2 && (
                <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  A one or two star rating creates a follow-up task for the manager automatically.
                </p>
              )}
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
