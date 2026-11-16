import { useEffect, useState } from 'react';
import { Utensils, Coffee, Bath, Loader2, Play } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';
import { attendanceChanged, breakText, openBreak, timeOf } from '../../lib/attendance.js';

const KINDS = [
  { key: 'Lunch', icon: Utensils, tone: 'text-orange-600' },
  { key: 'Tea', icon: Coffee, tone: 'text-amber-700' },
  { key: 'Washroom', icon: Bath, tone: 'text-sky-600' },
];

/**
 * Break time while checked in: Lunch, Tea or Washroom. One break at a time;
 * "Back to work" ends it. Breaks are taken off the hours worked.
 */
export default function BreakButtons({ row }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState('');
  const [, tick] = useState(0);
  const current = openBreak(row);

  // The running break's minutes tick along.
  useEffect(() => {
    if (!current) return undefined;
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, [current]);

  if (!row?.checkIn || row.checkOut) return null;

  const send = async (path, body, key) => {
    setBusy(key);
    try {
      await api.post(`/attendance/break/${path}`, body);
      attendanceChanged();
      toast(path === 'start' ? `${body.kind} break started` : 'Welcome back — break ended');
    } catch (err) {
      toast(err.message || 'That did not go through', 'danger');
    } finally {
      setBusy('');
    }
  };

  const mins = current ? Math.max(0, Math.round((Date.now() - new Date(current.start)) / 60000)) : 0;
  const taken = (row.breaks || []).filter((b) => b.end);

  return (
    <div className="mt-3 rounded-xl bg-surface-soft/70 p-3">
      {current ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 flex-1 text-sm text-ink-800">
            On <b>{current.kind}</b> break since {timeOf(current.start)} · <b>{mins} min</b>
          </p>
          <button type="button" className="btn-action btn-sm" disabled={Boolean(busy)} onClick={() => send('end', {}, 'end')}>
            {busy === 'end' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Back to work
          </button>
        </div>
      ) : (
        <>
          <p className="label mb-1.5">Take a break</p>
          <div className="grid grid-cols-3 gap-2">
            {KINDS.map((k) => (
              <button
                key={k.key}
                type="button"
                disabled={Boolean(busy)}
                onClick={() => send('start', { kind: k.key }, k.key)}
                className="flex flex-col items-center gap-1 rounded-xl border border-ink-900/10 bg-white px-2 py-2.5 text-xs font-bold text-ink-800 hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60"
              >
                {busy === k.key ? <Loader2 size={18} className="animate-spin text-ink-400" /> : <k.icon size={18} className={k.tone} />}
                {k.key}
              </button>
            ))}
          </div>
        </>
      )}
      {taken.length > 0 && (
        <p className="mt-2 text-xs text-ink-500">
          Today: {taken.map((b) => `${b.kind} ${Math.round((new Date(b.end) - new Date(b.start)) / 60000)}m`).join(' · ')} — {breakText(row)} in all
        </p>
      )}
    </div>
  );
}
