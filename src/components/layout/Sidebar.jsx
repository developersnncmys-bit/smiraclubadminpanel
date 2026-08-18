import { NavLink } from 'react-router-dom';
import { X, LifeBuoy } from 'lucide-react';
import { visibleNavGroups } from '../../data/nav.js';
import { useApp } from '../../store/AppStore.jsx';

/**
 * Section rail: the five sections with their pages listed underneath. Nothing
 * collapses or expands — everything the desk can open is visible at once.
 */
function NavList({ counts, onNavigate }) {
  return (
    <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
      {visibleNavGroups.map((group, i) => (
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

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { enquiries, tasks, memberSignups } = useApp();

  const counts = {
    enquiries: enquiries.filter((e) => ['New', 'Contacted'].includes(e.status)).length,
    tasks: tasks.filter((t) => t.bucket === 'today' || t.bucket === 'overdue').length,
    memberships: memberSignups.filter((s) => s.status === 'New').length,
  };

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-[236px] shrink-0 flex-col border-r border-ink-900/[0.07] bg-white lg:flex">
        <NavList counts={counts} />
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
          className={`absolute inset-y-0 left-0 flex w-[272px] flex-col bg-white shadow-lift transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink-900/[0.07] px-4 py-3">
            <span className="font-display text-base font-extrabold text-ink-900">Menu</span>
            <button onClick={onCloseMobile} className="icon-btn h-8 w-8">
              <X size={17} />
            </button>
          </div>
          <NavList counts={counts} onNavigate={onCloseMobile} />
          <SupportButton onDone={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}
