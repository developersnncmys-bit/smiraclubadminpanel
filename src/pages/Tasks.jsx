import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ListChecks, Phone } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useApp } from '../store/AppStore.jsx';
import { dialable } from '../lib/phone.js';

/**
 * Tasks: the follow-ups set on leads, by when they are due.
 *
 * Overdue first, then today, then what is coming; tick one off when it is
 * done. Tap a task to open its lead.
 */
const GROUPS = ['Overdue', 'Today', 'Upcoming', 'Done'];
const priorityTone = { High: 'rose', Medium: 'amber', Low: 'slate' };

function groupOf(t) {
  if (['Completed', 'Cancelled'].includes(t.status)) return 'Done';
  const at = new Date(t.dueAt || t.dueIso || '').getTime();
  if (!at) return 'Upcoming';
  const end = new Date().setHours(23, 59, 59, 999);
  if (at < Date.now()) return 'Overdue';
  return at <= end ? 'Today' : 'Upcoming';
}

export default function Tasks() {
  const { tasks, enquiries, auth, update } = useApp();
  const navigate = useNavigate();
  const [mine, setMine] = useState(true);
  const [group, setGroup] = useState('Today');

  const me = String(auth?.name || '').toLowerCase();
  const isMine = (t) =>
    (auth?.id && String(t.ownerId) === String(auth.id)) ||
    String(t.owner || '').toLowerCase() === me ||
    (me && String(t.owner || '').toLowerCase() === me.split(' ')[0]);
  const list = tasks.filter((t) => !mine || isMine(t));
  const counts = Object.fromEntries(GROUPS.map((g) => [g, list.filter((t) => groupOf(t) === g).length]));
  const shown = list
    .filter((t) => groupOf(t) === group)
    .sort((a, b) => (new Date(a.dueAt || 0) - new Date(b.dueAt || 0)) * (group === 'Done' ? -1 : 1))
    .slice(0, 300);

  const leadOf = (t) => enquiries.find((e) => (t.lead && e._id === t.lead) || e.name === t.customer);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Tasks" subtitle={`${counts.Overdue} overdue · ${counts.Today} today · ${counts.Upcoming} coming up`} />

      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-surface-soft p-1 sm:w-64">
        {[[true, 'My tasks'], [false, 'Everyone']].map(([key, label]) => (
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

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-bold transition ${
              group === g
                ? g === 'Overdue' ? 'border-rose-500 bg-rose-500 text-white' : 'border-brand-600 bg-brand-600 text-white'
                : 'border-ink-900/10 bg-white text-ink-600'
            }`}
          >
            {g} <span className="opacity-80">{counts[g]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <ListChecks size={28} className="mx-auto text-ink-300" />
          <p className="mt-3 font-semibold text-ink-700">Nothing here</p>
          <p className="text-sm text-ink-500">Add a task from a lead: open it → Tasks → Add task.</p>
        </div>
      ) : (
        <div className="card divide-y divide-ink-900/[0.06] overflow-hidden">
          {shown.map((t) => {
            const lead = leadOf(t);
            const done = group === 'Done';
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  title={done ? 'Done' : 'Mark done'}
                  disabled={done}
                  onClick={() => update('tasks', t.id, { status: 'Completed' }, { message: 'Task done' })}
                  className={done ? 'text-emerald-600' : 'text-ink-300 hover:text-emerald-600'}
                >
                  {done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => lead && navigate(`/enquiries?lead=${encodeURIComponent(lead.id)}`)}
                >
                  <span className={`block truncate font-semibold ${done ? 'text-ink-400 line-through' : 'text-ink-900'}`}>{t.title}</span>
                  <span className="block truncate text-xs text-ink-500">
                    {t.due}
                    {t.type && ` · ${t.type}`}
                    {!mine && t.owner && ` · ${t.owner}`}
                  </span>
                </button>
                {t.priority && <Badge tone={priorityTone[t.priority] || 'slate'}>{t.priority}</Badge>}
                {lead?.phone && !done && (
                  <a
                    href={`tel:${dialable(lead.phone)}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#34C759] text-white"
                    title={`Call ${lead.name}`}
                  >
                    <Phone size={17} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
