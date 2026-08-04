import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as seed from '../data/mockData.js';

/**
 * Single client-side store for the whole panel.
 *
 * Every screen reads and writes through here, so buttons genuinely mutate
 * state instead of being decorative. State is mirrored into localStorage so a
 * demo survives a page refresh, and `resetDemo()` puts the seed data back.
 */

const KEY = 'smira-club-admin:v2';
// Session lives under its own key so "Reset demo data" never signs the user out.
const AUTH_KEY = 'smira-club-admin:auth';

const PREFIX = {
  enquiries: 'ENQ',
  bookings: 'BKG',
  packages: 'PKG',
  customers: 'CUS',
  tasks: 'TSK',
  quotations: 'QUO',
  invoices: 'INV',
  payments: 'PAY',
  suppliers: 'SUP',
  campaigns: 'CMP',
  team: 'USR',
};

export const SINGULAR = {
  enquiries: 'Enquiry',
  bookings: 'Booking',
  packages: 'Package',
  customers: 'Customer',
  tasks: 'Task',
  quotations: 'Quotation',
  invoices: 'Invoice',
  payments: 'Payment',
  suppliers: 'Supplier',
  campaigns: 'Campaign',
  team: 'Team member',
};

const seedState = () => ({
  enquiries: seed.enquiries,
  bookings: seed.bookings,
  packages: seed.packages,
  customers: seed.customers,
  tasks: seed.tasks,
  quotations: seed.quotations,
  invoices: seed.invoices,
  payments: seed.payments,
  suppliers: seed.suppliers,
  campaigns: seed.campaigns,
  team: seed.team,
  settings: {
    agency: {
      name: 'Smira Club Pvt. Ltd.',
      email: 'hello@smiraclub.com',
      phone: '+91 98200 11223',
      gstin: '27AABCV1234M1ZQ',
      licence: 'IATA-14-3-9981',
      currency: 'INR — Indian Rupee',
      address: '304, Pinnacle Business Park, Andheri East, Mumbai 400093, Maharashtra',
    },
    notifications: {
      newEnquiry: true,
      payment: true,
      departure: true,
      digest: false,
      marketing: false,
    },
    integrations: {
      'WhatsApp Business API': true,
      Razorpay: true,
      'Amadeus GDS': false,
      'Google Calendar': false,
      Tally: true,
    },
    security: { twoFactor: true, restrictExport: true, sessionTimeout: false },
  },
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedState();
    const saved = JSON.parse(raw);
    const base = seedState();
    // Shallow merge so newly added collections still appear for old snapshots.
    return { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) } };
  } catch {
    return seedState();
  }
}

function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
}

