import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';

const PLACEMENTS = ['Home hero', 'Packages top strip', 'Sidebar', 'Blog header', 'Footer'];
const STATUS = ['Live', 'Scheduled', 'Ended', 'Draft'];
const tone = { Live: 'green', Scheduled: 'sky', Ended: 'slate', Draft: 'amber' };

/** Artwork on the website, and whether anyone clicks it. */
export default function Banners() {
  const rate = (r) => (r.impressions ? (r.clicks / r.impressions) * 100 : 0);

  return (
    <RecordsPage
      collection="banners"
      title="Banners"
      subtitle="Home page and campaign artwork, with what it earns in clicks"
      addLabel="Add banner"
      searchKeys={['title', 'placement']}
      filters={[
        { key: 'placement', label: 'Placement', options: PLACEMENTS },
        { key: 'status', label: 'Status', options: STATUS },
      ]}
      initial={{ placement: 'Home hero', status: 'Draft' }}
      defaults={{ clicks: 0, impressions: 0 }}
      stats={(rows) => {
        const clicks = rows.reduce((s, r) => s + Number(r.clicks || 0), 0);
        const views = rows.reduce((s, r) => s + Number(r.impressions || 0), 0);
        return [
          { label: 'Banners', value: rows.length, hint: `${rows.filter((r) => r.status === 'Live').length} live` },
          { label: 'Times shown', value: views.toLocaleString('en-IN') },
          { label: 'Clicks', value: clicks.toLocaleString('en-IN'), tone: 'text-emerald-700' },
          {
            label: 'Click rate',
            value: views ? `${((clicks / views) * 100).toFixed(1)}%` : '—',
            hint: 'across every banner',
          },
        ];
      }}
      fields={[
        { name: 'title', label: 'Banner name', type: 'text', required: true, full: true },
        { name: 'placement', label: 'Where it shows', type: 'select', options: PLACEMENTS },
        { name: 'starts', label: 'Starts', type: 'date' },
        { name: 'ends', label: 'Ends', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'title',
          header: 'Banner',
          render: (r) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-ink-900">{r.title}</p>
              <p className="truncate text-xs text-ink-500">{r.placement}</p>
            </div>
          ),
        },
        {
          key: 'starts',
          header: 'Runs',
          csv: (r) => `${r.starts} – ${r.ends}`,
          render: (r) => (
            <span className="whitespace-nowrap text-sm text-ink-600">
              {r.starts} → {r.ends}
            </span>
          ),
        },
        {
          key: 'impressions',
          header: 'Shown',
          render: (r) => (
            <span className="num text-ink-700">
              {r.impressions ? r.impressions.toLocaleString('en-IN') : '—'}
            </span>
          ),
        },
        {
          key: 'clicks',
          header: 'Clicks',
          render: (r) => (
            <span className="num font-bold text-ink-900">
              {r.clicks ? r.clicks.toLocaleString('en-IN') : '—'}
            </span>
          ),
        },
        {
          key: 'rate',
          header: 'Click rate',
          csv: (r) => `${rate(r).toFixed(1)}%`,
          render: (r) =>
            r.impressions ? (
              <div className="w-[92px]">
                <p className="num text-sm font-semibold text-ink-800">{rate(r).toFixed(1)}%</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.min(rate(r) * 10, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <span className="text-ink-400">—</span>
            ),
        },
        { key: 'status', header: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
      ]}
      rowActions={(row, app) => [
        {
          label: row.status === 'Live' ? 'Take down' : 'Put live',
          onClick: () =>
            app.update(
              'banners',
              row.id,
              { status: row.status === 'Live' ? 'Ended' : 'Live' },
              { message: `${row.title} ${row.status === 'Live' ? 'taken down' : 'is live'}` }
            ),
        },
      ]}
    />
  );
}
