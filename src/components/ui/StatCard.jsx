import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline from './Sparkline.jsx';

const skins = {
  brand: 'from-brand-600 to-brand-400 text-white',
  ocean: 'from-sky-600 to-sky-400 text-white',
  grape: 'from-violet-600 to-violet-400 text-white',
  coral: 'from-orange-500 to-amber-400 text-white',
  plain: 'bg-surface-card text-ink-800',
};

export default function StatCard({ icon: Icon, label, value, delta, series = [], skin = 'plain' }) {
  const filled = skin !== 'plain';
  const up = (delta ?? 0) >= 0;

  return (
    <article
      className={`card card-hover relative overflow-hidden p-5 ${
        filled ? `border-transparent bg-gradient-to-br ${skins[skin]}` : skins.plain
      }`}
    >
      {filled && (
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-xl" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl ${
              filled ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600'
            }`}
          >
            {Icon && <Icon size={18} strokeWidth={2.2} />}
          </span>
          <span className={`text-sm font-semibold ${filled ? 'text-white/85' : 'text-ink-500'}`}>{label}</span>
        </div>

        {delta !== undefined && (
          <span
            className={`chip ${
              filled
                ? 'bg-white/20 text-white'
                : up
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <p className={`font-display text-[2rem] font-extrabold leading-none ${filled ? 'text-white' : 'text-ink-900'}`}>
          {value}
        </p>
        {series.length > 0 && (
          <Sparkline
            data={series}
            stroke={filled ? '#ffffff' : '#14a58c'}
            fill={filled ? 'rgba(255,255,255,0.25)' : 'rgba(20,165,140,0.14)'}
            width={104}
            height={34}
          />
        )}
      </div>
    </article>
  );
}
