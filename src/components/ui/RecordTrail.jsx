import { useState } from 'react';
import {
  Plus, Phone, MessageCircle, Mail, StickyNote, CalendarClock, ClipboardPlus, ArrowDownUp,
} from 'lucide-react';
import Badge from './Badge.jsx';
import DrawerTabs from './DrawerTabs.jsx';
import { useApp } from '../../store/AppStore.jsx';

/** What an entry can be, and how it reads back. */
const KINDS = [
  { key: 'note', label: 'Note', icon: StickyNote, tone: 'slate' },
  { key: 'call', label: 'Call', icon: Phone, tone: 'sky' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, tone: 'green' },
  { key: 'email', label: 'Email', icon: Mail, tone: 'sky' },
  { key: 'meeting', label: 'Meeting', icon: CalendarClock, tone: 'violet' },
  { key: 'status', label: 'Status', icon: ArrowDownUp, tone: 'amber' },
];
const kindOf = (k) => KINDS.find((x) => x.key === k) || KINDS[0];

/**
 * Everything that has happened to one record — activities, its tasks and the
 * notes on it — with a way to add to it. The lead panel worked this way; every
 * other record now gets the same, writing to the same activity trail.
 *
 * id     the record's own id, which the trail is keyed by
 * name   who or what it is, used in the logged text
 * tasks  the tasks that belong to it, if the page can work them out
 * info   whatever the record wants to show under Info
 */
export default function RecordTrail({ id, name, tasks = [], info = null, onCreateTask }) {
  const { activities, logActivity, toast } = useApp();
  const [tab, setTab] = useState('Activities');
  const [newest, setNewest] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [kind, setKind] = useState('note');

  const trail = activities.filter((a) => a.lead === id);
  const ordered = newest ? [...trail].reverse() : trail;
  const notes = trail.filter((a) => a.kind === 'note');

  const add = () => {
    if (!draft.trim()) return;
    logActivity(id, draft.trim(), kind);
    setDraft('');
    setKind('note');
    setAdding(false);
    toast('Activity added');
  };

  const tabs = [
    { key: 'Activities', count: trail.length },
    { key: 'Tasks', count: tasks.length },
    { key: 'Notes', count: notes.length },
    ...(info ? [{ key: 'Info', count: null }] : []),
  ];

  return (
    <section className="card flex min-h-0 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-900/[0.07] pr-3">
        <DrawerTabs items={tabs} value={tab} onChange={setTab} />
        <button className="btn-action btn-sm" onClick={() => setAdding((v) => !v)}>
          <Plus size={13} /> Add activity
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {adding && (
          <div className="mb-4 rounded-xl border border-ink-900/[0.07] p-3.5">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className={`chip border ${
                    kind === k.key
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-ink-900/10 bg-white text-ink-600 hover:text-ink-900'
                  }`}
                >
                  <k.icon size={12} /> {k.label}
                </button>
              ))}
            </div>
            <textarea
              className="input min-h-[80px]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`What happened with ${name || 'this record'}?`}
            />
            <div className="mt-2 flex items-center gap-2">
              <button className="btn-action btn-sm" disabled={!draft.trim()} onClick={add}>
                Save
              </button>
              <button className="btn-line btn-sm" onClick={() => { setAdding(false); setDraft(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {tab === 'Activities' && (
          <>
            <button
              className="chip mb-3 border border-ink-900/10 bg-white text-ink-600 hover:text-ink-900"
              onClick={() => setNewest((v) => !v)}
            >
              <ArrowDownUp size={12} /> {newest ? 'Newest first' : 'Oldest first'}
            </button>
            <ol className="relative space-y-0 border-l border-ink-900/10 pl-5">
              {ordered.map((a) => {
                const k = kindOf(a.kind);
                return (
                  <li key={a.id} className="relative pb-4 last:pb-0">
                    <span className="absolute -left-[25px] top-1 grid h-3 w-3 place-items-center rounded-full border-2 border-white bg-brand-500" />
                    <p className="text-sm font-semibold text-ink-800">{a.text}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-400">
                      <Badge tone={k.tone}>{k.label}</Badge>
                      <span className="num">{a.at}</span>
                      <span>· {a.who}</span>
                    </p>
                  </li>
                );
              })}
              {ordered.length === 0 && (
                <li className="py-10 text-center text-sm text-ink-500">Nothing has happened here yet.</li>
              )}
            </ol>
          </>
        )}

        {tab === 'Tasks' && (
          <>
            <ul className="divide-y divide-ink-900/[0.07]">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">{t.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-500">
                      {t.type} · {t.owner} · due {t.due}
                    </p>
                  </div>
                  <Badge tone={t.bucket === 'overdue' ? 'rose' : t.bucket === 'done' ? 'green' : 'sky'} dot>
                    {t.status || t.bucket}
                  </Badge>
                </li>
              ))}
              {tasks.length === 0 && (
                <li className="py-10 text-center text-sm text-ink-500">No tasks on this record.</li>
              )}
            </ul>
            {onCreateTask && (
              <button className="btn-line btn-sm mt-3" onClick={onCreateTask}>
                <ClipboardPlus size={13} /> Create a task
              </button>
            )}
          </>
        )}

        {tab === 'Notes' && (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-surface-soft px-4 py-3">
                <p className="text-sm text-ink-800">{n.text}</p>
                <p className="mt-1 text-xs text-ink-400">
                  <span className="num">{n.at}</span> · {n.who}
                </p>
              </li>
            ))}
            {notes.length === 0 && (
              <li className="py-10 text-center text-sm text-ink-500">No notes yet.</li>
            )}
          </ul>
        )}

        {tab === 'Info' && info}
      </div>
    </section>
  );
}
