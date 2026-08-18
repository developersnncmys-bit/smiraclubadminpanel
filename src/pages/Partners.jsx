import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { inr, shortInr } from '../data/mockData.js';

const TYPES = ['Sub-agent', 'Corporate', 'Affiliate'];
const STATUS = ['Active', 'On hold', 'Closed'];
const tone = { Active: 'green', 'On hold': 'amber', Closed: 'slate' };

/** The vendors the agency buys from, and what is still owed to them. */
export default function Partners() {
  return (
    <RecordsPage
      collection="partners"
      title="Vendors"
      subtitle="The vendors you buy from, and what you owe them"
      addLabel="Add vendor"
      searchKeys={['name', 'contact', 'city', 'phone']}
      filters={[
        { key: 'type', label: 'Type', options: TYPES },
        { key: 'status', label: 'Status', options: STATUS },
      ]}
      initial={{ type: 'Sub-agent', status: 'Active', commission: 8 }}
      defaults={{ bookings: 0, sourced: 0, owed: 0, paid: 0 }}
      stats={(rows) => [
        { label: 'Vendors', value: rows.length, hint: `${rows.filter((r) => r.status === 'Active').length} active` },
        { label: 'Bookings sourced', value: rows.reduce((s, r) => s + Number(r.bookings || 0), 0) },
        { label: 'Business brought in', value: shortInr(rows.reduce((s, r) => s + Number(r.sourced || 0), 0)) },
        {
          label: 'Commission owed',
          value: inr(rows.reduce((s, r) => s + Number(r.owed || 0), 0)),
          tone: 'text-orange-600',
          hint: 'still to pay out',
        },
      ]}
      fields={[
        { name: 'name', label: 'Vendor name', type: 'text', required: true },
        { name: 'type', label: 'Type', type: 'select', options: TYPES },
        { name: 'contact', label: 'Contact person', type: 'text' },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'city', label: 'City', type: 'text' },
        { name: 'commission', label: 'Commission (%)', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Vendor',
          render: (r) => (
            <div className="flex items-center gap-3">
              <Avatar name={r.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-bold text-ink-900">{r.name}</p>
                <p className="truncate text-xs text-ink-500">
                  {r.contact} · {r.city}
                </p>
              </div>
            </div>
          ),
        },
        { key: 'type', header: 'Type', render: (r) => <Badge tone="teal">{r.type}</Badge> },
        {
          key: 'commission',
          header: 'Commission',
          render: (r) => <span className="num font-semibold text-ink-800">{r.commission}%</span>,
        },
        {
          key: 'bookings',
          header: 'Bookings',
          render: (r) => <span className="num font-semibold text-ink-800">{r.bookings}</span>,
        },
        {
          key: 'sourced',
          header: 'Business brought',
          render: (r) => <span className="num font-bold text-ink-900">{inr(r.sourced)}</span>,
        },
        {
          key: 'owed',
          header: 'Commission owed',
          render: (r) =>
            r.owed > 0 ? (
              <span className="num font-bold text-orange-600">{inr(r.owed)}</span>
            ) : (
              <span className="text-sm font-semibold text-emerald-700">Settled</span>
            ),
        },
        {
          key: 'paid',
          header: 'Paid to date',
          render: (r) => <span className="num text-ink-600">{r.paid ? inr(r.paid) : '—'}</span>,
        },
        { key: 'status', header: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
      ]}
      rowActions={(row, app) =>
        row.owed > 0
          ? [
              {
                label: 'Mark commission paid',
                onClick: () =>
                  app.update(
                    'partners',
                    row.id,
                    { paid: Number(row.paid || 0) + Number(row.owed || 0), owed: 0 },
                    { message: `Commission settled for ${row.name}` }
                  ),
              },
            ]
          : []
      }
    />
  );
}
