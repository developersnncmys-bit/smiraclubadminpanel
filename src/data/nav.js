import {
  UsersRound,
  Users,
  CalendarCheck,
  UserRound,
  Handshake,
  PieChart,
  Headphones,
  IndianRupee,
  Warehouse,
} from 'lucide-react';

/**
 * The client's sheet tabs, in their order. A section appears here once its
 * tab has been specified and built.
 */
export const navGroups = [
  {
    section: '',
    items: [
      { to: '/team', label: 'Team Status', icon: UsersRound },
      { to: '/enquiries', label: 'Sales & Leads', icon: Users, badgeKey: 'enquiries' },
      { to: '/bookings', label: 'Booking', icon: CalendarCheck },
      { to: '/customers', label: 'Members', icon: UserRound, badgeKey: 'memberships' },
      { to: '/support', label: 'Support / Complaints', icon: Headphones },
      { to: '/reports', label: 'Report & Analytics', icon: PieChart },
      { to: '/revenue', label: 'Revenue', icon: IndianRupee },
      { to: '/partners', label: 'Partners', icon: Handshake },
      { to: '/inventory', label: 'Travel Inventory', icon: Warehouse },
    ],
  },
];

/** What the sidebar shows: hidden groups and hidden pages are dropped. */
export const visibleNavGroups = navGroups
  .filter((g) => !g.hidden)
  .map((g) => ({ ...g, items: g.items.filter((i) => !i.hidden) }))
  .filter((g) => g.items.length > 0);

/** Flat list, kept for anything that just needs every destination. */
export const nav = navGroups.flatMap((g) => g.items);
