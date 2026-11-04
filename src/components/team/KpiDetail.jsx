import Modal from '../ui/Modal.jsx';
import Avatar from '../ui/Avatar.jsx';
import Badge from '../ui/Badge.jsx';
import { inr } from '../../data/mockData.js';

/**
 * What is behind one of Team Status's numbers: the same figure for each
 * person, most first, so "Calls 42" becomes who made them. Tasks also lists
 * the open tasks themselves, overdue first.
 */
const n = (v) => Number(v || 0);
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');

const METRICS = {
  Tasks: {
    note: 'Done out of the tasks due, and how many are late',
    cols: ['Done', 'Total', 'Overdue'],
    row: (m) => [n(m.tasksDone), n(m.tasksTotal), n(m.taskDetail?.overdue)],
    sort: (m) => n(m.tasksTotal),
  },
  Calls: {
    note: 'Calls made and how many got through',
    cols: ['Calls', 'Connected', 'Rate'],
    row: (m) => [n(m.calls), n(m.callDetail?.connected), pct(n(m.callDetail?.connected), n(m.calls))],
    sort: (m) => n(m.calls),
  },
  'Follow-ups': {
    note: 'Follow-ups done out of those due, and how many are late',
    cols: ['Done', 'Due', 'Overdue'],
    row: (m) => [n(m.followUpDetail?.completed), n(m.followUpDetail?.due), n(m.followUpDetail?.overdue)],
    sort: (m) => n(m.followUpDetail?.due),
  },
  Presentations: {
    note: 'Presentations given and how many turned into a sale',
    cols: ['Given', 'Converted', 'Rate'],
    row: (m) => [n(m.presentationDetail?.completed), n(m.presentationDetail?.converted), pct(n(m.presentationDetail?.converted), n(m.presentationDetail?.completed))],
    sort: (m) => n(m.presentationDetail?.completed),
  },
  Closings: {
    note: 'Bookings closed and customer visits completed',
    cols: ['Closings', 'Visits'],
    row: (m) => [n(m.bookings), n(m.visitDetail?.completed)],
    sort: (m) => n(m.bookings),
  },
  Revenue: {
    note: 'Revenue against each person’s target',
    cols: ['Revenue', 'Target', 'Done'],
    row: (m) => [inr(n(m.revenue)), inr(n(m.target)), pct(n(m.revenue), n(m.target))],
    sort: (m) => n(m.revenue),
  },
};

export default function KpiDetail({ metric, team = [], tasks = [], onClose, onOpenMember }) {
  const def = METRICS[metric];
  if (!def) return null;
  const people = [...team].sort((a, b) => def.sort(b) - def.sort(a));

  // For Tasks: the open ones, late first.
  const open = metric === 'Tasks'
    ? tasks
      .filter((t) => !['Completed', 'Cancelled'].includes(t.status))
      .sort((a, b) => new Date(a.dueAt || 8.64e15) - new Date(b.dueAt || 8.64e15))
      .slice(0, 50)
    : [];

  return (
    <Modal open={Boolean(metric)} onClose={onClose} title={metric} subtitle={def.note} size="md">
      <div className="overflow-hidden rounded-xl border border-ink-900/10">
        <div className="grid items-center gap-2 bg-surface-soft px-3 py-2 text-[11px] font-bold uppercase text-ink-500" style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${def.cols.length}, 4.5rem)` }}>
          <span>Team member</span>
          {def.cols.map((c) => <span key={c} className="text-right">{c}</span>)}
        </div>
        {people.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-500">No team members yet</p>}
        {people.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onOpenMember?.(m)}
            className="grid w-full items-center gap-2 border-t border-ink-900/[0.06] px-3 py-2.5 text-left text-sm hover:bg-surface-soft/60"
            style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${def.cols.length}, 4.5rem)` }}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Avatar name={m.name} size="sm" />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink-900">{m.name}</span>
                <span className="block truncate text-xs text-ink-400">{m.role}</span>
              </span>
            </span>
            {def.row(m).map((v, i) => (
              <span key={i} className="num truncate text-right font-semibold text-ink-800">{v}</span>
            ))}
          </button>
        ))}
      </div>

      {open.length > 0 && (
        <div className="mt-5">
          <p className="eyebrow mb-2">Open tasks</p>
          <div className="divide-y divide-ink-900/[0.06] overflow-hidden rounded-xl border border-ink-900/10">
            {open.map((t) => {
              const late = t.dueAt && new Date(t.dueAt) < new Date();
              return (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">{t.title}</span>
                    <span className="block truncate text-xs text-ink-500">{t.due} · {t.owner || '—'}</span>
                  </span>
                  {late && <Badge tone="rose">Overdue</Badge>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
