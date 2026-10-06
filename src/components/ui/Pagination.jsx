import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pages for a list, wherever a list is drawn.
 *
 * Most tables on the panel printed every row they had. That is fine for a
 * summary of four and unusable for the partners list, which runs off the
 * bottom of the screen and takes the page footer with it.
 *
 * DataTable has paged itself from the start. This is the same behaviour
 * for the tables that are not DataTable: the hook for one that can hold
 * its own state, the footer both of them draw, and a wrapper for the
 * hand-built ones, whose markup is their own and worth keeping.
 */

const SIZES = [10, 25, 50, 100];

/** The slice of `rows` to draw, and the state to move through them. */
export function usePaged(rows, initialSize = 10) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(initialSize);

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / size));
  // Filtering can leave you on a page that no longer exists.
  const current = Math.min(page, pages);

  // A new filter starts at the beginning rather than halfway down.
  useEffect(() => {
    setPage(1);
  }, [total, size]);

  const pageRows = useMemo(
    () => (total > size ? rows.slice((current - 1) * size, current * size) : rows),
    [rows, current, size, total],
  );

  return {
    page: current,
    setPage,
    size,
    setSize,
    pages,
    total,
    pageRows,
    from: total === 0 ? 0 : (current - 1) * size + 1,
    to: Math.min(current * size, total),
    /** Below one page there is nothing to say. */
    needed: total > size,
  };
}

/**
 * The bar under a table: what is being shown, and how to move.
 *
 * Draws nothing at all when everything already fits, so a four-row
 * summary does not grow a page control it will never use.
 */
export function Pagination({ page, setPage, size, setSize, pages, total, from, to, needed }) {
  if (!needed) return null;

  const steps = [
    { icon: ChevronsLeft, to: 1, off: page === 1, label: 'First page' },
    { icon: ChevronLeft, to: page - 1, off: page === 1, label: 'Previous page' },
    { icon: ChevronRight, to: page + 1, off: page === pages, label: 'Next page' },
    { icon: ChevronsRight, to: pages, off: page === pages, label: 'Last page' },
  ];

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/[0.07] pt-3 text-xs text-ink-500">
      <div className="flex items-center gap-2">
        {setSize && (
          <>
            <span>Rows</span>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              aria-label="Rows per page"
              className="rounded-lg border border-ink-900/10 bg-white px-2 py-1 text-xs font-semibold text-ink-700"
            >
              {SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </>
        )}
        <span className="num">
          {from}–{to} of {total}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {steps.slice(0, 2).map(({ icon: Icon, to: go, off, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            disabled={off}
            onClick={() => setPage(go)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-600 transition hover:text-brand-700 disabled:opacity-40"
          >
            <Icon size={16} />
          </button>
        ))}
        <span className="px-2 font-semibold text-ink-700">
          Page {page} of {pages}
        </span>
        {steps.slice(2).map(({ icon: Icon, to: go, off, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            disabled={off}
            onClick={() => setPage(go)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-600 transition hover:text-brand-700 disabled:opacity-40"
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Pages around a table somebody else built.
 *
 * Takes the rows and hands back the ones on this page, so a table with
 * its own markup — a partner's avatar and score, a settlement's trail —
 * keeps every bit of it and only stops printing all two hundred at once.
 *
 *   <Paged items={partners}>{(shown) => <table>…{shown.map(…)}…</table>}</Paged>
 */
export default function Paged({ items = [], pageSize = 10, children }) {
  const paged = usePaged(items, pageSize);
  return (
    <>
      {children(paged.pageRows)}
      <Pagination {...paged} />
    </>
  );
}
