import { usePaged, Pagination } from './Pagination.jsx';

/**
 * The plain table, paged.
 *
 * Nine pages each carried their own copy of this — the same head, the
 * same divided body, the same empty row, differing only in a minimum
 * width and whether they took a footer. They are one component now, so
 * pages arrived everywhere at once and the next change lands everywhere
 * too.
 *
 * Rows are `{ key, cells: [] }`. A total row is `foot`, and it stays put
 * on every page, because it totals the list rather than the page.
 */
export default function Table({
  head,
  rows,
  empty = 'Nothing here yet.',
  foot,
  onRow,
  minWidth = 640,
  pageSize = 10,
}) {
  const paged = usePaged(rows, pageSize);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: `${minWidth}px` }}>
          <thead>
            <tr className="border-b border-ink-900/[0.07] text-left">
              {head.map((h, i) => (
                <th
                  key={typeof h === 'string' && h ? h : `col-${i}`}
                  className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/[0.07]">
            {paged.pageRows.map((r) => (
              <tr
                key={r.key}
                className={onRow ? 'cursor-pointer hover:bg-surface-soft' : 'hover:bg-surface-soft'}
                onClick={onRow ? () => onRow(r.key) : undefined}
              >
                {r.cells.map((c, i) => (
                  <td key={i} className={`py-2.5 ${i === 0 ? 'font-bold text-ink-900' : 'text-ink-700'}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={head.length} className="py-6 text-center text-ink-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
          {foot && (
            <tfoot>
              <tr className="border-t-2 border-ink-900/[0.12] bg-surface-soft">
                {foot.map((c, i) => (
                  <td
                    key={i}
                    className={`py-2.5 ${i === 0 ? 'font-extrabold text-ink-900' : 'num font-bold text-ink-900'}`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <Pagination {...paged} />
    </>
  );
}
