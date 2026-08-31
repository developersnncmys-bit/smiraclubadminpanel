import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Phone, MessageCircle, Pencil, Trash2, ShieldCheck, Send, AlertTriangle,
  CheckCircle2, Info, Trophy, Search, Download, ClipboardPlus, Shuffle, Clock, MapPin,
  History, Target, Users, Presentation, Route, CalendarClock, ListChecks, Radio, Zap, PhoneCall, IndianRupee,
  UserCheck, UserCog, StickyNote, Flag, RefreshCw, ArrowRightLeft, Eye, BellRing,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import MenuButton from '../components/ui/MenuButton.jsx';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import MemberDetails from '../components/team/MemberDetails.jsx';
import TeamActions from '../components/team/TeamActions.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr, liveStatuses, attendanceStates } from '../data/mockData.js';
import { downloadCsv } from '../lib/csv.js';

const ROLES = ['Owner', 'Senior Travel Consultant', 'Travel Consultant', 'Field Officer', 'Visa & Documentation', 'Accounts'];
const ACCOUNT = ['Active', 'Invited', 'Disabled'];
const SECTIONS = ['Live desk', 'Attendance', 'Work', 'Targets & ranking', 'Tasks', 'Alerts'];

/** Every live status the sheet lists, with the colour it reads by. */
const LIVE = {
  Online: { dot: 'bg-emerald-500', rail: 'before:bg-emerald-500', tone: 'green', soft: 'bg-emerald-50 text-emerald-700' },
  Idle: { dot: 'bg-amber-400', rail: 'before:bg-amber-400', tone: 'amber', soft: 'bg-amber-50 text-amber-700' },
  'In meeting': { dot: 'bg-violet-500', rail: 'before:bg-violet-500', tone: 'violet', soft: 'bg-violet-50 text-violet-700' },
  'On customer visit': { dot: 'bg-sky-500', rail: 'before:bg-sky-500', tone: 'sky', soft: 'bg-sky-50 text-sky-700' },
  'On break': { dot: 'bg-orange-400', rail: 'before:bg-orange-400', tone: 'amber', soft: 'bg-orange-50 text-orange-700' },
  Offline: { dot: 'bg-ink-400', rail: 'before:bg-ink-400', tone: 'slate', soft: 'bg-surface-soft text-ink-600' },
  Leave: { dot: 'bg-ink-300', rail: 'before:bg-ink-900/20', tone: 'slate', soft: 'bg-surface-soft text-ink-600' },
  'Not logged in': { dot: 'bg-rose-400', rail: 'before:bg-rose-400', tone: 'rose', soft: 'bg-rose-50 text-rose-700' },
};
const attendanceTone = {
  Present: 'green', 'Half day': 'amber', Late: 'amber', 'Work from home': 'sky',
  'Field visit': 'sky', Leave: 'slate', Absent: 'rose', 'Not logged in': 'rose',
};
const noticeStyle = {
  critical: { icon: AlertTriangle, chip: 'bg-rose-100 text-rose-700', lane: 'Critical', tone: 'rose' },
  warning: { icon: Info, chip: 'bg-amber-100 text-amber-700', lane: 'Warning', tone: 'amber' },
  positive: { icon: CheckCircle2, chip: 'bg-emerald-100 text-emerald-700', lane: 'Positive', tone: 'green' },
};
const priorityTone = { High: 'rose', Medium: 'amber', Low: 'slate' };
const taskTone = { Completed: 'green', Overdue: 'rose', 'In progress': 'sky', Pending: 'amber', Cancelled: 'slate' };

const digits = (phone) => String(phone).replace(/[^\d]/g, '');
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

/** Low / Normal / High / Overloaded, on the sheet's own thresholds. */
function workloadOf(m) {
  const leadLoad = Number(m.leads || 0);
  const followLoad = Number(m.followUps || 0);
  const openTasks = Math.max(0, Number(m.tasksTotal || 0) - Number(m.tasksDone || 0));
  const priority = Number(m.leadMix?.hot || 0);
  const load = leadLoad + followLoad + openTasks;
  const level =
    load >= 100 ? 'Overloaded' : load >= 61 ? 'High' : load >= 31 ? 'Normal' : 'Low';
  const tone = { Overloaded: 'rose', High: 'rose', Normal: 'amber', Low: 'green' }[level];
  return { level, tone, load, leadLoad, followLoad, openTasks, priority };
}

/** "1h 22m" and "12m" both come off the telephony log — add them up. */
function minutesOf(s) {
  const h = String(s || '').match(/(\d+)\s*h/);
  const m = String(s || '').match(/(\d+)\s*m/);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}
const asHours = (mins) => (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`);

/** Minutes since the last activity, read off the "34 min ago" the CRM writes. */
function idleMinutes(m) {
  const s = String(m.lastActive || '');
  if (/now/i.test(s)) return 0;
  const h = s.match(/(\d+)\s*h/);
  const min = s.match(/(\d+)\s*min/);
  if (/yesterday|day/i.test(s)) return 24 * 60;
  return (h ? Number(h[1]) * 60 : 0) + (min ? Number(min[1]) : 0);
}

const scoreBand = (s) =>
  s >= 90 ? { label: 'Excellent', tone: 'green', stroke: '#10b981', text: 'text-emerald-600' }
  : s >= 75 ? { label: 'Good', tone: 'sky', stroke: '#0ea5e9', text: 'text-sky-600' }
  : s >= 60 ? { label: 'Average', tone: 'amber', stroke: '#f59e0b', text: 'text-amber-600' }
  : { label: 'Needs improvement', tone: 'rose', stroke: '#f43f5e', text: 'text-rose-600' };

/** The productivity score, drawn rather than printed. */
function Ring({ value, size = 54 }) {
  const band = scoreBand(value);
  const r = (size - 7) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={band.stroke} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c - (Math.min(100, Math.max(0, value)) / 100) * c}
        />
      </svg>
      <span className="num absolute font-display text-sm font-extrabold text-ink-900">{value}</span>
    </span>
  );
}

/** A progress line — targets, workload, attendance all read the same way. */
function Bar({ pct: value, tone = 'bg-brand-500', className = '' }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-surface-soft ${className}`}>
      <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
    </div>
  );
}

