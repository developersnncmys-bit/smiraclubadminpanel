import { useState } from 'react';
import {
  UserPlus,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  ShieldCheck,
  Send,
  ListTodo,
  Users,
  PhoneCall,
  Presentation,
  MapPin,
  CalendarCheck,
  AlertTriangle,
  Trophy,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
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
const STATUSES = ['Active', 'Invited', 'Disabled'];
const LIVE = ['Online', 'Away', 'Offline'];
const ATTENDANCE = ['Present', 'Half day', 'Leave'];

const liveTone = {
  Online: 'bg-emerald-500',
  Away: 'bg-amber-400',
  Offline: 'bg-ink-900/20',
};
const attendanceTone = { Present: 'green', 'Half day': 'amber', Leave: 'slate' };
const digits = (phone) => String(phone).replace(/[^\d]/g, '');

/** Light / balanced / heavy, from open leads and follow-ups. */
function workloadOf(m) {
  const load = Number(m.leads || 0) + Number(m.followUps || 0);
  if (load >= 20) return { label: 'Heavy', tone: 'rose', pct: 100 };
  if (load >= 10) return { label: 'Balanced', tone: 'amber', pct: 60 };
  if (load > 0) return { label: 'Light', tone: 'green', pct: 30 };
  return { label: 'Free', tone: 'slate', pct: 8 };
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-surface-soft px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-500">
        <Icon size={12} className="shrink-0 text-ink-400" /> {label}
      </p>
      <p className="num mt-0.5 font-display text-base font-extrabold text-ink-900">{value}</p>
    </div>
  );
}

/**
 * Team Status, with the columns from the client's sheet: who is online, what
 * they are doing right now, their workload for the day, what they have sold
 * and how that tracks against target.
 */
export default function Team() {
  const { team, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Ranking is by revenue, so it moves with the numbers rather than being set.
  const ranked = [...team]
    .filter((m) => Number(m.revenue || 0) > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .map((m) => m.id);

  const online = team.filter((m) => m.live === 'Online').length;
  const present = team.filter((m) => m.attendance === 'Present').length;
  const openTasks = team.reduce((s, m) => s + (Number(m.tasksTotal || 0) - Number(m.tasksDone || 0)), 0);
  const teamAlerts = team.reduce((s, m) => s + Number(m.alerts || 0), 0);

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ROLES },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'status', label: 'Account', type: 'select', options: STATUSES },
    { name: 'live', label: 'Live status', type: 'select', options: LIVE },
    { name: 'attendance', label: 'Attendance', type: 'select', options: ATTENDANCE },
    { name: 'activity', label: 'Current activity', type: 'text', full: true },
    { name: 'target', label: 'Revenue target (₹)', type: 'number' },
  ];

  const save = (values) => {
    if (editing) update('team', editing.id, values);
    else
      create('team', {
        ...values,
        enquiries: 0,
        bookings: 0,
        revenue: 0,
        leads: 0,
        followUps: 0,
        calls: 0,
        presentations: 0,
        visits: 0,
        tasksDone: 0,
        tasksTotal: 0,
        productivity: 0,
        alerts: 0,
        lastActive: 'never',
      });
  };

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

      {/* The desk at a glance */}
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

      {/* One card per person */}
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {team.map((m) => {
          const rank = ranked.indexOf(m.id);
          const load = workloadOf(m);
          const achieved = m.target ? Math.round((m.revenue / m.target) * 100) : 0;

          return (
            <article key={m.id} className="card flex flex-col p-5">
              {/* Who, and are they on */}
              <div className="flex items-start gap-3.5">
                <span className="relative shrink-0">
                  <Avatar name={m.name} size="lg" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${
                      liveTone[m.live] || liveTone.Offline
                    }`}
                    title={m.live}
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-display text-base font-extrabold text-ink-900">
                      {m.name}
                    </span>
                    {rank === 0 && (
                      <Badge tone="amber">
                        <Trophy size={11} /> Top desk
                      </Badge>
                    )}
                    {rank > 0 && <span className="text-xs font-bold text-ink-400">#{rank + 1}</span>}
                  </p>
                  <p className="truncate text-xs font-semibold text-brand-700">{m.role}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
                    <span className="font-semibold text-ink-600">{m.live}</span>
                    <span className="text-ink-300">·</span>
                    <span>last active {m.lastActive}</span>
                    <Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge>
                  </p>
                </div>

                <RowMenu
                  items={[
                    { label: 'Edit member', icon: Pencil, onClick: () => { setEditing(m); setFormOpen(true); } },
                    { label: 'Call', icon: Phone, onClick: () => { window.location.href = `tel:${digits(m.phone)}`; } },
                    { label: 'Message', icon: MessageCircle, onClick: () => toast(`Message sent to ${m.name}`) },
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

              {/* What they are doing right now */}
              <p className="mt-3.5 rounded-xl border border-ink-900/[0.07] px-3.5 py-2.5 text-sm text-ink-700">
                <span className="eyebrow mr-2">Now</span>
                {m.activity}
              </p>

              {/* Today's numbers */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Metric icon={ListTodo} label="Tasks" value={`${m.tasksDone}/${m.tasksTotal}`} />
                <Metric icon={Users} label="Leads" value={m.leads} />
                <Metric icon={PhoneCall} label="Calls" value={m.calls} />
                <Metric icon={Send} label="Follow-ups" value={m.followUps} />
                <Metric icon={Presentation} label="Itineraries" value={m.presentations} />
                <Metric icon={MapPin} label="Visits" value={m.visits} />
              </div>

              {/* Sales against target */}
              <div className="mt-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-600">
                    <CalendarCheck size={13} className="mr-1.5 inline text-ink-400" />
                    {m.bookings} closings · {inr(m.revenue)}
                  </p>
                  {m.target > 0 && (
                    <p className="text-sm">
                      <span className="num font-extrabold text-ink-900">{achieved}%</span>
                      <span className="ml-1.5 text-xs text-ink-500">of {shortInr(m.target)}</span>
                    </p>
                  )}
                </div>

                {m.target > 0 && (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-soft">
                    <div
                      className={`h-full rounded-full ${achieved >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(achieved, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Productivity, workload, alerts */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-900/[0.07] pt-3.5">
                <Badge tone={m.productivity >= 80 ? 'green' : m.productivity >= 60 ? 'amber' : 'slate'}>
                  Productivity {m.productivity}
                </Badge>
                <Badge tone={load.tone}>{load.label} workload</Badge>
                {m.alerts > 0 && (
                  <Badge tone="rose" dot>
                    <AlertTriangle size={11} /> {m.alerts} alert{m.alerts > 1 ? 's' : ''}
                  </Badge>
                )}

                <div className="ml-auto flex gap-1.5">
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
                </div>
              </div>
            </article>
          );
        })}
      </div>

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
