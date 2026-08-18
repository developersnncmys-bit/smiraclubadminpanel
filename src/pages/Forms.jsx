import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';

const ROUTES = ['Sales & leads', 'Membership', 'Campaigns', 'Support'];
const STATUS = ['Live', 'Draft', 'Closed'];
const tone = { Live: 'green', Draft: 'amber', Closed: 'slate' };

/** Forms on the website and where their submissions land. */
export default function Forms() {
  return (
    <RecordsPage
      collection="forms"
      title="Form"
      subtitle="Forms on the website and where each submission lands"
      addLabel="Add form"
      searchKeys={['name', 'placement', 'routesTo']}
      filters={[
        { key: 'routesTo', label: 'Routes to', options: ROUTES },
        { key: 'status', label: 'Status', options: STATUS },
      ]}
      initial={{ routesTo: 'Sales & leads', status: 'Draft', fields: 3 }}
      defaults={{ submissions: 0, spam: 0 }}
      stats={(rows) => [
        { label: 'Forms', value: rows.length, hint: `${rows.filter((r) => r.status === 'Live').length} live` },
        { label: 'Submissions', value: rows.reduce((s, r) => s + Number(r.submissions || 0), 0) },
        {
          label: 'Spam filtered',
          value: rows.reduce((s, r) => s + Number(r.spam || 0), 0),
          hint: 'never reached the desk',
        },
        {
          label: 'Feeding sales',
          value: rows.filter((r) => r.routesTo === 'Sales & leads').length,
          tone: 'text-emerald-700',
        },
      ]}
      fields={[
        { name: 'name', label: 'Form name', type: 'text', required: true },
        { name: 'placement', label: 'Where it appears', type: 'text', full: true },
        { name: 'fields', label: 'Number of fields', type: 'number' },
        { name: 'routesTo', label: 'Submissions go to', type: 'select', options: ROUTES },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Form',
          render: (r) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-ink-900">{r.name}</p>
              <p className="truncate text-xs text-ink-500">{r.placement}</p>
            </div>
          ),
        },
        {
          key: 'fields',
          header: 'Fields',
          render: (r) => <span className="num font-semibold text-ink-800">{r.fields}</span>,
        },
        {
          key: 'submissions',
          header: 'Submissions',
          render: (r) => <span className="num font-bold text-ink-900">{r.submissions}</span>,
        },
        {
          key: 'spam',
          header: 'Spam blocked',
          render: (r) => <span className="num text-ink-600">{r.spam || '—'}</span>,
        },
        { key: 'routesTo', header: 'Goes to', render: (r) => <Badge tone="teal">{r.routesTo}</Badge> },
        { key: 'status', header: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
      ]}
      rowActions={(row, app) => [
        {
          label: row.status === 'Live' ? 'Close form' : 'Publish form',
          onClick: () =>
            app.update(
              'forms',
              row.id,
              { status: row.status === 'Live' ? 'Closed' : 'Live' },
              { message: `${row.name} ${row.status === 'Live' ? 'closed' : 'is live'}` }
            ),
        },
      ]}
    />
  );
}
