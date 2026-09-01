import { useState } from 'react';
import {
  X, Phone, Mail, MessageCircle, Pencil, Share2, FileText, Paperclip, ChevronLeft, ChevronRight, Plus, ArrowRight, Clock, ShoppingCart, CalendarPlus, Crown,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { statusTone, enquiryStatuses, inr } from '../../data/mockData.js';
import { useApp } from '../../store/AppStore.jsx';
import { findMembership, membershipStanding } from '../../lib/membership.js';
import Field from '../ui/Field.jsx';

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
export default function LeadDetails({ lead, list, onClose, onJump, onEdit }) {
  const { activities, tasks, quotations, memberSignups, memberships, logActivity, update, toast } = useApp();
  const [tab, setTab] = useState('Activities');
  const [newest, setNewest] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null); // 'status' | 'label' | 'owner'

  if (!lead) return null;

  const index = list.findIndex((l) => l.id === lead.id);
  const trail = activities.filter((a) => a.lead === lead.id);
  const ordered = newest ? [...trail].reverse() : trail;
  const leadTasks = tasks.filter((t) => t.customer === lead.name);
  const notes = trail.filter((a) => a.kind === 'note');
  const leadQuotes = quotations.filter((q) => q.customer === lead.name);

  const digits = String(lead.phone).replace(/[^\d]/g, '');
  const held = findMembership(lead, memberSignups, memberships);
  const standing = held ? membershipStanding(held.signup) : null;

  const quick = [
    { icon: Phone, tone: 'bg-sky-500', label: 'Call', run: () => { window.location.href = `tel:${digits}`; logActivity(lead.id, `Called ${lead.name}`, 'call'); } },
    { icon: Mail, tone: 'bg-sky-500', label: 'Email', run: () => { window.location.href = `mailto:${lead.email}`; logActivity(lead.id, `Emailed ${lead.name}`, 'email'); } },
    { icon: MessageCircle, tone: 'bg-emerald-500', label: 'WhatsApp', run: () => { window.open(`https://wa.me/${digits}`, '_blank'); logActivity(lead.id, 'Messaged on WhatsApp', 'whatsapp'); } },
    { icon: Paperclip, tone: 'bg-sky-500', label: 'Attach a file', run: () => toast('File attachments come with the storage work', 'info') },
    { icon: Pencil, tone: 'bg-sky-500', label: 'Edit lead', run: () => onEdit(lead) },
    { icon: Share2, tone: 'bg-sky-500', label: 'Share lead', run: () => toast(`${lead.name} shared with the team`, 'info') },
    { icon: FileText, tone: 'bg-sky-500', label: 'Create quotation', run: () => { logActivity(lead.id, 'Quotation drafted', 'note'); toast('Quotation draft started'); } },
  ];

  const setField = (key, value, text) => {
    update('enquiries', lead.id, { [key]: value }, { silent: true });
    logActivity(lead.id, text, key === 'owner' ? 'assign' : 'status');
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

  const tabs = [
    { key: 'Activities', count: trail.length },
    { key: 'Tasks', count: leadTasks.length },
    { key: 'Notes', count: notes.length },
    { key: 'Info', count: null },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[1080px] flex-col bg-surface-base shadow-lift">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">Lead details</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="num text-sm font-semibold text-ink-500">
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

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Who they are */}
          <section className="card h-fit overflow-hidden">
            <div className="px-4 pb-4 pt-5 text-center">
              <Avatar name={lead.name} size="lg" className="mx-auto" />
              <p className="mt-3 font-display text-lg font-extrabold text-ink-900">{lead.name}</p>
              <p className="text-sm text-ink-500">
                {lead.destination} · {lead.pax} pax
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quick.map(({ icon: Icon, tone, label, run }) => (
                  <button
                    key={label}
                    onClick={run}
                    title={label}
                    className={`grid h-10 w-10 place-items-center rounded-full text-white transition hover:opacity-90 ${tone}`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>

              <button
                onClick={() => toast('Add packages and add-ons to this lead', 'info')}
                className="btn-line mt-4 w-full justify-center"
              >
                <ShoppingCart size={15} /> Add packages
              </button>
            </div>

            <Field label="Phone" onCopy={() => toast(`${lead.phone} copied`, 'info')}>
              <span className="num">{lead.phone}</span>
            </Field>

            <Field label="Status" onEdit={() => setEditing(editing === 'status' ? null : 'status')}>
              {editing === 'status' ? (
                <div className="flex flex-wrap gap-1.5">
                  {enquiryStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setField('status', s, `Status updated to ${s}`)}
                      className={`chip ${
                        lead.status === s ? 'bg-brand-600 text-white' : 'bg-surface-soft text-ink-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <Badge tone={statusTone[lead.status]} dot>
                  {lead.status}
                </Badge>
              )}
            </Field>

            <Field label="Label" onEdit={() => setEditing(editing === 'label' ? null : 'label')}>
              {editing === 'label' ? (
                <div className="flex flex-wrap gap-1.5">
                  {LABELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setField('label', l, `Label set to ${l}`)}
                      className={`chip ${
                        lead.label === l ? 'bg-brand-600 text-white' : 'bg-surface-soft text-ink-600'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              ) : (
                <Badge tone="teal">{lead.label || 'None'}</Badge>
              )}
            </Field>

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

            <Field label="Assigned to" onEdit={() => setEditing(editing === 'owner' ? null : 'owner')}>
              {editing === 'owner' ? (
                <div className="flex flex-wrap gap-1.5">
                  {['Unassigned', 'Sneha', 'Ritik', 'Kabir'].map((o) => (
                    <button
                      key={o}
                      onClick={() => setField('owner', o, `Assigned to ${o}`)}
                      className={`chip ${
                        lead.owner === o ? 'bg-brand-600 text-white' : 'bg-surface-soft text-ink-600'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              ) : lead.owner === 'Unassigned' ? (
                <span className="font-semibold text-rose-600">Unassigned</span>
              ) : (
                <span className="font-semibold text-ink-800">{lead.owner}</span>
              )}
            </Field>
          </section>

          {/* What has happened */}
          <section className="card flex min-h-0 flex-col">
            <div className="flex flex-wrap items-center gap-2 border-b border-ink-900/[0.07] p-3.5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-bold transition ${
                    tab === t.key ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-surface-soft'
                  }`}
                >
                  {t.key}
                  {t.count !== null && ` (${t.count})`}
                </button>
              ))}
              <button className="btn-action btn-sm ml-auto" onClick={() => setAdding((a) => !a)}>
                <Plus size={14} /> Add activity
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

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
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
                <ul className="space-y-2.5">
                  {leadTasks.map((t) => (
                    <li key={t.id} className="flex items-start gap-3 rounded-xl bg-surface-soft/60 p-3.5">
                      <CalendarPlus size={16} className="mt-0.5 shrink-0 text-ink-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink-900">{t.title}</p>
                        <p className="text-xs text-ink-500">
                          {t.owner} · due {t.due}
                        </p>
                      </div>
                      <Badge tone={t.bucket === 'overdue' ? 'rose' : 'sky'} dot>
                        {t.bucket}
                      </Badge>
                    </li>
                  ))}
                  {leadTasks.length === 0 && (
                    <li className="py-10 text-center text-sm text-ink-500">No tasks on this lead.</li>
                  )}
                </ul>
              )}

              {tab === 'Notes' && (
                <ul className="space-y-2.5">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-xl bg-amber-50/70 p-3.5">
                      <p className="text-sm text-ink-800">{n.text}</p>
                      <p className="mt-1 text-xs text-ink-500">
                        {n.who} · {n.at}
                      </p>
                    </li>
                  ))}
                  {notes.length === 0 && (
                    <li className="py-10 text-center text-sm text-ink-500">No notes yet.</li>
                  )}
                </ul>
              )}

              {tab === 'Info' && (
                <dl className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                  {[
                    ['Lead ID', lead.id],
                    ['Email', lead.email],
                    ['Phone', lead.phone],
                    ['Destination', lead.destination],
                    ['Travellers', lead.pax],
                    ['Travel date', lead.travelDate],
                    ['Budget', inr(lead.budget)],
                    ['Source', lead.source],
                    ['Label', lead.label],
                    ['Owner', lead.owner],
                    ['Created', lead.created],
                    ['Quotations', leadQuotes.length ? leadQuotes.map((q) => q.id).join(', ') : 'None'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start gap-4 px-4 py-2.5">
                      <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-400">
                        {k}
                      </dt>
                      <dd className="min-w-0 flex-1 text-sm text-ink-800">{v || '—'}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
