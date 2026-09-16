import { useState } from 'react';
import {
  ShieldCheck, XCircle, MessageSquareWarning, Rocket, ChevronDown, ChevronUp, Loader2, ExternalLink,
} from 'lucide-react';
import Block from '../ui/Block.jsx';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useApp } from '../../store/AppStore.jsx';
import { api, isLive } from '../../lib/api.js';
import { inr } from '../../data/mockData.js';

/**
 * The desk's half of the client's partner flow.
 *
 *   SUBMIT → ADMIN REVIEW → APPROVED → CONTRACT → LIVE
 *                        ↘ NEED CHANGES → partner edits → ADMIN REVIEW
 *
 * Each decision goes to the endpoint that owns it rather than through a
 * generic update: the server checks the stage is right before it moves, so
 * nobody can put a partner live who was never approved.
 */

const STAGES = [
  { key: 'Registration', label: 'Filling the form', note: 'With the partner' },
  { key: 'Admin review', label: 'Admin review', note: 'Waiting on the desk' },
  { key: 'Needs changes', label: 'Needs changes', note: 'Sent back to the partner' },
  { key: 'Contract', label: 'Contract', note: 'Approved, to be signed' },
  { key: 'Live', label: 'Live', note: 'Taking bookings' },
];

/** Partners made before the flow have no stage; active ones are live. */
const stageOf = (p) => {
  if (['Registration', 'Admin review', 'Needs changes', 'Contract', 'Rejected'].includes(p.stage)) return p.stage;
  if (p.status === 'Active') return 'Live';
  return 'Registration';
};

const idOf = (p) => p._id || p.id;

function Row({ label, value }) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink-900/[0.05] py-1.5 text-sm">
      <dt className="shrink-0 text-ink-500">{label}</dt>
      <dd className="text-right font-semibold text-ink-900">{Array.isArray(value) ? value.join(', ') : value}</dd>
    </div>
  );
}

/**
 * Links a partner typed, shown to the desk. Only a real web address becomes
 * clickable: React 18 still renders a `javascript:` href, so a partner could
 * otherwise plant one that runs in a staff member's session when clicked.
 */
const isWebLink = (u) => /^https?:\/\//i.test(String(u || '').trim());

