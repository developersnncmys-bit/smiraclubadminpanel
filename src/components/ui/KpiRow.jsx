/**
 * The headline numbers under a page's masthead — kept small: the icon and the
 * label on one line with the number, and a hairline bar underneath when the
 * number is really a ratio. Half the height of a full card, so the work on the
 * page starts higher up.
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
    8: 'sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8',
  }[cols] || 'sm:grid-cols-2 xl:grid-cols-4';

  return (
    <div className={`grid gap-2.5 ${grid}`}>
      {items.map((k) => {
        const skin = SKIN[k.tone] || PLAIN;
        const pct = k.progress == null ? null : Math.max(0, Math.min(100, Math.round(k.progress)));
        return (
          <div key={k.label} className="card card-hover px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              {k.icon && (
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${skin.chip}`}>
                  <k.icon size={14} strokeWidth={2.3} />
                </span>
              )}
              <p className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-[0.06em] text-ink-400">
                {k.label}
              </p>
              <p className={`num shrink-0 font-display text-lg font-extrabold leading-none ${k.tone || 'text-ink-900'}`}>
                {k.value}
              </p>
            </div>

            {(pct != null || k.hint) && (
              <div className="mt-2 flex items-center gap-2">
                {pct != null && (
                  <span className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-surface-soft">
                    <span className={`block h-full rounded-full ${skin.bar}`} style={{ width: `${pct}%` }} />
                  </span>
                )}
                <p className="min-w-0 flex-1 truncate text-[11px] text-ink-400">
                  {pct != null && <span className="num font-bold text-ink-500">{pct}% </span>}
                  {k.hint}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
