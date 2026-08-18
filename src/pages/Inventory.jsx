import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { inr } from '../data/mockData.js';

const KINDS = ['Hotel', 'Flight', 'Cruise', 'Transport', 'Camp', 'Rail'];
const STATUS = ['Confirmed', 'Provisional', 'Sold out', 'Released'];
const tone = { Confirmed: 'green', Provisional: 'amber', 'Sold out': 'violet', Released: 'slate' };

/** What the agency is holding with suppliers, and how much is left to sell. */
export default function Inventory() {
  const left = (r) => Math.max(0, Number(r.held || 0) - Number(r.sold || 0));

  return (
    <RecordsPage
      collection="inventory"
      title="Travel Inventory"
      subtitle="Seats, rooms and vehicles you hold, and what is left to sell"
      addLabel="Add allotment"
      searchKeys={['item', 'supplier', 'season', 'kind']}
      filters={[
        { key: 'kind', label: 'Type', options: KINDS },
        { key: 'status', label: 'Status', options: STATUS },
      ]}
      initial={{ kind: 'Hotel', status: 'Provisional', held: 10, sold: 0 }}
      stats={(rows) => {
        const held = rows.reduce((s, r) => s + Number(r.held || 0), 0);
        const sold = rows.reduce((s, r) => s + Number(r.sold || 0), 0);
        return [
          { label: 'Allotments', value: rows.length },
          { label: 'Units held', value: held },
          { label: 'Units sold', value: sold, hint: held ? `${Math.round((sold / held) * 100)}% of what you hold` : '' },
          {
            label: 'Still to sell',
            value: held - sold,
            tone: held - sold > 0 ? 'text-orange-600' : 'text-emerald-700',
          },
        ];
      }}
      fields={[
        { name: 'item', label: 'What you hold', type: 'text', required: true, full: true },
        { name: 'kind', label: 'Type', type: 'select', options: KINDS },
        { name: 'supplier', label: 'Supplier', type: 'text' },
        { name: 'season', label: 'Season', type: 'text', placeholder: 'Sep – Nov 2026' },
        { name: 'held', label: 'Units held', type: 'number', required: true },
        { name: 'sold', label: 'Units sold', type: 'number' },
        { name: 'cost', label: 'Cost per unit (₹)', type: 'number' },
        { name: 'release', label: 'Release date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'item',
          header: 'Allotment',
          render: (r) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-ink-900">{r.item}</p>
              <p className="truncate text-xs text-ink-500">
                {r.supplier} · {r.season}
              </p>
            </div>
          ),
        },
        { key: 'kind', header: 'Type', render: (r) => <Badge tone="teal">{r.kind}</Badge> },
        {
          key: 'held',
          header: 'Sold of held',
          csv: (r) => `${r.sold}/${r.held}`,
          render: (r) => {
            const pct = r.held ? Math.round((r.sold / r.held) * 100) : 0;
            return (
              <div className="w-[110px]">
                <p className="num text-sm font-semibold text-ink-800">
                  {r.sold} / {r.held}
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full ${pct >= 100 ? 'bg-violet-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          },
        },
        {
          key: 'left',
          header: 'Left',
          csv: (r) => left(r),
          render: (r) => (
            <span className={`num font-bold ${left(r) === 0 ? 'text-violet-700' : 'text-ink-900'}`}>
              {left(r) === 0 ? 'Sold out' : left(r)}
            </span>
          ),
        },
        {
          key: 'cost',
          header: 'Cost per unit',
          render: (r) => <span className="num text-ink-700">{r.cost ? inr(r.cost) : '—'}</span>,
        },
        {
          key: 'release',
          header: 'Release by',
          render: (r) => <span className="whitespace-nowrap text-ink-600">{r.release}</span>,
        },
        { key: 'status', header: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
      ]}
    />
  );
}
