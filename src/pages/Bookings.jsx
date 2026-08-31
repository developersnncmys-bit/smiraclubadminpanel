import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Tag, Receipt, LayoutGrid,
  Rows3, Crown, CalendarCheck, Wallet, Users, Search,
  Download, Filter, Zap, Eye, Clock, AlertTriangle,
  UserPlus, Warehouse,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import KpiRow from '../components/ui/KpiRow.jsx';
import MenuButton from '../components/ui/MenuButton.jsx';
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
import SectionTabs from '../components/ui/SectionTabs.jsx';

const STATUSES = ['Confirmed', 'Part paid', 'Pending', 'Completed', 'Cancelled'];

/** The colour every booking status reads by — the menu and the rails agree. */
const STATUS = {
  Confirmed: { dot: 'bg-emerald-500', rail: 'before:bg-emerald-500' },
  'Part paid': { dot: 'bg-amber-400', rail: 'before:bg-amber-400' },
  Pending: { dot: 'bg-sky-500', rail: 'before:bg-sky-500' },
  Completed: { dot: 'bg-brand-500', rail: 'before:bg-brand-500' },
  Cancelled: { dot: 'bg-rose-400', rail: 'before:bg-rose-400' },
};

/** One fact on a booking card: the value, then what it is. */
function Fact({ label, value, tone }) {
  return (
    <div className="min-w-0 px-1 text-center">
      <p className={`num truncate font-display text-sm font-extrabold leading-none ${tone || 'text-ink-900'}`}>
        {value}
      </p>
      <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

/** How much of the trip is paid for, drawn the way the team's score is. */
function Ring({ value, size = 44 }) {
  const r = (size - 7) / 2;
  const c = 2 * Math.PI * r;
  const stroke = value >= 100 ? '#10b981' : value > 0 ? '#f59e0b' : '#94a3b8';
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c - (Math.min(100, Math.max(0, value)) / 100) * c}
        />
      </svg>
      <span className="num absolute text-[10px] font-extrabold text-ink-900">{value}%</span>
    </span>
  );
}

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
  const [status, setStatus] = useState('All');
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState('cards');

  const rows = byOwner(bookings, owner);
  const consultants = team.filter((t) => t.bookings > 0).map((t) => t.name.split(' ')[0]);

  const booked = rows.reduce((s, b) => s + b.amount, 0);
  const collected = rows.reduce((s, b) => s + b.paid, 0);
  const pax = rows.reduce((s, b) => s + b.pax, 0);
  const outstanding = rows.reduce((s, b) => s + Math.max(0, Number(b.amount || 0) - Number(b.paid || 0)), 0);

  const matches = (b) => {
    if (status !== 'All' && b.status !== status) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [b.id, b.customer, b.pkg, b.destination, b.hotel, b.vendor, b.owner].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  };
  const listRows = rows.filter(matches);

  const exportBookings = () =>
    downloadCsv('smira-club-bookings', rows, [
      { key: 'id', header: 'Booking' }, { key: 'customer', header: 'Customer' },
      { key: 'membership', header: 'Membership' }, { key: 'bookingType', header: 'Type' },
      { key: 'hotel', header: 'Hotel' }, { key: 'vendor', header: 'Vendor' },
      { key: 'destination', header: 'Destination' }, { key: 'checkIn', header: 'Check-in' },
      { key: 'checkOut', header: 'Check-out' }, { key: 'rooms', header: 'Rooms' },
      { key: 'pax', header: 'Guests' }, { key: 'amount', header: 'Amount' },
      { key: 'paid', header: 'Paid' }, { key: 'status', header: 'Status' },
      { key: 'owner', header: 'Assigned to' }, { key: 'source', header: 'Source' },
      { key: 'created', header: 'Created' },
    ]);

  /** The actions the desk starts work with, as one menu. */
  const quickActions = [
    { label: 'New booking', icon: Plus, run: () => { setEditing(null); setFormOpen(true); } },
    { label: 'Record payment', icon: Wallet, run: () => navigate('/payment') },
    { label: 'Raise invoice', icon: Receipt, run: () => (rows[0] ? raiseInvoice(rows[0]) : toast('No booking to invoice', 'info')) },
    { label: 'Change status', icon: Tag, run: () => (rows[0] ? setStatusFor([rows[0].id]) : toast('No booking yet', 'info')) },
    { label: 'Add customer', icon: UserPlus, run: () => navigate('/customers') },
    { label: 'Travel inventory', icon: Warehouse, run: () => navigate('/inventory') },
    { label: 'Export', icon: Download, run: exportBookings },
  ];

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
      <PageHeader
        title="Bookings"
        subtitle={`${rows.length} trips · ${shortInr(booked)} booked · ${shortInr(outstanding)} still to collect`}
      >
        <button className="btn-line" onClick={exportBookings}>
          <Download size={16} /> Export
        </button>
        <button
          className="btn-action"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> New booking
        </button>
      </PageHeader>

      {/* Pick a status, or start something */}
      <section className="card flex flex-wrap items-center gap-3 px-5 py-3.5">
        <h2 className="font-display text-base font-extrabold text-ink-900">Bookings</h2>

        <MenuButton
          label={status === 'All' ? `All statuses · ${rows.length}` : `${status} · ${rows.filter((b) => b.status === status).length}`}
          icon={Filter}
          value={status}
          width="w-[270px]"
          items={[
            { key: 'All', label: 'All statuses', count: rows.length },
            ...STATUSES.map((st) => {
              const list = rows.filter((b) => b.status === st);
              return {
                key: st,
                label: st,
                count: list.length,
                dot: STATUS[st]?.dot || 'bg-ink-400',
                hint: list.length ? shortInr(list.reduce((sum, b) => sum + Number(b.amount || 0), 0)) : null,
              };
            }),
          ]}
          onSelect={(key) => {
            setStatus(key);
            setView('list');
          }}
        />

        <MenuButton
          label="Quick actions"
          icon={Zap}
          variant="action"
          width="w-[250px]"
          items={quickActions.map((q) => ({ key: q.label, label: q.label, icon: q.icon }))}
          onSelect={(key) => quickActions.find((q) => q.label === key)?.run()}
        />

        <p className="num ml-auto text-sm text-ink-500">
          {rows.filter((b) => b.status === 'Confirmed').length} confirmed · {pax} travellers ·{' '}
          {shortInr(collected)} collected
        </p>
      </section>

      <div className="mt-4">
        <KpiRow
          cols={6}
          items={[
            { label: 'Bookings', value: rows.length, icon: CalendarCheck, hint: `${rows.filter((b) => b.status === 'Confirmed').length} confirmed` },
            { label: 'Booked value', value: shortInr(booked), icon: Receipt },
            { label: 'Collected', value: shortInr(collected), icon: Wallet, tone: 'text-brand-700', progress: booked ? Math.round((collected / booked) * 100) : 0 },
            { label: 'Outstanding', value: shortInr(outstanding), icon: AlertTriangle, tone: outstanding ? 'text-amber-600' : 'text-ink-900', hint: 'still to collect' },
            { label: 'Travellers', value: pax, icon: Users },
            { label: 'Members', value: rows.filter((b) => b.membership).length, icon: Crown, hint: 'booked on a plan' },
          ]}
        />
      </div>

      <SectionTabs
        className="mt-6"
        items={[
          { key: 'list', label: 'Bookings', icon: Rows3, count: rows.length },
          { key: 'overview', label: 'Booking desk', icon: LayoutGrid },
        ]}
        value={view}
        onChange={setView}
      />

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
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input pl-10"
                placeholder="Search booking ID, customer, package or hotel…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {status !== 'All' && (
              <button className="btn-line btn-sm" onClick={() => setStatus('All')}>{status} · clear</button>
            )}
            <div className="seg">
              <button onClick={() => setLayout('cards')} className={`seg-item ${layout === 'cards' ? 'seg-item-on' : ''}`}>
                <LayoutGrid size={13} className="mr-1 inline" /> Cards
              </button>
              <button onClick={() => setLayout('table')} className={`seg-item ${layout === 'table' ? 'seg-item-on' : ''}`}>
                <Rows3 size={13} className="mr-1 inline" /> Table
              </button>
            </div>
          </div>

          {layout === 'cards' && (
            <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {listRows.map((b) => {
                const paidPct = b.amount ? Math.round((b.paid / b.amount) * 100) : 0;
                const due = Math.max(0, Number(b.amount || 0) - Number(b.paid || 0));
                return (
                  <article
                    key={b.id}
                    onClick={() => setViewing(b)}
                    className={`card rail ${STATUS[b.status]?.rail || 'before:bg-ink-400'} cursor-pointer p-4 pl-5 transition hover:shadow-raised`}
                  >
                    {/* Who is travelling, and how the booking stands */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-display text-[15px] font-extrabold leading-tight text-ink-900">
                          {b.customer}
                        </p>
                        <p className="num truncate text-xs text-ink-500">{b.id} · {b.pkg || b.hotel}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {b.membership && <Badge tone="amber"><Crown size={11} /> {b.membership}</Badge>}
                        <RowMenu
                          items={[
                            { label: 'Edit booking', icon: Pencil, onClick: () => { setEditing(b); setFormOpen(true); } },
                            { label: 'Change status', icon: Tag, onClick: () => setStatusFor([b.id]) },
                            { label: 'Raise invoice', icon: Receipt, onClick: () => raiseInvoice(b) },
                            { label: 'Record payment', icon: Wallet, onClick: () => navigate('/payment') },
                            { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([b.id]) },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone={bookingStatusTone[b.status]} dot>{b.status}</Badge>
                      <Badge tone="sky">{b.bookingType || 'Package'}</Badge>
                      {b.freeStay && <Badge tone="green">Free stay</Badge>}
                    </div>

                    {/* The one line that says what the trip is */}
                    <p className="mt-3 truncate text-[13px] text-ink-700">
                      <span className="font-bold text-ink-900">{b.destination}</span>
                      {` · ${b.pax} pax · ${b.nights || 0} nights`}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {b.checkIn || b.departure} → {b.checkOut || '—'}
                      </span>
                      <span className={due ? 'font-semibold text-amber-600' : 'text-emerald-600'}>
                        {due ? `${shortInr(due)} due` : 'paid in full'}
                      </span>
                    </p>

                    {/* The three facts management reads, and how much is paid */}
                    <div className="mt-3 flex items-center gap-3 border-t border-ink-900/[0.07] pt-3">
                      <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
                        <Fact label="Value" value={shortInr(b.amount)} tone="text-brand-700" />
                        <Fact label="Rooms" value={b.rooms || 1} />
                        <Fact label="Owner" value={b.owner || '—'} />
                      </div>
                      <Ring value={paidPct} />
                    </div>

                    {/* Three actions; the rest live in the booking panel */}
                    <div className="mt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-line btn-sm" onClick={() => raiseInvoice(b)}>
                        <Receipt size={13} /> Invoice
                      </button>
                      <button className="btn-line btn-sm" onClick={() => navigate('/payment')}>
                        <Wallet size={13} /> Payment
                      </button>
                      <button className="btn-line btn-sm" onClick={() => setViewing(b)}>
                        <Eye size={13} /> Details
                      </button>
                      {b.status !== 'Cancelled' && (
                        <button className="btn-action btn-sm ml-auto" onClick={() => setStatusFor([b.id])}>
                          <Tag size={13} /> Change status
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
              {listRows.length === 0 && (
                <div className="card border-dashed p-14 text-center text-sm text-ink-500 lg:col-span-2 2xl:col-span-3">
                  No bookings match this view.
                </div>
              )}
            </div>
          )}

          {layout === 'table' && (
            <div className="mt-4">
              <DataTable
                columns={columns}
                rows={listRows}
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
            </div>
          )}
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
