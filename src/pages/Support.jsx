import { useState } from 'react';
import {
  Plus, UserCheck, ArrowUpRight, MessageCircle, Phone, StickyNote,
  Download, Star, AlertTriangle, Search, Headphones, AlarmClock,
  Clock, CheckCircle2, Timer, Filter, Zap,
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
import MenuButton from '../components/ui/MenuButton.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import SupportActions from '../components/support/SupportActions.jsx';
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
  const store = useApp();
  const { tickets, team, customers, bookings, create, update, updateMany, toast } = store;
  const [viewing, setViewing] = useState(null);
  const [section, setSection] = useState('Tickets');
  const [action, setAction] = useState(null);
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
    { icon: Headphones, label: 'Open', value: open.length },
    { icon: AlertTriangle, label: 'Critical', value: tickets.filter((t) => t.priority === 'Critical').length, tone: 'text-rose-600' },
    { icon: AlarmClock, label: 'Breached', value: breached.length, tone: breached.length ? 'text-rose-600' : undefined },
    { icon: Clock, label: 'Approaching', value: approaching.length, tone: approaching.length ? 'text-amber-600' : undefined },
    { icon: ArrowUpRight, label: 'Escalated', value: escalated.length },
    { icon: CheckCircle2, label: 'Resolved', value: at('Resolved') + at('Customer confirmed') + at('Closed'), tone: 'text-emerald-600' },
    { icon: Timer, label: 'Avg resolution', value: avgResolution ? `${avgResolution} hrs` : '—' },
    { icon: Star, label: 'Satisfaction', value: csat === '—' ? '—' : `${csat}/5`, hint: `${rated.length} rated` },
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
    { icon: UserCheck, label: 'Assign ticket', run: () => setAction('assign') },
    { icon: ArrowUpRight, label: 'Escalate', run: () => setAction('escalate') },
    { icon: MessageCircle, label: 'Send WhatsApp', run: () => setAction('whatsapp') },
    { icon: Phone, label: 'Call customer', run: () => setAction('call') },
    { icon: StickyNote, label: 'Add internal note', run: () => setAction('note') },
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
        <button className="btn-line" onClick={exportTickets}>
          <Download size={16} /> Export
        </button>
        <button className="btn-action" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Create ticket
        </button>
      </PageHeader>

      {/* Pick a stage, or start something */}
      <section className="card flex flex-wrap items-center gap-3 px-5 py-3.5">
        <h2 className="font-display text-base font-extrabold text-ink-900">Complaints</h2>

        <MenuButton
          label={stage === 'All' ? `All stages · ${tickets.length}` : `${stage} · ${at(stage)}`}
          icon={Filter}
          value={stage}
          width="w-[260px]"
          items={[
            { key: 'All', label: 'All stages', count: tickets.length },
            ...ticketStages.map((st) => ({ key: st, label: st, count: at(st) })),
          ]}
          onSelect={(key) => { setStage(key); setSection('Tickets'); }}
        />

        <MenuButton
          label="Quick actions"
          icon={Zap}
          variant="action"
          width="w-[250px]"
          items={quick.map((q) => ({ key: q.label, label: q.label, icon: q.icon }))}
          onSelect={(key) => quick.find((q) => q.label === key)?.run()}
        />

        <p className="num ml-auto text-sm text-ink-500">
          {open.length} open · {breached.length} past SLA · {escalated.length} escalated
        </p>
      </section>

      <div className="mt-4">
        <KpiRow items={kpis} cols={8} />
      </div>

      <SectionTabs
        className="mt-6"
        items={[
          { key: 'Tickets', label: 'Tickets', count: rows.length },
          { key: 'Funnel & team', label: 'Funnel & team' },
          { key: 'SLA & escalation', label: 'SLA & escalation' },
          { key: 'Categories', label: 'Categories' },
          { key: 'Satisfaction', label: 'Satisfaction' },
        ]}
        value={section}
        onChange={setSection}
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {section === 'Tickets' && (
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
        )}

        {section === 'Funnel & team' && (
          <>
            <Block title="Complaint funnel" note="Click a stage to see those tickets">
              <ol className="grid gap-x-6 sm:grid-cols-2">
                {ticketStages.map((st, i) => {
                  const n = at(st);
                  const on = stage === st;
                  return (
                    <li key={st}>
                      <button
                        onClick={() => { setStage(on ? 'All' : st); setSection('Tickets'); }}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition ${
                          on ? 'bg-brand-50' : 'hover:bg-surface-soft'
                        }`}
                      >
                        <span
                          className={`num grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold ${
                            n ? 'bg-brand-600 text-white' : 'bg-surface-soft text-ink-400'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className={`min-w-0 flex-1 truncate text-[13px] ${n ? 'font-bold text-ink-900' : 'text-ink-500'}`}>
                          {st}
                        </span>
                        <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-surface-soft">
                          <span
                            className={`block h-full rounded-full ${st === 'Escalated' ? 'bg-rose-400' : 'bg-brand-500'}`}
                            style={{ width: `${tickets.length ? Math.round((n / tickets.length) * 100) : 0}%` }}
                          />
                        </span>
                        <span className={`num w-5 shrink-0 text-right text-[13px] font-bold ${n ? 'text-ink-900' : 'text-ink-300'}`}>
                          {n}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-sm text-ink-600">
                {tickets.length} tickets · {Math.round(((at('Closed') + at('Customer confirmed')) / (tickets.length || 1)) * 100)}%
                resolved and confirmed
              </p>
            </Block>
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
          </>
        )}

        {section === 'SLA & escalation' && (
          <>
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
          </>
        )}

        {section === 'Categories' && (
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
        )}

        {section === 'Satisfaction' && (
          <>
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
            <Block title="What the panel does on its own" note="From the complaint landing to the rating coming back">
              <div className="flex flex-wrap gap-2">
                {supportAutomation.map((a) => (
                  <span key={a} className="chip text-ink-600">
                    {a}
                  </span>
                ))}
              </div>
            </Block>
          </>
        )}
      </div>

      {action && (
        <SupportActions
          action={action}
          tickets={tickets}
          team={team}
          store={store}
          onOpen={(t) => setViewing(t)}
          onClose={() => setAction(null)}
        />
      )}

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
