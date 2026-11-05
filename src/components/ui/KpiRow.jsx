/**
 * The headline numbers under a page's masthead — kept small: the icon and the
 * label on one line with the number, and a hairline bar underneath when the
 * number is really a ratio. Half the height of a full card, so the work on the
 * page starts higher up.
 *
 * items: [{ label, value, hint, tone, icon, progress, onClick }]
 *   onClick  makes the card a button that opens what is behind the number
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

export default function KpiRow({ items, cols = 4, scroll = false }) {
  const grid = {
    3: 'sm:grid-cols-2 xl:grid-cols-3',
    4: 'sm:grid-cols-2 xl:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    8: 'sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8',
  }[cols] || 'sm:grid-cols-2 xl:grid-cols-4';

  return (
    // Two to a row on a phone, the way a mobile CRM shows its numbers.
    // scroll: on a phone, one row that slides sideways instead.
    <div className={scroll
      ? `-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0 ${grid}`
      : `grid grid-cols-2 gap-2 sm:gap-2.5 ${grid}`}
    >
      {items.map((k) => {
        const skin = SKIN[k.tone] || PLAIN;
        const Card = k.onClick ? 'button' : 'div';
        const pct = k.progress == null ? null : Math.max(0, Math.min(100, Math.round(k.progress)));
        return (
          <Card
            key={k.label}
            {...(k.onClick ? { type: 'button', onClick: k.onClick, title: `See ${k.label.toLowerCase()} by team member` } : {})}
            className={`card card-hover block min-w-0 px-3 py-2.5 text-left sm:px-3.5 sm:py-3 ${scroll ? 'w-[42%] shrink-0 snap-start sm:w-auto' : ''}`}
          >
            {/* The label owns its line, so it never loses room to the number */}
            <div className="flex items-center gap-2">
              {k.icon && (
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${skin.chip}`}>
                  <k.icon size={13} strokeWidth={2.4} />
                </span>
              )}
              <p className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-[0.06em] text-ink-400">
                {k.label}
              </p>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <p className={`num min-w-0 truncate font-display text-xl font-extrabold leading-none ${k.tone || 'text-ink-900'}`}>
                {k.value}
              </p>
              {pct != null && (
                <span className="num ml-auto shrink-0 text-[11px] font-bold text-ink-400">{pct}%</span>
              )}
            </div>

            {pct != null && (
              <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-surface-soft">
                <span className={`block h-full rounded-full ${skin.bar}`} style={{ width: `${pct}%` }} />
              </span>
            )}

            {k.hint && <p className="mt-1.5 truncate text-[11px] text-ink-400">{k.hint}</p>}
          </Card>
        );
      })}
    </div>
  );
}
