import {
  LayoutDashboard,
  UsersRound,
  ListTodo,
  Users,
  FileText,
  CalendarCheck,
  Crown,
  UserRound,
  PieChart,
  Package,
  Building2,
  ReceiptIndianRupee,
  Wallet,
  Settings,
} from 'lucide-react';
import { moduleByPath } from './modules.js';

/** Pulls a planned module into the nav by its path. */
const planned = (path, label) => {
  const m = moduleByPath[path];
  if (!m) throw new Error(`No planned module for ${path}`);
  return { to: m.to, label: label || m.label, icon: m.icon, planned: true };
};

/**
 * One flat list in the order of the client's sheet tabs — Dashboard, Team
 * Status, Sales & Leads, Booking and so on. The four pages we built that
 * their sheet does not name (Tasks, Quotations, Packages, Suppliers) sit
 * directly after the tab they belong to, so the sequence still reads down
 * the page the way the sheet reads across.
 */
export const navGroups = [
  {
    section: '',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/team', label: 'Team Status', icon: UsersRound },
      { to: '/tasks', label: 'Tasks', icon: ListTodo, badgeKey: 'tasks' },
      { to: '/enquiries', label: 'Sales & Leads', icon: Users, badgeKey: 'enquiries' },
      { to: '/quotations', label: 'Quotations', icon: FileText },
      { to: '/bookings', label: 'Booking', icon: CalendarCheck },
      { to: '/memberships', label: 'Membership', icon: Crown, badgeKey: 'memberships' },
      { to: '/customers', label: 'Members', icon: UserRound },
      planned('/partners'),
      { to: '/reports', label: 'Report & Analytics', icon: PieChart },
      planned('/inventory'),
      { to: '/packages', label: 'Packages', icon: Package },
      { to: '/suppliers', label: 'Suppliers', icon: Building2 },
      planned('/lifestyle'),
      planned('/automation'),
      { to: '/invoices', label: 'Invoices', icon: ReceiptIndianRupee },
      { to: '/payments', label: 'Payment', icon: Wallet },
      planned('/cms'),
      planned('/profile'),
      planned('/notifications'),
      { to: '/settings', label: 'Setting', icon: Settings },
      planned('/offers'),
      planned('/roles'),
      planned('/rewards'),
      planned('/ai'),
      planned('/forms', 'Form'),
      planned('/blogs'),
      planned('/banners'),
      planned('/seo'),
      planned('/api'),
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
