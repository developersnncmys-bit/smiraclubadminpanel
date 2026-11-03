import { useEffect, useState } from 'react';
import { Fingerprint, Building2, MapPin, Home, Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';
import AttendanceCalendar from '../team/AttendanceCalendar.jsx';
import { attendanceChanged, hoursWorked, mapLink, timeOf, useMyAttendance, whereAmI } from '../../lib/attendance.js';

const MODES = [
  { key: 'Office', icon: Building2, hint: 'At the Smira office' },
  { key: 'Field', label: 'Field work', icon: MapPin, hint: 'Client visit, site, outside — your location is saved' },
  { key: 'Work from home', icon: Home, hint: 'Working from home today' },
];

/**
 * Check in and check out, for the office and the field alike.
 *
 * Opening the laptop is not attendance, and somebody out on a visit never
 * opens it — so the day is marked here, from whatever device they have. A
 * field check-in takes the phone's location, so a manager can see where the
 * day actually started; the office ones take it too when the device allows.
 */
export default function CheckIn() {
  const { toast } = useApp();
  const { row, workMode, ready } = useMyAttendance();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('Office');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [calendar, setCalendar] = useState(false);
  // Set to one way of working in Users: that is the only choice offered.
  const modes = workMode ? MODES.filter((m) => m.key === workMode) : MODES;
  useEffect(() => {
    if (workMode) setMode(workMode);
  }, [workMode]);

  if (!isLive || !ready) return null;
  const inNow = Boolean(row?.checkIn && !row?.checkOut);
  const done = Boolean(row?.checkOut);

  const send = async (path, body) => {
    setBusy(true);
    setError('');
    const place = await whereAmI();
    if (path === 'check-in' && body.mode === 'Field' && !place) {
      setBusy(false);
      setError('Your location is needed for a field check-in. Allow location for this site in the browser, then try again.');
      return;
    }
    try {
      await api.post(`/attendance/${path}`, { ...body, ...(place || {}) });
      attendanceChanged();
      toast(path === 'check-in' ? `Checked in · ${body.mode}` : 'Checked out — see you tomorrow');
      setOpen(false);
      setNote('');
    } catch (err) {
      setError(err.message || 'That did not go through');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(''); setOpen(true); }}
        className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold transition ${
          inNow
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : done
              ? 'bg-surface-soft text-ink-600'
              : 'bg-action-500 text-white hover:brightness-105'
        }`}
        title={inNow ? `Checked in at ${timeOf(row.checkIn.at)} · ${row.checkIn.mode}` : done ? 'Checked out' : 'Check in'}
      >
        <Fingerprint size={16} />
        <span className="hidden sm:inline">
          {inNow ? `In ${timeOf(row.checkIn.at)}` : done ? 'Day done' : 'Check in'}
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={inNow ? 'Check out' : done ? 'Your day' : 'Check in'}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        size="sm"
        footer={
          done ? (
            <button className="btn-line" onClick={() => setOpen(false)}>Close</button>
          ) : (
            <>
              <button className="btn-line" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
              <button
                className="btn-action"
                disabled={busy}
                onClick={() => (inNow ? send('check-out', { note }) : send('check-in', { mode, note }))}
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : inNow ? <LogOut size={15} /> : <Fingerprint size={15} />}
                {busy ? 'Getting your location…' : inNow ? 'Check out now' : 'Check in now'}
              </button>
            </>
          )
        }
      >
        {row?.checkIn && (
          <div className="mb-4 space-y-2 rounded-xl bg-surface-soft p-3 text-sm">
            <p className="flex items-center gap-2 text-ink-800">
              <CheckCircle2 size={15} className="text-emerald-600" />
              In at <b>{timeOf(row.checkIn.at)}</b> · {row.checkIn.mode}
              {mapLink(row.checkIn) && (
                <a className="ml-auto text-xs font-bold text-brand-700 underline" href={mapLink(row.checkIn)} target="_blank" rel="noreferrer">
                  Map
                </a>
              )}
            </p>
            {row.checkOut && (
              <p className="flex items-center gap-2 text-ink-800">
                <LogOut size={15} className="text-ink-500" />
                Out at <b>{timeOf(row.checkOut.at)}</b>
              </p>
            )}
            <p className="text-xs text-ink-500">Worked {hoursWorked(row)}</p>
          </div>
        )}

        {!row?.checkIn && (
          <div className="space-y-2">
            <p className="label">{workMode ? 'You check in as' : 'Where are you working today?'}</p>
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                  mode === m.key ? 'bg-brand-50 ring-2 ring-brand-400' : 'bg-surface-soft/70 hover:bg-surface-soft'
                }`}
              >
                <m.icon size={18} className={mode === m.key ? 'text-brand-600' : 'text-ink-400'} />
                <span>
                  <span className="block text-sm font-bold text-ink-900">{m.label || m.key}</span>
                  <span className="block text-xs text-ink-500">{m.hint}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {!done && (
          <label className="mt-3 block">
            <span className="label">{inNow ? 'Note (optional)' : mode === 'Field' ? 'Where / which client (optional)' : 'Note (optional)'}</span>
            <input className="input" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder={mode === 'Field' && !inNow ? 'e.g. Site visit, Whitefield' : ''} />
          </label>
        )}

        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

        {/* My month, as a calendar. */}
        <div className="mt-4 border-t border-ink-900/[0.07] pt-3">
          <button type="button" className="text-sm font-bold text-brand-700" onClick={() => setCalendar((v) => !v)}>
            {calendar ? 'Hide my attendance calendar' : 'Show my attendance calendar'}
          </button>
          {calendar && (
            <div className="mt-3">
              <AttendanceCalendar />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
