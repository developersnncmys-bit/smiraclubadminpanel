import { useState } from 'react';
import { Building2, MapPin, Home, Loader2, Power } from 'lucide-react';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';
import { attendanceChanged, hoursWorked, mapLink, timeOf, useMyAttendance, whereAmI } from '../../lib/attendance.js';

/**
 * My attendance as one ON / OFF switch.
 *
 * ON checks in: the date, the time, office / field / home, and where the
 * phone is are all saved. OFF checks out, with the time and place. Somebody
 * set to one way of working in Users is only offered that one.
 */
const MODES = [
  { key: 'Office', label: 'Office', icon: Building2 },
  { key: 'Field', label: 'Field work', icon: MapPin },
  { key: 'Work from home', label: 'Work from home', icon: Home },
];

export default function AttendanceSwitch() {
  const { toast, auth } = useApp();
  const { row, workMode, ready } = useMyAttendance();
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isLive || !ready) return null;
  const on = Boolean(row?.checkIn && !row?.checkOut);
  const done = Boolean(row?.checkOut);
  const modes = workMode ? MODES.filter((m) => m.key === workMode) : MODES;
  const now = new Date();

  const send = async (path, body = {}) => {
    setBusy(true);
    setError('');
    const place = await whereAmI();
    if (path === 'check-in' && body.mode === 'Field' && !place) {
      setBusy(false);
      setError('Field work needs your location. Allow location for this site in the browser, then try again.');
      return;
    }
    try {
      await api.post(`/attendance/${path}`, { ...body, ...(place || {}) });
      attendanceChanged();
      toast(path === 'check-in' ? `Attendance ON · ${body.mode === 'Field' ? 'Field work' : body.mode}` : 'Attendance OFF — checked out');
      setPicking(false);
    } catch (err) {
      setError(err.message || 'That did not go through');
    } finally {
      setBusy(false);
    }
  };

  const flip = () => {
    if (busy || done) return;
    if (on) {
      if (window.confirm('Turn attendance OFF and check out for today?')) send('check-out');
      return;
    }
    // One way of working: no need to ask.
    if (modes.length === 1) send('check-in', { mode: modes[0].key });
    else setPicking((p) => !p);
  };

  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">My attendance · {auth?.name?.split(' ')[0]}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink-700">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="mt-1 text-sm text-ink-600">
            {row?.checkIn ? (
              <>
                In <b>{timeOf(row.checkIn.at)}</b> · {row.checkIn.mode === 'Field' ? 'Field work' : row.checkIn.mode}
                {mapLink(row.checkIn) && (
                  <> · <a className="font-bold text-brand-700 underline" href={mapLink(row.checkIn)} target="_blank" rel="noreferrer">place</a></>
                )}
                {row.checkOut && <> · Out <b>{timeOf(row.checkOut.at)}</b></>}
                {' · '}{hoursWorked(row)}
              </>
            ) : (
              'Not checked in yet'
            )}
          </p>
        </div>

        {/* The switch */}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={flip}
          disabled={busy || done}
          className="flex items-center gap-3 disabled:cursor-default"
          title={done ? 'Checked out for today' : on ? 'Tap to check out' : 'Tap to check in'}
        >
          <span className={`text-sm font-extrabold ${on ? 'text-emerald-700' : done ? 'text-ink-400' : 'text-ink-500'}`}>
            {busy ? 'Saving…' : done ? 'Day done' : on ? 'ON' : 'OFF'}
          </span>
          <span className={`relative h-9 w-16 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-ink-900/15'} ${done ? 'opacity-50' : ''}`}>
            <span className={`absolute top-1 grid h-7 w-7 place-items-center rounded-full bg-white shadow transition-all ${on ? 'left-8' : 'left-1'}`}>
              {busy ? <Loader2 size={14} className="animate-spin text-ink-400" /> : <Power size={14} className={on ? 'text-emerald-600' : 'text-ink-400'} />}
            </span>
          </span>
        </button>
      </div>

      {picking && !on && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {modes.map((m) => (
            <button
              key={m.key}
              type="button"
              disabled={busy}
              onClick={() => send('check-in', { mode: m.key })}
              className="flex items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm font-bold text-ink-800 hover:border-brand-400 hover:bg-brand-50"
            >
              <m.icon size={17} className="text-brand-600" /> {m.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
    </section>
  );
}
