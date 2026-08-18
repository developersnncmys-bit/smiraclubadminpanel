import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';

const CATEGORIES = ['Destination guide', 'Visa & documents', 'Family travel', 'Luxury', 'Adventure', 'Tips'];
const STATUS = ['Published', 'Draft', 'Scheduled'];
const tone = { Published: 'green', Draft: 'amber', Scheduled: 'sky' };

/** Travel writing that brings people to the website. */
export default function Blogs() {
  return (
    <RecordsPage
      collection="blogs"
      title="Blogs"
      subtitle="Travel writing that brings people to the website"
      addLabel="Write post"
      searchKeys={['title', 'author', 'category']}
      filters={[
        { key: 'status', label: 'Status', options: STATUS },
        { key: 'category', label: 'Category', options: CATEGORIES },
      ]}
      initial={{ category: 'Destination guide', status: 'Draft', published: '—' }}
      defaults={{ views: 0 }}
      stats={(rows) => {
        const live = rows.filter((r) => r.status === 'Published');
        return [
          { label: 'Posts', value: rows.length },
          { label: 'Published', value: live.length, tone: 'text-emerald-700' },
          { label: 'Total reads', value: rows.reduce((s, r) => s + Number(r.views || 0), 0).toLocaleString('en-IN') },
          {
            label: 'Best read',
            value: live.length ? Math.max(...live.map((r) => r.views)).toLocaleString('en-IN') : '—',
            hint: live.length ? live.sort((a, b) => b.views - a.views)[0].title.slice(0, 32) : '',
          },
        ];
      }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, full: true },
        { name: 'author', label: 'Author', type: 'text' },
        { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
        { name: 'published', label: 'Publish date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'title',
          header: 'Post',
          render: (r) => (
            <div className="max-w-[320px]">
              <p className="truncate font-bold text-ink-900">{r.title}</p>
              <p className="truncate text-xs text-ink-500">{r.category}</p>
            </div>
          ),
        },
        {
          key: 'author',
          header: 'Author',
          render: (r) => (
            <div className="flex items-center gap-2.5">
              <Avatar name={r.author} size="sm" />
              <span className="truncate text-sm font-semibold text-ink-700">{r.author}</span>
            </div>
          ),
        },
        {
          key: 'published',
          header: 'Published',
          render: (r) => <span className="whitespace-nowrap text-ink-600">{r.published}</span>,
        },
        {
          key: 'views',
          header: 'Reads',
          render: (r) => (
            <span className="num font-bold text-ink-900">
              {r.views ? r.views.toLocaleString('en-IN') : '—'}
            </span>
          ),
        },
        { key: 'status', header: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
      ]}
      rowActions={(row, app) => [
        {
          label: row.status === 'Published' ? 'Move to draft' : 'Publish now',
          onClick: () =>
            app.update(
              'blogs',
              row.id,
              { status: row.status === 'Published' ? 'Draft' : 'Published' },
              { message: `${row.title} ${row.status === 'Published' ? 'moved to draft' : 'published'}` }
            ),
        },
      ]}
    />
  );
}
