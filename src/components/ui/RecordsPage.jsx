import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import RowMenu from './RowMenu.jsx';
import FormModal from './FormModal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useApp } from '../../store/AppStore.jsx';

/**
 * The list page every module shares: a few summary tiles, the records table,
 * and add/edit/delete wired to one store collection. Pages supply what makes
 * them different — the columns, the form fields and the tiles — and get the
 * same behaviour everywhere else.
 */
export default function RecordsPage({
  collection,
  title,
  subtitle,
  addLabel = 'Add',
  columns,
  fields,
  filters = [],
  searchKeys,
  stats = () => [],
  initial = {},
  defaults = {},
  rowActions = () => [],
  exportName,
  emptyLabel = 'Nothing here yet',
  children,
}) {
  const app = useApp();
  const rows = app[collection] || [];
  const { create, update, remove } = app;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  const save = (values) => {
    if (editing) update(collection, editing.id, values);
    else create(collection, { ...defaults, ...values });
  };

  const tiles = stats(rows, app);

  const withActions = [
    ...columns,
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end">
          <RowMenu
            items={[
              { label: 'Edit', icon: Pencil, onClick: () => openEdit(row) },
              ...rowActions(row, app),
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([row.id]) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={title} subtitle={subtitle}>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> {addLabel}
        </button>
      </PageHeader>

      {tiles.length > 0 && (
        <div className={`mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-${Math.min(tiles.length, 4)}`}>
          {tiles.map((t) => (
            <div key={t.label} className="card px-5 py-4">
              <p className="text-sm font-semibold text-ink-500">{t.label}</p>
              <p className={`num mt-1 font-display text-2xl font-extrabold ${t.tone || 'text-ink-900'}`}>
                {t.value}
              </p>
              {t.hint && <p className="mt-0.5 text-xs text-ink-400">{t.hint}</p>}
            </div>
          ))}
        </div>
      )}

      {children}

      <DataTable
        columns={withActions}
        rows={rows}
        selectable={false}
        searchKeys={searchKeys}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        filters={filters}
        exportName={exportName || `smira-club-${collection}`}
        emptyLabel={emptyLabel}
        defaultView="cards"
        onRowClick={openEdit}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? 'Edit' : addLabel}
        subtitle={editing ? editing.id : subtitle}
        fields={fields}
        initial={editing || initial}
        submitLabel={editing ? 'Save changes' : addLabel}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(collection, confirm)}
        title="Delete this record?"
        message="It will be removed from the list. This cannot be undone."
      />
    </>
  );
}
