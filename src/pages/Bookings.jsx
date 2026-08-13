import { useState } from 'react';
import { Plus, CalendarCheck, Wallet, Users, TrendingUp, Pencil, Trash2, Tag, Receipt } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { bookingStatusTone, inr, shortInr } from '../data/mockData.js';

const STATUSES = ['Confirmed', 'Part paid', 'Pending', 'Completed', 'Cancelled'];

export default function Bookings() {
  const { bookings, packages, team, owner, create, update, updateMany, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [statusFor, setStatusFor] = useState(null);

  const rows = byOwner(bookings, owner);
  const consultants = team.filter((t) => t.bookings > 0).map((t) => t.name.split(' ')[0]);

  const booked = rows.reduce((s, b) => s + b.amount, 0);
  const collected = rows.reduce((s, b) => s + b.paid, 0);
  const pax = rows.reduce((s, b) => s + b.pax, 0);

  const fields = [
    { name: 'customer', label: 'Customer', type: 'text', required: true },
    { name: 'pkg', label: 'Package', type: 'select', options: packages.map((p) => p.name) },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'departure', label: 'Departure', type: 'date', required: true },
    { name: 'nights', label: 'Nights', type: 'number' },
    { name: 'pax', label: 'Travellers', type: 'number', required: true },
    { name: 'amount', label: 'Total value (₹)', type: 'number', required: true },
    { name: 'paid', label: 'Amount paid (₹)', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES },
    { name: 'owner', label: 'Team member', type: 'select', options: consultants },
  ];

  const save = (values) => {
    if (editing) update('bookings', editing.id, values);
    else create('bookings', values);
  };

  const raiseInvoice = (r) => {
    const id = create('invoices', {
      customer: r.customer,
      booking: r.id,
      issued: '04 Aug 2026',
      due: '18 Aug 2026',
      amount: r.amount,
      paid: r.paid,
      status: r.paid >= r.amount ? 'Paid' : r.paid > 0 ? 'Partial' : 'Overdue',
    });
    toast(`Invoice ${id} raised for ${r.customer}`);
  };

  const columns = [
    {
      key: 'id',
      header: 'Booking',
      render: (r) => (
        <div>
          <p className="font-bold text-brand-700">{r.id}</p>
          <p className="text-xs text-ink-500">{r.customer}</p>
        </div>
      ),
    },
    {
      key: 'pkg',
      header: 'Package',
      render: (r) => (
        <div className="min-w-[180px]">
          <p className="font-semibold text-ink-800">{r.pkg}</p>
          <p className="text-xs text-ink-500">{r.destination}</p>
        </div>
      ),
    },
    {
      key: 'departure',
      header: 'Departure',
      render: (r) => (
        <div>
          <p className="font-semibold text-ink-800">{r.departure}</p>
          <p className="text-xs text-ink-500">
            {r.nights} nights · {r.pax} pax
          </p>
        </div>
      ),
    },
    { key: 'amount', header: 'Value', render: (r) => <span className="font-bold text-ink-900">{inr(r.amount)}</span> },
    {
      key: 'paid',
      header: 'Collection',
      render: (r) => {
        const pct = r.amount ? Math.round((r.paid / r.amount) * 100) : 0;
        return (
          <div className="min-w-[130px]">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-ink-700">{inr(r.paid)}</span>
              <span className="text-ink-400">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <div
                className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={bookingStatusTone[r.status]} dot>{r.status}</Badge>,
    },
    { key: 'owner', header: 'Team', render: (r) => <span className="font-semibold text-ink-700">{r.owner}</span> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <RowMenu
          items={[
            { label: 'Edit booking', icon: Pencil, onClick: () => { setEditing(r); setFormOpen(true); } },
            { label: 'Change status', icon: Tag, onClick: () => setStatusFor([r.id]) },
            { label: 'Raise invoice', icon: Receipt, onClick: () => raiseInvoice(r) },
            { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Bookings" subtitle="Every confirmed and in-progress trip">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> New booking
        </button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Total bookings" value={rows.length} skin="brand" />
        <StatCard icon={TrendingUp} label="Booked value" value={shortInr(booked)} />
        <StatCard icon={Wallet} label="Collected" value={shortInr(collected)} />
        <StatCard icon={Users} label="Travellers" value={pax} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['id', 'customer', 'pkg', 'destination']}
        searchPlaceholder="Search by booking ID, customer or package…"
        filters={[
          { key: 'status', label: 'Status', options: STATUSES },
          { key: 'owner', label: 'Team', options: consultants },
        ]}
        exportName="smira-club-bookings"
        emptyLabel="No bookings match this view"
        onRowClick={(r) => {
          setEditing(r);
          setFormOpen(true);
        }}
        bulkActions={[
          { label: 'Change status', icon: Tag, onClick: (ids) => setStatusFor(ids) },
          { label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) },
        ]}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.id}` : 'New booking'}
        subtitle={editing ? editing.customer : 'Confirm a trip for a customer'}
        fields={fields}
        initial={editing || { status: 'Pending', paid: 0 }}
        submitLabel={editing ? 'Save changes' : 'Create booking'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('bookings', confirm)}
        title="Delete bookings?"
        message={`This removes ${confirm?.length || 0} booking(s). Linked invoices stay untouched.`}
      />

      <Modal
        open={Boolean(statusFor)}
        onClose={() => setStatusFor(null)}
        title="Change booking status"
        size="sm"
      >
        <div className="space-y-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                updateMany('bookings', statusFor, { status: s }, `Status set to ${s}`);
                setStatusFor(null);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50"
            >
              <Badge tone={bookingStatusTone[s]} dot>{s}</Badge>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
