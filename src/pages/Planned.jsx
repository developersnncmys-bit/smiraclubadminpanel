import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Hammer } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import { moduleByPath } from '../data/modules.js';

/**
 * Stands in for a module that is agreed but not built. It says plainly that
 * the screen is not ready and lists what it will hold, so a demo can walk the
 * whole product without anyone mistaking an empty page for a finished one.
 */
export default function Planned() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const module = moduleByPath[pathname];

  if (!module) {
    return (
      <PageHeader title="Not found" subtitle="This page does not exist in the panel." />
    );
  }

  const { label, icon: Icon, blurb, points } = module;

  return (
    <>
      <PageHeader title={label} subtitle={blurb} />

      <div className="card mx-auto max-w-3xl p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon size={26} strokeWidth={2} />
        </span>

        <p className="chip mx-auto mt-5 bg-amber-50 text-amber-800 ring-1 ring-amber-600/15">
          <Hammer size={12} /> Not built yet
        </p>

        <h2 className="mt-4 font-display text-xl font-extrabold tracking-tight text-ink-900">
          {label} is planned for a later round
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-500">
          The screen is not ready. When it is, this is what it will hold.
        </p>

        <ul className="mx-auto mt-6 grid max-w-lg gap-2.5 text-left sm:grid-cols-2">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 rounded-xl bg-surface-soft px-3.5 py-2.5">
              <Check size={14} className="mt-0.5 shrink-0 text-brand-600" strokeWidth={3} />
              <span className="text-sm text-ink-700">{p}</span>
            </li>
          ))}
        </ul>

        <button className="btn-primary mx-auto mt-7" onClick={() => navigate('/')}>
          Back to dashboard <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}
