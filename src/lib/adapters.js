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

// -- One entry per collection the panel shares with the API -----------------

export const ADAPTERS = {
  // -- People --------------------------------------------------------------
  team: {
    path: '/users',
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
    to: (p) => ({
      name: p.name,
      phone: p.phone,
      email: p.email,
      destination: p.destination,
      pax: p.pax,
      budget: p.budget,
      status: p.status,
      source: p.source,
      label: p.label,
      priority: p.priority,
      branch: p.branch,
      lostReason: p.lostReason,
      ...(p.ownerId ? { owner: p.ownerId } : {}),
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
      special: d(c.anniversary),
      lastBooking: d(c.lastBookingOn),
      lastInteraction: d(c.lastInteractionOn),
      referral: c.referral || {},
      preferences: c.preferences || {},
      family: c.family || [],
      branch: c.branch,
    }),
    to: (p) => ({
      name: p.name,
      phone: p.phone,
      email: p.email,
      city: p.city,
      address: p.address,
      tier: p.tier,
      engagement: p.engagement,
      branch: p.branch,
      ...(p.expertId ? { expert: p.expertId } : {}),
    }),
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
      duration: p.durationMonths,
      persons: p.persons,
      rooms: p.rooms,
      freeStay: p.freeStay || { nights: 0 },
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
      price: p.price,
      billing: p.billing,
      discount: p.discount,
      durationMonths: p.duration,
      persons: p.persons,
      rooms: p.rooms,
      freeStay: p.freeStay,
      services: p.services,
      gifts: p.gifts,
      features: p.features,
      published: p.published,
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
    to: (p) => ({
      status: p.status,
      amount: p.amount,
      paid: p.paid,
      branch: p.branch,
      movement: p.movement,
      activation: p.activation,
      renewal: p.renewal,
      ...(p.expertId ? { expert: p.expertId } : {}),
      ...(p.planId ? { plan: p.planId } : {}),
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
    to: (p) => ({
      bookingType: p.bookingType,
      hotel: p.hotel,
      destination: p.destination,
      rooms: p.rooms,
      pax: p.pax,
      status: p.status,
      charges: p.charges,
      paid: p.paid,
      refund: p.refund,
      ...(p.customerId ? { customer: p.customerId } : {}),
      ...(p.ownerId ? { owner: p.ownerId } : {}),
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
      booking: i.booking ? '—' : '—',
      issued: d(i.issuedOn),
      due: d(i.dueOn),
      amount: i.amount ?? 0,
      paid: i.paid ?? 0,
      status: i.status,
    }),
    to: (p) => ({ amount: p.amount, paid: p.paid, status: p.status }),
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

export function toApi(collection, patch) {
  const adapter = ADAPTERS[collection];
  if (!adapter) return patch;
  const body = adapter.to(patch);
  // Never send a key the caller did not actually set.
  Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);
  return body;
}

export function pathFor(collection) {
  return ADAPTERS[collection]?.path;
}
