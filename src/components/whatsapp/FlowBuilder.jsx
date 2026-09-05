import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Bot } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Badge from '../ui/Badge.jsx';
import { stepKinds, botJourneys } from '../../data/whatsappData.js';

const kindOf = (key) => stepKinds.find((k) => k.key === key) || stepKinds[0];
const toneOf = {
  message: 'green', question: 'sky', buttons: 'violet',
  condition: 'amber', qualify: 'teal', handover: 'rose', faq: 'slate',
};

/**
 * The no-code chatbot flow builder the sheet asks for: name the journey, say
 * what starts it, then stack the steps — messages, questions, buttons,
 * conditions, lead qualification, human handover and the knowledge base.
 */
export default function FlowBuilder({ flow, onClose, onSave }) {
  const [form, setForm] = useState(
    flow || { name: '', trigger: botJourneys[0], status: 'Draft', sessions: 0, steps: [] }
  );

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setStep = (i, patch) =>
    setForm((f) => ({ ...f, steps: f.steps.map((s, n) => (n === i ? { ...s, ...patch } : s)) }));
  const addStep = (kind) =>
    setForm((f) => ({
      ...f,
      steps: [...f.steps, { kind, text: '', ...(kind === 'buttons' ? { buttons: [] } : {}) }],
    }));
  const removeStep = (i) => setForm((f) => ({ ...f, steps: f.steps.filter((_, n) => n !== i) }));
  const move = (i, by) =>
    setForm((f) => {
      const to = i + by;
      if (to < 0 || to >= f.steps.length) return f;
      const steps = [...f.steps];
      [steps[i], steps[to]] = [steps[to], steps[i]];
      return { ...f, steps };
    });

  return (
    <Modal
      open
      onClose={onClose}
      title={flow ? `Edit “${flow.name}”` : 'Build a chatbot journey'}
      subtitle="Stack the steps the bot walks a customer through — no code anywhere"
      size="xl"
      footer={
        <div className="flex items-center gap-2">
          <button
            className="btn-action"
            disabled={!form.name.trim() || form.steps.length === 0}
            onClick={() => onSave({ ...form, name: form.name.trim() })}
          >
            {flow ? 'Save journey' : 'Create journey'}
          </button>
          <button className="btn-line" onClick={onClose}>Cancel</button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="label">Journey name</span>
          <input
            className="input"
            placeholder="Explore membership"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label">What starts it</span>
          <select className="input" value={form.trigger} onChange={(e) => set('trigger', e.target.value)}>
            <option>Any first message</option>
            {botJourneys.map((j) => <option key={j}>{`Tapped “${j}”`}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option>Draft</option>
            <option>Live</option>
            <option>Paused</option>
          </select>
        </label>
      </div>

      <p className="eyebrow mt-5">Add a step</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {stepKinds.map((k) => (
          <button key={k.key} type="button" className="chip text-ink-600 hover:text-ink-900" onClick={() => addStep(k.key)}>
            <Plus size={12} /> {k.label}
          </button>
        ))}
      </div>

      <p className="eyebrow mt-5">The journey, in order</p>
      <ol className="mt-2 space-y-2">
        {form.steps.map((step, i) => {
          const kind = kindOf(step.kind);
          return (
            <li key={i} className="rounded-xl border border-ink-900/[0.07] p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-500 text-[11px] font-extrabold text-white">
                  {i + 1}
                </span>
                <Badge tone={toneOf[step.kind] || 'slate'}>{kind.label}</Badge>
                <span className="text-xs text-ink-400">{kind.hint}</span>
                <span className="ml-auto flex gap-1">
                  <button type="button" className="icon-btn h-7 w-7" onClick={() => move(i, -1)} title="Move up">
                    <ArrowUp size={13} />
                  </button>
                  <button type="button" className="icon-btn h-7 w-7" onClick={() => move(i, 1)} title="Move down">
                    <ArrowDown size={13} />
                  </button>
                  <button type="button" className="icon-btn-danger h-7 w-7" onClick={() => removeStep(i)} title="Remove">
                    <Trash2 size={13} />
                  </button>
                </span>
              </div>

              <input
                className="input mt-2.5"
                placeholder={
                  step.kind === 'question' ? 'What should the bot ask?'
                    : step.kind === 'condition' ? 'If they answered…'
                      : step.kind === 'handover' ? 'Who does it go to?'
                        : 'What should this step say?'
                }
                value={step.text}
                onChange={(e) => setStep(i, { text: e.target.value })}
              />

              {step.kind === 'buttons' && (
                <input
                  className="input mt-2"
                  placeholder="Button labels, separated by commas"
                  value={(step.buttons || []).join(', ')}
                  onChange={(e) =>
                    setStep(i, { buttons: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })
                  }
                />
              )}
            </li>
          );
        })}
        {form.steps.length === 0 && (
          <li className="rounded-xl border border-dashed border-ink-900/[0.14] px-4 py-8 text-center text-sm text-ink-400">
            <Bot size={18} className="mx-auto mb-2 text-ink-300" />
            Nothing yet — add the first thing the bot should say.
          </li>
        )}
      </ol>
    </Modal>
  );
}
