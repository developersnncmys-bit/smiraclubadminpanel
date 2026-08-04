import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

/** Compact "⋯" menu used at the end of table rows. */
export default function RowMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-lift ring-1 ring-ink-900/5">
          {items.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onClick();
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                danger ? 'text-rose-600 hover:bg-rose-50' : 'text-ink-700 hover:bg-surface-soft'
              }`}
            >
              {Icon && <Icon size={15} />}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
