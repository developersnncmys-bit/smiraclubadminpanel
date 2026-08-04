import { useState } from 'react';
import { Plus, Phone, MessageCircle, Mail, Pencil, Trash2, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr } from '../data/mockData.js';

const TIERS = ['Platinum', 'Gold', 'Silver'];
const tierTone = { Platinum: 'violet', Gold: 'amber', Silver: 'slate' };
const digits = (phone) => String(phone).replace(/[^\d]/g, '');

export default function Customers() {
  const navigate = useNavigate();
  const { customers, create, update, remove } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'trips', label: 'Trips taken', type: 'number' },
    { name: 'spend', label: 'Lifetime value (₹)', type: 'number' },
    { name: 'tier', label: 'Tier', type: 'select', options: TIERS },
    { name: 'last', label: 'Latest trip', type: 'text', placeholder: '24 Aug 2026' },
  ];

  const save = (values) => {
    if (editing) update('customers', editing.id, values);
    else create('customers', values);
  };

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900">{r.name}</p>
            <p className="truncate text-xs text-ink-500">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (r) => <span className="text-ink-600">{r.phone}</span> },
    { key: 'city', header: 'City' },
    { key: 'trips', header: 'Trips', render: (r) => <span className="font-bold text-ink-900">{r.trips}</span> },
    {
      key: 'spend',
      header: 'Lifetime value',
      render: (r) => <span className="font-bold text-brand-700">{inr(r.spend)}</span>,
    },
    { key: 'tier', header: 'Tier', render: (r) => <Badge tone={tierTone[r.tier]}>{r.tier}</Badge> },
    { key: 'last', header: 'Latest trip' },
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
          <a
            href={`https://wa.me/${digits(r.phone)}`}
            target="_blank"
            rel="noreferrer"
            title="WhatsApp"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-emerald-500 hover:text-emerald-600"
          >
            <MessageCircle size={14} />
          </a>
          <RowMenu
            items={[
              { label: 'Edit customer', icon: Pencil, onClick: () => { setEditing(r); setFormOpen(true); } },
              { label: 'Email', icon: Mail, onClick: () => { window.location.href = `mailto:${r.email}`; } },
              { label: 'New booking', icon: CalendarPlus, onClick: () => navigate('/bookings') },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Customers" subtitle="Repeat travellers and their lifetime value">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Add customer
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={customers}
        searchKeys={['name', 'email', 'phone', 'city']}
        searchPlaceholder="Search customers…"
        filters={[{ key: 'tier', label: 'Tier', options: TIERS }]}
        exportName="smira-club-customers"
        emptyLabel="No customers match this view"
        onRowClick={(r) => {
          setEditing(r);
          setFormOpen(true);
        }}
        bulkActions={[{ label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) }]}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.name}` : 'Add customer'}
        subtitle={editing ? editing.id : 'Create a customer profile'}
        fields={fields}
        initial={editing || { tier: 'Silver', trips: 0, spend: 0 }}
        submitLabel={editing ? 'Save changes' : 'Add customer'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('customers', confirm)}
        title="Delete customers?"
        message={`This removes ${confirm?.length || 0} customer profile(s).`}
      />
    </>
  );
}
