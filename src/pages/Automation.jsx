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
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useApp } from '../store/AppStore.jsx';
import {
  triggers,
  conditionFields,
  operators,
  actions,
  builderShape,
  rules,
  leadStages,
  followUpSequence,
  configureBy,
  branchRules,
  roleRules,
  approvalRules,
  approvalSettings,
  whatsappRules,
  templateVariables,
  escalationRules,
  templates,
  customFields,
  history,
  structure,
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
  'Structure',
];

function Block({ title, note, wide, action, children }) {
  return (
    <section className={`card p-5 ${wide ? 'xl:col-span-2' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-extrabold text-ink-900">{title}</h3>
          {note && <p className="mt-0.5 text-sm text-ink-500">{note}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, hint, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-xl font-extrabold ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

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
  const { toast } = useApp();
  const [section, setSection] = useState('Dashboard');
  const [draft, setDraft] = useState({
    trigger: triggers[0],
    field: conditionFields[0],
    op: operators[0],
    value: 'Website',
    action: actions[0],
    wait: 'After 10 minutes',
    next: actions[2],
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
                { label: 'Escalation rules', value: escalationRules.length, tone: 'bg-sky-500' },
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
            { label: 'Lead stages', value: leadStages.length },
            { label: 'Custom fields', value: customFields.length },
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
        note="When this happens, if that is true, then do this"
        wide
        action={
          <button className="btn-primary btn-sm" onClick={() => toast('Rule saved and switched on')}>
            <Plus size={14} /> Create rule
          </button>
        }
      >
        <div className="space-y-4 rounded-xl border border-ink-900/[0.07] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">When</span>
            <select className="input h-9 w-auto py-0 text-sm" value={draft.trigger} onChange={(e) => setDraft({ ...draft, trigger: e.target.value })}>
              {triggers.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">If</span>
            <select className="input h-9 w-auto py-0 text-sm" value={draft.field} onChange={(e) => setDraft({ ...draft, field: e.target.value })}>
              {conditionFields.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <select className="input h-9 w-auto py-0 text-sm" value={draft.op} onChange={(e) => setDraft({ ...draft, op: e.target.value })}>
              {operators.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input className="input h-9 w-40 py-0 text-sm" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
            <button className="chip text-ink-600 hover:text-ink-900" onClick={() => toast('Second condition added')}>
              and / or
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">Then</span>
            <select className="input h-9 w-auto py-0 text-sm" value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })}>
              {actions.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-400">Wait</span>
            <select className="input h-9 w-auto py-0 text-sm" value={draft.wait} onChange={(e) => setDraft({ ...draft, wait: e.target.value })}>
              {['Immediately', 'After 10 minutes', 'After 2 hours', 'After 3 days', 'After 7 days'].map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
            <select className="input h-9 w-auto py-0 text-sm" value={draft.next} onChange={(e) => setDraft({ ...draft, next: e.target.value })}>
              {actions.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-surface-soft p-4">
            <p className="eyebrow">Reads as</p>
            <p className="mt-1.5 text-sm text-ink-800">
              When <b>{draft.trigger.toLowerCase()}</b>, if <b>{draft.field.toLowerCase()}</b> {draft.op}{' '}
              <b>{draft.value}</b>, then <b>{draft.action.toLowerCase()}</b> — {draft.wait.toLowerCase()},{' '}
              <b>{draft.next.toLowerCase()}</b>.
            </p>
          </div>
        </div>

        <p className="eyebrow mt-5">The builder, step by step</p>
        <ul className="mt-2 space-y-1.5">
          {builderShape.map((s) => (
            <li key={s} className="num rounded-lg bg-surface-soft px-3 py-2 text-sm text-ink-700">
              {s}
            </li>
          ))}
        </ul>
      </Block>
    ),

    Rules: (
      <>
        {rules.map((r) => (
          <Block
            key={r.id}
            title={r.name}
            note={`${r.runs} runs · ${r.errors} errors · last ran ${r.lastRun.toLowerCase()}`}
            action={
              <button className="btn-ghost btn-sm" onClick={() => toast(`${r.name} ${r.status === 'On' ? 'switched off' : 'switched on'}`)}>
                {r.status === 'On' ? 'Turn off' : 'Turn on'}
              </button>
            }
          >
            <div className="space-y-2.5">
              <RuleLine label="When" value={r.when} tone="bg-violet-100 text-violet-800" />
              {r.conditions.map((c) => (
                <RuleLine key={c.field} label="If" value={`${c.field} ${c.op} ${c.value}`} />
              ))}
              {r.steps.map((s, i) => (
                <RuleLine
                  key={`${s.wait}-${i}`}
                  label={i === 0 ? 'Then' : 'And'}
                  value={`${s.wait} · ${s.action}`}
                  tone="bg-brand-50 text-brand-800"
                />
              ))}
            </div>
          </Block>
        ))}
      </>
    ),

    'Follow-ups': (
      <Block title="Follow-up sequence" note="What happens to a lead nobody has closed, and when" wide>
        <ol className="space-y-3 border-l border-ink-900/[0.07] pl-4">
          {followUpSequence.map((s) => (
            <li key={s.at} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
              <p className="text-sm font-bold text-ink-900">{s.does}</p>
              <p className="flex items-center gap-1.5 text-xs text-ink-500">
                <Clock size={11} /> {s.at}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-ink-400">Every gap here is set by the admin — nothing is fixed in the code.</p>
      </Block>
    ),

    'Lead journey': (
      <Block
        title="Lead stages"
        note="Add, remove, rename or reorder — this is the pipeline the desk works"
        wide
        action={
          <button className="btn-ghost btn-sm" onClick={() => toast('Stage added')}>
            <Plus size={14} /> Add stage
          </button>
        }
      >
        <ul className="space-y-2">
          {leadStages.map((s, i) => (
            <li key={s} className="flex items-center gap-3 rounded-xl border border-ink-900/[0.07] px-4 py-2.5">
              <GripVertical size={15} className="shrink-0 text-ink-300" />
              <span className="num w-6 shrink-0 text-sm font-bold text-ink-400">{i + 1}</span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-ink-800">{s}</span>
              <button className="btn-ghost btn-sm" onClick={() => toast(`${s} renamed`)}>
                Rename
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
        <ol className="space-y-3 border-l border-ink-900/[0.07] pl-4">
          {escalationRules.map((e) => (
            <li key={e.after} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
              <p className="text-sm font-bold text-ink-900">{e.then}</p>
              <p className="text-xs text-ink-500">{e.after}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-ink-400">Both the time and who gets told are set by the admin.</p>
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
          <button className="btn-ghost btn-sm" onClick={() => toast('Field added')}>
            <Plus size={14} /> Add field
          </button>
        }
      >
        <Table
          head={['Field', 'Kind', 'Where it is used']}
          rows={customFields.map((f) => ({ key: f.name, cells: [f.name, <Badge tone="teal">{f.kind}</Badge>, f.usedIn] }))}
        />
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
        <button className="btn-ghost" onClick={() => setSection('Templates')}>
          Templates
        </button>
        <button className="btn-primary" onClick={() => setSection('Builder')}>
          <Plus size={16} /> New rule
        </button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
              section === s
                ? 'bg-ink-900 text-white shadow-sm'
                : 'bg-white text-ink-600 ring-1 ring-ink-900/[0.07] hover:text-ink-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">{body[section]}</div>
    </>
  );
}
