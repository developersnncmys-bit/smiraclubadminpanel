/**
 * The headline numbers under a page's masthead. Every module leads with the
 * same tile — no gradients, no sparklines, no second treatment — so the top of
 * Bookings reads exactly like the top of Support.
 *
 * items: [{ label, value, hint, tone }]
 */
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
      {items.map((k) => (
        <div key={k.label} className="card px-4 py-4">
          <p className="text-sm font-semibold text-ink-500">{k.label}</p>
          <p className={`num mt-1 font-display text-2xl font-extrabold ${k.tone || 'text-ink-900'}`}>
            {k.value}
          </p>
          {k.hint && <p className="mt-0.5 text-xs text-ink-400">{k.hint}</p>}
        </div>
      ))}
    </div>
  );
}
