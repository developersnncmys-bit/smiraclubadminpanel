import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Phone, Mail, MessageCircle, FileText, Plus, Upload, Pencil, Trash2, UserCheck, Tag,
  Crown, LayoutGrid, Rows3, Search, Download, UserPlus, ArrowRightLeft, CalendarClock,
  Presentation, Route, ClipboardPlus, Flag, Wallet, Clock, SlidersHorizontal, X, Filter, Zap,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import MenuButton from '../components/ui/MenuButton.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import LeadDetails from '../components/sales/LeadDetails.jsx';
import SalesOverview from '../components/sales/SalesOverview.jsx';
import TeamActions from '../components/team/TeamActions.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { statusTone, enquiryStatuses, inr, shortInr } from '../data/mockData.js';
import { downloadCsv } from '../lib/csv.js';
import { findMembership, membershipStanding } from '../lib/membership.js';

const SOURCES = ['Instagram', 'Website', 'Google Ads', 'Referral', 'Walk-in', 'WhatsApp'];
const LABELS = ['Honeymoon', 'Family', 'Luxury', 'Group', 'Adventure', 'Beach', 'Couple', 'Shopping'];
const SECTIONS = ['Leads', 'Pipeline', 'Performance', 'Team & sources', 'Today'];
const PERIODS = ['All', 'Today', 'Yesterday', 'This week', 'This month'];

