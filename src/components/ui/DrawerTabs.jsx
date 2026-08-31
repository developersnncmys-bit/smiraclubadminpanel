/**
 * The tab strip inside a detail drawer — underlined, quieter than the page
 * switcher so the two never compete. Every drawer uses this one.
 *
 * items: strings, or [{ key, label, count }]
 */
export default function DrawerTabs({ items, value, onChange }) {
  const list = items.map((i) => (typeof i === 'string' ? { key: i, label: i } : i));

  return (
    <div className="no-scrollbar flex overflow-x-auto border-b border-ink-900/[0.07]">
      {list.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${
            value === t.key
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          {t.label ?? t.key}
          {t.count != null && <span className="num ml-1.5 text-ink-400">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
