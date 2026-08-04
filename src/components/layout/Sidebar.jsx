import { NavLink } from 'react-router-dom';
import { LifeBuoy, X } from 'lucide-react';
import { nav } from '../../data/nav.js';
import { useApp } from '../../store/AppStore.jsx';

/**
 * Navigation rail only — the brand mark and the account menu live in the one
 * shared header above, so the sidebar carries no header of its own.
 */
export default function Sidebar({ compact = false, mobileOpen, onCloseMobile }) {
  const { enquiries, tasks, toast } = useApp();

  // Live counters instead of hard-coded badges.
  const counts = {
    enquiries: enquiries.filter((e) => ['New', 'Contacted'].includes(e.status)).length,
    tasks: tasks.filter((t) => t.bucket === 'today' || t.bucket === 'overdue').length,
  };

  const body = (
    <div className="flex h-full flex-col bg-white">
      {/* Close handle for the mobile drawer only */}
      <div className="flex justify-end px-3 pt-3 lg:hidden">
        <button
          onClick={onCloseMobile}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-surface-soft"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map(({ to, label, icon: Icon, badgeKey, tag }) => {
          const badge = badgeKey ? counts[badgeKey] : null;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-surface-soft hover:text-ink-900'
                }`
              }
              title={compact ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />
                  )}
                  <Icon size={19} strokeWidth={2.1} className={isActive ? 'text-brand-600' : 'text-ink-500'} />
                  {!compact && <span className="flex-1 truncate">{label}</span>}
                  {!compact && badge > 0 && (
                    <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-[11px] font-bold text-ink-600">
                      {badge}
                    </span>
                  )}
                  {!compact && tag && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-sky-700">
                      {tag}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-ink-900/5 px-3 py-3">
        <button
          onClick={() => toast('Support chat opened — our team replies within 10 minutes', 'info')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-surface-soft"
          title={compact ? 'Help & support' : undefined}
        >
          <LifeBuoy size={19} strokeWidth={2.1} className="text-ink-500" />
          {!compact && 'Help & support'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail — sits under the shared header */}
      <aside
        className={`hidden shrink-0 border-r border-ink-900/5 transition-all duration-300 lg:block ${
          compact ? 'w-[76px]' : 'w-[248px]'
        }`}
      >
        {body}
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
          className={`absolute inset-y-0 left-0 w-[268px] shadow-lift transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {body}
        </aside>
      </div>
    </>
  );
}
