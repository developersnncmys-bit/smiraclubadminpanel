import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Zap, Loader2, X, Wand2 } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';
import { useLeadStages } from '../../lib/leadStages.js';
import { useLeadFolders } from '../../lib/leadFolders.js';

/**
 * Lead rules: the automation that actually runs.
 *
 * WHEN a lead is added, assigned, or moved to a status by somebody on the
 * team, IF it matches (status, team member, source), THEN do one or more
 * steps — move its status, assign it, add a task, file it in a folder,
 * send it a WhatsApp. The server runs these the moment the change is saved
 * (helpers/leadAutomation), and each run shows in History.
 */
const WHEN = ['Lead status changed', 'Lead assigned', 'New lead'];
const STEP_TYPES = ['Move status', 'Assign to', 'Create task', 'Add to folder', 'Send WhatsApp'];
const TASK_TYPES = ['Call', 'Follow-up', 'WhatsApp', 'Presentation', 'Customer Visit', 'Payment Follow-up', 'Booking Follow-up'];
const DUE = [
  [0, 'Right away'], [1, 'In 1 hour'], [2, 'In 2 hours'], [4, 'In 4 hours'],
  [24, 'Tomorrow'], [48, 'In 2 days'], [72, 'In 3 days'], [168, 'In a week'],
];
const SOURCES = ['Facebook', 'Facebook Ads', 'Instagram', 'WhatsApp', 'Website', 'Google Ads', 'Referral', 'Field team', 'Existing member', 'Campaign', 'Walk-in', 'Calling data', 'Partner', 'Other'];

const blankStep = (type = 'Create task') => ({
  type,
  value: type === 'Create task' ? { type: 'Follow-up', title: '', priority: 'Medium' } : type === 'Assign to' ? [] : '',
  dueIn: type === 'Create task' ? 24 : undefined,
  limits: type === 'Assign to' ? {} : undefined,
});
const blank = () => ({ name: '', when: 'Lead status changed', match: { status: '', owner: '', source: '' }, steps: [blankStep()] });

/** Ready-made rules, one tap to fill the form. */
const EXAMPLES = [
  { name: 'Assigned → call within an hour', when: 'Lead assigned', match: {}, steps: [{ type: 'Create task', value: { type: 'Call', title: 'First call — {name}', priority: 'High' }, dueIn: 1 }] },
  { name: 'Ringing → try again tomorrow', when: 'Lead status changed', match: { status: 'Ringing' }, steps: [{ type: 'Create task', value: { type: 'Call', title: 'Call again — {name}', priority: 'Medium' }, dueIn: 24 }] },
  { name: 'Interested → presentation', when: 'Lead status changed', match: { status: 'Interested' }, steps: [{ type: 'Create task', value: { type: 'Presentation', title: 'Presentation — {name}', priority: 'High' }, dueIn: 24 }] },
  { name: 'Presentation done → follow up in 2 days', when: 'Lead status changed', match: { status: 'Presentation done' }, steps: [{ type: 'Create task', value: { type: 'Follow-up', title: 'Follow up after presentation — {name}', priority: 'High' }, dueIn: 48 }] },
  { name: 'Not interested → folder', when: 'Lead status changed', match: { status: 'Not interested' }, steps: [{ type: 'Add to folder', value: 'Not interested' }] },
  { name: 'Future customer → call in a week', when: 'Lead status changed', match: { status: 'Future customer' }, steps: [{ type: 'Create task', value: { type: 'Follow-up', title: 'Check back — {name}', priority: 'Low' }, dueIn: 168 }] },
];

/** A step in words, as the list shows it. */
function stepText(step, nameOf) {
  if (step.type === 'Move status') return `move to ${step.value}`;
  if (step.type === 'Assign to') {
    const who = (Array.isArray(step.value) ? step.value : [step.value]).map(nameOf).filter(Boolean);
    const ids = Array.isArray(step.value) ? step.value : [step.value];
    const who2 = ids
      .map((id) => {
        const n = nameOf(id);
        const cap = Number(step.limits?.[id]) || 0;
        return n ? (cap ? `${n} (${cap}/day)` : n) : null;
      })
      .filter(Boolean);
    return who2.length > 1 ? `share between ${who2.join(', ')}` : `assign to ${who2[0] || who[0] || '—'}`;
  }
  if (step.type === 'Create task') {
    const due = DUE.find(([h]) => h === Number(step.dueIn))?.[1]?.toLowerCase() || `in ${step.dueIn} hours`;
    return `${step.value?.type || 'Follow-up'} task ${due}`;
  }
  if (step.type === 'Add to folder') return `file in "${step.value}"`;
  if (step.type === 'Send WhatsApp') return 'send a WhatsApp';
  return step.action || '';
}

