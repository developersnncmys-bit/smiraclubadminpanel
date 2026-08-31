/**
 * The switcher a module uses to move between its sections. One pill style for
 * every page.
 *
 * items: strings, or [{ key, label, icon, count }]
 */
export default function SectionTabs({ items, value, onChange, className = '', children }) {
  const list = items.map((i) => (typeof i === 'string' ? { key: i, label: i } : i));

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {list.map((t) => {
        const on = value === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
              on
                ? 'bg-ink-900 text-white shadow-sm'
                : 'bg-white text-ink-600 ring-1 ring-ink-900/[0.07] hover:text-ink-900'
            }`}
          >
            {t.icon && <t.icon size={15} />}
            {t.label ?? t.key}
            {t.count != null && (
              <span className={`num ${on ? 'text-white/60' : 'text-ink-400'}`}>{t.count}</span>
            )}
          </button>
        );
      })}
      {children}
    </div>
  );
}
