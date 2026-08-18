import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { inr } from '../data/mockData.js';

const KINDS = ['Percent', 'Flat'];
const STATUS = ['Running', 'Scheduled', 'Paused', 'Expired'];
const tone = { Running: 'green', Scheduled: 'sky', Paused: 'amber', Expired: 'slate' };

/** Discount codes and seasonal offers. */
export default function Offers() {
  return (
    <RecordsPage
      collection="offers"
      title="Offers & Promotions"
      subtitle="Discount codes and seasonal offers"
      addLabel="Create offer"
      searchKeys={['code', 'title', 'appliesTo']}
      filters={[
        { key: 'status', label: 'Status', options: STATUS },
        { key: 'kind', label: 'Type', options: KINDS },
      ]}
      initial={{ kind: 'Percent', status: 'Scheduled', limit: 100 }}
      defaults={{ used: 0 }}
      stats={(rows) => [
        { label: 'Offers', value: rows.length },
        { label: 'Running now', value: rows.filter((r) => r.status === 'Running').length, tone: 'text-emerald-700' },
        { label: 'Times redeemed', value: rows.reduce((s, r) => s + Number(r.used || 0), 0) },
        {
          label: 'Nearly used up',
          value: rows.filter((r) => r.limit > 0 && r.used / r.limit >= 0.8).length,
          tone: 'text-orange-600',
          hint: '80% of the limit or more',
        },
      ]}
      fields={[
        { name: 'code', label: 'Code', type: 'text', required: true },
        { name: 'title', label: 'Offer name', type: 'text', required: true },
        { name: 'kind', label: 'Discount type', type: 'select', options: KINDS },
        { name: 'discount', label: 'Discount value', type: 'number', required: true, help: 'A percentage, or rupees off' },
        { name: 'appliesTo', label: 'Applies to', type: 'text', full: true },
        { name: 'validTill', label: 'Valid till', type: 'date' },
        { name: 'limit', label: 'Redemption limit', type: 'number', help: '0 means unlimited' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'code',
          header: 'Code',
          render: (r) => (
            <div className="min-w-0">
              <p className="font-mono text-sm font-extrabold tracking-wide text-brand-700">{r.code}</p>
              <p className="truncate text-xs text-ink-500">{r.title}</p>
            </div>
          ),
        },
        {
          key: 'discount',
          header: 'Discount',
          csv: (r) => (r.kind === 'Percent' ? `${r.discount}%` : r.discount),
          render: (r) => (
            <span className="num font-bold text-ink-900">
              {r.kind === 'Percent' ? `${r.discount}%` : inr(r.discount)}
            </span>
          ),
        },
        { key: 'appliesTo', header: 'Applies to', render: (r) => <span className="text-ink-700">{r.appliesTo}</span> },
        {
          key: 'validTill',
          header: 'Valid till',
          render: (r) => <span className="whitespace-nowrap text-ink-600">{r.validTill}</span>,
        },
        {
          key: 'used',
          header: 'Redeemed',
          csv: (r) => `${r.used}/${r.limit || 'unlimited'}`,
          render: (r) => {
            const pct = r.limit ? Math.round((r.used / r.limit) * 100) : 0;
            return (
              <div className="w-[110px]">
                <p className="num text-sm font-semibold text-ink-800">
                  {r.used}
                  {r.limit ? ` / ${r.limit}` : ' · no limit'}
                </p>
                {r.limit > 0 && (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-soft">
                    <div
                      className={`h-full rounded-full ${pct >= 80 ? 'bg-orange-500' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          },
        },
        { key: 'status', header: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
      ]}
      rowActions={(row, app) => [
        {
          label: row.status === 'Running' ? 'Pause offer' : 'Start offer',
          onClick: () =>
            app.update(
              'offers',
              row.id,
              { status: row.status === 'Running' ? 'Paused' : 'Running' },
              { message: `${row.code} ${row.status === 'Running' ? 'paused' : 'is live'}` }
            ),
        },
        {
          label: 'Copy code',
          onClick: () => app.toast(`${row.code} copied for sharing`, 'info'),
        },
      ]}
    />
  );
}
