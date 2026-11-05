import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, Filter, ListChecks, Pencil, Phone, Plus, Search, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useApp } from '../store/AppStore.jsx';
import { dialable } from '../lib/phone.js';
import { isMineFor, seesEveryone } from '../lib/taskFeed.js';
import TaskDetails from '../components/sales/TaskDetails.jsx';
import LeadTaskForm, { TYPES } from '../components/sales/LeadTaskForm.jsx';

/**
 * Tasks: the follow-ups set on leads, by when they are due.
 *
 * Today, Upcoming, Overdue and Done, each with its count. Every card shows
 * the task's type and time, the customer, whose lead it is (Owner), who
 * has to do it (Assigned to) and the note. Tap one to edit it; + adds a
 * task to any lead. Filter by person, type, priority or day.
 */
const GROUPS = ['Today', 'Upcoming', 'Overdue', 'Done'];
const priorityTone = { High: 'rose', Medium: 'amber', Low: 'slate' };
const NO_FILTER = { assigned: '', owner: '', type: '', priority: '', from: '', to: '' };

function groupOf(t) {
  if (['Completed', 'Cancelled'].includes(t.status) || t.bucket === 'done') return 'Done';
  const at = new Date(t.dueAt || t.dueIso || '').getTime();
  if (!at) return 'Upcoming';
  const end = new Date().setHours(23, 59, 59, 999);
  if (at < Date.now()) return 'Overdue';
  return at <= end ? 'Today' : 'Upcoming';
}

