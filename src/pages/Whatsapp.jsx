import { useState } from 'react';
import {
  MessageCircle,
  Send,
  Bot,
  Search,
  X,
  Phone,
  FileText,
  Tag,
  UserCheck,
  Sparkles,
  Zap,
  Megaphone,
  Plus,
  Pencil,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr } from '../data/mockData.js';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import {
  conversationCategories,
  categoryTone,
  leadScoring,
  botJourneys,
  welcomeFlow,
  leadAutomationFlow,
  automationRules,
  segments,
  campaigns,
  templates,
  templateSupports,
  templateExample,
  botSessions,
  websiteFlow,
  enquiryFlow,
  crmTimeline,
  architecture,
  controlCentre,
  staffPerformance,
  inboxStats,
  campaigns as seedCampaigns,
  automationRules as seedRules,
  stepKinds,
} from '../data/whatsappData.js';
import FlowBuilder from '../components/whatsapp/FlowBuilder.jsx';
import FormModal from '../components/ui/FormModal.jsx';

const SECTIONS = [
  'Dashboard',
  'Inbox',
  'Chatbot',
  'Lead automation',
  'Automation rules',
  'Campaigns',
  'Templates',
  'Staff',
  'Integration',
  'Control centre',
];

const scoreTone = { Hot: 'rose', Warm: 'amber', Cold: 'slate' };

