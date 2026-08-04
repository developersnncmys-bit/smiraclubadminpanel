const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/15',
  rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/15',
  sky: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/15',
  violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/15',
  teal: 'bg-brand-50 text-brand-700 ring-1 ring-brand-600/15',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/15',
};

export default function Badge({ tone = 'slate', children, dot = false, className = '' }) {
  return (
    <span className={`chip ${tones[tone] || tones.slate} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
