import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toISODate, formatDate } from '../../data/mockData.js';

/**
 * The same schema-driven form as FormModal, laid out across the page.
 *
 * A dialog is right for three or four fields. It is wrong for a joining form
 * or a partner record: a long form in a small box scrolls inside itself, the
 * sections lose each other, and the buttons drift off the bottom. This is the
 * same field list given the full width, with the sections the schema names.
 *
 * fields: [{ name, label, type, options?, required?, full?, placeholder?,
 *            help?, section? }]
 * type: text | number | select | date | textarea | tel | email | checkbox
 */
export default function InlineForm({
  open,
  onClose,
  onSubmit,
  title,
  subtitle,
  fields,
  initial = {},
  submitLabel = 'Save',
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    const defaults = {};
    fields.forEach((f) => {
      if (initial[f.name] !== undefined) defaults[f.name] = initial[f.name];
      else if (f.type === 'select') defaults[f.name] = f.options?.[0] ?? '';
      else if (f.type === 'checkbox') defaults[f.name] = false;
      else defaults[f.name] = '';
      if (f.type === 'date') defaults[f.name] = toISODate(defaults[f.name]);
    });
    setValues(defaults);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
  };

  const submit = (e) => {
    e?.preventDefault();
    const next = {};
    fields.forEach((f) => {
      if (!f.required) return;
      const v = values[f.name];
      if (f.type === 'checkbox' ? !v : String(v ?? '').trim() === '') next[f.name] = 'Required';
    });
    if (Object.keys(next).length) {
      setErrors(next);
      const first = document.getElementById(Object.keys(next)[0]);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const cleaned = { ...values };
    fields.forEach((f) => {
      if (f.type === 'number') cleaned[f.name] = Math.max(0, Number(cleaned[f.name] || 0));
      if (f.type === 'date' && cleaned[f.name]) cleaned[f.name] = formatDate(cleaned[f.name]);
    });
    onSubmit(cleaned);
    onClose();
  };

  /** The schema's own order, grouped by the section each field names. */
  const groups = [];
  fields.forEach((f) => {
    const name = f.section || '';
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.fields.push(f);
    else groups.push({ name, fields: [f] });
  });

  return (
    <form onSubmit={submit} className="card mb-6 overflow-hidden">
      <header className="flex items-start justify-between gap-4 border-b border-ink-900/[0.07] px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-lg font-extrabold text-ink-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-surface-soft"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-7 px-5 py-6 sm:px-6">
        {groups.map((g, i) => (
          <section key={g.name || `group-${i}`}>
            {g.name && (
              <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-wide text-brand-600">
                {g.name}
              </h3>
            )}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {g.fields.map((f) => (
                <div key={f.name} className={f.full ? 'sm:col-span-2 xl:col-span-3' : ''}>
                  {f.type === 'checkbox' ? (
                    <label className="flex items-start gap-2.5 text-sm text-ink-700" htmlFor={f.name}>
                      <input
                        id={f.name}
                        type="checkbox"
                        checked={Boolean(values[f.name])}
                        onChange={(e) => set(f.name, e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-900/20 text-brand-600"
                      />
                      <span>
                        {f.label}
                        {f.required && <span className="ml-1 text-coral">*</span>}
                      </span>
                    </label>
                  ) : (
                    <>
                      <label className="label" htmlFor={f.name}>
                        {f.label}
                        {f.required && <span className="ml-1 text-coral">*</span>}
                      </label>

                      {f.type === 'select' ? (
                        <select
                          id={f.name}
                          className="input"
                          value={values[f.name] ?? ''}
                          onChange={(e) => set(f.name, e.target.value)}
                        >
                          {f.options.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea
                          id={f.name}
                          className="input min-h-[92px] resize-y"
                          placeholder={f.placeholder}
                          value={values[f.name] ?? ''}
                          onChange={(e) => set(f.name, e.target.value)}
                        />
                      ) : (
                        <input
                          id={f.name}
                          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                          className="input"
                          placeholder={f.placeholder}
                          min={f.type === 'number' ? (f.min ?? 0) : undefined}
                          step={f.type === 'number' ? f.step : undefined}
                          value={values[f.name] ?? ''}
                          onChange={(e) => set(f.name, e.target.value)}
                        />
                      )}
                    </>
                  )}

                  {errors[f.name] ? (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors[f.name]}</p>
                  ) : (
                    f.help && <p className="mt-1.5 text-xs text-ink-400">{f.help}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="flex justify-end gap-2 border-t border-ink-900/[0.07] px-5 py-4 sm:px-6">
        <button type="button" className="btn-line" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-action">
          {submitLabel}
        </button>
      </footer>
    </form>
  );
}
