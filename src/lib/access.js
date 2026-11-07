import { useLocation } from 'react-router-dom';
import { useApp } from '../store/AppStore.jsx';
import { navGroups } from '../data/nav.js';

/**
 * What the signed-in person may do on a page — the same answer the server
 * gives, so a button they cannot use is not shown in the first place.
 *
 * A role made in Users & Roles carries, page by page, View / Add / Edit /
 * Delete. A page it has no list for falls back to the older role shape:
 * the pages it may open, and one set of rights for all of them.
 *
 * Actions use the server's words: 'view', 'create', 'edit', 'delete'.
 */
export function canDo(auth, module, action) {
  if (!auth || auth.superAdmin || !module) return true;
  const page = auth.access?.[module];
  if (Array.isArray(page)) return page.includes(action);
  return (auth.modules || []).includes(module) && (auth.permissions || []).includes(action);
}

/** Which module a page belongs to, by its address. */
export function moduleOf(pathname) {
  for (const g of navGroups || []) {
    for (const i of g.items || []) {
      if (i.module && (pathname === i.to || pathname.startsWith(`${i.to}/`))) return i.module;
    }
  }
  return null;
}

/** Records on the panel and the module that owns each, for the store's guard. */
export const COLLECTION_MODULE = {
  enquiries: 'CRM',
  offers: 'CRM',
  blogs: 'CRM',
  bookings: 'Booking',
  customers: 'Customer',
  memberSignups: 'Customer',
  tickets: 'Customer',
  rewards: 'Customer',
  partners: 'Vendors',
  inventory: 'Inventory',
  payments: 'Finance',
  invoices: 'Finance',
  expenses: 'Finance',
  users: 'Users',
  roles: 'Users',
};

/**
 * `const can = useCan(); can('delete')` — on this page; or
 * `can('edit', 'Booking')` for another one.
 */
export function useCan() {
  const { auth } = useApp();
  const { pathname } = useLocation();
  const here = moduleOf(pathname);
  return (action, module = here) => canDo(auth, module, action);
}
