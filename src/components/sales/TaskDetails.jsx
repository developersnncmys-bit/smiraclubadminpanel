import { useEffect, useState } from 'react';
import { ExternalLink, Phone, Repeat } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Badge from '../ui/Badge.jsx';
import { useApp } from '../../store/AppStore.jsx';
import { api, isLive } from '../../lib/api.js';
import { dialable } from '../../lib/phone.js';
import { REPEATS, TYPES } from './LeadTaskForm.jsx';
import { useLeadStages } from '../../lib/leadStages.js';

/**
 * Edit Task: one task on a sheet over the page.
 *
 * Its type, day and time, whether it repeats, who does it, a new note and
 * "mark as completed" — then Save. Notes written here are kept under
 * Previous notes with who wrote them and when, so whoever picks the task up
 * next sees "Ringing", "Call me back" and the rest.
 */
const pad = (n) => String(n).padStart(2, '0');
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return isoDay(d); };
const noteDay = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const noteTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
const spell = (day, time) => {
  const d = new Date(`${day}T${time || '00:00'}`);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} · ${d
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
};

export default function TaskDetails({ task, lead, onClose, onOpenLead }) {
  const { tasks, team, enquiries, update, auth, toast, pull, logActivity } = useApp();
  const stages = useLeadStages();
  // The live row, so a saved note shows straight away.
  const t = (task && tasks.find((x) => x.id === task.id)) || task;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!task) return;
    const at = new Date(task.dueAt || task.dueIso || Date.now());
    const day = isoDay(at);
    setForm({
      type: task.type || 'Follow-up',
      when: day === plusDays(0) ? 'Today' : day === plusDays(1) ? 'Tomorrow' : 'Custom',
      day,
      time: hhmm(at),
      repeat: task.repeat || '',
      owner: task.owner || '',
      note: '',
      leadStatus: lead?.status || '',
      done: ['Completed', 'Cancelled'].includes(task.status) || task.bucket === 'done',
    });
  }, [task]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!t || !form) return null;
  const wasDone = ['Completed', 'Cancelled'].includes(t.status) || t.bucket === 'done';
  const notes = [...(t.comments || [])].reverse();
  const people = [...new Set([t.owner, ...team.map((m) => m.name)].filter((n) => n && n !== 'Unassigned'))];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const pickWhen = (e) => {
    const when = e.target.value;
    setForm((f) => ({ ...f, when, day: when === 'Today' ? plusDays(0) : when === 'Tomorrow' ? plusDays(1) : f.day }));
  };

  const save = async () => {
    if (saving) return;
    const at = new Date(`${form.day}T${form.time || '11:00'}`);
    if (Number.isNaN(at.getTime())) return toast('Pick a date and time', 'danger');
    setSaving(true);
    try {
      const member = team.find((m) => m.name === form.owner);
      const nowDone = form.done && !wasDone;
      const oldAt = new Date(t.dueAt || t.dueIso || 0);
      const statusChanged = lead && form.leadStatus && form.leadStatus !== lead.status;
      // What changed, written into the task's notes so the person it is
      // assigned to and the admin both see who did what.
      const changes = [
        statusChanged && `Lead status: ${lead.status} → ${form.leadStatus}`,
        nowDone && 'Marked as completed',
        !form.done && wasDone && 'Opened again',
        Math.abs(at - oldAt) > 59000 && `Time moved to ${spell(form.day, form.time)}`,
        form.owner !== t.owner && `Assigned to ${form.owner}`,
        form.type !== t.type && `Type: ${form.type}`,
      ].filter(Boolean);
      const text = [form.note.trim(), changes.length ? `(${changes.join(' · ')})` : ''].filter(Boolean).join('\n');
      if (text && isLive && t._id) await api.post(`/tasks/${t._id}/comments`, { text });
      if (statusChanged) {
        // A lead not loaded on this screen is changed on the server directly.
        if (!enquiries.some((e) => e.id === lead.id) && isLive && lead._id) await api.patch(`/leads/${lead._id}`, { status: form.leadStatus });
        else update('enquiries', lead.id, { status: form.leadStatus }, { silent: true });
        logActivity?.(lead.id, `Status updated to ${form.leadStatus} (from task ${t.title})`, 'status');
      }
      update('tasks', t.id, {
        type: form.type,
        repeat: form.repeat,
        dueIso: at.toISOString(),
        dueAt: at.toISOString(),
        due: at.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
        ...(form.owner !== t.owner ? { owner: form.owner, ownerId: member?._id } : {}),
        ...(text ? { comments: [...(t.comments || []), { text, by: auth?.name || 'You', at: new Date().toISOString() }] } : {}),
        ...(nowDone
          ? { status: 'Completed', bucket: 'done' }
          : !form.done && wasDone
            ? { status: 'Pending', bucket: at < new Date() ? 'overdue' : 'today' }
            : { bucket: wasDone ? 'done' : at < new Date() ? 'overdue' : 'today' }),
      }, { message: nowDone ? 'Task done' : 'Task saved' });
      // A repeating task done: the server makes the next one — fetch it.
      if (nowDone && form.repeat) setTimeout(() => pull?.('tasks'), 1500);
      onClose();
    } catch (err) {
      toast(err.message || 'That did not save', 'danger');
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  const input = 'input h-11 py-0 text-sm';
  return (
    <Modal
      open={Boolean(task)}
      onClose={onClose}
      title="Edit task"
      subtitle={[t.title, lead?.name || t.customer].filter(Boolean).join(' · ')}
      size="md"
      footer={
        <>
          {lead && onOpenLead && (
            <button type="button" className="btn-line" onClick={() => onOpenLead(lead)}>
              <ExternalLink size={15} /> Open lead
            </button>
          )}
          <button type="button" className="btn-action" disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      {lead && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-surface-soft/70 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-900">{lead.name}</p>
            <p className="truncate text-xs text-ink-500">{[lead.phone, lead.status, lead.owner && `Lead with ${lead.owner}`].filter(Boolean).join(' · ')}</p>
          </div>
          {lead.phone && (
            <a href={`tel:${dialable(lead.phone)}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#34C759] text-white" title={`Call ${lead.name}`}>
              <Phone size={17} />
            </a>
          )}
        </div>
      )}

      <div className="space-y-3">
        {lead && (
          <label className="block">
            <span className="label">Lead status</span>
            <select className={input} value={form.leadStatus} onChange={set('leadStatus')}>
              {[...new Set([form.leadStatus, ...stages].filter(Boolean))].map((x) => <option key={x}>{x}</option>)}
            </select>
            {form.leadStatus !== lead.status && (
              <span className="mt-1 block text-xs font-semibold text-amber-700">Saves to the lead too: {lead.status} → {form.leadStatus}</span>
            )}
          </label>
        )}

        <label className="block">
          <span className="label">Task type</span>
          <select className={input} value={form.type} onChange={set('type')}>
            {[...new Set([form.type, ...TYPES])].map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="label">Due date</span>
          <select className={input} value={form.when} onChange={pickWhen}>
            <option>Today</option>
            <option>Tomorrow</option>
            <option value="Custom">Custom date</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {form.when === 'Custom' && (
            <label className="block">
              <span className="label">Custom date</span>
              <input type="date" className={input} value={form.day} onChange={set('day')} />
            </label>
          )}
          <label className={`block ${form.when === 'Custom' ? '' : 'col-span-2'}`}>
            <span className="label">Time</span>
            <input type="time" className={input} value={form.time} onChange={set('time')} />
          </label>
          <span className="col-span-2 -mt-1 text-xs font-semibold text-brand-700">{spell(form.day, form.time)}</span>
        </div>

        <label className="block">
          <span className="label flex items-center gap-1"><Repeat size={12} /> Repeat this task?</span>
          <select className={input} value={form.repeat} onChange={set('repeat')}>
            {REPEATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="label">Assign task to</span>
          <select className={input} value={form.owner} onChange={set('owner')}>
            {!form.owner && <option value="">Select who does it</option>}
            {people.map((n) => <option key={n} value={n}>{n === lead?.owner ? `${n} (lead's person)` : n}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="label">Note</span>
          <textarea
            className="input min-h-[6rem] py-2 text-sm"
            value={form.note}
            onChange={set('note')}
            placeholder="Enter your note — e.g. Ringing, Call me back at 5 pm"
          />
        </label>

        <label className="flex items-center gap-2.5 py-1 text-sm font-semibold text-ink-800">
          <input type="checkbox" className="h-5 w-5 accent-brand-600" checked={form.done} onChange={set('done')} />
          Mark as completed
          {form.done && form.repeat && !wasDone && <Badge tone="sky">next one made {form.repeat.toLowerCase()}</Badge>}
        </label>

        {t.note && (
          <div>
            <p className="label">Note when it was added</p>
            <p className="whitespace-pre-wrap rounded-xl bg-surface-soft/70 px-3 py-2 text-sm text-ink-700">{t.note}</p>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-extrabold text-ink-900">Previous notes</p>
          {notes.length === 0 && <p className="text-sm text-ink-500">No notes yet.</p>}
          <ul className="space-y-2.5">
            {notes.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-500 text-center text-[10px] font-bold leading-tight text-white">
                  {c.at ? noteDay(c.at) : '—'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap rounded-xl bg-surface-soft/80 px-3 py-2 text-sm font-semibold text-ink-800">{c.text}</p>
                  <p className="mt-0.5 text-right text-[11px] text-ink-400">{c.at ? noteTime(c.at) : ''} by {c.by || '—'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {t.createdBy && <p className="text-xs text-ink-400">Added by {t.createdBy}</p>}
      </div>
    </Modal>
  );
}
