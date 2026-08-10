import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as seed from '../data/mockData.js';

/**
 * Single client-side store for the whole panel.
 *
 * Every screen reads and writes through here, so buttons genuinely mutate
 * state instead of being decorative. State is mirrored into localStorage so a
 * demo survives a page refresh, and `resetDemo()` puts the seed data back.
 */

// Bumped to v3 with membership plans — older snapshots have no plan data and
// would leave the seeded signups pointing at quotations that do not exist.
const KEY = 'smira-club-admin:v3';
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
  memberships: 'MEM',
  memberSignups: 'MSU',
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
  memberships: 'Membership plan',
  memberSignups: 'Membership signup',
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
  memberships: seed.memberships,
  memberSignups: seed.memberSignups,
  settings: {
    membership: { autoQuote: true, validityDays: 7 },
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
  const issued = useRef(new Set());

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
      let max = rows.reduce((m, r) => {
        const n = Number(String(r.id).split('-')[1]);
        return Number.isFinite(n) && n > m ? n : m;
      }, 1000);
      // `db` is one render behind when several records are created in the same
      // tick (bulk actions), so remember what was handed out and skip past it.
      let id = `${PREFIX[collection] || 'REC'}-${max + 1}`;
      while (issued.current.has(id)) {
        max += 1;
        id = `${PREFIX[collection] || 'REC'}-${max + 1}`;
      }
      issued.current.add(id);
      return id;
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

  /**
   * Turns a website membership signup into a quotation.
   *
   * The plan's features are copied onto the quotation so the proposal keeps
   * showing what was promised even if the plan is edited later.
   */
  const generateMembershipQuote = useCallback(
    (signup) => {
      const plan =
        db.memberships.find((p) => p.id === signup.planId) ||
        db.memberships.find((p) => p.name === signup.plan);
      if (!plan) {
        toast(`No plan found for ${signup.name} — quotation not generated`, 'danger');
        return null;
      }
      if (signup.quote) {
        toast(`${signup.id} already has quotation ${signup.quote}`, 'info');
        return signup.quote;
      }

      const { subtotal, tax, total } = seed.membershipAmount(plan, signup.members);
      const validDays = db.settings.membership?.validityDays ?? 7;
      const validTill = new Date(Date.now() + validDays * 86400000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const consultant = db.team.find((t) => t.bookings > 0);

      const quoteId = create(
        'quotations',
        {
          customer: signup.name,
          pkg: `${plan.name} membership (${plan.billing})`,
          pax: Number(signup.members) || 1,
          amount: total,
          subtotal,
          tax,
          validTill,
          status: 'Draft',
          owner: consultant ? consultant.name.split(' ')[0] : 'Sneha',
          source: 'Membership',
          planId: plan.id,
          inclusions: [...plan.features],
        },
        { silent: true }
      );

      update('memberSignups', signup.id, { quote: quoteId, status: 'Quoted' }, { silent: true });
      toast(`Quotation ${quoteId} generated for ${signup.name} · ${plan.name}`);
      return quoteId;
    },
    [db.memberships, db.settings, db.team, create, update, toast]
  );

  /**
   * Entry point for a signup arriving from the public website. With
   * auto-quote enabled the proposal is raised the moment it lands.
   */
  const receiveMemberSignup = useCallback(
    (payload) => {
      const id = nextId('memberSignups');
      const signup = { ...payload, id, status: 'New', quote: '' };
      create('memberSignups', signup, { silent: true });
      toast(`${signup.name} selected ${signup.plan} on the website`, 'info');
      if (db.settings.membership?.autoQuote) generateMembershipQuote(signup);
      return signup;
    },
    [nextId, create, toast, db.settings, generateMembershipQuote]
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
      generateMembershipQuote,
      receiveMemberSignup,
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
      generateMembershipQuote,
      receiveMemberSignup,
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
