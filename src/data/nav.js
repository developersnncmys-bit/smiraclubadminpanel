import {
  LayoutDashboard,
  UsersRound,
  Users,
  CalendarCheck,
  Crown,
  UserRound,
  PieChart,
  Wallet,
  Settings,
  ListTodo,
  FileText,
  Package,
  Building2,
  ReceiptIndianRupee,
} from 'lucide-react';
import { moduleByPath } from './modules.js';

/** A module that is built: same icon and label, no Soon badge. */
const built = (path, label) => {
  const m = moduleByPath[path];
  if (!m) throw new Error(`No module for ${path}`);
  return { to: m.to, label: label || m.label, icon: m.icon };
};

/** Pulls a still-to-build module into the nav by its path. */
const planned = (path, label) => {
  const m = moduleByPath[path];
  if (!m) throw new Error(`No planned module for ${path}`);
  return { to: m.to, label: label || m.label, icon: m.icon, planned: true };
};

/**
 * The client's sheet tabs, in their exact order and wording. Tasks,
 * Quotations, Invoices, Packages and Suppliers still have routes and pages;
 * they are out of the sidebar until the client says where they belong.
 */
export const navGroups = [
  {
    section: '',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/team', label: 'Team Status', icon: UsersRound },
      { to: '/enquiries', label: 'Sales & Leads', icon: Users, badgeKey: 'enquiries' },
      { to: '/bookings', label: 'Booking', icon: CalendarCheck },
      { to: '/memberships', label: 'Membership', icon: Crown, badgeKey: 'memberships' },
      { to: '/customers', label: 'Members', icon: UserRound },
      built('/partners'),
      { to: '/reports', label: 'Report & Analytics', icon: PieChart },
      built('/inventory', 'Travel Inventory'),
      built('/lifestyle'),
      built('/automation'),
      { to: '/payments', label: 'Payment', icon: Wallet },
      planned('/cms', 'Website CMS'),
      built('/profile'),
      built('/notifications'),
      { to: '/settings', label: 'Setting', icon: Settings },
      built('/offers', 'Offers & Promotions'),
      built('/roles', 'Users & Roles'),
      built('/rewards', 'Reward & Refer'),
      planned('/ai', 'AI features'),
      built('/forms', 'Form'),
      built('/blogs'),
      built('/banners'),
      built('/seo'),
      built('/api'),
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
