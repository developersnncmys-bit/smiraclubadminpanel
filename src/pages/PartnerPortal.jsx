import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, BedDouble, Tags, CalendarDays, CalendarCheck, Users,
  Wallet, BarChart3, Star, FileText, Headphones, UserRound, LogOut, Check, X,
  Pencil, Loader2, RefreshCw, Clock3, Hourglass, FileSignature, XCircle, TrendingUp,
} from 'lucide-react';
import Brand from '../components/ui/Brand.jsx';
import ListingWizard from '../components/partners/ListingWizard.jsx';
import Badge from '../components/ui/Badge.jsx';
import { inr } from '../data/mockData.js';
import { partnerApi, getPartnerToken, setPartnerToken } from '../lib/partnerApi.js';

/**
 * The partner portal — the only thing a partner can open.
 *
 * Built to the client's partner sheet: after approval, a dashboard with
 * today's overview, the twelve sections down the side, and the booking request
 * with Accept, Reject, Edit and Contact support. Everything on it is the
 * partner's own, fetched with the partner's own token; there is no route from
 * here into the staff panel.
 */

const DESK_PHONE = '+91 98337 33477';
const DESK_TEL = 'tel:+919833733477';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'property', label: 'My property', icon: Building2 },
  { key: 'rooms', label: 'Rooms & inventory', icon: BedDouble },
  { key: 'rates', label: 'Rates & offers', icon: Tags },
  { key: 'calendar', label: 'Availability calendar', icon: CalendarDays },
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'payments', label: 'Payments', icon: Wallet },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'performance', label: 'Performance', icon: TrendingUp },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'support', label: 'Support', icon: Headphones },
  { key: 'profile', label: 'Profile', icon: UserRound },
];

const day = (v) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const confirmationTone = (c = '') => {
  const v = c.toLowerCase();
  if (v.includes('confirmed')) return 'green';
  if (v.includes('declined')) return 'rose';
  return 'amber';
};

