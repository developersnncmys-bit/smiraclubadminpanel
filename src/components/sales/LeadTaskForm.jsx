import { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import { useApp } from '../../store/AppStore.jsx';

/** What a task can be — the server's own list. */
const TYPES = ['Call', 'Follow-up', 'WhatsApp', 'Presentation', 'Customer Visit', 'Payment Follow-up', 'Booking Follow-up', 'Send itinerary', 'Documents'];

/** Tomorrow at 11 am, as a datetime-local value — a sensible first guess. */
const tomorrow11 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(11, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  const { team, create } = useApp();
  // The lead's own owner first, then everybody else.
  const people = [...new Set([lead.owner, ...team.map((t) => t.name)].filter((n) => n && n !== 'Unassigned'))];
  const [form, setForm] = useState({
    type: 'Follow-up',
    title: '',
    due: tomorrow11(),
    owner: people[0] || '',
    priority: 'Medium',
    note: '',
  });
  const [error, setError] = useState('');
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(''); };

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
      bucket: new Date(form.due) < new Date() ? 'overdue' : new Date(form.due).toDateString() === new Date().toDateString() ? 'today' : 'upcoming',
    });
    onDone?.();
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
        </label>
        <label className="block sm:col-span-2">
          <span className="label">What to do</span>
          <input className={input} value={form.title} onChange={set('title')} placeholder={`e.g. Call ${lead.name.split(' ')[0]} about the Goa quote`} />
        </label>
        <label className="block">
          <span className="label">Assign to</span>
          <select className={input} value={form.owner} onChange={set('owner')}>
            {people.length === 0 && <option value="">No team members yet</option>}
            {people.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Priority</span>
          <select className={input} value={form.priority} onChange={set('priority')}>
            {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="label">Note (optional)</span>
          <input className={input} value={form.note} onChange={set('note')} placeholder="Anything they should know" />
        </label>
      </div>

      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-action btn-sm">Add task</button>
        <button type="button" className="btn-line btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
