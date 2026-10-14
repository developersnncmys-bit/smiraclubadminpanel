import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, IndianRupee, Lock, Unlock } from 'lucide-react';

/**
 * What a night costs, date by date.
 *
 * One standard tariff made a Saturday in December cost what a Tuesday in
 * June costs, and that was the number the website quoted whatever dates
 * the member picked. Here the property sets the ones that differ; a date
 * left alone falls back to the tariff, so nobody has to fill in a year.
 *
 * Closing a night is a separate thing from pricing it. A property can
 * close a date it still has a rate for — a wedding, a refurbishment —
 * and the rate is waiting when it reopens.
 *
 * `value` is `[{ date: 'YYYY-MM-DD', rate, closed }]` and only the dates
 * the property has actually touched are in it.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** A date as the calendar on the wall writes it, not as UTC does. */
const ymd = (d) => {
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Monday-first, because that is how the rest of the panel draws a week. */
const leadingBlanks = (first) => (first.getDay() + 6) % 7;

export default function RateCalendar({ value = [], onChange, tariff }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  /** The dates being edited together, so a season is one typing. */
  const [picked, setPicked] = useState([]);
  const [rate, setRate] = useState('');

  const byDate = useMemo(() => {
    const map = new Map();
    (value || []).forEach((d) => d?.date && map.set(d.date, d));
    return map;
  }, [value]);

  const days = useMemo(() => {
    const out = [];
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    for (let i = 0; i < leadingBlanks(first); i += 1) out.push(null);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= last; d += 1) out.push(new Date(month.getFullYear(), month.getMonth(), d));
    return out;
  }, [month]);

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const toggle = (date) => {
    const key = ymd(date);
    setPicked((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
  };

  /** Write a change onto every picked date at once. */
  const apply = (patch) => {
    if (!picked.length) return;
    const next = new Map(byDate);
    picked.forEach((key) => {
      const was = next.get(key) || { date: key };
      const now = { ...was, ...patch };
      // A date with neither a rate nor a closure is a date nobody set.
      if (!now.rate && !now.closed) next.delete(key);
      else next.set(key, now);
    });
    onChange([...next.values()].sort((a, b) => a.date.localeCompare(b.date)));
  };

  const setRateOnPicked = () => {
    const amount = Number(String(rate).replace(/[^\d]/g, ''));
    if (!amount) return;
    apply({ rate: amount });
    setRate('');
    setPicked([]);
  };

  const monthLabel = `${MONTHS[month.getMonth()]} ${month.getFullYear()}`;
  const step = (by) => setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));

  return (
    <div className="rounded-2xl border border-ink-900/[0.07] p-4">
      {/* -- Which month ---------------------------------------------- */}
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => step(-1)} className="icon-btn h-8 w-8" title="Previous month">
          <ChevronLeft size={15} />
        </button>
        <p className="font-display text-sm font-extrabold text-ink-900">{monthLabel}</p>
        <button type="button" onClick={() => step(1)} className="icon-btn h-8 w-8" title="Next month">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* -- The month ------------------------------------------------- */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <span key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-ink-400">
            {d}
          </span>
        ))}

        {days.map((date, i) => {
          if (!date) {
            // eslint-disable-next-line react/no-array-index-key
            return <span key={`blank-${i}`} />;
          }

          const key = ymd(date);
          const set = byDate.get(key);
          const on = picked.includes(key);
          const past = date < startOfToday;

          return (
            <button
              key={key}
              type="button"
              disabled={past}
              onClick={() => toggle(date)}
              aria-pressed={on}
              className={`rounded-lg border px-1 py-1.5 text-center transition ${
                past
                  ? 'cursor-not-allowed border-transparent text-ink-300'
                  : on
                    ? 'border-brand-600 bg-brand-50'
                    : set?.closed
                      ? 'border-rose-200 bg-rose-50'
                      : set?.rate
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-ink-900/[0.07] hover:bg-surface-soft'
              }`}
            >
              <span className="block text-[12px] font-bold text-ink-800">{date.getDate()}</span>
              <span className="block text-[9px] font-semibold leading-tight">
                {set?.closed ? (
                  <span className="text-rose-600">Closed</span>
                ) : set?.rate ? (
                  <span className="text-emerald-700">{set.rate.toLocaleString('en-IN')}</span>
                ) : (
                  <span className="text-ink-300">—</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* -- What to do with the ones picked --------------------------- */}
      <div className="mt-4 rounded-xl bg-surface-soft p-3">
        {picked.length === 0 ? (
          <p className="text-xs text-ink-500">
            Tap the dates you want to price, then set a rate for all of them at once. A date you
            leave alone is sold at the standard tariff
            {tariff ? ` of ₹${Number(tariff).toLocaleString('en-IN')}` : ''}.
          </p>
        ) : (
          <>
            <p className="text-xs font-bold text-ink-700">
              {picked.length} {picked.length === 1 ? 'date' : 'dates'} picked
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="flex overflow-hidden rounded-lg border border-ink-900/10 bg-white">
                <span className="grid w-8 place-items-center border-r border-ink-900/10 text-ink-400">
                  <IndianRupee size={13} />
                </span>
                <input
                  value={rate}
                  onChange={(e) => setRate(e.target.value.replace(/[^\d]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setRateOnPicked())}
                  inputMode="numeric"
                  placeholder="Rate a night"
                  className="num w-28 border-0 px-2 py-1.5 text-xs font-semibold outline-none"
                />
              </span>
              <button type="button" onClick={setRateOnPicked} className="btn-action btn-sm">
                Set rate
              </button>
              <button type="button" onClick={() => { apply({ closed: true }); setPicked([]); }} className="btn-line btn-sm">
                <Lock size={13} /> Close
              </button>
              <button type="button" onClick={() => { apply({ closed: false }); setPicked([]); }} className="btn-line btn-sm">
                <Unlock size={13} /> Open
              </button>
              <button
                type="button"
                onClick={() => { apply({ rate: undefined, closed: false }); setPicked([]); }}
                className="btn-line btn-sm"
              >
                Clear
              </button>
              <button type="button" onClick={() => setPicked([])} className="text-xs font-semibold text-ink-500 hover:text-ink-800">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-2.5 text-[11px] text-ink-400">
        This is the price a member is quoted for that night. They choose dates, never a price.
      </p>
    </div>
  );
}