/** One figure in the overview row. */
function Figure({ label, value, hint, tone = 'text-ink-900' }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`num mt-1.5 font-display text-2xl font-extrabold ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

/** A plain white panel with a title — every section is built from these. */
function Panel({ title, note, children, action }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-extrabold text-ink-900">{title}</h2>
          {note && <p className="mt-0.5 text-sm text-ink-500">{note}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <p className="rounded-xl bg-surface-soft px-4 py-6 text-center text-sm text-ink-500">{children}</p>;
}

function Facts({ rows }) {
  return (
    <dl className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-4 border-b border-ink-900/[0.06] pb-2 text-sm">
          <dt className="text-ink-500">{k}</dt>
          <dd className="text-right font-semibold text-ink-900">{v || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The request card from the sheet, with the four buttons working. */
function BookingCard({ b, busy, onAccept, onDecline }) {
  const answered = /confirmed|declined/i.test(b.confirmation);
  return (
    <article className="rounded-2xl border border-ink-900/[0.08] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-base font-extrabold text-ink-900">Booking #{b.code}</p>
        <Badge tone={confirmationTone(b.confirmation)} dot>
          {b.confirmation}
        </Badge>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {[
          ['Property', b.property],
          ['Guest', b.guest],
          ['Check-in', day(b.checkIn)],
          ['Check-out', day(b.checkOut)],
          ['Room', b.roomType],
          ['Guests', `${b.adults || 0} adults${b.children ? `, ${b.children} children` : ''}`],
          ['Meal plan', b.mealPlan],
          ['Your payout', b.payout ? inr(b.payout) : '—'],
          ['Booking status', b.status],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="text-ink-500">{k}</dt>
            <dd className="text-right font-semibold text-ink-900">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-900/[0.07] pt-4">
        <button
          type="button"
          onClick={() => onAccept(b)}
          disabled={busy || answered || b.status === 'Cancelled'}
          className="btn-action btn-sm"
        >
          {busy === 'accept' ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Accept
        </button>
        <button
          type="button"
          onClick={() => onDecline(b)}
          disabled={busy || answered || b.status === 'Cancelled'}
          className="btn-line btn-sm"
        >
          {busy === 'decline' ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Reject
        </button>
        {/* A partner changes a booking by asking the desk — dates and rooms
            are agreed with the member, not rewritten from one side. */}
        <a href={DESK_TEL} className="btn-line btn-sm">
          <Pencil size={13} /> Edit
        </a>
        <a href={DESK_TEL} className="btn-line btn-sm">
          <Headphones size={13} /> Contact support
        </a>
      </div>
    </article>
  );
}

export default function PartnerPortal() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  /** The partner and their five-step listing — loaded before anything else. */
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('dashboard');
  const [busy, setBusy] = useState({});
  const [note, setNote] = useState('');

  /** Their switch, their score, and the month they are looking at. */
  const [accepting, setAccepting] = useState(true);
  const [score, setScore] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [month, setMonth] = useState(() => new Date());
  const [picked, setPicked] = useState(null);
  const [roomsOpen, setRoomsOpen] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Where they are in the flow decides what they see, so ask that first.
      const mine = await partnerApi.getListing();
      setListing(mine.data);
      setAccepting(mine.data.partner.acceptingBookings !== false);
      if (mine.data.partner.live) {
        const [res, how] = await Promise.all([
          partnerApi.dashboard(),
          partnerApi.performance().catch(() => ({ data: null })),
        ]);
        setData(res.data);
        setScore(how.data);
      } else {
        setData(null);
        setScore(null);
      }
    } catch (err) {
      if (!getPartnerToken()) {
        navigate('/partner/login', { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (getPartnerToken()) load();
  }, [load]);

  // A booking can arrive while this is open, so the portal looks again every
  // half minute and whenever the partner comes back to the tab.
  useEffect(() => {
    if (!getPartnerToken()) return undefined;
    const again = () => {
      if (document.visibilityState === 'visible') load();
    };
    const timer = setInterval(again, 30000);
    document.addEventListener('visibilitychange', again);
    window.addEventListener('focus', again);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', again);
      window.removeEventListener('focus', again);
    };
  }, [load]);

  /** The month the calendar is showing, read from the server. */
  const loadCalendar = useCallback(async () => {
    if (!listing?.partner?.live) return;
    const from = new Date(month.getFullYear(), month.getMonth(), 1);
    try {
      const res = await partnerApi.availability(from.toISOString().slice(0, 10), 42);
      setCalendar(res.data);
    } catch {
      setCalendar(null);
    }
  }, [listing?.partner?.live, month]);

  useEffect(() => { loadCalendar(); }, [loadCalendar]);

  const DAY_MS = 86400000;
  const monthGrid = (() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, n) => new Date(start.getTime() + n * DAY_MS));
  })();
  const shiftMonth = (by) => {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1));
    setPicked(null);
  };
  const calDay = (d) =>
    (calendar?.days || []).find((x) => new Date(x.date).toDateString() === d.toDateString());

  /** Opening or closing the property to new requests. */
  const toggleAccepting = async () => {
    const next = !accepting;
    setBusy((b) => ({ ...b, accepting: true }));
    try {
      await partnerApi.setAccepting(next);
      setAccepting(next);
      setNote(next ? 'You are open for bookings' : 'Closed — no new requests will be sent');
    } catch (err) {
      setNote(err.message || 'That did not save');
    }
    setBusy((b) => ({ ...b, accepting: false }));
  };

  /** How many rooms of one property are open on the chosen day. */
  const saveDay = async (item) => {
    if (!picked) return;
    try {
      await partnerApi.setAvailability({
        item: item.id,
        date: picked.toISOString(),
        left: Number(roomsOpen[item.id] ?? item.units),
      });
      await loadCalendar();
      setNote('Availability saved');
    } catch (err) {
      setNote(err.message || 'That did not save');
    }
  };

  const answer = async (b, accepted) => {
    setBusy((x) => ({ ...x, [b.id]: accepted ? 'accept' : 'decline' }));
    setNote('');
    try {
      const res = await partnerApi[accepted ? 'accept' : 'decline'](b.id);
      setData((d) => ({ ...d, bookings: d.bookings.map((x) => (x.id === b.id ? res.data : x)) }));
      setNote(`${accepted ? 'Accepted' : 'Declined'} #${b.code} — the Smira desk has been told.`);
    } catch (err) {
      setNote(err.message);
    } finally {
      setBusy((x) => ({ ...x, [b.id]: null }));
    }
  };

  const signOut = () => {
    setPartnerToken(null);
    navigate('/partner/login', { replace: true });
  };

  const guests = useMemo(() => {
    const seen = new Map();
    (data?.bookings || []).forEach((b) => {
      const g = seen.get(b.guest) || { name: b.guest, stays: 0, last: null };
      g.stays += 1;
      if (!g.last || new Date(b.checkIn) > new Date(g.last)) g.last = b.checkIn;
      seen.set(b.guest, g);
    });
    return [...seen.values()];
  }, [data]);

  if (!getPartnerToken()) return <Navigate to="/partner/login" replace />;

  const p = data?.partner;
  const o = data?.overview || {};
  const bookings = data?.bookings || [];
  const waiting = bookings.filter((b) => !/confirmed|declined/i.test(b.confirmation) && b.status !== 'Cancelled');

  const body = {
    dashboard: (
      <>
        {/* The partner's own switch, above everything: taking bookings, or not. */}
        <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="font-display text-base font-extrabold text-ink-900">
              {accepting ? 'Open for bookings' : 'Closed for bookings'}
            </p>
            <p className="mt-0.5 text-sm text-ink-500">
              {accepting
                ? 'Smira may send you new booking requests.'
                : 'No new requests will be sent. Bookings you have already accepted stand.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={accepting}
            aria-label="Taking bookings"
            disabled={busy.accepting}
            onClick={toggleAccepting}
            className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-60 ${
              accepting ? 'bg-emerald-500' : 'bg-ink-900/20'
            }`}
          >
            <span
              className={`absolute top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow transition-all ${
                accepting ? 'left-7' : 'left-1'
              }`}
            >
              {busy.accepting ? <Loader2 size={13} className="animate-spin text-ink-500" /> : null}
            </span>
          </button>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <Figure label="Total bookings" value={o.bookings ?? 0} />
          <Figure label="Upcoming check-ins" value={o.upcoming ?? 0} hint="next 7 days" />
          <Figure label="Today's check-ins" value={o.today ?? 0} />
          <Figure label="Available rooms" value={o.rooms ?? 0} tone="text-brand-700" />
          <Figure label="Revenue" value={inr(o.revenue || 0)} hint="this month" tone="text-emerald-600" />
          <Figure
            label="Pending payments"
            value={inr(o.pending || 0)}
            tone={o.pending ? 'text-amber-600' : 'text-ink-900'}
          />
          <Figure label="Cancellations" value={o.cancellations ?? 0} tone={o.cancellations ? 'text-rose-600' : 'text-ink-900'} />
        </div>

        <Panel
          title="Waiting on you"
          note={waiting.length ? 'Accept or reject so the member is not left waiting' : 'Nothing needs an answer right now'}
        >
          {waiting.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {waiting.map((b) => (
                <BookingCard
                  key={b.id}
                  b={b}
                  busy={busy[b.id]}
                  onAccept={(x) => answer(x, true)}
                  onDecline={(x) => answer(x, false)}
                />
              ))}
            </div>
          ) : (
            <Empty>All your booking requests have been answered.</Empty>
          )}
        </Panel>
      </>
    ),

    property: (
      <Panel title="My property" note="What members see about you">
        <Facts
          rows={[
            ['Name', p?.name],
            ['Partner code', p?.code],
            ['Category', p?.category],
            ['Location', p?.location],
            ['Rooms or units', p?.rooms],
            ['Rating', p?.rating ? `${p.rating} ★` : 'Not rated yet'],
          ]}
        />
      </Panel>
    ),

    rooms: (
      <Panel title="Rooms & inventory" note="What is released to Smira members">
        {data?.inventory?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Room or service', 'Total', 'Booked', 'Blocked', 'Available', 'Status'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {data.inventory.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5 font-semibold text-ink-900">{i.name}</td>
                    <td className="num py-2.5">{i.units}</td>
                    <td className="num py-2.5">{i.booked}</td>
                    <td className="num py-2.5">{i.blocked}</td>
                    <td className="num py-2.5 font-bold text-brand-700">{i.available}</td>
                    <td className="py-2.5"><Badge tone={i.status === 'Active' ? 'green' : 'slate'}>{i.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No rooms released yet. The desk adds these when your rate plan is signed.</Empty>
        )}
      </Panel>
    ),

    rates: (
      <Panel title="Rates & offers" note="The terms you agreed with Smira">
        <Facts
          rows={[
            ['Rate plan', p?.ratePlan],
            ['Smira commission', p?.commission ? `${p.commission}%` : '—'],
            ['Contract ends', day(p?.contractEndsOn)],
          ]}
        />
        <p className="mt-4 text-xs text-ink-500">
          To change a rate or add an offer, call the partnerships desk on {DESK_PHONE}.
        </p>
      </Panel>
    ),

    calendar: (
      <>
        <Panel
          title="Availability calendar"
          note="What is open each day, and who is staying"
          action={
            <span className="flex items-center gap-2">
              <button type="button" className="btn-line btn-sm" onClick={() => shiftMonth(-1)}>Previous</button>
              <span className="min-w-[8.5rem] text-center text-sm font-bold text-ink-900">
                {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" className="btn-line btn-sm" onClick={() => shiftMonth(1)}>Next</button>
            </span>
          }
        >
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d} className="pb-1 text-[11px] font-bold uppercase tracking-wide text-ink-400">{d}</span>
            ))}
            {monthGrid.map((d) => {
              const row = calDay(d);
              const thisMonth = d.getMonth() === month.getMonth();
              const on = picked && d.toDateString() === picked.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setPicked(d)}
                  className={`rounded-xl border px-1 py-2 text-left transition ${
                    on ? 'border-brand-500 bg-brand-50' : 'border-ink-900/[0.07] hover:border-brand-300'
                  } ${thisMonth ? '' : 'opacity-40'}`}
                >
                  <span className="num block text-center text-xs font-bold text-ink-900">{d.getDate()}</span>
                  {row && (
                    <>
                      <span className={`num block text-center text-[11px] font-bold ${row.blackout ? 'text-rose-600' : row.open ? 'text-emerald-600' : 'text-ink-400'}`}>
                        {row.blackout ? 'closed' : `${row.open} open`}
                      </span>
                      {row.staying > 0 && (
                        <span className="block text-center text-[10px] text-ink-500">{row.staying} staying</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel
          title={picked ? `${picked.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Pick a day'}
          note={picked ? 'Set how many rooms are open that day' : 'Choose a day above to change it'}
        >
          {picked ? (
            <div className="space-y-3">
              {(calendar?.items || []).map((i) => (
                <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-900/[0.07] px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink-800">{i.name}</span>
                    <span className="block text-xs text-ink-500">{i.units} rooms in total</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={i.units}
                      key={`${i.id}-${picked.toDateString()}`}
                      defaultValue={i.units}
                      onChange={(e) => setRoomsOpen((v) => ({ ...v, [i.id]: e.target.value }))}
                      className="input h-9 w-24 py-0 text-sm"
                    />
                    <button type="button" className="btn-action btn-sm" onClick={() => saveDay(i)}>
                      Save
                    </button>
                  </span>
                </div>
              ))}
              {!(calendar?.items || []).length && <Empty>No rooms are listed against you yet.</Empty>}
              {calDay(picked)?.guests?.length > 0 && (
                <p className="text-sm text-ink-600">
                  Staying that night: {calDay(picked).guests.join(', ')}
                </p>
              )}
            </div>
          ) : (
            <Empty>Pick a day on the calendar.</Empty>
          )}
        </Panel>
      </>
    ),

    performance: (
      <>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Figure label="Bookings sent to you" value={score?.bookings ?? 0} />
          <Figure label="Answered" value={score?.answered ?? 0} hint={`${score?.waiting ?? 0} waiting`} />
          <Figure
            label="Acceptance rate"
            value={score?.acceptanceRate != null ? `${score.acceptanceRate}%` : '—'}
            tone={(score?.acceptanceRate ?? 100) >= 80 ? 'text-emerald-600' : 'text-amber-600'}
          />
          <Figure
            label="Answered in"
            value={score?.responseHours != null ? `${score.responseHours} h` : '—'}
            hint="on average"
          />
          <Figure label="Completed stays" value={score?.completed ?? 0} />
          <Figure
            label="Cancellation rate"
            value={score?.cancellationRate != null ? `${score.cancellationRate}%` : '—'}
            tone={(score?.cancellationRate ?? 0) > 10 ? 'text-rose-600' : 'text-ink-900'}
          />
          <Figure label="Earned" value={inr(score?.earned || 0)} tone="text-brand-700" />
          <Figure
            label="Still owed to you"
            value={inr(Math.max(0, (score?.earned || 0) - (score?.paidOut || 0)))}
            tone={(score?.earned || 0) - (score?.paidOut || 0) > 0 ? 'text-amber-600' : 'text-ink-900'}
          />
        </div>

        <Panel title="How Smira scores you" note="The same figures the desk sees on your record">
          <Facts
            rows={[
              ['Rating from members', score?.rating ? `${score.rating} / 5` : 'Not rated yet'],
              ['Booking requests answered', `${score?.answered ?? 0} of ${score?.bookings ?? 0}`],
              ['Declined', score?.declineRate != null ? `${score.declineRate}%` : '—'],
              ['Average answer time', score?.responseHours != null ? `${score.responseHours} hours` : '—'],
            ]}
          />
          <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
            Answering quickly and turning few requests away is what keeps you in front of members.
          </p>
        </Panel>
      </>
    ),

    bookings: (
      <Panel title="Bookings" note={`${bookings.length} in total`}>
        {bookings.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {bookings.map((b) => (
              <BookingCard
                key={b.id}
                b={b}
                busy={busy[b.id]}
                onAccept={(x) => answer(x, true)}
                onDecline={(x) => answer(x, false)}
              />
            ))}
          </div>
        ) : (
          <Empty>No bookings yet.</Empty>
        )}
      </Panel>
    ),

    customers: (
      <Panel title="Customers" note="Guests who have booked with you through Smira">
        {guests.length ? (
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {guests.map((g) => (
              <li key={g.name} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-semibold text-ink-900">{g.name}</span>
                <span className="text-ink-500">
                  {g.stays} stay{g.stays === 1 ? '' : 's'} · last {day(g.last)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No guests yet.</Empty>
        )}
      </Panel>
    ),

    payments: (
      <Panel title="Payments" note="What Smira owes you, booking by booking">
        {bookings.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Booking', 'Guest', 'Payout', 'Paid', 'Balance'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="num py-2.5 font-bold text-brand-700">{b.code}</td>
                    <td className="py-2.5">{b.guest}</td>
                    <td className="num py-2.5">{inr(b.payout)}</td>
                    <td className="num py-2.5">{inr(b.paidOut)}</td>
                    <td className="num py-2.5 font-bold text-amber-600">{inr(Math.max(0, b.payout - b.paidOut))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No payments yet.</Empty>
        )}
      </Panel>
    ),

    reports: (
      <Panel title="Reports" note="How you are doing with Smira members">
        <Facts
          rows={[
            ['Bookings', o.bookings ?? 0],
            ['Cancellations', o.cancellations ?? 0],
            ['Revenue this month', inr(o.revenue || 0)],
            ['Average response time', p?.responseMins ? `${p.responseMins} min` : '—'],
          ]}
        />
      </Panel>
    ),

    reviews: (
      <Panel title="Reviews" note="What members have said">
        {p?.rating ? (
          <p className="flex items-center gap-2 text-sm text-ink-700">
            <Star size={18} className="fill-amber-400 text-amber-400" />
            <span className="num font-display text-2xl font-extrabold text-ink-900">{p.rating}</span>
            average from Smira members
          </p>
        ) : (
          <Empty>No reviews yet.</Empty>
        )}
      </Panel>
    ),

    documents: (
      <Panel title="Documents" note="The papers on your account">
        {p?.documents?.length ? (
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {p.documents.map((d) => (
              <li key={d.name} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-semibold text-ink-900">{d.name}</span>
                <Badge tone={d.status === 'Verified' ? 'green' : 'amber'}>{d.status}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Your verification: {p?.verification || '—'}. The desk will ask for anything missing.</Empty>
        )}
      </Panel>
    ),

    support: (
      <Panel
        title="Support"
        note="Your tickets with the partnerships desk"
        action={
          <a href={DESK_TEL} className="btn-action btn-sm">
            <Headphones size={13} /> Call {DESK_PHONE}
          </a>
        }
      >
        {data?.tickets?.length ? (
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {data.tickets.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  <span className="num font-bold text-brand-700">{t.code}</span>{' '}
                  <span className="text-ink-800">{t.subject}</span>
                </span>
                <Badge tone={/closed|resolved/i.test(t.status || '') ? 'green' : 'amber'}>{t.status}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No open tickets.</Empty>
        )}
      </Panel>
    ),

    profile: (
      <Panel title="Profile" note="Who Smira contacts">
        <Facts
          rows={[
            ['Contact person', p?.contact],
            ['Mobile', p?.phone],
            ['Email', p?.email],
            ['Account status', p?.status],
            ['Approval', p?.approval],
          ]}
        />
        <button type="button" onClick={signOut} className="btn-line mt-5">
          <LogOut size={15} /> Sign out
        </button>
      </Panel>
    ),
  };

  const me = listing?.partner;

  /** Everything before live: the form, or where the form has got to. */
  const journey = me && !me.live && (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:p-6">
      <div className="card p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-brand-600">Your listing</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
          {me.name === 'New partner' ? 'List your property with Smira Club' : me.name}
        </h1>
      </div>

      {me.editable ? (
        <ListingWizard
          initial={listing.listing}
          partner={me}
          onSubmitted={(d) => {
            setListing(d);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : me.stage === 'Admin review' ? (
        <div className="card p-6 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Hourglass size={26} />
          </span>
          <h2 className="mt-4 font-display text-xl font-extrabold text-ink-900">Submitted — the Smira desk is reviewing it</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            We check the property, the rates and your papers, and verify the address. If anything needs
            changing we will tell you here, and you can edit and send it back.
          </p>
          {me.submittedOn && (
            <p className="mt-4 text-xs font-semibold text-ink-400">
              Submitted {new Date(me.submittedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      ) : me.stage === 'Contract' ? (
        <div className="card p-6 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <FileSignature size={26} />
          </span>
          <h2 className="mt-4 font-display text-xl font-extrabold text-ink-900">Approved — your contract is next</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            Our partnerships desk will send the agreement to sign. Once it is signed your listing goes
            live and your dashboard opens here.
          </p>
          <a href={DESK_TEL} className="btn-line mt-5 inline-flex">
            <Headphones size={15} /> Call {DESK_PHONE}
          </a>
        </div>
      ) : (
        <div className="card p-6 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-600">
            <XCircle size={26} />
          </span>
          <h2 className="mt-4 font-display text-xl font-extrabold text-ink-900">We could not list this property</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            Call the partnerships desk on {DESK_PHONE} if you would like to talk it through.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* -- Top bar ------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-ink-900/[0.07] bg-white">
        <div className="flex items-center gap-4 px-4 py-2.5 sm:px-6">
          <Brand className="h-9 sm:h-10" />
          <span className="chip hidden bg-brand-50 text-brand-700 sm:inline-flex">Partner portal</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-bold text-ink-900">{(p || me)?.name || '…'}</span>
              <span className="block text-xs text-ink-500">{(p || me)?.code}</span>
            </span>
            <button type="button" onClick={load} className="icon-btn h-9 w-9" title="Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button type="button" onClick={signOut} className="icon-btn h-9 w-9" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* The sections, as a scroller on a phone. */}
        {me?.live && (
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-ink-900/[0.05] px-3 py-2 lg:hidden">
          {SECTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
                section === key ? 'bg-brand-50 text-brand-800' : 'text-ink-500'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        )}
      </header>

      {error && !me ? (
        <div className="mx-auto max-w-md p-6">
          <div className="card p-6 text-center">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button type="button" onClick={load} className="btn-line mt-4">
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        </div>
      ) : !me ? (
        <div className="flex items-center justify-center gap-2 p-16 text-sm text-ink-500">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : !me.live ? (
        journey
      ) : (

      <div className="flex">
        {/* -- The twelve sections, and the dashboard ---------------------- */}
        <aside className="sticky top-[61px] hidden h-[calc(100vh-61px)] w-[236px] shrink-0 overflow-y-auto border-r border-ink-900/[0.07] bg-white px-3 py-4 lg:block">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                section === key ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-surface-soft'
              }`}
            >
              {section === key && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-600" />
              )}
              <Icon size={17} className={section === key ? 'text-brand-700' : 'text-ink-400'} />
              {label}
            </button>
          ))}
        </aside>

        <main className="min-w-0 flex-1 space-y-4 p-4 sm:p-6">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
              {SECTIONS.find((s) => s.key === section)?.label}
            </h1>
            {section === 'dashboard' && (
              <p className="mt-1 text-sm text-ink-500">
                <Clock3 size={13} className="mr-1 inline" />
                Today&rsquo;s overview for {p?.name || 'your property'}
              </p>
            )}
          </div>

          {note && (
            <p className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
              {note}
            </p>
          )}

          {error ? (
            <div className="card p-6 text-center">
              <p className="text-sm font-semibold text-rose-600">{error}</p>
              <button type="button" onClick={load} className="btn-line mt-4">
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          ) : loading && !data ? (
            <div className="card flex items-center justify-center gap-2 p-10 text-sm text-ink-500">
              <Loader2 size={16} className="animate-spin" /> Loading your dashboard…
            </div>
          ) : (
            body[section]
          )}
        </main>
      </div>
      )}
    </div>
  );
}
