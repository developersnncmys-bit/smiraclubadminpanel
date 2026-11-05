import { useRef, useState } from 'react';
import { CalendarPlus, Check, User, X } from 'lucide-react';
import { useApp } from '../../store/AppStore.jsx';

/** What a task can be — the server's own list. */
const TYPES = ['Call', 'Follow-up', 'WhatsApp', 'Presentation', 'Customer Visit', 'Payment Follow-up', 'Booking Follow-up', 'Send itinerary', 'Documents'];

const pad = (n) => String(n).padStart(2, '0');
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Tomorrow at 11 am, as a datetime-local value — a sensible first guess. */
const tomorrow11 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${isoDay(d)}T11:00`;
};

/**
 * The next fortnight as one-tap days. A customer says "call me Saturday",
 * not "call me on the 7th", so the days are named.
 */
const nextDays = () =>
  Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: isoDay(d),
      name: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      weekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

/** "Saturday, 7 Nov 2026 · 11:00 am" for what is picked. */
const spell = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} · ${d
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
};

/**
 * Adding a task to one lead: what to do, when, and who does it.
 *
 * The lead's Tasks tab could only list tasks; there was no way to add one
 * from the lead, so a follow-up lived in somebody's head. The task is filed
 * against this lead and its person, lands in their Today or Overdue list by
 * its due time, and shows here.
 */
export default function LeadTaskForm({ lead, onDone, onCancel }) {
  const { team, create, auth } = useApp();
  // The lead's own person — the one the task goes to unless changed.
  const leadPerson = lead.owner && lead.owner !== 'Unassigned'
    ? team.find((t) => t.name === lead.owner || t.name.split(' ')[0] === lead.owner)?.name || lead.owner
    : '';
  const people = [...new Set([leadPerson, ...team.map((t) => t.name)].filter(Boolean))];
  const [form, setForm] = useState({
    type: 'Follow-up',
    title: '',
    due: tomorrow11(),
    owner: people[0] || '',
    priority: 'Medium',
    note: '',
  });
  const [error, setError] = useState('');
  // Tasks added in this go, so several can be set one after another.
  const [added, setAdded] = useState([]);
  const another = useRef(false);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(''); };
  // A day button keeps the time already chosen.
  const pickDay = (iso) => setForm((f) => ({ ...f, due: `${iso}T${f.due.split('T')[1] || '11:00'}` }));
  const days = nextDays();

  const save = (e) => {
    e.preventDefault();
    const title = form.title.trim() || `${form.type} — ${lead.name}`;
    if (!form.due) return setError('When is it due?');
    if (!form.owner) return setError('Who should do it?');
    const member = team.find((t) => t.name === form.owner || t.name.split(' ')[0] === form.owner);
    create('tasks', {
      title,
      type: form.type,
      customer: lead.name,
      leadId: lead._id,
      owner: member?.name || form.owner,
      ownerId: member?._id,
      // Readable on screen straight away; the exact moment goes to the server.
      due: new Date(form.due).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      dueIso: new Date(form.due).toISOString(),
      priority: form.priority,
      status: 'Pending',
      note: form.note.trim() || undefined,
      createdBy: auth?.name,
      bucket: new Date(form.due) < new Date() ? 'overdue' : new Date(form.due).toDateString() === new Date().toDateString() ? 'today' : 'upcoming',
    });
    setAdded((a) => [...a, `${title} · ${form.owner} · ${spell(form.due)}`]);
    if (another.current) {
      // Keep who and the type; clear what to do, and suggest a day later.
      const next = new Date(form.due);
      next.setDate(next.getDate() + 1);
      setForm((f) => ({ ...f, title: '', note: '', due: `${isoDay(next)}T${f.due.split('T')[1] || '11:00'}` }));
      another.current = false;
    } else {
      onDone?.();
    }
    return undefined;
  };

  const input = 'input h-10 py-0 text-sm';
  return (
    <form onSubmit={save} className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/40 p-3.5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
          <CalendarPlus size={16} className="text-brand-600" /> New task for {lead.name}
        </p>
        <button type="button" onClick={onCancel} className="text-ink-400 hover:text-ink-700" aria-label="Cancel">
          <X size={16} />
        </button>
      </div>

      {added.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-emerald-50 px-3 py-2">
          {added.map((a, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs font-semibold text-emerald-800">
              <Check size={13} className="mt-0.5 shrink-0" /> {a}
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="label">Task</span>
          <select className={input} value={form.type} onChange={set('type')}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Due</span>
          <input type="datetime-local" className={input} value={form.due} onChange={set('due')} />
          {form.due && <span className="mt-1 block text-xs font-semibold text-brand-700">{spell(form.due)}</span>}
        </label>
        <div className="sm:col-span-2">
          <span className="label">Pick a day</span>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {days.map((d) => {
              const on = form.due.startsWith(d.iso);
              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => pickDay(d.iso)}
                  className={`flex shrink-0 flex-col items-center rounded-lg border px-2.5 py-1.5 text-xs leading-tight transition ${
                    on
                      ? 'border-brand-500 bg-brand-600 text-white'
                      : d.weekend
                        ? 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400'
                        : 'border-ink-900/10 bg-white text-ink-700 hover:border-brand-300'
                  }`}
                >
                  <span className="font-bold">{d.name}</span>
                  <span className={on ? 'text-white/80' : 'text-ink-400'}>{d.date}</span>
                </button>
              );
            })}
          </div>
        </div>
        <label className="block sm:col-span-2">
          <span className="label">What to do</span>
          <input className={input} value={form.title} onChange={set('title')} placeholder={`e.g. Call ${lead.name.split(' ')[0]} about the Goa quote`} />
        </label>
        <label className="block">
          <span className="label">Assign to</span>
          <select className={input} value={form.owner} onChange={set('owner')}>
            {people.length === 0 && <option value="">No team members yet</option>}
            {people.map((n) => <option key={n} value={n}>{n === leadPerson ? `${n} (lead's person)` : n}</option>)}
          </select>
          <span className={`mt-1 flex items-center gap-1 text-xs font-semibold ${form.owner === leadPerson ? 'text-emerald-700' : 'text-amber-700'}`}>
            <User size={12} />
            {!leadPerson
              ? 'This lead has nobody yet'
              : form.owner === leadPerson
                ? `Goes to ${leadPerson.split(' ')[0]}, who has this lead`
                : `Lead is with ${leadPerson.split(' ')[0]} — this task goes to ${form.owner.split(' ')[0]}`}
          </span>
        </label>
        <label className="block">
          <span className="label">Priority</span>
          <select className={input} value={form.priority} onChange={set('priority')}>
            {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="label">Note (optional)</span>
          <textarea className="input min-h-[4.5rem] py-2 text-sm" value={form.note} onChange={set('note')} placeholder="Anything they should know — what the customer said, what to offer" />
        </label>
      </div>

      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-action btn-sm flex-1 sm:flex-none" onClick={() => { another.current = false; }}>Add task</button>
        <button type="submit" className="btn-line btn-sm flex-1 sm:flex-none" onClick={() => { another.current = true; }}>Add &amp; add another</button>
        <button type="button" className="btn-ghost btn-sm" onClick={onCancel}>{added.length ? 'Close' : 'Cancel'}</button>
      </div>
    </form>
  );
}
