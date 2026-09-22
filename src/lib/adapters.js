/**
 * Translating between the API and the panel.
 *
 * The two disagree on purpose. The API stores an ObjectId for an owner and an
 * ISO date for a follow-up; the panel's screens were written against a first
 * name and "Today 4:00 pm", and eighteen pages read them that way. Rather
 * than rewrite every screen, each collection gets a pair of small functions:
 * `from` shapes an API document into what the panel already expects, and
 * `to` turns a panel patch back into what the API accepts.
 *
 * Every adapted record keeps `_id`, because that is what a write has to be
 * addressed to, and takes its `id` from the readable code the desk quotes.
 */

// -- Small shared helpers ---------------------------------------------------

/** "04 Aug 2026", the way every screen writes a date. */
const d = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** "04 Aug 2026, 09:12 am" — for anything where the time matters. */
const dt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${d(date)}, ${date
    .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toLowerCase()}`;
};

/** A populated reference down to the first name the panel files things under. */
const who = (ref) => {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  return String(ref.name || '').split(' ')[0] || '—';
};

/** The same reference, but its full name. */
const fullName = (ref) => {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  return ref.name || '';
};

/** The id a write has to be addressed to. */
const ref = (value) => {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value._id;
};

/** What every adapted record carries, whatever collection it came from. */
const base = (doc) => ({ ...doc, _id: doc._id, id: doc.code || doc._id });

// -- Going the other way: screen values into server values -------------------

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

/** A number, or nothing — never an empty string the server cannot cast. */
const num = (v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * A date the way the desk writes it, as the server stores it.
 *
 * Takes what the screens actually produce: "18 Sep 2026", "04 Aug 2026, 09:12
 * am", "Tomorrow 11am", "Today 4:00 pm", "just now", and the yyyy-mm-dd a date
 * picker gives. Anything it cannot read comes back undefined, so a half-typed
 * date is left alone rather than saved as nonsense.
 */
export function when(value, now = new Date()) {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString();

  const text = String(value).trim();
  if (!text || text === '—' || text === '-') return undefined;
  const lower = text.toLowerCase();
  if (lower === 'just now' || lower === 'now') return now.toISOString();

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    // A bare date is that day, not midnight UTC the day before in India.
    const d = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T09:00:00`) : new Date(text);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  let at;
  let rest = '';
  const relative = lower.match(/^(today|tomorrow|yesterday)\b[\s,]*(.*)$/);
  // "In 3 days", "in 2 weeks", "next week", "next month" — the quick picks.
  const ahead = lower.match(/^in\s+(\d{1,3})\s+(day|days|week|weeks)\b[\s,]*(.*)$/);
  const next = lower.match(/^next\s+(week|month)\b[\s,]*(.*)$/);
  if (ahead || next) {
    at = new Date(now);
    at.setHours(9, 0, 0, 0);
    if (ahead) at.setDate(at.getDate() + Number(ahead[1]) * (ahead[2].startsWith('week') ? 7 : 1));
    else if (next[1] === 'week') at.setDate(at.getDate() + 7);
    else at.setMonth(at.getMonth() + 1);
    rest = ahead ? ahead[3] : next[2];
  } else if (relative) {
    at = new Date(now);
    at.setHours(9, 0, 0, 0);
    at.setDate(at.getDate() + { today: 0, tomorrow: 1, yesterday: -1 }[relative[1]]);
    rest = relative[2];
  } else {
    const m = text.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})[\s,]*(.*)$/);
    if (!m) return undefined;
    const month = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
    if (month < 0) return undefined;
    at = new Date(Number(m[3]), month, Number(m[1]), 9, 0, 0, 0);
    if (at.getDate() !== Number(m[1])) return undefined; // 31 Feb
    rest = m[4];
  }

  const t = rest.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (t) {
    let hour = Number(t[1]);
    const minute = Number(t[2] || 0);
    const half = (t[3] || '').toLowerCase();
    if (half === 'pm' && hour < 12) hour += 12;
    if (half === 'am' && hour === 12) hour = 0;
    if (hour <= 23 && minute <= 59) at.setHours(hour, minute, 0, 0);
  }
  return at.toISOString();
}

