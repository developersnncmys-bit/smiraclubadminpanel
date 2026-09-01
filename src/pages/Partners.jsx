import { useState } from 'react';
import {
  Plus,
  Search,
  ShieldCheck,
  FileText,
  Ban,
  Send,
  Star,
  Download,
  Handshake,
  Clock,
  CalendarCheck,
  IndianRupee,
  Wallet,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import PartnerProfile from '../components/partners/PartnerProfile.jsx';
import { useApp } from '../store/AppStore.jsx';
import { downloadCsv } from '../lib/csv.js';
import { inr, shortInr } from '../data/mockData.js';
import Block from '../components/ui/Block.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import Stat from '../components/ui/Stat.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import {
  onboardingFlow,
  approvalStates,
  partnerCategories,
  partnerPipeline,
  pipelineExits,
  partnerTicketKinds,
  settlementFlow,
  partnerMessageKinds,
  partnerRequests,
  partnerTickets,
  settlements as seedSettlements,
} from '../data/partnersData.js';

const VIEWS = ['Partners', 'Onboarding', 'Bookings', 'Support', 'Performance', 'Finance', 'Communication'];

const approvalTone = {
  Approved: 'green',
  'Pending review': 'amber',
  'Documents required': 'amber',
  'Verification pending': 'sky',
  Rejected: 'rose',
  Suspended: 'rose',
};

/**
 * A partner's score out of a hundred, from the six things the client's sheet
 * says make a good partner.
 */
function scoreOf(p) {
  if (!p.bookings) return { value: 0, band: 'Not rated yet', tone: 'slate' };
  const confirmation = (p.confirmed / p.bookings) * 100;
  const cancellation = (p.cancelled / p.bookings) * 100;
  const response = p.responseMins == null ? 50 : Math.max(0, 100 - p.responseMins);
  const rating = (p.rating || 0) * 20;
  const success = ((p.bookings - p.failed) / p.bookings) * 100;
  const availability = p.status === 'Active' ? 100 : 40;
  const value = Math.round(
    availability * 0.15 + response * 0.15 + confirmation * 0.2 + Math.max(0, 100 - cancellation * 4) * 0.15 + rating * 0.2 + success * 0.15
  );
  if (value >= 80) return { value, band: 'Top partner', tone: 'green' };
  if (value >= 60) return { value, band: 'Doing fine', tone: 'sky' };
  if (value >= 40) return { value, band: 'Needs attention', tone: 'amber' };
  return { value, band: 'Risky', tone: 'rose' };
}

/**
 * Partners as the client's sheet lays them out: the main list, how one is
 * onboarded, the bookings that pass through them, the tickets they raise,
 * how they score, what they are owed and what the panel sends them.
 */
export default function Partners() {
  const { partners, update, create, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('Partners');
  const [viewing, setViewing] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  const rows = partners.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    if (status !== 'All' && p.status !== status) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [p.name, p.contact, p.location, p.category, p.phone].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  });

  const active = partners.filter((p) => p.status === 'Active');
  const bookingValue = partners.reduce((s, p) => s + Number(p.revenue || 0), 0);
  const commission = partners.reduce((s, p) => s + Number(p.commissionEarned || 0), 0);
  const payable = partners.reduce((s, p) => s + Number(p.payable || 0), 0);
  const paid = partners.reduce((s, p) => s + Number(p.paid || 0), 0);
  const pendingApproval = partners.filter((p) => p.approval !== 'Approved' && p.approval !== 'Suspended');

  const kpis = [
    { icon: Handshake, label: 'Partners', value: partners.length, hint: `${active.length} active` },
    { icon: Clock, label: 'Waiting', value: pendingApproval.length, tone: pendingApproval.length ? 'text-amber-600' : undefined },
    { icon: Ban, label: 'Suspended', value: partners.filter((p) => p.status === 'Suspended').length, tone: 'text-rose-600' },
    { icon: CalendarCheck, label: 'Booked', value: shortInr(bookingValue), tone: 'text-brand-700' },
    { icon: IndianRupee, label: 'Commission', value: shortInr(commission), tone: 'text-emerald-600' },
    { icon: Wallet, label: 'Payable', value: shortInr(payable), tone: payable ? 'text-amber-600' : undefined },
    { icon: CheckCircle2, label: 'Paid so far', value: shortInr(paid) },
    { icon: Headphones, label: 'Open tickets', value: partnerTickets.filter((t) => t.stage !== 'Closed').length },
  ];

  /** The details the desk needs before a partner can be reviewed. */
  const partnerFields = [
    { name: 'name', label: 'Partner name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', options: partnerCategories },
    { name: 'businessType', label: 'Business type', type: 'text', placeholder: 'Resort, DMC, fleet…' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Jimbaran, Bali' },
    { name: 'contact', label: 'Contact person', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+91 ' },
    { name: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: 'same as phone if blank' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'commission', label: 'Commission (%)', type: 'number' },
    { name: 'ratePlan', label: 'Rate plan', type: 'text', full: true, placeholder: 'Contract 2026-A · ocean view suite ₹42,000' },
    { name: 'registration', label: 'Registration number', type: 'text' },
    { name: 'gst', label: 'GST', type: 'text' },
    { name: 'pan', label: 'PAN', type: 'text' },
    { name: 'upi', label: 'UPI', type: 'text' },
    { name: 'bank', label: 'Bank account', type: 'text', full: true, placeholder: 'HDFC · ****4471' },
  ];

  const savePartner = (values) => {
    const clean = { ...values, whatsapp: values.whatsapp || values.phone };
    if (editing) {
      update('partners', editing.id, clean, { message: `${clean.name} updated` });
      setEditing(null);
      return;
    }
    const id = create(
      'partners',
      {
        ...clean,
        submitted: 'today',
        verification: 'Pending',
        approval: 'Pending review',
        stage: 'Registration',
        status: 'Pending',
        bookings: 0, confirmed: 0, cancelled: 0, failed: 0,
        revenue: 0, commissionEarned: 0, payable: 0, paid: 0,
        responseMins: null, rating: null, repeat: 0, rooms: 0,
        ratePlan: clean.ratePlan || '—',
        documents: [
          { name: 'Business registration', status: 'Missing' },
          { name: 'Contract', status: 'Missing' },
          { name: 'Bank details', status: 'Missing' },
          { name: 'Tax certificate', status: 'Missing' },
        ],
        activity: [{ at: 'today', text: 'Added from the panel' }],
      },
      { silent: true }
    );
    toast(`${clean.name} added — ${id} is waiting on documents`);
    setView('Onboarding');
  };

  const exportPartners = () =>
    downloadCsv('smira-club-partners', partners, [
      { key: 'id', header: 'Partner' },
      { key: 'name', header: 'Name' },
      { key: 'category', header: 'Category' },
      { key: 'location', header: 'Location' },
      { key: 'status', header: 'Status' },
      { key: 'approval', header: 'Approval' },
      { key: 'bookings', header: 'Bookings' },
      { key: 'revenue', header: 'Revenue' },
      { key: 'commissionEarned', header: 'Commission' },
      { key: 'payable', header: 'Payable' },
      { key: 'rating', header: 'Rating' },
      { key: 'responseMins', header: 'Response (min)' },
    ]);

  const actions = {
    approve: (p) => update('partners', p.id, { approval: 'Approved', status: 'Active', stage: 'Active' }, { message: `${p.name} approved` }),
    suspend: (p) => update('partners', p.id, { approval: 'Suspended', status: 'Suspended' }, { message: `${p.name} suspended` }),
    requestDocs: (p, doc) => toast(`${doc} requested from ${p.name}`),
    message: (p, kind) => toast(`${kind} sent to ${p.name}`),
    edit: (p) => {
      setViewing(null);
      setEditing(p);
      setFormOpen(true);
    },
  };

  const body = {
    Partners: (
      <Block
        title="Every partner"
        note="Category, where they are, what they bring and how fast they answer"
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input h-9 w-44 py-0 pl-9 text-sm"
                placeholder="Search partners…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="input h-9 w-auto py-0 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All categories</option>
              {partnerCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select className="input h-9 w-auto py-0 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All statuses</option>
              {['Active', 'Pending', 'Suspended'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-ink-900/[0.07] text-left">
                {['Partner', 'Category', 'Location', 'Status', 'Bookings', 'Revenue', 'Rating', 'Response', 'Score', 'Action'].map((h) => (
                  <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[0.07]">
              {rows.map((p) => {
                const s = scoreOf(p);
                return (
                  <tr key={p.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => setViewing(p)}>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={p.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-ink-900">{p.name}</span>
                          <span className="block truncate text-xs text-ink-500">{p.contact}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 text-ink-700">{p.category}</td>
                    <td className="py-2.5 text-ink-700">{p.location}</td>
                    <td className="py-2.5">
                      <Badge tone={p.status === 'Active' ? 'green' : p.status === 'Suspended' ? 'rose' : 'amber'} dot>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="num py-2.5 text-ink-700">{p.bookings || '—'}</td>
                    <td className="num py-2.5 font-bold text-brand-700">{p.revenue ? inr(p.revenue) : '—'}</td>
                    <td className="num py-2.5">
                      {p.rating ? (
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star size={12} className="fill-amber-400 text-amber-400" /> {p.rating}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="num py-2.5 text-ink-700">{p.responseMins ? `${p.responseMins} min` : '—'}</td>
                    <td className="py-2.5">
                      <Badge tone={s.tone}>{s.value ? `${s.value} · ${s.band}` : s.band}</Badge>
                    </td>
                    <td className="py-2.5 text-right">
                      <button className="btn-line btn-sm" onClick={(e) => { e.stopPropagation(); setViewing(p); }}>
                        {p.approval === 'Approved' ? 'View' : 'Review'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-ink-500">
                    No partner matches this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Block>
    ),

    Onboarding: (
      <>
        <Block title="Onboarding" note="Registration through to active" wide>
          <ul className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {onboardingFlow.map((s) => (
              <li key={s} className="rounded-xl bg-surface-soft px-4 py-3">
                <p className="text-sm font-bold text-ink-800">{s}</p>
                <p className="num mt-1 font-display text-xl font-extrabold text-ink-900">
                  {partners.filter((p) => p.stage === s).length}
                </p>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Waiting on the desk" note="Approve, ask for papers, reject or suspend" wide>
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {partners.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Avatar name={p.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink-900">{p.name}</span>
                  <span className="block truncate text-xs text-ink-500">
                    submitted {p.submitted} · {(p.documents || []).filter((d) => d.status === 'Verified').length} of{' '}
                    {(p.documents || []).length} documents verified
                  </span>
                </span>
                <Badge tone={approvalTone[p.approval] || 'slate'} dot>
                  {p.approval}
                </Badge>
                <span className="flex gap-1.5">
                  <button className="btn-line btn-sm" onClick={() => setViewing(p)}>
                    <FileText size={13} /> Documents
                  </button>
                  <button className="btn-line btn-sm" onClick={() => actions.approve(p)}>
                    <ShieldCheck size={13} /> Approve
                  </button>
                  <button className="btn-line btn-sm" onClick={() => actions.suspend(p)}>
                    <Ban size={13} /> Suspend
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-400">Approval states: {approvalStates.join(' · ')}</p>
        </Block>
      </>
    ),

    Bookings: (
      <>
        <Block title="Booking pipeline" note="Where every partner request sits" wide>
          <ul className="grid gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {partnerPipeline.map((s) => (
              <li key={s} className="rounded-xl bg-surface-soft px-4 py-3">
                <p className="text-xs font-bold text-ink-700">{s}</p>
                <p className="num mt-1 font-display text-lg font-extrabold text-ink-900">
                  {partnerRequests.filter((r) => r.stage === s).length}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-400">It can also end as: {pipelineExits.join(' · ')}</p>
        </Block>

        <Block title="Requests with partners" note="Everything each booking carries" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Booking', 'Customer', 'Membership', 'Partner', 'Service', 'Stay', 'Guests', 'Amount', 'Commission', 'Payout', 'Stage'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {partnerRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-soft">
                    <td className="num py-2.5 font-bold text-brand-700">{r.booking}</td>
                    <td className="py-2.5 text-ink-800">{r.customer}</td>
                    <td className="num py-2.5 text-ink-600">{r.membership}</td>
                    <td className="py-2.5 text-ink-700">{r.partner}</td>
                    <td className="py-2.5 text-ink-700">
                      {r.service}
                      <span className="block text-xs text-ink-500">
                        {r.occasion} · {r.request}
                      </span>
                    </td>
                    <td className="num py-2.5 text-ink-700">
                      {r.checkIn} → {r.checkOut}
                    </td>
                    <td className="num py-2.5 text-ink-700">
                      {r.guests} · {r.rooms} rooms
                    </td>
                    <td className="num py-2.5 font-bold text-ink-900">{inr(r.amount)}</td>
                    <td className="num py-2.5 text-emerald-600">{inr(r.commission)}</td>
                    <td className="num py-2.5 text-ink-700">{inr(r.payout)}</td>
                    <td className="py-2.5">
                      <Badge tone={r.stage === 'Completed' ? 'green' : 'sky'} dot>
                        {r.stage}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      </>
    ),

    Support: (
      <>
        <Block title="Partner support centre" note="Every ticket a partner has raised" wide>
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {partnerTickets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink-900">
                    {t.partner} · {t.kind}
                  </span>
                  <span className="block text-xs text-ink-500">
                    {t.detail} — {t.about} · raised {t.raised} · with {t.owner}
                  </span>
                </span>
                <Badge tone={t.stage === 'Closed' ? 'green' : 'amber'}>{t.stage}</Badge>
                <button className="btn-line btn-sm" onClick={() => toast(`${t.id} assigned`)}>
                  Assign
                </button>
                <button className="btn-line btn-sm" onClick={() => toast(`${t.id} resolved`)}>
                  Resolve
                </button>
              </li>
            ))}
            {partnerTickets.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink-500">No partner tickets open.</li>
            )}
          </ul>
          <p className="mt-3 text-xs text-ink-400">
            Ticket → assign a team member → talk to the partner → resolution → closed.
          </p>
        </Block>

        <Block title="What partners raise" note="The kinds of ticket the desk sees">
          <div className="flex flex-wrap gap-2">
            {partnerTicketKinds.map((k) => (
              <span key={k} className="chip text-ink-500">
                {k} <span className="num ml-1 text-ink-700">{partnerTickets.filter((t) => t.kind === k).length}</span>
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    Performance: (
      <>
        <Block title="Partner performance" note="Bookings, money, speed and how members rated them" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Partner', 'Bookings', 'Confirmed', 'Cancelled', 'Failed', 'Revenue', 'Commission', 'Response', 'Rating', 'Repeat', 'Cancellation rate', 'Score'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {partners.map((p) => {
                  const s = scoreOf(p);
                  return (
                    <tr key={p.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => setViewing(p)}>
                      <td className="py-2.5 font-bold text-ink-900">{p.name}</td>
                      <td className="num py-2.5 text-ink-700">{p.bookings}</td>
                      <td className="num py-2.5 text-emerald-600">{p.confirmed}</td>
                      <td className="num py-2.5 text-rose-600">{p.cancelled}</td>
                      <td className="num py-2.5 text-ink-700">{p.failed}</td>
                      <td className="num py-2.5 font-bold text-brand-700">{p.revenue ? inr(p.revenue) : '—'}</td>
                      <td className="num py-2.5 text-ink-700">{p.commissionEarned ? inr(p.commissionEarned) : '—'}</td>
                      <td className="num py-2.5 text-ink-700">{p.responseMins ? `${p.responseMins} min` : '—'}</td>
                      <td className="num py-2.5 text-amber-600">{p.rating ? `${p.rating}★` : '—'}</td>
                      <td className="num py-2.5 text-ink-700">{p.repeat}</td>
                      <td className="num py-2.5 text-ink-700">
                        {p.bookings ? `${((p.cancelled / p.bookings) * 100).toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-2.5">
                        <Badge tone={s.tone}>{s.value ? s.value : '—'}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-400">
            The score blends availability, response time, confirmation rate, cancellation rate, customer rating and
            booking success — so top partners, risky ones and the ones needing attention stand apart.
          </p>
        </Block>

        <Block title="Who to watch" note="Sorted by score">
          <ul className="space-y-2">
            {[...partners]
              .map((p) => ({ p, s: scoreOf(p) }))
              .sort((a, b) => b.s.value - a.s.value)
              .map(({ p, s }) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-2.5">
                  <span className="text-sm font-semibold text-ink-800">{p.name}</span>
                  <Badge tone={s.tone}>{s.band}</Badge>
                </li>
              ))}
          </ul>
        </Block>
      </>
    ),

    Finance: (
      <>
        <Block title="Finance dashboard" note="What was booked, what we keep and what they are owed" wide>
          <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-6">
            <Stat label="Total booking value" value={inr(bookingValue)} tone="text-brand-700" />
            <Stat label="Smira commission" value={inr(commission)} tone="text-emerald-600" />
            <Stat label="Partner payable" value={inr(payable)} tone={payable ? 'text-amber-600' : 'text-ink-900'} />
            <Stat label="Paid to partners" value={inr(paid)} />
            <Stat label="Taxes" value={inr(seedSettlements.reduce((s, x) => s + Number(x.tax || 0), 0))} />
            <Stat label="Adjustments" value={inr(seedSettlements.reduce((s, x) => s + Number(x.adjustment || 0), 0))} />
          </div>
        </Block>

        <Block title="Settlements" note="Booking completed through to settlement closed" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Settlement', 'Partner', 'Period', 'Booking value', 'Commission', 'Tax', 'Adjustment', 'Payable', 'Stage', 'Paid on'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {seedSettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-soft">
                    <td className="num py-2.5 font-bold text-brand-700">{s.id}</td>
                    <td className="py-2.5 text-ink-800">{s.partner}</td>
                    <td className="py-2.5 text-ink-600">{s.period}</td>
                    <td className="num py-2.5 text-ink-700">{inr(s.bookingValue)}</td>
                    <td className="num py-2.5 text-emerald-600">{inr(s.commission)}</td>
                    <td className="num py-2.5 text-ink-600">{inr(s.tax)}</td>
                    <td className="num py-2.5 text-ink-600">{s.adjustment ? inr(s.adjustment) : '—'}</td>
                    <td className="num py-2.5 font-bold text-ink-900">{inr(s.payable)}</td>
                    <td className="py-2.5">
                      <Badge tone={s.stage === 'Partner paid' ? 'green' : 'amber'} dot>
                        {s.stage}
                      </Badge>
                    </td>
                    <td className="num py-2.5 text-ink-600">{s.paidOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
            {settlementFlow.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-ink-300">→</span>}
                {s}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    Communication: (
      <Block title="What goes out to partners" note="Straight from the panel, over WhatsApp" wide>
        <div className="flex flex-wrap gap-2">
          {partnerMessageKinds.map((k) => (
            <button key={k} className="btn-line btn-sm" onClick={() => toast(`${k} queued for every active partner`)}>
              <Send size={13} /> {k}
            </button>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
          {partners.flatMap((p) =>
            (p.activity || []).map((a) => (
              <li key={`${p.id}-${a.at}-${a.text}`} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={p.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink-900">{p.name}</span>
                  <span className="block truncate text-xs text-ink-500">{a.text}</span>
                </span>
                <span className="num shrink-0 text-xs text-ink-400">{a.at}</span>
              </li>
            ))
          )}
        </ul>
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="Partners" subtitle="Everyone the agency sells through, and what they are owed">
        <button className="btn-line" onClick={exportPartners}>
          <Download size={16} /> Export
        </button>
        <button
          className="btn-action"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Add partner
        </button>
      </PageHeader>

      <KpiRow items={kpis} cols={4} />

      <SectionTabs
        className="mb-5 mt-6"
        items={VIEWS}
        value={view}
        onChange={setView}
      />

      <div className="grid gap-5 xl:grid-cols-2">{body[view]}</div>

      <FormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={savePartner}
        title={editing ? `Edit ${editing.name}` : 'Add partner'}
        subtitle={editing ? editing.id : 'They land in onboarding, waiting on their documents'}
        fields={partnerFields}
        initial={editing || { category: partnerCategories[0], commission: 10 }}
        submitLabel={editing ? 'Save changes' : 'Add partner'}
      />

      {viewing && (
        <PartnerProfile
          partner={partners.find((p) => p.id === viewing.id) || viewing}
          list={rows}
          requests={partnerRequests}
          tickets={partnerTickets}
          settlements={seedSettlements}
          score={scoreOf(viewing)}
          onClose={() => setViewing(null)}
          onJump={(i) => setViewing(rows[i])}
          actions={actions}
        />
      )}
    </>
  );
}
