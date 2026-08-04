import { useState } from 'react';
import {
  Clock,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Filter,
  Pencil,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';

const buckets = [
  { key: 'today', label: 'Today', icon: Clock },
  { key: 'upcoming', label: 'Upcoming', icon: CalendarDays },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'done', label: 'Done', icon: CheckCircle2 },
];

const TYPES = ['Call', 'Send itinerary', 'Send quote', 'Documents', 'Payment', 'Visa', 'Supplier'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const priorityTone = { High: 'rose', Medium: 'amber', Low: 'slate' };

export default function Tasks() {
  const { tasks, team, owner, create, update, remove, toast } = useApp();
  const [bucket, setBucket] = useState('today');
  const [priority, setPriority] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const consultants = team.map((t) => t.name.split(' ')[0]);
  const scoped = byOwner(tasks, owner);
  const list = scoped.filter((t) => t.bucket === bucket && (!priority || t.priority === priority));

  const fields = [
    { name: 'title', label: 'Task', type: 'text', required: true, full: true },
    { name: 'customer', label: 'Customer', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', options: TYPES },
    { name: 'due', label: 'Due', type: 'text', required: true, placeholder: '05 Aug 2026, 10:00 am' },
    { name: 'owner', label: 'Owner', type: 'select', options: consultants },
    { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES },
    { name: 'bucket', label: 'Bucket', type: 'select', options: ['today', 'upcoming', 'overdue', 'done'] },
    { name: 'note', label: 'Note', type: 'textarea', full: true },
  ];

  const save = (values) => {
    if (editing) update('tasks', editing.id, values);
    else create('tasks', values);
  };

  const toggleDone = (t) => {
    if (t.bucket === 'done') {
      update('tasks', t.id, { bucket: t.prevBucket || 'today' }, { message: 'Task reopened' });
    } else {
      update('tasks', t.id, { bucket: 'done', prevBucket: t.bucket }, { message: `“${t.title}” completed` });
    }
  };

  return (
    <>
      <PageHeader title="Tasks" subtitle="Follow-ups, documents and supplier confirmations">
        <button
          className={`btn ${showFilter || priority ? 'bg-brand-50 text-brand-700' : 'btn-ghost'}`}
          onClick={() => setShowFilter((s) => !s)}
        >
          <Filter size={16} /> Filter
          {priority && <span className="rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">1</span>}
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Add task
        </button>
      </PageHeader>

      <div className="card overflow-hidden">
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-ink-900/5 p-4">
          {buckets.map(({ key, label, icon: Icon }) => {
            const n = scoped.filter((t) => t.bucket === key).length;
            const on = bucket === key;
            return (
              <button
                key={key}
                onClick={() => setBucket(key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  on
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'border border-ink-900/10 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
                }`}
              >
                <Icon size={16} strokeWidth={2.3} />
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                    on ? 'bg-white/20' : 'bg-ink-900/5 text-ink-600'
                  }`}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        {showFilter && (
          <div className="flex flex-wrap items-center gap-2 border-b border-ink-900/5 bg-surface-soft/60 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-500">Priority</span>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority((c) => (c === p ? '' : p))}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  priority === p
                    ? 'bg-brand-600 text-white'
                    : 'border border-ink-900/10 bg-white text-ink-600 hover:border-brand-300'
                }`}
              >
                {p}
              </button>
            ))}
            {priority && (
              <button
                onClick={() => setPriority('')}
                className="text-xs font-semibold text-ink-500 underline underline-offset-2"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="divide-y divide-ink-900/5">
          {list.map((t) => (
            <div key={t.id} className="flex flex-wrap items-start gap-4 p-5 transition hover:bg-brand-50/40">
              <input
                type="checkbox"
                checked={t.bucket === 'done'}
                onChange={() => toggleDone(t)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-ink-900/20 accent-brand-600"
              />

              <div className="min-w-[220px] flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-bold ${
                      t.bucket === 'done' ? 'text-ink-400 line-through' : 'text-ink-900'
                    }`}
                  >
                    {t.title}
                  </p>
                  <button
                    onClick={() => {
                      setEditing(t);
                      setFormOpen(true);
                    }}
                    title="Open task"
                    className="grid h-6 w-6 place-items-center rounded-md border border-ink-900/10 text-ink-400 transition hover:text-brand-700"
                  >
                    <ArrowUpRight size={13} />
                  </button>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-brand-700">{t.customer}</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">{t.note}</p>
              </div>

              <div className="min-w-[150px]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Due</p>
                <p className={`text-sm font-semibold ${t.bucket === 'overdue' ? 'text-rose-600' : 'text-ink-800'}`}>
                  {t.due}
                </p>
              </div>

              <div className="min-w-[120px]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Type</p>
                <Badge tone="teal" className="mt-1">{t.type}</Badge>
              </div>

              <div className="min-w-[100px]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Priority</p>
                <Badge tone={priorityTone[t.priority]} className="mt-1">{t.priority}</Badge>
              </div>

              <div className="flex min-w-[130px] items-center gap-2">
                <Avatar name={t.owner} size="sm" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Owner</p>
                  <p className="text-sm font-semibold text-ink-800">{t.owner}</p>
                </div>
              </div>

              <RowMenu
                items={[
                  { label: 'Edit task', icon: Pencil, onClick: () => { setEditing(t); setFormOpen(true); } },
                  {
                    label: t.bucket === 'done' ? 'Reopen' : 'Mark done',
                    icon: CheckCircle2,
                    onClick: () => toggleDone(t),
                  },
                  { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm(t) },
                ]}
              />
            </div>
          ))}

          {list.length === 0 && (
            <div className="p-16 text-center">
              <CheckCircle2 size={30} className="mx-auto mb-3 text-ink-400" />
              <p className="text-sm font-semibold text-ink-600">Nothing in this bucket</p>
              <button
                className="btn-soft mx-auto mt-4"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={15} /> Add a task
              </button>
            </div>
          )}
        </div>
      </div>

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.id}` : 'Add task'}
        subtitle={editing ? editing.title : 'Schedule a follow-up for the team'}
        fields={fields}
        initial={editing || { bucket, priority: 'Medium', type: 'Call', owner: consultants[1] || consultants[0] }}
        submitLabel={editing ? 'Save changes' : 'Create task'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('tasks', confirm.id)}
        title="Delete task?"
        message={`“${confirm?.title}” will be removed from the board.`}
      />
    </>
  );
}
