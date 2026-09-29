import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { toISODate, formatDate } from '../../data/mockData.js';

/**
 * Schema-driven add/edit dialog shared by every record page.
 *
 * fields: [{ name, label, type, options?, required?, full?, placeholder?, help? }]
 * type: text | number | select | date | textarea | tel | email
 */
export default function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  subtitle,
  fields,
  initial = {},
  submitLabel = 'Save',
  size = 'lg',
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      const defaults = {};
      fields.forEach((f) => {
        if (initial[f.name] !== undefined) defaults[f.name] = initial[f.name];
        else if (f.type === 'select') defaults[f.name] = f.options?.[0] ?? '';
        else defaults[f.name] = '';
        // The picker only understands ISO, records keep "02 Sep 2026".
        if (f.type === 'date') defaults[f.name] = toISODate(defaults[f.name]);
      });
      setValues(defaults);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
  };

  const submit = () => {
    const next = {};
    fields.forEach((f) => {
      if (f.required && String(values[f.name] ?? '').trim() === '') next[f.name] = 'Required';
    });
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    const cleaned = { ...values };
    fields.forEach((f) => {
      // Counts and money are never negative, whatever was typed or pasted.
      if (f.type === 'number') cleaned[f.name] = Math.max(0, Number(cleaned[f.name] || 0));
      // Hand dates back in the readable form the tables and PDFs print.
      if (f.type === 'date' && cleaned[f.name]) cleaned[f.name] = formatDate(cleaned[f.name]);
    });
    onSubmit(cleaned);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size={size}
      footer={
        <>
          <button className="btn-line" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-action" onClick={submit}>
            {submitLabel}
          </button>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
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
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : f.type === 'colour' ? (
              /*
                A colour is a name or a code, so it is a text box — and
                beside it the swatch the value actually produces, plus the
                system picker for anybody who would rather point at one than
                remember that #b8860b is the gold.
              */
              <span className="flex items-center gap-2">
                <input
                  id={f.name}
                  type="text"
                  className="input"
                  placeholder={f.placeholder}
                  list={`${f.name}-known`}
                  value={values[f.name] ?? ''}
                  onChange={(e) => set(f.name, e.target.value)}
                />
                <datalist id={`${f.name}-known`}>
                  {(f.options || []).filter(Boolean).map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
                <span
                  aria-hidden
                  title={values[f.name] || 'No colour set'}
                  className="h-9 w-9 shrink-0 rounded-lg border border-ink-900/10"
                  style={{ background: f.swatch ? f.swatch(values[f.name]) : values[f.name] || 'transparent' }}
                />
                <input
                  type="color"
                  aria-label={`Pick a colour for ${f.label}`}
                  value={/^#[0-9a-fA-F]{6}$/.test(values[f.name] || '') ? values[f.name] : '#1b3a6b'}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-ink-900/10 bg-white p-1"
                />
              </span>
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

            {errors[f.name] ? (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors[f.name]}</p>
            ) : (
              f.help && <p className="mt-1.5 text-xs text-ink-400">{f.help}</p>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
