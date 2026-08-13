import { useEffect, useRef, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  CalendarRange,
  UsersRound,
  X,
  CheckCheck,
  Plane,
  Clock3,
  ChevronDown,
  LogOut,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../store/AppStore.jsx';

const seedNotifications = [
  { id: 'n1', title: 'Payment received', body: '₹1,86,000 against INV-4411', when: '1 hr ago', read: false },
  { id: 'n2', title: 'New enquiry', body: 'Jayashree Patil · Kerala · 4 pax', when: '3 hrs ago', read: false },
  { id: 'n3', title: 'Visa deadline', body: 'Rahul Menon — Schengen slot pending', when: 'Yesterday', read: true },
];

/** Live wall clock beside the search bar — ticks every second. */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const date = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="hidden shrink-0 items-center gap-2 rounded-lg bg-surface-soft px-2.5 py-1.5 lg:flex"
      title={`Live · ${date}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Clock3 size={14} className="hidden shrink-0 text-ink-400 xl:block" />
      <span className="num whitespace-nowrap text-sm font-bold leading-none text-ink-900">{time}</span>
      <span className="hidden whitespace-nowrap text-xs font-semibold leading-none text-ink-500 2xl:block">
        {date}
      </span>
    </div>
  );
}

/**
 * The panel's only navigation surface: brand and section tabs on the first
 * row, the pages inside the active section on the second. No sidebar — the
 * content keeps the full width of the window.
 */
export default function Header({ onOpenMobile }) {
  const navigate = useNavigate();
  const {
    enquiries,
    bookings,
    customers,
    owner,
    setOwner,
    range,
    setRange,
    refresh,
    team,
    settings,
    auth,
    signOut,
    resetDemo,
  } = useApp();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const searchBoxRef = useRef(null);
  const bellRef = useRef(null);
  const menuRef = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Focus the field once the panel is actually on screen.
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onDown = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? [
        ...enquiries
          .filter((e) => `${e.name} ${e.phone} ${e.destination}`.toLowerCase().includes(q))
          .slice(0, 4)
          .map((e) => ({ id: e.id, label: e.name, meta: `Enquiry · ${e.destination}`, to: '/enquiries' })),
        ...bookings
          .filter((b) => `${b.id} ${b.customer} ${b.pkg}`.toLowerCase().includes(q))
          .slice(0, 4)
          .map((b) => ({ id: b.id, label: b.customer, meta: `Booking · ${b.id}`, to: '/bookings' })),
        ...customers
          .filter((c) => `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q))
          .slice(0, 4)
          .map((c) => ({ id: c.id, label: c.name, meta: `Customer · ${c.city}`, to: '/customers' })),
      ]
    : [];

  return (
    <header className="z-30 shrink-0 bg-white">
      {/* Row 1 — brand, section tabs, tools */}
      <div className="flex items-center gap-3 border-b border-ink-900/[0.07] px-4 sm:px-5">
        <button onClick={onOpenMobile} className="icon-btn my-2.5 h-9 w-9 lg:hidden">
          <Menu size={18} />
        </button>

        <NavLink to="/" className="my-2.5 flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-ocean text-white">
            <Plane size={17} strokeWidth={2.4} className="-rotate-45" />
          </span>
          <span className="hidden font-display text-[1.05rem] font-extrabold leading-none tracking-tight text-ink-900 sm:block">
            Smira<span className="text-brand-600"> Club</span>
          </span>
        </NavLink>

        <div className="ml-auto flex items-center gap-2 py-2">
          {/* Which slice of the business every page should show */}
          <label className="relative hidden xl:block">
            <CalendarRange size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-ink-900/10 bg-white py-2 pl-7 pr-7 text-sm font-semibold text-ink-700 outline-none transition hover:border-ink-900/20"
            >
              {['Today', 'Last 7 days', 'Last 30 days', 'This quarter', 'This year'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>

          <label className="relative hidden xl:block">
            <UsersRound size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-ink-900/10 bg-white py-2 pl-7 pr-7 text-sm font-semibold text-ink-700 outline-none transition hover:border-ink-900/20"
            >
              <option>All team members</option>
              {team
                .filter((t) => t.bookings > 0)
                .map((t) => (
                  <option key={t.id}>{t.name}</option>
                ))}
            </select>
          </label>

          <button className="icon-btn h-9 w-9" onClick={refresh} title="Refresh data">
            <RefreshCw size={16} />
          </button>

          {/* Global search — an icon, so the row stays short */}
          <div className="relative" ref={searchBoxRef}>
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="icon-btn h-9 w-9"
              title="Search (Ctrl+K)"
            >
              <Search size={17} />
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-11 z-40 w-[min(380px,90vw)] overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-ink-900/[0.07]">
                <div className="relative border-b border-ink-900/[0.07]">
                  <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search enquiries, bookings, customers…"
                    className="w-full border-0 bg-transparent py-3 pl-10 pr-10 text-sm text-ink-900 outline-none placeholder:text-ink-400"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {q ? (
                  <div className="max-h-80 overflow-y-auto py-1">
                    {results.length === 0 && (
                      <p className="px-4 py-5 text-sm text-ink-500">No matches for “{query}”</p>
                    )}
                    {results.map((r) => (
                      <button
                        key={`${r.to}-${r.id}`}
                        onClick={() => {
                          navigate(r.to);
                          setQuery('');
                          setSearchOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-soft"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink-900">{r.label}</span>
                          <span className="block truncate text-xs text-ink-500">{r.meta}</span>
                        </span>
                        <span className="text-xs font-semibold text-brand-700">{r.id}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-4 text-xs text-ink-500">
                    Type a name, phone number or record ID. Press{' '}
                    <kbd className="rounded border border-ink-900/10 bg-surface-soft px-1.5 py-0.5 text-[10px] font-bold">
                      Esc
                    </kbd>{' '}
                    to close.
                  </p>
                )}
              </div>
            )}
          </div>

          <LiveClock />

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button onClick={() => setBellOpen((o) => !o)} className="icon-btn relative h-9 w-9">
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-11 z-30 w-[320px] overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-ink-900/[0.07]">
                <div className="flex items-center justify-between border-b border-ink-900/[0.07] px-4 py-3">
                  <p className="text-sm font-bold text-ink-900">Notifications</p>
                  <button
                    onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                </div>
                <ul className="max-h-80 divide-y divide-ink-900/[0.07] overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-3 transition hover:bg-surface-soft ${n.read ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-ink-900">{n.title}</p>
                          <p className="text-xs text-ink-500">{n.body}</p>
                          <p className="mt-0.5 text-[11px] text-ink-400">{n.when}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-ink-500">You're all caught up</li>
                  )}
                </ul>
                <button
                  onClick={() => setNotifications([])}
                  className="w-full border-t border-ink-900/[0.07] py-2.5 text-xs font-semibold text-ink-500 hover:text-rose-600"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border border-ink-900/10 bg-white py-1 pl-1 pr-2 text-left shadow-xs transition hover:border-ink-900/20 hover:bg-surface-soft"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-600 text-[11px] font-bold text-white">
                {auth?.initials || 'SC'}
              </span>
              <span className="hidden min-w-0 xl:block">
                <span className="block truncate text-sm font-bold leading-tight text-ink-900">
                  {auth?.name || 'Signed in'}
                </span>
                <span className="num block truncate text-[11px] leading-tight text-ink-500">
                  +91 {auth?.phone || '—'}
                </span>
              </span>
              <ChevronDown size={15} className={`shrink-0 text-ink-500 transition ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-30 w-[240px] overflow-hidden rounded-xl bg-white py-1 shadow-lift ring-1 ring-ink-900/[0.07]">
                <div className="border-b border-ink-900/[0.07] px-3.5 py-3">
                  <p className="truncate text-sm font-bold text-ink-900">{auth?.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {auth?.role} · {settings.agency.name}
                  </p>
                </div>
                {/* Account settings hidden with the System tab — restore both
                    together when the client asks for Settings back. */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    resetDemo();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-ink-700 hover:bg-surface-soft"
                >
                  <RotateCcw size={15} /> Reset demo data
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                    navigate('/login', { replace: true });
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
