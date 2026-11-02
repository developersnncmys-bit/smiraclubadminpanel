import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { api } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';
import { attendanceChanged } from '../../lib/attendance.js';

export const ATTENDANCE_STATUSES = ['Present', 'Late', 'Half day', 'Field visit', 'Work from home', 'Leave', 'Absent'];
const MODES = ['Office', 'Field', 'Work from home'];

/** "09:42" in India time, for a time box. */
const hhmm = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })
    : '';

/** Today in India, YYYY-MM-DD. */
export const todayIst = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

/**
 * A manager corrects someone's day: what it counts as, when they came in
 * and left, and where they worked. Why it changed is asked for every time
 * and kept with the record, so a corrected day is never a silent one.
 */
export default function AttendanceEdit({ open, onClose, member, row }) {
  const { toast } = useApp();
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      status: row?.status || (row?.checkIn ? 'Present' : ''),
      checkIn: hhmm(row?.checkIn?.at),
      checkOut: hhmm(row?.checkOut?.at),
      mode: row?.checkIn?.mode || 'Office',
      reason: '',
    });
    setError('');
  }, [open, row]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.status) return setError('Choose what the day counts as.');
    if (!form.reason.trim()) return setError('Write why you are changing it — for example "Was at a client site, phone had no signal".');
    if (form.checkIn && form.checkOut && form.checkOut < form.checkIn) return setError('Check out cannot be before check in.');
    setBusy(true);
    setError('');
    try {
      await api.patch(`/attendance/${member._id}/${todayIst()}`, {
        status: form.status,
        checkIn: form.checkIn || null,
        checkOut: form.checkOut || null,
        mode: form.mode,
        reason: form.reason.trim(),
      });
      attendanceChanged();
      toast(`Attendance updated for ${member.name}`);
      onClose();
    } catch (err) {
      setError(err.status === 403 ? 'Only a manager who can edit users can change attendance.' : err.message || 'That did not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit attendance"
      subtitle={`${member?.name || ''} · today`}
      size="sm"
      footer={
        <>
          <button className="btn-line" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-action" onClick={save} disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="label">Status</span>
          <div className="grid grid-cols-2 gap-2">
            {ATTENDANCE_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((f) => ({ ...f, status: s }))}
                className={`rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  form.status === s ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-400' : 'bg-surface-soft/70 text-ink-700 hover:bg-surface-soft'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Check in</span>
            <input type="time" className="input" value={form.checkIn || ''} onChange={set('checkIn')} />
          </label>
          <label className="block">
            <span className="label">Check out</span>
            <input type="time" className="input" value={form.checkOut || ''} onChange={set('checkOut')} />
          </label>
        </div>
        <p className="-mt-2 text-xs text-ink-500">Clear a time to remove it.</p>

        <label className="block">
          <span className="label">Working from</span>
          <select className="input" value={form.mode || 'Office'} onChange={set('mode')}>
            {MODES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="label">Reason for the change *</span>
          <textarea className="input min-h-[72px]" maxLength={300} value={form.reason || ''} onChange={set('reason')} placeholder="e.g. Forgot to check in, came at 9:30" />
        </label>

        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
      </div>
    </Modal>
  );
}