function Links({ label, urls = [] }) {
  const list = (urls || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="py-1.5 text-sm">
      <p className="text-ink-500">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {list.map((u) => (
          <li key={u}>
            {isWebLink(u) ? (
              <a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all font-semibold text-brand-700 hover:underline">
                {u} <ExternalLink size={11} className="shrink-0" />
              </a>
            ) : (
              <span className="break-all text-ink-500">{u} (not a web link)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Everything the partner submitted, in the five steps they filled it in. */
export function ListingDetails({ listing = {} }) {
  const l = listing || {};
  const a = l.account || {};
  const pr = l.property || {};
  const lo = l.location || {};
  const pc = l.pricing || {};
  const inv = l.inventory || {};
  const po = l.policies || {};
  const ow = l.ownership || {};
  const dl = ow.documentLinks || {};
  const b = l.bank || {};

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section>
        <p className="eyebrow mb-1">Step 1 · Account and property</p>
        <dl>
          <Row label="Full name" value={a.fullName} />
          <Row label="Email" value={a.email} />
          <Row label="Alternate number" value={a.alternatePhone} />
          <Row label="Account type" value={a.accountType} />
          <Row label="Property type" value={pr.type} />
          <Row label="Property name" value={pr.name} />
          <Row label="Star category" value={pr.starCategory} />
          <Row label="Contact" value={[pr.contactName, pr.contactPhone, pr.contactEmail].filter(Boolean).join(' · ')} />
          <Row label="Booking start" value={pr.bookingStartDate} />
          <Row
            label="Address"
            value={[lo.line1, lo.line2, lo.landmark, lo.city, lo.state, lo.pin, lo.country].filter(Boolean).join(', ')}
          />
          <Row label="Coordinates" value={lo.latitude && lo.longitude ? `${lo.latitude}, ${lo.longitude}` : ''} />
        </dl>
        <Links label="Google Maps" urls={[lo.mapsUrl]} />
        {pr.description && <p className="mt-2 rounded-lg bg-surface-soft p-2.5 text-xs text-ink-600">{pr.description}</p>}
      </section>

      <section>
        <p className="eyebrow mb-1">Step 2 · Rooms</p>
        {(l.rooms || []).length ? (
          <ul className="space-y-2">
            {l.rooms.map((r, i) => (
              <li key={`${r.name}-${i}`} className="rounded-lg border border-ink-900/[0.07] p-2.5 text-sm">
                <p className="font-bold text-ink-900">
                  {r.name} <span className="font-semibold text-ink-500">· {r.count || 0} rooms</span>
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {[r.type, r.size, r.bedType, r.adults && `${r.adults} adults`, r.children && `${r.children} children`,
                    r.maxOccupancy && `max ${r.maxOccupancy}`, r.extraBed && 'extra bed'].filter(Boolean).join(' · ')}
                </p>
                {r.amenities && <p className="mt-0.5 text-xs text-ink-500">{r.amenities}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-400">No rooms added.</p>
        )}
        <Links label="Property photos" urls={l.photos?.property} />
        <Links label="Room photos" urls={l.photos?.rooms} />
      </section>

      <section>
        <p className="eyebrow mb-1">Step 3 · Amenities</p>
        <dl>
          <Row label="Popular" value={l.amenities} />
          <Row label="Facilities" value={l.facilities} />
          <Row label="Rules" value={l.rules} />
        </dl>
      </section>

      <section>
        <p className="eyebrow mb-1">Step 4 · Pricing and inventory</p>
        <dl>
          <Row label="Standard tariff" value={pc.standardTariff ? inr(pc.standardTariff) : ''} />
          <Row label="Smira partner rate" value={pc.partnerRate ? inr(pc.partnerRate) : ''} />
          <Row label="Weekday / weekend" value={pc.weekdayRate || pc.weekendRate ? `${inr(pc.weekdayRate || 0)} / ${inr(pc.weekendRate || 0)}` : ''} />
          <Row label="Extra adult / child" value={pc.extraAdultRate || pc.childRate ? `${inr(pc.extraAdultRate || 0)} / ${inr(pc.childRate || 0)}` : ''} />
          <Row label="Meal plans" value={pc.mealPlans} />
          <Row label="Rooms total / available" value={inv.totalRooms || inv.availableRooms ? `${inv.totalRooms || 0} / ${inv.availableRooms || 0}` : ''} />
          <Row label="Closed dates" value={inv.closedDates} />
          <Row label="Blackout dates" value={inv.blackoutDates} />
          <Row label="Check-in / out" value={po.checkIn || po.checkOut ? `${po.checkIn || '—'} / ${po.checkOut || '—'}` : ''} />
          <Row label="Free cancellation" value={po.freeCancellationUntil} />
          <Row label="Cancellation charge" value={po.cancellationCharge} />
          <Row label="No-show" value={po.noShowPolicy} />
        </dl>
      </section>

      <section className="lg:col-span-2">
        <p className="eyebrow mb-1">Step 5 · Ownership and legal</p>
        <div className="grid gap-x-8 lg:grid-cols-2">
          <dl>
            <Row label="Ownership" value={ow.type} />
            <Row label="PAN" value={ow.pan} />
            <Row label="GST" value={ow.gst} />
            <Row label="TAN" value={ow.tan} />
            <Row label="Agreement" value={l.agreementAccepted ? 'Accepted' : 'Not accepted'} />
          </dl>
          <dl>
            <Row label="Account holder" value={b.holder} />
            <Row label="Bank" value={[b.bankName, b.branch].filter(Boolean).join(', ')} />
            <Row label="Account number" value={b.accountNumber} />
            <Row label="IFSC" value={b.ifsc} />
          </dl>
        </div>
        <Links
          label="Documents"
          urls={[dl.ownershipProof, dl.leaseAgreement, dl.authorisation, b.proofLink]}
        />
      </section>
    </div>
  );
}

export default function ReviewQueue({ partners, onOpen }) {
  const { pull, update, toast } = useApp();
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  const [asking, setAsking] = useState(null);
  const [note, setNote] = useState('');

  const counts = STAGES.map((s) => ({ ...s, n: partners.filter((p) => stageOf(p) === s.key).length }));
  const waiting = partners.filter((p) => stageOf(p) === 'Admin review');
  const contract = partners.filter((p) => stageOf(p) === 'Contract');
  const withPartner = partners.filter((p) => ['Registration', 'Needs changes'].includes(stageOf(p)));

  /**
   * One decision, sent to the endpoint that owns it. Offline there is no
   * server to ask, so the demo moves the record locally instead.
   */
  const decide = async (p, path, body, local, message) => {
    setBusy(`${idOf(p)}:${path}`);
    try {
      if (isLive) {
        await api.patch(`/partners/${idOf(p)}/${path}`, body);
        await pull('partners');
      } else {
        update('partners', p.id, local);
      }
      toast(message);
      setAsking(null);
      setNote('');
    } catch (err) {
      toast(err.message, 'danger');
    } finally {
      setBusy(null);
    }
  };

  const approve = (p) =>
    decide(p, 'approve', undefined, { stage: 'Contract', approval: 'Approved', verification: 'Verified' }, `${p.name} approved — contract next`);

  const sendBack = (p) => {
    if (!note.trim()) {
      toast('Say what needs changing', 'danger');
      return;
    }
    decide(p, 'request-changes', { note }, { stage: 'Needs changes', approval: 'Needs changes', reviewNote: note }, `${p.name} sent back for changes`);
  };

  const reject = (p) => {
    const reason = window.prompt(`Why is ${p.name} being rejected?`);
    if (!reason) return;
    decide(p, 'reject', { reason }, { stage: 'Rejected', approval: 'Rejected', status: 'Paused' }, `${p.name} rejected`);
  };

  const goLive = (p) =>
    decide(p, 'go-live', undefined, { stage: 'Live', status: 'Active' }, `${p.name} is live — their dashboard is open`);

  const isBusy = (p, path) => busy === `${idOf(p)}:${path}`;

  return (
    <>
      <Block title="Partner flow" note="Submit → admin review → approved or needs changes → contract → live" wide>
        <ol className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {counts.map((s) => (
            <li
              key={s.key}
              className={`rounded-xl px-4 py-3 ${s.key === 'Admin review' && s.n ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-surface-soft'}`}
            >
              <p className="text-sm font-bold text-ink-800">{s.label}</p>
              <p className="num mt-1 font-display text-2xl font-extrabold text-ink-900">{s.n}</p>
              <p className="text-xs text-ink-500">{s.note}</p>
            </li>
          ))}
        </ol>
      </Block>

      <Block
        title="Waiting on the desk"
        note={waiting.length ? 'Open a listing to review what the partner submitted' : 'Nothing to review right now'}
        wide
      >
        {waiting.length ? (
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {waiting.map((p) => {
              const expanded = open === idOf(p);
              return (
                <li key={idOf(p)}>
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <Avatar name={p.name} size="sm" />
                    <button type="button" onClick={() => setOpen(expanded ? null : idOf(p))} className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                        {p.name}
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                      <span className="block truncate text-xs text-ink-500">
                        {[p.businessType || p.category, p.location, p.phone, p.submitted && `submitted ${p.submitted}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </button>
                    <span className="flex flex-wrap gap-1.5">
                      <button className="btn-action btn-sm" disabled={!!busy} onClick={() => approve(p)}>
                        {isBusy(p, 'approve') ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />} Approve
                      </button>
                      <button
                        className="btn-line btn-sm"
                        disabled={!!busy}
                        onClick={() => {
                          setAsking(asking === idOf(p) ? null : idOf(p));
                          setNote('');
                        }}
                      >
                        <MessageSquareWarning size={13} /> Needs changes
                      </button>
                      <button className="btn-line-danger btn-sm" disabled={!!busy} onClick={() => reject(p)}>
                        <XCircle size={13} /> Reject
                      </button>
                    </span>
                  </div>

                  {asking === idOf(p) && (
                    <div className="border-t border-ink-900/[0.07] bg-amber-50/50 px-4 py-3">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold text-ink-700">
                          What should {p.name} change? They see this first thing in their portal.
                        </span>
                        <textarea
                          className="input"
                          rows={2}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Please add a photo of the bathroom, and check the PIN code."
                          autoFocus
                        />
                      </label>
                      <div className="mt-2 flex gap-2">
                        <button className="btn-action btn-sm" disabled={!!busy} onClick={() => sendBack(p)}>
                          {isBusy(p, 'request-changes') ? <Loader2 size={13} className="animate-spin" /> : null}
                          Send back to partner
                        </button>
                        <button className="btn-line btn-sm" onClick={() => setAsking(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {expanded && (
                    <div className="border-t border-ink-900/[0.07] bg-surface-soft/40 px-4 py-4">
                      <ListingDetails listing={p.listing} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-xl bg-surface-soft px-4 py-6 text-center text-sm text-ink-500">
            When a partner submits their listing it appears here.
          </p>
        )}
      </Block>

      <Block title="Contract" note="Approved — go live once the agreement is signed">
        {contract.length ? (
          <ul className="space-y-2">
            {contract.map((p) => (
              <li key={idOf(p)} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-900/[0.07] px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink-900">{p.name}</span>
                  <span className="block text-xs text-ink-500">{p.location}</span>
                </span>
                <button className="btn-action btn-sm" disabled={!!busy} onClick={() => goLive(p)}>
                  {isBusy(p, 'go-live') ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
                  Contract signed — go live
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">Nobody is waiting on a contract.</p>
        )}
      </Block>

      <Block title="With the partner" note="Filling in the form, or making changes">
        {withPartner.length ? (
          <ul className="space-y-2">
            {withPartner.map((p) => (
              <li key={idOf(p)} className="flex items-center gap-3 rounded-xl border border-ink-900/[0.07] px-4 py-2.5">
                <span className="min-w-0 flex-1">
                  <button type="button" onClick={() => onOpen?.(p)} className="block truncate text-left text-sm font-bold text-ink-900 hover:text-brand-700">
                    {p.name}
                  </button>
                  <span className="block truncate text-xs text-ink-500">
                    {p.phone}
                    {p.listing?.step ? ` · reached step ${p.listing.step} of 5` : ''}
                  </span>
                </span>
                <Badge tone={stageOf(p) === 'Needs changes' ? 'amber' : 'slate'} dot>
                  {stageOf(p) === 'Needs changes' ? 'Needs changes' : 'Filling the form'}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">No partner is part way through.</p>
        )}
      </Block>
    </>
  );
}
