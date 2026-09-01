import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Inbox,
  X,
  LayoutGrid,
  Rows3,
} from 'lucide-react';
import { downloadCsv } from '../../lib/csv.js';

/**
 * Shared list surface: search, chip filters, an advanced filter panel, bulk
 * actions, CSV export and pagination. Everything here operates on real state
 * passed down from the page.
 */
export default function DataTable({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = 'Search…',
  filters = [],
  pageSize: initialPageSize = 8,
  selectable = true,
  toolbar = null,
  bulkActions = [],
  onRowClick,
  exportName = 'export',
  emptyLabel = 'Nothing here yet',
  externalFilter = {},
  onClearExternal,
  defaultView = 'table',
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState({});
  const [showPanel, setShowPanel] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState(defaultView);

  // Rows can disappear after a delete — drop them from the selection too.
  useEffect(() => {
    setSelected((s) => s.filter((id) => rows.some((r) => r.id === id)));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !q || searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q));
      const matchesChips = Object.entries(active).every(
        ([key, val]) => !val || String(row[key]) === val
      );
      const matchesExternal = Object.entries(externalFilter).every(
        ([key, val]) => !val || String(row[key]) === val
      );
      return matchesQuery && matchesChips && matchesExternal;
    });
  }, [rows, query, active, searchKeys, externalFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  const clearFilter = (key) => {
    setActive((prev) => ({ ...prev, [key]: '' }));
    setPage(1);
  };

  const allOnPageSelected = slice.length > 0 && slice.every((r) => selected.includes(r.id));
  const toggleAll = () => setSelected(allOnPageSelected ? [] : slice.map((r) => r.id));

  const activeExternal = Object.entries(externalFilter).filter(([, v]) => v);
  const activeFilters = Object.entries(active).filter(([, v]) => v);

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-ink-900/[0.07] p-3.5">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="input py-2 pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <span className="hidden whitespace-nowrap text-xs font-semibold text-ink-500 sm:block">
          {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        </span>

        {toolbar}

        {filters.length > 0 && (
          <button
            onClick={() => setShowPanel((s) => !s)}
            className={`btn py-2 ${
              showPanel || Object.values(active).some(Boolean)
                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-600/20'
                : 'btn-line'
            }`}
          >
            <SlidersHorizontal size={15} /> Filters
            {Object.values(active).filter(Boolean).length > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                {Object.values(active).filter(Boolean).length}
              </span>
            )}
          </button>
        )}

        {/* Cards read better for a handful of rich records; the table wins
            when you want to compare many rows at a glance. */}
        <div className="flex shrink-0 items-center rounded-lg border border-ink-900/10 bg-white p-0.5 shadow-xs">
          {[
            { key: 'cards', icon: LayoutGrid, label: 'Card view' },
            { key: 'table', icon: Rows3, label: 'Table view' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              title={label}
              className={`grid h-8 w-8 place-items-center rounded-md transition ${
                view === key ? 'bg-brand-50 text-brand-700' : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <button className="btn-line py-2" onClick={() => downloadCsv(exportName, filtered, columns)}>
          <Download size={15} /> Export
        </button>
      </div>

      {/* Advanced filter panel */}
      {showPanel && filters.length > 0 && (
        <div className="grid gap-4 border-t border-ink-900/[0.07] bg-surface-soft/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {filters.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label || f.key}</label>
              <select
                className="input bg-white"
                value={active[f.key] || ''}
                onChange={(e) => {
                  setActive((p) => ({ ...p, [f.key]: e.target.value }));
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex items-end">
            <button
              className="btn-line w-full"
              onClick={() => {
                setActive({});
                setPage(1);
              }}
            >
              Reset filters
            </button>
          </div>
        </div>
      )}

      {/* Only the filters actually in use are shown — no wall of chips. */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-900/[0.07] px-3.5 py-2.5">
          <span className="eyebrow">Filtered by</span>
          {activeFilters.map(([key, val]) => (
            <button
              key={key}
              onClick={() => clearFilter(key)}
              className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-600/15 hover:bg-brand-100"
              title="Remove this filter"
            >
              {val}
              <X size={12} />
            </button>
          ))}
          <button
            onClick={() => {
              setActive({});
              setPage(1);
            }}
            className="px-1 text-xs font-semibold text-ink-500 underline underline-offset-2 hover:text-brand-700"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter applied from outside (e.g. a pipeline card) */}
      {activeExternal.length > 0 && (
        <div className="flex items-center gap-2 border-b border-brand-600/15 bg-brand-50/70 px-5 py-2.5 text-sm">
          <span className="font-semibold text-brand-800">
            Showing only {activeExternal.map(([, v]) => v).join(', ')}
          </span>
          {onClearExternal && (
            <button
              onClick={onClearExternal}
              className="ml-auto rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:text-brand-700"
            >
              Show all
            </button>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-600/15 bg-brand-50 px-5 py-2.5 text-sm">
          <span className="font-semibold text-brand-800">{selected.length} selected</span>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map(({ label, icon: Icon, onClick, danger }) => (
              <button
                key={label}
                onClick={() => {
                  onClick(selected);
                  setSelected([]);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold transition ${
                  danger ? 'text-rose-600 hover:bg-rose-50' : 'text-ink-700 hover:text-brand-700'
                }`}
              >
                {Icon && <Icon size={13} />}
                {label}
              </button>
            ))}
            <button
              onClick={() => setSelected([])}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === 'cards' ? (
        <div className="grid gap-4 p-4 sm:grid-cols-2 2xl:grid-cols-3">
          {slice.map((row) => {
            const [lead, ...rest] = columns.filter((c) => c.key !== 'actions');
            const actions = columns.find((c) => c.key === 'actions');
            return (
              <article
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`card flex flex-col p-4 ${onRowClick ? 'card-hover cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">{lead?.render ? lead.render(row) : row[lead?.key]}</div>
                  {actions && (
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      {actions.render(row)}
                    </div>
                  )}
                </div>

                <dl className="mt-4 grid flex-1 grid-cols-2 gap-x-4 gap-y-3 border-t border-ink-900/[0.07] pt-3.5">
                  {rest.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="eyebrow truncate">{c.header}</dt>
                      <dd className="mt-1 text-sm text-ink-800">
                        {c.render ? c.render(row) : (row[c.key] ?? '—')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}

          {slice.length === 0 && (
            <div className="col-span-full px-5 py-16 text-center">
              <Inbox size={30} className="mx-auto mb-3 text-ink-400" />
              <p className="text-sm font-semibold text-ink-600">{emptyLabel}</p>
              <p className="mt-1 text-xs text-ink-400">Try clearing the search or filters.</p>
            </div>
          )}
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead className="sticky top-0 z-10 bg-surface-soft/95 backdrop-blur">
            <tr>
              {selectable && (
                <th className="w-11 border-b border-ink-900/[0.07] px-5 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-600"
                  />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={`th ${c.headerClass || ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/[0.07]">
            {slice.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`group transition-colors hover:bg-surface-soft/70 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {selectable && (
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() =>
                        setSelected((prev) =>
                          prev.includes(row.id) ? prev.filter((x) => x !== row.id) : [...prev, row.id]
                        )
                      }
                      className="h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-600"
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`td ${c.className || ''}`}
                    onClick={c.key === 'actions' ? (e) => e.stopPropagation() : undefined}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}

            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-5 py-16 text-center">
                  <Inbox size={30} className="mx-auto mb-3 text-ink-400" />
                  <p className="text-sm font-semibold text-ink-600">{emptyLabel}</p>
                  <p className="mt-1 text-xs text-ink-400">Try clearing the search or filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/[0.07] bg-surface-soft/40 px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-ink-900/10 bg-white px-2 py-1 text-sm font-semibold text-ink-700 outline-none"
          >
            {[8, 10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="ml-2">
            {filtered.length === 0 ? 0 : (current - 1) * pageSize + 1}–
            {Math.min(current * pageSize, filtered.length)} of {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { icon: ChevronsLeft, to: 1, disabled: current === 1 },
            { icon: ChevronLeft, to: current - 1, disabled: current === 1 },
          ].map(({ icon: Icon, to, disabled }, i) => (
            <button
              key={i}
              disabled={disabled}
              onClick={() => setPage(to)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-600 transition hover:text-brand-700 disabled:opacity-40"
            >
              <Icon size={16} />
            </button>
          ))}
          <span className="px-3 text-sm font-semibold text-ink-700">
            {current} / {pages}
          </span>
          {[
            { icon: ChevronRight, to: current + 1, disabled: current === pages },
            { icon: ChevronsRight, to: pages, disabled: current === pages },
          ].map(({ icon: Icon, to, disabled }, i) => (
            <button
              key={i}
              disabled={disabled}
              onClick={() => setPage(to)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-600 transition hover:text-brand-700 disabled:opacity-40"
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
