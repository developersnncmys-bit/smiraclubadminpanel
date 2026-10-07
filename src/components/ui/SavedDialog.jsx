import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useApp } from '../../store/AppStore.jsx';

/**
 * "Saved." — said where it cannot be missed.
 *
 * A toast in the corner is easy to look past, and on a page that was
 * already busy the desk could not tell whether a partner had actually
 * been added. This waits in the middle of the screen until somebody
 * acknowledges it.
 *
 * It appears when the server has said yes, not when the button was
 * pressed. The row goes into the table optimistically, as it always
 * did, but the row is a hope until the API answers — and a dialog
 * saying "Partner created" over a request that is about to fail is
 * worse than no dialog at all.
 */
export default function SavedDialog() {
  const { saved, clearSaved } = useApp();

  // Escape closes it, like every other dialog on the panel.
  useEffect(() => {
    if (!saved) return undefined;
    const onKey = (e) => e.key === 'Escape' && clearSaved();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [saved, clearSaved]);

  if (!saved) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-ink-900/45 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && clearSaved()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={saved.title}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lift"
      >
        <button
          type="button"
          onClick={clearSaved}
          aria-label="Close"
          className="float-right -mr-2 -mt-2 grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-surface-soft hover:text-ink-700"
        >
          <X size={15} />
        </button>

        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={30} />
        </span>

        <p className="mt-4 font-display text-lg font-extrabold text-ink-900">{saved.title}</p>
        {saved.detail && <p className="mt-1.5 text-sm text-ink-600">{saved.detail}</p>}
        {saved.code && (
          <p className="num mt-3 inline-block rounded-lg bg-surface-soft px-3 py-1.5 text-sm font-bold text-ink-800">
            {saved.code}
          </p>
        )}

        <button type="button" onClick={clearSaved} className="btn-action mt-6 w-full justify-center">
          Done
        </button>
      </div>
    </div>
  );
}
