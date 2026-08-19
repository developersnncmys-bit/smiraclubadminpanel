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
  Trophy,
  Search,
  Download,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import MemberDetails from '../components/team/MemberDetails.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr } from '../data/mockData.js';
import { downloadCsv } from '../lib/csv.js';

const ROLES = [
  'Owner',
  'Senior Travel Consultant',
  'Travel Consultant',
  'Visa & Documentation',
  'Accounts',
];
const ACCOUNT = ['Active', 'Invited', 'Disabled'];
const LIVE = ['Online', 'Away', 'Offline'];
const ATTENDANCE = ['Present', 'Half day', 'Leave'];

const liveDot = { Online: 'bg-emerald-500', Away: 'bg-amber-400', Offline: 'bg-ink-900/25' };
const attendanceTone = { Present: 'green', 'Half day': 'amber', Leave: 'slate' };
const digits = (phone) => String(phone).replace(/[^\d]/g, '');

/** Light / balanced / heavy, from open leads plus follow-ups. */
function workloadOf(m) {
  const load = Number(m.leads || 0) + Number(m.followUps || 0);
  if (load >= 20) return { label: 'Heavy', tone: 'rose' };
  if (load >= 10) return { label: 'Balanced', tone: 'amber' };
  if (load > 0) return { label: 'Light', tone: 'green' };
  return { label: 'Free', tone: 'slate' };
}

