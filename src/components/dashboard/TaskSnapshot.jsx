import { Link, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle2, CalendarDays } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useApp } from '../../store/AppStore.jsx';

const buckets = [
  { key: 'today', label: 'Today', icon: Clock, tone: 'text-brand-700 bg-brand-50' },
  { key: 'upcoming', label: 'Upcoming', icon: CalendarDays, tone: 'text-sky-700 bg-sky-50' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, tone: 'text-rose-700 bg-rose-50' },
  { key: 'done', label: 'Done', icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50' },
];

export default function TaskSnapshot() {
  const { tasks, update } = useApp();
  const navigate = useNavigate();

  const priority = tasks.filter((t) => t.bucket === 'overdue' || t.bucket === 'today').slice(0, 4);

  return (
    <Card
      title="Task board"
      subtitle="What the team owes customers right now"
      action={
        <Link to="/tasks" className="text-sm font-semibold text-brand-700 hover:underline">
          Open tasks
        </Link>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {buckets.map(({ key, label, icon: Icon, tone }) => (
          <button
            key={key}
            onClick={() => navigate('/tasks')}
            className="rounded-xl border border-ink-900/5 p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
          >
            <span className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ${tone}`}>
              <Icon size={16} strokeWidth={2.3} />
            </span>
            <p className="font-display text-xl font-extrabold">
              {tasks.filter((t) => t.bucket === key).length}
            </p>
            <p className="text-xs font-semibold text-ink-500">{label}</p>
          </button>
        ))}
      </div>

      <ul className="space-y-2.5">
        {priority.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-xl border border-ink-900/5 p-3 transition hover:border-brand-300 hover:bg-brand-50/40"
          >
            <input
              type="checkbox"
              checked={false}
              onChange={() =>
                update('tasks', t.id, { bucket: 'done', prevBucket: t.bucket }, { message: `“${t.title}” completed` })
              }
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-ink-900/20 accent-brand-600"
            />
            <span
              className={`h-9 w-1 shrink-0 rounded-full ${
                t.bucket === 'overdue' ? 'bg-rose-500' : 'bg-brand-500'
              }`}
            />
            <button onClick={() => navigate('/tasks')} className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-bold text-ink-900">{t.title}</p>
              <p className="truncate text-xs text-ink-500">
                {t.customer} · due {t.due}
              </p>
            </button>
            <Avatar name={t.owner} size="sm" />
          </li>
        ))}

        {priority.length === 0 && (
          <li className="rounded-xl border border-dashed border-ink-900/10 py-6 text-center text-sm text-ink-500">
            Nothing due today — nice work
          </li>
        )}
      </ul>
    </Card>
  );
}
