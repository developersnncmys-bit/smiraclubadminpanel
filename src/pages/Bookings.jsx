import { useState } from 'react';
import {
  Plus, CalendarCheck, Wallet, Users, TrendingUp, Pencil, Trash2, Tag, Receipt,
  LayoutGrid, Rows3, Crown,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import BookingDetails from '../components/bookings/BookingDetails.jsx';
import BookingOverview from '../components/bookings/BookingOverview.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { useNavigate } from 'react-router-dom';
import { bookingStatusTone, bookingTypes, bookingSources, inr, shortInr } from '../data/mockData.js';
import { downloadCsv } from '../lib/csv.js';

const STATUSES = ['Confirmed', 'Part paid', 'Pending', 'Completed', 'Cancelled'];

export default function Bookings() {
  const {
    bookings, packages, team, customers, memberSignups, memberships, invoices,
    owner, create, update, updateMany, remove, toast,
  } = useApp();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [statusFor, setStatusFor] = useState(null);
  const [viewing, setViewing] = useState(null); // the booking panel
  const [view, setView] = useState('list'); // 'list' | 'overview'

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
      key: 'membership',
      header: 'Membership',
      render: (r) =>
        r.membership ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-800">
            <Crown size={12} className="shrink-0 text-brand-600" /> {r.membership}
          </span>
        ) : (
          <span className="text-sm text-ink-400">Not a member</span>
        ),
    },
    {
      key: 'bookingType',
      header: 'Type',
      render: (r) => (
        <div className="min-w-[170px]">
          <p className="font-semibold text-ink-800">
            {r.bookingType || 'Package'}
            {r.freeStay && <span className="ml-1.5 text-xs font-bold text-emerald-600">free stay</span>}
          </p>
          <p className="truncate text-xs text-ink-500">{r.hotel || r.pkg}</p>
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      render: (r) => <span className="text-ink-700">{r.destination}</span>,
    },
    {
      key: 'checkIn',
      header: 'Stay',
      render: (r) => (
        <div className="whitespace-nowrap">
          <p className="num font-semibold text-ink-800">
            {r.checkIn || r.departure} → {r.checkOut || '—'}
          </p>
          <p className="num text-xs text-ink-500">
            {r.rooms || 1} room{(r.rooms || 1) > 1 ? 's' : ''} · {r.adults ?? r.pax} guests
          </p>
        </div>
      ),
    },
    { key: 'amount', header: 'Value', render: (r) => <span className="font-bold text-ink-900">{inr(r.amount)}</span> },
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

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          { key: 'list', label: 'Bookings', icon: Rows3, count: rows.length },
          { key: 'overview', label: 'Booking desk', icon: LayoutGrid },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              view === v.key
                ? 'bg-ink-900 text-white shadow-sm'
                : 'bg-white text-ink-600 ring-1 ring-ink-900/[0.07] hover:text-ink-900'
            }`}
          >
            <v.icon size={15} /> {v.label}
            {v.count != null && (
              <span className={`num ${view === v.key ? 'text-white/60' : 'text-ink-400'}`}>{v.count}</span>
            )}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <BookingOverview
          rows={rows}
          invoices={invoices}
          signups={memberSignups}
          onOpen={(b) => setViewing(b)}
          actions={{
            add: () => { setEditing(null); setFormOpen(true); },
            showList: () => setView('list'),
            note: (message) => toast(message),
            recordPayment: () => toast('Payments arrive with that sheet'),
            exportBookings: () =>
              downloadCsv('smira-club-bookings', rows, [
                { key: 'id', header: 'Booking' },
                { key: 'customer', header: 'Customer' },
                { key: 'membership', header: 'Membership' },
                { key: 'bookingType', header: 'Type' },
                { key: 'hotel', header: 'Hotel' },
                { key: 'vendor', header: 'Vendor' },
                { key: 'destination', header: 'Destination' },
                { key: 'checkIn', header: 'Check-in' },
                { key: 'checkOut', header: 'Check-out' },
                { key: 'rooms', header: 'Rooms' },
                { key: 'pax', header: 'Guests' },
                { key: 'amount', header: 'Amount' },
                { key: 'paid', header: 'Paid' },
                { key: 'status', header: 'Status' },
                { key: 'owner', header: 'Assigned to' },
                { key: 'source', header: 'Source' },
                { key: 'created', header: 'Created' },
              ]),
          }}
        />
      )}

      {view === 'list' && (
      <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Total bookings" value={rows.length} skin="brand" />
        <StatCard icon={TrendingUp} label="Booked value" value={shortInr(booked)} />
        <StatCard icon={Wallet} label="Collected" value={shortInr(collected)} />
        <StatCard icon={Users} label="Travellers" value={pax} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['id', 'customer', 'pkg', 'destination', 'hotel', 'vendor']}
        searchPlaceholder="Search by booking ID, customer or package…"
        filters={[
          { key: 'status', label: 'Status', options: STATUSES },
          { key: 'bookingType', label: 'Type', options: bookingTypes },
          { key: 'membership', label: 'Membership', options: memberships.map((p) => p.name) },
          { key: 'source', label: 'Source', options: bookingSources },
          { key: 'owner', label: 'Assigned to', options: consultants },
        ]}
        exportName="smira-club-bookings"
        emptyLabel="No bookings match this view"
        onRowClick={(r) => setViewing(r)}
        bulkActions={[
          { label: 'Change status', icon: Tag, onClick: (ids) => setStatusFor(ids) },
          { label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) },
        ]}
      />
      </>
      )}

      {viewing && (
        <BookingDetails
          booking={viewing}
          list={rows}
          customer={customers.find((c) => c.name === viewing.customer) || null}
          signups={memberSignups}
          plans={memberships}
          onClose={() => setViewing(null)}
          onJump={(i) => rows[i] && setViewing(rows[i])}
          onEdit={(b) => {
            setViewing(null);
            setEditing(b);
            setFormOpen(true);
          }}
          onInvoice={(b) => {
            raiseInvoice(b);
            setViewing(null);
          }}
        />
      )}

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