/** Keeps only the digits of a phone number so "+91 98200 11223" === "9820011223". */
export const phoneDigits = (v = '') => String(v).replace(/\D/g, '').slice(-10);

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [db, setDb] = useState(load);
  const [toasts, setToasts] = useState([]);
  const [owner, setOwner] = useState('All team members');
  const [range, setRange] = useState('Last 7 days');
  const [auth, setAuth] = useState(loadAuth);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* storage full or blocked — the demo still works in memory */
    }
  }, [db]);

  useEffect(() => {
    try {
      if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      else localStorage.removeItem(AUTH_KEY);
    } catch {
      /* storage blocked — session simply lasts until refresh */
    }
  }, [auth]);

  const toast = useCallback((message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const nextId = useCallback(
    (collection) => {
      const rows = db[collection] || [];
      const max = rows.reduce((m, r) => {
        const n = Number(String(r.id).split('-')[1]);
        return Number.isFinite(n) && n > m ? n : m;
      }, 1000);
      return `${PREFIX[collection] || 'REC'}-${max + 1}`;
    },
    [db]
  );

  const create = useCallback(
    (collection, item, { silent = false } = {}) => {
      const id = item.id || nextId(collection);
      setDb((d) => ({ ...d, [collection]: [{ ...item, id }, ...d[collection]] }));
      if (!silent) toast(`${SINGULAR[collection]} ${id} created`);
      return id;
    },
    [nextId, toast]
  );

  const update = useCallback(
    (collection, id, patch, { silent = false, message } = {}) => {
      setDb((d) => ({
        ...d,
        [collection]: d[collection].map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
      if (!silent) toast(message || `${SINGULAR[collection]} ${id} updated`);
    },
    [toast]
  );

  const updateMany = useCallback(
    (collection, ids, patch, message) => {
      setDb((d) => ({
        ...d,
        [collection]: d[collection].map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)),
      }));
      toast(message || `${ids.length} ${ids.length === 1 ? 'record' : 'records'} updated`);
    },
    [toast]
  );

  const remove = useCallback(
    (collection, ids) => {
      const list = Array.isArray(ids) ? ids : [ids];
      setDb((d) => ({ ...d, [collection]: d[collection].filter((r) => !list.includes(r.id)) }));
      toast(
        list.length === 1
          ? `${SINGULAR[collection]} ${list[0]} deleted`
          : `${list.length} records deleted`,
        'danger'
      );
    },
    [toast]
  );

  const duplicate = useCallback(
    (collection, id) => {
      const row = db[collection].find((r) => r.id === id);
      if (!row) return;
      const newId = nextId(collection);
      const copy = { ...row, id: newId, name: row.name ? `${row.name} (copy)` : row.name };
      setDb((d) => ({ ...d, [collection]: [copy, ...d[collection]] }));
      toast(`Duplicated as ${newId}`);
    },
    [db, nextId, toast]
  );

  const saveSettings = useCallback(
    (patch) => {
      setDb((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
    },
    []
  );

  const resetDemo = useCallback(() => {
    setDb(seedState());
    toast('Demo data restored');
  }, [toast]);

  const refresh = useCallback(() => {
    toast('Data refreshed just now');
  }, [toast]);

  /**
   * Signs a mobile number into the panel. If the number belongs to a team
   * member we adopt that profile, otherwise the session falls back to the
   * agency owner so the demo is usable with any valid number.
   */
  const signIn = useCallback(
    (phone) => {
      const digits = phoneDigits(phone);
      const member =
        db.team.find((t) => phoneDigits(t.phone) === digits) ||
        db.team.find((t) => t.role === 'Owner') ||
        db.team[0];
      const session = {
        phone: digits,
        name: member?.name || 'Smira Club user',
        role: member?.role || 'Owner',
        email: member?.email || '',
        initials: (member?.name || 'SC')
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        since: new Date().toISOString(),
      };
      setAuth(session);
      return session;
    },
    [db.team]
  );

  const signOut = useCallback(() => {
    setAuth(null);
    toast('Signed out — verify your mobile number to continue', 'info');
  }, [toast]);

  /** Records the payment and pushes the amount onto the invoice + booking. */
  const recordPayment = useCallback(
    (payment) => {
      const id = create('payments', payment, { silent: true });
      setDb((d) => ({
        ...d,
        invoices: d.invoices.map((inv) => {
          if (inv.id !== payment.invoice) return inv;
          const paid = Math.min(inv.amount, inv.paid + Number(payment.amount || 0));
          return { ...inv, paid, status: paid >= inv.amount ? 'Paid' : 'Partial' };
        }),
      }));
      toast(`Payment ${id} recorded`);
      return id;
    },
    [create, toast]
  );

  const value = useMemo(
    () => ({
      ...db,
      db,
      toasts,
      toast,
      dismissToast,
      create,
      update,
      updateMany,
      remove,
      duplicate,
      recordPayment,
      saveSettings,
      resetDemo,
      refresh,
      nextId,
      owner,
      setOwner,
      range,
      setRange,
      auth,
      signIn,
      signOut,
    }),
    [
      db,
      toasts,
      toast,
      dismissToast,
      create,
      update,
      updateMany,
      remove,
      duplicate,
      recordPayment,
      saveSettings,
      resetDemo,
      refresh,
      nextId,
      owner,
      range,
      auth,
      signIn,
      signOut,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

/** Filters a list by the team-member picker in the top bar. */
export function byOwner(rows, owner, key = 'owner') {
  if (!owner || owner === 'All team members') return rows;
  const first = owner.split(' ')[0];
  return rows.filter((r) => r[key] === first || r[key] === owner);
}
