import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';

/** How each website page reads to search engines. */
export default function Seo() {
  const scoreTone = (n) => (n >= 85 ? 'green' : n >= 65 ? 'amber' : 'rose');

  return (
    <RecordsPage
      collection="seoPages"
      title="SEO"
      subtitle="How each page of the website reads to search engines"
      addLabel="Add page"
      searchKeys={['page', 'title', 'keyword']}
      filters={[{ key: 'indexed', label: 'Indexed', options: ['true', 'false'] }]}
      initial={{ score: 50, position: 0, indexed: false }}
      stats={(rows) => {
        const ranked = rows.filter((r) => r.position > 0);
        const top10 = ranked.filter((r) => r.position <= 10);
        return [
          { label: 'Pages tracked', value: rows.length },
          {
            label: 'On page one',
            value: top10.length,
            tone: 'text-emerald-700',
            hint: 'position 10 or better',
          },
          {
            label: 'Average score',
            value: rows.length ? Math.round(rows.reduce((s, r) => s + Number(r.score || 0), 0) / rows.length) : 0,
          },
          {
            label: 'Not indexed',
            value: rows.filter((r) => !r.indexed).length,
            tone: 'text-orange-600',
            hint: 'search engines cannot see them',
          },
        ];
      }}
      fields={[
        { name: 'page', label: 'Page path', type: 'text', required: true, placeholder: '/packages/bali' },
        { name: 'title', label: 'Search title', type: 'text', required: true, full: true },
        { name: 'description', label: 'Search description', type: 'textarea', full: true },
        { name: 'keyword', label: 'Target keyword', type: 'text' },
        { name: 'position', label: 'Current position', type: 'number', help: '0 if it does not rank yet' },
        { name: 'score', label: 'Score out of 100', type: 'number' },
      ]}
      columns={[
        {
          key: 'page',
          header: 'Page',
          render: (r) => (
            <div className="max-w-[280px]">
              <p className="truncate font-mono text-xs font-bold text-brand-700">{r.page}</p>
              <p className="truncate text-sm font-semibold text-ink-800">{r.title}</p>
            </div>
          ),
        },
        {
          key: 'description',
          header: 'Description',
          render: (r) => (
            <p className="max-w-[280px] truncate text-sm text-ink-600" title={r.description}>
              {r.description || <span className="text-rose-600">Missing</span>}
            </p>
          ),
        },
        {
          key: 'keyword',
          header: 'Keyword',
          render: (r) =>
            r.keyword ? (
              <Badge tone="teal">{r.keyword}</Badge>
            ) : (
              <span className="text-sm font-semibold text-rose-600">Not set</span>
            ),
        },
        {
          key: 'position',
          header: 'Position',
          render: (r) =>
            r.position > 0 ? (
              <span
                className={`num font-bold ${
                  r.position <= 10 ? 'text-emerald-700' : r.position <= 20 ? 'text-amber-700' : 'text-ink-700'
                }`}
              >
                #{r.position}
              </span>
            ) : (
              <span className="text-ink-400">Unranked</span>
            ),
        },
        {
          key: 'score',
          header: 'Score',
          render: (r) => (
            <div className="w-[92px]">
              <Badge tone={scoreTone(r.score)}>{r.score}/100</Badge>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-soft">
                <div
                  className={`h-full rounded-full ${
                    r.score >= 85 ? 'bg-emerald-500' : r.score >= 65 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${r.score}%` }}
                />
              </div>
            </div>
          ),
        },
        {
          key: 'indexed',
          header: 'Indexed',
          csv: (r) => (r.indexed ? 'yes' : 'no'),
          render: (r) => (
            <Badge tone={r.indexed ? 'green' : 'rose'} dot>
              {r.indexed ? 'Yes' : 'No'}
            </Badge>
          ),
        },
      ]}
      rowActions={(row, app) => [
        {
          label: row.indexed ? 'Hide from search' : 'Allow indexing',
          onClick: () =>
            app.update(
              'seoPages',
              row.id,
              { indexed: !row.indexed },
              { message: `${row.page} ${row.indexed ? 'hidden from search' : 'open to search engines'}` }
            ),
        },
      ]}
    />
  );
}
