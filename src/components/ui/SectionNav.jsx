/**
 * A module with a dozen sections needs somewhere to put them. On a wide screen
 * they sit in a rail down the left, so the page opens on content rather than
 * three rows of buttons; on a narrow one they become a single scrolling line.
 */
export default function SectionNav({ sections, value, onChange, icons = {}, accent = 'brand', children }) {
  const active = {
    brand: 'bg-ink-900 text-white',
    emerald: 'bg-emerald-600 text-white',
    violet: 'bg-violet-600 text-white',
    sky: 'bg-sky-600 text-white',
  }[accent];

  return (
    <div className="grid gap-5 xl:grid-cols-[196px_minmax(0,1fr)] xl:items-start">
      <nav className="xl:sticky xl:top-4">
        <p className="eyebrow mb-2 hidden xl:block">Sections</p>
        <ul className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 xl:mx-0 xl:flex-col xl:overflow-visible xl:px-0 xl:pb-0">
          {sections.map((s) => {
            const Icon = icons[s];
            const on = value === s;
            return (
              <li key={s} className="shrink-0 xl:shrink">
                <button
                  onClick={() => onChange(s)}
                  className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                    on ? `${active} shadow-sm` : 'text-ink-600 hover:bg-white hover:text-ink-900'
                  }`}
                >
                  {Icon && <Icon size={15} className={on ? 'text-white/80' : 'text-ink-400'} />}
                  {s}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
