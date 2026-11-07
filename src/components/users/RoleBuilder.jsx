import { useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import {
  permissionModules, dataScopes, approvalRights, roleDashboards, roles, modulePages,
} from '../../data/usersData.js';

/** A tick box, the same one the rest of the panel's dialogs use. */
function Pick({ on, onToggle, children }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm transition ${
        on ? 'border-brand-400 bg-brand-50 text-ink-900' : 'border-ink-900/[0.07] text-ink-600 hover:bg-surface-soft'
      }`}
    >
      <span
        className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded border ${
          on ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-900/20 bg-white'
        }`}
        style={{ height: 18, width: 18 }}
      >
        {on && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}

/** The four things a role can be allowed on each page, in the server's words. */
const PAGE_ACTIONS = [
  ['view', 'View'],
  ['create', 'Add'],
  ['edit', 'Edit'],
  ['delete', 'Delete'],
];
const LABEL_TO_ACTION = { View: 'view', Create: 'create', Edit: 'edit', Delete: 'delete' };
const ACTION_TO_LABEL = { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete' };
// Rights that are not about one page.
const OTHER_RIGHTS = ['Approve', 'Financial access', 'Export', 'Assign'];

/** A role made before page-by-page access: its pages, each with the same rights. */
function accessFrom(role) {
  const saved = role?.access && Object.keys(role.access).length ? role.access : null;
  if (saved) return Object.fromEntries(Object.entries(saved).map(([m, a]) => [m, [...a]]));
  const acts = (role?.can || []).map((l) => LABEL_TO_ACTION[l]).filter(Boolean);
  return Object.fromEntries((role?.modules || []).map((m) => [m, [...new Set(['view', ...acts])]]));
}

/**
 * The custom role builder the sheet asks for: name it, say who it reports to
 * and what it opens on, tick the modules it may reach, choose how far it can
 * see, and pick what it is allowed to sign off.
 */
export default function RoleBuilder({ role, roleNames, onClose, onSave }) {
  const editing = Boolean(role);
  // Editing starts from the role as it stands; creating, from a sales role.
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: role.name || '',
          department: role.department || '',
          reportsTo: role.reportsTo || '—',
          dashboard: role.dashboard || 'My sales dashboard',
          scope: role.scope || 'Own',
          modules: [...(role.modules || [])],
          can: [...(role.can || [])].filter((c) => OTHER_RIGHTS.includes(c)),
          access: accessFrom(role),
          approvals: [...(role.approvals || [])],
        }
      : {
          name: '',
          department: 'Sales',
          reportsTo: 'Business head',
          dashboard: 'My sales dashboard',
          scope: 'Own',
          modules: ['CRM'],
          can: [],
          access: { CRM: ['view'] },
          approvals: [],
        }
  );

  // Who a role can report to: the roles that exist, never itself. The value
  // it already holds stays in the list even if that role has since gone.
  const bosses = [...new Set([...(roleNames || roles.map((r) => r.name)), form.reportsTo])]
    .filter((n) => n && n !== '—' && n !== role?.name);
  const dashboards = [...new Set([...roleDashboards.map((d) => d.name), form.dashboard])].filter(Boolean);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  // One tick on one page. Add, Edit or Delete needs View, so it comes with
  // them; taking View away takes the page away.
  const tick = (module, action) =>
    setForm((f) => {
      const now = f.access[module] || [];
      let next;
      if (now.includes(action)) next = action === 'view' ? [] : now.filter((a) => a !== action);
      else next = [...new Set([...now, action, 'view'])];
      const access = { ...f.access };
      if (next.length) access[module] = next;
      else delete access[module];
      return { ...f, access };
    });
  const wholeRow = (module, on) =>
    setForm((f) => {
      const access = { ...f.access };
      if (on) access[module] = PAGE_ACTIONS.map(([a]) => a);
      else delete access[module];
      return { ...f, access };
    });
  const everything = (on) =>
    setForm((f) => ({ ...f, access: on ? Object.fromEntries(permissionModules.map((m) => [m, PAGE_ACTIONS.map(([a]) => a)])) : {} }));

  const save = () => {
    if (!form.name.trim()) return;
    const access = Object.fromEntries(Object.entries(form.access).filter(([, a]) => a.includes('view')));
    const used = [...new Set(Object.values(access).flat())];
    onSave({
      ...form,
      name: form.name.trim(),
      access,
      // Kept in step for anything that still reads the older shape.
      modules: Object.keys(access),
      can: [...used.map((a) => ACTION_TO_LABEL[a]).filter(Boolean), ...form.can],
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? `Edit ${role.name}` : 'Create a role'}
      subtitle={
        editing
          ? 'Changes apply to everyone who holds this role, the next time they load the panel'
          : 'What it is called, what it opens, how far it sees and what it may approve'
      }
      size="xl"
      footer={
        <div className="flex items-center gap-2">
          <button className="btn-action" disabled={!form.name.trim()} onClick={save}>
            {editing ? 'Save changes' : 'Create role'}
          </button>
          <button className="btn-line" onClick={onClose}>Cancel</button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Role name</span>
          <input
            className="input"
            placeholder="Travel Expert"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label">Department</span>
          <input
            className="input"
            placeholder="Sales"
            value={form.department}
            onChange={(e) => set('department', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label">Reports to</span>
          <select className="input" value={form.reportsTo} onChange={(e) => set('reportsTo', e.target.value)}>
            <option value="—">Nobody</option>
            {bosses.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Dashboard access</span>
          <select className="input" value={form.dashboard} onChange={(e) => set('dashboard', e.target.value)}>
            {dashboards.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Pages, and what it may do on each</p>
        <span className="flex gap-3">
          <button type="button" className="text-xs font-bold text-brand-700 hover:underline" onClick={() => everything(true)}>Allow everything</button>
          <button type="button" className="text-xs font-bold text-ink-500 hover:underline" onClick={() => everything(false)}>Clear</button>
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-500">
        Tick View to open the page. Add, Edit and Delete show those buttons — without them the person can only look.
      </p>
      <div className="mt-2 overflow-hidden rounded-xl border border-ink-900/10">
        <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,2.9rem)] items-center gap-1 bg-surface-soft px-3 py-2 text-[11px] font-bold uppercase text-ink-500 sm:grid-cols-[minmax(0,1fr)_repeat(4,4.5rem)]">
          <span>Page</span>
          {PAGE_ACTIONS.map(([, label]) => <span key={label} className="text-center">{label}</span>)}
        </div>
        {permissionModules.map((m) => {
          const acts = form.access[m] || [];
          const all = PAGE_ACTIONS.every(([a]) => acts.includes(a));
          return (
            <div key={m} className={`grid grid-cols-[minmax(0,1fr)_repeat(4,2.9rem)] items-center gap-1 border-t border-ink-900/[0.06] px-3 py-2 sm:grid-cols-[minmax(0,1fr)_repeat(4,4.5rem)] ${acts.length ? '' : 'opacity-70'}`}>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-ink-900">{modulePages[m]?.title || m}</span>
                <span className="block truncate text-[11px] text-ink-500">{modulePages[m]?.pages}</span>
                <button type="button" className="text-[11px] font-bold text-brand-700" onClick={() => wholeRow(m, !all)}>
                  {all ? 'None' : 'All'}
                </button>
              </span>
              {PAGE_ACTIONS.map(([a, label]) => {
                const on = acts.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    title={`${label} on ${modulePages[m]?.title || m}`}
                    onClick={() => tick(m, a)}
                    className="grid place-items-center py-1"
                  >
                    <span
                      className={`grid place-items-center rounded-md border ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-900/25 bg-white'}`}
                      style={{ height: 22, width: 22 }}
                    >
                      {on && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-ink-400">Dashboard, Tasks and the user's own Account are always open.</p>

      <p className="eyebrow mt-5">Other rights</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        {OTHER_RIGHTS.map((p) => (
          <Pick key={p} on={form.can.includes(p)} onToggle={() => toggle('can', p)}>{p}</Pick>
        ))}
      </div>

      <p className="eyebrow mt-5">How far it can see</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {dataScopes.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => set('scope', d)}
            className={`chip ${form.scope === d ? 'border-brand-600 bg-brand-50 text-brand-700' : 'text-ink-600'}`}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="mt-1.5 text-xs text-ink-400">
        {{
          Own: 'Only their own leads and work — on Team Status they see only themselves.',
          'Own team': 'Their team’s leads and work, and the whole team on Team Status.',
          'Own branch': 'Everything in their branch.',
          All: 'Everything, every branch.',
        }[form.scope]}
      </p>

      <p className="eyebrow mt-5">What it may approve</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        {approvalRights.map((r) => (
          <Pick key={r} on={form.approvals.includes(r)} onToggle={() => toggle('approvals', r)}>{r}</Pick>
        ))}
      </div>

      <p className="mt-5 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
        {form.name || 'This role'} reports to {form.reportsTo}, opens on {form.dashboard}, can open{' '}
        {Object.keys(form.access).length
          ? Object.entries(form.access)
            .map(([m, a]) => `${modulePages[m]?.title || m} (${PAGE_ACTIONS.filter(([x]) => a.includes(x)).map(([, l]) => l.toLowerCase()).join(', ')})`)
            .join('; ')
          : 'only the Dashboard'}
        {form.can.length ? `, may also ${form.can.join(', ').toLowerCase()}` : ''}, sees {form.scope.toLowerCase()} data, and
        approves {form.approvals.length ? form.approvals.join(', ').toLowerCase() : 'nothing'}.
      </p>
    </Modal>
  );
}
