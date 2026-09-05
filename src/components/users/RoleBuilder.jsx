import { useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import {
  permissionModules, permissionLevels, dataScopes, approvalRights, roleDashboards, roles,
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

/**
 * The custom role builder the sheet asks for: name it, say who it reports to
 * and what it opens on, tick the modules it may reach, choose how far it can
 * see, and pick what it is allowed to sign off.
 */
export default function RoleBuilder({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    department: 'Sales',
    reportsTo: 'Business head',
    dashboard: 'My sales dashboard',
    scope: 'Own',
    modules: ['CRM'],
    can: ['View'],
    approvals: [],
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const save = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim() });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Create a role"
      subtitle="What it is called, what it opens, how far it sees and what it may approve"
      size="xl"
      footer={
        <div className="flex items-center gap-2">
          <button className="btn-action" disabled={!form.name.trim()} onClick={save}>
            Create role
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
            {roles.map((r) => <option key={r.id}>{r.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Dashboard access</span>
          <select className="input" value={form.dashboard} onChange={(e) => set('dashboard', e.target.value)}>
            {[...new Set(roleDashboards.map((d) => d.name))].map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <p className="eyebrow mt-5">Which modules it may open</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {permissionModules.map((m) => (
          <Pick key={m} on={form.modules.includes(m)} onToggle={() => toggle('modules', m)}>{m}</Pick>
        ))}
      </div>

      <p className="eyebrow mt-5">What it may do</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {permissionLevels.map((p) => (
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

      <p className="eyebrow mt-5">What it may approve</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        {approvalRights.map((r) => (
          <Pick key={r} on={form.approvals.includes(r)} onToggle={() => toggle('approvals', r)}>{r}</Pick>
        ))}
      </div>

      <p className="mt-5 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
        {form.name || 'This role'} reports to {form.reportsTo}, opens on {form.dashboard}, can reach{' '}
        {form.modules.length} module{form.modules.length === 1 ? '' : 's'}, sees {form.scope.toLowerCase()} data, and
        approves {form.approvals.length ? form.approvals.join(', ').toLowerCase() : 'nothing'}.
      </p>
    </Modal>
  );
}