/** Does this lead's created date fall inside the chosen span? */
function inPeriod(created, period) {
  if (period === 'All') return true;
  const d = new Date(created);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  if (period === 'Today') return day(d) === day(now);
  if (period === 'Yesterday') {
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    return day(d) === day(y);
  }
  if (period === 'This week') {
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return day(d) >= day(start);
  }
  if (period === 'This month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  return true;
}

/** The colour every stage reads by — the board, the rails and the badges agree. */
const STAGE = {
  New: { dot: 'bg-sky-500', rail: 'before:bg-sky-500' },
  Contacted: { dot: 'bg-violet-500', rail: 'before:bg-violet-500' },
  Interested: { dot: 'bg-brand-500', rail: 'before:bg-brand-500' },
  'Details sent': { dot: 'bg-amber-400', rail: 'before:bg-amber-400' },
  Presentation: { dot: 'bg-orange-400', rail: 'before:bg-orange-400' },
  'Visit scheduled': { dot: 'bg-indigo-500', rail: 'before:bg-indigo-500' },
  Closing: { dot: 'bg-emerald-500', rail: 'before:bg-emerald-500' },
  Won: { dot: 'bg-emerald-600', rail: 'before:bg-emerald-600' },
  Lost: { dot: 'bg-rose-400', rail: 'before:bg-rose-400' },
};
const priorityTone = { High: 'rose', Medium: 'amber', Low: 'slate' };
const digits = (phone) => String(phone).replace(/[^\d]/g, '');

/**
 * Sales & Leads, laid out the way Team Status is: the stage board and the
 * actions stay on screen, the leads read as cards with a colour rail, and the
 * heavier analysis sits behind its own sections.
 */
export default function Enquiries() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const store = useApp();
  const {
    enquiries, bookings, invoices, team, memberSignups, memberships,
    owner, create, update, updateMany, remove, toast,
  } = store;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [assignFor, setAssignFor] = useState(null);
  const [statusFor, setStatusFor] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [section, setSection] = useState('Leads');
  const [stage, setStage] = useState(null);
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState('cards');
  const [period, setPeriod] = useState('All');
  const [who, setWho] = useState('All');
  const [source, setSource] = useState('All');
  const [priority, setPriority] = useState('All');
  const [action, setAction] = useState(null);
  const act = (kind, context = {}) => setAction({ kind, context });

  // A ?new=1 deep link opens the create form straight away.
  useEffect(() => {
    if (params.get('new')) {
      setEditing(null);
      setFormOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const all = byOwner(enquiries, owner);
  const rows = all.filter(
    (e) =>
      inPeriod(e.created, period) &&
      (who === 'All' || e.owner === who) &&
      (source === 'All' || e.source === source) &&
      (priority === 'All' || e.priority === priority)
  );
  const activeFilters = [
    period !== 'All' && { label: period, clear: () => setPeriod('All') },
    who !== 'All' && { label: who, clear: () => setWho('All') },
    source !== 'All' && { label: source, clear: () => setSource('All') },
    priority !== 'All' && { label: `${priority} priority`, clear: () => setPriority('All') },
    stage && { label: stage, clear: () => setStage(null) },
    query.trim() && { label: `"${query.trim()}"`, clear: () => setQuery('') },
  ].filter(Boolean);
  const clearAll = () => {
    setPeriod('All');
    setWho('All');
    setSource('All');
    setPriority('All');
    setStage(null);
    setQuery('');
  };

  /** The plan this lead already holds, if any, and how long it has left. */
  const planOf = (lead) => {
    const found = findMembership(lead, memberSignups, memberships);
    return found ? { ...found, standing: membershipStanding(found.signup) } : null;
  };

  const matches = (e) => {
    if (stage && e.status !== stage) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [e.name, e.phone, e.email, e.destination, e.id, e.owner, e.label].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  };
  const listRows = rows.filter(matches);

  // The funnel hands the list a stage; the list says so and can drop it.
  const openStage = (status) => {
    setStage(status);
    setSection('Leads');
  };

  // -- The numbers at the top -----------------------------------------------
  const value = (list) => list.reduce((s, e) => s + Number(e.budget || 0), 0);
  const open = rows.filter((e) => !['Won', 'Lost'].includes(e.status));
  const won = rows.filter((e) => e.status === 'Won');
  const presented = rows.filter((e) => ['Presentation', 'Visit scheduled', 'Closing'].includes(e.status));
  const unassigned = rows.filter((e) => !e.owner || e.owner === 'Unassigned');
  const pending = invoices.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paid || 0)), 0);

  const exportLeads = () =>
    downloadCsv('smira-club-enquiries', rows, [
      { key: 'id', header: 'Enquiry' }, { key: 'name', header: 'Client' },
      { key: 'phone', header: 'Phone' }, { key: 'email', header: 'Email' },
      { key: 'destination', header: 'Destination' }, { key: 'pax', header: 'Travellers' },
      { key: 'travelDate', header: 'Travel date' }, { key: 'budget', header: 'Budget' },
      { key: 'status', header: 'Status' }, { key: 'source', header: 'Source' },
      { key: 'label', header: 'Label' }, { key: 'owner', header: 'Owner' },
      { key: 'priority', header: 'Priority' }, { key: 'lastContact', header: 'Last contact' },
      { key: 'nextFollowUp', header: 'Next follow-up' },
    ]);

  const quickActions = {
    add: () => { setEditing(null); setFormOpen(true); },
    importLeads: () => setImportOpen(true),
    assign: () => {
      const ids = rows.filter((e) => e.owner === 'Unassigned').map((e) => e.id);
      if (!ids.length) return toast('Every lead already has an owner', 'info');
      setAssignFor(ids);
    },
    broadcast: () => toast('WhatsApp blast goes out with the messaging work', 'info'),
    note: (message) => toast(message),
    addCustomer: () => navigate('/customers'),
    recordPayment: () => navigate('/payment'),
    openTeam: () => navigate('/team'),
    showList: () => { setStage(null); setSection('Leads'); },
    exportLeads,
  };

  /** The actions the desk starts work with — the same rail as Team Status. */
  const tiles = [
    { label: 'Add lead', icon: UserPlus, run: () => { setEditing(null); setFormOpen(true); } },
    { label: 'Import', icon: Upload, run: () => setImportOpen(true) },
    { label: 'Assign lead', icon: UserCheck, run: () => act('assign-lead') },
    { label: 'Reassign', icon: ArrowRightLeft, run: () => act('reassign') },
    { label: 'Follow-up', icon: CalendarClock, run: () => act('task', { type: 'Follow-up', title: 'Schedule a follow-up', suggest: 'Follow-up call' }) },
    { label: 'Presentation', icon: Presentation, run: () => act('task', { type: 'Presentation', title: 'Schedule a presentation', suggest: 'Membership walkthrough' }) },
    { label: 'Visit', icon: Route, run: () => act('task', { type: 'Customer Visit', title: 'Schedule a customer visit', suggest: 'Home visit' }) },
    { label: 'Create task', icon: ClipboardPlus, run: () => act('task', { type: 'Call', title: 'Create task' }) },
    { label: 'Mark priority', icon: Flag, run: () => act('priority') },
    { label: 'Add customer', icon: Plus, run: () => navigate('/customers') },
    { label: 'Payment', icon: Wallet, run: () => navigate('/payment') },
    { label: 'Export', icon: Download, run: exportLeads },
  ];

  const owners = ['Unassigned', ...team.map((t) => t.name.split(' ')[0])];

  const fields = [
    { name: 'name', label: 'Client name', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+91 ' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'pax', label: 'Travellers', type: 'number', required: true },
    { name: 'travelDate', label: 'Travel date', type: 'text', placeholder: '18 Sep 2026' },
    { name: 'budget', label: 'Budget (₹)', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: enquiryStatuses },
    { name: 'source', label: 'Source', type: 'select', options: SOURCES },
    { name: 'label', label: 'Label', type: 'select', options: LABELS },
    { name: 'owner', label: 'Assign to', type: 'select', options: owners },
  ];

  const saveEnquiry = (values) => {
    if (editing) update('enquiries', editing.id, values);
    else create('enquiries', { ...values, created: '04 Aug 2026' });
  };

  const makeQuote = (row) => {
    const id = create('quotations', {
      customer: row.name,
      pkg: `${row.destination} package`,
      pax: row.pax,
      amount: row.budget,
      validTill: '30 Sep 2026',
      status: 'Draft',
      source: 'Enquiry',
      owner: row.owner === 'Unassigned' ? 'Sneha' : row.owner,
    });
    update('enquiries', row.id, { status: 'Details sent' }, { silent: true });
    toast(`Quotation ${id} drafted for ${row.name}`);
  };

  const menuFor = (r) => [
    { label: 'Edit', icon: Pencil, onClick: () => { setEditing(r); setFormOpen(true); } },
    { label: 'Assign owner', icon: UserCheck, onClick: () => setAssignFor([r.id]) },
    { label: 'Change status', icon: Tag, onClick: () => setStatusFor([r.id]) },
    { label: 'Schedule follow-up', icon: CalendarClock, onClick: () => act('task', { type: 'Follow-up', title: `Follow up with ${r.name}`, customer: r.name, suggest: `Follow-up — ${r.destination}` }) },
    { label: 'Create quotation', icon: FileText, onClick: () => makeQuote(r) },
    { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
  ];

  const columns = [
    {
      key: 'name',
      header: 'Client',
      csv: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900">{r.name}</p>
            <p className="truncate text-xs text-ink-500">{r.phone}</p>
          </div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone[r.status]} dot>{r.status}</Badge> },
    {
      key: 'destination',
      header: 'Destination',
      render: (r) => (
        <div>
          <p className="font-semibold text-ink-800">{r.destination}</p>
          <p className="text-xs text-ink-500">{r.pax} pax · {r.travelDate}</p>
        </div>
      ),
    },
    { key: 'budget', header: 'Budget', render: (r) => <span className="font-bold text-ink-900">{inr(r.budget)}</span> },
    { key: 'source', header: 'Source', render: (r) => <span className="text-ink-600">{r.source}</span> },
    {
      key: 'owner',
      header: 'Owner',
      render: (r) =>
        r.owner === 'Unassigned' ? (
          <button onClick={() => setAssignFor([r.id])} className="text-xs font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700">
            Unassigned
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar name={r.owner} size="sm" />
            <span className="font-semibold text-ink-700">{r.owner}</span>
          </div>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <a href={`tel:${digits(r.phone)}`} title="Call" className="icon-btn hover:border-emerald-400 hover:text-emerald-600">
            <Phone size={14} />
          </a>
          <a
            href={`https://wa.me/${digits(r.phone)}?text=${encodeURIComponent(`Hi ${r.name}, thanks for your ${r.destination} enquiry with Smira Club!`)}`}
            target="_blank" rel="noreferrer" title="WhatsApp"
            className="icon-btn hover:border-emerald-400 hover:text-emerald-600"
          >
            <MessageCircle size={14} />
          </a>
          <button onClick={() => makeQuote(r)} title="Create quotation" className="icon-btn hover:border-violet-400 hover:text-violet-600">
            <FileText size={14} />
          </button>
          <RowMenu items={menuFor(r)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Sales & Leads" subtitle={`${rows.length} leads · ${open.length} open · ${unassigned.length} waiting for an owner`}>
        <button className="btn-line" onClick={exportLeads}><Download size={16} /> Export</button>
        <button className="btn-line" onClick={() => setImportOpen(true)}><Upload size={16} /> Import</button>
        <button className="btn-action" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Add lead
        </button>
      </PageHeader>

      {/* The filters every section below reads from */}
      <div className="card mb-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-700">
            <SlidersHorizontal size={15} className="text-ink-400" /> Filters
          </span>
          <select className="input h-9 w-auto py-0 text-sm" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((o) => (
              <option key={o} value={o}>{o === 'All' ? 'Any time' : o}</option>
            ))}
          </select>
          <select className="input h-9 w-auto py-0 text-sm" value={who} onChange={(e) => setWho(e.target.value)}>
            <option value="All">All consultants</option>
            {[...new Set(all.map((e) => e.owner).filter(Boolean))].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select className="input h-9 w-auto py-0 text-sm" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="All">All sources</option>
            {SOURCES.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select className="input h-9 w-auto py-0 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="All">Any priority</option>
            {['High', 'Medium', 'Low'].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <span className="num ml-auto text-sm text-ink-500">
            {rows.length} of {all.length} leads
          </span>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-ink-900/[0.07] pt-2.5">
            {activeFilters.map((f) => (
              <button
                key={f.label}
                onClick={f.clear}
                className="chip border border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400"
                title="Remove this filter"
              >
                {f.label}
                <X size={12} />
              </button>
            ))}
            <button className="btn-line btn-sm ml-1" onClick={clearAll}>Clear all</button>
          </div>
        )}
      </div>

      {/* Pick a stage, or start something */}
      <section className="card flex flex-wrap items-center gap-3 px-5 py-3.5">
        <h2 className="font-display text-base font-extrabold text-ink-900">Pipeline</h2>

        <MenuButton
          label={stage ? `${stage} · ${rows.filter((e) => e.status === stage).length}` : `All stages · ${rows.length}`}
          icon={Filter}
          value={stage || 'All'}
          width="w-[280px]"
          items={[
            { key: 'All', label: 'All stages', count: rows.length },
            ...enquiryStatuses.map((st) => {
              const list = rows.filter((e) => e.status === st);
              return {
                key: st,
                label: st,
                count: list.length,
                dot: STAGE[st]?.dot || 'bg-ink-400',
                hint: value(list) ? shortInr(value(list)) : null,
              };
            }),
          ]}
          onSelect={(key) => {
            setStage(key === 'All' ? null : key);
            setSection('Leads');
          }}
        />

        <MenuButton
          label="Quick actions"
          icon={Zap}
          variant="action"
          width="w-[250px]"
          items={tiles.map((t) => ({ key: t.label, label: t.label, icon: t.icon }))}
          onSelect={(key) => tiles.find((t) => t.label === key)?.run()}
        />

        <p className="num ml-auto text-sm text-ink-500">
          {open.length} open · {won.length} won · {inr(value(open))} in play
        </p>
      </section>

      <div className="mt-4">
        <KpiRow
          cols={6}
          items={[
            { label: 'Total leads', value: rows.length, hint: `${unassigned.length} unassigned` },
            { label: 'Open pipeline', value: open.length, hint: 'being worked on' },
            { label: 'Presentations', value: presented.length, hint: 'sent or scheduled' },
            { label: 'Won', value: won.length, hint: `${rows.length ? Math.round((won.length / rows.length) * 100) : 0}% of everything`, tone: 'text-emerald-600' },
            { label: 'Pipeline value', value: inr(value(open)), tone: 'text-brand-700', hint: 'open leads' },
            { label: 'Pending payments', value: shortInr(pending), hint: 'still to collect', tone: pending ? 'text-amber-600' : 'text-ink-900' },
          ]}
        />
      </div>

      <SectionTabs
        className="mt-6"
        items={SECTIONS.map((s) => ({ key: s, label: s, count: s === 'Leads' ? listRows.length : null }))}
        value={section}
        onChange={setSection}
      />

      {/* ==================================================================== */}
      {/* Leads                                                                */}
      {/* ==================================================================== */}
      {section === 'Leads' && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input pl-10"
                placeholder="Search name, phone, destination or ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="seg">
              <button onClick={() => setLayout('cards')} className={`seg-item ${layout === 'cards' ? 'seg-item-on' : ''}`}>
                <LayoutGrid size={13} className="mr-1 inline" /> Cards
              </button>
              <button onClick={() => setLayout('table')} className={`seg-item ${layout === 'table' ? 'seg-item-on' : ''}`}>
                <Rows3 size={13} className="mr-1 inline" /> Table
              </button>
            </div>
          </div>

          {layout === 'cards' && (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {listRows.map((r) => {
                const plan = planOf(r);
                return (
                  <article key={r.id} className={`card rail ${STAGE[r.status]?.rail || 'before:bg-ink-400'} p-5 pl-6`}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => setViewing(r)} className="shrink-0" title="Open the lead">
                        <Avatar name={r.name} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <button onClick={() => setViewing(r)} className="min-w-0 text-left">
                            <p className="truncate font-display text-base font-extrabold text-ink-900 hover:text-brand-700">
                              {r.name}
                            </p>
                            <p className="num truncate text-xs text-ink-500">{r.id} · {r.phone}</p>
                          </button>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {plan && (
                              <Badge tone="amber"><Crown size={11} /> {plan.signup.plan}</Badge>
                            )}
                            <RowMenu items={menuFor(r)} />
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge tone={statusTone[r.status]} dot>{r.status}</Badge>
                          {r.priority && <Badge tone={priorityTone[r.priority] || 'slate'}>{r.priority}</Badge>}
                          {r.label && <Badge tone="sky">{r.label}</Badge>}
                          {r.owner === 'Unassigned' ? (
                            <button className="chip border border-orange-300 bg-orange-50 text-orange-700" onClick={() => setAssignFor([r.id])}>
                              Unassigned
                            </button>
                          ) : (
                            <span className="chip bg-surface-soft text-ink-600">{r.owner}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* What they asked for */}
                    <div className="mt-4 grid grid-cols-2 divide-x divide-ink-900/[0.07] rounded-xl border border-ink-900/[0.07] py-3 sm:grid-cols-4">
                      {[
                        ['Destination', r.destination],
                        ['Travellers', r.pax],
                        ['Travel date', r.travelDate || '—'],
                        ['Budget', r.budget ? inr(r.budget) : '—'],
                      ].map(([label, v]) => (
                        <div key={label} className="px-3 text-center">
                          <p className="num truncate font-display text-sm font-extrabold text-ink-900">{v}</p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-400">{label}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1"><Clock size={11} /> last contact {r.lastContact || '—'}</span>
                      <span className={r.nextFollowUp ? 'font-semibold text-ink-700' : ''}>next {r.nextFollowUp || 'nothing scheduled'}</span>
                      <span>via {r.source}</span>
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <a href={`tel:${digits(r.phone)}`} className="btn-line btn-sm"><Phone size={13} /> Call</a>
                      <a
                        href={`https://wa.me/${digits(r.phone)}?text=${encodeURIComponent(`Hi ${r.name}, thanks for your ${r.destination} enquiry with Smira Club!`)}`}
                        target="_blank" rel="noreferrer" className="btn-line btn-sm"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                      <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your ${r.destination} trip`)}`} className="btn-line btn-sm">
                        <Mail size={13} /> Email
                      </a>
                      <button className="btn-line btn-sm" onClick={() => makeQuote(r)}><FileText size={13} /> Quote</button>
                      <button
                        className="btn-line btn-sm"
                        onClick={() => act('task', { type: 'Follow-up', title: `Follow up with ${r.name}`, customer: r.name, suggest: `Follow-up — ${r.destination}` })}
                      >
                        <CalendarClock size={13} /> Follow-up
                      </button>
                      <button className="btn-action btn-sm" onClick={() => setStatusFor([r.id])}>
                        <Tag size={13} /> Move stage
                      </button>
                    </div>
                  </article>
                );
              })}
              {listRows.length === 0 && (
                <div className="card border-dashed p-14 text-center text-sm text-ink-500 xl:col-span-2">
                  No leads match this view.
                </div>
              )}
            </div>
          )}

          {layout === 'table' && (
            <div className="mt-4">
              <DataTable
                columns={columns}
                rows={listRows}
                searchKeys={['name', 'phone', 'email', 'destination', 'id']}
                searchPlaceholder="Search by name, phone, email or destination…"
                filters={[
                  { key: 'status', label: 'Status', options: enquiryStatuses },
                  { key: 'source', label: 'Source', options: SOURCES },
                  { key: 'label', label: 'Label', options: LABELS },
                  { key: 'owner', label: 'Owner', options: owners },
                ]}
                exportName="smira-club-enquiries"
                emptyLabel="No enquiries match this view"
                onRowClick={(r) => setViewing(r)}
                bulkActions={[
                  { label: 'Assign', icon: UserCheck, onClick: (ids) => setAssignFor(ids) },
                  { label: 'Change status', icon: Tag, onClick: (ids) => setStatusFor(ids) },
                  { label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) },
                ]}
              />
            </div>
          )}
        </>
      )}

      {/* The heavier analysis, one section at a time */}
      {section !== 'Leads' && (
        <div className="mt-5">
          <SalesOverview
            view={section}
            rows={rows}
            bookings={bookings}
            invoices={invoices}
            team={team}
            onPickStatus={openStage}
            onOpen={(lead) => setViewing(lead)}
            actions={quickActions}
          />
        </div>
      )}

      {action && (
        <TeamActions action={action.kind} context={action.context} store={store} onClose={() => setAction(null)} />
      )}

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={saveEnquiry}
        title={editing ? `Edit ${editing.id}` : 'Add lead'}
        subtitle={editing ? editing.name : 'Capture a new travel enquiry'}
        fields={fields}
        initial={editing || { status: 'New', owner: 'Unassigned' }}
        submitLabel={editing ? 'Save changes' : 'Create lead'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('enquiries', confirm)}
        title="Delete enquiries?"
        message={`This removes ${confirm?.length || 0} enquiry record${confirm?.length === 1 ? '' : 's'} from the pipeline. This cannot be undone.`}
      />

      {/* Assign owner */}
      <Modal
        open={Boolean(assignFor)}
        onClose={() => setAssignFor(null)}
        title="Assign owner"
        subtitle={`${assignFor?.length || 0} lead(s) selected`}
        size="sm"
      >
        <div className="space-y-2">
          {owners.map((o) => (
            <button
              key={o}
              onClick={() => {
                updateMany('enquiries', assignFor, { owner: o }, `Assigned to ${o}`);
                setAssignFor(null);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50"
            >
              <Avatar name={o} size="sm" />
              <span className="font-semibold text-ink-800">{o}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Change status */}
      <Modal
        open={Boolean(statusFor)}
        onClose={() => setStatusFor(null)}
        title="Move stage"
        subtitle={`${statusFor?.length || 0} lead(s) selected`}
        size="sm"
      >
        <div className="space-y-2">
          {enquiryStatuses.map((s) => (
            <button
              key={s}
              onClick={() => {
                updateMany('enquiries', statusFor, { status: s }, `Moved to ${s}`);
                setStatusFor(null);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50"
            >
              <Badge tone={statusTone[s]} dot>{s}</Badge>
            </button>
          ))}
        </div>
      </Modal>

      {/* Import */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import leads"
        subtitle="Upload a CSV exported from your old CRM"
        size="md"
        footer={
          <>
            <button className="btn-line" onClick={() => setImportOpen(false)}>Cancel</button>
            <button
              className="btn-action"
              onClick={() => {
                setImportOpen(false);
                toast('Import queued — we will email you when it finishes', 'info');
              }}
            >
              Start import
            </button>
          </>
        }
      >
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-900/15 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
          <Upload size={26} className="mb-3 text-ink-400" />
          <span className="text-sm font-bold text-ink-800">Click to choose a CSV file</span>
          <span className="mt-1 text-xs text-ink-500">Columns: name, phone, email, destination, pax, budget</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) toast(`${file.name} ready to import`, 'info');
            }}
          />
        </label>
      </Modal>

      <LeadDetails
        lead={viewing && rows.find((r) => r.id === viewing.id)}
        list={rows}
        onClose={() => setViewing(null)}
        onJump={(step) => {
          const i = rows.findIndex((r) => r.id === viewing.id);
          const next = rows[i + step];
          if (next) setViewing(next);
        }}
        onEdit={(lead) => {
          setViewing(null);
          setEditing(lead);
          setFormOpen(true);
        }}
      />
    </>
  );
}
