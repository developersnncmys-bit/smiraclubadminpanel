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
  ClipboardList,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr } from '../data/mockData.js';

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

const num = (v) => <span className="num font-semibold text-ink-800">{v ?? 0}</span>;

/**
 * Team Status as the client keeps it — every column from their sheet, in
 * their order, on one scrollable table. The tasks column opens the person's
 * task list rather than trying to fit it in a cell.
 */
export default function Team() {
  const { team, tasks, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [tasksFor, setTasksFor] = useState(null);

  // Ranking follows revenue rather than being stored.
  const ranked = [...team]
    .filter((m) => Number(m.revenue || 0) > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .map((m) => m.id);

  const tasksOf = (m) => tasks.filter((t) => t.owner === m.name.split(' ')[0]);

  const online = team.filter((m) => m.live === 'Online').length;
  const present = team.filter((m) => m.attendance === 'Present').length;
  const openTasks = team.reduce(
    (s, m) => s + (Number(m.tasksTotal || 0) - Number(m.tasksDone || 0)),
    0
  );
  const teamAlerts = team.reduce((s, m) => s + Number(m.alerts || 0), 0);

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

  // Columns follow the client's sheet, left to right.
  const columns = [
    {
      key: 'name',
      header: 'Member',
      className: 'whitespace-nowrap',
      render: (m) => (
        <div className="flex items-center gap-3">
          <span className="relative shrink-0">
            <Avatar name={m.name} size="sm" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${
                liveDot[m.live] || liveDot.Offline
              }`}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900">{m.name}</p>
            <p className="truncate text-xs text-ink-500">{m.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'live',
      header: 'Live status',
      render: (m) => (
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-ink-700">
          <span className={`h-2 w-2 rounded-full ${liveDot[m.live] || liveDot.Offline}`} />
          {m.live}
        </span>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (m) => <Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge>,
    },
    {
      key: 'activity',
      header: 'Current activity',
      render: (m) => (
        <p className="max-w-[220px] truncate text-sm text-ink-700" title={m.activity}>
          {m.activity || '—'}
        </p>
      ),
    },
    {
      key: 'lastActive',
      header: 'Last active',
      render: (m) => <span className="whitespace-nowrap text-sm text-ink-500">{m.lastActive}</span>,
    },
    {
      key: 'tasksDone',
      header: "Today's tasks",
      csv: (m) => `${m.tasksDone}/${m.tasksTotal}`,
      render: (m) => {
        const pct = m.tasksTotal ? Math.round((m.tasksDone / m.tasksTotal) * 100) : 0;
        return (
          <div className="w-[92px]">
            <p className="num text-sm font-semibold text-ink-800">
              {m.tasksDone}/{m.tasksTotal}
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    { key: 'leads', header: 'Lead workload', render: (m) => num(m.leads) },
    { key: 'followUps', header: 'Follow-ups', render: (m) => num(m.followUps) },
    { key: 'calls', header: 'Calls', render: (m) => num(m.calls) },
    { key: 'presentations', header: 'Presentations', render: (m) => num(m.presentations) },
    { key: 'visits', header: 'Customer visits', render: (m) => num(m.visits) },
    {
      key: 'bookings',
      header: 'Sales / closings',
      render: (m) => <span className="num font-bold text-ink-900">{m.bookings ?? 0}</span>,
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (m) => (
        <span className="num whitespace-nowrap font-bold text-brand-700">
          {m.revenue ? inr(m.revenue) : '—'}
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Target vs achievement',
      csv: (m) => (m.target ? `${Math.round((m.revenue / m.target) * 100)}%` : ''),
      render: (m) => {
        if (!m.target) return <span className="text-ink-400">No target</span>;
        const pct = Math.round((m.revenue / m.target) * 100);
        return (
          <div className="w-[140px]">
            <p className="flex items-baseline justify-between gap-2 text-xs">
              <span className="num font-bold text-ink-900">{pct}%</span>
              <span className="text-ink-500">of {shortInr(m.target)}</span>
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <div
                className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'productivity',
      header: 'Productivity',
      render: (m) => (
        <Badge tone={m.productivity >= 80 ? 'green' : m.productivity >= 60 ? 'amber' : 'slate'}>
          {m.productivity ?? 0}
        </Badge>
      ),
    },
    {
      key: 'alerts',
      header: 'Alerts',
      render: (m) =>
        m.alerts > 0 ? (
          <Badge tone="rose" dot>
            <AlertTriangle size={11} /> {m.alerts}
          </Badge>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      key: 'rank',
      header: 'Team ranking',
      csv: (m) => (ranked.indexOf(m.id) >= 0 ? `#${ranked.indexOf(m.id) + 1}` : ''),
      render: (m) => {
        const i = ranked.indexOf(m.id);
        if (i < 0) return <span className="text-ink-400">—</span>;
        return i === 0 ? (
          <Badge tone="amber">
            <Trophy size={11} /> #1
          </Badge>
        ) : (
          <span className="num font-bold text-ink-700">#{i + 1}</span>
        );
      },
    },
    {
      key: 'workload',
      header: 'Workload level',
      csv: (m) => workloadOf(m).label,
      render: (m) => {
        const w = workloadOf(m);
        return <Badge tone={w.tone}>{w.label}</Badge>;
      },
    },
    {
      key: 'tasks',
      header: 'Tasks',
      csv: (m) => tasksOf(m).length,
      render: (m) => {
        const list = tasksOf(m);
        return (
          <button
            onClick={() => setTasksFor(m)}
            disabled={list.length === 0}
            className="btn-ghost btn-sm whitespace-nowrap disabled:opacity-40"
          >
            <ClipboardList size={13} /> {list.length ? `View ${list.length}` : 'None'}
          </button>
        );
      },
    },
    {
      key: 'actions',
      header: 'Quick actions',
      render: (m) => (
        <div className="flex justify-end gap-1.5">
          <a href={`tel:${digits(m.phone)}`} title="Call" className="icon-btn hover:border-emerald-400 hover:text-emerald-600">
            <Phone size={14} />
          </a>
          <a
            href={`https://wa.me/${digits(m.phone)}`}
            target="_blank"
            rel="noreferrer"
            title="WhatsApp"
            className="icon-btn hover:border-emerald-400 hover:text-emerald-600"
          >
            <MessageCircle size={14} />
          </a>
          <RowMenu
            items={[
              { label: 'Edit member', icon: Pencil, onClick: () => { setEditing(m); setFormOpen(true); } },
              ...(m.status === 'Invited'
                ? [{ label: 'Resend invite', icon: Send, onClick: () => toast(`Invite resent to ${m.email}`) }]
                : []),
              {
                label: m.status === 'Disabled' ? 'Enable access' : 'Disable access',
                icon: ShieldCheck,
                onClick: () =>
                  update('team', m.id, { status: m.status === 'Disabled' ? 'Active' : 'Disabled' }),
              },
              { label: 'Remove', icon: Trash2, danger: true, onClick: () => setConfirm(m) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Team status" subtitle="Who is on, what they are doing, and how they are tracking">
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <DataTable
        columns={columns}
        rows={team}
        selectable={false}
        pageSize={10}
        searchKeys={['name', 'email', 'phone', 'role', 'activity']}
        searchPlaceholder="Search the team…"
        filters={[
          { key: 'live', label: 'Live status', options: LIVE },
          { key: 'attendance', label: 'Attendance', options: ATTENDANCE },
          { key: 'role', label: 'Role', options: ROLES },
        ]}
        exportName="smira-club-team-status"
        emptyLabel="No team members match this view"
      />

      {/* That person's task list */}
      <Modal
        open={Boolean(tasksFor)}
        onClose={() => setTasksFor(null)}
        title={tasksFor ? `${tasksFor.name.split(' ')[0]}'s tasks` : ''}
        subtitle={tasksFor ? `${tasksOf(tasksFor).length} on their list` : ''}
        size="md"
        footer={
          <button className="btn-ghost" onClick={() => setTasksFor(null)}>
            Close
          </button>
        }
      >
        {tasksFor && (
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {tasksOf(tasksFor).map((t) => (
              <li key={t.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-900">{t.title}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {t.customer} · due {t.due}
                    </p>
                  </div>
                  <Badge
                    tone={t.bucket === 'overdue' ? 'rose' : t.bucket === 'done' ? 'green' : 'sky'}
                    dot
                  >
                    {t.bucket}
                  </Badge>
                </div>
              </li>
            ))}
            {tasksOf(tasksFor).length === 0 && (
              <li className="px-4 py-5 text-sm text-ink-500">Nothing assigned right now.</li>
            )}
          </ul>
        )}
      </Modal>

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
