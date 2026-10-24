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
      {/*
        On a phone each row is a card: the first cell as its title, every
        other cell under its column's name. A table six hundred pixels wide
        on a screen of three hundred and sixty was a sideways scroll nobody
        could read. Same cells, same clicks — only the arrangement changes.
      */}
      <ul className="space-y-2 md:hidden">
        {paged.pageRows.map((r) => {
          const [first, ...rest] = r.cells;
          return (
            <li
              key={r.key}
              className={`rounded-xl border border-ink-900/[0.07] bg-white p-3 shadow-xs ${onRow ? 'cursor-pointer active:bg-surface-soft' : ''}`}
              onClick={onRow ? () => onRow(r.key) : undefined}
            >
              <div className="text-sm font-bold text-ink-900">{first}</div>
              {rest.length > 0 && (
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-ink-900/[0.06] pt-2">
                  {rest.map((c, i) =>
                    c === null || c === undefined || c === '' ? null : (
                      <div key={i} className={`min-w-0 ${head[i + 1] ? '' : 'col-span-2'}`}>
                        {head[i + 1] && <dt className="truncate text-[10px] font-bold uppercase tracking-wide text-ink-400">{head[i + 1]}</dt>}
                        <dd className="break-words text-[13px] text-ink-700">{c}</dd>
                      </div>
                    )
                  )}
                </dl>
              )}
            </li>
          );
        })}
        {rows.length === 0 && <li className="py-6 text-center text-sm text-ink-500">{empty}</li>}
        {foot && (
          <li className="rounded-xl border-2 border-ink-900/[0.12] bg-surface-soft p-3">
            <div className="text-sm font-extrabold text-ink-900">{foot[0]}</div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
              {foot.slice(1).map((c, i) =>
                c === null || c === undefined || c === '' ? null : (
                  <div key={i} className="min-w-0">
                    {head[i + 1] && <dt className="truncate text-[10px] font-bold uppercase tracking-wide text-ink-400">{head[i + 1]}</dt>}
                    <dd className="num text-[13px] font-bold text-ink-900">{c}</dd>
                  </div>
                )
              )}
            </dl>
          </li>
        )}
      </ul>

      <div className="hidden overflow-x-auto md:block">
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
