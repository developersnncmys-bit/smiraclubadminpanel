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
  Newspaper,
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
      { to: '/blog', label: 'Blog', icon: Newspaper, module: 'CRM' },
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
 * The rail for one signed-in person: only the pages their role opens.
 *
 * The role's modules (Users & Roles → the role) decide it — a Lead
 * Generation role with CRM and WhatsApp sees Sales & Leads, Offers, Blog and
 * WhatsApp, and nothing else. The owner (a super-admin role) sees it all.
 * The API enforces the same modules, so a hidden page could not load anyway.
 */
export function canOpenModule(auth, module) {
  if (!module || !auth || auth.superAdmin) return true;
  // Page by page, when the role was set up that way: View opens it.
  const page = auth.access?.[module];
  if (Array.isArray(page)) return page.includes('view');
  const modules = auth.modules || [];
  return modules.includes(module);
}

/** Whether this person may open the page at this address. */
export function canOpenPath(auth, pathname) {
  const page = nav.find((i) => i.to !== '/' && (pathname === i.to || pathname.startsWith(`${i.to}/`)));
  return canOpenModule(auth, page?.module);
}

export function navFor(auth) {
  return visibleNavGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => canOpenModule(auth, i.module)) }))
    .filter((g) => g.items.length > 0);
}
