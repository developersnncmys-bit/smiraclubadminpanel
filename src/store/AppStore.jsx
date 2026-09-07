import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as seed from '../data/mockData.js';
import * as extra from '../data/modulesData.js';
import * as support from '../data/supportData.js';
import * as partnerSeed from '../data/partnersData.js';
import * as usersSeed from '../data/usersData.js';
import * as waSeed from '../data/whatsappData.js';
import * as autoSeed from '../data/automationData.js';
import * as inventorySeed from '../data/inventoryData.js';
import { api, isLive, getToken, setToken } from '../lib/api.js';
import { ADAPTERS, LIVE_COLLECTIONS, fromApi, toApi, pathFor } from '../lib/adapters.js';

/**
 * Single client-side store for the whole panel.
 *
 * Every screen reads and writes through here, so buttons genuinely mutate
 * state instead of being decorative. State is mirrored into localStorage so a
 * demo survives a page refresh, and `resetDemo()` puts the seed data back.
 */

// Bump whenever the seed changes shape or size, so a saved snapshot cannot
// keep showing records the demo no longer has.
const KEY = 'smira-club-admin:v34';
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
  rewardGrants: 'RWD',
  tickets: 'TCK',
  inventory: 'INV',
  partners: 'PTR',
  lifestyle: 'LIF',
  automations: 'AUT',
  notificationRules: 'NTF',
  offers: 'OFR',
  roles: 'ROL',
  referrals: 'REF',
  forms: 'FRM',
  blogs: 'BLG',
  banners: 'BNR',
  seoPages: 'SEO',
  apiKeys: 'API',
  activities: 'ACT',
  approvals: 'APR',
  conversations: 'CHT',
  botFlows: 'FLW',
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
  rewardGrants: 'Reward',
  tickets: 'Ticket',
  inventory: 'Inventory item',
  partners: 'Partner',
  lifestyle: 'Add-on',
  automations: 'Automation',
  notificationRules: 'Notification rule',
  offers: 'Offer',
  roles: 'Role',
  referrals: 'Referral',
  forms: 'Form',
  blogs: 'Post',
  banners: 'Banner',
  seoPages: 'SEO entry',
  apiKeys: 'API key',
  activities: 'Activity',
  approvals: 'Approval request',
  conversations: 'Conversation',
  botFlows: 'Chatbot journey',
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
  rewardGrants: seed.rewardGrants,
  tickets: support.tickets,
  inventory: inventorySeed.inventory,
  partners: partnerSeed.partners,
  lifestyle: extra.lifestyle,
  automations: autoSeed.rules,
  notificationRules: extra.notificationRules,
  offers: extra.offers,
  roles: usersSeed.roles,
  approvals: usersSeed.pendingApprovals,
  conversations: waSeed.conversations,
  botFlows: waSeed.botFlows,
  referrals: extra.referrals,
  forms: extra.forms,
  blogs: extra.blogs,
  banners: extra.banners,
  seoPages: extra.seoPages,
  apiKeys: extra.apiKeys,
  activities: extra.activities,
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
  /** Live once a server is configured and somebody is signed in to it. */
  const [live, setLive] = useState(() => isLive && Boolean(getToken()));
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
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

  /**
   * Fills the store from the API. Each collection is adapted into the shape
   * the screens already read, so nothing downstream has to know where the
   * data came from. A collection that fails keeps its seed rows rather than
   * emptying a page.
   */
  const pull = useCallback(async (only) => {
    if (!isLive || !getToken()) return;
    const wanted = only ? [only] : LIVE_COLLECTIONS;
    if (!only) setLoading(true);

    const results = await Promise.allSettled(
      wanted.map(async (name) => {
        const res = await api.list(pathFor(name));
        const rows = res.rows || res.data || [];
        return [name, rows.map((doc) => fromApi(name, doc))];
      })
    );

    const next = {};
    const failed = [];
    results.forEach((r, i) => {
      const name = wanted[i];
      if (r.status === 'fulfilled') {
        next[name] = r.value[1];
        return;
      }
      // Forbidden is an answer, not a failure: this role cannot open that
      // module, so the screen shows nothing rather than seed rows pretending
      // to be real.
      if (r.reason?.status === 403) next[name] = [];
      else failed.push(name);
    });

    if (Object.keys(next).length) setDb((prev) => ({ ...prev, ...next }));
    if (!only) setLoading(false);
    setApiError(failed.length ? `Could not load: ${failed.join(', ')}` : null);
    return next;
  }, []);

  // Sign in, refresh, or arrive with a token already in hand.
  useEffect(() => {
    if (live) pull();
  }, [live, pull]);

  // The API says the token is no longer good.
  useEffect(() => {
    const dropped = () => {
      setLive(false);
      setAuth(null);
    };
    window.addEventListener('smira:signed-out', dropped);
    return () => window.removeEventListener('smira:signed-out', dropped);
  }, []);

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

      // Show it straight away, then let the server confirm the real record.
      setDb((d) => ({ ...d, [collection]: [{ ...item, id }, ...d[collection]] }));
      if (!silent) toast(`${SINGULAR[collection]} ${id} created`);

      if (live && ADAPTERS[collection]) {
        api
          .post(pathFor(collection), toApi(collection, item))
          .then((res) => {
            const saved = fromApi(collection, res.data);
            setDb((d) => ({
              ...d,
              [collection]: d[collection].map((r) => (r.id === id ? saved : r)),
            }));
          })
          .catch((err) => {
            // Put the optimistic row back where it came from.
            setDb((d) => ({ ...d, [collection]: d[collection].filter((r) => r.id !== id) }));
            toast(err.message || 'That could not be saved', 'danger');
          });
      }

      return id;
    },
    [nextId, toast, live]
  );

  const update = useCallback(
    (collection, id, patch, { silent = false, message } = {}) => {
      let before = null;
      setDb((d) => {
        before = d[collection].find((r) => r.id === id) || null;
        return {
          ...d,
          [collection]: d[collection].map((r) => (r.id === id ? { ...r, ...patch } : r)),
        };
      });
      if (!silent) toast(message || `${SINGULAR[collection]} ${id} updated`);

      if (live && ADAPTERS[collection] && before?._id) {
        const body = toApi(collection, patch);
        if (Object.keys(body).length) {
          api.patch(`${pathFor(collection)}/${before._id}`, body).catch((err) => {
            setDb((d) => ({
              ...d,
              [collection]: d[collection].map((r) => (r.id === id ? before : r)),
            }));
            toast(err.message || 'That change did not save', 'danger');
          });
        }
      }
    },
    [toast, live]
  );

  const updateMany = useCallback(
    (collection, ids, patch, message) => {
      let targets = [];
      setDb((d) => {
        targets = d[collection].filter((r) => ids.includes(r.id));
        return {
          ...d,
          [collection]: d[collection].map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)),
        };
      });
      toast(message || `${ids.length} ${ids.length === 1 ? 'record' : 'records'} updated`);

      if (live && ADAPTERS[collection]) {
        const body = toApi(collection, patch);
        if (Object.keys(body).length) {
          Promise.allSettled(
            targets.filter((t) => t._id).map((t) => api.patch(`${pathFor(collection)}/${t._id}`, body))
          ).then((rs) => {
            const failed = rs.filter((r) => r.status === 'rejected').length;
            if (failed) {
              toast(`${failed} of ${targets.length} did not save`, 'danger');
              pull(collection);
            }
          });
        }
      }
    },
    [toast, live, pull]
  );

  const remove = useCallback(
    (collection, ids) => {
      const list = Array.isArray(ids) ? ids : [ids];
      let gone = [];
      setDb((d) => {
        gone = d[collection].filter((r) => list.includes(r.id));
        return { ...d, [collection]: d[collection].filter((r) => !list.includes(r.id)) };
      });

      if (live && ADAPTERS[collection]) {
        Promise.allSettled(
          gone.filter((g) => g._id).map((g) => api.del(`${pathFor(collection)}/${g._id}`))
        ).then((rs) => {
          const failed = rs.filter((r) => r.status === 'rejected');
          if (failed.length) {
            toast(failed[0].reason?.message || 'That could not be deleted', 'danger');
            pull(collection);
          }
        });
      }
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
/** Turns the API's user into the session the panel carries. */
  const sessionFrom = (u) => ({
    id: u.id,
    name: u.name,
    role: u.role?.name || u.designation || 'User',
    email: u.email,
    phone: u.phone,
    branch: u.branch,
    department: u.department,
    scope: u.role?.scope,
    modules: u.role?.modules || [],
    permissions: u.role?.permissions || [],
    superAdmin: Boolean(u.role?.superAdmin),
    initials: (u.name || 'SC')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
    since: new Date().toISOString(),
  });

  /** Asks the API to text a code to a registered number. */
  const requestOtp = useCallback((phone) => api.requestOtp(phone), []);

  /** Checks the code, and signs in on the strength of it. */
  const signInWithOtp = useCallback(async (phone, code) => {
    const res = await api.verifyOtp(phone, code);
    setToken(res.token);
    const session = sessionFrom(res.data);
    setAuth(session);
    setLive(true);
    return session;
  }, []);

  /** Email and password, against the real API. */
  const signInWithPassword = useCallback(
    async (email, password) => {
      const res = await api.login(email, password);
      setToken(res.token);

      const u = res.data;
      const session = {
        id: u.id,
        name: u.name,
        role: u.role?.name || u.designation || 'User',
        email: u.email,
        phone: u.phone,
        branch: u.branch,
        department: u.department,
        scope: u.role?.scope,
        modules: u.role?.modules || [],
        permissions: u.role?.permissions || [],
        superAdmin: Boolean(u.role?.superAdmin),
        initials: (u.name || 'SC')
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        since: new Date().toISOString(),
      };

      setAuth(session);
      setLive(true);
      return session;
    },
    []
  );

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

      // Anyone who signs up on the website becomes a traveller record too, so
      // the desk has one profile per person rather than two half-profiles.
      const known = db.customers.some((c) => phoneDigits(c.phone) === phoneDigits(signup.phone));
      if (!known) {
        create(
          'customers',
          {
            name: signup.name,
            phone: signup.phone,
            email: signup.email,
            city: signup.city || '',
            trips: 0,
            spend: 0,
            tier: 'Silver',
            last: '—',
            dob: '',
            special: '',
            specialLabel: 'Anniversary',
            address: '',
            giftsGiven: [],
            source: 'Website',
          },
          { silent: true }
        );
      }

      toast(`${signup.name} selected ${signup.plan} on the website`, 'info');
      if (db.settings.membership?.autoQuote) generateMembershipQuote(signup);
      return signup;
    },
    [nextId, create, toast, db.settings, db.customers, generateMembershipQuote]
  );

  /**
   * Records a membership gift as handed over, or takes it back if it was
   * ticked by mistake. Stamped with the day it was given so the desk can see
   * what was done and when.
   */
  const toggleGift = useCallback(
    (customerId, gift) => {
      const customer = db.customers.find((c) => c.id === customerId);
      if (!customer) return;
      const list = customer.giftsGiven || [];
      const already = list.some((g) => seed.giftKey(g.gift) === seed.giftKey(gift));

      if (already) {
        update(
          'customers',
          customerId,
          { giftsGiven: list.filter((g) => seed.giftKey(g.gift) !== seed.giftKey(gift)) },
          { silent: true }
        );
        toast(`“${gift}” marked as not given yet`, 'info');
        return;
      }

      const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      update('customers', customerId, { giftsGiven: [...list, { gift, date }] }, { silent: true });
      toast(`“${gift}” given to ${customer.name}`);
    },
    [db.customers, update, toast]
  );

  /** Adds a line to a lead's activity trail. */
  const logActivity = useCallback(
    (leadId, text, kind = 'note', meta) => {
      const now = new Date();
      create(
        'activities',
        {
          lead: leadId,
          kind,
          text,
          meta,
          who: auth?.name?.split(' ')[0] || 'You',
          at: `${now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}, ${now
            .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            .toLowerCase()}`,
        },
        { silent: true }
      );
    },
    [create, auth]
  );

  const signOut = useCallback(() => {
    if (isLive) api.logout();
    setToken(null);
    setLive(false);
    setAuth(null);
    toast(isLive ? 'Signed out' : 'Signed out — verify your mobile number to continue', 'info');
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
      signInWithPassword,
      requestOtp,
      signInWithOtp,
      signOut,
      live,
      loading,
      apiError,
      pull,
      generateMembershipQuote,
      receiveMemberSignup,
      toggleGift,
      logActivity,
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
      signInWithPassword,
      requestOtp,
      signInWithOtp,
      signOut,
      live,
      loading,
      apiError,
      pull,
      generateMembershipQuote,
      receiveMemberSignup,
      toggleGift,
      logActivity,
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
