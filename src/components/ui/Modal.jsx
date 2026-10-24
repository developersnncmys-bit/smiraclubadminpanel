import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, footer, size = 'lg', children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

  /*
    On a phone it is a sheet that rises from the bottom and fills most of the
    screen, with the buttons full width under the thumb — the way a mobile
    CRM asks for anything. From sm up it is the centred dialog it always was.
  */
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-start sm:overflow-y-auto sm:p-6">
      <div className="fixed inset-0 bg-ink-900/45 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative flex max-h-[92dvh] w-full ${widths[size]} flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift ring-1 ring-ink-900/[0.07] sm:my-auto sm:max-h-none sm:rounded-2xl`}
      >
        <span aria-hidden className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-ink-900/15 sm:hidden" />
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink-900/[0.07] bg-surface-soft/40 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="font-display text-[1.05rem] font-extrabold leading-tight text-ink-900">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-ink-500 sm:truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-900/5 hover:text-ink-900 sm:h-8 sm:w-8"
          >
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:max-h-[65vh] sm:flex-none sm:px-6 sm:py-5">{children}</div>

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-ink-900/[0.07] bg-surface-soft/40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:px-6 sm:py-3.5 [&>*]:flex-1 sm:[&>*]:flex-none">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
