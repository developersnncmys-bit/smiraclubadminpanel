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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-ink-900/45 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative my-auto w-full ${widths[size]} overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-ink-900/[0.07]`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink-900/[0.07] bg-surface-soft/40 px-6 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-[1.05rem] font-extrabold leading-tight text-ink-900">
              {title}
            </h2>
            {subtitle && <p className="mt-1 truncate text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-900/5 hover:text-ink-900"
          >
            <X size={17} />
          </button>
        </header>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-900/[0.07] bg-surface-soft/40 px-6 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
