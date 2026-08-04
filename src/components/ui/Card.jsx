export default function Card({ title, subtitle, action, className = '', bodyClass = '', children }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-ink-900/5 px-5 py-4">
          <div>
            {title && <h3 className="text-base font-bold leading-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClass || 'p-5'}>{children}</div>
    </section>
  );
}
