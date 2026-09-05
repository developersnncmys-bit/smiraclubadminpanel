import { useState } from 'react';
import {
  UserPlus, ShieldCheck, Users as UsersIcon, UserCheck, Wifi, Plane,
  UserX, Sparkles, Search, Zap, KeyRound, Check, X, ChevronRight, Download,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import MenuButton from '../components/ui/MenuButton.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import UserProfile from '../components/users/UserProfile.jsx';
import RoleBuilder from '../components/users/RoleBuilder.jsx';
import { useApp } from '../store/AppStore.jsx';
import { downloadCsv } from '../lib/csv.js';
import { inr, shortInr } from '../data/mockData.js';
import {
  liveStates, permissionLevels, dataScopes, approvalRights, permissionModules,
  moduleAccess, roleOf, accounts, visibilityRules, hierarchy, approvalFlows,
  roleDashboards, auditLog, userFilters, userQuickActions, modulePurpose,
} from '../data/usersData.js';

const SECTIONS = [
  'Overview',
  'Users',
  'Teams',
  'Roles',
  'Permission matrix',
  'Reporting hierarchy',
  'Access control',
  'Performance',
  'Attendance and activity',
  'Approvals',
  'Login and security',
  'Audit logs',
];

/** The table every section here builds with, so they all read the same. */
function Table({ head, rows, empty = 'Nothing to show yet.', onRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
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
            <tr
              key={r.key}
              className={onRow ? 'cursor-pointer hover:bg-surface-soft' : 'hover:bg-surface-soft'}
              onClick={onRow ? () => onRow(r.key) : undefined}
            >
              {r.cells.map((c, i) => (
                <td key={i} className={`py-2.5 ${i === 0 ? 'font-bold text-ink-900' : 'text-ink-700'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-6 text-center text-ink-500">{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** A tick or a cross, for the permission grid. */
function Mark({ on }) {
  return on ? (
    <Check size={15} strokeWidth={3} className="text-emerald-600" />
  ) : (
    <X size={14} strokeWidth={2.5} className="text-ink-300" />
  );
}

/**
 * Users and roles, the way the client's sheet lays the module out: who can
 * sign in, what their role lets them reach, who they report to, what needs
 * approving, and every login and change the panel has kept.
 */
export default function Users() {
  const store = useApp();
  const { team, roles, approvals, enquiries, bookings, memberSignups, create, update, toast } = store;

  const [section, setSection] = useState('Overview');
  const [viewing, setViewing] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cut, setCut] = useState({
    branch: 'All', department: 'All', role: 'All', manager: 'All',
    status: 'All', live: 'All', performance: 'All',
  });

  /** A user is the team record plus the account the sheet's form collects. */
  const users = team.map((m) => ({
    ...m,
    account: accounts[m.id] || {},
    roleName: m.roleName || roleOf[m.id] || m.role,
  }));

  const list = (key) => [...new Set(users.map((u) => u[key]).filter((v) => v && v !== '—'))];
  const roleFor = (name) => roles.find((r) => r.name === name);

  const shown = users.filter((u) => {
    if (cut.branch !== 'All' && u.branch !== cut.branch) return false;
    if (cut.department !== 'All' && u.department !== cut.department) return false;
    if (cut.role !== 'All' && u.roleName !== cut.role) return false;
    if (cut.manager !== 'All' && u.manager !== cut.manager) return false;
    if (cut.status !== 'All' && u.status !== cut.status) return false;
    if (cut.live !== 'All' && u.live !== cut.live) return false;
    if (cut.performance === 'Above 75' && Number(u.productivity || 0) < 75) return false;
    if (cut.performance === 'Below 50' && Number(u.productivity || 0) >= 50) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [u.name, u.empId, u.email, u.roleName, u.department, u.branch].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  });

  // -- The six figures the sheet opens the module with ----------------------
  const online = users.filter((u) => u.live === 'Online').length;
  const onLeave = users.filter((u) => u.attendance === 'On leave' || u.live === 'On leave').length;
  const inactive = users.filter((u) => u.status !== 'Active').length;
  const activeToday = users.filter((u) => u.attendance && u.attendance !== 'On leave' && u.status === 'Active').length;
  const newJoiners = users.filter((u) => {
    const d = new Date(String(u.account.joined || '').replace(/,.*$/, ''));
    return !Number.isNaN(d.getTime()) && (Date.now() - d.getTime()) / 86400000 <= 90;
  }).length;

  const kpis = [
    { icon: UsersIcon, label: 'Total users', value: users.length },
    { icon: UserCheck, label: 'Active today', value: activeToday, tone: 'text-emerald-600', progress: users.length ? (activeToday / users.length) * 100 : 0 },
    { icon: Wifi, label: 'Online now', value: online, tone: online ? 'text-emerald-600' : undefined },
    { icon: Plane, label: 'On leave', value: onLeave, tone: onLeave ? 'text-amber-600' : undefined },
    { icon: UserX, label: 'Inactive', value: inactive, tone: inactive ? 'text-rose-600' : undefined },
    { icon: Sparkles, label: 'New joiners', value: newJoiners, hint: 'in 90 days' },
  ];

  // -- What each person has actually done -----------------------------------
  const workOf = (u) => {
    const first = u.name.split(' ')[0];
    const mine = enquiries.filter((e) => e.owner === first);
    const won = mine.filter((e) => e.status === 'Won');
    const theirBookings = bookings.filter((b) => b.owner === first);
    const theirMemberships = memberSignups.filter((m) => m.expert === first);
    const revenue = Number(u.revenue || 0);
    return {
      leads: mine.length,
      won: won.length,
      conversion: mine.length ? Math.round((won.length / mine.length) * 100) : 0,
      bookings: theirBookings.length,
      bookingValue: theirBookings.reduce((s, b) => s + Number(b.amount || 0), 0),
      cancellations: theirBookings.filter((b) => b.status === 'Cancelled').length,
      memberships: theirMemberships.length,
      revenue,
      target: Number(u.target || 0),
      achievement: u.target ? Math.round((revenue / u.target) * 100) : 0,
    };
  };

  const exportUsers = () => {
    downloadCsv('smira-club-users', shown, [
      { key: 'empId', header: 'Employee ID' },
      { key: 'name', header: 'Name' },
      { key: 'roleName', header: 'Role' },
      { key: 'department', header: 'Department' },
      { key: 'branch', header: 'Branch' },
      { key: 'manager', header: 'Reports to' },
      { key: 'status', header: 'Status' },
      { key: 'live', header: 'Live' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Mobile' },
    ]);
    toast('Users exported');
  };

  // -- What the quick actions actually do -----------------------------------
  const act = (label, u) => {
    if (!u) { toast('Open a user first', 'info'); return; }
    if (label === 'Reset password') {
      update('team', u.id, { passwordResetAt: 'just now' }, { message: `Reset link sent to ${u.email}` });
    } else if (label === 'Disable account') {
      update('team', u.id, { status: 'Inactive', live: 'Offline' }, { message: `${u.name} can no longer sign in` });
    } else if (label === 'View profile') {
      setViewing(u);
    } else {
      toast(`${label} — ${u.name}`, 'info');
    }
  };

  const addFields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'empId', label: 'Employee ID', type: 'text', required: true },
    { name: 'phone', label: 'Mobile', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'joined', label: 'Date of joining', type: 'text' },
    { name: 'department', label: 'Department', type: 'select', options: list('department') },
    { name: 'designation', label: 'Designation', type: 'text' },
    { name: 'branch', label: 'Branch', type: 'select', options: list('branch') },
    { name: 'manager', label: 'Reporting manager', type: 'select', options: users.map((u) => u.name) },
    { name: 'roleName', label: 'Role', type: 'select', options: roles.map((r) => r.name) },
    { name: 'employment', label: 'Employment status', type: 'select', options: ['Permanent', 'Probation', 'Contract', 'Intern'] },
    { name: 'aadhaar', label: 'Aadhaar', type: 'text' },
    { name: 'familyCount', label: 'Family members', type: 'number' },
    { name: 'familyNames', label: 'Family member names', type: 'text', full: true },
    { name: 'username', label: 'Username or email to sign in with', type: 'text' },
    { name: 'password', label: 'Password', type: 'text' },
    { name: 'twoFactor', label: 'Two-factor authentication', type: 'select', options: ['On', 'Off'] },
    { name: 'access', label: 'Login permission', type: 'select', options: ['Web and mobile', 'Web only', 'Mobile only', 'No access'] },
    { name: 'devices', label: 'Device restrictions', type: 'text', full: true },
    { name: 'leadSources', label: 'Lead sources', type: 'text' },
    { name: 'territory', label: 'Territory', type: 'text' },
    { name: 'segment', label: 'Customer segment', type: 'text' },
    { name: 'products', label: 'Membership products', type: 'text' },
    { name: 'categories', label: 'Booking categories', type: 'text' },
  ];

  const addUser = (values) => {
    const id = create('team', {
      name: values.name,
      empId: values.empId,
      role: values.designation || values.roleName,
      roleName: values.roleName,
      department: values.department,
      branch: values.branch,
      manager: values.manager,
      email: values.email,
      phone: values.phone,
      status: 'Active',
      live: 'Offline',
      attendance: 'Not marked',
      activity: 'Just added',
      lastActive: 'never',
      leads: 0, followUps: 0, calls: 0, presentations: 0, visits: 0,
      bookings: 0, enquiries: 0, revenue: 0, target: 0, productivity: 0,
      alerts: [], notices: [],
      account: {
        joined: values.joined || 'today',
        designation: values.designation || values.roleName,
        employment: values.employment || 'Probation',
        aadhaar: values.aadhaar || '—',
        family: values.familyNames ? String(values.familyNames).split(',').map((x) => x.trim()) : [],
        username: values.username || values.email,
        twoFactor: values.twoFactor === 'On',
        webAccess: ['Web and mobile', 'Web only'].includes(values.access),
        mobileAccess: ['Web and mobile', 'Mobile only'].includes(values.access),
        devices: values.devices || 'No restriction',
        lastLogin: 'never', loginTime: '—', logoutTime: '—', ip: '—', browser: '—',
        failedLogins: 0, sessions: 0,
        leadSources: values.leadSources ? String(values.leadSources).split(',').map((x) => x.trim()) : [],
        territory: values.territory || '—',
        segment: values.segment || '—',
        products: values.products ? String(values.products).split(',').map((x) => x.trim()) : [],
        categories: values.categories ? String(values.categories).split(',').map((x) => x.trim()) : [],
      },
    });
    setAddOpen(false);
    toast(`${values.name} can sign in as ${values.roleName}`);
    return id;
  };

  const decide = (row, status) =>
    update('approvals', row.id, { status, decidedAt: 'just now' }, { message: `${row.id} ${status.toLowerCase()}` });

  const body = {
    Overview: (
      <>
        <Block title="Who is on right now" note="The seven states the desk reports itself in" wide>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {liveStates.map((s) => {
              const mine = users.filter((u) => u.live === s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => { setCut({ ...cut, live: s.key }); setSection('Users'); }}
                  className="flex items-center gap-3 rounded-xl border border-ink-900/[0.07] px-3.5 py-2.5 text-left transition hover:bg-surface-soft"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-700">{s.key}</span>
                  <span className="num shrink-0 font-display text-lg font-extrabold text-ink-900">{mine.length}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['User', 'Current activity', 'Last active', 'Current lead or customer', 'Call duration', "Today's tasks", "Today's appointments"].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {users.map((u) => {
                  const state = liveStates.find((s) => s.key === u.live);
                  return (
                    <tr key={u.id} className="cursor-pointer hover:bg-surface-soft" onClick={() => setViewing(u)}>
                      <td className="py-2.5">
                        <span className="flex items-center gap-2.5">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${state?.dot || 'bg-ink-300'}`} />
                          <Avatar name={u.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-ink-900">{u.name}</span>
                            <span className="block truncate text-xs text-ink-400">{u.roleName}</span>
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 text-ink-700">{u.activity || '—'}</td>
                      <td className="py-2.5 text-ink-500">{u.lastActive || '—'}</td>
                      <td className="py-2.5 text-ink-700">{u.current?.customer || '—'}</td>
                      <td className="num py-2.5 text-ink-700">
                        {u.callDetail?.talkTime || u.callDetail?.avgDuration || '—'}
                      </td>
                      <td className="num py-2.5 text-ink-700">
                        {u.tasksTotal ? `${u.tasksDone || 0} of ${u.tasksTotal}` : '—'}
                      </td>
                      <td className="num py-2.5 text-ink-700">{u.visitDetail?.planned ?? u.visits ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Block>

        <Block title="What this module controls" note="The sheet's own list, and where each one lives">
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {modulePurpose.map((p) => (
              <li key={p} className="flex items-start gap-2 border-b border-ink-900/[0.07] py-2 text-sm text-ink-600">
                <ChevronRight size={14} className="mt-0.5 shrink-0 text-brand-500" />
                {p}
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Nobody gets the same dashboard" note="What each role opens on">
          <ul className="space-y-3">
            {roleDashboards.map((d) => (
              <li key={d.role} className="rounded-xl border border-ink-900/[0.07] p-3.5">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink-900">{d.role}</span>
                  <Badge tone="teal">{d.name}</Badge>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.tiles.map((t) => (
                    <span key={t} className="chip text-ink-500">{t}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Block>
      </>
    ),

    Users: (
      <Block
        title="Everyone who can sign in"
        note={`${shown.length} of ${users.length} · click a row to open them`}
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input h-9 w-44 py-0 pl-9 text-sm"
                placeholder="Search user…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {[
              ['branch', 'Every branch', list('branch')],
              ['department', 'Every team', list('department')],
              ['role', 'Every role', [...new Set(users.map((u) => u.roleName))]],
              ['manager', 'Every manager', list('manager')],
              ['status', 'Active and inactive', ['Active', 'Inactive']],
              ['live', 'Online and offline', liveStates.map((s) => s.key)],
              ['performance', 'Any performance', ['Above 75', 'Below 50']],
            ].map(([key, label, options]) => (
              <select
                key={key}
                className="input h-9 w-auto py-0 text-sm"
                value={cut[key]}
                onChange={(e) => setCut({ ...cut, [key]: e.target.value })}
              >
                <option value="All">{label}</option>
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ))}
            <button className="btn-line btn-sm" onClick={exportUsers}>
              <Download size={13} /> Export
            </button>
          </div>
        }
      >
        <Table
          head={['User', 'Role', 'Department', 'Branch', 'Reports to', 'Joined', 'Status', "Today's activity", 'Last active']}
          empty="Nobody matches this cut."
          onRow={(id) => setViewing(users.find((u) => u.id === id))}
          rows={shown.map((u) => {
            const state = liveStates.find((s) => s.key === u.live);
            return {
              key: u.id,
              cells: [
                <span className="flex items-center gap-2.5">
                  <Avatar name={u.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-ink-900">{u.name}</span>
                    <span className="num block truncate text-xs font-normal text-ink-400">{u.empId}</span>
                  </span>
                </span>,
                u.roleName,
                u.department,
                u.branch,
                u.manager,
                <span className="num">{u.account.joined || '—'}</span>,
                <span className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${state?.dot || 'bg-ink-300'}`} />
                  <Badge tone={u.status === 'Active' ? 'green' : 'slate'}>{u.status}</Badge>
                </span>,
                u.activity || '—',
                <span className="text-ink-500">{u.lastActive || '—'}</span>,
              ],
            };
          })}
        />
        <p className="eyebrow mt-4">The list can be cut by</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {userFilters.map((f) => <span key={f} className="chip text-ink-500">{f}</span>)}
        </div>
      </Block>
    ),

    Teams: (
      <Block title="The teams, and who carries them" note="Sales, operations, finance and support" wide>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list('department').map((d) => {
            const mine = users.filter((u) => u.department === d);
            const revenue = mine.reduce((s, u) => s + Number(u.revenue || 0), 0);
            const target = mine.reduce((s, u) => s + Number(u.target || 0), 0);
            return (
              <div key={d} className="rounded-xl border border-ink-900/[0.07] p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-ink-900">{d}</p>
                  <span className="num text-sm font-bold text-ink-900">{mine.length}</span>
                </div>
                <p className="num mt-1 text-sm text-ink-500">
                  {inr(revenue)} of {target ? shortInr(target) : '—'}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-soft">
                  <span
                    className="block h-full rounded-full bg-brand-500"
                    style={{ width: `${target ? Math.min(100, Math.round((revenue / target) * 100)) : 0}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {mine.map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => setViewing(u)}
                        className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-surface-soft"
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${liveStates.find((s) => s.key === u.live)?.dot || 'bg-ink-300'}`} />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-ink-700">{u.name}</span>
                        <span className="num shrink-0 text-[11px] text-ink-400">{u.productivity ?? 0}%</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Block>
    ),

    Roles: (
      <Block
        title="Roles on the system"
        note="What each one is for, how far it can see, and what it may sign off"
        wide
        action={
          <button className="btn-action btn-sm" onClick={() => setRoleOpen(true)}>
            <ShieldCheck size={14} /> Create role
          </button>
        }
      >
        <Table
          head={['Role', 'Department', 'Reports to', 'Dashboard', 'People', 'Data access', 'Can approve', 'Modules']}
          rows={roles.map((r) => {
            const people = users.filter((u) => u.roleName === r.name).length;
            return {
              key: r.id,
              cells: [
                r.name,
                r.department,
                r.reportsTo,
                <Badge tone="teal">{r.dashboard}</Badge>,
                <span className="num">{people}</span>,
                <Badge tone={r.scope === 'All' ? 'violet' : r.scope === 'Own' ? 'slate' : 'sky'}>{r.scope}</Badge>,
                (r.approvals || []).length ? (r.approvals || []).join(', ') : <span className="text-ink-400">nothing</span>,
                <span className="num text-ink-500">{(r.modules || []).length} of {permissionModules.length}</span>,
              ],
            };
          })}
        />
      </Block>
    ),

    'Permission matrix': (
      <>
        <Block title="What each role may do" note="The nine levels, against every role" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  <th className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Role</th>
                  {permissionLevels.map((p) => (
                    <th key={p} className="pb-2 text-center text-xs font-bold uppercase tracking-wide text-ink-400">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {roles.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-soft">
                    <td className="py-2.5 font-bold text-ink-900">{r.name}</td>
                    {permissionLevels.map((p) => (
                      <td key={p} className="py-2.5 text-center">
                        <span className="inline-flex">
                          <Mark on={p === 'Restricted' ? r.scope === 'Own' : (r.can || []).includes(p)} />
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <Block title="Which modules each role can open" note="Nine modules, switched on one at a time" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  <th className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Role</th>
                  {permissionModules.map((m) => (
                    <th key={m} className="pb-2 text-center text-xs font-bold uppercase tracking-wide text-ink-400">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {roles.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-soft">
                    <td className="py-2.5 font-bold text-ink-900">{r.name}</td>
                    {permissionModules.map((m) => (
                      <td key={m} className="py-2.5 text-center">
                        <span className="inline-flex"><Mark on={(r.modules || []).includes(m)} /></span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      </>
    ),

    'Reporting hierarchy': (
      <>
        <Block title="Who reports to whom" note="Top to bottom, the way the sheet draws it">
          <ol className="space-y-1.5">
            {hierarchy.map((level, i) => (
              <li key={level} className="flex items-center gap-3 rounded-xl bg-surface-soft px-4 py-2.5" style={{ marginLeft: i * 14 }}>
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-600 text-[11px] font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-ink-800">{level}</span>
                <span className="num text-sm font-bold text-ink-900">
                  {users.filter((u) => u.roleName === level || u.roleName?.startsWith(level)).length}
                </span>
              </li>
            ))}
          </ol>
        </Block>

        <Block title="Every manager's team" note="What the people under them are carrying">
          {[...new Set(users.map((u) => u.manager).filter((m) => m && m !== '—'))].map((mg) => {
            const mine = users.filter((u) => u.manager === mg);
            return (
              <div key={mg} className="mb-4 last:mb-0">
                <p className="eyebrow mb-2">{mg} · {mine.length} reporting</p>
                <Table
                  head={['Member', 'Online', 'Attendance', 'Leads', 'Calls', 'Presentations', 'Visits', 'Closings', 'Revenue', 'Target', 'Achievement', 'Follow-ups', 'Productivity']}
                  onRow={(id) => setViewing(users.find((u) => u.id === id))}
                  rows={mine.map((u) => {
                    const w = workOf(u);
                    return {
                      key: u.id,
                      cells: [
                        u.name,
                        <span className={`h-2 w-2 inline-block rounded-full ${liveStates.find((s) => s.key === u.live)?.dot || 'bg-ink-300'}`} />,
                        u.attendance || '—',
                        <span className="num">{w.leads}</span>,
                        <span className="num">{u.calls ?? 0}</span>,
                        <span className="num">{u.presentations ?? 0}</span>,
                        <span className="num">{u.visits ?? 0}</span>,
                        <span className="num">{u.bookings ?? 0}</span>,
                        <span className="num font-bold text-brand-700">{w.revenue ? inr(w.revenue) : '—'}</span>,
                        <span className="num">{w.target ? shortInr(w.target) : '—'}</span>,
                        <span className={`num font-bold ${w.achievement >= 100 ? 'text-emerald-600' : 'text-ink-700'}`}>
                          {w.target ? `${w.achievement}%` : '—'}
                        </span>,
                        <span className="num">{u.followUps ?? 0}</span>,
                        <span className="num">{u.productivity ?? 0}%</span>,
                      ],
                    };
                  })}
                />
              </div>
            );
          })}
        </Block>
      </>
    ),

    'Access control': (
      <>
        <Block title="Module access" note="Every screen the role system controls" wide>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(moduleAccess).map(([group, items]) => (
              <div key={group} className="rounded-xl border border-ink-900/[0.07] p-4">
                <p className="font-bold text-ink-900">{group}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {items.map((i) => <span key={i} className="chip text-ink-500">{i}</span>)}
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Data access" note="Not every employee should see everything — the sheet calls this critical" wide>
          <Table
            head={['Role', 'Can see', 'Cannot see']}
            rows={visibilityRules.map((r) => ({
              key: r.role,
              cells: [
                r.role,
                <span className="flex flex-wrap gap-1.5">
                  {r.sees.map((x) => <span key={x} className="chip border-emerald-200 bg-emerald-50 text-emerald-700">{x}</span>)}
                </span>,
                <span className="flex flex-wrap gap-1.5">
                  {r.hidden.map((x) => <span key={x} className="chip border-rose-200 bg-rose-50 text-rose-700">{x}</span>)}
                </span>,
              ],
            }))}
          />
          <p className="eyebrow mt-4">The four scopes a role is given</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dataScopes.map((d) => (
              <span key={d} className="chip text-ink-600">
                {d} · {roles.filter((r) => r.scope === d).length} role(s)
              </span>
            ))}
          </div>
        </Block>

        <Block title="Approval access" note="Which roles may sign each thing off" wide>
          <Table
            head={['Right', 'Roles that carry it']}
            rows={approvalRights.map((right) => ({
              key: right,
              cells: [
                right,
                <span className="flex flex-wrap gap-1.5">
                  {roles.filter((r) => (r.approvals || []).includes(right)).map((r) => (
                    <span key={r.id} className="chip text-ink-600">{r.name}</span>
                  ))}
                  {roles.every((r) => !(r.approvals || []).includes(right)) && (
                    <span className="text-ink-400">nobody yet</span>
                  )}
                </span>,
              ],
            }))}
          />
        </Block>
      </>
    ),

    Performance: (
      <Block title="What everyone is carrying" note="Target, achievement, incentive and where they rank" wide>
        <Table
          head={['Rank', 'User', 'Role', 'Leads', 'Conversion', 'Bookings', 'Booking value', 'Revenue', 'Target', 'Achievement', 'Productivity']}
          onRow={(id) => setViewing(users.find((u) => u.id === id))}
          rows={[...users]
            .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
            .map((u, i) => {
              const w = workOf(u);
              return {
                key: u.id,
                cells: [
                  <span className="num font-extrabold text-ink-900">#{i + 1}</span>,
                  <span className="flex items-center gap-2.5"><Avatar name={u.name} size="sm" /> {u.name}</span>,
                  u.roleName,
                  <span className="num">{w.leads}</span>,
                  <span className="num">{w.conversion}%</span>,
                  <span className="num">{w.bookings}</span>,
                  <span className="num">{w.bookingValue ? inr(w.bookingValue) : '—'}</span>,
                  <span className="num font-bold text-brand-700">{w.revenue ? inr(w.revenue) : '—'}</span>,
                  <span className="num">{w.target ? shortInr(w.target) : '—'}</span>,
                  <span className={`num font-bold ${w.achievement >= 100 ? 'text-emerald-600' : 'text-ink-700'}`}>
                    {w.target ? `${w.achievement}%` : '—'}
                  </span>,
                  <span className="num">{u.productivity ?? 0}%</span>,
                ],
              };
            })}
        />
      </Block>
    ),

    'Attendance and activity': (
      <Block title="Who turned up, and what they have done" note="Attendance, login and the work behind it" wide>
        <Table
          head={['User', 'Attendance', 'Live', 'Last active', 'Signed in', 'Signed out', 'Calls', 'Follow-ups', 'Tasks', 'Activity']}
          onRow={(id) => setViewing(users.find((u) => u.id === id))}
          rows={users.map((u) => ({
            key: u.id,
            cells: [
              u.name,
              <Badge tone={u.attendance === 'On leave' ? 'amber' : u.attendance ? 'green' : 'slate'}>
                {u.attendance || 'Not marked'}
              </Badge>,
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${liveStates.find((s) => s.key === u.live)?.dot || 'bg-ink-300'}`} />
                {u.live || '—'}
              </span>,
              <span className="text-ink-500">{u.lastActive || '—'}</span>,
              <span className="num">{u.account.loginTime || '—'}</span>,
              <span className="num">{u.account.logoutTime || '—'}</span>,
              <span className="num">{u.calls ?? 0}</span>,
              <span className="num">{u.followUps ?? 0}</span>,
              <span className="num">{u.tasksTotal ? `${u.tasksDone || 0} of ${u.tasksTotal}` : '—'}</span>,
              u.activity || '—',
            ],
          }))}
        />
      </Block>
    ),

    Approvals: (
      <>
        <Block title="Waiting on someone" note="Nothing here happens without a sign-off" wide>
          <Table
            head={['Request', 'Area', 'What', 'Raised by', 'Approver', 'Value', 'Raised', 'Status', '']}
            empty="Nothing is waiting."
            rows={(approvals || []).map((a) => ({
              key: a.id,
              cells: [
                <span className="num text-brand-700">{a.id}</span>,
                <Badge tone="sky">{a.area}</Badge>,
                a.what,
                a.raisedBy,
                a.approver,
                <span className="num">{a.value ? inr(a.value) : '—'}</span>,
                <span className="num text-ink-500">{a.raised}</span>,
                <Badge tone={a.status === 'Approved' ? 'green' : a.status === 'Rejected' ? 'rose' : 'amber'} dot>
                  {a.status}
                </Badge>,
                a.status === 'Waiting' ? (
                  <span className="flex gap-1.5">
                    <button className="btn-action btn-sm" onClick={() => decide(a, 'Approved')}>Approve</button>
                    <button className="btn-line-danger btn-sm" onClick={() => decide(a, 'Rejected')}>Reject</button>
                  </span>
                ) : (
                  <span className="text-ink-400">{a.decidedAt || 'done'}</span>
                ),
              ],
            }))}
          />
        </Block>

        <Block title="What always needs approving" note="The six flows the sheet lists" wide>
          <Table
            head={['Area', 'What happens', 'Who signs it off']}
            rows={approvalFlows.map((f) => ({
              key: f.area,
              cells: [f.area, f.flow, <span className="font-semibold text-brand-700">{f.approver}</span>],
            }))}
          />
        </Block>
      </>
    ),

    'Login and security': (
      <>
        <Block title="Sessions and sign-ins" note="Every login the panel has recorded" wide>
          <Table
            head={['User', 'Last login', 'Login', 'Logout', 'IP', 'Browser or device', 'Failed attempts', 'Active sessions', '2FA', '']}
            rows={users.map((u) => ({
              key: u.id,
              cells: [
                u.name,
                <span className="num">{u.account.lastLogin || 'never'}</span>,
                <span className="num">{u.account.loginTime || '—'}</span>,
                <span className="num">{u.account.logoutTime || '—'}</span>,
                <span className="num text-ink-500">{u.account.ip || '—'}</span>,
                u.account.browser || '—',
                <span className={`num font-bold ${u.account.failedLogins ? 'text-rose-600' : 'text-ink-400'}`}>
                  {u.account.failedLogins ?? 0}
                </span>,
                <span className="num">{u.account.sessions ?? 0}</span>,
                <Badge tone={u.account.twoFactor ? 'green' : 'slate'}>{u.account.twoFactor ? 'On' : 'Off'}</Badge>,
                <span className="flex flex-wrap gap-1.5">
                  <button className="btn-line btn-sm" onClick={() => act('Reset password', u)}>Reset</button>
                  <button className="btn-line btn-sm" onClick={() => toast(`${u.name} signed out of every device`)}>
                    Force logout
                  </button>
                  <button className="btn-line-danger btn-sm" onClick={() => act('Disable account', u)}>Disable</button>
                </span>,
              ],
            }))}
          />
        </Block>

        <Block title="Who can sign in from where" note="Login permission and device restrictions">
          <Table
            head={['User', 'Username', 'Web', 'Mobile', 'Devices']}
            rows={users.map((u) => ({
              key: u.id,
              cells: [
                u.name,
                <span className="text-ink-500">{u.account.username || u.email}</span>,
                <span className="inline-flex"><Mark on={u.account.webAccess} /></span>,
                <span className="inline-flex"><Mark on={u.account.mobileAccess} /></span>,
                u.account.devices || 'No restriction',
              ],
            }))}
          />
        </Block>
      </>
    ),

    'Audit logs': (
      <Block title="Everything that has been done" note="Logins, approvals, role changes and edits — newest first" wide>
        <ol className="space-y-3 border-l border-ink-900/[0.07] pl-4">
          {auditLog.map((l) => (
            <li key={l.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ink-800">{l.what}</span>
                <Badge tone="slate">{l.kind}</Badge>
              </p>
              <p className="text-xs text-ink-500">{l.who} · {l.at}</p>
            </li>
          ))}
        </ol>
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="Users and roles" subtitle="Who can sign in, what they may reach, and who signs it off">
        <button className="btn-line" onClick={() => setRoleOpen(true)}>
          <ShieldCheck size={16} /> Create role
        </button>
        <button className="btn-action" onClick={() => setAddOpen(true)}>
          <UserPlus size={16} /> Add user
        </button>
      </PageHeader>

      {/* Pick a view, or do something to a user */}
      <section className="card flex flex-wrap items-center gap-3 px-5 py-3.5">
        <h2 className="font-display text-base font-extrabold text-ink-900">The desk</h2>

        <MenuButton
          label={`${section} · ${SECTIONS.length} views`}
          icon={KeyRound}
          variant="dark"
          value={section}
          width="w-[280px]"
          items={SECTIONS.map((s) => ({ key: s, label: s }))}
          onSelect={setSection}
        />

        <MenuButton
          label="Quick actions"
          icon={Zap}
          variant="action"
          width="w-[260px]"
          items={userQuickActions.map((a) => ({ key: a, label: a }))}
          onSelect={(key) => act(key, viewing || shown[0])}
        />

        <p className="num ml-auto text-sm text-ink-500">
          {online} online · {users.length} users · {roles.length} roles ·{' '}
          {(approvals || []).filter((a) => a.status === 'Waiting').length} waiting
        </p>
      </section>

      <div className="mt-4">
        <KpiRow items={kpis} cols={6} />
      </div>

      <SectionTabs className="mt-6" items={SECTIONS} value={section} onChange={setSection} />

      <div className="mt-5 grid gap-5 xl:grid-cols-2">{body[section]}</div>

      {viewing && (
        <UserProfile
          user={users.find((u) => u.id === viewing.id) || viewing}
          role={roleFor(viewing.roleName)}
          work={workOf(viewing)}
          log={auditLog.filter((l) => l.who === viewing.name)}
          onClose={() => setViewing(null)}
          onAct={(label) => act(label, viewing)}
        />
      )}

      <FormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={addUser}
        title="Add a user"
        subtitle="Their details, how they sign in, and what they are given to work"
        fields={addFields}
        initial={{
          department: 'Sales desk', branch: 'Mumbai', roleName: 'Travel expert',
          employment: 'Probation', twoFactor: 'Off', access: 'Web and mobile',
        }}
        submitLabel="Create user"
      />

      {roleOpen && (
        <RoleBuilder
          onClose={() => setRoleOpen(false)}
          onSave={(role) => {
            create('roles', role);
            setRoleOpen(false);
            setSection('Roles');
            toast(`${role.name} can now be given to a user`);
          }}
        />
      )}
    </>
  );
}