/** One counter in the card's activity strip. */
function Tick({ label, value, alert }) {
  return (
    <div className="text-center">
      <p className={`num font-display text-lg font-extrabold ${alert ? 'text-rose-600' : 'text-ink-900'}`}>
        {value ?? 0}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

/**
 * Team status as a board of people rather than a nineteen-column table.
 * Each card carries the live picture; the panel behind it holds the rest of
 * the client's sheet — activity, targets, productivity and their task list.
 */
export default function Team() {
  const { team, tasks, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [query, setQuery] = useState('');
  const [lens, setLens] = useState('All');

  // Ranking follows revenue rather than being stored.
  const ranked = [...team]
    .filter((m) => Number(m.revenue || 0) > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .map((m) => m.id);
  const rankOf = (m) => ranked.indexOf(m.id) + 1;

  const tasksOf = (m) => tasks.filter((t) => t.owner === m.name.split(' ')[0]);

  const online = team.filter((m) => m.live === 'Online').length;
  const present = team.filter((m) => m.attendance === 'Present').length;
  const openTasks = team.reduce(
    (s, m) => s + (Number(m.tasksTotal || 0) - Number(m.tasksDone || 0)),
    0
  );
  const teamAlerts = team.reduce((s, m) => s + Number(m.alerts || 0), 0);

  const lenses = [
    { key: 'All', label: 'Everyone', count: team.length },
    { key: 'Online', label: 'Online', count: online },
    { key: 'Present', label: 'Present today', count: present },
    { key: 'Alerts', label: 'Needs attention', count: team.filter((m) => m.alerts > 0).length },
    { key: 'Heavy', label: 'Heavy workload', count: team.filter((m) => workloadOf(m).label === 'Heavy').length },
  ];

  const matches = (m) => {
    if (lens === 'Online' && m.live !== 'Online') return false;
    if (lens === 'Present' && m.attendance !== 'Present') return false;
    if (lens === 'Alerts' && !(m.alerts > 0)) return false;
    if (lens === 'Heavy' && workloadOf(m).label !== 'Heavy') return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [m.name, m.role, m.email, m.phone, m.activity].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  };

  const rows = team.filter(matches);

  const exportTeam = () =>
    downloadCsv(
      'smira-club-team-status',
      team.map((m) => ({
        ...m,
        tasks: `${m.tasksDone}/${m.tasksTotal}`,
        workload: workloadOf(m).label,
        rank: rankOf(m) || '',
        achievement: m.target ? `${Math.round((m.revenue / m.target) * 100)}%` : '',
      })),
      [
        { key: 'name', header: 'Member' },
        { key: 'role', header: 'Role' },
        { key: 'live', header: 'Live status' },
        { key: 'attendance', header: 'Attendance' },
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
        { key: 'alerts', header: 'Alerts' },
        { key: 'rank', header: 'Team ranking' },
        { key: 'workload', header: 'Workload level' },
      ]
    );

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ROLES },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'status', label: 'Account', type: 'select', options: ACCOUNT },
    { name: 'live', label: 'Live status', type: 'select', options: LIVE },
    { name: 'attendance', label: 'Attendance', type: 'select', options: ATTENDANCE },
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
        alerts: 0, lastActive: 'never',
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Online now', value: `${online} of ${team.length}`, tone: 'text-emerald-700' },
          { label: 'Present today', value: present, tone: 'text-ink-900' },
          { label: 'Tasks still open', value: openTasks, tone: 'text-ink-900' },
          { label: 'Alerts on the desk', value: teamAlerts, tone: teamAlerts ? 'text-rose-600' : 'text-ink-900' },
        ].map((s) => (
          <div key={s.label} className="card px-5 py-4">
            <p className="text-sm font-semibold text-ink-500">{s.label}</p>
            <p className={`num mt-1 font-display text-2xl font-extrabold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search on the left, the five ways the desk looks at itself on the right */}
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
                lens === l.key
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:text-ink-900'
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
          return (
            <article
              key={m.id}
              onClick={() => setViewing(m)}
              className="card cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              {/* Who, and what they are on */}
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
                      <p className="truncate font-display text-base font-extrabold text-ink-900">
                        {m.name}
                      </p>
                      <p className="truncate text-sm text-ink-500">{m.role}</p>
                    </div>
                    <div
                      className="flex shrink-0 items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                          { label: 'Edit member', icon: Pencil, onClick: () => openEdit(m) },
                          ...(m.status === 'Invited'
                            ? [{ label: 'Resend invite', icon: Send, onClick: () => toast(`Invite resent to ${m.email}`) }]
                            : []),
                          {
                            label: m.status === 'Disabled' ? 'Enable access' : 'Disable access',
                            icon: ShieldCheck,
                            onClick: () =>
                              update('team', m.id, {
                                status: m.status === 'Disabled' ? 'Active' : 'Disabled',
                              }),
                          },
                          { label: 'Remove', icon: Trash2, danger: true, onClick: () => setConfirm(m) },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone={m.live === 'Online' ? 'green' : m.live === 'Away' ? 'amber' : 'slate'} dot>
                      {m.live}
                    </Badge>
                    <Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge>
                    <Badge tone={w.tone}>{w.label}</Badge>
                    {m.alerts > 0 && (
                      <Badge tone="rose" dot>
                        <AlertTriangle size={11} /> {m.alerts}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 truncate rounded-xl bg-surface-soft px-3.5 py-2.5 text-sm text-ink-700">
                {m.activity || 'Nothing on right now'}
                <span className="ml-2 text-xs text-ink-400">· {m.lastActive}</span>
              </p>

              {/* Everything the sheet counts, in one strip */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-ink-900/[0.07] py-3 sm:grid-cols-6">
                <Tick label="Leads" value={m.leads} />
                <Tick label="Follow" value={m.followUps} />
                <Tick label="Calls" value={m.calls} />
                <Tick label="Itin." value={m.presentations} />
                <Tick label="Visits" value={m.visits} />
                <Tick label="Closed" value={m.bookings} />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-ink-500">
                  Revenue{' '}
                  <b className="num text-brand-700">{m.revenue ? inr(m.revenue) : '—'}</b>
                </span>
                <span className="text-ink-500">
                  Productivity{' '}
                  <b
                    className={`num ${
                      m.productivity >= 80
                        ? 'text-emerald-600'
                        : m.productivity >= 60
                          ? 'text-amber-600'
                          : 'text-ink-700'
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
        subtitle={editing ? editing.id : 'They receive an email invite to join the workspace'}
        fields={fields}
        initial={
          editing || { role: 'Travel Consultant', status: 'Invited', live: 'Offline', attendance: 'Present' }
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
