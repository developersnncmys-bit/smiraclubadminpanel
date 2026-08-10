/**
 * Standard page masthead: a small section label, the title, a one-line
 * description and the page actions, closed off with a hairline so every screen
 * starts at the same rhythm.
 */
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mb-6 border-b border-ink-900/[0.07] pb-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="font-display text-[1.6rem] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[1.75rem]">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
