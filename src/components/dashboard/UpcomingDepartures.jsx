import { Link, useNavigate } from 'react-router-dom';
import { Plane, Users } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import { useApp } from '../../store/AppStore.jsx';
import { bookingStatusTone, inr } from '../../data/mockData.js';

export default function UpcomingDepartures() {
  const { bookings } = useApp();
  const navigate = useNavigate();

  const upcoming = bookings
    .filter((b) => ['Confirmed', 'Part paid', 'Pending'].includes(b.status))
    .slice(0, 5);

  return (
    <Card
      eyebrow="Operations"
      title="Upcoming departures"
      subtitle="Next groups leaving — check documents and balances"
      bodyClass="divide-y divide-ink-900/[0.07]"
      action={
        <Link to="/bookings" className="text-sm font-semibold text-brand-700 hover:underline">
          Open bookings
        </Link>
      }
    >
      {upcoming.map((b) => {
        const pending = b.amount - b.paid;
        return (
          <button
            key={b.id}
            onClick={() => navigate('/bookings')}
            className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left transition hover:bg-brand-50/40"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Plane size={17} strokeWidth={2.3} className="-rotate-45" />
            </span>

            <div className="min-w-[170px] flex-1">
              <p className="text-sm font-bold text-ink-900">{b.customer}</p>
              <p className="truncate text-xs text-ink-500">{b.pkg}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-ink-900">{b.departure}</p>
              <p className="flex items-center justify-end gap-1 text-xs text-ink-500">
                <Users size={12} /> {b.pax} pax · {b.nights}N
              </p>
            </div>

            <div className="w-28 text-right">
              <p className="text-sm font-bold text-ink-900">{inr(b.amount)}</p>
              <p className={`text-xs font-semibold ${pending > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                {pending > 0 ? `${inr(pending)} due` : 'Fully paid'}
              </p>
            </div>

            <Badge tone={bookingStatusTone[b.status]} dot>
              {b.status}
            </Badge>
          </button>
        );
      })}

      {upcoming.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-ink-500">No departures scheduled</p>
      )}
    </Card>
  );
}
