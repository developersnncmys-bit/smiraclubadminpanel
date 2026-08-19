import { useState } from 'react';
import { Plus, Hotel, Package, Home, Umbrella, Star, MapPin, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr } from '../data/mockData.js';

const STATUS = ['Available', 'Limited', 'Sold out'];
const statusTone = { Available: 'green', Limited: 'amber', 'Sold out': 'rose' };

const MEALS = ['Room only', 'Breakfast included', 'Half board', 'Full board'];
const LIFESTYLE_CATEGORIES = ['Visa', 'Insurance', 'Lounge', 'Transfer', 'Experience', 'Forex'];

/** What each of the four things is, in its own words. */
const TABS = [
  {
    key: 'Hotels',
    icon: Hotel,
    unit: 'rooms',
    blurb: 'Rooms held with hotels, per night',
    priceLabel: 'Per night',
  },
  {
    key: 'Packages',
    icon: Package,
    unit: 'seats',
    blurb: 'Trips you sell, per person',
    priceLabel: 'Per person',
  },
  {
    key: 'Villas',
    icon: Home,
    unit: 'nights',
    blurb: 'Whole villas, per night',
    priceLabel: 'Per night',
  },
  {
    key: 'Lifestyle',
    icon: Umbrella,
    unit: 'units',
    blurb: 'Add-ons sold with a trip',
    priceLabel: 'Price',
  },
];

/** Name and where it is — the first thing anyone needs to recognise a row. */
function Title({ row }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-bold text-ink-900">{row.name}</p>
      <p className="flex items-center gap-1.5 truncate text-xs text-ink-500">
        <MapPin size={11} className="shrink-0" /> {row.location}
      </p>
    </div>
  );
}

/** How much of it is already taken. */
function Left({ row, unit }) {
  const total = Number(row.rooms ?? row.seats ?? 0);
  const taken = Number(row.booked || 0);
  const left = Math.max(0, total - taken);
  const pct = total ? Math.round((taken / total) * 100) : 0;

  return (
    <div className="w-[124px]">
      <p className="num text-sm font-semibold text-ink-800">
        {left === 0 ? <span className="text-rose-600">None left</span> : `${left} ${unit} left`}
      </p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-soft">
        <div
          className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-400' : 'bg-brand-500'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-ink-400">
        {taken} of {total} booked
      </p>
    </div>
  );
}

/**
 * The catalogue of what the agency actually sells, split the way the client
 * splits it: hotels, packages, villas and lifestyle. Each tab shows the
 * details that matter for that kind of thing rather than one shared shape.
 */
