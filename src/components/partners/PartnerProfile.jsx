import { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  Circle,
  FileText,
  Star,
  ShieldCheck,
  Ban,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { inr } from '../../data/mockData.js';
import Stat from '../ui/Stat.jsx';
import Field from '../ui/Field.jsx';
import DrawerTabs from '../ui/DrawerTabs.jsx';
import {
  onboardingFlow,
  settlementFlow,
  partnerMessageKinds,
} from '../../data/partnersData.js';

const digits = (v) => String(v || '').replace(/[^\d]/g, '');
const TABS = [
  'Overview', 'Details', 'Documents', 'Inventory', 'Rates', 'Availability',
  'Bookings', 'Customers', 'Support', 'Finance', 'Communication', 'Activity log',
];

const docTone = { Verified: 'green', Submitted: 'sky', Pending: 'amber', Missing: 'rose', Expired: 'rose' };

/**
 * One partner, from the paperwork that got them on board to the money that
 * still has to reach them — the twelve tabs the client's sheet lists.
 */
export default function PartnerProfile({ partner, list, requests, tickets, settlements, score, onClose, onJump, actions }) {
  const [tab, setTab] = useState('Overview');

  if (!partner) return null;

  const p = partner;
  const index = list.findIndex((x) => x.id === p.id);
  const theirRequests = requests.filter((r) => r.partner === p.name);
  const theirTickets = tickets.filter((t) => t.partner === p.name);
  const theirSettlements = settlements.filter((s) => s.partner === p.name);
  const stageAt = onboardingFlow.indexOf(p.stage);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[1040px] flex-col bg-surface-base shadow-lift">
        <header className="flex flex-wrap items-center gap-2.5 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">{p.name}</h2>
          <Badge tone={p.status === 'Active' ? 'green' : p.status === 'Suspended' ? 'rose' : 'amber'} dot>
            {p.status}
          </Badge>
          <Badge tone="teal">{p.category}</Badge>
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

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="card h-fit overflow-hidden">
            <div className="px-4 pb-4 pt-5 text-center">
              <Avatar name={p.name} size="lg" className="mx-auto" />
              <p className="mt-3 font-display text-base font-extrabold text-ink-900">{p.contact}</p>
              <p className="text-sm text-ink-500">{p.location}</p>
              {score && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-700">
                  Partner score {score.value}/100 · {score.band}
                </p>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <a href={`tel:${digits(p.phone)}`} className="icon-btn h-9 w-9 disabled:opacity-40" title="Call">
                  <Phone size={15} />
                </a>
                <a href={`https://wa.me/${digits(p.whatsapp)}`} target="_blank" rel="noreferrer" className="icon-btn h-9 w-9 hover:border-emerald-400 hover:text-emerald-600" title="WhatsApp">
                  <MessageCircle size={15} />
                </a>
                <a href={`mailto:${p.email}`} className="icon-btn h-9 w-9 disabled:opacity-40" title="Email">
                  <Mail size={15} />
                </a>
                <button onClick={() => actions.approve(p)} className="icon-btn h-9 w-9 disabled:opacity-40" title="Approve">
                  <ShieldCheck size={15} />
                </button>
                <button onClick={() => actions.suspend(p)} className="icon-btn-danger h-9 w-9" title="Suspend">
                  <Ban size={15} />
                </button>
              </div>
            </div>

            <Field label="Business type">{p.businessType}</Field>
            <Field label="Mobile / WhatsApp">
              <span className="num">{p.phone}</span>
            </Field>
            <Field label="Email">{p.email}</Field>
            <Field label="GST">{p.gst}</Field>
            <Field label="PAN">{p.pan}</Field>
            <Field label="UPI">{p.upi}</Field>
            <Field label="Bank">{p.bank}</Field>
            <Field label="Business registration">{p.registration}</Field>
            <Field label="Contract">{p.contract}</Field>
            <Field label="Commission">{p.commission}%</Field>
            <Field label="Submitted on">{p.submitted}</Field>
            <Field label="Verification">
              <Badge tone={p.verification === 'Verified' ? 'green' : 'amber'}>{p.verification}</Badge>
            </Field>
          </section>

          <section className="card flex min-h-0 flex-col overflow-hidden">
            <DrawerTabs items={TABS} value={tab} onChange={setTab} />

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {tab === 'Overview' && (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Total bookings" value={p.bookings} />
                    <Stat label="Confirmed" value={p.confirmed} tone="text-emerald-600" />
                    <Stat label="Cancelled" value={p.cancelled} tone="text-rose-600" />
                    <Stat label="Failed" value={p.failed} />
                    <Stat label="Revenue" value={inr(p.revenue)} tone="text-brand-700" />
                    <Stat label="Commission" value={inr(p.commissionEarned)} />
                    <Stat label="Average response" value={p.responseMins ? `${p.responseMins} min` : '—'} />
                    <Stat label="Customer rating" value={p.rating ? `${p.rating}★` : '—'} tone="text-amber-600" />
                    <Stat
                      label="Cancellation rate"
                      value={p.bookings ? `${((p.cancelled / p.bookings) * 100).toFixed(2)}%` : '—'}
                    />
                  </div>
                  <div>
                    <p className="eyebrow mb-2">Onboarding</p>
                    <ol className="space-y-1.5">
                      {onboardingFlow.map((s, i) => (
                        <li key={s} className="flex items-center gap-2.5 text-sm">
                          {stageAt >= i ? (
                            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                          ) : (
                            <Circle size={15} className="shrink-0 text-ink-300" />
                          )}
                          <span className={stageAt >= i ? 'font-semibold text-ink-800' : 'text-ink-400'}>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {tab === 'Details' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Stat label="Approval status" value={p.approval} />
                  <Stat label="Onboarding stage" value={p.stage} />
                  <Stat label="Repeat bookings" value={p.repeat} />
                  <Stat label="Rooms or units held" value={p.rooms || '—'} />
                </div>
              )}

              {tab === 'Documents' && (
                <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                  {(p.documents || []).map((d) => (
                    <li key={d.name} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="flex items-center gap-2.5 text-sm text-ink-700">
                        <FileText size={14} className="shrink-0 text-ink-400" /> {d.name}
                      </span>
                      <span className="flex items-center gap-2">
                        <Badge tone={docTone[d.status] || 'slate'}>{d.status}</Badge>
                        <button className="btn-ghost btn-sm" onClick={() => actions.requestDocs(p, d.name)}>
                          Request
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {tab === 'Inventory' && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="Rooms or units" value={p.rooms || '—'} />
                  <Stat label="Booked through us" value={p.bookings} />
                  <Stat label="Available now" value={Math.max(0, (p.rooms || 0) - theirRequests.length)} />
                </div>
              )}

              {tab === 'Rates' && (
                <p className="rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">{p.ratePlan}</p>
              )}

              {tab === 'Availability' && (
                <p className="rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
                  {p.rooms
                    ? `${p.rooms} held on contract · ${theirRequests.length} requests in flight`
                    : 'Availability is confirmed request by request.'}
                </p>
              )}

              {tab === 'Bookings' && (
                <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                  {theirRequests.map((r) => (
                    <li key={r.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="num text-sm font-bold text-brand-700">{r.booking}</span>
                        <Badge tone={r.stage === 'Completed' ? 'green' : 'sky'}>{r.stage}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-ink-700">
                        {r.customer} · {r.service}
                      </p>
                      <p className="num mt-0.5 text-xs text-ink-500">
                        {r.checkIn} → {r.checkOut} · {r.guests} guests · {inr(r.amount)} · payout {inr(r.payout)}
                      </p>
                      <p className="mt-1 text-xs text-ink-500">
                        {r.occasion} · {r.request}
                      </p>
                    </li>
                  ))}
                  {theirRequests.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-ink-500">Nothing booked yet.</li>
                  )}
                </ul>
              )}

              {tab === 'Customers' && (
                <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                  {[...new Set(theirRequests.map((r) => r.customer))].map((c) => (
                    <li key={c} className="flex items-center gap-3 px-4 py-3">
                      <Avatar name={c} size="sm" />
                      <span className="text-sm font-bold text-ink-900">{c}</span>
                    </li>
                  ))}
                  {theirRequests.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-ink-500">No customers through this partner yet.</li>
                  )}
                </ul>
              )}

              {tab === 'Support' && (
                <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                  {theirTickets.map((t) => (
                    <li key={t.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-ink-900">{t.kind}</span>
                        <Badge tone={t.stage === 'Closed' ? 'green' : 'amber'}>{t.stage}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-ink-700">{t.detail}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {t.about} · raised {t.raised} · with {t.owner}
                      </p>
                    </li>
                  ))}
                  {theirTickets.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-ink-500">No open tickets.</li>
                  )}
                </ul>
              )}

              {tab === 'Finance' && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Stat label="Booking value" value={inr(p.revenue)} />
                    <Stat label="Our commission" value={inr(p.commissionEarned)} tone="text-emerald-600" />
                    <Stat label="Payable" value={inr(p.payable)} tone={p.payable ? 'text-amber-600' : 'text-ink-900'} />
                    <Stat label="Paid so far" value={inr(p.paid)} />
                  </div>
                  <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                    {theirSettlements.map((s) => (
                      <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                        <span className="min-w-0 flex-1">
                          <span className="num block text-sm font-bold text-ink-900">
                            {s.id} · {s.period}
                          </span>
                          <span className="num block text-xs text-ink-500">
                            value {inr(s.bookingValue)} · commission {inr(s.commission)} · tax {inr(s.tax)}
                            {s.adjustment ? ` · adjustment ${inr(s.adjustment)}` : ''}
                          </span>
                        </span>
                        <span className="num text-sm font-bold text-brand-700">{inr(s.payable)}</span>
                        <Badge tone={s.stage === 'Partner paid' ? 'green' : 'amber'}>{s.stage}</Badge>
                      </li>
                    ))}
                    {theirSettlements.length === 0 && (
                      <li className="px-4 py-6 text-center text-sm text-ink-500">Nothing settled yet.</li>
                    )}
                  </ul>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
                    {settlementFlow.map((s, i) => (
                      <span key={s} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-ink-300">→</span>}
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'Communication' && (
                <div className="flex flex-wrap gap-2">
                  {partnerMessageKinds.map((k) => (
                    <button key={k} className="chip text-ink-600 hover:text-ink-900" onClick={() => actions.message(p, k)}>
                      {k}
                    </button>
                  ))}
                </div>
              )}

              {tab === 'Activity log' && (
                <ol className="space-y-3 border-l border-ink-900/[0.07] pl-4">
                  {(p.activity || []).map((a) => (
                    <li key={a.at + a.text} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                      <p className="text-sm text-ink-800">{a.text}</p>
                      <p className="text-xs text-ink-500">{a.at}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