const isObjectId = (v) => /^[a-f0-9]{24}$/i.test(String(v || ''));
const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

/** "Sneha" or "Sneha Kulkarni" → her id. Anyone we cannot place is left out. */
export function userId(value, ctx = {}) {
  if (!value || value === 'Unassigned' || value === '—') return undefined;
  if (isObjectId(value)) return value;
  const member = (ctx.team || []).find(
    (t) => t._id && (same(t.name, value) || same(String(t.name || '').split(' ')[0], value))
  );
  return member?._id;
}

/**
 * "Rohan Bhatt" → his customer id. Also reads the "Name · 1234" label the
 * booking form uses to tell two customers with the same name apart.
 */
export function customerId(value, ctx = {}) {
  if (!value) return undefined;
  if (isObjectId(value)) return value;
  const text = String(value);
  const labelled = text.match(/^(.*?)\s+·\s+(\d{4})$/);
  const list = (ctx.customers || []).filter((c) => c._id);
  const found = labelled
    ? list.find((c) => same(c.name, labelled[1]) && String(c.phone || '').replace(/\D/g, '').endsWith(labelled[2]))
    : list.find((c) => same(c.name, text));
  return found?._id;
}

/** "Gold Voyager" → the plan's id. */
const planId = (value, ctx = {}) => {
  if (!value) return undefined;
  if (isObjectId(value)) return value;
  return (ctx.memberships || []).find((p) => p._id && (p.id === value || same(p.name, value)))?._id;
};

/** "12 months" → 12. */
const months = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : undefined;
};

/** An invoice status as the server names it. Overdue is worked out from the due date. */
const INVOICE_STATUS = { Partial: 'Partially paid', Overdue: 'Pending' };

// -- One entry per collection the panel shares with the API -----------------

