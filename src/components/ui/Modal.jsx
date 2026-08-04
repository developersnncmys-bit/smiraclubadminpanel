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
        className={`relative my-auto w-full ${widths[size]} rounded-2xl bg-white shadow-lift`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink-900/5 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-500 transition hover:bg-surface-soft hover:text-ink-900"
          >
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2.5 border-t border-ink-900/5 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