export default function LeadRules() {
  const { team, toast } = useApp();
  const stages = useLeadStages();
  const { folders } = useLeadFolders();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const people = team.filter((t) => t._id);
  // Leads each person was given today, so taking turns can be seen working.
  const [givenToday, setGivenToday] = useState({});
  const [waiting, setWaiting] = useState(null);
  const peopleKey = people.map((p) => p._id).join(',');
  useEffect(() => {
    if (!isLive || !peopleKey) return undefined;
    let gone = false;
    const load = () => api.get(`/leads/given-today?ids=${peopleKey}`)
      .then((r) => { if (!gone) { setGivenToday(r.data || {}); setWaiting(r.waiting ?? null); } })
      .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => { gone = true; clearInterval(t); };
  }, [peopleKey]);
  const nameOf = (id) => people.find((p) => String(p._id) === String(id))?.name || '';

  const load = useCallback(() => {
    if (!isLive) { setLoading(false); return; }
    api
      .get('/automations?limit=500')
      .then((r) => setRules((r.data || []).filter((x) => (x.steps || []).some((s) => s.type))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const setStep = (i, patch) => setForm((f) => ({ ...f, steps: f.steps.map((s, n) => (n === i ? { ...s, ...patch } : s)) }));

  const problem = !form ? '' :
    !form.name.trim() ? 'Give the rule a name' :
    form.when === 'Lead status changed' && !form.match.status ? 'Pick the status that sets it off' :
    !form.steps.length ? 'Add at least one step' :
    form.steps.some((s) => (s.type === 'Assign to' ? !s.value.length : s.type === 'Create task' ? false : !String(s.value || '').trim()))
      ? 'Finish every step' : '';

  const save = async () => {
    if (problem) return toast(problem, 'info');
    setSaving(true);
    try {
      const match = Object.fromEntries(Object.entries(form.match).filter(([, v]) => v));
      const steps = form.steps.map((s) => ({ ...s, wait: 'Immediately', action: stepText(s, nameOf) }));
      await api.post('/automations', { name: form.name.trim(), when: form.when, match, steps, status: 'On' });
      toast(`Rule "${form.name.trim()}" is on`);
      setForm(null);
      load();
    } catch (err) {
      toast(err.message || 'The rule did not save', 'danger');
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  const toggle = async (rule) => {
    try {
      const r = await api.patch(`/automations/${rule._id}/toggle`);
      setRules((list) => list.map((x) => (x._id === rule._id ? { ...x, status: r.data.status } : x)));
    } catch (err) {
      toast(err.message || 'Could not switch it', 'danger');
    }
  };

  const drop = async (rule) => {
    if (!window.confirm(`Delete the rule "${rule.name}"?`)) return;
    try {
      await api.del(`/automations/${rule._id}`);
      setRules((list) => list.filter((x) => x._id !== rule._id));
      toast('Rule deleted');
    } catch (err) {
      toast(err.message || 'Could not delete it', 'danger');
    }
  };

  const whenText = (r) =>
    r.when === 'Lead status changed'
      ? `When a lead is moved to ${r.match?.status || 'any status'}`
      : r.when === 'Lead assigned'
        ? `When a lead is assigned${r.match?.owner ? ` to ${nameOf(r.match.owner)}` : ''}`
        : 'When a new lead comes in';

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Zap size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-extrabold text-ink-900">Lead rules</p>
          <p className="text-sm text-ink-500">
            When the team adds a lead, assigns it or changes its status, these run on their own — a task, a new status, an owner, a folder or a WhatsApp.
          </p>
        </div>
        {!form && (
          <button className="btn-action" onClick={() => setForm(blank())}>
            <Plus size={15} /> New rule
          </button>
        )}
      </div>

      {form && (
        <div className="card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-ink-900">New lead rule</p>
            <button className="text-ink-400 hover:text-ink-700" onClick={() => setForm(null)} aria-label="Close"><X size={18} /></button>
          </div>

          <div>
            <p className="label flex items-center gap-1.5"><Wand2 size={13} /> Start from an example</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((e) => (
                <button
                  key={e.name}
                  type="button"
                  className="rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-brand-400"
                  onClick={() => setForm({ ...blank(), ...JSON.parse(JSON.stringify(e)), match: { status: '', owner: '', source: '', ...e.match } })}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="label">Rule name</span>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Interested → presentation" />
          </label>

          {/* WHEN and IF */}
          <div className="grid gap-3 rounded-xl bg-surface-soft/60 p-3 sm:grid-cols-2">
            <label className="block">
              <span className="label">When</span>
              <select className="input" value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })}>
                {WHEN.map((w) => <option key={w}>{w}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">{form.when === 'Lead status changed' ? 'Moved to status' : 'Only if status is'}</span>
              <select className="input" value={form.match.status} onChange={(e) => setForm({ ...form, match: { ...form.match, status: e.target.value } })}>
                <option value="">{form.when === 'Lead status changed' ? 'Pick a status…' : 'Any status'}</option>
                {stages.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">{form.when === 'Lead assigned' ? 'Assigned to' : 'Team member'}</span>
              <select className="input" value={form.match.owner} onChange={(e) => setForm({ ...form, match: { ...form.match, owner: e.target.value } })}>
                <option value="">Anyone</option>
                {people.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Lead source</span>
              <select className="input" value={form.match.source} onChange={(e) => setForm({ ...form, match: { ...form.match, source: e.target.value } })}>
                <option value="">Any source</option>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>

          {/* THEN */}
          <div className="space-y-2">
            <p className="label">Then</p>
            {form.steps.map((s, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-ink-900/10 p-3">
                <div className="flex gap-2">
                  <select className="input flex-1" value={s.type} onChange={(e) => setStep(i, blankStep(e.target.value))}>
                    {STEP_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <button className="btn-line-danger btn-sm px-2" onClick={() => setForm({ ...form, steps: form.steps.filter((_, n) => n !== i) })} title="Remove step">
                    <Trash2 size={14} />
                  </button>
                </div>

                {s.type === 'Move status' && (
                  <select className="input" value={s.value} onChange={(e) => setStep(i, { value: e.target.value })}>
                    <option value="">Pick a status…</option>
                    {stages.map((st) => <option key={st}>{st}</option>)}
                  </select>
                )}

                {s.type === 'Assign to' && (
                  <div>
                    <p className="mb-1 text-xs text-ink-500">
                      Tick the people and type how many leads each one gets a day. Every day the panel hands out the leads that have
                      no person yet — your old data too, not only new leads — until each person has their number. Leads you give by hand count too.
                    </p>
                    {waiting !== null && (
                      <p className="mb-2 inline-block rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                        {waiting.toLocaleString('en-IN')} leads waiting with no person
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {people.map((p) => {
                        const on = s.value.includes(p._id);
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => setStep(i, { value: on ? s.value.filter((x) => x !== p._id) : [...s.value, p._id] })}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${on ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-900/10 bg-white text-ink-600'}`}
                          >
                            {p.name}
                            {givenToday[p._id] !== undefined && (
                              <span className="ml-1 text-ink-400">· {givenToday[p._id]} today</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {s.value.length > 0 && (
                      <div className="mt-3 rounded-xl border border-ink-900/10 bg-white p-2.5">
                        <p className="mb-2 text-xs font-semibold text-ink-700">
                          How many leads each person gets in a day — type any number. Empty = no limit.
                        </p>
                        <div className="space-y-1.5">
                          {s.value.map((id) => {
                            const p = people.find((x) => x._id === id);
                            if (!p) return null;
                            const cap = Number(s.limits?.[id]) || 0;
                            const got = givenToday[id] ?? 0;
                            const full = cap > 0 && got >= cap;
                            return (
                              <div key={id} className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="min-w-[8rem] flex-1 font-semibold text-ink-900">{p.name}</span>
                                <input
                                  type="number"
                                  min="0"
                                  inputMode="numeric"
                                  className="input !w-28 !py-1.5"
                                  value={s.limits?.[id] ?? ''}
                                  placeholder="No limit"
                                  onChange={(e) =>
                                    setStep(i, {
                                      limits: { ...(s.limits || {}), [id]: e.target.value === '' ? '' : Math.max(0, Math.floor(Number(e.target.value))) },
                                    })
                                  }
                                />
                                <span className={`w-28 text-xs font-semibold ${full ? 'text-rose-600' : 'text-ink-500'}`}>
                                  {cap > 0 ? `${got} / ${cap} today${full ? ' · full' : ''}` : `${got} today`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-ink-400">
                          When a person reaches their number, the next leads go to the others. When everyone is full, new leads wait unassigned.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {s.type === 'Create task' && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select className="input" value={s.value.type} onChange={(e) => setStep(i, { value: { ...s.value, type: e.target.value } })}>
                      {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <select className="input" value={s.dueIn} onChange={(e) => setStep(i, { dueIn: Number(e.target.value) })}>
                      {DUE.map(([h, label]) => <option key={h} value={h}>Due {label.toLowerCase()}</option>)}
                    </select>
                    <input
                      className="input sm:col-span-2"
                      value={s.value.title}
                      onChange={(e) => setStep(i, { value: { ...s.value, title: e.target.value } })}
                      placeholder="What to do, e.g. Call {name} about the quote"
                    />
                    <p className="text-xs text-ink-400 sm:col-span-2">Goes to the lead&apos;s owner. {'{name}'} becomes the lead&apos;s name.</p>
                  </div>
                )}

                {s.type === 'Add to folder' && (
                  <>
                    <input className="input" list={`folders-${i}`} value={s.value} onChange={(e) => setStep(i, { value: e.target.value })} placeholder="Folder name" />
                    <datalist id={`folders-${i}`}>
                      {folders.map((f) => <option key={f} value={f} />)}
                    </datalist>
                  </>
                )}

                {s.type === 'Send WhatsApp' && (
                  <>
                    <textarea className="input min-h-[80px]" value={s.value} onChange={(e) => setStep(i, { value: e.target.value })} placeholder="Hi {name}, thank you for your interest in Smira Club…" />
                    <p className="text-xs text-ink-400">Sent from the linked WhatsApp number (WhatsApp → Connect number). {'{name}'} becomes the first name.</p>
                  </>
                )}
              </div>
            ))}
            <button className="btn-line btn-sm" onClick={() => setForm({ ...form, steps: [...form.steps, blankStep()] })}>
              <Plus size={14} /> Add a step
            </button>
          </div>

          {problem && <p className="text-xs font-semibold text-rose-600">{problem}</p>}
          <div className="flex gap-2">
            <button className="btn-action" onClick={save} disabled={saving || Boolean(problem)}>
              {saving && <Loader2 size={15} className="animate-spin" />} Save and switch on
            </button>
            <button className="btn-line" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-ink-500"><Loader2 size={16} className="mr-2 inline animate-spin" />Loading rules…</p>
      ) : rules.length === 0 ? (
        !form && <p className="card py-10 text-center text-sm text-ink-500">No lead rules yet. Press New rule, or start from an example.</p>
      ) : (
        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r._id} className={`card flex flex-wrap items-start gap-3 p-4 ${r.status === 'On' ? '' : 'opacity-60'}`}>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-bold text-ink-900">
                  {r.name}
                  <Badge tone={r.status === 'On' ? 'green' : 'slate'} dot>{r.status}</Badge>
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  {whenText(r)}
                  {r.match?.source ? ` from ${r.match.source}` : ''}
                  {r.when !== 'Lead assigned' && r.match?.owner ? ` (${nameOf(r.match.owner)}'s leads)` : ''}
                  {' → '}
                  <b>{(r.steps || []).map((s) => stepText(s, nameOf)).join(', then ')}</b>
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  Ran {r.runs || 0} time(s){r.errorCount ? ` · ${r.errorCount} failed` : ''}
                  {r.lastRunAt ? ` · last ${new Date(r.lastRunAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-line btn-sm" onClick={() => toggle(r)}>{r.status === 'On' ? 'Switch off' : 'Switch on'}</button>
                <button className="btn-line-danger btn-sm px-2" onClick={() => drop(r)} title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
