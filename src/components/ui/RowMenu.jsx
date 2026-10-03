import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

/**
 * A menu of the things you can do to one row.
 *
 * Two faces, one list. At the end of a table row it is the "⋯" button it
 * has always been. Given a `label` it becomes an ordinary button — which is
 * how the cards use it, so a card carries one Actions button instead of six
 * buttons in a row that pushed the one thing the desk actually came to do
 * onto a second line.
 *
 * An item is either something to run (`onClick`) or somewhere to go
 * (`href`) — a phone number, a WhatsApp thread, an email — so Call and
 * WhatsApp keep working as real links rather than becoming script.
 */
export default function RowMenu({ items = [], label, icon: Face, drop = 'down' }) {
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

  const shown = items.filter(Boolean);
  if (!shown.length) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={
          label
            ? 'btn-line btn-sm'
            : 'grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-brand-300 hover:text-brand-700'
        }
      >
        {label ? (
          <>
            {Face && <Face size={13} />}
            {label}
            <ChevronDown size={13} className={open ? 'rotate-180 transition' : 'transition'} />
          </>
        ) : (
          <MoreHorizontal size={15} />
        )}
      </button>

      {open && (
        <div
          className={`absolute left-0 z-30 w-48 overflow-hidden rounded-xl bg-white py-1 shadow-lift ring-1 ring-ink-900/[0.07] ${
            label ? '' : 'left-auto right-0'
          } ${drop === 'up' ? 'bottom-9' : 'top-9'}`}
        >
          {shown.map(({ label: text, icon: Icon, onClick, href, target, danger }) => {
            const look = `flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold transition ${
              danger ? 'text-rose-600 hover:bg-rose-50' : 'text-ink-700 hover:bg-surface-soft'
            }`;
            const face = (
              <>
                {Icon && <Icon size={15} />}
                {text}
              </>
            );

            return href ? (
              <a
                key={text}
                href={href}
                target={target}
                rel={target === '_blank' ? 'noreferrer' : undefined}
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                className={look}
              >
                {face}
              </a>
            ) : (
              <button
                key={text}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onClick();
                }}
                className={look}
              >
                {face}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
