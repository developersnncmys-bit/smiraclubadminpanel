import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { ArrowRight } from 'lucide-react';

const STATUS = ['On', 'Off'];

/** Rules that do the routine chasing so nobody has to remember it. */
export default function Automation() {
  return (
    <RecordsPage
      collection="automations"
      title="Automation"
      subtitle="Rules that do the routine work for you"
      addLabel="Add rule"
      searchKeys={['name', 'trigger', 'action']}
      filters={[{ key: 'status', label: 'Status', options: STATUS }]}
      initial={{ status: 'On' }}
      defaults={{ runs: 0, lastRun: 'never' }}
      stats={(rows) => [
        { label: 'Rules', value: rows.length },
        {
          label: 'Running',
          value: rows.filter((r) => r.status === 'On').length,
          tone: 'text-emerald-700',
        },
        { label: 'Paused', value: rows.filter((r) => r.status === 'Off').length },
        {
          label: 'Times run',
          value: rows.reduce((s, r) => s + Number(r.runs || 0), 0),
          hint: 'since they were switched on',
        },
      ]}
      fields={[
        { name: 'name', label: 'Rule name', type: 'text', required: true, full: true },
        { name: 'trigger', label: 'When this happens', type: 'text', required: true, full: true },
        { name: 'action', label: 'Do this', type: 'text', required: true, full: true },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Rule',
          render: (r) => <p className="font-bold text-ink-900">{r.name}</p>,
        },
        {
          key: 'trigger',
          header: 'When → then',
          render: (r) => (
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-surface-soft px-2.5 py-1 text-ink-700">{r.trigger}</span>
              <ArrowRight size={13} className="shrink-0 text-ink-400" />
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-brand-800">{r.action}</span>
            </div>
          ),
        },
        {
          key: 'runs',
          header: 'Times run',
          render: (r) => <span className="num font-semibold text-ink-800">{r.runs}</span>,
        },
        {
          key: 'lastRun',
          header: 'Last run',
          render: (r) => <span className="whitespace-nowrap text-ink-600">{r.lastRun}</span>,
        },
        {
          key: 'status',
          header: 'Status',
          render: (r) => (
            <Badge tone={r.status === 'On' ? 'green' : 'slate'} dot>
              {r.status === 'On' ? 'Running' : 'Paused'}
            </Badge>
          ),
        },
      ]}
      rowActions={(row, app) => [
        {
          label: row.status === 'On' ? 'Turn off' : 'Turn on',
          onClick: () =>
            app.update(
              'automations',
              row.id,
              { status: row.status === 'On' ? 'Off' : 'On' },
              { message: `${row.name} turned ${row.status === 'On' ? 'off' : 'on'}` }
            ),
        },
      ]}
    />
  );
}