export default function Inventory() {
  const { inventory, create, update, remove } = useApp();
  const [tab, setTab] = useState('Hotels');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const active = TABS.find((t) => t.key === tab);
  const rows = inventory.filter((r) => r.kind === tab);

  const money = (r) => <span className="num font-bold text-ink-900">{inr(r.price)}</span>;
  const status = (r) => (
    <Badge tone={statusTone[r.status]} dot>
      {r.status}
    </Badge>
  );

  const actions = {
    key: 'actions',
    header: '',
    render: (r) => (
      <div className="flex justify-end">
        <RowMenu
          items={[
            {
              label: 'Edit',
              icon: Pencil,
              onClick: () => {
                setEditing(r);
                setFormOpen(true);
              },
            },
            { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
          ]}
        />
      </div>
    ),
  };

  // Each tab gets the columns that make sense for it.
  const columnsFor = {
    Hotels: [
      { key: 'name', header: 'Hotel', render: (r) => <Title row={r} /> },
      {
        key: 'stars',
        header: 'Rating',
        render: (r) => (
          <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-ink-800">
            <Star size={13} className="fill-amber-400 text-amber-400" /> {r.stars}-star
          </span>
        ),
      },
      { key: 'roomType', header: 'Room type', render: (r) => <span className="text-ink-700">{r.roomType}</span> },
      { key: 'mealPlan', header: 'Meals', render: (r) => <Badge tone="teal">{r.mealPlan}</Badge> },
      { key: 'price', header: 'Per night', render: money },
      { key: 'left', header: 'Availability', csv: (r) => r.rooms - r.booked, render: (r) => <Left row={r} unit="rooms" /> },
      { key: 'supplier', header: 'Supplier', render: (r) => <span className="text-sm text-ink-600">{r.supplier}</span> },
      { key: 'status', header: 'Status', render: status },
      actions,
    ],
    Packages: [
      { key: 'name', header: 'Package', render: (r) => <Title row={r} /> },
      {
        key: 'days',
        header: 'Duration',
        csv: (r) => `${r.days}D/${r.nights}N`,
        render: (r) => (
          <span className="whitespace-nowrap font-semibold text-ink-800">
            {r.days} days · {r.nights} nights
          </span>
        ),
      },
      {
        key: 'departure',
        header: 'Departure',
        render: (r) => <span className="whitespace-nowrap text-ink-700">{r.departure}</span>,
      },
      { key: 'price', header: 'Per person', render: money },
      { key: 'left', header: 'Seats', csv: (r) => r.seats - r.booked, render: (r) => <Left row={r} unit="seats" /> },
      { key: 'supplier', header: 'Supplier', render: (r) => <span className="text-sm text-ink-600">{r.supplier}</span> },
      { key: 'status', header: 'Status', render: status },
      actions,
    ],
    Villas: [
      { key: 'name', header: 'Villa', render: (r) => <Title row={r} /> },
      {
        key: 'bedrooms',
        header: 'Bedrooms',
        render: (r) => <span className="num font-semibold text-ink-800">{r.bedrooms}</span>,
      },
      {
        key: 'guests',
        header: 'Sleeps',
        render: (r) => <span className="num font-semibold text-ink-800">{r.guests} guests</span>,
      },
      { key: 'price', header: 'Per night', render: money },
      { key: 'left', header: 'Availability', csv: (r) => r.rooms - r.booked, render: (r) => <Left row={r} unit="nights" /> },
      { key: 'supplier', header: 'Managed by', render: (r) => <span className="text-sm text-ink-600">{r.supplier}</span> },
      { key: 'status', header: 'Status', render: status },
      actions,
    ],
    Lifestyle: [
      { key: 'name', header: 'Service', render: (r) => <Title row={r} /> },
      { key: 'category', header: 'Category', render: (r) => <Badge tone="teal">{r.category}</Badge> },
      { key: 'price', header: 'Price', render: money },
      { key: 'left', header: 'Availability', csv: (r) => r.rooms - r.booked, render: (r) => <Left row={r} unit="units" /> },
      { key: 'supplier', header: 'Provided by', render: (r) => <span className="text-sm text-ink-600">{r.supplier}</span> },
      { key: 'status', header: 'Status', render: status },
      actions,
    ],
  };

  // The form asks only for what that kind of thing needs.
  const shared = [
    { name: 'name', label: 'Name', type: 'text', required: true, full: true },
    { name: 'location', label: 'Where it is', type: 'text', required: true, full: true },
  ];
  const tail = [
    { name: 'supplier', label: 'Supplier', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: STATUS },
  ];

  const fieldsFor = {
    Hotels: [
      ...shared,
      { name: 'stars', label: 'Star rating', type: 'number' },
      { name: 'roomType', label: 'Room type', type: 'text' },
      { name: 'mealPlan', label: 'Meal plan', type: 'select', options: MEALS },
      { name: 'price', label: 'Price per night (₹)', type: 'number', required: true },
      { name: 'rooms', label: 'Rooms held', type: 'number' },
      { name: 'booked', label: 'Rooms booked', type: 'number' },
      ...tail,
    ],
    Packages: [
      ...shared,
      { name: 'days', label: 'Days', type: 'number' },
      { name: 'nights', label: 'Nights', type: 'number' },
      { name: 'departure', label: 'Departure date', type: 'date' },
      { name: 'price', label: 'Price per person (₹)', type: 'number', required: true },
      { name: 'seats', label: 'Seats held', type: 'number' },
      { name: 'booked', label: 'Seats booked', type: 'number' },
      ...tail,
    ],
    Villas: [
      ...shared,
      { name: 'bedrooms', label: 'Bedrooms', type: 'number' },
      { name: 'guests', label: 'Sleeps how many', type: 'number' },
      { name: 'price', label: 'Price per night (₹)', type: 'number', required: true },
      { name: 'rooms', label: 'Nights held', type: 'number' },
      { name: 'booked', label: 'Nights booked', type: 'number' },
      ...tail,
    ],
    Lifestyle: [
      ...shared,
      { name: 'category', label: 'Category', type: 'select', options: LIFESTYLE_CATEGORIES },
      { name: 'price', label: 'Price (₹)', type: 'number', required: true },
      { name: 'rooms', label: 'Units held', type: 'number' },
      { name: 'booked', label: 'Units sold', type: 'number' },
      ...tail,
    ],
  };

  const save = (values) => {
    if (editing) update('inventory', editing.id, values);
    else create('inventory', { ...values, kind: tab });
  };

  return (
    <>
      <PageHeader title="Travel Inventory" subtitle="Everything the agency sells, and how much of it is left">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Add {tab.replace(/s$/, '').toLowerCase()}
        </button>
      </PageHeader>

      {/* Pick what you are looking at */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TABS.map(({ key, icon: Icon, blurb }) => {
          const list = inventory.filter((r) => r.kind === key);
          const on = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`card card-hover flex items-center gap-3.5 p-4 text-left transition ${
                on ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  on ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'
                }`}
              >
                <Icon size={19} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-extrabold leading-none text-ink-900">
                  {list.length}
                </span>
                <span className="mt-1 block text-sm font-bold text-ink-800">{key}</span>
                <span className="block truncate text-xs text-ink-500">{blurb}</span>
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        key={tab}
        columns={columnsFor[tab]}
        rows={rows}
        selectable={false}
        searchKeys={['name', 'location', 'supplier']}
        searchPlaceholder={`Search ${tab.toLowerCase()}…`}
        filters={[{ key: 'status', label: 'Status', options: STATUS }]}
        exportName={`smira-club-${tab.toLowerCase()}`}
        emptyLabel={`No ${tab.toLowerCase()} yet`}
        onRowClick={(r) => {
          setEditing(r);
          setFormOpen(true);
        }}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.name}` : `Add ${tab.replace(/s$/, '').toLowerCase()}`}
        subtitle={editing ? editing.id : active.blurb}
        fields={fieldsFor[editing?.kind || tab]}
        initial={editing || { status: 'Available', booked: 0 }}
        submitLabel={editing ? 'Save changes' : 'Add to inventory'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('inventory', confirm)}
        title="Remove from inventory?"
        message="It stops being sellable. Bookings already made are not changed."
      />
    </>
  );
}
