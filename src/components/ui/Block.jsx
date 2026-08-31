/**
 * The section card every module builds with: a title, an optional note, an
 * optional action on the right, and the content beneath. One definition so a
 * block on Payment sits at the same rhythm as a block on Support.
 */
export default function Block({ title, note, wide, action, children, className = '' }) {
  return (
    <section className={`card p-5 ${wide ? 'xl:col-span-2' : ''} ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="font-display text-base font-extrabold text-ink-900">{title}</h3>}
            {note && <p className="mt-0.5 text-sm text-ink-500">{note}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={title || action ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}
