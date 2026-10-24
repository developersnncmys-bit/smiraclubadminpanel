import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, UserRound, Menu } from 'lucide-react';
import { useApp } from '../../store/AppStore.jsx';

/**
 * The bar along the bottom of a phone, the way a mobile CRM is held: the four
 * places the desk lives in under the thumb, and everything else behind More.
 * Only on small screens — the desktop keeps its rail.
 */
const TABS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/enquiries', label: 'Leads', icon: Users, badgeKey: 'enquiries' },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/customers', label: 'Members', icon: UserRound, badgeKey: 'memberships' },
];

export default function MobileTabBar({ onMore }) {
  const { enquiries, memberSignups } = useApp();
  const counts = {
    enquiries: enquiries.filter((e) => ['New', 'Contacted'].includes(e.status)).length,
    memberships: memberSignups.filter((s) => s.status === 'New').length,
  };

  const item = 'relative flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[11px] font-bold';

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-900/[0.08] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-12px_rgba(11,21,36,0.25)] backdrop-blur lg:hidden"
      aria-label="Main sections"
    >
      {TABS.map(({ to, label, icon: Icon, badgeKey }) => {
        const badge = badgeKey ? counts[badgeKey] : 0;
        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${item} ${isActive ? 'text-brand-700' : 'text-ink-400'}`}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute top-0 h-[3px] w-10 rounded-b-full bg-brand-600" />}
                <span className={`relative grid h-7 w-12 place-items-center rounded-full ${isActive ? 'bg-brand-50' : ''}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                  {badge > 0 && (
                    <span className="num absolute -right-0.5 -top-1 min-w-[18px] rounded-full bg-coral px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </span>
                {label}
              </>
            )}
          </NavLink>
        );
      })}

      <button type="button" onClick={onMore} className={`${item} text-ink-400`}>
        <span className="grid h-7 w-12 place-items-center rounded-full">
          <Menu size={19} strokeWidth={2} />
        </span>
        More
      </button>
    </nav>
  );
}
