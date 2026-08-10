import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline from './Sparkline.jsx';

/**
 * KPI tile. The default is a plain white surface — colour is reserved for the
 * one headline metric a screen wants to lead with (`skin`).
 */
const skins = {
  brand: 'from-brand-700 to-brand-500 text-white',
  ocean: 'from-sky-700 to-sky-500 text-white',
  grape: 'from-violet-700 to-violet-500 text-white',
  coral: 'from-orange-600 to-amber-500 text-white',
  plain: 'bg-surface-card',
};

export default function StatCard({ icon: Icon, label, value, delta, series = [], skin = 'plain', hint }) {
  const filled = skin !== 'plain';
  const up = (delta ?? 0) >= 0;

  return (
    <article
      className={`card card-hover relative h-full overflow-hidden px-5 py-4 ${
        filled ? `border-transparent bg-gradient-to-br ${skins[skin]}` : skins.plain
      }`}
    >
      {filled && (
        <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      )}

      <div className="relative flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          {Icon && (
            <Icon
              size={15}
              strokeWidth={2.3}
              className={filled ? 'shrink-0 text-white/70' : 'shrink-0 text-ink-400'}
            />
          )}
          <span
            className={`truncate text-xs font-semibold uppercase tracking-[0.08em] ${
              filled ? 'text-white/75' : 'text-ink-500'
            }`}
          >
            {label}
          </span>
        </span>

        {delta !== undefined && (
          <span
            className={`chip shrink-0 px-2 py-0.5 text-[11px] ${
              filled
                ? 'bg-white/15 text-white'
                : up
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15'
                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/15'
            }`}
          >
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {up ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`font-display text-[1.75rem] font-extrabold leading-none tracking-tight num ${
              filled ? 'text-white' : 'text-ink-900'
            }`}
          >
            {value}
          </p>
          {hint && (
            <p className={`mt-1.5 truncate text-xs ${filled ? 'text-white/70' : 'text-ink-500'}`}>
              {hint}
            </p>
          )}
        </div>

        {series.length > 0 && (
          <Sparkline
            data={series}
            stroke={filled ? '#ffffff' : '#14a58c'}
            fill={filled ? 'rgba(255,255,255,0.22)' : 'rgba(20,165,140,0.12)'}
            width={96}
            height={30}
          />
        )}
      </div>
    </article>
  );
}
