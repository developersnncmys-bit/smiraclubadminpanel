import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import { shortInr } from '../../data/mockData.js';
import { useApp } from '../../store/AppStore.jsx';

export default function TopDestinations() {
  const { bookings } = useApp();

  // Rolled up from the bookings on file, so it always matches them.
  const tally = bookings.reduce((acc, b) => {
    const key = b.destination || b.pkg || 'Unknown';
    acc[key] = acc[key] || { name: key, bookings: 0, revenue: 0 };
    acc[key].bookings += 1;
    acc[key].revenue += Number(b.amount || 0);
    return acc;
  }, {});
  const topDestinations = Object.values(tally)
    .sort((a, b) => b.bookings - a.bookings || b.revenue - a.revenue)
    .slice(0, 6);
  const max = Math.max(1, ...topDestinations.map((d) => d.bookings));

  return (
    <Card
      eyebrow="Demand"
      title="Top destinations"
      subtitle="Bookings and revenue this quarter"
      action={
        <Link to="/reports" className="text-sm font-semibold text-brand-700 hover:underline">
          View all
        </Link>
      }
    >
      <ul className="space-y-4">
        {topDestinations.map((d, i) => (
          <li key={d.name}>
            <div className="mb-1.5 flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <MapPin size={15} strokeWidth={2.3} />
              </span>
              <span className="flex-1 text-sm font-bold text-ink-900">{d.name}</span>
              <span className="text-sm font-semibold text-ink-600">{d.bookings} bookings</span>
              <span className="w-20 text-right text-sm font-bold text-brand-700">{shortInr(d.revenue)}</span>
            </div>
            <div className="ml-11 h-2 overflow-hidden rounded-full bg-surface-soft">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-ocean transition-all duration-700"
                style={{ width: `${(d.bookings / max) * 100}%`, transitionDelay: `${i * 60}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
