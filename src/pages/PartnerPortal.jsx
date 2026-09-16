import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, BedDouble, Tags, CalendarDays, CalendarCheck, Users,
  Wallet, BarChart3, Star, FileText, Headphones, UserRound, LogOut, Check, X,
  Pencil, Loader2, RefreshCw, Clock3, Hourglass, FileSignature, XCircle,
} from 'lucide-react';
import Brand from '../components/ui/Brand.jsx';
import FlowTracker from '../components/partners/FlowTracker.jsx';
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

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Where they are in the flow decides what they see, so ask that first.
      const mine = await partnerApi.getListing();
      setListing(mine.data);
      if (mine.data.partner.live) {
        const res = await partnerApi.dashboard();
        setData(res.data);
      } else {
        setData(null);
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
      <Panel title="Availability calendar" note="Rooms open to members tonight">
        {data?.inventory?.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.inventory.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-xl border border-ink-900/[0.07] px-4 py-3">
                <span className="text-sm font-semibold text-ink-800">{i.name}</span>
                <span className="num text-sm font-bold text-brand-700">{i.available} open</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No inventory to show yet.</Empty>
        )}
      </Panel>
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
        <FlowTracker stage={me.stage} live={me.live} className="mt-4" />
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
