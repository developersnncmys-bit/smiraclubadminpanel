import { useState } from 'react';
import { Plus, Star, Phone, Pencil, Trash2, PauseCircle, PlayCircle, Mail } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';

const CATEGORIES = ['DMC', 'Hotel', 'Airline', 'Transport', 'Visa'];
const digits = (p) => String(p).replace(/[^\d]/g, '');

export default function Suppliers() {
  const { suppliers, create, update, remove } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fields = [
    { name: 'name', label: 'Supplier name', type: 'text', required: true, full: true },
    { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
    { name: 'region', label: 'Region', type: 'text', required: true },
    { name: 'contact', label: 'Contact person', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'rating', label: 'Rating', type: 'number', placeholder: '4.5' },
    { name: 'bookings', label: 'Bookings routed', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'On hold'] },
  ];

  const save = (values) => {
    if (editing) update('suppliers', editing.id, values);
    else create('suppliers', values);
  };

  const columns = [
    {
      key: 'name',
      header: 'Supplier',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900">{r.name}</p>
            <p className="truncate text-xs text-ink-500">{r.region}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (r) => <Badge tone="teal">{r.category}</Badge> },
    {
      key: 'contact',
      header: 'Contact person',
      render: (r) => (
        <div>
          <p className="font-semibold text-ink-800">{r.contact}</p>
          <p className="flex items-center gap-1 text-xs text-ink-500">
            <Phone size={11} /> {r.phone}
          </p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 font-bold text-ink-900">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          {r.rating}
        </span>
      ),
    },
    { key: 'bookings', header: 'Bookings routed', render: (r) => <span className="font-bold text-ink-900">{r.bookings}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={r.status === 'Active' ? 'green' : 'amber'} dot>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-1.5">
          <a
            href={`tel:${digits(r.phone)}`}
            title="Call"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-emerald-500 hover:text-emerald-600"
          >
            <Phone size={14} />
          </a>
          <RowMenu
            items={[
              { label: 'Edit supplier', icon: Pencil, onClick: () => { setEditing(r); setFormOpen(true); } },
              {
                label: r.status === 'Active' ? 'Put on hold' : 'Reactivate',
                icon: r.status === 'Active' ? PauseCircle : PlayCircle,
                onClick: () => update('suppliers', r.id, { status: r.status === 'Active' ? 'On hold' : 'Active' }),
              },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Suppliers" subtitle="DMCs, hotels, transport and visa partners">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Add supplier
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={suppliers}
        searchKeys={['name', 'contact', 'region', 'category']}
        searchPlaceholder="Search suppliers…"
        filters={[
          { key: 'category', label: 'Category', options: CATEGORIES },
          { key: 'status', label: 'Status', options: ['Active', 'On hold'] },
        ]}
        exportName="smira-club-suppliers"
        emptyLabel="No suppliers match this view"
        onRowClick={(r) => {
          setEditing(r);
          setFormOpen(true);
        }}
        bulkActions={[
          { label: 'Put on hold', icon: PauseCircle, onClick: (ids) => ids.forEach((id) => update('suppliers', id, { status: 'On hold' }, { silent: true })) },
          { label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) },
        ]}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.name}` : 'Add supplier'}
        subtitle={editing ? editing.id : 'Register a new partner'}
        fields={fields}
        initial={editing || { category: 'DMC', status: 'Active', rating: 4.5, bookings: 0 }}
        submitLabel={editing ? 'Save changes' : 'Add supplier'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('suppliers', confirm)}
        title="Delete suppliers?"
        message={`This removes ${confirm?.length || 0} supplier record(s).`}
      />
    </>
  );
}
