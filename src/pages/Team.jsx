import { useState } from 'react';
import {
  UserPlus,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  ShieldCheck,
  Send,
  AlertTriangle,
  CheckCircle2,
  Info,
  Trophy,
  Search,
  Download,
  ClipboardPlus,
  Shuffle,
  Clock,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import MemberDetails from '../components/team/MemberDetails.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, liveStatuses, attendanceStates } from '../data/mockData.js';
import { downloadCsv } from '../lib/csv.js';

const ROLES = [
  'Owner',
  'Senior Travel Consultant',
  'Travel Consultant',
  'Visa & Documentation',
  'Accounts',
];
const ACCOUNT = ['Active', 'Invited', 'Disabled'];

const liveDot = {
  Online: 'bg-emerald-500',
  Idle: 'bg-amber-400',
  'In meeting': 'bg-violet-500',
  'On customer visit': 'bg-sky-500',
  'On break': 'bg-amber-400',
  Offline: 'bg-ink-900/25',
  Leave: 'bg-ink-900/25',
  'Not logged in': 'bg-ink-900/25',
};
const liveTone = {
  Online: 'green',
  Idle: 'amber',
  'In meeting': 'violet',
  'On customer visit': 'sky',
  'On break': 'amber',
  Offline: 'slate',
  Leave: 'slate',
  'Not logged in': 'slate',
};
const attendanceTone = {
  Present: 'green',
  'Half day': 'amber',
  Late: 'amber',
  'Work from home': 'sky',
  'Field visit': 'sky',
  Leave: 'slate',
  Absent: 'rose',
  'Not logged in': 'slate',
};
const noticeIcon = {
  critical: { icon: AlertTriangle, tone: 'bg-rose-100 text-rose-700', label: 'Critical' },
  warning: { icon: Info, tone: 'bg-amber-100 text-amber-700', label: 'Warning' },
  positive: { icon: CheckCircle2, tone: 'bg-emerald-100 text-emerald-700', label: 'Positive' },
};
const digits = (phone) => String(phone).replace(/[^\d]/g, '');

/** Low / normal / high / overloaded, from leads, follow-ups and open tasks. */
function workloadOf(m) {
  const load =
    Number(m.leads || 0) +
    Number(m.followUps || 0) +
    Number(m.tasksTotal || 0) -
    Number(m.tasksDone || 0);
  if (load >= 100) return { label: 'Overloaded', tone: 'rose', load };
  if (load >= 61) return { label: 'High', tone: 'rose', load };
  if (load >= 31) return { label: 'Normal', tone: 'amber', load };
  return { label: 'Low', tone: 'green', load };
}

/** One counter in the card's work strip. */
function Tick({ label, value, tone }) {
  return (
    <div className="text-center">
      <p className={`num font-display text-lg font-extrabold ${tone || 'text-ink-900'}`}>{value ?? 0}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

/**
 * Team Status as the client's sheet describes it: who is on and what they are
 * doing, today's attendance across the desk, the alerts management should act
 * on, the leaderboard, and a card per person that opens the full drawer.
 */
export default function Team() {
  const { team, tasks, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [query, setQuery] = useState('');
  const [lens, setLens] = useState('All');
  const [rankBy, setRankBy] = useState('revenue');

  // Ranking is worked out here rather than stored, so it always agrees.
  const rankKey = {
    revenue: (m) => Number(m.revenue || 0),
    closings: (m) => Number(m.bookings || 0),
    productivity: (m) => Number(m.productivity || 0),
    conversion: (m) =>
      m.presentationDetail?.completed
        ? (m.presentationDetail.converted / m.presentationDetail.completed) * 100
        : 0,
  }[rankBy];
  const ranked = [...team].sort((a, b) => rankKey(b) - rankKey(a));
  const rankOf = (m) => (rankKey(m) > 0 ? ranked.findIndex((x) => x.id === m.id) + 1 : 0);

  const tasksOf = (m) => tasks.filter((t) => t.owner === m.name.split(' ')[0]);

  // -- Today's attendance across the desk ------------------------------------
  const count = (fn) => team.filter(fn).length;
  const attendance = [
    { label: 'Total', value: team.length },
    { label: 'Present', value: count((m) => m.attendance === 'Present'), tone: 'text-emerald-600' },
    { label: 'Late', value: count((m) => Number(m.day?.lateBy || 0) > 0), tone: 'text-amber-600' },
    { label: 'Half day', value: count((m) => m.attendance === 'Half day') },
    { label: 'On leave', value: count((m) => m.attendance === 'Leave') },
    { label: 'Field', value: count((m) => m.day?.mode === 'Field') },
    { label: 'Work from home', value: count((m) => m.day?.mode === 'WFH') },
    { label: 'Not logged in', value: count((m) => m.live === 'Not logged in') },
  ];

  const online = count((m) => m.live === 'Online');
  const openTasks = team.reduce(
    (s, m) => s + (Number(m.tasksTotal || 0) - Number(m.tasksDone || 0)),
    0
  );
  const overdueTasks = team.reduce((s, m) => s + Number(m.taskDetail?.overdue || 0), 0);
  const doneTasks = team.reduce((s, m) => s + Number(m.tasksDone || 0), 0);
  const allTasks = team.reduce((s, m) => s + Number(m.tasksTotal || 0), 0);

  // Every alert on the desk, most serious first.
  const order = { critical: 0, warning: 1, positive: 2 };
  const notices = team
    .flatMap((m) => (m.notices || []).map((n) => ({ ...n, member: m })))
    .sort((a, b) => order[a.level] - order[b.level]);

  const lenses = [
    { key: 'All', label: 'Everyone', count: team.length },
    { key: 'Online', label: 'Online', count: online },
    { key: 'Field', label: 'On the field', count: count((m) => m.day?.mode === 'Field') },
    { key: 'Alerts', label: 'Needs attention', count: count((m) => (m.notices || []).some((n) => n.level !== 'positive')) },
    { key: 'Heavy', label: 'High workload', count: count((m) => ['High', 'Overloaded'].includes(workloadOf(m).label)) },
  ];

  const matches = (m) => {
    if (lens === 'Online' && m.live !== 'Online') return false;
    if (lens === 'Field' && m.day?.mode !== 'Field') return false;
    if (lens === 'Alerts' && !(m.notices || []).some((n) => n.level !== 'positive')) return false;
    if (lens === 'Heavy' && !['High', 'Overloaded'].includes(workloadOf(m).label)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [m.name, m.role, m.email, m.phone, m.activity, m.empId].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  };

  const rows = team.filter(matches);

  const exportTeam = () =>
    downloadCsv(
      'smira-club-team-status',
      team.map((m) => ({
        ...m,
        login: m.day?.login || '',
        working: m.day?.working || '',
        mode: m.day?.mode || '',
        tasks: `${m.tasksDone}/${m.tasksTotal}`,
        workload: workloadOf(m).label,
        rank: rankOf(m) || '',
        achievement: m.target ? `${Math.round((m.revenue / m.target) * 100)}%` : '',
      })),
      [
        { key: 'empId', header: 'Employee ID' },
        { key: 'name', header: 'Member' },
        { key: 'role', header: 'Designation' },
        { key: 'live', header: 'Live status' },
        { key: 'attendance', header: 'Attendance' },
        { key: 'login', header: 'Login' },
        { key: 'working', header: 'Working hours' },
        { key: 'mode', header: 'Working from' },
        { key: 'activity', header: 'Current activity' },
        { key: 'lastActive', header: 'Last active' },
        { key: 'tasks', header: "Today's tasks" },
        { key: 'leads', header: 'Lead workload' },
        { key: 'followUps', header: 'Follow-ups' },
        { key: 'calls', header: 'Calls' },
        { key: 'presentations', header: 'Presentations' },
        { key: 'visits', header: 'Customer visits' },
        { key: 'bookings', header: 'Sales / closings' },
        { key: 'revenue', header: 'Revenue' },
        { key: 'achievement', header: 'Target vs achievement' },
        { key: 'productivity', header: 'Productivity score' },
        { key: 'rank', header: 'Team ranking' },
        { key: 'workload', header: 'Workload level' },
      ]
    );

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'empId', label: 'Employee ID', type: 'text', placeholder: 'EMP-105' },
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
        enquiries: 0, bookings: 0, revenue: 0, leads: 0, followUps: 0,
        calls: 0, presentations: 0, visits: 0, tasksDone: 0, tasksTotal: 0,
        alerts: 0, lastActive: 'never', notices: [],
        day: { login: '—', logout: '—', working: '0h', breaks: '0m', idle: '0m', lateBy: 0, mode: 'Office', source: 'Web app', regularisation: 'None pending', attendancePct: 0 },
      });
  };

  const openEdit = (m) => {
    setViewing(null);
    setEditing(m);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader title="Team status" subtitle="Who is on, what they are doing, and how they are tracking">
        <button className="btn-ghost" onClick={exportTeam}>
          <Download size={16} /> Export
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <UserPlus size={16} /> Invite member
        </button>
      </PageHeader>

      {/* Today's attendance, one line */}
      <section className="card px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-extrabold text-ink-900">Today&rsquo;s attendance</h2>
          <p className="num text-sm text-ink-500">
            {online} of {team.length} online · {doneTasks}/{allTasks} tasks done
            {overdueTasks > 0 && <span className="ml-1.5 font-bold text-rose-600">· {overdueTasks} overdue</span>}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {attendance.map((a) => (
            <div key={a.label} className="rounded-xl bg-surface-soft px-3.5 py-3 text-center">
              <p className={`num font-display text-xl font-extrabold ${a.tone || 'text-ink-900'}`}>{a.value}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{a.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {/* Alerts management should act on */}
        <section className="card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-extrabold text-ink-900">Alerts</h2>
            <p className="text-sm text-ink-500">
              {notices.filter((n) => n.level === 'critical').length} critical ·{' '}
              {notices.filter((n) => n.level === 'warning').length} warning ·{' '}
              {notices.filter((n) => n.level === 'positive').length} positive
            </p>
          </div>
          <ul className="mt-4 space-y-2">
            {notices.map((n) => {
              const { icon: Icon, tone, label } = noticeIcon[n.level] || noticeIcon.warning;
              return (
                <li
                  key={`${n.member.id}-${n.text}`}
                  className="flex items-start gap-3 rounded-xl border border-ink-900/[0.07] px-4 py-3"
                >
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${tone}`}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-800">{n.text}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {label} · {n.member.name} · {n.at}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button className="btn-ghost btn-sm" onClick={() => setViewing(n.member)}>
                      View
                    </button>
                    {n.level !== 'positive' && (
                      <button className="btn-ghost btn-sm" onClick={() => toast('Alert marked resolved')}>
                        Resolve
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
            {notices.length === 0 && (
              <li className="rounded-xl border border-dashed border-ink-900/[0.12] px-4 py-8 text-center text-sm text-ink-500">
                Nothing needs attention right now.
              </li>
            )}
          </ul>
        </section>

        {/* Leaderboard */}
        <section className="card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-extrabold text-ink-900">Team ranking</h2>
            <select
              className="input h-8 w-auto py-0 text-xs"
              value={rankBy}
              onChange={(e) => setRankBy(e.target.value)}
            >
              <option value="revenue">By revenue</option>
              <option value="closings">By closings</option>
              <option value="conversion">By conversion</option>
              <option value="productivity">By productivity</option>
            </select>
          </div>
          <ul className="mt-4 space-y-2.5">
            {ranked.map((m, i) => (
              <li key={m.id}>
                <button
                  onClick={() => setViewing(m)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-surface-soft"
                >
                  <span
                    className={`num grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                      i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-surface-soft text-ink-500'
                    }`}
                  >
                    {i === 0 ? <Trophy size={13} /> : i + 1}
                  </span>
                  <Avatar name={m.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                    <span className="num block text-xs text-ink-500">
                      {m.bookings ?? 0} closings · {m.productivity ?? 0} score
                    </span>
                  </span>
                  <span className="num shrink-0 text-sm font-bold text-brand-700">
                    {m.revenue ? inr(m.revenue) : '—'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Search and the ways the desk looks at itself */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-10"
            placeholder="Search the team…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {lenses.map((l) => (
            <button
              key={l.key}
              onClick={() => setLens(l.key)}
              className={`chip ${
                lens === l.key ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              {l.label}
              <span className="num ml-1.5 text-ink-400">{l.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* One card per person */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {rows.map((m) => {
          const w = workloadOf(m);
          const rank = rankOf(m);
          const d = m.day || {};
          const flagged = (m.notices || []).filter((n) => n.level !== 'positive').length;
          return (
            <article
              key={m.id}
              onClick={() => setViewing(m)}
              className="card cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-start gap-3">
                <span className="relative shrink-0">
                  <Avatar name={m.name} />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${
                      liveDot[m.live] || liveDot.Offline
                    }`}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-extrabold text-ink-900">{m.name}</p>
                      <p className="truncate text-sm text-ink-500">
                        {m.role}
                        <span className="num ml-1.5 text-xs text-ink-400">{m.empId || m.id}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {rank === 1 && (
                        <Badge tone="amber">
                          <Trophy size={11} /> #1
                        </Badge>
                      )}
                      <a href={`tel:${digits(m.phone)}`} title="Call" className="icon-btn h-8 w-8">
                        <Phone size={14} />
                      </a>
                      <a
                        href={`https://wa.me/${digits(m.phone)}`}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp"
                        className="icon-btn h-8 w-8 hover:border-emerald-400 hover:text-emerald-600"
                      >
                        <MessageCircle size={14} />
                      </a>
                      <RowMenu
                        items={[
                          { label: 'Assign a task', icon: ClipboardPlus, onClick: () => toast(`Task assigned to ${m.name.split(' ')[0]}`) },
                          { label: 'Rebalance workload', icon: Shuffle, onClick: () => toast('Pick the leads to move across') },
                          { label: 'Send a reminder', icon: Send, onClick: () => toast(`Reminder sent to ${m.name.split(' ')[0]}`) },
                          { label: 'Edit member', icon: Pencil, onClick: () => openEdit(m) },
                          {
                            label: m.status === 'Disabled' ? 'Enable access' : 'Disable access',
                            icon: ShieldCheck,
                            onClick: () => update('team', m.id, { status: m.status === 'Disabled' ? 'Active' : 'Disabled' }),
                          },
                          { label: 'Remove', icon: Trash2, danger: true, onClick: () => setConfirm(m) },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone={liveTone[m.live] || 'slate'} dot>
                      {m.live}
                    </Badge>
                    <Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge>
                    <Badge tone={w.tone}>{w.label} load</Badge>
                    {flagged > 0 && (
                      <Badge tone="rose" dot>
                        <AlertTriangle size={11} /> {flagged}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* What they are on right now */}
              <div className="mt-4 rounded-xl bg-surface-soft px-3.5 py-2.5">
                <p className="truncate text-sm font-semibold text-ink-800">
                  {m.activityType || 'Idle'}
                  <span className="ml-1.5 font-normal text-ink-600">· {m.activity || 'nothing on'}</span>
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> since {m.activityStarted || '—'}
                  </span>
                  <span>last active {m.lastActive}</span>
                  <span>
                    login {d.login || '—'} · {d.working || '0h'}
                  </span>
                </p>
              </div>

              {/* Everything the sheet counts */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-ink-900/[0.07] py-3 sm:grid-cols-6">
                <Tick label="Leads" value={m.leads} />
                <Tick label="Follow" value={m.followUps} />
                <Tick label="Calls" value={m.calls} />
                <Tick label="Present." value={m.presentations} />
                <Tick label="Visits" value={m.visits} />
                <Tick label="Closed" value={m.bookings} tone="text-emerald-600" />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-ink-500">
                  Revenue <b className="num text-brand-700">{m.revenue ? inr(m.revenue) : '—'}</b>
                </span>
                <span className="text-ink-500">
                  Score{' '}
                  <b
                    className={`num ${
                      m.productivity >= 90
                        ? 'text-emerald-600'
                        : m.productivity >= 75
                          ? 'text-sky-600'
                          : m.productivity >= 60
                            ? 'text-amber-600'
                            : 'text-rose-600'
                    }`}
                  >
                    {m.productivity ?? 0}
                  </b>
                  {rank > 0 && <span className="num ml-2 text-ink-400">· #{rank}</span>}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {rows.length === 0 && (
        <div className="card mt-4 border-dashed p-14 text-center text-sm text-ink-500">
          No team member matches this view.
        </div>
      )}

      {viewing && (
        <MemberDetails
          member={viewing}
          list={rows}
          rank={rankOf(viewing)}
          workload={workloadOf(viewing)}
          tasks={tasksOf(viewing)}
          onClose={() => setViewing(null)}
          onJump={(i) => setViewing(rows[i])}
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
        initial={
          editing || { role: 'Travel Consultant', status: 'Invited', live: 'Not logged in', attendance: 'Present' }
        }
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
