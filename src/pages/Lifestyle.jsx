import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { inr } from '../data/mockData.js';

const CATEGORIES = ['Visa', 'Insurance', 'Lounge', 'Transfer', 'Experience', 'Forex'];
const STATUS = ['Active', 'Paused'];

/** The extras sold alongside a trip. */
export default function Lifestyle() {
  return (
    <RecordsPage
      collection="lifestyle"
      title="Lifestyle"
      subtitle="Add-ons sold alongside a trip"
      addLabel="Add service"
      searchKeys={['name', 'category', 'supplier']}
      filters={[
        { key: 'category', label: 'Category', options: CATEGORIES },
        { key: 'status', label: 'Status', options: STATUS },
      ]}
      initial={{ category: 'Visa', status: 'Active' }}
      defaults={{ sold: 0 }}
      stats={(rows) => [
        { label: 'Services', value: rows.length, hint: `${rows.filter((r) => r.status === 'Active').length} on sale` },
        { label: 'Units sold', value: rows.reduce((s, r) => s + Number(r.sold || 0), 0) },
        {
          label: 'Add-on revenue',
          value: inr(rows.reduce((s, r) => s + Number(r.sold || 0) * Number(r.price || 0), 0)),
        },
        {
          label: 'Margin earned',
          value: inr(rows.reduce((s, r) => s + Number(r.sold || 0) * Number(r.margin || 0), 0)),
          tone: 'text-emerald-700',
        },
      ]}
      fields={[
        { name: 'name', label: 'Service', type: 'text', required: true, full: true },
        { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
        { name: 'supplier', label: 'Supplier', type: 'text' },
        { name: 'price', label: 'Price to traveller (₹)', type: 'number', required: true },
        { name: 'margin', label: 'Margin per sale (₹)', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Service',
          render: (r) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-ink-900">{r.name}</p>
              <p className="truncate text-xs text-ink-500">{r.supplier}</p>
            </div>
          ),
        },
        { key: 'category', header: 'Category', render: (r) => <Badge tone="teal">{r.category}</Badge> },
        {
          key: 'price',
          header: 'Price',
          render: (r) => <span className="num font-bold text-ink-900">{inr(r.price)}</span>,
        },
        {
          key: 'margin',
          header: 'Margin',
          render: (r) => <span className="num font-semibold text-emerald-700">{inr(r.margin)}</span>,
        },
        {
          key: 'sold',
          header: 'Sold',
          render: (r) => <span className="num font-semibold text-ink-800">{r.sold}</span>,
        },
        {
          key: 'earned',
          header: 'Margin earned',
          csv: (r) => Number(r.sold || 0) * Number(r.margin || 0),
          render: (r) => (
            <span className="num font-bold text-ink-900">
              {inr(Number(r.sold || 0) * Number(r.margin || 0))}
            </span>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          render: (r) => <Badge tone={r.status === 'Active' ? 'green' : 'slate'} dot>{r.status}</Badge>,
        },
      ]}
      rowActions={(row, app) => [
        {
          label: row.status === 'Active' ? 'Pause selling' : 'Resume selling',
          onClick: () =>
            app.update(
              'lifestyle',
              row.id,
              { status: row.status === 'Active' ? 'Paused' : 'Active' },
              { message: `${row.name} ${row.status === 'Active' ? 'paused' : 'back on sale'}` }
            ),
        },
      ]}
    />
  );
}
