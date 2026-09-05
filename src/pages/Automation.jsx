import { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GripVertical,
  ShieldCheck,
  MessageCircle,
  Trash2,
  ArrowUp,
  ArrowDown,
  Radio,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useApp } from '../store/AppStore.jsx';
import Block from '../components/ui/Block.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import {
  triggers,
  conditionFields,
  operators,
  actions,
  builderShape,
  rules as seedRules,
  leadStages as seedStages,
  followUpSequence as seedSequence,
  configureBy,
  branchRules,
  roleRules,
  approvalRules,
  approvalSettings,
  whatsappRules,
  templateVariables,
  escalationRules as seedEscalations,
  templates,
  customFields as seedFields,
  history,
  structure,
  waitOptions,
  recipients,
  failedJobs,
  webhooks,
  automationPermissions,
} from '../data/automationData.js';

const SECTIONS = [
  'Dashboard',
  'Builder',
  'Rules',
  'Follow-ups',
  'Lead journey',
  'Branch and roles',
  'Approvals',
  'WhatsApp',
  'Escalations',
  'Templates',
  'Custom fields',
  'History',
  'Failed jobs',
  'API and webhooks',
  'Permissions',
  'Structure',
];

function Table({ head, rows, empty = 'Nothing here yet.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
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
            <tr key={r.key} className="hover:bg-surface-soft">
              {r.cells.map((c, i) => (
                <td key={i} className={`py-2.5 ${i === 0 ? 'font-bold text-ink-900' : 'text-ink-700'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-6 text-center text-ink-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** One line of a rule, written the way the builder writes it. */
function RuleLine({ label, value, tone = 'bg-surface-soft text-ink-800' }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">{label}</span>
      <span className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tone}`}>{value}</span>
    </div>
  );
}

/**
 * Automation as the client's sheet describes it: what starts a rule, what it
 * checks, what it does, who has to approve it, and the log that shows it
 * happened.
 */
export default function Automation() {
  const { automations, create, update, remove, toast } = useApp();
  const [section, setSection] = useState('Dashboard');
  const [stages, setStages] = useState(seedStages);
  const [sequence, setSequence] = useState(seedSequence);
  const [escalations, setEscalations] = useState(seedEscalations);
  const [fields, setFields] = useState(seedFields);
  const [newStage, setNewStage] = useState('');
  const [newField, setNewField] = useState({ name: '', kind: 'Text', usedIn: 'Lead form' });
  const [draft, setDraft] = useState({
    name: '',
    trigger: triggers[0],
    conditions: [{ field: conditionFields[0], op: operators[0], value: 'Website', join: 'AND' }],
    steps: [{ wait: 'Immediately', action: actions[0] }],
    otherwise: '',
  });

  const rules = automations || [];

  /** The builder's own edits. */
  const setCondition = (i, patch) =>
    setDraft((d) => ({ ...d, conditions: d.conditions.map((c, n) => (n === i ? { ...c, ...patch } : c)) }));
  const addCondition = () =>
    setDraft((d) => ({
      ...d,
      conditions: [...d.conditions, { field: conditionFields[0], op: operators[0], value: '', join: 'AND' }],
    }));
  const dropCondition = (i) =>
    setDraft((d) => ({ ...d, conditions: d.conditions.filter((_, n) => n !== i) }));
  const setStep = (i, patch) =>
    setDraft((d) => ({ ...d, steps: d.steps.map((x, n) => (n === i ? { ...x, ...patch } : x)) }));
  const addStep = () =>
    setDraft((d) => ({ ...d, steps: [...d.steps, { wait: waitOptions[1], action: actions[0] }] }));
  const dropStep = (i) => setDraft((d) => ({ ...d, steps: d.steps.filter((_, n) => n !== i) }));

  const saveRule = () => {
    if (!draft.name.trim()) { toast('Give the rule a name first', 'info'); return; }
    create('automations', {
      name: draft.name.trim(),
      when: draft.trigger,
      conditions: draft.conditions,
      steps: draft.steps,
      otherwise: draft.otherwise,
      runs: 0,
      completed: 0,
      errors: 0,
      status: 'On',
      lastRun: 'never',
    });
    setDraft((d) => ({ ...d, name: '' }));
    setSection('Rules');
  };

  const toggleRule = (r) =>
    update('automations', r.id, { status: r.status === 'On' ? 'Off' : 'On' }, {
      message: `${r.name} ${r.status === 'On' ? 'switched off' : 'switched on'}`,
    });
  const runRule = (r) =>
    update('automations', r.id, { runs: Number(r.runs || 0) + 1, completed: Number(r.completed || 0) + 1, lastRun: 'just now' }, {
      message: `${r.name} ran once`,
    });

  /** Stages can be added, renamed, reordered and removed. */
  const moveStage = (i, by) =>
    setStages((list) => {
      const to = i + by;
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      [next[i], next[to]] = [next[to], next[i]];
      return next;
    });

  const on = rules.filter((r) => r.status === 'On');
  const runs = rules.reduce((s, r) => s + r.runs, 0);
  const done = rules.reduce((s, r) => s + r.completed, 0);
  const errors = rules.reduce((s, r) => s + r.errors, 0);
  const failed = history.filter((h) => h.status === 'Failed');

  const body = {
    Dashboard: (
      <>
        <div className="grid gap-4 xl:col-span-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section className="card relative overflow-hidden p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/12 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Work done without anyone</p>
              <p className="num mt-2 font-display text-4xl font-extrabold leading-none text-ink-900">{runs}</p>
              <p className="mt-1.5 text-sm text-ink-500">
                actions run by {on.length} live {on.length === 1 ? 'rule' : 'rules'}
              </p>
              <div className="mt-5">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  <span>Completed cleanly</span>
                  <span className="num">{Math.round((done / Math.max(1, runs)) * 100)}%</span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.round((done / Math.max(1, runs)) * 100)}%` }} />
                </div>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-sm">
                <Zap size={14} className="text-ink-400" />
                {errors ? `${errors} needed a person` : 'Nothing needed a person'}
              </p>
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Rules</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Switched on', value: on.length, tone: 'bg-emerald-500' },
                { label: 'Switched off', value: rules.length - on.length, tone: 'bg-ink-900/25' },
                { label: 'Ready-made templates', value: Object.values(templates).flat().length, tone: 'bg-brand-500' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-2xl font-extrabold text-ink-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Needs looking at</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Failed jobs', value: failed.length, tone: 'bg-rose-500' },
                { label: 'Waiting on approval', value: approvalRules.length, tone: 'bg-amber-500' },
                { label: 'Escalation rules', value: escalations.length, tone: 'bg-sky-500' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-2xl font-extrabold text-ink-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="card grid divide-y divide-ink-900/[0.07] sm:grid-cols-2 sm:divide-y-0 xl:col-span-2 xl:grid-cols-3 2xl:grid-cols-6 sm:[&>*:not(:first-child)]:border-l sm:[&>*]:border-ink-900/[0.07]">
          {[
            { label: 'Triggers available', value: triggers.length },
            { label: 'Actions available', value: actions.length },
            { label: 'Lead stages', value: stages.length },
            { label: 'Custom fields', value: fields.length },
            { label: 'Approval chains', value: approvalRules.length },
            { label: 'Logged today', value: history.length },
          ].map((g) => (
            <div key={g.label} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{g.label}</p>
              <p className="num mt-1.5 font-display text-2xl font-extrabold text-ink-900">{g.value}</p>
            </div>
          ))}
        </div>

        <Block title="What is running right now" note="Every live rule and how it is doing" wide>
          <Table
            head={['Rule', 'When', 'Steps', 'Runs', 'Completed', 'Errors', 'Last run', 'Status']}
            rows={rules.map((r) => ({
              key: r.id,
              cells: [
                r.name,
                <Badge tone="violet">{r.when}</Badge>,
                <span className="num">{r.steps.length}</span>,
                <span className="num">{r.runs}</span>,
                <span className="num text-emerald-600">{r.completed}</span>,
                <span className={`num ${r.errors ? 'font-bold text-rose-600' : ''}`}>{r.errors}</span>,
                <span className="num">{r.lastRun}</span>,
                <Badge tone={r.status === 'On' ? 'green' : 'slate'} dot>
                  {r.status}
                </Badge>,
              ],
            }))}
          />
        </Block>
      </>
    ),

    Builder: (
      <Block
        title="Build a rule"
        note="When this happens, if that is true, then do this — and this if it is not"
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input h-9 w-52 py-0 text-sm"
              placeholder="Name this rule"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <button className="btn-action btn-sm" onClick={saveRule}>
              <Plus size={14} /> Create rule
            </button>
          </div>
        }
      >
        <div className="space-y-4 rounded-xl border border-ink-900/[0.07] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">When</span>
            <select
              className="input h-9 w-auto py-0 text-sm"
              value={draft.trigger}
              onChange={(e) => setDraft({ ...draft, trigger: e.target.value })}
            >
              {triggers.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {draft.conditions.map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">
                {i === 0 ? 'If' : (
                  <select
                    className="input h-7 w-auto py-0 text-[11px] font-bold uppercase"
                    value={c.join}
                    onChange={(e) => setCondition(i, { join: e.target.value })}
                  >
                    <option>AND</option>
                    <option>OR</option>
                  </select>
                )}
              </span>
              <select
                className="input h-9 w-auto py-0 text-sm"
                value={c.field}
                onChange={(e) => setCondition(i, { field: e.target.value })}
              >
                {conditionFields.map((f) => <option key={f}>{f}</option>)}
              </select>
              <select
                className="input h-9 w-auto py-0 text-sm"
                value={c.op}
                onChange={(e) => setCondition(i, { op: e.target.value })}
              >
                {operators.map((o) => <option key={o}>{o}</option>)}
              </select>
              <input
                className="input h-9 w-40 py-0 text-sm"
                value={c.value}
                onChange={(e) => setCondition(i, { value: e.target.value })}
              />
              {draft.conditions.length > 1 && (
                <button className="icon-btn-danger h-8 w-8" onClick={() => dropCondition(i)} title="Remove">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
          <button className="chip ml-16 text-ink-600 hover:text-ink-900" onClick={addCondition}>
            <Plus size={12} /> and / or another condition
          </button>

          {draft.steps.map((step, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">
                {i === 0 ? 'Then' : 'Wait'}
              </span>
              {i > 0 && (
                <select
                  className="input h-9 w-auto py-0 text-sm"
                  value={step.wait}
                  onChange={(e) => setStep(i, { wait: e.target.value })}
                >
                  {waitOptions.map((w) => <option key={w}>{w}</option>)}
                </select>
              )}
              <select
                className="input h-9 w-auto py-0 text-sm"
                value={step.action}
                onChange={(e) => setStep(i, { action: e.target.value })}
              >
                {actions.map((a) => <option key={a}>{a}</option>)}
              </select>
              {draft.steps.length > 1 && (
                <button className="icon-btn-danger h-8 w-8" onClick={() => dropStep(i)} title="Remove">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
          <button className="chip ml-16 text-ink-600 hover:text-ink-900" onClick={addStep}>
            <Plus size={12} /> wait, then do something else
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">Else</span>
            <select
              className="input h-9 w-auto py-0 text-sm"
              value={draft.otherwise}
              onChange={(e) => setDraft({ ...draft, otherwise: e.target.value })}
            >
              <option value="">Do nothing</option>
              {actions.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>

          <div className="rounded-xl bg-surface-soft p-4">
            <p className="eyebrow">Reads as</p>
            <p className="mt-1.5 text-sm text-ink-800">
              When <b>{draft.trigger.toLowerCase()}</b>
              {draft.conditions.map((c, i) => (
                <span key={i}>
                  {i === 0 ? ', if ' : ` ${c.join.toLowerCase()} `}
                  <b>{c.field.toLowerCase()}</b> {c.op} <b>{c.value || 'anything'}</b>
                </span>
              ))}
              , then{' '}
              {draft.steps.map((step, i) => (
                <span key={i}>
                  {i > 0 && `, ${step.wait.toLowerCase()} `}
                  <b>{step.action.toLowerCase()}</b>
                </span>
              ))}
              {draft.otherwise ? <> — otherwise <b>{draft.otherwise.toLowerCase()}</b></> : null}.
            </p>
          </div>

          <div>
            <p className="eyebrow">The shape the sheet asks for</p>
            <ul className="mt-2 space-y-1">
              {builderShape.map((line) => (
                <li key={line} className="num text-[13px] text-ink-500">{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </Block>
    ),

    Rules: (
      <>
        {rules.map((r) => (
          <Block
            key={r.id}
            title={r.name}
            note={`${r.runs} runs · ${r.errors} errors · last ran ${String(r.lastRun || 'never').toLowerCase()}`}
            action={
              <span className="flex flex-wrap items-center gap-1.5">
                <Badge tone={r.status === 'On' ? 'green' : 'slate'} dot>{r.status}</Badge>
                <button className="btn-line btn-sm" onClick={() => runRule(r)}>
                  <Play size={12} /> Run now
                </button>
                <button className="btn-line btn-sm" onClick={() => toggleRule(r)}>
                  {r.status === 'On' ? 'Turn off' : 'Turn on'}
                </button>
                <button className="btn-line-danger btn-sm" onClick={() => remove('automations', r.id)}>
                  Delete
                </button>
              </span>
            }
          >
            <div className="space-y-2.5">
              <RuleLine label="When" value={r.when} tone="bg-violet-100 text-violet-800" />
              {(r.conditions || []).map((c, i) => (
                <RuleLine key={`${c.field}-${i}`} label={i === 0 ? 'If' : c.join || 'And'} value={`${c.field} ${c.op} ${c.value}`} />
              ))}
              {(r.steps || []).map((s, i) => (
                <RuleLine
                  key={`${s.wait}-${i}`}
                  label={i === 0 ? 'Then' : 'And'}
                  value={`${s.wait} · ${s.action}`}
                  tone="bg-brand-50 text-brand-800"
                />
              ))}
              {r.otherwise && <RuleLine label="Else" value={r.otherwise} tone="bg-amber-50 text-amber-800" />}
            </div>
          </Block>
        ))}
      </>
    ),

    'Follow-ups': (
      <Block title="Follow-up sequence" note="What happens to a lead nobody has closed, and when" wide>
        <ol className="space-y-2">
          {sequence.map((step, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-900/[0.07] px-4 py-2.5">
              <Clock size={14} className="shrink-0 text-ink-300" />
              <select
                className="input h-8 w-auto py-0 text-sm"
                value={step.at}
                onChange={(e) => setSequence((l) => l.map((x, n) => (n === i ? { ...x, at: e.target.value } : x)))}
              >
                {[...new Set([step.at, ...waitOptions])].map((w) => <option key={w}>{w}</option>)}
              </select>
              <select
                className="input h-8 min-w-0 flex-1 py-0 text-sm"
                value={step.does}
                onChange={(e) => setSequence((l) => l.map((x, n) => (n === i ? { ...x, does: e.target.value } : x)))}
              >
                {[...new Set([step.does, ...actions])].map((a) => <option key={a}>{a}</option>)}
              </select>
              <button
                className="icon-btn-danger h-8 w-8"
                onClick={() => setSequence((l) => l.filter((_, n) => n !== i))}
                title="Remove"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ol>
        <button
          className="chip mt-3 text-ink-600 hover:text-ink-900"
          onClick={() => setSequence((l) => [...l, { at: waitOptions[1], does: actions[0] }])}
        >
          <Plus size={12} /> Add a step
        </button>
        <p className="mt-3 text-xs text-ink-400">Every gap here is set by the admin — nothing is fixed in the code.</p>
      </Block>
    ),

    'Lead journey': (
      <Block
        title="Lead stages"
        note="Add, remove, rename or reorder — this is the pipeline the desk works"
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input h-9 w-44 py-0 text-sm"
              placeholder="New stage name"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
            />
            <button
              className="btn-action btn-sm"
              disabled={!newStage.trim()}
              onClick={() => { setStages((l) => [...l, newStage.trim()]); setNewStage(''); toast('Stage added'); }}
            >
              <Plus size={14} /> Add stage
            </button>
          </div>
        }
      >
        <ul className="space-y-2">
          {stages.map((s, i) => (
            <li key={`${s}-${i}`} className="flex items-center gap-3 rounded-xl border border-ink-900/[0.07] px-4 py-2.5">
              <GripVertical size={15} className="shrink-0 text-ink-300" />
              <span className="num w-6 shrink-0 text-sm font-bold text-ink-400">{i + 1}</span>
              <input
                className="input h-8 min-w-0 flex-1 py-0 text-sm font-semibold"
                value={s}
                onChange={(e) => setStages((l) => l.map((x, n) => (n === i ? e.target.value : x)))}
              />
              <button className="icon-btn h-8 w-8" onClick={() => moveStage(i, -1)} title="Move up">
                <ArrowUp size={13} />
              </button>
              <button className="icon-btn h-8 w-8" onClick={() => moveStage(i, 1)} title="Move down">
                <ArrowDown size={13} />
              </button>
              <button
                className="icon-btn-danger h-8 w-8"
                onClick={() => setStages((l) => l.filter((_, n) => n !== i))}
                title="Remove"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      </Block>
    ),

    'Branch and roles': (
      <>
        <Block title="Branch rules" note="Different desks, different routing">
          <Table
            head={['Branch', 'Rule']}
            rows={branchRules.map((b, i) => ({ key: `${b.branch}-${i}`, cells: [b.branch, b.rule] }))}
          />
          <p className="eyebrow mt-5">Automation can be cut by</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {configureBy.map((c) => (
              <span key={c} className="chip text-ink-600">
                {c}
              </span>
            ))}
          </div>
        </Block>

        <Block title="Role rules" note="What each role is handed automatically">
          <Table head={['Role', 'Gets']} rows={roleRules.map((r) => ({ key: r.role, cells: [r.role, r.gets] }))} />
        </Block>
      </>
    ),

    Approvals: (
      <>
        <Block title="What needs a signature" note="Money and discounts never go through on their own" wide>
          <ul className="space-y-3">
            {approvalRules.map((a) => (
              <li key={a.id} className="rounded-xl border border-ink-900/[0.07] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-ink-900">{a.trigger}</p>
                  <Badge tone="amber">Limit {a.limit}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
                  {a.chain.map((step, i) => (
                    <span key={step} className="flex items-center gap-2">
                      {i > 0 && <span className="text-ink-300">→</span>}
                      <span className="flex items-center gap-1.5 rounded-lg bg-surface-soft px-2.5 py-1.5 font-semibold text-ink-700">
                        <ShieldCheck size={13} className="text-brand-600" /> {step}
                      </span>
                    </span>
                  ))}
                </div>
                <p className="mt-2.5 text-xs text-ink-500">
                  Escalates after {a.escalation} · {a.auto}
                </p>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-5">The admin decides</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {approvalSettings.map((s) => (
              <span key={s} className="chip text-ink-600">
                {s}
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    WhatsApp: (
      <>
        <Block title="WhatsApp rules" note="What goes out, and exactly when" wide>
          <Table
            head={['When this happens', 'Send this']}
            rows={whatsappRules.map((w) => ({
              key: w.when,
              cells: [
                w.when,
                <span className="flex items-center gap-2 text-ink-700">
                  <MessageCircle size={14} className="text-emerald-600" /> {w.then}
                </span>,
              ],
            }))}
          />
        </Block>

        <Block title="Variables every template carries" note="The customer's own details drop straight in" wide>
          <div className="flex flex-wrap gap-2">
            {templateVariables.map((v) => (
              <span key={v} className="num chip text-brand-700">
                {v}
              </span>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
            Hi {'{Customer name}'}, your {'{Membership}'} is confirmed for {'{Travel date}'} — booking{' '}
            {'{Booking ID}'}, {'{Amount}'} received. Any questions, {'{Employee name}'} is on hand.
          </p>
        </Block>
      </>
    ),

    Escalations: (
      <Block title="Nobody sits on a lead" note="Untouched for too long, and it climbs" wide>
        <ol className="space-y-2">
          {escalations.map((e, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-900/[0.07] px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-400">If untouched for</span>
              <input
                className="input h-8 w-36 py-0 text-sm"
                value={e.after}
                onChange={(e2) => setEscalations((l) => l.map((x, n) => (n === i ? { ...x, after: e2.target.value } : x)))}
              />
              <span className="text-xs font-bold uppercase tracking-wide text-ink-400">then tell</span>
              <select
                className="input h-8 min-w-0 flex-1 py-0 text-sm"
                value={e.then}
                onChange={(e2) => setEscalations((l) => l.map((x, n) => (n === i ? { ...x, then: e2.target.value } : x)))}
              >
                {[...new Set([e.then, ...recipients.map((r) => `Notify ${r.toLowerCase()}`)])].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <button
                className="icon-btn-danger h-8 w-8"
                onClick={() => setEscalations((l) => l.filter((_, n) => n !== i))}
                title="Remove"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ol>
        <button
          className="chip mt-3 text-ink-600 hover:text-ink-900"
          onClick={() => setEscalations((l) => [...l, { after: '48 hours untouched', then: `Notify ${recipients[2].toLowerCase()}` }])}
        >
          <Plus size={12} /> Add an escalation
        </button>
        <p className="mt-3 text-xs text-ink-400">Both the time and who gets told are set by the admin.</p>
      </Block>
    ),

    Templates: (
      <Block title="Ready-made automations" note="Switch one on rather than building it" wide>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Object.entries(templates).map(([group, list]) => (
            <div key={group} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">{group}</p>
              <ul className="mt-2 space-y-1.5">
                {list.map((t) => (
                  <li key={t}>
                    <button onClick={() => toast(`${t} switched on`)} className="text-left text-sm text-ink-700 hover:text-brand-700">
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Block>
    ),

    'Custom fields': (
      <Block
        title="Fields the admin invents"
        note="Once a field exists, a rule can check it"
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input h-9 w-44 py-0 text-sm"
              placeholder="Field name"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            />
            <select
              className="input h-9 w-auto py-0 text-sm"
              value={newField.kind}
              onChange={(e) => setNewField({ ...newField, kind: e.target.value })}
            >
              {['Text', 'Number', 'Dropdown', 'Date', 'Yes or no', 'Money'].map((k) => <option key={k}>{k}</option>)}
            </select>
            <select
              className="input h-9 w-auto py-0 text-sm"
              value={newField.usedIn}
              onChange={(e) => setNewField({ ...newField, usedIn: e.target.value })}
            >
              {['Lead form', 'Customer profile', 'Booking form', 'Membership form', 'Sales questions'].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
            <button
              className="btn-action btn-sm"
              disabled={!newField.name.trim()}
              onClick={() => {
                setFields((l) => [...l, { ...newField, name: newField.name.trim() }]);
                setNewField({ name: '', kind: 'Text', usedIn: 'Lead form' });
                toast('Field added — a rule can check it now');
              }}
            >
              <Plus size={14} /> Add field
            </button>
          </div>
        }
      >
        <Table
          head={['Field', 'Kind', 'Where it is used', '']}
          rows={fields.map((f, i) => ({
            key: `${f.name}-${i}`,
            cells: [
              f.name,
              <Badge tone="teal">{f.kind}</Badge>,
              f.usedIn,
              <button
                className="btn-line-danger btn-sm"
                onClick={() => setFields((l) => l.filter((_, n) => n !== i))}
              >
                Remove
              </button>,
            ],
          }))}
        />
        <p className="mt-3 text-xs text-ink-400">
          A field invented here shows up in the builder's condition list, so a rule can branch on it.
        </p>
      </Block>
    ),

    History: (
      <Block title="Everything the panel did on its own" note="Timed, named and traceable to the rule that did it" wide>
        <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
          {history.map((h, i) => (
            <li key={`${h.at}-${i}`} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="num w-24 shrink-0 text-xs font-semibold text-ink-400">{h.at}</span>
              <span className="num w-24 shrink-0 text-xs font-bold text-brand-700">{h.lead}</span>
              <span className="min-w-0 flex-1 text-sm text-ink-800">{h.text}</span>
              <span className="num shrink-0 text-xs text-ink-400">{h.rule}</span>
              {h.status === 'Failed' ? (
                <Badge tone="rose" dot>
                  <AlertTriangle size={11} /> Failed
                </Badge>
              ) : (
                <Badge tone="green" dot>
                  <CheckCircle2 size={11} /> Done
                </Badge>
              )}
            </li>
          ))}
        </ul>
        {failed.length > 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertTriangle size={15} className="shrink-0" />
            {failed.length} failed {failed.length === 1 ? 'job' : 'jobs'} — they sit here until somebody clears them.
          </p>
        )}
      </Block>
    ),

    'Failed jobs': (
      <Block title="Runs that did not finish" note="What broke, how many times it was tried, and what happens next" wide>
        <Table
          head={['Job', 'Rule', 'Ran at', 'What it was working on', 'Why it failed', 'Attempts', 'Stage', '']}
          empty="Nothing has failed."
          rows={failedJobs.map((j) => ({
            key: j.id,
            cells: [
              <span className="num text-brand-700">{j.id}</span>,
              j.rule,
              <span className="num text-ink-500">{j.ran}</span>,
              j.target,
              <span className="text-rose-700">{j.reason}</span>,
              <span className="num">{j.attempts}</span>,
              <Badge tone={j.stage === 'Given up' ? 'rose' : j.stage === 'Retrying' ? 'amber' : 'slate'} dot>
                {j.stage}
              </Badge>,
              <button className="btn-line btn-sm" onClick={() => toast(`${j.id} queued to run again`)}>
                Retry
              </button>,
            ],
          }))}
        />
      </Block>
    ),

    'API and webhooks': (
      <Block title="What the panel listens to and shouts at" note="Where automation events come in from, and where they go" wide>
        <Table
          head={['Integration', 'Direction', 'Event', 'Endpoint', 'Status', 'Last fired', '']}
          rows={webhooks.map((w) => ({
            key: w.name,
            cells: [
              <span className="flex items-center gap-2">
                <Radio size={14} className={w.status === 'Live' ? 'text-emerald-600' : 'text-ink-300'} />
                {w.name}
              </span>,
              <Badge tone={w.direction === 'Incoming' ? 'sky' : 'violet'}>{w.direction}</Badge>,
              w.event,
              <span className="num truncate text-xs text-ink-500">{w.url}</span>,
              <Badge tone={w.status === 'Live' ? 'green' : 'slate'} dot>{w.status}</Badge>,
              <span className="num text-ink-500">{w.lastFired}</span>,
              <button className="btn-line btn-sm" onClick={() => toast(`Test event sent to ${w.name}`)}>
                Send test
              </button>,
            ],
          }))}
        />
      </Block>
    ),

    Permissions: (
      <Block title="Who may touch the automations" note="Creating a rule is not the same as switching one off" wide>
        <Table
          head={['Role', 'Create', 'Edit', 'Switch off', 'Approvals', 'Logs they can read']}
          rows={automationPermissions.map((r) => ({
            key: r.role,
            cells: [
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand-600" /> {r.role}
              </span>,
              r.create,
              r.edit,
              r.switchOff,
              r.approvals,
              r.logs,
            ],
          }))}
        />
      </Block>
    ),

    Structure: (
      <Block title="What sits under automation" note="Everything the admin panel holds" wide>
        <div className="flex flex-wrap gap-2">
          {structure.map((s) => (
            <span key={s} className="chip text-ink-600">
              <Play size={11} /> {s}
            </span>
          ))}
        </div>
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="Automation" subtitle="What the panel does without anyone asking it">
        <button className="btn-line" onClick={() => setSection('Templates')}>
          Templates
        </button>
        <button className="btn-action" onClick={() => setSection('Builder')}>
          <Plus size={16} /> New rule
        </button>
      </PageHeader>

      <SectionTabs
        className="mb-5"
        items={SECTIONS}
        value={section}
        onChange={setSection}
      />

      <div className="grid gap-5 xl:grid-cols-2">{body[section]}</div>
    </>
  );
}