/** "01:00 am" today; "Sat 7 Nov · 01:00 am" any other day. */
function timing(t) {
  const d = new Date(t.dueAt || t.dueIso || '');
  if (Number.isNaN(d.getTime())) return t.due || '—';
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${time}`;
}

const isoDay = (v) => {
  const d = new Date(v || '');
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Tasks() {
  const { tasks, enquiries, auth, team, update } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const everyone = seesEveryone(auth);
  const [mine, setMine] = useState(!everyone);
  const [group, setGroup] = useState('Today');
  const [open, setOpen] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState(NO_FILTER);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [pickQuery, setPickQuery] = useState('');
  const [pickedLead, setPickedLead] = useState(null);

  const leadOf = (t) => enquiries.find((e) => (t.lead && e._id === t.lead) || e.name === t.customer);

  // From the bell: /tasks?task=TSK-0301 opens that task.
  useEffect(() => {
    const id = params.get('task');
    if (!id) return;
    const t = tasks.find((x) => x.id === id || x._id === id);
    if (t) {
      setOpen(t);
      setGroup(groupOf(t));
      setMine(false);
      const next = new URLSearchParams(params);
      next.delete('task');
      setParams(next, { replace: true });
    }
  }, [params, tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const isMine = isMineFor(auth);
  const q = query.trim().toLowerCase();
  const list = useMemo(() => tasks.filter((t) => {
    if (mine && !isMine(t)) return false;
    const lead = leadOf(t);
    if (filter.assigned && t.owner !== filter.assigned) return false;
    if (filter.owner && (lead?.owner || '') !== filter.owner) return false;
    if (filter.type && t.type !== filter.type) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    const day = isoDay(t.dueAt || t.dueIso);
    if (filter.from && day < filter.from) return false;
    if (filter.to && day > filter.to) return false;
    if (q && ![t.title, t.customer, t.note, lead?.name, lead?.phone].some((v) => String(v || '').toLowerCase().includes(q))) return false;
    return true;
  }), [tasks, enquiries, mine, filter, q, auth]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = Object.fromEntries(GROUPS.map((g) => [g, list.filter((t) => groupOf(t) === g).length]));
  const shown = list
    .filter((t) => groupOf(t) === group)
    .sort((a, b) => (new Date(a.dueAt || 0) - new Date(b.dueAt || 0)) * (group === 'Done' ? -1 : 1))
    .slice(0, 300);
  const active = Object.values(filter).filter(Boolean).length;
  const names = [...new Set(team.map((m) => m.name))].sort();
  const setF = (k) => (e) => setFilter((f) => ({ ...f, [k]: e.target.value }));

  const pickable = pickQuery.trim().length < 2 ? [] : enquiries
    .filter((e) => [e.name, e.phone, e.id].some((v) => String(v || '').toLowerCase().includes(pickQuery.trim().toLowerCase())))
    .slice(0, 8);
  const closeAdd = () => { setAdding(false); setPickedLead(null); setPickQuery(''); };

  return (
    <div className="mx-auto max-w-3xl pb-20">
      <PageHeader
        title="Tasks"
        subtitle={`${counts.Today} today · ${counts.Upcoming} upcoming · ${counts.Overdue} overdue`}
      >
        <button type="button" onClick={() => setShowFilter((v) => !v)} className="btn-line relative">
          <Filter size={15} /> Filter
          {active > 0 && <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">{active}</span>}
        </button>
      </PageHeader>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-soft p-1">
          {[[true, 'My tasks'], [false, everyone ? 'Everyone' : 'All I can see']].map(([key, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setMine(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${mine === key ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative min-w-0 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input h-10 pl-9 text-sm" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, note" />
        </label>
      </div>

      {showFilter && (
        <div className="card mb-3 grid gap-2 p-3 sm:grid-cols-3">
          <label className="block">
            <span className="label">Assigned to</span>
            <select className="input h-10 py-0 text-sm" value={filter.assigned} onChange={setF('assigned')}>
              <option value="">Anyone</option>
              {names.map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Lead owner</span>
            <select className="input h-10 py-0 text-sm" value={filter.owner} onChange={setF('owner')}>
              <option value="">Anyone</option>
              {names.map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Task type</span>
            <select className="input h-10 py-0 text-sm" value={filter.type} onChange={setF('type')}>
              <option value="">All types</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Priority</span>
            <select className="input h-10 py-0 text-sm" value={filter.priority} onChange={setF('priority')}>
              <option value="">Any</option>
              {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Due from</span>
            <input type="date" className="input h-10 py-0 text-sm" value={filter.from} onChange={setF('from')} />
          </label>
          <label className="block">
            <span className="label">Due to</span>
            <input type="date" className="input h-10 py-0 text-sm" value={filter.to} onChange={setF('to')} />
          </label>
          <div className="flex gap-2 sm:col-span-3">
            <button type="button" className="btn-line btn-sm" onClick={() => setFilter(NO_FILTER)}>Clear</button>
            <button type="button" className="btn-action btn-sm" onClick={() => setShowFilter(false)}>Done</button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 -mx-1 mb-3 flex gap-1 overflow-x-auto border-b border-ink-900/[0.08] bg-surface-base px-1">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-bold transition ${
              group === g
                ? g === 'Overdue' ? 'border-rose-500 text-rose-600' : 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500'
            }`}
          >
            {g} ({counts[g]})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <ListChecks size={28} className="mx-auto text-ink-300" />
          <p className="mt-3 font-semibold text-ink-700">Nothing here</p>
          <p className="text-sm text-ink-500">Tap + to add a task to a lead.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((t) => {
            const lead = leadOf(t);
            const done = group === 'Done';
            const late = group === 'Overdue';
            const last = t.comments?.length ? t.comments[t.comments.length - 1] : null;
            return (
              <div key={t.id} className="card flex gap-3 p-3.5">
                <button
                  type="button"
                  title={done ? 'Done' : 'Mark done'}
                  disabled={done}
                  onClick={() => update('tasks', t.id, { status: 'Completed', bucket: 'done' }, { message: 'Task done' })}
                  className={`mt-0.5 shrink-0 self-start ${done ? 'text-emerald-600' : 'text-ink-300 hover:text-emerald-600'}`}
                >
                  {done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(t)}>
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-brand-600">{t.type || 'Task'}</span>
                    <span className={`shrink-0 text-xs font-bold ${late ? 'text-rose-600' : 'text-ink-500'}`}>{timing(t)}</span>
                  </span>
                  <span className={`mt-0.5 block truncate text-sm font-extrabold uppercase ${done ? 'text-ink-400 line-through' : 'text-ink-900'}`}>
                    {lead?.name || t.customer || t.title}
                  </span>
                  {(lead?.name || t.customer) && t.title && !t.title.includes(lead?.name || t.customer) && (
                    <span className="block truncate text-xs text-ink-600">{t.title}</span>
                  )}
                  <span className="mt-1 block text-xs text-ink-600">Owner : <b className="text-ink-800">{lead?.owner || '—'}</b></span>
                  <span className="block text-xs text-ink-600">Assigned to : <b className="text-ink-800">{t.owner || 'Nobody'}</b></span>
                  {t.note && <span className="line-clamp-2 block text-xs text-ink-600">Note : {t.note}</span>}
                  {last && (
                    <span className="mt-1 line-clamp-2 block rounded-lg bg-surface-soft px-2 py-1 text-xs text-ink-700">
                      <b>{last.by}:</b> {last.text}
                    </span>
                  )}
                  <span className="mt-1 flex flex-wrap gap-1">
                    {t.priority === 'High' && <Badge tone={priorityTone.High}>High</Badge>}
                    {t.repeat && <Badge tone="sky">Repeats {t.repeat.toLowerCase()}</Badge>}
                    {lead?.status && <Badge tone="slate">{lead.status}</Badge>}
                  </span>
                </button>

                <span className="flex shrink-0 flex-col items-center gap-2">
                  <button type="button" onClick={() => setOpen(t)} className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700" title="Edit task">
                    <Pencil size={15} />
                  </button>
                  {lead?.phone && !done && (
                    <a href={`tel:${dialable(lead.phone)}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#34C759] text-white" title={`Call ${lead.name}`}>
                      <Phone size={15} />
                    </a>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add a task to any lead */}
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lift lg:bottom-8"
        title="Add a task"
      >
        <Plus size={26} />
      </button>

      <Modal open={adding} onClose={closeAdd} title="New task" subtitle={pickedLead ? pickedLead.name : 'Pick the lead first'} size="md">
        {pickedLead ? (
          <LeadTaskForm lead={pickedLead} onDone={closeAdd} onCancel={() => setPickedLead(null)} />
        ) : (
          <div>
            <label className="relative block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input autoFocus className="input h-11 pl-9 text-sm" value={pickQuery} onChange={(e) => setPickQuery(e.target.value)} placeholder="Lead name, phone or ID" />
              {pickQuery && (
                <button type="button" onClick={() => setPickQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"><X size={15} /></button>
              )}
            </label>
            <ul className="mt-2 divide-y divide-ink-900/[0.06]">
              {pickable.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => setPickedLead(e)} className="flex w-full items-center justify-between gap-2 px-1 py-2.5 text-left">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink-900">{e.name}</span>
                      <span className="block truncate text-xs text-ink-500">{[e.phone, e.status, e.owner].filter(Boolean).join(' · ')}</span>
                    </span>
                    <Plus size={16} className="shrink-0 text-brand-600" />
                  </button>
                </li>
              ))}
              {pickQuery.trim().length >= 2 && pickable.length === 0 && <li className="py-6 text-center text-sm text-ink-500">No lead found</li>}
            </ul>
          </div>
        )}
      </Modal>

      <TaskDetails
        task={open}
        lead={open && leadOf(open)}
        onClose={() => setOpen(null)}
        onOpenLead={(lead) => { setOpen(null); navigate(`/enquiries?lead=${encodeURIComponent(lead.id)}`); }}
      />
    </div>
  );
}
