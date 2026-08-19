/**
 * Membership lookups shared by the pages that need to answer "is this person
 * a member, and until when?" — bookings, customers and the member list.
 */

const digits = (value) => String(value || '').replace(/[^\d]/g, '');

/** '11 Sep 2026' or '2026-09-11' -> Date, or null. */
export const parseDay = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Whole days from today to that date — negative once it has passed. */
export const daysUntil = (value) => {
  const target = parseDay(value);
  if (!target) return null;
  const today = new Date();
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b - a) / 86400000);
};

/**
 * The signup a person holds, matched on phone first and email second so a
 * booking made under a slightly different spelling still finds the member.
 */
export function findMembership(person, signups = [], plans = []) {
  if (!person) return null;
  const phone = digits(person.phone);
  const email = String(person.email || '').toLowerCase();
  const name = String(person.name || person.customer || '').trim().toLowerCase();

  const signup = signups.find(
    (s) =>
      (phone && digits(s.phone) === phone) ||
      (email && String(s.email || '').toLowerCase() === email) ||
      (name && String(s.name || '').trim().toLowerCase() === name)
  );
  if (!signup) return null;
  return { signup, plan: plans.find((p) => p.id === signup.planId) || null };
}

/**
 * How the membership should read on screen: how long is left, and whether
 * the desk needs to do anything about it.
 */
export function membershipStanding(signup) {
  if (!signup) return null;
  const left = daysUntil(signup.expiresOn);

  if (signup.status === 'New' || signup.status === 'Quoted') {
    return {
      headline: signup.status === 'New' ? 'Signed up, not started' : 'Quotation sent',
      note: 'The membership starts once the fee is paid',
      tone: 'sky',
      left: null,
      pct: 0,
    };
  }
  if (signup.status === 'Cancelled') {
    return { headline: 'Cancelled', note: 'This membership was cancelled', tone: 'rose', left: null, pct: 0 };
  }
  if (left == null) {
    return { headline: signup.status, note: 'No expiry date on record', tone: 'slate', left: null, pct: 0 };
  }
  if (left < 0) {
    return {
      headline: `Expired ${Math.abs(left)} days ago`,
      note: `Ran out on ${signup.expiresOn} — renew to keep the benefits`,
      tone: 'rose',
      left,
      pct: 0,
    };
  }
  if (left === 0) {
    return { headline: 'Expires today', note: `Last day is ${signup.expiresOn}`, tone: 'rose', left, pct: 2 };
  }

  // A yearly plan, so the bar reads as a share of 365 days.
  const pct = Math.max(2, Math.min(100, Math.round((left / 365) * 100)));
  if (left <= 30) {
    return {
      headline: `${left} days left`,
      note: `Expires on ${signup.expiresOn} — due for renewal`,
      tone: 'amber',
      left,
      pct,
    };
  }
  return {
    headline: `${left} days left`,
    note: `Valid till ${signup.expiresOn}`,
    tone: 'green',
    left,
    pct,
  };
}
