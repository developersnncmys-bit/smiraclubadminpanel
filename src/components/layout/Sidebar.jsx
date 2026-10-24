import { NavLink } from 'react-router-dom';
import { X, LifeBuoy, CalendarRange, UsersRound, RefreshCw } from 'lucide-react';
import { navFor } from '../../data/nav.js';
import { useApp } from '../../store/AppStore.jsx';

/**
 * Section rail: the five sections with their pages listed underneath. Nothing
 * collapses or expands — everything the desk can open is visible at once.
 */
function NavList({ counts, onNavigate, groups }) {
  return (
    <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
      {groups.map((group, i) => (
        <div key={group.section || i} className={i === 0 ? '' : 'mt-5'}>
          {/* A flat list has no section label */}
          {group.section && <p className="eyebrow mb-1.5 px-3">{group.section}</p>}

          <div className="space-y-0.5">
            {group.items.map(({ to, label, icon: Icon, badgeKey, tag, planned }) => {
              const badge = badgeKey ? counts[badgeKey] : null;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-ink-600 hover:bg-surface-soft hover:text-ink-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-600" />
                      )}
                      <Icon
                        size={18}
                        strokeWidth={2.1}
                        className={`shrink-0 ${isActive ? 'text-brand-700' : 'text-ink-400'}`}
                      />
                      <span className={`flex-1 truncate ${planned ? 'text-ink-400' : ''}`}>
                        {label}
                      </span>
                      {planned && (
                        <span
                          className="shrink-0 rounded-full bg-ink-900/[0.06] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-400"
                          title="Planned — not built yet"
                        >
                          Soon
                        </span>
                      )}
                      {badge > 0 && (
                        <span
                          className={`num rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                            isActive ? 'bg-brand-600 text-white' : 'bg-ink-900/[0.06] text-ink-600'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                      {tag && (
                        <span className="rounded-full bg-sky-50 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-sky-700 ring-1 ring-sky-600/15">
                          {tag}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SupportButton({ onDone }) {
  const { toast } = useApp();
  return (
    <div className="border-t border-ink-900/[0.07] px-3 py-3">
      <button
        onClick={() => {
          onDone?.();
          toast('Support chat opened — our team replies within 10 minutes', 'info');
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-surface-soft hover:text-ink-900"
      >
        <LifeBuoy size={18} strokeWidth={2.1} className="shrink-0 text-ink-400" /> Help & support
      </button>
    </div>
  );
}

const PRESETS = ['Today', 'Last 7 days', 'Last 30 days', 'This quarter', 'This year'];

/**
 * The header's date range, team filter and refresh, for a phone.
 *
 * The header has no room for them below a wide screen, which left a phone
 * with no way to change what every page shows. A custom range is still set
 * from a computer; here it is kept and offered, not lost.
 */
function MobileFilters() {
  const { range, setRange, owner, setOwner, team, refresh } = useApp();
  const select =
    'w-full appearance-none rounded-lg border border-ink-900/10 bg-white py-2 pl-8 pr-2 text-sm font-semibold text-ink-700 outline-none';
  return (
    <div className="space-y-2 border-b border-ink-900/[0.07] px-4 py-3">
      <p className="eyebrow">Showing</p>
      <label className="relative block">
        <CalendarRange size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <select value={range} onChange={(e) => setRange(e.target.value)} className={select} aria-label="Date range">
          {!PRESETS.includes(range) && <option>{range}</option>}
          {PRESETS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <label className="relative block min-w-0 flex-1">
          <UsersRound size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className={select} aria-label="Team member">
            <option>All team members</option>
            {team
              .filter((t) => t.bookings > 0)
              .map((t) => (
                <option key={t.id}>{t.name}</option>
              ))}
          </select>
        </label>
        <button type="button" className="icon-btn h-[38px] w-[38px]" onClick={refresh} title="Refresh data">
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { enquiries, tasks, memberSignups, auth } = useApp();

  const counts = {
    enquiries: enquiries.filter((e) => ['New', 'Contacted'].includes(e.status)).length,
    tasks: tasks.filter((t) => t.bucket === 'today' || t.bucket === 'overdue').length,
    memberships: memberSignups.filter((s) => s.status === 'New').length,
  };

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-[236px] shrink-0 flex-col border-r border-ink-900/[0.07] bg-white lg:flex">
        <NavList counts={counts} groups={navFor(auth)} />
        <SupportButton />
      </aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[86vw] max-w-[300px] flex-col bg-white shadow-lift transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink-900/[0.07] px-4 py-3">
            <span className="font-display text-base font-extrabold text-ink-900">Menu</span>
            <button onClick={onCloseMobile} className="icon-btn h-8 w-8">
              <X size={17} />
            </button>
          </div>
          <MobileFilters />
          <NavList counts={counts} groups={navFor(auth)} onNavigate={onCloseMobile} />
          <SupportButton onDone={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}
