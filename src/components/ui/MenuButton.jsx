import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * One button that opens a list — the panel's way of offering many choices
 * without spending a row on them. Used for picking a status and for the quick
 * actions, so both read the same.
 *
 * items: [{ key, label, count, dot, icon, hint }]
 * Pass `value` to show a tick against the current choice.
 */
export default function MenuButton({
  label,
  icon: Icon,
  items,
  value,
  onSelect,
  variant = 'line',
  align = 'left',
  width = 'w-[260px]',
  title,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          {
            action: 'btn-action',
            dark: 'btn inline-flex items-center gap-2 rounded-xl bg-ink-900 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-ink-800',
            line: 'btn-line',
          }[variant] || 'btn-line'
        }
        title={title}
      >
        {Icon && <Icon size={15} />}
        {label}
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute top-11 z-40 ${width} ${align === 'right' ? 'right-0' : 'left-0'}
            max-h-[70vh] overflow-y-auto rounded-xl bg-white p-1.5 shadow-lift ring-1 ring-ink-900/[0.07]`}
        >
          {items.map((it) => {
            const on = value != null && value === it.key;
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => {
                  onSelect(it.key, it);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  on ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-surface-soft hover:text-ink-900'
                }`}
              >
                {it.dot && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${it.dot}`} />}
                {it.icon && <it.icon size={15} className="shrink-0 text-ink-400" />}
                <span className="min-w-0 flex-1 truncate">
                  {it.label}
                  {it.hint && <span className="ml-1.5 text-xs font-normal text-ink-400">{it.hint}</span>}
                </span>
                {it.count != null && (
                  <span className={`num shrink-0 text-xs font-bold ${on ? 'text-brand-700' : 'text-ink-400'}`}>
                    {it.count}
                  </span>
                )}
                {on && <Check size={14} className="shrink-0 text-brand-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
