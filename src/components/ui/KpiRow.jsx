/**
 * The headline numbers under a page's masthead. Each one is an icon, the
 * number, and — where the number is really a ratio — the bar that says how far
 * along it is. Every module leads with this same tile.
 *
 * items: [{ label, value, hint, tone, icon, progress }]
 *   tone     a text colour class; the icon chip and the bar follow it
 *   progress 0–100; omit it when the number is not a ratio
 */

/** The chip and bar colours that go with a value's tone. */
const SKIN = {
  'text-emerald-600': { chip: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
  'text-rose-600': { chip: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500' },
  'text-amber-600': { chip: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
  'text-sky-600': { chip: 'bg-sky-50 text-sky-600', bar: 'bg-sky-500' },
  'text-brand-700': { chip: 'bg-brand-50 text-brand-600', bar: 'bg-brand-500' },
};
const PLAIN = { chip: 'bg-surface-soft text-ink-500', bar: 'bg-brand-500' };

export default function KpiRow({ items, cols = 4 }) {
  const grid = {
    3: 'sm:grid-cols-2 xl:grid-cols-3',
    4: 'sm:grid-cols-2 xl:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    8: 'sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8',
  }[cols] || 'sm:grid-cols-2 xl:grid-cols-4';

  return (
    <div className={`grid gap-4 ${grid}`}>
      {items.map((k) => {
        const skin = SKIN[k.tone] || PLAIN;
        const pct = k.progress == null ? null : Math.max(0, Math.min(100, Math.round(k.progress)));
        return (
          <div key={k.label} className="card card-hover px-4 py-4">
            <div className="flex items-center gap-2.5">
              {k.icon && (
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${skin.chip}`}>
                  <k.icon size={15} strokeWidth={2.3} />
                </span>
              )}
              <p className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">
                {k.label}
              </p>
            </div>

            <p className={`num mt-2.5 font-display text-2xl font-extrabold leading-none ${k.tone || 'text-ink-900'}`}>
              {k.value}
            </p>

            {pct != null && (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-soft">
                  <span className={`block h-full rounded-full ${skin.bar}`} style={{ width: `${pct}%` }} />
                </span>
                <span className="num shrink-0 text-[11px] font-bold text-ink-400">{pct}%</span>
              </div>
            )}

            {k.hint && <p className="mt-1.5 truncate text-xs text-ink-400">{k.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
