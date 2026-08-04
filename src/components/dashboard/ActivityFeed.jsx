import Card from '../ui/Card.jsx';
import { activityFeed } from '../../data/mockData.js';

const dots = {
  green: 'bg-emerald-500',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
};

export default function ActivityFeed() {
  return (
    <Card title="Recent activity" subtitle="Live feed across the team">
      <ol className="relative space-y-5 pl-5">
        <span className="absolute left-[5px] top-2 bottom-2 w-px bg-ink-900/10" />
        {activityFeed.map((a) => (
          <li key={a.id} className="relative">
            <span
              className={`absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                dots[a.tone] || dots.sky
              }`}
            />
            <p className="text-sm leading-snug text-ink-700">
              <span className="font-bold text-ink-900">{a.who}</span> {a.what}{' '}
              <span className="font-semibold text-brand-700">{a.target}</span>
            </p>
            <p className="mt-0.5 text-xs text-ink-400">{a.when}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
