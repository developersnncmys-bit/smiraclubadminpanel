/** Panel with an optional titled header — the base for every dashboard widget. */
export default function Card({
  eyebrow,
  title,
  subtitle,
  action,
  className = '',
  bodyClass = '',
  children,
}) {
  return (
    <section className={`card flex flex-col ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-ink-900/[0.07] px-5 py-3.5">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            {title && (
              <h3 className="font-display text-[0.95rem] font-extrabold leading-tight text-ink-900">
                {title}
              </h3>
            )}
            {subtitle && <p className="mt-1 text-xs leading-relaxed text-ink-500">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={bodyClass || 'p-5'}>{children}</div>
    </section>
  );
}