/** One counter in a card's strip. */
function Tick({ label, value, tone }) {
  return (
    <div className="px-1 text-center">
      <p className={`num font-display text-lg font-extrabold leading-none ${tone || 'text-ink-900'}`}>{value ?? 0}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

/** A label and a number on one line — the comparison tables are built of these. */
function Line({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-900/[0.07] py-1.5 last:border-0">
      <span className="text-sm text-ink-500">{label}</span>
      <span className={`num text-sm font-bold ${tone || 'text-ink-900'}`}>{value}</span>
    </div>
  );
}

/**
 * Team Status, built column by column from the client's sheet: live status,
 * attendance, current activity, last active, tasks, lead workload, follow-ups,
 * calls, presentations, visits, sales, revenue, target vs achievement,
 * productivity score, alerts, ranking, workload level and quick actions.
 */
export default function Team() {
  const store = useApp();
  const { team, tasks, enquiries, create, update, remove, toast, refresh } = store;
  const navigate = useNavigate();
  const [action, setAction] = useState(null);
  const act = (kind, context = {}) => setAction({ kind, context });
  const [section, setSection] = useState('Live desk');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [query, setQuery] = useState('');
  const [liveFilter, setLiveFilter] = useState('All');
  const [rankBy, setRankBy] = useState('revenue');
  const [rankWhen, setRankWhen] = useState('This month');
  const [rankTeam, setRankTeam] = useState('All');
  const [rankRole, setRankRole] = useState('All');
  const [taskWho, setTaskWho] = useState('All');

  const count = (fn) => team.filter(fn).length;
  const sum = (fn) => team.reduce((s, m) => s + Number(fn(m) || 0), 0);

  // -- Ranking (column P) ----------------------------------------------------
  const rankKey = {
    revenue: (m) => Number(m.revenue || 0),
    closings: (m) => Number(m.bookings || 0),
    conversion: (m) => pct(m.presentationDetail?.converted || 0, m.presentationDetail?.completed),
    presentations: (m) => Number(m.presentations || 0),
    visits: (m) => Number(m.visits || 0),
    followUps: (m) => Number(m.followUpDetail?.completed || 0),
    productivity: (m) => Number(m.productivity || 0),
    attendance: (m) => Number(m.day?.attendancePct || 0),
  }[rankBy];
  const ranked = [...team].sort((a, b) => rankKey(b) - rankKey(a));
  const rankOf = (m) => (rankKey(m) > 0 ? ranked.findIndex((x) => x.id === m.id) + 1 : 0);

  const tasksOf = (m) => tasks.filter((t) => t.owner === m.name.split(' ')[0]);

  // -- Desk-wide totals (columns E–L) ---------------------------------------
  const online = count((m) => m.live === 'Online');
  const tasksTotal = sum((m) => m.tasksTotal);
  const tasksDone = sum((m) => m.tasksDone);
  const tasksOverdue = sum((m) => m.taskDetail?.overdue);
  const tasksPending = sum((m) => m.taskDetail?.pending);
  const tasksProgress = sum((m) => m.taskDetail?.inProgress);
  const tasksCancelled = sum((m) => m.taskDetail?.cancelled);
  const tasksResched = sum((m) => m.taskDetail?.rescheduled);

  const leads = sum((m) => m.leads);
  const calls = sum((m) => m.calls);
  const connected = sum((m) => m.callDetail?.connected);
  const talkTime = asHours(team.reduce((s, m) => s + minutesOf(m.callDetail?.talkTime), 0));
  const fuDue = sum((m) => m.followUpDetail?.due);
  const fuDone = sum((m) => m.followUpDetail?.completed);
  const fuOverdue = sum((m) => m.followUpDetail?.overdue);
  const presDone = sum((m) => m.presentationDetail?.completed);
  const presConv = sum((m) => m.presentationDetail?.converted);
  const visitsDone = sum((m) => m.visitDetail?.completed);
  const closings = sum((m) => m.bookings);
  const revenue = sum((m) => m.revenue);
  const target = sum((m) => m.target);
  const collected = sum((m) => m.revenueDetail?.collected);
  const outstanding = sum((m) => m.revenueDetail?.outstanding);
  const achievement = pct(revenue, target);

  // Month pacing, for target vs achievement (column M)
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const daysLeft = Math.max(0, daysInMonth - dayOfMonth);
  const requiredDaily = daysLeft ? Math.round(Math.max(0, target - revenue) / daysLeft) : 0;
  const projected = dayOfMonth ? Math.round((revenue / dayOfMonth) * daysInMonth) : 0;

  // -- Alerts (column O) -----------------------------------------------------
  const order = { critical: 0, warning: 1, positive: 2 };
  const notices = team
    .flatMap((m) => (m.notices || []).map((n) => ({ ...n, member: m })))
    .sort((a, b) => order[a.level] - order[b.level]);
  const idleAlerts = team
    .filter((m) => ['Online', 'Idle'].includes(m.live) && idleMinutes(m) >= 15)
    .map((m) => ({
      level: idleMinutes(m) >= 60 ? 'critical' : 'warning',
      text: `No activity for ${idleMinutes(m)} minutes`,
      at: m.lastActive,
      member: m,
    }));
  const allNotices = [...notices, ...idleAlerts].sort((a, b) => order[a.level] - order[b.level]);
  const lane = (level) => allNotices.filter((n) => n.level === level);

  // Attendance flags across the desk (column B)
  const attendanceFlags = team.flatMap((m) => (m.attendanceFlags || []).map((f) => ({ text: f, member: m })));

  // -- The roster (columns A, C, D, Q) --------------------------------------
  const matches = (m) => {
    if (liveFilter !== 'All' && m.live !== liveFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [m.name, m.role, m.email, m.phone, m.activity, m.empId, m.department].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  };
  const rows = ranked.filter(matches);

  // -- The quick actions the sheet lists (column R) -------------------------
  const quickActions = [
    { label: 'Add lead', icon: UserPlus, run: () => act('add-lead') },
    { label: 'Assign lead', icon: UserCheck, run: () => act('assign-lead') },
    { label: 'Reassign lead', icon: ArrowRightLeft, run: () => act('reassign') },
    { label: 'Create task', icon: ClipboardPlus, run: () => act('task', { type: 'Call', title: 'Create task' }) },
    { label: 'Follow-up', icon: CalendarClock, run: () => act('task', { type: 'Follow-up', title: 'Schedule a follow-up', suggest: 'Follow-up call' }) },
    { label: 'Presentation', icon: Presentation, run: () => act('task', { type: 'Presentation', title: 'Schedule a presentation', suggest: 'Membership walkthrough' }) },
    { label: 'Visit', icon: Route, run: () => act('task', { type: 'Customer Visit', title: 'Schedule a customer visit', suggest: 'Home visit' }) },
    { label: 'Field officer', icon: UserCog, run: () => act('field-officer') },
    { label: 'Send message', icon: Send, run: () => act('message') },
    { label: 'Add note', icon: StickyNote, run: () => act('note') },
    { label: 'Mark priority', icon: Flag, run: () => act('priority') },
    { label: 'Rebalance', icon: Shuffle, run: () => act('rebalance') },
  ];

  const exportTeam = () =>
    downloadCsv(
      'smira-club-team-status',
      team.map((m) => ({
        ...m,
        login: m.day?.login || '', logout: m.day?.logout || '', working: m.day?.working || '',
        breaks: m.day?.breaks || '', idle: m.day?.idle || '', lateBy: m.day?.lateBy || 0,
        mode: m.day?.mode || '', source: m.day?.source || '', regularisation: m.day?.regularisation || '',
        attendancePct: m.day?.attendancePct || 0,
        tasks: `${m.tasksDone}/${m.tasksTotal}`,
        connected: m.callDetail?.connected || 0,
        connectionRate: `${pct(m.callDetail?.connected || 0, m.calls)}%`,
        presentationsConverted: m.presentationDetail?.converted || 0,
        visitsCompleted: m.visitDetail?.completed || 0,
        followUpDue: m.followUpDetail?.due || 0,
        followUpDiscipline: `${pct(m.followUpDetail?.completed || 0, m.followUpDetail?.due)}%`,
        workload: workloadOf(m).level,
        rank: rankOf(m) || '',
        achievement: m.target ? `${pct(m.revenue, m.target)}%` : '',
      })),
      [
        { key: 'empId', header: 'Employee ID' }, { key: 'name', header: 'Member' },
        { key: 'role', header: 'Designation' }, { key: 'department', header: 'Team' },
        { key: 'live', header: 'Live status' }, { key: 'activity', header: 'Current activity' },
        { key: 'lastActive', header: 'Last active' }, { key: 'attendance', header: 'Attendance' },
        { key: 'login', header: 'Login' }, { key: 'logout', header: 'Logout' },
        { key: 'working', header: 'Working hours' }, { key: 'breaks', header: 'Break' },
        { key: 'idle', header: 'Idle' }, { key: 'lateBy', header: 'Late by (min)' },
        { key: 'mode', header: 'Working from' }, { key: 'source', header: 'Login source' },
        { key: 'regularisation', header: 'Regularisation' }, { key: 'attendancePct', header: 'Attendance %' },
        { key: 'tasks', header: "Today's tasks" }, { key: 'leads', header: 'Lead workload' },
        { key: 'followUpDue', header: 'Follow-ups due' }, { key: 'followUpDiscipline', header: 'Follow-up discipline' },
        { key: 'calls', header: 'Calls' }, { key: 'connected', header: 'Connected' },
        { key: 'connectionRate', header: 'Connection rate' }, { key: 'presentations', header: 'Presentations' },
        { key: 'presentationsConverted', header: 'Presentations converted' },
        { key: 'visits', header: 'Customer visits' }, { key: 'visitsCompleted', header: 'Visits completed' },
        { key: 'bookings', header: 'Sales / closings' }, { key: 'revenue', header: 'Revenue' },
        { key: 'target', header: 'Target' }, { key: 'achievement', header: 'Target vs achievement' },
        { key: 'productivity', header: 'Productivity score' }, { key: 'rank', header: 'Team ranking' },
        { key: 'workload', header: 'Workload level' },
      ]
    );

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'empId', label: 'Employee ID', type: 'text', placeholder: 'EMP-111' },
    { name: 'role', label: 'Designation', type: 'select', options: ROLES },
    { name: 'department', label: 'Team', type: 'text', placeholder: 'Sales desk' },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'status', label: 'Account', type: 'select', options: ACCOUNT },
    { name: 'live', label: 'Live status', type: 'select', options: liveStatuses },
    { name: 'attendance', label: 'Attendance', type: 'select', options: attendanceStates },
    { name: 'activity', label: 'Current activity', type: 'text', full: true },
    { name: 'lastActive', label: 'Last active', type: 'text', placeholder: '5 min ago' },
    { name: 'target', label: 'Revenue target (₹)', type: 'number' },
    { name: 'productivity', label: 'Productivity score', type: 'number' },
  ];

  const save = (values) => {
    if (editing) update('team', editing.id, values);
    else
      create('team', {
        ...values,
        enquiries: 0, bookings: 0, revenue: 0, leads: 0, followUps: 0, calls: 0,
        presentations: 0, visits: 0, tasksDone: 0, tasksTotal: 0, alerts: 0,
        lastActive: 'never', notices: [], attendanceFlags: [], activityLog: [],
        day: { login: '—', logout: '—', working: '0h', breaks: '0m', idle: '0m', lateBy: 0, mode: 'Office', source: 'Web app', regularisation: 'None pending', attendancePct: 0 },
      });
  };

  const openEdit = (m) => { setViewing(null); setEditing(m); setFormOpen(true); };

  const menuFor = (m) => [
    { label: 'View customer', icon: Eye, onClick: () => navigate('/customers') },
    { label: 'View booking', icon: ListChecks, onClick: () => navigate('/bookings') },
    { label: 'View payment', icon: Target, onClick: () => navigate('/payment') },
    { label: 'Add note', icon: StickyNote, onClick: () => act('note', { member: m }) },
    { label: 'Mark priority', icon: Flag, onClick: () => act('priority', { member: m }) },
    { label: 'Change status', icon: RefreshCw, onClick: () => act('change-status', { member: m }) },
    { label: 'Send reminder', icon: BellRing, onClick: () => act('message', { member: m, title: `Remind ${m.name.split(' ')[0]}`, kind: 'Reminder', placeholder: 'What do they need to do?' }) },
    { label: 'Edit member', icon: Pencil, onClick: () => openEdit(m) },
    {
      label: m.status === 'Disabled' ? 'Enable access' : 'Disable access',
      icon: ShieldCheck,
      onClick: () => update('team', m.id, { status: m.status === 'Disabled' ? 'Active' : 'Disabled' }),
    },
    { label: 'Remove', icon: Trash2, danger: true, onClick: () => setConfirm(m) },
  ];

  const taskRows = tasks.filter((t) => taskWho === 'All' || t.owner === taskWho);

  return (
    <>
      <PageHeader
        title="Team status"
        subtitle={`${team.length} on the desk · ${online} online right now · live`}
      >
        <button className="btn-line" onClick={exportTeam}>
          <Download size={16} /> Export
        </button>
        <button className="btn-line" onClick={refresh}>
          <RefreshCw size={16} /> Refresh
        </button>
        <button className="btn-action" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <UserPlus size={16} /> Invite member
        </button>
      </PageHeader>

      {/* -- The desk bar: pick a status, or start something (columns A, R) -- */}
      <section className="card flex flex-wrap items-center gap-3 px-5 py-3.5">
        <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink-900">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          Live status
        </h2>

        <MenuButton
          label={liveFilter === 'All' ? `All statuses · ${team.length}` : `${liveFilter} · ${count((m) => m.live === liveFilter)}`}
          icon={Radio}
          value={liveFilter}
          width="w-[260px]"
          items={[
            { key: 'All', label: 'All statuses', count: team.length },
            ...liveStatuses.map((st) => ({
              key: st,
              label: st,
              count: count((m) => m.live === st),
              dot: LIVE[st]?.dot || 'bg-ink-400',
            })),
          ]}
          onSelect={(key) => {
            setLiveFilter(key);
            setSection('Live desk');
          }}
        />

        <MenuButton
          label="Quick actions"
          icon={Zap}
          variant="action"
          width="w-[250px]"
          items={quickActions.map((q) => ({ key: q.label, label: q.label, icon: q.icon }))}
          onSelect={(key) => quickActions.find((q) => q.label === key)?.run()}
        />

        <p className="num ml-auto text-sm text-ink-500">
          {online} online · {count((m) => m.attendance === 'Present')} present ·{' '}
          {count((m) => m.live === 'Not logged in')} not logged in
        </p>
      </section>

      {/* -- What the desk has done today (columns E–L) ---------------------- */}
      <div className="mt-4">
        <KpiRow
          cols={6}
          items={[
            { label: 'Tasks', value: `${tasksDone}/${tasksTotal}`, hint: `${tasksOverdue} overdue`, icon: ListChecks, progress: pct(tasksDone, tasksTotal), tone: tasksOverdue ? 'text-rose-600' : 'text-ink-900' },
            { label: 'Calls', value: calls, hint: `${connected} connected`, icon: PhoneCall, progress: pct(connected, calls) },
            { label: 'Follow-ups', value: `${fuDone}/${fuDue}`, hint: `${fuOverdue} overdue`, icon: CalendarClock, progress: pct(fuDone, fuDue), tone: fuOverdue ? 'text-amber-600' : 'text-ink-900' },
            { label: 'Presentations', value: presDone, hint: `${presConv} converted`, icon: Presentation, progress: pct(presConv, presDone) },
            { label: 'Closings', value: closings, hint: `${visitsDone} visits completed`, icon: Trophy, tone: 'text-emerald-600' },
            { label: 'Revenue', value: shortInr(revenue), hint: `of ${shortInr(target)} target`, icon: IndianRupee, progress: achievement, tone: 'text-brand-700' },
          ]}
        />
      </div>

      <SectionTabs
        className="mt-6"
        items={SECTIONS.map((s) => ({
          key: s,
          label: s,
          count: s === 'Alerts' ? lane('critical').length + lane('warning').length : s === 'Tasks' ? tasks.length : null,
        }))}
        value={section}
        onChange={setSection}
      />

      {/* ==================================================================== */}
      {/* Live desk — who is on, what they are doing (columns A, C, D, N, Q)   */}
      {/* ==================================================================== */}
      {section === 'Live desk' && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className="input pl-10" placeholder="Search name, ID, designation or activity…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {liveFilter !== 'All' && (
              <button className="btn-line btn-sm" onClick={() => setLiveFilter('All')}>
                {liveFilter} · clear
              </button>
            )}
            <p className="num text-sm text-ink-500">{rows.length} shown</p>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {rows.map((m) => {
              const w = workloadOf(m);
              const rank = rankOf(m);
              const d = m.day || {};
              const idle = idleMinutes(m);
              const band = scoreBand(m.productivity ?? 0);
              const flagged = (m.notices || []).filter((n) => n.level !== 'positive').length;
              return (
                <article key={m.id} className={`card rail ${LIVE[m.live]?.rail || 'before:bg-ink-400'} p-5 pl-6`}>
                  {/* Who */}
                  <div className="flex items-start gap-3">
                    <button onClick={() => setViewing(m)} className="relative shrink-0" title="Open the employee drawer">
                      <Avatar name={m.name} />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${LIVE[m.live]?.dot}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => setViewing(m)} className="min-w-0 text-left">
                          <p className="truncate font-display text-base font-extrabold text-ink-900 hover:text-brand-700">{m.name}</p>
                          <p className="truncate text-xs text-ink-500">
                            <span className="num">{m.empId}</span> · {m.role} · {m.department}
                          </p>
                        </button>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {rank === 1 && <Badge tone="amber"><Trophy size={11} /> #1</Badge>}
                          <RowMenu items={menuFor(m)} />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge tone={LIVE[m.live]?.tone || 'slate'} dot>{m.live}</Badge>
                        <Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge>
                        <Badge tone={w.tone}>{`${w.level} workload`}</Badge>
                        {flagged > 0 && <Badge tone="rose" dot><AlertTriangle size={11} /> {flagged}</Badge>}
                      </div>
                    </div>
                  </div>

                  {/* Doing now (column C) and last active (column D) */}
                  <div className={`mt-4 rounded-xl px-3.5 py-3 ${LIVE[m.live]?.soft || 'bg-surface-soft'}`}>
                    <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">Doing now</p>
                    <p className="mt-0.5 truncate text-sm font-bold">{m.activityType || 'No activity'}</p>
                    <p className="truncate text-sm opacity-80">{m.activity || '—'}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs opacity-70">
                      <span className="inline-flex items-center gap-1"><Clock size={11} /> since {m.activityStarted || '—'}</span>
                      <span className={idle >= 30 ? 'font-bold text-rose-700' : ''}>last active {m.lastActive}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={11} /> {d.mode || 'Office'} · {d.source || '—'}</span>
                    </p>
                    {m.visitTrack && (
                      <p className="mt-1.5 border-t border-current/10 pt-1.5 text-xs opacity-80">
                        Visit · {m.visitTrack.stage} at {m.visitTrack.place} · in {m.visitTrack.checkIn}
                      </p>
                    )}
                  </div>

                  {/* The counters the sheet puts on this card */}
                  <div className="mt-4 grid grid-cols-4 divide-x divide-ink-900/[0.07] rounded-xl border border-ink-900/[0.07] py-3 sm:grid-cols-7">
                    <Tick label="Calls" value={m.calls} />
                    <Tick label="Conn." value={m.callDetail?.connected} tone="text-emerald-600" />
                    <Tick label="Present." value={m.presentations} />
                    <Tick label="Visits" value={m.visits} />
                    <Tick label="F/up due" value={m.followUpDetail?.due} tone={m.followUpDetail?.overdue ? 'text-rose-600' : ''} />
                    <Tick label="Tasks" value={`${m.tasksDone ?? 0}/${m.tasksTotal ?? 0}`} />
                    <Tick label="Closed" value={m.bookings} tone="text-emerald-600" />
                  </div>

                  {/* Workload level (column Q) and score (column N) */}
                  <div className="mt-4 flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="font-semibold text-ink-600">
                          Workload · {w.leadLoad} leads · {w.followLoad} follow-ups · {w.openTasks} open · {w.priority} priority
                        </span>
                        <span className="num font-bold text-ink-900">{w.load}</span>
                      </p>
                      <Bar className="mt-1.5" pct={Math.min(100, w.load)} tone={w.level === 'Low' ? 'bg-emerald-500' : w.level === 'Normal' ? 'bg-amber-400' : 'bg-rose-500'} />
                      <p className="mt-2.5 flex items-baseline justify-between gap-2 text-xs">
                        <span className="font-semibold text-ink-600">Target {shortInr(m.target || 0)}</span>
                        <span className="num font-bold text-brand-700">{inr(m.revenue || 0)} · {pct(m.revenue, m.target)}%</span>
                      </p>
                      <Bar className="mt-1.5" pct={pct(m.revenue, m.target)} tone={pct(m.revenue, m.target) >= 100 ? 'bg-emerald-500' : 'bg-brand-500'} />
                    </div>
                    <div className="shrink-0 text-center">
                      <Ring value={m.productivity ?? 0} />
                      <p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${band.text}`}>
                        {band.label}
                      </p>
                    </div>
                  </div>

                  {/* Management actions the sheet lists on the live card */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <a href={`tel:${digits(m.phone)}`} className="btn-line btn-sm"><Phone size={13} /> Call</a>
                    <a href={`https://wa.me/${digits(m.phone)}`} target="_blank" rel="noreferrer" className="btn-line btn-sm"><MessageCircle size={13} /> WhatsApp</a>
                    <button className="btn-line btn-sm" onClick={() => act('task', { member: m, type: 'Call', title: `Assign a task to ${m.name.split(' ')[0]}` })}><ClipboardPlus size={13} /> Assign task</button>
                    <button className="btn-line btn-sm" onClick={() => navigate('/enquiries')}><Users size={13} /> Leads</button>
                    <button className="btn-line btn-sm" onClick={() => setViewing(m)}><History size={13} /> Activity log</button>
                    <button className="btn-line btn-sm" onClick={() => act('message', { member: m, title: `Remind ${m.name.split(' ')[0]}`, kind: 'Reminder', placeholder: 'What do they need to do?' })}><BellRing size={13} /> Remind</button>
                    {['High', 'Overloaded'].includes(w.level) && (
                      <button className="btn-action btn-sm" onClick={() => act('rebalance', { member: m })}>
                        <Shuffle size={13} /> Rebalance
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
            {rows.length === 0 && (
              <div className="card border-dashed p-14 text-center text-sm text-ink-500 xl:col-span-2">
                No one matches this view.
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================================================================== */}
      {/* Attendance (column B)                                                */}
      {/* ==================================================================== */}
      {section === 'Attendance' && (
        <div className="mt-5 space-y-5">
          <Block title="Today's attendance" note="Every state the sheet asks for, counted across the desk">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
              <Stat label="Total employees" value={team.length} />
              <Stat label="Present" value={count((m) => ['Present', 'Work from home', 'Field visit', 'Late', 'Half day'].includes(m.attendance))} tone="text-emerald-600" />
              <Stat label="Absent" value={count((m) => m.attendance === 'Absent')} tone="text-rose-600" />
              <Stat label="Late" value={count((m) => Number(m.day?.lateBy || 0) > 0)} tone="text-amber-600" hint={`${sum((m) => m.day?.lateBy)} minutes in total`} />
              <Stat label="Half day" value={count((m) => m.attendance === 'Half day')} />
              <Stat label="On leave" value={count((m) => m.attendance === 'Leave')} />
              <Stat label="Work from home" value={count((m) => m.day?.mode === 'WFH')} />
              <Stat label="Field visit" value={count((m) => m.day?.mode === 'Field')} />
              <Stat label="Not logged in" value={count((m) => m.live === 'Not logged in')} tone="text-rose-600" />
              <Stat label="Regularisation pending" value={count((m) => /pending/i.test(m.day?.regularisation || ''))} tone="text-amber-600" />
            </div>
          </Block>

          <Block title="Employee-level attendance" note="Login, logout, working hours, break, idle, late by, location, source and this month's attendance">
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr>
                    {['Employee', 'Status', 'Login', 'Logout', 'Working', 'Break', 'Idle', 'Late by', 'From', 'Source', 'Regularisation', 'Month'].map((h) => (
                      <th key={h} className="th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {team.map((m) => {
                    const d = m.day || {};
                    return (
                      <tr key={m.id} className="border-b border-ink-900/[0.05] transition hover:bg-surface-soft">
                        <td className="td">
                          <button onClick={() => setViewing(m)} className="flex items-center gap-2.5 text-left">
                            <Avatar name={m.name} size="sm" />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                              <span className="num block text-xs text-ink-400">{m.empId}</span>
                            </span>
                          </button>
                        </td>
                        <td className="td"><Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge></td>
                        <td className="td num">{d.login || '—'}</td>
                        <td className="td num">{d.logout || '—'}</td>
                        <td className="td num font-bold text-ink-900">{d.working || '—'}</td>
                        <td className="td num">{d.breaks || '—'}</td>
                        <td className="td num">{d.idle || '—'}</td>
                        <td className={`td num ${d.lateBy ? 'font-bold text-amber-600' : 'text-emerald-600'}`}>{d.lateBy ? `${d.lateBy} min` : 'On time'}</td>
                        <td className="td">
                          {d.mode || 'Office'}
                          {d.geo && <span className="mt-0.5 block text-xs text-emerald-600">{d.geo}</span>}
                        </td>
                        <td className="td">{d.source || '—'}</td>
                        <td className="td">
                          {/pending/i.test(d.regularisation || '') ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Badge tone="amber">Pending</Badge>
                              <button
                                className="btn-line btn-sm"
                                onClick={() =>
                                  update(
                                    'team',
                                    m.id,
                                    {
                                      day: { ...(m.day || {}), regularisation: 'Approved' },
                                      attendanceFlags: (m.attendanceFlags || []).filter(
                                        (f) => !/regularisation/i.test(f)
                                      ),
                                    },
                                    { message: `Regularisation approved for ${m.name.split(' ')[0]}` }
                                  )
                                }
                              >
                                Approve
                              </button>
                            </span>
                          ) : (
                            <span className="text-ink-500">{d.regularisation || 'None pending'}</span>
                          )}
                        </td>
                        <td className="td">
                          <span className="num text-sm font-bold text-ink-900">{d.attendancePct ?? 0}%</span>
                          <Bar className="mt-1 w-20" pct={d.attendancePct ?? 0} tone={(d.attendancePct ?? 0) >= 90 ? 'bg-emerald-500' : 'bg-amber-400'} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Block>

          <Block title="Attendance alerts" note="Automatically highlighted — late login, early logout, excessive break, no login, low working hours, missing logout and pending regularisation">
            <ul className="grid gap-2 sm:grid-cols-2">
              {attendanceFlags.map((f, i) => (
                <li key={`${f.member.id}-${f.text}-${i}`} className="flex items-center gap-3 rounded-xl border border-ink-900/[0.07] px-3.5 py-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700"><AlertTriangle size={14} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-800">{f.text}</span>
                    <span className="block truncate text-xs text-ink-500">{f.member.name} · {f.member.empId}</span>
                  </span>
                  <button className="btn-line btn-sm shrink-0" onClick={() => setViewing(f.member)}>View</button>
                </li>
              ))}
              {attendanceFlags.length === 0 && (
                <li className="rounded-xl border border-dashed border-ink-900/[0.12] px-4 py-8 text-center text-sm text-ink-500 sm:col-span-2">
                  Nothing flagged on attendance today.
                </li>
              )}
            </ul>
          </Block>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Work — leads, follow-ups, calls, presentations, visits, sales        */}
      {/* (columns F, G, H, I, J, K, L)                                        */}
      {/* ==================================================================== */}
      {section === 'Work' && (
        <div className="mt-5 space-y-5">
          <Block title="Employee comparison" note="The same row for everyone — calls, connection, presentations, visits, follow-up discipline, closings and revenue">
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse">
                <thead>
                  <tr>
                    {['Employee', 'Leads', 'Calls', 'Connected', 'Conn. rate', 'Present.', 'Converted', 'Visits', 'F/ups', 'Discipline', 'Closings', 'Revenue'].map((h) => (
                      <th key={h} className="th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((m) => (
                    <tr key={m.id} className="border-b border-ink-900/[0.05] transition hover:bg-surface-soft">
                      <td className="td">
                        <button onClick={() => setViewing(m)} className="flex items-center gap-2.5 text-left">
                          <Avatar name={m.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                            <span className="block truncate text-xs text-ink-400">{m.role}</span>
                          </span>
                        </button>
                      </td>
                      <td className="td num">{m.leads ?? 0}</td>
                      <td className="td num">{m.calls ?? 0}</td>
                      <td className="td num text-emerald-600">{m.callDetail?.connected ?? 0}</td>
                      <td className="td num">{pct(m.callDetail?.connected || 0, m.calls)}%</td>
                      <td className="td num">{m.presentationDetail?.completed ?? 0}</td>
                      <td className="td num text-emerald-600">{m.presentationDetail?.converted ?? 0}</td>
                      <td className="td num">{m.visitDetail?.completed ?? 0}</td>
                      <td className="td num">{m.followUpDetail?.completed ?? 0}/{m.followUpDetail?.due ?? 0}</td>
                      <td className="td num">
                        <span className={pct(m.followUpDetail?.completed || 0, m.followUpDetail?.due) >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                          {pct(m.followUpDetail?.completed || 0, m.followUpDetail?.due)}%
                        </span>
                      </td>
                      <td className="td num font-bold">{m.bookings ?? 0}</td>
                      <td className="td num font-bold text-brand-700">{m.revenue ? inr(m.revenue) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>

          <div className="grid gap-5 xl:grid-cols-2">
            <Block title="Lead workload" note="Where every assigned lead is sitting" action={<button className="btn-line btn-sm" onClick={() => act('reassign')}><ArrowRightLeft size={13} /> Reassign</button>}>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <Line label="Total assigned" value={leads} />
                <Line label="Fresh" value={sum((m) => m.leadMix?.fresh)} />
                <Line label="Contacted" value={sum((m) => m.leadMix?.contacted)} />
                <Line label="Interested" value={sum((m) => m.leadMix?.interested)} />
                <Line label="Presentation pending" value={sum((m) => m.leadMix?.presentationPending)} />
                <Line label="Presentation completed" value={sum((m) => m.leadMix?.presentationDone)} />
                <Line label="Visit scheduled" value={sum((m) => m.leadMix?.visitScheduled)} />
                <Line label="Follow-up pending" value={sum((m) => m.leadMix?.followUpPending)} tone="text-amber-600" />
                <Line label="Hot" value={sum((m) => m.leadMix?.hot)} tone="text-rose-600" />
                <Line label="Warm" value={sum((m) => m.leadMix?.warm)} />
                <Line label="Cold" value={sum((m) => m.leadMix?.cold)} />
                <Line label="No response" value={sum((m) => m.leadMix?.noResponse)} />
                <Line label="Closed" value={sum((m) => m.leadMix?.closed)} tone="text-emerald-600" />
                <Line label="Lost" value={sum((m) => m.leadMix?.lost)} tone="text-rose-600" />
              </div>
              <p className="eyebrow mb-2 mt-4">Workload level per employee</p>
              <ul className="space-y-2">
                {[...team].sort((a, b) => workloadOf(b).load - workloadOf(a).load).map((m) => {
                  const w = workloadOf(m);
                  return (
                    <li key={m.id} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 truncate text-sm font-semibold text-ink-700">{m.name.split(' ')[0]}</span>
                      <Bar className="flex-1" pct={Math.min(100, w.load)} tone={w.level === 'Low' ? 'bg-emerald-500' : w.level === 'Normal' ? 'bg-amber-400' : 'bg-rose-500'} />
                      <span className="num w-8 shrink-0 text-right text-sm font-bold text-ink-900">{w.load}</span>
                      <Badge tone={w.tone}>{w.level}</Badge>
                    </li>
                  );
                })}
              </ul>
            </Block>

            <Block title="Follow-ups" note="Today's follow-ups and the discipline behind them">
              <div className="grid gap-x-8 sm:grid-cols-2">
                <Line label="Total due" value={fuDue} />
                <Line label="Completed" value={fuDone} tone="text-emerald-600" />
                <Line label="Pending" value={sum((m) => m.followUpDetail?.pending)} tone="text-amber-600" />
                <Line label="Overdue" value={fuOverdue} tone="text-rose-600" />
                <Line label="Missed" value={sum((m) => m.followUpDetail?.missed)} tone="text-rose-600" />
                <Line label="Rescheduled" value={sum((m) => m.followUpDetail?.rescheduled)} />
              </div>
              <div className="mt-4 rounded-xl bg-surface-soft px-4 py-3">
                <p className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-ink-700">Follow-up discipline</span>
                  <span className="num font-display text-lg font-extrabold text-ink-900">{pct(fuDone, fuDue)}%</span>
                </p>
                <Bar className="mt-2" pct={pct(fuDone, fuDue)} tone={pct(fuDone, fuDue) >= 80 ? 'bg-emerald-500' : 'bg-amber-400'} />
                <p className="mt-1.5 text-xs text-ink-500">Completed follow-ups ÷ total due × 100</p>
              </div>
              <p className="eyebrow mb-2 mt-4">By category</p>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <Line label="Day 1" value={sum((m) => m.followUpMix?.day1)} />
                <Line label="Day 3" value={sum((m) => m.followUpMix?.day3)} />
                <Line label="Day 6" value={sum((m) => m.followUpMix?.day6)} />
                <Line label="Final follow-up" value={sum((m) => m.followUpMix?.final)} />
                <Line label="Payment follow-up" value={sum((m) => m.followUpMix?.payment)} />
                <Line label="Presentation follow-up" value={sum((m) => m.followUpMix?.presentation)} />
                <Line label="Visit follow-up" value={sum((m) => m.followUpMix?.visit)} />
                <Line label="Membership activation" value={sum((m) => m.followUpMix?.membership)} />
              </div>
            </Block>

            <Block title="Calls" note="The lead desk's strongest signal">
              <div className="grid gap-x-8 sm:grid-cols-2">
                <Line label="Total calls" value={calls} />
                <Line label="Connected" value={connected} tone="text-emerald-600" />
                <Line label="Not answered" value={sum((m) => m.callDetail?.notAnswered)} />
                <Line label="Busy" value={sum((m) => m.callDetail?.busy)} />
                <Line label="Wrong number" value={sum((m) => m.callDetail?.wrongNumber)} />
                <Line label="Interested" value={sum((m) => m.callDetail?.interested)} tone="text-emerald-600" />
                <Line label="Not interested" value={sum((m) => m.callDetail?.notInterested)} />
                <Line label="Callback requested" value={sum((m) => m.callDetail?.callback)} tone="text-amber-600" />
                <Line label="Connection rate" value={`${pct(connected, calls)}%`} />
                <Line label="Total talk time" value={talkTime} />
              </div>
              <p className="mt-3 text-xs text-ink-500">
                Call recording and history appear here once the telephony system is connected.
              </p>
            </Block>

            <Block title="Presentations and customer visits" note="The full funnel, both ways in">
              <p className="eyebrow mb-2">Presentations</p>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <Line label="Scheduled" value={sum((m) => m.presentationDetail?.scheduled)} />
                <Line label="Completed" value={presDone} />
                <Line label="Cancelled" value={sum((m) => m.presentationDetail?.cancelled)} />
                <Line label="No show" value={sum((m) => m.presentationDetail?.noShow)} tone="text-rose-600" />
                <Line label="Rescheduled" value={sum((m) => m.presentationDetail?.rescheduled)} />
                <Line label="Converted" value={presConv} tone="text-emerald-600" />
                <Line label="Pending decision" value={sum((m) => m.presentationDetail?.pending)} tone="text-amber-600" />
                <Line label="Presentation → closing" value={`${pct(presConv, presDone)}%`} />
              </div>
              <p className="eyebrow mb-2 mt-4">Customer visits</p>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <Line label="Scheduled" value={sum((m) => m.visitDetail?.scheduled)} />
                <Line label="Completed" value={visitsDone} />
                <Line label="Upcoming" value={sum((m) => m.visitDetail?.upcoming)} />
                <Line label="Cancelled" value={sum((m) => m.visitDetail?.cancelled)} />
                <Line label="No show" value={sum((m) => m.visitDetail?.noShow)} tone="text-rose-600" />
                <Line label="Converted" value={sum((m) => m.visitDetail?.converted)} tone="text-emerald-600" />
                <Line label="Revenue from visits" value={inr(sum((m) => m.visitDetail?.revenue))} tone="text-brand-700" />
              </div>
              {team.filter((m) => m.visitTrack).length > 0 && (
                <>
                  <p className="eyebrow mb-2 mt-4">Live on the field</p>
                  <ul className="space-y-2">
                    {team.filter((m) => m.visitTrack).map((m) => (
                      <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-soft px-3.5 py-2.5 text-sm">
                        <Avatar name={m.name} size="sm" />
                        <span className="font-bold text-ink-900">{m.name.split(' ')[0]}</span>
                        <span className="text-ink-500">{m.visitTrack.place}</span>
                        <span className="ml-auto flex items-center gap-1.5">
                          {['Scheduled', 'En Route', 'Reached', 'Meeting', 'Completed'].map((st) => (
                            <span
                              key={st}
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                st === m.visitTrack.stage ? 'bg-sky-500 text-white' : 'bg-white text-ink-400'
                              }`}
                            >
                              {st}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Block>

            <Block title="Sales and closings" note="Today, this month and how it splits" wide>
              <div className="grid gap-5 lg:grid-cols-3">
                <div>
                  <p className="eyebrow mb-2">Closings</p>
                  <Line label="Today's sales" value={sum((m) => m.salesDetail?.today)} />
                  <Line label="Sales this month" value={sum((m) => m.salesDetail?.mtd)} />
                  <Line label="Total closings" value={closings} tone="text-emerald-600" />
                  <Line label="Pending closings" value={sum((m) => m.salesDetail?.pending)} tone="text-amber-600" />
                  <Line label="Cancelled" value={sum((m) => m.salesDetail?.cancelled)} />
                  <Line label="Conversion rate" value={`${pct(closings, leads)}%`} />
                  <Line label="Average ticket" value={inr(Math.round(revenue / Math.max(1, closings)))} />
                  <Line label="Best salesperson" value={ranked[0]?.name.split(' ')[0] || '—'} tone="text-brand-700" />
                </div>
                <div>
                  <p className="eyebrow mb-2">Membership-wise</p>
                  <Line label="Silver" value={sum((m) => m.salesDetail?.byPlan?.Silver)} />
                  <Line label="Gold" value={sum((m) => m.salesDetail?.byPlan?.Gold)} />
                  <Line label="Platinum" value={sum((m) => m.salesDetail?.byPlan?.Platinum)} />
                  <Line label="Diamond" value={sum((m) => m.salesDetail?.byPlan?.Diamond)} />
                </div>
                <div>
                  <p className="eyebrow mb-2">Revenue</p>
                  <Line label="Today" value={inr(sum((m) => m.revenueDetail?.today))} />
                  <Line label="This month" value={inr(revenue)} tone="text-brand-700" />
                  <Line label="Previous month" value={inr(sum((m) => m.revenueDetail?.previous))} />
                  <Line label="Collected" value={inr(collected)} tone="text-emerald-600" />
                  <Line label="Pending payment" value={inr(sum((m) => m.revenueDetail?.pending))} tone="text-amber-600" />
                  <Line label="Outstanding" value={inr(outstanding)} tone={outstanding ? 'text-rose-600' : ''} />
                  <Line label="Refund" value={inr(sum((m) => m.revenueDetail?.refund))} />
                  <p className="eyebrow mb-2 mt-4">Sources</p>
                  <Line label="Membership" value={inr(sum((m) => m.revenueDetail?.sources?.Membership))} />
                  <Line label="Booking" value={inr(sum((m) => m.revenueDetail?.sources?.Booking))} />
                  <Line label="Add-ons" value={inr(sum((m) => m.revenueDetail?.sources?.Addons))} />
                </div>
              </div>
            </Block>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Targets, productivity score and ranking (columns M, N, P)            */}
      {/* ==================================================================== */}
      {section === 'Targets & ranking' && (
        <div className="mt-5 space-y-5">
          <Block title="Target vs achievement" note={`Day ${dayOfMonth} of ${daysInMonth}`}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div>
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="num font-display text-4xl font-extrabold leading-none text-ink-900">{inr(revenue)}</span>
                  <span className="text-sm text-ink-500">of {inr(target)} monthly target</span>
                </p>
                <Bar className="mt-3 h-3" pct={achievement} tone={achievement >= 100 ? 'bg-emerald-500' : 'bg-brand-500'} />
                <p className="mt-2 text-sm text-ink-500">
                  <b className={`num ${achievement >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{achievement}%</b> achieved ·
                  gap <b className="num text-ink-800">{inr(Math.max(0, target - revenue))}</b>
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Stat label="Days completed" value={dayOfMonth} />
                  <Stat label="Days remaining" value={daysLeft} />
                  <Stat label="Required daily sales" value={inr(requiredDaily)} tone="text-amber-600" />
                  <Stat label="Projected closing" value={inr(projected)} tone={projected >= target ? 'text-emerald-600' : 'text-rose-600'} />
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2">Every employee against their target</p>
                <ul className="space-y-3">
                  {[...team].filter((m) => m.target > 0).sort((a, b) => pct(b.revenue, b.target) - pct(a.revenue, a.target)).map((m) => (
                    <li key={m.id}>
                      <p className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-semibold text-ink-700">{m.name}</span>
                        <span className="num shrink-0 text-ink-500">
                          {inr(m.revenue || 0)} / {shortInr(m.target)} ·{' '}
                          <b className={pct(m.revenue, m.target) >= 100 ? 'text-emerald-600' : 'text-ink-900'}>{pct(m.revenue, m.target)}%</b>
                        </span>
                      </p>
                      <Bar className="mt-1.5" pct={pct(m.revenue, m.target)} tone={pct(m.revenue, m.target) >= 100 ? 'bg-emerald-500' : 'bg-brand-500'} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Block>

          <div className="grid gap-5 xl:grid-cols-2">
            <Block
              title="Team ranking"
              note="The leaderboard management runs the desk from"
              action={
                <div className="seg">
                  {['Today', 'This week', 'This month', 'Custom'].map((w) => (
                    <button key={w} onClick={() => setRankWhen(w)} className={`seg-item ${rankWhen === w ? 'seg-item-on' : ''}`}>{w}</button>
                  ))}
                </div>
              }
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <select className="input h-9 w-auto py-0 text-xs" value={rankTeam} onChange={(e) => setRankTeam(e.target.value)}>
                  <option value="All">All teams</option>
                  {[...new Set(team.map((m) => m.department).filter(Boolean))].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select className="input h-9 w-auto py-0 text-xs" value={rankRole} onChange={(e) => setRankRole(e.target.value)}>
                  <option value="All">All designations</option>
                  {[...new Set(team.map((m) => m.role).filter(Boolean))].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {[
                  ['revenue', 'Revenue'], ['closings', 'Closings'], ['conversion', 'Conversion'],
                  ['presentations', 'Presentations'], ['visits', 'Visits'], ['followUps', 'Follow-ups'],
                  ['productivity', 'Productivity'], ['attendance', 'Attendance'],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setRankBy(k)}
                    className={`chip border ${rankBy === k ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-900/10 bg-white text-ink-600 hover:text-ink-900'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ol className="space-y-1.5">
                {ranked
                  .filter((m) => rankTeam === 'All' || m.department === rankTeam)
                  .filter((m) => rankRole === 'All' || m.role === rankRole)
                  .map((m, i) => (
                  <li key={m.id}>
                    <button onClick={() => setViewing(m)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-surface-soft">
                      <span className={`num grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${
                        i === 0 ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-white shadow-xs'
                        : i === 1 ? 'bg-ink-900/[0.08] text-ink-700'
                        : i === 2 ? 'bg-orange-100 text-orange-700'
                        : 'bg-surface-soft text-ink-400'}`}>
                        {i === 0 ? <Trophy size={14} /> : i + 1}
                      </span>
                      <Avatar name={m.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                        <span className="num block truncate text-xs text-ink-500">
                          {m.bookings ?? 0} closings · {pct(m.presentationDetail?.converted || 0, m.presentationDetail?.completed)}% conversion · score {m.productivity ?? 0}
                        </span>
                      </span>
                      <span className="num shrink-0 text-sm font-bold text-brand-700">{m.revenue ? inr(m.revenue) : '—'}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </Block>

            <Block title="Productivity score" note="CRM-generated from what the employee actually did">
              <ul className="space-y-2.5">
                {[...team].sort((a, b) => (b.productivity || 0) - (a.productivity || 0)).map((m) => {
                  const band = scoreBand(m.productivity ?? 0);
                  return (
                    <li key={m.id} className="flex items-center gap-3 rounded-xl border border-ink-900/[0.07] px-3.5 py-2.5">
                      <Ring value={m.productivity ?? 0} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                        <span className="block truncate text-xs text-ink-500">{m.role}</span>
                      </span>
                      <Badge tone={band.tone}>{band.label}</Badge>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 rounded-xl bg-surface-soft px-4 py-3">
                <p className="eyebrow mb-2">How the score is built</p>
                <div className="grid gap-x-8 sm:grid-cols-2">
                  <Line label="Attendance" value="10" />
                  <Line label="Calls" value="15" />
                  <Line label="Connected calls" value="10" />
                  <Line label="Follow-ups" value="15" />
                  <Line label="Presentations" value="15" />
                  <Line label="Visits" value="10" />
                  <Line label="Closings" value="20" />
                  <Line label="CRM discipline" value="5" />
                </div>
                <p className="mt-2 text-xs text-ink-500">
                  Closings carry the most weight, so activity alone cannot inflate a score.
                </p>
              </div>
            </Block>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Tasks (column S)                                                     */}
      {/* ==================================================================== */}
      {section === 'Tasks' && (
        <div className="mt-5 space-y-5">
          <Block title="Today's tasks" note={`${tasksTotal} total · ${tasksDone} completed · ${tasksPending} pending · ${tasksOverdue} overdue`}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <Stat label="Total" value={tasksTotal} />
              <Stat label="Completed" value={tasksDone} tone="text-emerald-600" />
              <Stat label="Pending" value={tasksPending} tone="text-amber-600" />
              <Stat label="Overdue" value={tasksOverdue} tone="text-rose-600" />
              <Stat label="In progress" value={tasksProgress} tone="text-sky-600" />
              <Stat label="Cancelled / rescheduled" value={`${tasksCancelled} / ${tasksResched}`} />
            </div>
          </Block>

          <Block
            title="Task list"
            note="Every task on the desk, with the columns the sheet asks for"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <select className="input h-9 w-auto py-0 text-xs" value={taskWho} onChange={(e) => setTaskWho(e.target.value)}>
                  <option value="All">Everyone</option>
                  {[...new Set(tasks.map((t) => t.owner))].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <button className="btn-action btn-sm" onClick={() => act('task', { type: 'Call', title: 'Create task' })}><ClipboardPlus size={13} /> Create task</button>
              </div>
            }
          >
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr>
                    {['Task ID', 'Task', 'Type', 'Customer', 'Lead', 'Assigned to', 'Created', 'Due', 'Priority', 'Status', 'Last action', 'Next action'].map((h) => (
                      <th key={h} className="th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taskRows.map((t) => (
                    <tr key={t.id} className="border-b border-ink-900/[0.05] transition hover:bg-surface-soft">
                      <td className="td num font-bold text-ink-900">{t.id}</td>
                      <td className="td">
                        <span className="block max-w-[240px] truncate font-semibold text-ink-800">{t.title}</span>
                        {t.note && <span className="block max-w-[240px] truncate text-xs text-ink-400">{t.note}</span>}
                      </td>
                      <td className="td">{t.type}</td>
                      <td className="td">{t.customer}</td>
                      <td className="td num text-ink-500">{t.lead || '—'}</td>
                      <td className="td font-semibold text-ink-800">{t.owner}</td>
                      <td className="td num text-ink-500">{t.created || '—'}</td>
                      <td className="td num">{t.due}</td>
                      <td className="td"><Badge tone={priorityTone[t.priority] || 'slate'}>{t.priority}</Badge></td>
                      <td className="td">
                        <Badge tone={taskTone[t.status] || (t.bucket === 'overdue' ? 'rose' : t.bucket === 'done' ? 'green' : 'sky')} dot>
                          {t.status || t.bucket}
                        </Badge>
                      </td>
                      <td className="td text-ink-500">{t.lastAction || '—'}</td>
                      <td className="td text-ink-500">{t.nextAction || '—'}</td>
                    </tr>
                  ))}
                  {taskRows.length === 0 && (
                    <tr><td className="td py-10 text-center text-ink-500" colSpan={12}>No tasks for this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Block>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Alerts (column O)                                                    */}
      {/* ==================================================================== */}
      {section === 'Alerts' && (
        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {['critical', 'warning', 'positive'].map((level) => {
            const style = noticeStyle[level];
            const items = lane(level);
            return (
              <Block key={level} title={style.lane} note={`${items.length} on the desk`}>
                <ul className="space-y-2">
                  {items.map((n, i) => (
                    <li key={`${n.member.id}-${n.text}-${i}`} className="rounded-xl border border-ink-900/[0.07] px-3.5 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${style.chip}`}>
                          <style.icon size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink-800">{n.text}</p>
                          <p className="mt-0.5 truncate text-xs text-ink-500">{n.member.name} · {n.member.empId} · {n.at}</p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <button className="btn-line btn-sm" onClick={() => setViewing(n.member)}><Eye size={13} /> View</button>
                        <button className="btn-line btn-sm" onClick={() => act('task', { member: n.member, type: 'Call', title: `Assign work on this alert`, suggest: n.text })}><UserCheck size={13} /> Assign</button>
                        {level !== 'positive' && (
                          <button
                            className="btn-line-danger btn-sm"
                            onClick={() =>
                              update(
                                'team',
                                n.member.id,
                                {
                                  notices: (n.member.notices || []).filter((x) => x.text !== n.text),
                                  alerts: Math.max(0, Number(n.member.alerts || 0) - 1),
                                },
                                { message: 'Alert resolved' }
                              )
                            }
                          >
                            <CheckCircle2 size={13} /> Resolve
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                  {items.length === 0 && (
                    <li className="rounded-xl border border-dashed border-ink-900/[0.12] px-4 py-10 text-center text-sm text-ink-500">
                      Nothing here.
                    </li>
                  )}
                </ul>
              </Block>
            );
          })}
        </div>
      )}

      {action && (
        <TeamActions
          action={action.kind}
          context={action.context}
          store={store}
          onClose={() => setAction(null)}
        />
      )}

      {/* Employee detail drawer (column T) */}
      {viewing && (
        <MemberDetails
          member={viewing}
          list={rows.length ? rows : team}
          rank={rankOf(viewing)}
          workload={workloadOf(viewing)}
          tasks={tasksOf(viewing)}
          onClose={() => setViewing(null)}
          onJump={(i) => setViewing((rows.length ? rows : team)[i])}
          onEdit={openEdit}
        />
      )}

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.name}` : 'Invite team member'}
        subtitle={editing ? editing.empId || editing.id : 'They receive an email invite to join the workspace'}
        fields={fields}
        initial={editing || { role: 'Travel Consultant', status: 'Invited', live: 'Not logged in', attendance: 'Present' }}
        submitLabel={editing ? 'Save changes' : 'Send invite'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('team', confirm.id)}
        title="Remove team member?"
        message={`${confirm?.name} loses access to this workspace immediately. Their records stay assigned.`}
        confirmLabel="Remove"
      />
    </>
  );
}
