import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api, isLive } from '../../lib/api.js';
import { timeOf, hoursWorked } from '../../lib/attendance.js';

/**
 * A month of one person's attendance, as a calendar.
 *
 * Each day is coloured by how it was marked — present, field, home, late,
 * leave, absent — with the check-in time under the date. Tap a day for its
 * times. Without `userId` it is the signed-in person's own month.
 */
const TONE = {
  Present: 'bg-emerald-100 text-emerald-800',
  'Field visit': 'bg-sky-100 text-sky-800',
  'Work from home': 'bg-violet-100 text-violet-800',
  Late: 'bg-amber-100 text-amber-800',
  'Half day': 'bg-amber-100 text-amber-800',
  Leave: 'bg-slate-200 text-slate-700',
  Absent: 'bg-rose-100 text-rose-700',
};
const LEGEND = [
  ['Present', 'Office'],
  ['Field visit', 'Field'],
  ['Work from home', 'Home'],
  ['Late', 'Late / half'],
  ['Leave', 'Leave'],
  ['Absent', 'Absent'],
];
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad = (n) => String(n).padStart(2, '0');

export default function AttendanceCalendar({ userId }) {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`);
  const [data, setData] = useState({ rows: [], today: '' });
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    if (!isLive) return;
    setLoading(true);
    setPicked(null);
    api
      .get(`/attendance/month?month=${month}${userId ? `&user=${userId}` : ''}`)
      .then((r) => setData({ rows: r.rows || [], today: r.today || '' }))
      .catch(() => setData({ rows: [], today: '' }))
      .finally(() => setLoading(false));
  }, [month, userId]);

  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const days = new Date(y, m, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const byDate = Object.fromEntries(data.rows.map((r) => [r.date, r]));
  const shift = (by) => {
    const d = new Date(y, m - 1 + by, 1);
    setMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };

  const counts = {};
  data.rows.forEach((r) => {
    if (r.status) counts[r.status] = (counts[r.status] || 0) + 1;
  });
  const row = picked && byDate[picked];

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button type="button" className="btn-line btn-sm px-2" onClick={() => shift(-1)} aria-label="Previous month">
          <ChevronLeft size={15} />
        </button>
        <p className="flex-1 text-center text-sm font-bold text-ink-900">
          {first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          {loading && <Loader2 size={13} className="ml-2 inline animate-spin text-ink-400" />}
        </p>
        <button type="button" className="btn-line btn-sm px-2" onClick={() => shift(1)} aria-label="Next month">
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map((d) => (
          <span key={d} className={`text-[11px] font-bold uppercase ${d === 'Sat' || d === 'Sun' ? 'text-amber-600' : 'text-ink-400'}`}>
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month}-${pad(i + 1)}`;
          const r = byDate[date];
          const status = r?.status || (r?.checkIn?.at ? 'Present' : '');
          const isToday = date === data.today;
          return (
            <button
              key={date}
              type="button"
              onClick={() => setPicked(date === picked ? null : date)}
              className={`flex min-h-[46px] flex-col items-center justify-center rounded-lg text-xs transition ${
                TONE[status] || 'bg-surface-soft/60 text-ink-500'
              } ${isToday ? 'ring-2 ring-brand-500' : ''} ${picked === date ? 'ring-2 ring-ink-700' : ''}`}
            >
              <span className="font-bold">{i + 1}</span>
              {r?.checkIn?.at && <span className="text-[10px] opacity-80">{timeOf(r.checkIn.at).replace(' ', '')}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {LEGEND.map(([key, label]) => (
          <span key={key} className="flex items-center gap-1 text-[11px] text-ink-500">
            <span className={`h-2.5 w-2.5 rounded-sm ${TONE[key].split(' ')[0]}`} /> {label}
            {counts[key] ? <b className="text-ink-700">{counts[key]}</b> : null}
          </span>
        ))}
      </div>

      {picked && (
        <div className="mt-3 rounded-xl bg-surface-soft p-3 text-sm">
          <p className="font-bold text-ink-900">
            {new Date(`${picked}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          {row ? (
            <div className="mt-1 space-y-0.5 text-ink-700">
              <p>Status: <b>{row.status || '—'}</b>{row.checkIn?.mode ? ` · ${row.checkIn.mode}` : ''}</p>
              <p>
                In {row.checkIn?.at ? <b>{timeOf(row.checkIn.at)}</b> : '—'} · Out{' '}
                {row.checkOut?.at ? <b>{timeOf(row.checkOut.at)}</b> : '—'}
                {row.checkIn?.at && row.checkOut?.at ? ` · ${hoursWorked(row)}` : ''}
              </p>
              {row.firstLoginAt && <p className="text-xs text-ink-500">Panel login {timeOf(row.firstLoginAt)}</p>}
              {row.editedByName && <p className="text-xs text-ink-500">Changed by {row.editedByName}: {row.editReason}</p>}
            </div>
          ) : (
            <p className="mt-1 text-ink-500">Not marked</p>
          )}
        </div>
      )}
    </div>
  );
}
