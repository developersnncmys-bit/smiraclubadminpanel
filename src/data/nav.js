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
  Building2,
  Megaphone,
  UsersRound,
  PieChart,
  Settings,
} from 'lucide-react';

/**
 * Sidebar navigation grouped the way the agency actually works, so a 15-item
 * rail reads as five short lists instead of one long one.
 */
export const navGroups = [
  {
    section: 'Workspace',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/tasks', label: 'Tasks', icon: ListTodo, badgeKey: 'tasks' },
    ],
  },
  {
    section: 'Sales',
    items: [
      { to: '/enquiries', label: 'Enquiries', icon: Users, badgeKey: 'enquiries' },
      { to: '/quotations', label: 'Quotations', icon: FileText },
      { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    ],
  },
  {
    section: 'Catalogue',
    items: [
      { to: '/packages', label: 'Packages', icon: Package },
      { to: '/memberships', label: 'Memberships', icon: Crown, badgeKey: 'memberships' },
      { to: '/suppliers', label: 'Suppliers', icon: Building2 },
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
    section: 'Travellers',
    items: [
      { to: '/customers', label: 'Customers', icon: UserRound },
      { to: '/team', label: 'Team', icon: UsersRound },
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone, tag: 'NEW' },
      { to: '/reports', label: 'Reports', icon: PieChart },
    ],
  },
  {
    // Hidden at the client's request — Settings is still reachable from the
    // account menu. Drop `hidden` to put the tab back.
    section: 'System',
    hidden: true,
    items: [{ to: '/settings', label: 'Settings', icon: Settings }],
  },
];

/** Groups that actually get a tab in the header. */
export const visibleNavGroups = navGroups.filter((g) => !g.hidden);

/** Flat list, kept for anything that just needs every destination. */
export const nav = navGroups.flatMap((g) => g.items);
