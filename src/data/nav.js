import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Package,
  Crown,
  UserRound,
  ListTodo,
  FileText,
  ReceiptIndianRupee,
  Wallet,
  UsersRound,
  PieChart,
  Settings,
} from 'lucide-react';
import { moduleByPath } from './modules.js';

/** Pulls a planned module into the nav by its path. */
const planned = (path) => {
  const m = moduleByPath[path];
  if (!m) throw new Error(`No planned module for ${path}`);
  return { to: m.to, label: m.label, icon: m.icon, planned: true };
};

/**
 * The client's product map, in the order they listed it. Pages marked
 * `planned` route to a placeholder that says the screen is not built yet.
 */
export const navGroups = [
  {
    section: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/tasks', label: 'Tasks', icon: ListTodo, badgeKey: 'tasks' },
      planned('/alerts'),
    ],
  },
  {
    section: 'Sales & leads',
    items: [
      { to: '/enquiries', label: 'Sales & Leads', icon: Users, badgeKey: 'enquiries' },
      { to: '/quotations', label: 'Quotations', icon: FileText },
      { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    ],
  },
  {
    section: 'Travel',
    items: [
      { to: '/packages', label: 'Packages', icon: Package },
      planned('/inventory'),
      { to: '/suppliers', label: 'Suppliers', icon: UsersRound },
      planned('/lifestyle'),
    ],
  },
  {
    section: 'Membership',
    items: [
      { to: '/memberships', label: 'Membership Plans', icon: Crown, badgeKey: 'memberships' },
      { to: '/customers', label: 'Members', icon: UserRound },
      planned('/rewards'),
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/invoices', label: 'Invoices', icon: ReceiptIndianRupee },
      { to: '/payments', label: 'Payments', icon: Wallet },
    ],
  },
  {
    section: 'Engagement',
    items: [
      planned('/communication'),
      planned('/support'),
      planned('/offers'),
      planned('/notifications'),
    ],
  },
  {
    section: 'Website',
    items: [planned('/cms'), planned('/blogs'), planned('/banners'), planned('/seo'), planned('/forms')],
  },
  {
    section: 'Team & reports',
    items: [
      { to: '/team', label: 'Team Status', icon: UsersRound },
      planned('/partners'),
      { to: '/reports', label: 'Reports & Analytics', icon: PieChart },
    ],
  },
  {
    section: 'System',
    items: [
      planned('/automation'),
      planned('/ai'),
      planned('/roles'),
      planned('/api'),
      planned('/profile'),
      { to: '/settings', label: 'Settings', icon: Settings },
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
