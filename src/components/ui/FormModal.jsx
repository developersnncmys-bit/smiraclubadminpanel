import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

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
      if (f.type === 'number') cleaned[f.name] = Number(cleaned[f.name] || 0);
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
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit}>
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
