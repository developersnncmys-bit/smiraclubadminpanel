import { useEffect, useRef, useState } from 'react';
import {
  X, Phone, Mail, MessageCircle, Pencil, ChevronLeft, ChevronRight, Plus, ArrowRight, Clock, ShoppingCart, CalendarPlus, Crown,
  Check, ChevronDown, User, MapPin, Plane, Hash,
} from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { inr } from '../../data/mockData.js';
import { useLeadStages, stageTone } from '../../lib/leadStages.js';
import { useApp } from '../../store/AppStore.jsx';
import { findMembership, membershipStanding } from '../../lib/membership.js';
import Field from '../ui/Field.jsx';
import WhatsAppIcon from '../ui/WhatsAppIcon.jsx';
import LeadTaskForm from './LeadTaskForm.jsx';
import TaskDetails from './TaskDetails.jsx';
import { dialable } from '../../lib/phone.js';
import { api } from '../../lib/api.js';
import { useCan } from '../../lib/access.js';

const LABELS = ['Honeymoon', 'Family', 'Luxury', 'Group', 'Adventure', 'Beach', 'Couple', 'Shopping'];

/** Icon and colour per kind of thing that happened. */
const KINDS = {
  created: { icon: Clock, tone: 'bg-slate-100 text-slate-500' },
  status: { icon: ArrowRight, tone: 'bg-amber-100 text-amber-700' },
  automation: { icon: ArrowRight, tone: 'bg-violet-100 text-violet-700' },
  note: { icon: Clock, tone: 'bg-slate-100 text-slate-500' },
  call: { icon: Phone, tone: 'bg-sky-100 text-sky-700' },
  whatsapp: { icon: MessageCircle, tone: 'bg-emerald-100 text-emerald-700' },
  email: { icon: Mail, tone: 'bg-sky-100 text-sky-700' },
  assign: { icon: ArrowRight, tone: 'bg-brand-100 text-brand-700' },
};

/**
 * The lead panel: who they are and every quick action on the left, the trail
 * of what has happened on the right. Opens over the list so the desk never
 * loses its place.
 */
