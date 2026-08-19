import { useState } from 'react';
import { Plus, Copy, Zap, Trash2, ArrowRight, Eye, Save, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';

const TRIGGERS = [
  'Call ends without an answer',
  'Call fails twice',
  'New enquiry received',
  'Enquiry marked Interested',
  'Enquiry marked Lost',
  'Quotation sent',
  'Invoice due in 3 days',
  'Membership signup received',
  'Departure in 7 days',
];

const CONDITIONS = [
  'Enquiry status is New',
  'Enquiry status is Contacted',
  'Budget is above 50,000',
  'Source is Website',
  'Source is Instagram',
  'Plan is Silver Explorer',
  'Plan is Gold Voyager',
  'Balance is above 0',
  'Number is unreachable',
  'Reason is Not interested',
];

const ACTIONS = [
  'Send WhatsApp message',
  'Send email',
  'Create a follow-up task',
  'Assign to a consultant',
  'Change the enquiry status',
  'Add a tag',
  'Create a quotation draft',
  'Notify the owner',
  'Move to the nurture list',
];

const STATUS = ['Active', 'Paused', 'Draft'];
const statusTone = { Active: 'green', Paused: 'amber', Draft: 'slate' };

const blankRule = () => ({
  name: '',
  description: '',
  trigger: '',
  conditions: [],
  days: [{ day: 1, actions: [] }],
  status: 'Draft',
});

/**
 * Automation rules, in the shape the client's CRM uses: a rules table with
 * run counts and a switch, and a builder that reads "when this happens, then
 * do this" across a day-by-day sequence.
 */
export default function Automation() {
  const { automations, create, update, remove, toast } = useApp();
  const [builder, setBuilder] = useState(null); // the rule being written
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const worked = (r) => (r.runs ? Math.round((r.completed / r.runs) * 100) : 0);

  const openNew = () => {
    setEditingId(null);
    setBuilder(blankRule());
  };
  const openEdit = (rule) => {
    setEditingId(rule.id);
    setBuilder(JSON.parse(JSON.stringify(rule)));
  };

  const set = (key, value) => setBuilder((b) => ({ ...b, [key]: value }));

  const toggleCondition = (c) =>
    setBuilder((b) => ({
      ...b,
      conditions: b.conditions.includes(c)
        ? b.conditions.filter((x) => x !== c)
        : [...b.conditions, c],
    }));

  const addAction = (dayIndex, action) =>
    setBuilder((b) => ({
      ...b,
      days: b.days.map((d, i) =>
        i === dayIndex && !d.actions.includes(action) ? { ...d, actions: [...d.actions, action] } : d
      ),
    }));

  const removeAction = (dayIndex, action) =>
    setBuilder((b) => ({
      ...b,
      days: b.days.map((d, i) =>
        i === dayIndex ? { ...d, actions: d.actions.filter((a) => a !== action) } : d
      ),
    }));

  const addDay = () =>
    setBuilder((b) => ({
      ...b,
      days: [...b.days, { day: (b.days[b.days.length - 1]?.day || 0) + 1, actions: [] }],
    }));

  const removeDay = (i) =>
    setBuilder((b) => ({ ...b, days: b.days.length > 1 ? b.days.filter((_, x) => x !== i) : b.days }));

  const save = (status) => {
    if (!builder.name.trim()) {
      toast('Give the rule a name first', 'danger');
      return;
    }
    if (!builder.trigger) {
      toast('Choose what starts this rule', 'danger');
      return;
    }
    const payload = { ...builder, status };
    if (editingId) update('automations', editingId, payload, { message: `${builder.name} saved` });
    else
      create('automations', {
        ...payload,
        runs: 0,
        completed: 0,
        errors: 0,
        leads: 0,
        lastRun: 'never',
      });
    setBuilder(null);
  };

  const duplicate = (rule) => {
    const { id, ...rest } = rule;
    create('automations', {
      ...rest,
      name: `${rule.name} (copy)`,
      status: 'Draft',
      runs: 0,
      completed: 0,
      errors: 0,
      leads: 0,
      lastRun: 'never',
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'Rule name',
      render: (r) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="truncate font-bold text-ink-900">{r.name}</p>
          <p className="truncate text-xs text-ink-500">{r.description}</p>
        </div>
      ),
    },
    {
      key: 'lastRun',
      header: 'Last run',
      render: (r) => (
        <span className="chip whitespace-nowrap bg-amber-50 text-amber-800 ring-1 ring-amber-600/15">
          <Zap size={11} /> {r.lastRun}
        </span>
      ),
    },
    { key: 'runs', header: 'No of runs', render: (r) => <span className="num font-bold text-ink-900">{r.runs.toLocaleString('en-IN')}</span> },
    { key: 'completed', header: 'Completed', render: (r) => <span className="num text-ink-700">{r.completed.toLocaleString('en-IN')}</span> },
    {
      key: 'errors',
      header: 'Errors',
      render: (r) => (
        <span className={`num font-semibold ${r.errors > 0 ? 'text-rose-600' : 'text-ink-500'}`}>
          {r.errors}
        </span>
      ),
    },
    { key: 'leads', header: 'Leads', render: (r) => <span className="num text-ink-700">{r.leads.toLocaleString('en-IN')}</span> },
    {
      key: 'worked',
      header: 'Worked',
      csv: (r) => `${worked(r)}%`,
      render: (r) => (
        <div className="w-[80px]">
          <p className="num text-sm font-bold text-ink-900">{worked(r)}%</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-soft">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${worked(r)}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Badge tone={statusTone[r.status]} dot>
            {r.status}
          </Badge>
          <button
            onClick={() =>
              update(
                'automations',
                r.id,
                { status: r.status === 'Active' ? 'Paused' : 'Active' },
                { message: `${r.name} ${r.status === 'Active' ? 'paused' : 'switched on'}` }
              )
            }
            title={r.status === 'Active' ? 'Switch off' : 'Switch on'}
            className={`relative h-5 w-9 shrink-0 rounded-full transition ${
              r.status === 'Active' ? 'bg-brand-600' : 'bg-ink-900/15'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                r.status === 'Active' ? 'left-[18px]' : 'left-0.5'
              }`}
            />
          </button>
          <button onClick={() => duplicate(r)} title="Duplicate rule" className="icon-btn h-8 w-8">
            <Copy size={14} />
          </button>
          <button
            onClick={() => setConfirm([r.id])}
            title="Delete rule"
            className="icon-btn-danger h-8 w-8"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={`Automation rules (${automations.length})`}
        subtitle="Rules that do the routine work for you"
      >
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> New rule
        </button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Rules', value: automations.length },
          { label: 'Switched on', value: automations.filter((r) => r.status === 'Active').length, tone: 'text-emerald-700' },
          { label: 'Times run', value: automations.reduce((s, r) => s + r.runs, 0).toLocaleString('en-IN') },
          {
            label: 'Errors',
            value: automations.reduce((s, r) => s + r.errors, 0),
            tone: automations.reduce((s, r) => s + r.errors, 0) > 0 ? 'text-rose-600' : 'text-ink-900',
          },
        ].map((s) => (
          <div key={s.label} className="card px-5 py-4">
            <p className="text-sm font-semibold text-ink-500">{s.label}</p>
            <p className={`num mt-1 font-display text-2xl font-extrabold ${s.tone || 'text-ink-900'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={automations}
        selectable={false}
        searchKeys={['name', 'description', 'trigger']}
        searchPlaceholder="Search automation rules…"
        filters={[{ key: 'status', label: 'Status', options: STATUS }]}
        exportName="smira-club-automation-rules"
        emptyLabel="No automation rules yet"
        defaultView="cards"
        onRowClick={openEdit}
      />

      {/* Rule builder */}
      <Modal
        open={Boolean(builder)}
        onClose={() => setBuilder(null)}
        title={editingId ? 'Edit rule' : 'New automation rule'}
        subtitle="When something happens, do this"
        size="xl"
        footer={
          <>
            <button className="btn-ghost" onClick={() => save('Draft')}>
              <Save size={15} /> Save as draft
            </button>
            <button className="btn-primary" onClick={() => save('Active')}>
              <Eye size={15} /> Create and switch on
            </button>
          </>
        }
      >
        {builder && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">
                  Rule name <span className="text-coral">*</span>
                </label>
                <input
                  className="input"
                  value={builder.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Ringing rules"
                />
                <p className="mt-1.5 text-xs text-ink-400">
                  A clear name so the team knows what it does.
                </p>
              </div>
              <div>
                <label className="label">Rule description</label>
                <input
                  className="input"
                  value={builder.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Chase leads nobody answered"
                />
                <p className="mt-1.5 text-xs text-ink-400">Explain when it should fire.</p>
              </div>
            </div>

            {/* Step 1 */}
            <section className="rounded-2xl border border-ink-900/[0.07] bg-surface-soft/40 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 font-display text-sm font-extrabold text-white">
                  1
                </span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-ink-900">
                    When this happens…
                  </h3>
                  <p className="text-sm text-ink-500">Choose the event that starts the rule</p>
                </div>
              </div>

              <select
                className="input mt-4 bg-white"
                value={builder.trigger}
                onChange={(e) => set('trigger', e.target.value)}
              >
                <option value="">Select trigger</option>
                {TRIGGERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <p className="eyebrow mt-5 mb-2">And only when</p>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => {
                  const on = builder.conditions.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCondition(c)}
                      className={`chip transition ${
                        on
                          ? 'bg-brand-600 text-white'
                          : 'bg-white text-ink-600 ring-1 ring-ink-900/10 hover:text-ink-900'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              {builder.conditions.length === 0 && (
                <p className="mt-2 text-xs text-ink-400">
                  No conditions picked — the rule runs every time the trigger fires.
                </p>
              )}
            </section>

            {/* Step 2 */}
            <section className="rounded-2xl border border-ink-900/[0.07] bg-surface-soft/40 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 font-display text-sm font-extrabold text-white">
                  2
                </span>
                <div>
                  <h3 className="font-display text-base font-extrabold text-ink-900">Then do this…</h3>
                  <p className="text-sm text-ink-500">Actions run on the day you put them on</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {builder.days.map((d, i) => (
                  <div key={i} className="rounded-xl border border-ink-900/[0.07] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone="teal">Day {d.day}</Badge>
                      {builder.days.length > 1 && (
                        <button
                          onClick={() => removeDay(i)}
                          className="text-xs font-semibold text-ink-400 hover:text-rose-600"
                        >
                          Remove day
                        </button>
                      )}
                    </div>

                    {d.actions.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {d.actions.map((a) => (
                          <li
                            key={a}
                            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-900"
                          >
                            <ArrowRight size={13} className="shrink-0 text-brand-600" />
                            <span className="flex-1">{a}</span>
                            <button
                              onClick={() => removeAction(i, a)}
                              className="shrink-0 text-brand-700 hover:text-rose-600"
                            >
                              <X size={13} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <select
                      className="input mt-3"
                      value=""
                      onChange={(e) => e.target.value && addAction(i, e.target.value)}
                    >
                      <option value="">+ Add action</option>
                      {ACTIONS.filter((a) => !d.actions.includes(a)).map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                ))}

                <button
                  onClick={addDay}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-400 bg-brand-50/50 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
                >
                  <Plus size={15} /> Add day
                </button>
              </div>
            </section>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('automations', confirm)}
        title="Delete this rule?"
        message="It stops running immediately. Records it already touched are not changed."
      />
    </>
  );
}
