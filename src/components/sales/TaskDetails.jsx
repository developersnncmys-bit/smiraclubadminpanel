import { useState } from 'react';
import { CalendarClock, CheckCircle2, ExternalLink, Flag, MessageSquare, Phone, Send, User } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Badge from '../ui/Badge.jsx';
import { useApp } from '../../store/AppStore.jsx';
import { api, isLive } from '../../lib/api.js';
import { dialable } from '../../lib/phone.js';

/**
 * Everything about one task, on a sheet over the page: the lead it is for,
 * who has to do it, when, the note, and the comments as it goes along.
 * Mark it done, move its time, or add a comment from here.
 */
const priorityTone = { High: 'rose', Medium: 'amber', Low: 'slate' };
const pad = (n) => String(n).padStart(2, '0');
const localValue = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const longWhen = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} · ${d
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
};
const shortWhen = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });

export default function TaskDetails({ task, lead, onClose, onOpenLead }) {
  const { tasks, update, auth, toast } = useApp();
  // The live row, so a comment or a new time shows straight away.
  const t = (task && tasks.find((x) => x.id === task.id)) || task;
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [moving, setMoving] = useState(false);
  const [due, setDue] = useState('');

  if (!t) return null;
  const done = ['Completed', 'Cancelled'].includes(t.status) || t.bucket === 'done';
  const dueIso = t.dueAt || t.dueIso;
  const late = !done && dueIso && new Date(dueIso) < new Date();
  const comments = t.comments || [];

  const addComment = async (e) => {
    e.preventDefault();
    const text = comment.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      if (isLive && t._id) await api.post(`/tasks/${t._id}/comments`, { text });
      update('tasks', t.id, { comments: [...comments, { text, by: auth?.name || 'You', at: new Date().toISOString() }] }, { silent: true });
      setComment('');
    } catch (err) {
      toast(err.message || 'The comment did not save', 'danger');
    } finally {
      setSending(false);
    }
  };

  const saveTime = () => {
    if (!due) return;
    const at = new Date(due);
    update('tasks', t.id, {
      dueIso: at.toISOString(),
      dueAt: at.toISOString(),
      due: at.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      bucket: at < new Date() ? 'overdue' : 'today',
      ...(t.status === 'Overdue' ? { status: 'Pending' } : {}),
    }, { message: 'Task time changed' });
    setMoving(false);
  };

  const row = (Icon, label, value) => (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={17} className="mt-0.5 shrink-0 text-ink-400" />
      <span className="w-24 shrink-0 text-sm text-ink-500">{label}</span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );

  return (
    <Modal
      open={Boolean(task)}
      onClose={onClose}
      title={t.title}
      subtitle={[t.type, t.customer].filter(Boolean).join(' · ')}
      size="md"
      footer={
        <>
          {!done && (
            <button
              type="button"
              className="btn-action"
              onClick={() => { update('tasks', t.id, { status: 'Completed', bucket: 'done' }, { message: 'Task done' }); onClose(); }}
            >
              <CheckCircle2 size={16} /> Mark done
            </button>
          )}
          {lead && onOpenLead && (
            <button type="button" className="btn-line" onClick={() => onOpenLead(lead)}>
              <ExternalLink size={15} /> Open lead
            </button>
          )}
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge tone={done ? 'green' : late ? 'rose' : 'sky'} dot>{done ? 'Done' : late ? 'Overdue' : t.status || 'Pending'}</Badge>
        {t.priority && <Badge tone={priorityTone[t.priority] || 'slate'}>{t.priority} priority</Badge>}
      </div>

      <div className="divide-y divide-ink-900/[0.06] rounded-xl border border-ink-900/10 px-3">
        {row(User, 'Assigned to', t.owner || 'Nobody yet')}
        {row(CalendarClock, 'Due', (
          <>
            <span className={late ? 'text-rose-600' : ''}>{longWhen(dueIso)}</span>
            {!done && !moving && (
              <button type="button" className="ml-2 text-xs font-bold text-brand-700 underline" onClick={() => { setDue(localValue(dueIso) || ''); setMoving(true); }}>
                Change
              </button>
            )}
            {moving && (
              <span className="mt-2 flex gap-2">
                <input type="datetime-local" className="input h-10 min-w-0 flex-1 py-0 text-sm" value={due} onChange={(e) => setDue(e.target.value)} />
                <button type="button" className="btn-action btn-sm" onClick={saveTime}>Save</button>
              </span>
            )}
          </>
        ))}
        {lead && row(Flag, 'Lead', (
          <span className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate">{lead.name}{lead.status ? ` · ${lead.status}` : ''}</span>
            {lead.phone && !done && (
              <a href={`tel:${dialable(lead.phone)}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#34C759] text-white" title={`Call ${lead.name}`}>
                <Phone size={16} />
              </a>
            )}
          </span>
        ))}
        {t.createdBy && row(User, 'Added by', t.createdBy)}
      </div>

      <div className="mt-4">
        <p className="eyebrow mb-1.5">Note</p>
        <p className="whitespace-pre-wrap rounded-xl bg-surface-soft/70 px-3 py-2.5 text-sm text-ink-700">{t.note || 'No note'}</p>
      </div>

      <div className="mt-4">
        <p className="eyebrow mb-1.5 flex items-center gap-1.5"><MessageSquare size={13} /> Comments {comments.length > 0 && `(${comments.length})`}</p>
        {comments.length === 0 && <p className="text-sm text-ink-500">No comments yet.</p>}
        <ul className="space-y-2">
          {comments.map((c, i) => (
            <li key={i} className="rounded-xl bg-surface-soft/70 px-3 py-2">
              <p className="whitespace-pre-wrap text-sm text-ink-800">{c.text}</p>
              <p className="mt-0.5 text-xs text-ink-400">{c.by || '—'}{c.at ? ` · ${shortWhen(c.at)}` : ''}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={addComment} className="mt-2 flex gap-2">
          <input
            className="input h-10 min-w-0 flex-1 py-0 text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Called, no answer — try 5 pm"
          />
          <button type="submit" disabled={!comment.trim() || sending} className="btn-action btn-sm shrink-0 disabled:opacity-50" title="Add comment">
            <Send size={15} />
          </button>
        </form>
      </div>
    </Modal>
  );
}