function Table({ head, rows, empty = 'Nothing here yet.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ink-900/[0.07] text-left">
            {head.map((h) => (
              <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/[0.07]">
          {rows.map((r) => (
            <tr key={r.key} className="hover:bg-surface-soft">
              {r.cells.map((c, i) => (
                <td key={i} className={`py-2.5 ${i === 0 ? 'font-bold text-ink-900' : 'text-ink-700'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-6 text-center text-ink-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** A chain of steps, the shape this page uses for every flow. */
function Flow({ steps, tone = 'bg-surface-soft text-ink-700' }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-300">→</span>}
          <span className={`rounded-lg px-2.5 py-1.5 font-semibold ${tone}`}>{s}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * WhatsApp as the client's sheet describes it: the numbers management wants,
 * the inbox the desk lives in, the bot that answers first, the rules that
 * fire on their own, and where all of it lands in the CRM.
 */
export default function Whatsapp() {
  const {
    conversations, botFlows, bookings, invoices, customers, team,
    create, update, remove, toast,
  } = useApp();
  const [section, setSection] = useState('Dashboard');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState('');
  const [rules, setRules] = useState(seedRules);
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [building, setBuilding] = useState(null);
  const [composing, setComposing] = useState(false);

  const open = conversations.find((c) => c.id === openId) || null;

  const rows = conversations.filter((c) => {
    if (category !== 'All' && c.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [c.name, c.phone, c.category, c.owner, ...(c.tags || [])].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  });

  const conversionRate = inboxStats.leads
    ? Math.round((inboxStats.membershipSales / inboxStats.leads) * 100)
    : 0;
  const botRate = botSessions.total ? Math.round((botSessions.completed / botSessions.total) * 100) : 0;
  const handoverRate = botSessions.total ? Math.round((botSessions.transferred / botSessions.total) * 100) : 0;
  const botConversion = botSessions.total ? Math.round((botSessions.leadsCreated / botSessions.total) * 100) : 0;

  /** What the sheet says every conversation should carry beside the chat. */
  const contextOf = (c) => {
    if (!c) return {};
    const member = customers.find((x) => x.name === c.name);
    const theirBookings = bookings.filter((b) => b.customer === c.name);
    const theirInvoices = invoices.filter((i) => i.customer === c.name);
    const billed = theirInvoices.reduce((s2, i) => s2 + Number(i.amount || 0), 0);
    const paid = theirInvoices.reduce((s2, i) => s2 + Number(i.paid || 0), 0);
    return {
      member,
      bookings: theirBookings,
      payment: !theirInvoices.length
        ? 'Nothing billed'
        : paid >= billed ? 'Paid in full'
          : paid ? `${inr(billed - paid)} still owing`
            : `${inr(billed)} unpaid`,
      travel: theirBookings.length
        ? theirBookings.map((b) => `${b.destination || b.hotel} · ${b.checkIn}`).join(' · ')
        : member?.lastBooking
          ? `Last travelled ${member.lastBooking}`
          : 'No trips yet',
    };
  };

  const logMessage = (c, entry) =>
    update('conversations', c.id, { messages: [...(c.messages || []), entry], lastAt: 'just now' }, { silent: true });

  const send = () => {
    if (!draft.trim() || !open) return;
    logMessage(open, { from: 'me', text: draft.trim(), at: 'just now' });
    toast(`Sent to ${open.name}`);
    setDraft('');
  };

  /** What the six chat actions actually do. */
  const chatAction = (label) => {
    if (!open) return;
    if (label === 'Create lead') {
      const id = create('enquiries', {
        name: open.name,
        phone: open.phone,
        email: '—',
        destination: 'From WhatsApp',
        pax: 2,
        travelDate: '—',
        budget: 0,
        status: 'New',
        source: 'WhatsApp',
        owner: open.owner,
        label: open.score,
        created: 'just now',
        lastContact: 'just now',
        nextFollowUp: open.followUp || 'today',
        priority: open.score === 'Hot' ? 'High' : 'Medium',
      });
      logMessage(open, { from: 'me', text: `Lead ${id} created from this chat`, at: 'just now' });
      return;
    }
    if (label === 'Assign') {
      const next = team[(team.findIndex((m) => m.name.split(' ')[0] === open.owner) + 1) % team.length];
      const to = next.name.split(' ')[0];
      update('conversations', open.id, { owner: to }, { message: `${open.name} moved to ${to}` });
      return;
    }
    if (label === 'Create task') {
      create('tasks', {
        title: `Follow up with ${open.name} on WhatsApp`,
        customer: open.name,
        type: 'WhatsApp',
        due: open.followUp || 'today',
        created: 'just now',
        owner: open.owner,
        createdBy: 'WhatsApp',
        bucket: 'today',
        priority: open.score === 'Hot' ? 'High' : 'Medium',
        status: 'Pending',
        lastAction: 'Chat open on WhatsApp',
        nextAction: 'Reply and book the presentation',
        note: open.note || '',
      });
      return;
    }
    logMessage(open, { from: 'me', text: `${label} sent`, at: 'just now' });
    toast(`${label} — ${open.name}`);
  };

  const toggleRule = (r) => {
    setRules((list) => list.map((x) => (x.id === r.id ? { ...x, status: x.status === 'On' ? 'Off' : 'On' } : x)));
    toast(`${r.name} ${r.status === 'On' ? 'switched off' : 'switched on'}`);
  };

  const saveFlow = (flow) => {
    if (flow.id) update('botFlows', flow.id, flow, { message: `${flow.name} saved` });
    else create('botFlows', flow);
    setBuilding(null);
  };

  const body = {
    Dashboard: (
      <>
        <div className="grid gap-4 xl:col-span-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section className="card relative overflow-hidden p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Conversations today</p>
              <p className="num mt-2 font-display text-4xl font-extrabold leading-none text-ink-900">{inboxStats.conversationsToday}</p>
              <p className="mt-1.5 text-sm text-ink-500">
                {inboxStats.conversationsMonth} this month · {inboxStats.newToday} new customers
              </p>
              <div className="mt-5">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  <span>Answered by the bot</span>
                  <span className="num">{botRate}%</span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${botRate}%` }} />
                </div>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-sm">
                <MessageCircle size={14} className="text-ink-400" />
                {inboxStats.humanHandled} passed to the desk
              </p>
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">What WhatsApp brought in</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Leads generated', value: inboxStats.leads, tone: 'bg-brand-500' },
                { label: 'Sales-ready leads', value: inboxStats.qualified, tone: 'bg-emerald-500' },
                { label: 'Membership sales', value: inboxStats.membershipSales, tone: 'bg-amber-500' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-2xl font-extrabold text-ink-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Needs a person now</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Unanswered chats', value: inboxStats.unanswered, tone: 'bg-rose-500' },
                { label: 'Failed messages', value: inboxStats.failed, tone: 'bg-amber-500' },
                { label: 'Booking requests', value: inboxStats.bookingRequests, tone: 'bg-sky-500' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-2xl font-extrabold text-ink-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="card grid divide-y divide-ink-900/[0.07] sm:grid-cols-2 sm:divide-y-0 xl:col-span-2 xl:grid-cols-3 2xl:grid-cols-6 sm:[&>*:not(:first-child)]:border-l sm:[&>*]:border-ink-900/[0.07]">
          {[
            { label: 'Active chats', value: rows.length, hint: 'open right now' },
            { label: 'Presentations booked', value: inboxStats.presentations },
            { label: 'Conversion', value: `${conversionRate}%`, hint: 'chat to sale' },
            { label: 'Response time', value: staffPerformance[0].avgResponse, hint: 'average on the desk' },
            { label: 'Bot handover', value: `${handoverRate}%`, hint: 'passed to staff' },
            { label: 'Satisfaction', value: `${inboxStats.satisfaction}/5`, hint: 'customer rating' },
          ].map((g) => (
            <div key={g.label} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{g.label}</p>
              <p className="num mt-1.5 font-display text-2xl font-extrabold text-ink-900">{g.value}</p>
              {g.hint && <p className="mt-0.5 text-xs text-ink-400">{g.hint}</p>}
            </div>
          ))}
        </div>

        <Block title="How the bot did" note="Every session, and where it ended" wide>
          <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-8">
            <Stat label="Sessions" value={botSessions.total} />
            <Stat label="Finished by the bot" value={botSessions.completed} tone="text-emerald-600" />
            <Stat label="Passed to staff" value={botSessions.transferred} />
            <Stat label="Abandoned" value={botSessions.abandoned} tone="text-rose-600" />
            <Stat label="Leads created" value={botSessions.leadsCreated} />
            <Stat label="Bookings" value={botSessions.bookingsCreated} />
            <Stat label="Tickets" value={botSessions.ticketsCreated} />
            <Stat label="Sales" value={botSessions.salesGenerated} tone="text-brand-700" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Bot resolution rate" value={`${botRate}%`} hint="solved without a person" />
            <Stat label="Human handover rate" value={`${handoverRate}%`} hint="needed a person" />
            <Stat label="Bot conversion rate" value={`${botConversion}%`} hint="became leads" />
          </div>
        </Block>

        <Block title="The whole thing, top to bottom" note="Website through to customer service" wide>
          <Flow steps={architecture} />
          <p className="mt-3 text-xs text-ink-400">
            And underneath all of it: the automation engine, analytics, reporting and admin controls.
          </p>
        </Block>
      </>
    ),

    Inbox: (
      <Block
        title="WhatsApp inbox"
        note="Every conversation, with who the customer is beside it"
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input h-9 w-44 py-0 pl-9 text-sm"
                placeholder="Search chats…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="input h-9 w-auto py-0 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All categories</option>
              {conversationCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      >
        <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
          {rows.map((c) => (
            <li key={c.id}>
              <button onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-soft">
                <Avatar name={c.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-bold text-ink-900">{c.name}</span>
                    <Badge tone={categoryTone[c.category] || 'slate'}>{c.category}</Badge>
                    <Badge tone={scoreTone[c.score]}>{c.score}</Badge>
                    {c.membership && <Badge tone="teal">{c.membership}</Badge>}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-500">
                    {c.messages[c.messages.length - 1]?.text}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="num block text-xs text-ink-400">{c.lastAt}</span>
                  <span className="mt-1 block text-xs text-ink-500">{c.owner}</span>
                </span>
                {c.unread > 0 && (
                  <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    {c.unread}
                  </span>
                )}
              </button>
            </li>
          ))}
          {rows.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-500">No chats match this view.</li>}
        </ul>
        <p className="eyebrow mt-5">Categories</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {conversationCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`chip ${category === c ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600'}`}
            >
              {c}
              <span className="num ml-1.5 text-ink-400">{conversations.filter((x) => x.category === c).length}</span>
            </button>
          ))}
        </div>
      </Block>
    ),

    Chatbot: (
      <>
        <Block title="What the bot says first" note="The welcome journey, exactly as the client wrote it" wide>
          <div className="rounded-xl bg-surface-soft p-4">
            <p className="text-sm text-ink-500">Customer</p>
            <p className="mt-1 inline-block rounded-2xl rounded-tl-sm bg-white px-3.5 py-2 text-sm text-ink-800 shadow-sm">
              {welcomeFlow.incoming}
            </p>
            <p className="mt-4 text-sm text-ink-500">Bot</p>
            <p className="mt-1 inline-block rounded-2xl rounded-tl-sm bg-emerald-500 px-3.5 py-2 text-sm text-white">
              {welcomeFlow.reply}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {welcomeFlow.buttons.map((b) => (
                <span key={b} className="rounded-lg border border-ink-900/[0.12] bg-white px-3 py-1.5 text-sm font-semibold text-brand-700">
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-ink-700">If they tap “Explore membership”</p>
            <div className="mt-2">
              <Flow steps={welcomeFlow.membershipBranch} tone="bg-white text-ink-700" />
            </div>
          </div>
        </Block>

        <Block
          title="Flow builder"
          note="Every journey the bot can run, and what it says at each step"
          wide
          action={
            <button className="btn-action btn-sm" onClick={() => setBuilding({})}>
              <Plus size={14} /> Build a journey
            </button>
          }
        >
          <ul className="space-y-3">
            {(botFlows || []).map((f) => (
              <li key={f.id} className="rounded-xl border border-ink-900/[0.07] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Bot size={15} className="text-emerald-600" />
                  <p className="font-bold text-ink-900">{f.name}</p>
                  <Badge tone={f.status === 'Live' ? 'green' : f.status === 'Paused' ? 'amber' : 'slate'} dot>
                    {f.status}
                  </Badge>
                  <span className="text-xs text-ink-500">{f.trigger}</span>
                  <span className="num ml-auto text-xs text-ink-400">{f.sessions} sessions</span>
                  <button className="btn-line btn-sm" onClick={() => setBuilding(f)}>
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
                  {(f.steps || []).map((step, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="text-ink-300">→</span>}
                      <span className="rounded-lg bg-surface-soft px-2.5 py-1.5 text-[13px] text-ink-700">
                        <span className="mr-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400">
                          {stepKinds.find((k) => k.key === step.kind)?.label || step.kind}
                        </span>
                        {step.text}
                        {step.buttons?.length ? ` · ${step.buttons.join(', ')}` : ''}
                      </span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
            {(botFlows || []).length === 0 && (
              <li className="py-6 text-center text-sm text-ink-500">No journey has been built yet.</li>
            )}
          </ul>
          <p className="eyebrow mt-5">Journeys the sheet asks for</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {botJourneys.map((j) => {
              const built = (botFlows || []).some((f) => f.name.toLowerCase() === j.toLowerCase());
              return (
                <span key={j} className={`chip ${built ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'text-ink-400'}`}>
                  {j}
                </span>
              );
            })}
          </div>
        </Block>

        <Block title="How it performed" note="Where each session ended">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Bot resolution rate" value={`${botRate}%`} tone="text-emerald-600" />
            <Stat label="Human handover rate" value={`${handoverRate}%`} />
            <Stat label="Bot conversion rate" value={`${botConversion}%`} />
            <Stat label="Abandoned" value={botSessions.abandoned} tone="text-rose-600" />
          </div>
        </Block>
      </>
    ),

    'Lead automation': (
      <>
        <Block title="From website form to member" note="Nobody touches this until the call" wide>
          <Flow steps={leadAutomationFlow} />
        </Block>

        <Block title="How the bot scores them" note="What somebody asks decides how hot they are" wide>
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(leadScoring).map(([level, signals]) => (
              <div key={level} className="rounded-xl border border-ink-900/[0.07] p-4">
                <Badge tone={scoreTone[level]}>{level}</Badge>
                <ul className="mt-2.5 space-y-1.5">
                  {signals.map((s) => (
                    <li key={s} className="text-sm text-ink-700">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Block>
      </>
    ),

    'Automation rules': (
      <Block title="Rules that run on their own" note="When this happens, send that" wide>
        <Table
          head={['Rule', 'When', 'Then', 'Times run', 'Status', '']}
          rows={rules.map((r) => ({
            key: r.id,
            cells: [
              r.name,
              r.when,
              r.then,
              <span className="num">{r.runs}</span>,
              <Badge tone={r.status === 'On' ? 'green' : 'slate'} dot>
                {r.status}
              </Badge>,
              <button className="btn-line btn-sm" onClick={() => toggleRule(r)}>
                {r.status === 'On' ? 'Turn off' : 'Turn on'}
              </button>,
            ],
          }))}
        />
      </Block>
    ),

    Campaigns: (
      <>
        <Block
          title="Campaigns"
          note="Sent → delivered → read → replied → leads → sales"
          wide
          action={
            <button className="btn-action btn-sm" onClick={() => setComposing(true)}>
              <Megaphone size={14} /> New campaign
            </button>
          }
        >
          <Table
            head={['Campaign', 'Segment', 'Sent', 'Delivered', 'Read', 'Replied', 'Leads', 'Sales', 'Revenue', 'Spend', 'ROI', 'Sent on']}
            rows={campaigns.map((c) => ({
              key: c.id,
              cells: [
                c.name,
                <Badge tone="teal">{c.segment}</Badge>,
                <span className="num">{c.sent}</span>,
                <span className="num">{c.delivered}</span>,
                <span className="num">{c.read}</span>,
                <span className="num">{c.replied}</span>,
                <span className="num font-bold text-brand-700">{c.leads}</span>,
                <span className="num font-bold text-emerald-600">{c.sales}</span>,
                <span className="num font-bold text-brand-700">{c.revenue ? inr(c.revenue) : '—'}</span>,
                <span className="num text-rose-600">{c.cost ? inr(c.cost) : '—'}</span>,
                <span className={`num font-bold ${(c.revenue || 0) >= (c.cost || 0) ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {c.cost ? `${Math.round(((Number(c.revenue || 0) - c.cost) / c.cost) * 100)}%` : '—'}
                </span>,
                <span className="num">{c.on}</span>,
              ],
            }))}
          />
        </Block>

        <Block title="Who a campaign can go to" note="Every segment the panel can build" wide>
          <div className="flex flex-wrap gap-2">
            {segments.map((s) => (
              <span key={s} className="chip text-ink-600">
                {s}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    Templates: (
      <>
        <Block title="Approved templates" note="Grouped the way the desk uses them" wide>
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(templates).map(([group, list]) => (
              <div key={group} className="rounded-xl border border-ink-900/[0.07] p-4">
                <p className="eyebrow">{group}</p>
                <ul className="mt-2 space-y-1.5">
                  {list.map((t) => (
                    <li key={t}>
                      <button
                        onClick={() => toast(`${t} template opened`)}
                        className="text-left text-sm text-ink-700 hover:text-brand-700"
                      >
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Block>

        <Block title="What a template can carry" note="And how a customer's own details slot in" wide>
          <div className="flex flex-wrap gap-2">
            {templateSupports.map((t) => (
              <span key={t} className="chip text-ink-600">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">{templateExample}</p>
        </Block>
      </>
    ),

    Staff: (
      <Block title="How the desk is doing on WhatsApp" note="Chats, speed and what came of them" wide>
        <Table
          head={['Employee', 'Chats', 'Leads', 'Follow-ups', 'First response', 'Average response', 'Missed', 'Presentations', 'Conversions', 'Sales', 'Revenue', 'Rating']}
          rows={staffPerformance.map((s) => ({
            key: s.name,
            cells: [
              <span className="flex items-center gap-2.5">
                <Avatar name={s.name} size="sm" /> {s.name}
              </span>,
              <span className="num">{s.chats}</span>,
              <span className="num">{s.leads}</span>,
              <span className="num">{s.followUps}</span>,
              <span className="num">{s.firstResponse}</span>,
              <span className="num">{s.avgResponse}</span>,
              <span className={`num ${s.missed ? 'font-bold text-amber-600' : ''}`}>{s.missed}</span>,
              <span className="num">{s.presentations}</span>,
              <span className="num">{s.conversions}</span>,
              <span className="num font-bold text-emerald-600">{s.sales}</span>,
              <span className="num font-bold text-brand-700">{inr(s.revenue)}</span>,
              <span className="num text-amber-600">{s.rating}★</span>,
            ],
          }))}
        />
      </Block>
    ),

    Integration: (
      <>
        <Block title="Website into WhatsApp" note="Chat on WhatsApp, and the CRM already knows who it is" wide>
          <Flow steps={websiteFlow} />
          <p className="eyebrow mt-5">A website enquiry</p>
          <div className="mt-2">
            <Flow steps={enquiryFlow} />
          </div>
          <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
            From the booking page, what they were looking at is passed into the chat, so nobody has to ask again.
          </p>
        </Block>

        <Block title="It all lands in the customer's history" note="One timeline, whatever channel it came through" wide>
          <ol className="space-y-3 border-l border-ink-900/[0.07] pl-4">
            {crmTimeline.map((t) => (
              <li key={t} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                <p className="text-sm font-semibold text-ink-800">{t}</p>
              </li>
            ))}
          </ol>
        </Block>
      </>
    ),

    'Control centre': (
      <Block title="Admin control centre" note="Everything the admin can reach from here" wide>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(controlCentre).map(([group, list]) => (
            <div key={group} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">{group}</p>
              <ul className="mt-2 space-y-1.5">
                {list.map((x) => (
                  <li key={x} className="text-sm text-ink-700">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="WhatsApp" subtitle="The inbox, the bot behind it, and everything it feeds into the CRM">
        <button className="btn-line" onClick={() => setSection('Templates')}>
          <FileText size={16} /> Templates
        </button>
        <button className="btn-action" onClick={() => setSection('Campaigns')}>
          <Megaphone size={16} /> New campaign
        </button>
      </PageHeader>

      <SectionTabs
        className="mb-5"
        items={SECTIONS}
        value={section}
        onChange={setSection}
      />

      <div className="grid gap-5 xl:grid-cols-2">{body[section]}</div>

      {building && (
        <FlowBuilder
          flow={building.id ? building : null}
          onClose={() => setBuilding(null)}
          onSave={saveFlow}
        />
      )}

      <FormModal
        open={composing}
        onClose={() => setComposing(false)}
        onSubmit={(values) => {
          const sent = Number(values.audience) || 0;
          setCampaigns((list) => [
            {
              id: `CMP-0${list.length + 1}`,
              name: values.name,
              segment: values.segment,
              sent,
              delivered: Math.round(sent * 0.97),
              read: Math.round(sent * 0.78),
              replied: Math.round(sent * 0.24),
              leads: Math.round(sent * 0.09),
              sales: 0,
              revenue: 0,
              cost: Math.round(sent * 35),
              on: 'just now',
            },
            ...list,
          ]);
          setComposing(false);
          toast(`${values.name} sent to ${sent} people`);
        }}
        title="New campaign"
        subtitle="Pick who it goes to, and what they get"
        fields={[
          { name: 'name', label: 'Campaign name', type: 'text', required: true },
          { name: 'segment', label: 'Segment', type: 'select', options: segments },
          { name: 'audience', label: 'How many it goes to', type: 'number', required: true },
          {
            name: 'template',
            label: 'Template',
            type: 'select',
            options: Object.values(templates).flat(),
          },
          { name: 'message', label: 'Message', type: 'textarea', full: true },
        ]}
        initial={{ segment: segments[0], audience: 120, template: Object.values(templates).flat()[0] }}
        submitLabel="Send campaign"
      />

      {/* One conversation, with who they are beside it */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={() => setOpenId(null)} />
          <aside className="flex h-full w-full max-w-[960px] flex-col bg-surface-base shadow-lift">
            <header className="flex flex-wrap items-center gap-2.5 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
              <Avatar name={open.name} size="sm" />
              <h2 className="font-display text-lg font-extrabold text-ink-900">{open.name}</h2>
              <Badge tone={categoryTone[open.category] || 'slate'}>{open.category}</Badge>
              <Badge tone={scoreTone[open.score]}>{open.score}</Badge>
              <button onClick={() => setOpenId(null)} className="icon-btn ml-auto h-8 w-8">
                <X size={15} />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 gap-5 overflow-hidden p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* The chat */}
              <section className="card flex min-h-0 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                  {open.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === 'them' ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                          m.from === 'them'
                            ? 'rounded-tl-sm bg-surface-soft text-ink-800'
                            : m.from === 'bot'
                              ? 'rounded-tr-sm bg-emerald-500 text-white'
                              : 'rounded-tr-sm bg-brand-600 text-white'
                        }`}
                      >
                        {m.from === 'bot' && (
                          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-white/70">
                            <Bot size={11} /> Bot
                          </span>
                        )}
                        {m.text}
                        <span className={`num mt-1 block text-[11px] ${m.from === 'them' ? 'text-ink-400' : 'text-white/60'}`}>
                          {m.at}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-ink-900/[0.07] p-3.5">
                  <div className="flex gap-2">
                    <input
                      className="input"
                      placeholder="Write a reply…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                    <button className="btn-action shrink-0" onClick={send}>
                      <Send size={15} /> Send
                    </button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {['Send template', 'Send brochure', 'Share offer', 'Create lead', 'Assign', 'Create task'].map((a) => (
                      <button key={a} className="chip text-ink-600 hover:text-ink-900" onClick={() => chatAction(a)}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Who they are */}
              <section className="card h-fit overflow-hidden">
                <div className="px-4 pb-4 pt-5 text-center">
                  <Avatar name={open.name} size="lg" className="mx-auto" />
                  <p className="mt-3 font-display text-base font-extrabold text-ink-900">{open.name}</p>
                  <p className="num text-sm text-ink-500">{open.phone}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <a href={`tel:${open.phone.replace(/[^\d]/g, '')}`} className="icon-btn h-9 w-9 disabled:opacity-40">
                      <Phone size={15} />
                    </a>
                    <a
                      href={`https://wa.me/${open.phone.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="icon-btn h-9 w-9 hover:border-emerald-400 hover:text-emerald-600"
                    >
                      <MessageCircle size={15} />
                    </a>
                    <button onClick={() => toast(`${open.name} assigned`)} className="icon-btn h-9 w-9 disabled:opacity-40">
                      <UserCheck size={15} />
                    </button>
                  </div>
                </div>

                {[
                  ['Lead source', open.source],
                  ['Membership status', open.membership || 'Not a member'],
                  ['Membership plan', open.plan || '—'],
                  ['Assigned to', open.owner],
                  ['Handled by', open.handledBy],
                  ['Previous bookings', `${contextOf(open).bookings.length} booking(s)`],
                  ['Payment status', contextOf(open).payment],
                  ['Travel history', contextOf(open).travel],
                  ['Last interaction', open.lastAt],
                  ['Follow-up', open.followUp],
                  ['Notes', open.note],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-ink-900/[0.07] px-4 py-2.5">
                    <p className="eyebrow">{label}</p>
                    <p className="mt-1 text-sm text-ink-800">{value}</p>
                  </div>
                ))}

                <div className="px-4 py-3">
                  <p className="eyebrow">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(open.tags || []).map((t) => (
                      <span key={t} className="chip text-ink-600">
                        <Tag size={12} /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
