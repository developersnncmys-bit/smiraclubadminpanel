import { useState } from 'react';
import {
  Plus,
  UserCheck,
  ArrowUpRight,
  MessageCircle,
  Phone,
  StickyNote,
  Download,
  Star,
  AlertTriangle,
  Search,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import TicketDetails from '../components/support/TicketDetails.jsx';
import { useApp } from '../store/AppStore.jsx';
import { downloadCsv } from '../lib/csv.js';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import {
  ticketStages,
  stageTone,
  ticketCategories,
  priorities,
  escalationLevels,
  escalationTriggers,
  supportAutomation,
} from '../data/supportData.js';

const slaTone = { Within: 'green', Approaching: 'amber', Breached: 'rose' };
const CATEGORIES = Object.keys(ticketCategories);

/**
 * Support and complaints, built to the client's sheet: the funnel, the ticket
 * list with their columns and filters, who is carrying what, the SLA clock,
 * the escalation ladder and how the resolution felt to the customer.
 */
export default function Support() {
  const { tickets, team, customers, bookings, create, update, toast } = useApp();
  const [viewing, setViewing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [executive, setExecutive] = useState('All');
  const [sla, setSla] = useState('All');

  const consultants = team.map((m) => m.name.split(' ')[0]);

  const matches = (t) => {
    if (stage !== 'All' && t.stage !== stage) return false;
    if (priority !== 'All' && t.priority !== priority) return false;
    if (category !== 'All' && t.category !== category) return false;
    if (executive !== 'All' && t.executive !== executive) return false;
    if (sla !== 'All' && t.slaState !== sla) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [t.id, t.customer, t.phone, t.subCategory, t.booking, t.hotel].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  };
  const rows = tickets.filter(matches);

  const at = (s) => tickets.filter((t) => t.stage === s).length;
  const open = tickets.filter((t) => !['Closed', 'Customer confirmed'].includes(t.stage));
  const breached = tickets.filter((t) => t.slaState === 'Breached');
  const approaching = tickets.filter((t) => t.slaState === 'Approaching');
  const escalated = tickets.filter((t) => (t.escalation || 1) > 1);
  const rated = tickets.filter((t) => t.rating != null);
  const csat = rated.length ? (rated.reduce((s, t) => s + t.rating, 0) / rated.length).toFixed(1) : '—';
  const resolvedTickets = tickets.filter((t) => t.resolutionMins);
  const avgResolution = resolvedTickets.length
    ? Math.round(resolvedTickets.reduce((s, t) => s + t.resolutionMins, 0) / resolvedTickets.length / 60)
    : 0;

  const kpis = [
    { label: 'Open tickets', value: open.length },
    { label: 'Critical', value: tickets.filter((t) => t.priority === 'Critical').length, tone: 'text-rose-600' },
    { label: 'SLA breached', value: breached.length, tone: breached.length ? 'text-rose-600' : undefined },
    { label: 'Approaching SLA', value: approaching.length, tone: approaching.length ? 'text-amber-600' : undefined },
    { label: 'Escalated', value: escalated.length },
    { label: 'Resolved', value: at('Resolved') + at('Customer confirmed') + at('Closed'), tone: 'text-emerald-600' },
    { label: 'Average resolution', value: avgResolution ? `${avgResolution} hrs` : '—' },
    { label: 'Satisfaction', value: csat === '—' ? '—' : `${csat}/5`, hint: `${rated.length} rated` },
  ];

  const exportTickets = () =>
    downloadCsv('smira-club-tickets', tickets, [
      { key: 'id', header: 'Ticket' },
      { key: 'customer', header: 'Customer' },
      { key: 'phone', header: 'Mobile' },
      { key: 'membership', header: 'Membership' },
      { key: 'category', header: 'Category' },
      { key: 'subCategory', header: 'Sub-category' },
      { key: 'booking', header: 'Booking' },
      { key: 'executive', header: 'Executive' },
      { key: 'priority', header: 'Priority' },
      { key: 'stage', header: 'Status' },
      { key: 'created', header: 'Created' },
      { key: 'updated', header: 'Last updated' },
      { key: 'slaState', header: 'SLA' },
      { key: 'escalation', header: 'Escalation level' },
      { key: 'rating', header: 'Rating' },
    ]);

  const fields = [
    { name: 'customer', label: 'Customer', type: 'text', required: true },
    { name: 'phone', label: 'Mobile number', type: 'tel', required: true },
    { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
    { name: 'subCategory', label: 'Sub-category', type: 'text' },
    { name: 'booking', label: 'Booking ID', type: 'text' },
    { name: 'priority', label: 'Priority', type: 'select', options: priorities.map((p) => p.key) },
    { name: 'executive', label: 'Assign to', type: 'select', options: consultants },
    { name: 'description', label: 'What happened', type: 'textarea', full: true, required: true },
  ];

  const raise = (values) => {
    const p = priorities.find((x) => x.key === values.priority) || priorities[2];
    create('tickets', {
      ...values,
      membership: '—',
      membershipExpiry: '—',
      hotel: '—',
      attachments: [],
      department: values.category,
      stage: 'Assigned',
      escalation: 1,
      created: 'just now',
      updated: 'just now',
      firstResponseMins: null,
      slaDeadline: `within ${p.resolution} hrs`,
      slaState: 'Within',
      resolutionMins: null,
      rating: null,
      resolution: null,
      previousComplaints: 0,
      timeline: [{ at: 'just now', who: 'You', channel: 'Panel', text: values.description }],
    });
  };

  const patch = (id, values) => update('tickets', id, values, { silent: true });

  const quick = [
    { icon: Plus, label: 'Create ticket', run: () => setFormOpen(true) },
    { icon: UserCheck, label: 'Assign ticket', run: () => toast('Open a ticket to assign it', 'info') },
    { icon: ArrowUpRight, label: 'Escalate', run: () => toast('Open a ticket to escalate it', 'info') },
    { icon: MessageCircle, label: 'Send WhatsApp', run: () => toast('WhatsApp goes out with the messaging work', 'info') },
    { icon: Phone, label: 'Call customer', run: () => toast('Open a ticket to call the customer', 'info') },
    { icon: StickyNote, label: 'Add internal note', run: () => toast('Open a ticket to add a note', 'info') },
    { icon: Download, label: 'Export report', run: exportTickets },
  ];

  const workload = team.map((m) => {
    const first = m.name.split(' ')[0];
    const mine = tickets.filter((t) => t.executive === first);
    return {
      name: m.name,
      open: mine.filter((t) => ['New', 'Assigned', 'Waiting'].includes(t.stage)).length,
      progress: mine.filter((t) => t.stage === 'In progress').length,
      overdue: mine.filter((t) => t.slaState === 'Breached').length,
      resolved: mine.filter((t) => ['Resolved', 'Customer confirmed', 'Closed'].includes(t.stage)).length,
    };
  });

  return (
    <>
      <PageHeader title="Support and complaints" subtitle="Every complaint, who is on it, and how long it has left">
        <button className="btn-ghost" onClick={exportTickets}>
          <Download size={16} /> Export
        </button>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Create ticket
        </button>
      </PageHeader>

      <KpiRow items={kpis} cols={8} />

      <div className="card mt-6 flex flex-wrap items-center gap-2 px-4 py-3.5">
        <p className="eyebrow mr-1">Quick actions</p>
        {quick.map((q) => (
          <button key={q.label} className="btn-ghost btn-sm" onClick={q.run}>
            <q.icon size={14} /> {q.label}
          </button>
        ))}
      </div>

      {/* The funnel */}
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Block title="Complaint funnel" note="Click a stage to see those tickets" wide>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {ticketStages.map((s) => (
              <li key={s}>
                <button
                  onClick={() => setStage(stage === s ? 'All' : s)}
                  className={`w-full rounded-xl px-4 py-3 text-left transition ${
                    stage === s ? 'bg-brand-50 ring-1 ring-brand-600/25' : 'bg-surface-soft hover:bg-surface-soft/70'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <Badge tone={stageTone[s]}>{s}</Badge>
                    <span className="num text-sm font-bold text-ink-900">{at(s)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-600">
            {tickets.length} tickets · {Math.round(((at('Closed') + at('Customer confirmed')) / (tickets.length || 1)) * 100)}%
            resolved and confirmed
          </p>
        </Block>

        {/* The ticket list */}
        <Block
          title="Tickets"
          note="Their columns, their filters"
          wide
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  className="input h-9 w-44 py-0 pl-9 text-sm"
                  placeholder="Search tickets…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select className="input h-9 w-auto py-0 text-sm" value={stage} onChange={(e) => setStage(e.target.value)}>
                <option value="All">All statuses</option>
                {ticketStages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select className="input h-9 w-auto py-0 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="All">All priorities</option>
                {priorities.map((p) => (
                  <option key={p.key}>{p.key}</option>
                ))}
              </select>
              <select className="input h-9 w-auto py-0 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="All">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select className="input h-9 w-auto py-0 text-sm" value={executive} onChange={(e) => setExecutive(e.target.value)}>
                <option value="All">All executives</option>
                {consultants.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select className="input h-9 w-auto py-0 text-sm" value={sla} onChange={(e) => setSla(e.target.value)}>
                <option value="All">Any SLA</option>
                {['Within', 'Approaching', 'Breached'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Ticket', 'Customer', 'Membership', 'Category', 'Booking', 'Executive', 'Priority', 'Status', 'SLA', 'Level', 'Rating'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {rows.map((t) => (
                  <tr key={t.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => setViewing(t)}>
                    <td className="num py-2.5 font-bold text-brand-700">
                      {t.id}
                      <span className="block text-xs font-normal text-ink-400">{t.created}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={t.customer} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-ink-900">{t.customer}</span>
                          <span className="num block text-xs text-ink-400">{t.phone}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 text-ink-700">{t.membership}</td>
                    <td className="py-2.5">
                      <span className="block font-semibold text-ink-800">{t.category}</span>
                      <span className="block text-xs text-ink-500">{t.subCategory}</span>
                    </td>
                    <td className="num py-2.5 text-ink-700">{t.booking}</td>
                    <td className="py-2.5 text-ink-700">{t.executive}</td>
                    <td className="py-2.5">
                      <Badge tone={priorities.find((p) => p.key === t.priority)?.tone || 'slate'}>{t.priority}</Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge tone={stageTone[t.stage]} dot>
                        {t.stage}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge tone={slaTone[t.slaState]}>{t.slaState}</Badge>
                    </td>
                    <td className="num py-2.5 text-ink-700">L{t.escalation || 1}</td>
                    <td className="py-2.5">
                      {t.rating ? (
                        <span className="num flex items-center gap-1 font-bold text-amber-600">
                          <Star size={12} className="fill-amber-400 text-amber-400" /> {t.rating}
                        </span>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-6 text-center text-ink-500">
                      No ticket matches this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Block>

        {/* SLA */}
        <Block title="SLA clock" note="First response and resolution targets by priority">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Within SLA" value={tickets.filter((t) => t.slaState === 'Within').length} tone="text-emerald-600" />
            <Stat label="Approaching" value={approaching.length} tone="text-amber-600" />
            <Stat label="Breached" value={breached.length} tone="text-rose-600" />
          </div>
          <ul className="mt-4 divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {priorities.map((p) => (
              <li key={p.key} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Badge tone={p.tone}>{p.key}</Badge>
                <span className="min-w-0 flex-1 text-xs text-ink-500">{p.note}</span>
                <span className="num text-sm text-ink-700">
                  first reply {p.firstResponse} min · resolve in {p.resolution} hrs
                </span>
              </li>
            ))}
          </ul>
        </Block>

        {/* Escalation */}
        <Block title="Escalation" note="Where a ticket goes when it stalls">
          <ol className="space-y-1.5">
            {escalationLevels.map((l, i) => (
              <li key={l} className="flex items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-2.5">
                <span className="text-sm font-semibold text-ink-800">{l}</span>
                <span className="num text-sm font-bold text-ink-900">
                  {tickets.filter((t) => (t.escalation || 1) === i + 1).length}
                </span>
              </li>
            ))}
          </ol>
          <p className="eyebrow mt-4">It climbs when</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {escalationTriggers.map((t) => (
              <span key={t} className="chip text-ink-500">
                {t}
              </span>
            ))}
          </div>
        </Block>

        {/* Who is carrying what */}
        <Block title="Who is carrying what" note="Open, in progress, overdue and resolved per executive">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Executive', 'Open', 'In progress', 'Overdue', 'Resolved'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {workload.map((w) => (
                  <tr key={w.name}>
                    <td className="py-2.5 font-bold text-ink-900">{w.name}</td>
                    <td className="num py-2.5 text-ink-700">{w.open}</td>
                    <td className="num py-2.5 text-ink-700">{w.progress}</td>
                    <td className={`num py-2.5 font-bold ${w.overdue ? 'text-rose-600' : 'text-ink-700'}`}>{w.overdue}</td>
                    <td className="num py-2.5 font-bold text-emerald-600">{w.resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Tickets are assigned on department, team, category, workload, priority, location or partner.
          </p>
        </Block>

        {/* Categories */}
        <Block title="What people complain about" note="Every category, and what sits inside it" wide>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c} className="rounded-xl border border-ink-900/[0.07] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-ink-900">{c}</p>
                  <span className="num text-sm font-bold text-ink-900">
                    {tickets.filter((t) => t.category === c).length}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ticketCategories[c].map((sub) => (
                    <span key={sub} className="chip text-ink-500">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Block>

        {/* Satisfaction */}
        <Block title="How it felt to the customer" note="Asked after every resolution">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Average rating" value={csat === '—' ? '—' : `${csat}/5`} tone="text-amber-600" />
            <Stat label="Rated" value={rated.length} />
            <Stat
              label="Poor ratings"
              value={rated.filter((t) => t.rating <= 2).length}
              tone={rated.some((t) => t.rating <= 2) ? 'text-rose-600' : 'text-ink-900'}
            />
          </div>
          <ul className="mt-4 space-y-2.5">
            {consultants.map((c) => {
              const mine = rated.filter((t) => t.executive === c);
              const avg = mine.length ? (mine.reduce((s, t) => s + t.rating, 0) / mine.length).toFixed(1) : null;
              return (
                <li key={c} className="flex items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-2.5">
                  <span className="text-sm font-semibold text-ink-700">{c}</span>
                  <span className="num text-sm font-bold text-ink-900">{avg ? `${avg}/5` : 'not rated'}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 flex items-start gap-2 text-xs text-ink-500">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
            One and two star ratings raise a follow-up task on their own.
          </p>
        </Block>

        {/* Automation */}
        <Block title="What the panel does on its own" note="From the complaint landing to the rating coming back">
          <div className="flex flex-wrap gap-2">
            {supportAutomation.map((a) => (
              <span key={a} className="chip text-ink-600">
                {a}
              </span>
            ))}
          </div>
        </Block>
      </div>

      {viewing && (
        <TicketDetails
          ticket={tickets.find((t) => t.id === viewing.id) || viewing}
          list={rows}
          customer={customers.find((c) => c.name === viewing.customer) || null}
          bookings={bookings}
          onClose={() => setViewing(null)}
          onJump={(i) => setViewing(rows[i])}
          onUpdate={patch}
          actions={{
            note: (message, tone) => toast(message, tone),
            escalate: (t) =>
              patch(t.id, { escalation: Math.min(4, (t.escalation || 1) + 1), stage: 'Escalated' }),
            assign: () => toast('Pick the executive from the ticket list', 'info'),
          }}
        />
      )}

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={raise}
        title="Create ticket"
        subtitle="Log a complaint against a member or a booking"
        fields={fields}
        initial={{ priority: 'Medium', category: 'Booking', executive: consultants[0] }}
        submitLabel="Create ticket"
      />
    </>
  );
}
