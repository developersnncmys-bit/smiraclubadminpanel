import { Check } from 'lucide-react';

/**
 * Where a listing is in the client's partner flow.
 *
 *   Registration → Admin review → Contract → Live
 *
 * "Needs changes" is not a stop of its own: it is the listing going back to
 * Registration with a note, so it is drawn there, flagged, rather than as a
 * fifth box that a partner might think they have to pass through.
 */

export const FLOW = ['Registration', 'Admin review', 'Contract', 'Live'];

/** Where each stage sits on the line. */
export function flowIndex(stage, live) {
  if (live) return 3;
  if (stage === 'Contract') return 2;
  if (stage === 'Admin review') return 1;
  return 0;
}

export default function FlowTracker({ stage, live, className = '' }) {
  const at = flowIndex(stage, live);
  const sentBack = stage === 'Needs changes';

  return (
    <ol className={`flex flex-wrap items-center gap-x-1.5 gap-y-2 ${className}`}>
      {FLOW.map((step, i) => {
        const done = i < at || (live && i === at);
        const current = i === at && !live;
        return (
          <li key={step} className="flex items-center gap-1.5">
            {i > 0 && <span className={`h-px w-5 ${i <= at ? 'bg-brand-400' : 'bg-ink-900/10'}`} />}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                done
                  ? 'bg-emerald-50 text-emerald-700'
                  : current
                    ? sentBack
                      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                      : 'bg-brand-50 text-brand-800 ring-1 ring-brand-200'
                    : 'bg-surface-soft text-ink-400'
              }`}
            >
              {done ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <span className="num text-[11px]">{i + 1}</span>
              )}
              {current && sentBack ? 'Needs changes' : step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
