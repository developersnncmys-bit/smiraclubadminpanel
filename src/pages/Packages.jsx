import { useState } from 'react';
import { Plus, Star, Moon, MapPin, Users, Pencil, Copy, Search, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr } from '../data/mockData.js';

const TYPES = ['Honeymoon', 'Luxury', 'Family', 'Group', 'Adventure', 'City break'];
const GRADIENTS = [
  'from-brand-500 to-ocean',
  'from-ocean to-grape',
  'from-brand-600 to-brand-300',
  'from-gold to-coral',
  'from-grape to-ocean',
  'from-coral to-gold',
];

export default function Packages() {
  const { packages, create, update, remove, duplicate } = useApp();
  const [type, setType] = useState('All');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const list = packages.filter(
    (p) =>
      (type === 'All' || p.type === type) &&
      `${p.name} ${p.destination}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const fields = [
    { name: 'name', label: 'Package name', type: 'text', required: true, full: true },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', options: TYPES },
    { name: 'nights', label: 'Nights', type: 'number', required: true },
    { name: 'price', label: 'Price per person (₹)', type: 'number', required: true },
    { name: 'seats', label: 'Seats available', type: 'number' },
    { name: 'rating', label: 'Rating', type: 'number', placeholder: '4.5' },
  ];

  const save = (values) => {
    if (editing) {
      update('packages', editing.id, values);
    } else {
      create('packages', {
        ...values,
        sold: 0,
        rating: values.rating || 4.5,
        gradient: GRADIENTS[packages.length % GRADIENTS.length],
      });
    }
  };

  return (
    <>
      <PageHeader title="Packages" subtitle="Ready-to-sell itineraries with live pricing">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Create package
        </button>
      </PageHeader>

      <div className="card mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search packages or destinations…"
            className="input pl-10"
          />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {['All', ...TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                type === t
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'border border-ink-900/10 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((p) => (
          <article key={p.id} className="card card-hover group overflow-hidden">
            <div className={`relative h-32 bg-gradient-to-br ${p.gradient || GRADIENTS[0]}`}>
              <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,255,255,0.35),transparent_60%)]" />
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="chip bg-white/25 text-white backdrop-blur">{p.type}</span>
              </div>
              <div className="absolute right-4 top-4 chip bg-white/90 text-ink-900">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {p.rating}
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <p className="truncate font-display text-lg font-extrabold text-white drop-shadow">{p.name}</p>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-white/85">
                  <MapPin size={12} /> {p.destination}
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Starting from</p>
                  <p className="font-display text-2xl font-extrabold text-ink-900">{inr(p.price)}</p>
                  <p className="text-xs text-ink-500">per person</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1.5 text-sm font-semibold text-ink-700">
                    <Moon size={14} className="text-ink-400" /> {p.nights} nights
                  </p>
                  <p className="mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-ink-700">
                    <Users size={14} className="text-ink-400" /> {p.sold} sold
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-900/5 pt-4">
                <Badge tone={p.seats <= 8 ? 'rose' : 'green'} dot>
                  {p.seats} seats left
                </Badge>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => duplicate('packages', p.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(p);
                      setFormOpen(true);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirm(p)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-rose-400 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 && (
        <div className="card p-16 text-center">
          <p className="text-sm font-semibold text-ink-600">No packages match this filter</p>
          <button
            className="btn-soft mx-auto mt-4"
            onClick={() => {
              setQuery('');
              setType('All');
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.name}` : 'Create package'}
        subtitle={editing ? editing.id : 'Add a sellable itinerary to your catalogue'}
        fields={fields}
        initial={editing || { type: 'Family', seats: 20, rating: 4.5 }}
        submitLabel={editing ? 'Save changes' : 'Create package'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('packages', confirm.id)}
        title="Delete package?"
        message={`“${confirm?.name}” will be removed from the catalogue. Existing bookings keep their package name.`}
      />
    </>
  );
}