export default function LeadDetails({ lead, list, onClose, onJump, onEdit, startOn }) {
  const enquiryStatuses = useLeadStages();
  const canEdit = useCan()('edit', 'CRM');
  const { activities, tasks, team, quotations, memberSignups, memberships, logActivity, update, toast } = useApp();
  // "Add task" from the leads list opens here, on the Tasks tab with the form open.
  const [tab, setTab] = useState(startOn === 'task' ? 'Tasks' : 'Activities');
  const [taskForm, setTaskForm] = useState(startOn === 'task');
  const [openTask, setOpenTask] = useState(null);
  const [newest, setNewest] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [waText, setWaText] = useState('');
  const tabsRef = useRef(null);
  const [waSending, setWaSending] = useState(false);
  const [editing, setEditing] = useState(null); // 'status' | 'label' | 'owner'

  // The panel stays mounted between leads: start each one where it was asked to.
  useEffect(() => {
    setTab(startOn === 'task' ? 'Tasks' : 'Activities');
    setTaskForm(startOn === 'task');
  }, [lead?.id, startOn]);

  // Back on a phone closes this: Sales & Leads keeps the open lead in the address.
  if (!lead) return null;

  const index = list.findIndex((l) => l.id === lead.id);
  /**
   * The lead's own trail from the server, then anything logged in this
   * browser while there was no server to send it to.
   */
  const stamp = (at) => {
    const d = new Date(at);
    if (Number.isNaN(d.getTime())) return at || '';
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d
      .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      .toLowerCase()}`;
  };
  const serverTrail = (lead.activities || []).map((a, i) => ({
    id: `${lead.id}-srv-${i}`,
    lead: lead.id,
    kind: a.kind === 'status' ? 'status' : a.kind,
    text: a.text,
    who: String(a.byName || '').split(' ')[0] || '—',
    at: stamp(a.at),
    when: new Date(a.at).getTime() || 0,
  }));
  const trail = [
    ...serverTrail.sort((a, b) => a.when - b.when),
    ...activities.filter((a) => a.lead === lead.id),
  ];
  const ordered = newest ? [...trail].reverse() : trail;
  // Filed against this lead, or (older tasks) under its person's name.
  const leadTasks = tasks.filter((t) => (lead._id && t.lead === lead._id) || t.customer === lead.name);
  const leadQuotes = quotations.filter((q) => q.customer === lead.name);

  const digits = String(lead.phone).replace(/[^\d]/g, '');
  const held = findMembership(lead, memberSignups, memberships);
  const standing = held ? membershipStanding(held.signup) : null;

  // WhatsApp wants the number with its country code: a 10-digit Indian number gets 91.
  // A number saved as 0XXXXXXXXXX loses the 0 first.
  const local = digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits;
  const waNumber = local.length === 10 ? `91${local}` : local;
  // Call, WhatsApp and Edit: square buttons in the app's colours. Tasks and
  // activities are added from their own tabs below.
  const quick = [
    { icon: Phone, tone: 'bg-[#1E88E5]', label: 'Call', title: 'Call', run: () => { window.location.href = `tel:${dialable(digits)}`; logActivity(lead.id, `Called ${lead.name}`, 'call'); } },
    { icon: WhatsAppIcon, tone: 'bg-[#25D366]', label: 'WhatsApp', title: 'Open WhatsApp chat', run: () => { window.open(`https://wa.me/${waNumber}`, '_blank'); logActivity(lead.id, `Opened WhatsApp with ${lead.name}`, 'note'); } },
    canEdit && { icon: Pencil, tone: 'bg-[#8E44AD]', label: 'Edit', title: 'Edit lead', run: () => onEdit(lead) },
  ].filter(Boolean);

  // Who a lead can be given to: everyone on the team who is active.
  const people = ['Unassigned', ...team.filter((t) => t.status !== 'Inactive').map((t) => t.name)];

  const setField = (key, value, text) => {
    update('enquiries', lead.id, { [key]: value }, { silent: true, record: lead });
    logActivity(lead.id, text, key === 'owner' ? 'assign' : 'status', undefined, lead);
    toast(text);
    setEditing(null);
  };

  const addActivity = () => {
    if (!draft.trim()) return;
    logActivity(lead.id, draft.trim(), 'note');
    setDraft('');
    setAdding(false);
    toast('Activity added');
  };

  // Activities, WhatsApp, Tasks, Info — notes are in Activities with the rest.
  const chats = trail.filter((a) => a.kind === 'whatsapp');
  const tabs = [
    { key: 'Activities', count: trail.length },
    { key: 'WhatsApp', count: chats.length },
    { key: 'Tasks', count: leadTasks.length },
    { key: 'Info', count: null },
  ];

  /**
   * A WhatsApp message from the lead's own tab: through the desk's linked
   * number when it is connected, otherwise WhatsApp opens with the message
   * typed in. Either way it is logged on the lead.
   */
  const sendWhatsApp = async () => {
    const text = waText.trim();
    if (!text) return;
    setWaSending(true);
    try {
      await api.post('/whatsapp/gateway/send', { phone: lead.phone, text });
      toast(`WhatsApp sent to ${lead.name}`);
    } catch {
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank');
    } finally {
      logActivity(lead.id, `WhatsApp: ${text}`, 'whatsapp');
      setWaText('');
      setWaSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[1080px] flex-col bg-surface-base shadow-lift">
        {/* Header */}
        <header className="flex items-center gap-2 border-b border-ink-900/[0.07] bg-white px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3.5">
          <h2 className="truncate font-display text-base font-extrabold text-ink-900 sm:text-lg">Lead details</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="num hidden text-sm font-semibold text-ink-500 sm:inline">
              {index + 1} / {list.length}
            </span>
            <button
              onClick={() => onJump(-1)}
              disabled={index <= 0}
              className="icon-btn h-8 w-8 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => onJump(1)}
              disabled={index >= list.length - 1}
              className="icon-btn h-8 w-8 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
            <button onClick={onClose} className="icon-btn h-8 w-8">
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-3 overflow-y-auto overflow-x-hidden p-3 sm:gap-5 sm:p-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:content-stretch">
          {/* Who they are */}
          <section className="card h-fit overflow-hidden">
            <div className="px-4 pb-4 pt-4 text-left lg:pt-5 lg:text-center">
              <Avatar name={lead.name} size="lg" className="mx-auto max-lg:hidden" />
              <p className="font-display text-xl font-extrabold uppercase leading-tight text-ink-900 lg:mt-3 lg:text-lg lg:normal-case">{lead.name}</p>
              {(lead.destination || lead.pax) && (
                <p className="text-sm text-ink-500">{[lead.destination, lead.pax && `${lead.pax} pax`].filter(Boolean).join(' · ')}</p>
              )}


              <button
                onClick={() => toast('Add packages and add-ons to this lead', 'info')}
                className="btn-line mt-4 hidden w-full justify-center lg:flex"
              >
                <ShoppingCart size={15} /> Add packages
              </button>
            </div>

            <div className="hidden lg:block">
              <Field label="Phone" onCopy={() => toast(`${lead.phone} copied`, 'info')}>
                <span className="num">{lead.phone}</span>
              </Field>
            </div>

            {/* Status and label side by side on a phone; the rest is under Info. */}
            <div className="grid grid-cols-2 lg:block">

            {/* One tap opens one sheet — Move status, Label — like the list's Move status. */}
            {[
              ['status', 'Status', <Badge key="s" tone={stageTone(lead.status)} dot>{lead.status}</Badge>],
              ['label', 'Label', <Badge key="l" tone="teal">{lead.label || 'None'}</Badge>],
            ].map(([key, label, value]) => (
              <button
                key={key}
                type="button"
                disabled={!canEdit}
                onClick={() => setEditing(key)}
                className="flex min-w-0 flex-col items-start gap-1 border-b border-ink-900/[0.07] px-4 py-2.5 text-left transition enabled:active:bg-surface-soft lg:w-full"
              >
                <span className="eyebrow">{label}</span>
                <span className="flex max-w-full items-center gap-1">
                  {value}
                  {canEdit && <ChevronDown size={15} className="shrink-0 text-ink-400" />}
                </span>
              </button>
            ))}
            </div>

            {/* Call, WhatsApp, Edit */}
            <div className={`grid ${quick.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 border-b border-ink-900/[0.07] px-4 py-3`}>
              {quick.map(({ icon: Icon, tone, label, title, run }) => (
                <button key={label} onClick={run} title={title} className="flex flex-col items-center gap-1">
                  <span className={`grid aspect-square w-full max-w-[3.25rem] place-items-center rounded-xl text-white shadow-sm transition active:scale-95 ${tone}`}>
                    <Icon size={20} />
                  </span>
                  <span className="text-[10px] font-semibold leading-tight text-ink-600">{label}</span>
                </button>
              ))}
            </div>

            <div className="hidden lg:block">

            <Field label="Membership">
              {held ? (
                <>
                  <p className="flex items-center gap-1.5 font-bold text-ink-900">
                    <Crown size={13} className="shrink-0 text-brand-600" />
                    {held.signup.plan}
                    {held.plan?.discount ? (
                      <span className="text-xs font-semibold text-ink-500">
                        · {held.plan.discount}% off packages
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {held.signup.startedOn ? `Joined ${held.signup.startedOn}` : `Signed up ${held.signup.received}`}
                    {held.signup.expiresOn ? ` · valid till ${held.signup.expiresOn}` : ''}
                  </p>
                  <p
                    className={`mt-1 text-xs font-bold ${
                      standing.tone === 'rose'
                        ? 'text-rose-600'
                        : standing.tone === 'amber'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                    }`}
                  >
                    {standing.headline}
                  </p>
                </>
              ) : (
                <span className="text-ink-500">Not a member</span>
              )}
            </Field>

            <Field label="Budget">
              <span className="num font-bold text-ink-900">{inr(lead.budget)}</span>
            </Field>

            <Field label="Travel date">{lead.travelDate}</Field>
            <Field label="Date added">{lead.created}</Field>
            <Field label="Lead source">{lead.source}</Field>

            <Field label="Assigned to" onEdit={canEdit ? () => setEditing('owner') : undefined}>
              <span className={`font-semibold ${lead.owner === 'Unassigned' ? 'text-rose-600' : 'text-ink-800'}`}>{lead.owner}</span>
            </Field>
            </div>
          </section>

          {/* What has happened */}
          <section ref={tabsRef} className="card flex min-h-0 min-w-0 scroll-mt-3 flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-ink-900/[0.07] p-2.5 sm:gap-2 sm:p-3.5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition sm:px-3.5 ${
                    tab === t.key ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-surface-soft'
                  }`}
                >
                  {t.key}
                  {t.count !== null && ` (${t.count})`}
                </button>
              ))}
              <button className="btn-action btn-sm ml-auto shrink-0 whitespace-nowrap" onClick={() => setAdding((a) => !a)}>
                <Plus size={14} /> Activity
              </button>
            </div>

            {adding && (
              <div className="flex gap-2 border-b border-ink-900/[0.07] bg-surface-soft/50 p-3.5">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addActivity()}
                  placeholder="What happened? e.g. Called, asked for a revised quote"
                  className="input bg-white"
                />
                <button className="btn-action shrink-0" onClick={addActivity}>
                  Save
                </button>
              </div>
            )}

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
              {tab === 'Activities' && (
                <>
                  <button
                    onClick={() => setNewest((n) => !n)}
                    className="chip mb-4 bg-surface-soft text-ink-600 hover:text-ink-900"
                  >
                    {newest ? 'Newest first' : 'Oldest first'}
                  </button>

                  <ul className="space-y-2.5">
                    {ordered.map((a) => {
                      const k = KINDS[a.kind] || KINDS.note;
                      return (
                        <li key={a.id} className="flex gap-3 rounded-xl bg-surface-soft/60 p-3.5">
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${k.tone}`}>
                            <k.icon size={15} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <p className="text-xs font-semibold text-ink-500">{a.at}</p>
                              <p className="text-xs text-ink-400">{a.who}</p>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-ink-900">{a.text}</p>
                            {a.meta && <p className="text-xs text-ink-500">{a.meta}</p>}
                          </div>
                        </li>
                      );
                    })}
                    {ordered.length === 0 && (
                      <li className="py-10 text-center text-sm text-ink-500">
                        Nothing has happened on this lead yet.
                      </li>
                    )}
                  </ul>
                </>
              )}

              {tab === 'Tasks' && (
                <div className="space-y-3">
                  {/* Adding a task to this lead: what, when, and who does it. */}
                  {taskForm ? (
                    <LeadTaskForm
                      lead={lead}
                      onCancel={() => setTaskForm(false)}
                      onDone={() => setTaskForm(false)}
                    />
                  ) : (
                    <button type="button" className="btn-action btn-sm" onClick={() => setTaskForm(true)}>
                      <CalendarPlus size={14} /> Add task
                    </button>
                  )}

                  <ul className="space-y-2.5">
                    {leadTasks.map((t) => {
                      const done = t.status === 'Completed' || t.bucket === 'done';
                      return (
                        <li key={t.id} className={`flex items-start gap-3 rounded-xl bg-surface-soft/60 p-3.5 ${done ? 'opacity-60' : ''}`}>
                          <CalendarPlus size={16} className="mt-0.5 shrink-0 text-ink-400" />
                          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpenTask(t)}>
                            <p className={`text-sm font-bold text-ink-900 ${done ? 'line-through' : ''}`}>{t.title}</p>
                            <p className="text-xs text-ink-500">
                              {t.type ? `${t.type} · ` : ''}due {t.due}{t.priority === 'High' ? ' · High priority' : ''}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-brand-700">Assigned to {t.owner || 'nobody'}</p>
                            {t.note && <p className="mt-0.5 line-clamp-2 text-xs text-ink-600">{t.note}</p>}
                            {t.comments?.length > 0 && <p className="mt-0.5 text-xs text-ink-400">{t.comments.length} comment(s) · tap to see</p>}
                          </button>
                          <span className="flex shrink-0 flex-col items-end gap-1.5">
                            <Badge tone={done ? 'green' : t.bucket === 'overdue' ? 'rose' : 'sky'} dot>
                              {done ? 'done' : t.bucket || 'upcoming'}
                            </Badge>
                            {!done && (
                              <button
                                type="button"
                                className="text-xs font-bold text-brand-700 hover:underline"
                                onClick={() => update('tasks', t.id, { status: 'Completed', bucket: 'done' }, { message: 'Task done' })}
                              >
                                Mark done
                              </button>
                            )}
                          </span>
                        </li>
                      );
                    })}
                    {leadTasks.length === 0 && !taskForm && (
                      <li className="py-8 text-center text-sm text-ink-500">No tasks on this lead yet. Add one above.</li>
                    )}
                  </ul>
                  <TaskDetails task={openTask} lead={lead} onClose={() => setOpenTask(null)} />
                </div>
              )}

              {tab === 'WhatsApp' && (
                <div className="flex min-h-full flex-col">
                  <ul className="flex-1 space-y-2.5">
                    {chats.map((a) => (
                      <li key={a.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#DCF8C6] px-3.5 py-2.5">
                        <p className="whitespace-pre-wrap text-sm text-ink-900">{String(a.text).replace(/^WhatsApp:\s*/, '')}</p>
                        <p className="mt-1 text-right text-[11px] text-ink-500">{a.who} · {a.at}</p>
                      </li>
                    ))}
                    {chats.length === 0 && (
                      <li className="py-8 text-center text-sm text-ink-500">No WhatsApp messages with {lead.name} yet.</li>
                    )}
                  </ul>
                  <div className="sticky bottom-0 mt-3 flex items-end gap-2 bg-white pt-2">
                    <textarea
                      rows={2}
                      value={waText}
                      onChange={(e) => setWaText(e.target.value)}
                      placeholder={`Message ${lead.name.split(' ')[0]}…`}
                      className="input min-h-[44px] flex-1 resize-none"
                    />
                    <button
                      type="button"
                      onClick={sendWhatsApp}
                      disabled={!waText.trim() || waSending || !lead.phone}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white disabled:opacity-50"
                      title="Send on WhatsApp"
                    >
                      <WhatsAppIcon size={20} />
                    </button>
                  </div>
                </div>
              )}

              {tab === 'Info' && (
                <div className="space-y-3">
                  {/* Who has it */}
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => setEditing('owner')}
                    className="flex w-full items-center gap-3 rounded-2xl border border-ink-900/[0.07] bg-white px-4 py-3 text-left transition enabled:active:bg-surface-soft"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><User size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-400">Assigned to</span>
                      <span className={`block truncate text-[15px] font-bold ${lead.owner === 'Unassigned' ? 'text-rose-600' : 'text-ink-900'}`}>{lead.owner}</span>
                    </span>
                    {canEdit && <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">Change</span>}
                  </button>

                  {[
                    {
                      title: 'Contact', icon: Phone,
                      rows: [['Phone', lead.phone], ['Email', lead.email], ['Lead ID', lead.id], ['Source', lead.source]],
                    },
                    {
                      title: 'Trip', icon: MapPin,
                      rows: [
                        ['Destination', lead.destination], ['Travellers', lead.pax],
                        ['Travel date', lead.travelDate], ['Budget', lead.budget ? inr(lead.budget) : ''],
                      ],
                    },
                    {
                      title: 'Travel usage', icon: Plane,
                      rows: [
                        ['Trips a year', lead.trip?.yearlyTrips], ['Rooms', lead.trip?.roomsRequired],
                        ['Family / group', lead.trip?.travelPersons], ['Last holiday budget', lead.trip?.lastExpenses ? inr(lead.trip.lastExpenses) : ''],
                        ['Next destination', lead.trip?.nextDestination], ['Next trip', lead.trip?.nextTripDate],
                      ],
                    },
                    {
                      title: 'More', icon: Hash,
                      rows: [
                        ['Label', lead.label], ['Date added', lead.created],
                        ['Membership', held ? `${held.signup.plan}${standing ? ` · ${standing.headline}` : ''}` : 'Not a member'],
                        ['Quotations', leadQuotes.length ? leadQuotes.map((q) => q.id).join(', ') : 'None'],
                      ],
                    },
                  ].map(({ title, icon: Icon, rows }) => (
                    <div key={title} className="overflow-hidden rounded-2xl border border-ink-900/[0.07] bg-white">
                      <p className="flex items-center gap-2 border-b border-ink-900/[0.06] bg-surface-soft/60 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-ink-600">
                        <Icon size={14} className="text-brand-600" /> {title}
                      </p>
                      <dl className="grid grid-cols-2 gap-px bg-ink-900/[0.06]">
                        {rows.map(([k, v]) => (
                          <div key={k} className="min-w-0 bg-white px-4 py-2.5">
                            <dt className="truncate text-[11px] font-semibold text-ink-400">{k}</dt>
                            <dd className={`mt-0.5 break-words text-sm font-semibold ${v || v === 0 ? 'text-ink-900' : 'text-ink-300'}`}>
                              {v || v === 0 ? v : '—'}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </aside>

      {/* Move status / Label / Assign — one sheet, one tap. */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'status' ? 'Move status' : editing === 'label' ? 'Label' : 'Assign to'}
        subtitle={lead.name}
        size="sm"
      >
        <div className="space-y-2">
          {(editing === 'status' ? enquiryStatuses : editing === 'label' ? LABELS : people).map((v) => {
            const field = editing === 'status' ? 'status' : editing === 'label' ? 'label' : 'owner';
            const on = (lead[field] || '') === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() =>
                  on
                    ? setEditing(null)
                    : setField(
                        field,
                        v,
                        field === 'status' ? `Status updated to ${v}` : field === 'label' ? `Label set to ${v}` : `Assigned to ${v}`
                      )
                }
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  on ? 'border-brand-500 bg-brand-50' : 'border-ink-900/10 hover:border-brand-400 hover:bg-brand-50'
                }`}
              >
                {field === 'status' ? (
                  <Badge tone={stageTone(v)} dot>{v}</Badge>
                ) : (
                  <span className="text-sm font-semibold text-ink-800">{v}</span>
                )}
                {on && <Check size={18} className="ml-auto text-brand-600" />}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
