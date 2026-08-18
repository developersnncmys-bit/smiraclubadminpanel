import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';

const SCOPES = ['Create enquiries', 'Record payments', 'Read invoices', 'Send messages', 'Full access'];
const STATUS = ['Active', 'Revoked'];

/** Keys the systems around this one use to talk to it. */
export default function ApiKeys() {
  return (
    <RecordsPage
      collection="apiKeys"
      title="API"
      subtitle="Keys the website and other systems use to talk to this panel"
      addLabel="Create key"
      searchKeys={['name', 'scope']}
      filters={[
        { key: 'scope', label: 'Scope', options: SCOPES },
        { key: 'status', label: 'Status', options: STATUS },
      ]}
      initial={{ scope: 'Create enquiries', status: 'Active' }}
      defaults={{ key: 'sk_live_new••••••0000', calls: 0, created: 'today', lastUsed: 'never' }}
      stats={(rows) => [
        { label: 'Keys', value: rows.length },
        { label: 'Active', value: rows.filter((r) => r.status === 'Active').length, tone: 'text-emerald-700' },
        { label: 'Revoked', value: rows.filter((r) => r.status === 'Revoked').length },
        {
          label: 'Calls handled',
          value: rows.reduce((s, r) => s + Number(r.calls || 0), 0).toLocaleString('en-IN'),
        },
      ]}
      fields={[
        { name: 'name', label: 'What is it for', type: 'text', required: true, full: true },
        { name: 'scope', label: 'What it may do', type: 'select', options: SCOPES },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Key',
          render: (r) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-ink-900">{r.name}</p>
              <p className="truncate font-mono text-xs text-ink-500">{r.key}</p>
            </div>
          ),
        },
        { key: 'scope', header: 'May do', render: (r) => <Badge tone="teal">{r.scope}</Badge> },
        {
          key: 'created',
          header: 'Created',
          render: (r) => <span className="whitespace-nowrap text-ink-600">{r.created}</span>,
        },
        {
          key: 'lastUsed',
          header: 'Last used',
          render: (r) => <span className="whitespace-nowrap text-ink-600">{r.lastUsed}</span>,
        },
        {
          key: 'calls',
          header: 'Calls',
          render: (r) => (
            <span className="num font-semibold text-ink-800">
              {r.calls ? r.calls.toLocaleString('en-IN') : '—'}
            </span>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          render: (r) => (
            <Badge tone={r.status === 'Active' ? 'green' : 'rose'} dot>
              {r.status}
            </Badge>
          ),
        },
      ]}
      rowActions={(row, app) => [
        { label: 'Copy key', onClick: () => app.toast(`${row.name} key copied`, 'info') },
        {
          label: row.status === 'Active' ? 'Revoke key' : 'Reactivate key',
          onClick: () =>
            app.update(
              'apiKeys',
              row.id,
              { status: row.status === 'Active' ? 'Revoked' : 'Active' },
              { message: `${row.name} ${row.status === 'Active' ? 'revoked' : 'reactivated'}` }
            ),
        },
      ]}
    />
  );
}
