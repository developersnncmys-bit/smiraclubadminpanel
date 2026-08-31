import { Copy, Pencil } from 'lucide-react';

/**
 * A labelled value down the left column of a detail drawer. Same label size,
 * same divider, same padding in every module — and where a field can be copied
 * or changed in place, the same two quiet affordances.
 */
export default function Field({ label, children, onEdit, onCopy, action }) {
  const tools = onCopy || onEdit || action;

  return (
    <div className="border-b border-ink-900/[0.07] px-4 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {tools && (
          <div className="flex items-center gap-1">
            {onCopy && (
              <button onClick={onCopy} title="Copy" className="text-ink-300 transition hover:text-brand-700">
                <Copy size={13} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                title={`Change ${String(label).toLowerCase()}`}
                className="text-ink-300 transition hover:text-brand-700"
              >
                <Pencil size={13} />
              </button>
            )}
            {action}
          </div>
        )}
      </div>
      <div className="mt-1 text-sm text-ink-800">{children}</div>
    </div>
  );
}