export const ADAPTERS = {
  // -- People --------------------------------------------------------------
  team: {
    path: '/users',
    // Read by every screen that assigns work, so when the Users module is
    // closed to this role we still ask for the directory rather than show an
    // empty desk.
    fallbackPath: '/users/directory',
    from: (u) => ({
      ...base(u),
      name: u.name,
      empId: u.empId,
      role: u.designation || u.role?.name || '',
      roleName: u.role?.name || '',
      roleId: ref(u.role),
      department: u.department,
      branch: u.branch,
      manager: fullName(u.manager),
      managerId: ref(u.manager),
      email: u.email,
      phone: u.phone,
      status: u.status,
      live: u.live,
      attendance: u.attendance,
      activity: u.activity,
      lastActive: u.lastActiveAt ? dt(u.lastActiveAt) : 'never',
      target: u.target ?? 0,
      revenue: u.revenue ?? 0,
      calls: u.calls ?? 0,
      presentations: u.presentations ?? 0,
      visits: u.visits ?? 0,
      followUps: u.followUps ?? 0,
      bookings: u.closings ?? 0,
      productivity: u.productivity ?? 0,
      joined: d(u.joinedOn),
    }),
    to: (p) => ({
      name: p.name,
      empId: p.empId,
      email: p.email,
      phone: p.phone,
      designation: p.role || p.designation,
      department: p.department,
      branch: p.branch,
      status: p.status,
      live: p.live,
      target: p.target,
      revenue: p.revenue,
      ...(p.roleId ? { role: p.roleId } : {}),
      ...(p.password ? { password: p.password } : {}),
    }),
  },

  roles: {
    path: '/roles',
    from: (r) => ({ ...base(r), id: r._id, people: r.people ?? 0 }),
    to: (p) => p,
  },

  // -- Sales ---------------------------------------------------------------
  enquiries: {
    path: '/leads',
    from: (l) => ({
      ...base(l),
      name: l.name,
      phone: l.phone,
      email: l.email,
      destination: l.destination,
      pax: l.pax,
      travelDate: d(l.travelDate),
      budget: l.budget ?? 0,
      status: l.status,
      source: l.source,
      campaign: l.campaign || '',
      owner: who(l.owner),
      ownerId: ref(l.owner),
      label: l.label,
      priority: l.priority,
      branch: l.branch,
      created: d(l.createdAt),
      lastContact: l.lastContactAt ? dt(l.lastContactAt) : '—',
      nextFollowUp: l.nextFollowUpAt ? dt(l.nextFollowUpAt) : '—',
      lostReason: l.lostReason,
      activities: l.activities || [],
    }),
    to: (p, ctx) => ({
      name: p.name,
      phone: p.phone,
      email: p.email,
      destination: p.destination,
      pax: num(p.pax),
      budget: num(p.budget),
      status: p.status,
      source: p.source,
      campaign: p.campaign,
      label: p.label,
      priority: p.priority,
      score: p.score,
      branch: p.branch,
      lostReason: p.lostReason,
      notes: p.notes,
      tags: p.tags,
      travelDate: has(p, 'travelDate') ? when(p.travelDate) : undefined,
      nextFollowUpAt: has(p, 'nextFollowUp') ? when(p.nextFollowUp) : undefined,
      lastContactAt: has(p, 'lastContact') ? when(p.lastContact) : undefined,
      owner: has(p, 'ownerId') ? p.ownerId || undefined : has(p, 'owner') ? userId(p.owner, ctx) : undefined,
    }),
  },

  tasks: {
    path: '/tasks',
    from: (t) => ({
      ...base(t),
      title: t.title,
      type: t.type,
      customer: t.customerName || fullName(t.customer),
      owner: who(t.owner),
      ownerId: ref(t.owner),
      due: t.dueAt ? dt(t.dueAt) : '—',
      priority: t.priority,
      status: t.status,
      bucket: t.bucket,
      lastAction: t.lastAction,
      nextAction: t.nextAction,
      note: t.note,
      created: d(t.createdAt),
    }),
    to: (p) => ({
      title: p.title,
      type: p.type,
      customerName: p.customer,
      priority: p.priority,
      status: p.status,
      lastAction: p.lastAction,
      nextAction: p.nextAction,
      note: p.note,
      ...(p.ownerId ? { owner: p.ownerId } : {}),
    }),
  },

  customers: {
    path: '/customers',
    from: (c) => ({
      ...base(c),
      name: c.name,
      phone: c.phone,
      email: c.email,
      city: c.city,
      address: c.address,
      trips: c.trips ?? 0,
      spend: c.spend ?? 0,
      tier: c.tier,
      expert: who(c.expert),
      expertId: ref(c.expert),
      engagement: c.engagement,
      satisfaction: c.satisfaction,
      dob: d(c.dob),
      special: d(c.anniversary || c.childBirthday),
      specialLabel: c.specialLabel || (c.childBirthday && !c.anniversary ? 'Child birthday' : c.anniversary ? 'Anniversary' : ''),
      source: c.source,
      last: d(c.lastBookingOn),
      notes: c.notes,
      lastBooking: d(c.lastBookingOn),
      lastInteraction: d(c.lastInteractionOn),
      referral: c.referral || {},
      preferences: c.preferences || {},
      family: c.family || [],
      branch: c.branch,
    }),
    to: (p, ctx) => {
      // The form files one special date under whatever it is.
      const child = p.specialLabel === 'Child birthday';
      return {
        name: p.name,
        phone: p.phone,
        email: p.email,
        city: p.city,
        address: p.address,
        tier: p.tier,
        engagement: p.engagement,
        branch: p.branch,
        source: p.source,
        notes: p.notes,
        trips: num(p.trips),
        spend: num(p.spend),
        satisfaction: num(p.satisfaction),
        preferences: p.preferences,
        dob: has(p, 'dob') ? when(p.dob) : undefined,
        // One special date at a time: setting one clears the other, or the
        // old date would keep showing after the label was changed.
        specialLabel: has(p, 'specialLabel') ? p.specialLabel : undefined,
        anniversary: has(p, 'special') ? (child ? null : when(p.special) ?? null) : undefined,
        childBirthday: has(p, 'special') ? (child ? when(p.special) ?? null : null) : undefined,
        lastBookingOn: has(p, 'last') ? when(p.last) : undefined,
        lastInteractionOn: has(p, 'lastInteraction') ? when(p.lastInteraction) : undefined,
        expert: has(p, 'expertId') ? p.expertId || undefined : has(p, 'expert') ? userId(p.expert, ctx) : undefined,
      };
    },
  },

  // -- Membership ----------------------------------------------------------
  memberships: {
    path: '/membership-plans',
    from: (p) => ({
      ...base(p),
      name: p.name,
      tagline: p.tagline,
      price: p.price,
      billing: p.billing,
      discount: p.discount ?? 0,
      duration: p.durationMonths ? `${p.durationMonths} months` : '',
      persons: p.persons,
      rooms: p.rooms,
      privileges: p.privileges ?? 1,
      freeStay: {
        nights: p.freeStay?.nights ?? 0,
        rooms: p.rooms ?? 1,
        validity: p.freeStay?.note || `${p.freeStay?.validityMonths ?? 12} months from joining`,
      },
      services: p.services || [],
      gifts: p.gifts || [],
      features: p.features || [],
      published: p.published,
      popular: p.popular,
      members: p.members ?? 0,
    }),
    to: (p) => ({
      name: p.name,
      tagline: p.tagline,
      price: num(p.price),
      billing: p.billing,
      discount: num(p.discount),
      durationMonths: has(p, 'duration') ? months(p.duration) : undefined,
      persons: num(p.persons),
      rooms: num(p.rooms),
      privileges: num(p.privileges),
      freeStay: p.freeStay
        ? {
            nights: num(p.freeStay.nights) ?? 0,
            validityMonths: months(p.freeStay.validity) ?? 12,
            note: p.freeStay.validity,
          }
        : undefined,
      services: p.services,
      gifts: p.gifts,
      features: p.features,
      published: p.published,
      popular: p.popular,
    }),
  },

  memberSignups: {
    path: '/memberships',
    from: (m) => ({
      ...base(m),
      name: m.name,
      phone: m.phone,
      email: m.email,
      city: m.city,
      branch: m.branch,
      plan: m.planName || fullName(m.plan),
      planId: ref(m.plan),
      members: m.members,
      movement: m.movement,
      source: m.source,
      received: d(m.receivedOn),
      startedOn: d(m.startedOn),
      expiresOn: d(m.expiresOn),
      amount: m.amount ?? 0,
      paid: m.paid ?? 0,
      refund: m.refund ?? 0,
      status: m.status,
      expert: who(m.expert),
      expertId: ref(m.expert),
      activation: m.activation || {},
      renewal: m.renewal || {},
      benefits: m.benefits || [],
      saving: m.saving ?? 0,
      timeline: m.timeline || [],
    }),
    to: (p, ctx) => ({
      customer: has(p, 'customerId') ? p.customerId || undefined : undefined,
      plan: has(p, 'planId') ? planId(p.planId, ctx) : has(p, 'plan') ? planId(p.plan, ctx) : undefined,
      source: p.source,
      branch: p.branch,
      members: num(p.members),
      movement: p.movement,
      status: p.status,
      amount: num(p.amount),
      paid: num(p.paid),
      activation: p.activation,
      renewal: p.renewal,
      expert: has(p, 'expertId') ? p.expertId || undefined : has(p, 'expert') ? userId(p.expert, ctx) : undefined,
    }),
  },

  // -- Booking -------------------------------------------------------------
  bookings: {
    path: '/bookings',
    from: (b) => ({
      ...base(b),
      customer: b.customerName || fullName(b.customer),
      customerId: ref(b.customer),
      membership: b.membershipPlan,
      bookingType: b.bookingType,
      hotel: b.hotel,
      vendor: b.vendorName || fullName(b.vendor),
      destination: b.destination,
      pkg: b.packageName,
      checkIn: d(b.checkIn),
      checkOut: d(b.checkOut),
      departure: d(b.departureOn),
      nights: b.nights,
      rooms: b.rooms,
      roomType: b.roomType,
      mealPlan: b.mealPlan,
      pax: b.pax,
      adults: b.adults,
      children: b.children,
      amount: b.amount ?? 0,
      paid: b.paid ?? 0,
      refund: b.refund ?? 0,
      status: b.status,
      owner: who(b.owner),
      ownerId: ref(b.owner),
      source: b.source,
      created: d(b.createdAt),
      charges: b.charges || {},
      confirmation: b.confirmation || {},
      vendorContact: { payable: b.vendorCost ?? 0, paid: b.vendorPaid ?? 0 },
      handledBy: b.handledBy || {},
      documents: b.documents || [],
      specialRequests: b.specialRequests || [],
      occasion: b.occasion,
      freeStay: b.freeStay,
    }),
    to: (p, ctx) => ({
      customer: has(p, 'customerId')
        ? p.customerId || undefined
        : has(p, 'customer')
          ? customerId(p.customer, ctx)
          : undefined,
      bookingType: p.bookingType,
      hotel: p.hotel,
      destination: p.destination,
      packageName: has(p, 'pkg') ? p.pkg : undefined,
      departureOn: has(p, 'departure') ? when(p.departure) : undefined,
      checkIn: has(p, 'checkIn') ? when(p.checkIn) : undefined,
      checkOut: has(p, 'checkOut') ? when(p.checkOut) : undefined,
      nights: num(p.nights),
      rooms: num(p.rooms),
      roomType: p.roomType,
      mealPlan: p.mealPlan,
      pax: num(p.pax),
      adults: num(p.adults),
      children: num(p.children),
      amount: num(p.amount),
      paid: num(p.paid),
      refund: num(p.refund),
      status: p.status,
      charges: p.charges,
      occasion: p.occasion,
      source: p.source,
      owner: has(p, 'ownerId') ? p.ownerId || undefined : has(p, 'owner') ? userId(p.owner, ctx) : undefined,
    }),
  },

  // -- Support -------------------------------------------------------------
  tickets: {
    path: '/tickets',
    from: (t) => ({
      ...base(t),
      customer: t.customerName || fullName(t.customer),
      customerId: ref(t.customer),
      phone: t.phone,
      membership: t.membershipName || '—',
      membershipExpiry: d(t.membershipExpiry),
      category: t.category,
      subCategory: t.subCategory,
      description: t.description,
      attachments: (t.attachments || []).map((a) => a.name || a),
      booking: t.booking ? '—' : '—',
      hotel: t.hotel || '—',
      executive: who(t.executive),
      executiveId: ref(t.executive),
      department: t.department,
      priority: t.priority,
      stage: t.stage,
      escalation: t.escalation ?? 1,
      created: dt(t.createdAt),
      updated: dt(t.updatedAt),
      firstResponseMins: t.firstResponseAt
        ? Math.round((new Date(t.firstResponseAt) - new Date(t.createdAt)) / 60000)
        : null,
      slaDeadline: dt(t.slaDeadline),
      slaState: t.slaState,
      resolutionMins: t.resolutionMins ?? null,
      rating: t.rating ?? null,
      resolution: t.resolution?.note ? t.resolution : null,
      previousComplaints: t.previousComplaints ?? 0,
      timeline: (t.timeline || []).map((e) => ({ ...e, at: dt(e.at) })),
    }),
    to: (p) => ({
      customerName: p.customer,
      phone: p.phone,
      category: p.category,
      subCategory: p.subCategory,
      description: p.description,
      priority: p.priority,
      stage: p.stage,
      escalation: p.escalation,
      department: p.department,
      resolution: p.resolution,
      rating: p.rating,
      ...(p.executiveId ? { executive: p.executiveId } : {}),
    }),
  },

  // -- Partners and stock ---------------------------------------------------
  partners: {
    path: '/partners',
    from: (p) => ({
      ...base(p),
      name: p.name,
      category: p.category,
      businessType: p.businessType,
      location: p.location,
      contact: p.contact,
      phone: p.phone,
      whatsapp: p.whatsapp,
      email: p.email,
      gst: p.gst,
      pan: p.pan,
      bank: p.bank,
      commission: p.commission,
      submitted: d(p.submittedOn),
      verification: p.verification,
      approval: p.approval,
      stage: p.stage,
      status: p.status,
      bookings: p.bookings ?? 0,
      confirmed: p.confirmed ?? 0,
      cancelled: p.cancelled ?? 0,
      failed: p.failed ?? 0,
      revenue: p.revenue ?? 0,
      commissionEarned: p.commissionEarned ?? 0,
      payable: p.payable ?? 0,
      paid: p.paid ?? 0,
      responseMins: p.responseMins ?? 0,
      rating: p.rating ?? 0,
      documents: p.documents || [],
      activity: (p.activities || []).map((a) => ({ ...a, at: d(a.at) })),
      contractEnds: d(p.contractEndsOn),
    }),
    to: (p) => ({
      name: p.name,
      category: p.category,
      location: p.location,
      contact: p.contact,
      phone: p.phone,
      email: p.email,
      gst: p.gst,
      pan: p.pan,
      commission: p.commission,
      status: p.status,
    }),
  },

  inventory: {
    path: '/inventory',
    from: (i) => ({
      ...base(i),
      category: i.category,
      name: i.name,
      code: i.reference || i.code,
      destination: i.destination,
      grade: i.grade,
      vendor: i.vendorName || fullName(i.partner),
      units: i.units ?? 0,
      booked: i.booked ?? 0,
      blocked: i.blocked ?? 0,
      baseRate: i.baseRate ?? 0,
      markup: i.markup ?? 0,
      memberDiscount: i.memberDiscount ?? 0,
      status: i.status,
      confirmation: i.confirmation,
      contractEnds: d(i.contractEndsOn),
      rateEnds: d(i.rateEndsOn),
      address: i.address,
      gps: i.gps,
      checkIn: i.checkIn,
      checkOut: i.checkOut,
      contact: i.contact,
      amenities: i.amenities || [],
      description: i.description,
      rooms: (i.rooms || []).map((r) => ({ ...r, child: r.childPolicy, meal: r.mealPlan })),
      allocation: i.allocation || { tiers: {}, channels: {}, buffer: 0 },
    }),
    to: (p) => ({
      name: p.name,
      category: p.category,
      destination: p.destination,
      units: p.units,
      booked: p.booked,
      blocked: p.blocked,
      baseRate: p.baseRate,
      markup: p.markup,
      memberDiscount: p.memberDiscount,
      status: p.status,
      confirmation: p.confirmation,
    }),
  },

  // -- Money ---------------------------------------------------------------
  invoices: {
    path: '/invoices',
    from: (i) => ({
      ...base(i),
      customer: i.customerName || fullName(i.customer),
      customerId: ref(i.customer),
      booking: i.bookingCode || (i.booking ? '—' : '—'),
      bookingId: ref(i.booking),
      issued: d(i.issuedOn),
      due: d(i.dueOn),
      amount: i.amount ?? 0,
      paid: i.paid ?? 0,
      status: i.status === 'Partially paid' ? 'Partial' : i.status,
    }),
    to: (p, ctx) => ({
      customer: has(p, 'customerId')
        ? p.customerId || undefined
        : has(p, 'customer')
          ? customerId(p.customer, ctx)
          : undefined,
      booking: has(p, 'bookingId') ? p.bookingId || undefined : undefined,
      forWhat: p.forWhat,
      issuedOn: has(p, 'issued') ? when(p.issued) : undefined,
      dueOn: has(p, 'due') ? when(p.due) : undefined,
      amount: num(p.amount),
      paid: num(p.paid),
      status: has(p, 'status') ? INVOICE_STATUS[p.status] || p.status : undefined,
    }),
  },

  payments: {
    path: '/payments',
    from: (p) => ({
      ...base(p),
      customer: p.customerName || fullName(p.customer),
      invoice: p.invoice ? '—' : '—',
      date: d(p.paidOn),
      mode: p.mode,
      amount: p.amount ?? 0,
      status: p.status,
    }),
    to: (p) => ({ amount: p.amount, mode: p.mode, status: p.status }),
  },

  approvals: {
    path: '/approvals',
    from: (a) => ({
      ...base(a),
      area: a.area,
      what: a.what,
      value: a.value ?? 0,
      raisedBy: who(a.raisedBy),
      approver: fullName(a.approver),
      raised: dt(a.createdAt),
      status: a.status,
      decidedAt: a.decidedAt ? dt(a.decidedAt) : '',
    }),
    to: (p) => ({ status: p.status, remark: p.remark }),
  },

  // -- WhatsApp and automation ---------------------------------------------
  conversations: {
    path: '/whatsapp/conversations',
    from: (c) => ({
      ...base(c),
      name: c.name,
      phone: c.phone,
      category: c.category,
      score: c.score,
      source: c.source,
      membership: c.membershipName,
      plan: c.planName,
      owner: who(c.owner),
      ownerId: ref(c.owner),
      handledBy: c.handledBy,
      unread: c.unread ?? 0,
      lastAt: c.lastMessageAt ? dt(c.lastMessageAt) : '',
      followUp: c.followUpAt ? d(c.followUpAt) : '—',
      tags: c.tags || [],
      note: c.note,
      messages: (c.messages || []).map((m) => ({ ...m, at: dt(m.at) })),
    }),
    to: (p) => ({ category: p.category, score: p.score, note: p.note, tags: p.tags }),
  },

  botFlows: {
    path: '/whatsapp/flows',
    from: (f) => ({ ...base(f), name: f.name, trigger: f.trigger, status: f.status, steps: f.steps || [], sessions: f.sessions ?? 0 }),
    to: (p) => ({ name: p.name, trigger: p.trigger, status: p.status, steps: p.steps }),
  },

  automations: {
    path: '/automations',
    from: (a) => ({
      ...base(a),
      name: a.name,
      when: a.when,
      conditions: a.conditions || [],
      steps: a.steps || [],
      otherwise: a.otherwise,
      status: a.status,
      runs: a.runs ?? 0,
      completed: a.completed ?? 0,
      errors: a.errorCount ?? 0,
      lastRun: a.lastRunAt ? dt(a.lastRunAt) : 'never',
    }),
    to: (p) => ({
      name: p.name,
      when: p.when,
      conditions: p.conditions,
      steps: p.steps,
      otherwise: p.otherwise,
      status: p.status,
    }),
  },

  // -- Rewards -------------------------------------------------------------
  rewardGrants: {
    path: '/rewards',
    from: (r) => ({
      ...base(r),
      customer: r.customerName || fullName(r.customer),
      gift: r.gift,
      kind: r.kind,
      value: r.value ?? 0,
      eligibility: r.eligibility,
      assigned: d(r.assignedOn),
      due: d(r.dueOn),
      fieldOfficer: who(r.fieldOfficer),
      proof: r.proof,
      stage: r.stage,
    }),
    to: (p) => ({ gift: p.gift, kind: p.kind, value: p.value, stage: p.stage, proof: p.proof }),
  },

  referrals: {
    path: '/referrals',
    from: (r) => ({
      ...base(r),
      referrer: r.referrerName || fullName(r.referrer),
      referred: r.referredName,
      date: d(r.createdAt),
      status: r.status,
      reward: r.reward ?? 0,
      rewardKind: r.rewardKind,
      paid: r.paid,
    }),
    to: (p) => ({ status: p.status, reward: p.reward, paid: p.paid }),
  },

  offers: {
    path: '/offers',
    from: (o) => ({
      ...base(o),
      name: o.name,
      code: o.couponCode,
      description: o.description,
      kind: o.kind,
      value: o.value ?? 0,
      startsOn: d(o.startsOn),
      endsOn: d(o.endsOn),
      used: o.used ?? 0,
      usageLimit: o.usageLimit ?? 0,
      status: o.status,
    }),
    to: (p) => ({
      name: p.name,
      couponCode: p.code,
      description: p.description,
      kind: p.kind,
      value: p.value,
      status: p.status,
    }),
  },
};

/** Collections the API knows about. Anything else stays on seed data. */
export const LIVE_COLLECTIONS = Object.keys(ADAPTERS);

export function fromApi(collection, doc) {
  const adapter = ADAPTERS[collection];
  return adapter ? adapter.from(doc) : doc;
}

export function toApi(collection, patch, ctx = {}) {
  const adapter = ADAPTERS[collection];
  if (!adapter) return patch;
  const body = adapter.to(patch, ctx);
  // Never send a key the caller did not actually set.
  Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);
  return body;
}

export function pathFor(collection) {
  return ADAPTERS[collection]?.path;
}

/** Where to look when the main path is closed to this role. */
export function fallbackPathFor(collection) {
  return ADAPTERS[collection]?.fallbackPath;
}
