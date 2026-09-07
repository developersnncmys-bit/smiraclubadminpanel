import {
  LayoutDashboard,
  UsersRound,
  Users,
  CalendarCheck,
  UserRound,
  Handshake,
  PieChart,
  Headphones,
  IndianRupee,
  Warehouse,
  MessageCircle,
  Wallet,
  Zap,
  Gift,
  Megaphone,
  ShieldCheck,
} from 'lucide-react';

/**
 * The client's sheet tabs, in their order. A section appears here once its
 * tab has been specified and built.
 */
export const navGroups = [
  {
    section: '',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/team', label: 'Team Status', icon: UsersRound, module: 'Users' },
      { to: '/enquiries', label: 'Sales & Leads', icon: Users, badgeKey: 'enquiries', module: 'CRM' },
      { to: '/bookings', label: 'Booking', icon: CalendarCheck, module: 'Booking' },
      { to: '/customers', label: 'Members', icon: UserRound, badgeKey: 'memberships', module: 'Customer' },
      { to: '/support', label: 'Support / Complaints', icon: Headphones, module: 'Customer' },
      { to: '/reports', label: 'Report & Analytics', icon: PieChart, module: 'Reports' },
      { to: '/revenue', label: 'Revenue', icon: IndianRupee, module: 'Finance' },
      { to: '/partners', label: 'Partners', icon: Handshake, module: 'Vendors' },
      { to: '/inventory', label: 'Travel Inventory', icon: Warehouse, module: 'Inventory' },
      { to: '/whatsapp', label: 'Whatsapp', icon: MessageCircle, module: 'WhatsApp' },
      { to: '/payment', label: 'Payment', icon: Wallet, module: 'Finance' },
      { to: '/automation', label: 'Automation', icon: Zap, module: 'Users' },
      { to: '/rewards', label: 'Rewards, Refer & Earn', icon: Gift, module: 'Customer' },
      { to: '/offers', label: 'Offers & Promotions', icon: Megaphone, module: 'CRM' },
      { to: '/users', label: 'Users & Roles', icon: ShieldCheck, module: 'Users' },
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

/**
 * The rail for one signed-in person. Demo mode has no role, so it shows
 * everything; a real session shows only what the role may open.
 */
export function navFor(auth) {
  const modules = auth?.modules;
  if (!auth || auth.superAdmin || !modules?.length) return visibleNavGroups;

  return visibleNavGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.module || modules.includes(i.module)) }))
    .filter((g) => g.items.length > 0);
}
