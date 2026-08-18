import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { Check, X } from 'lucide-react';
import { useApp } from '../store/AppStore.jsx';

const AUDIENCE = ['Owner', 'Owner and accounts', 'Assigned consultant', 'Everyone'];
const STATUS = ['On', 'Off'];
const CHANNELS = [
  { key: 'inApp', label: 'In-app' },
  { key: 'email', label: 'Email' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

/** Which events tell the team, on which channel. */
export default function Notifications() {
  const { update, toast } = useApp();

  const toggle = (row, channel) => {
    update('notificationRules', row.id, { [channel]: !row[channel] }, { silent: true });
    toast(`${row.event} · ${channel} ${row[channel] ? 'off' : 'on'}`, 'info');
  };

  const channelCell = (row, key) => (
    <button
      onClick={() => toggle(row, key)}
      title={row[key] ? 'Turn off' : 'Turn on'}
      className={`grid h-7 w-7 place-items-center rounded-lg border transition ${
        row[key]
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-ink-900/15 text-ink-300 hover:border-ink-900/30'
      }`}
    >
      {row[key] ? <Check size={14} strokeWidth={3} /> : <X size={13} />}
    </button>
  );

  return (
    <RecordsPage
      collection="notificationRules"
      title="Notifications"
      subtitle="What the panel tells the team, and how it reaches them"
      addLabel="Add rule"
      searchKeys={['event', 'audience']}
      filters={[
        { key: 'audience', label: 'Goes to', options: AUDIENCE },
        { key: 'status', label: 'Status', options: STATUS },
      ]}
      initial={{ audience: 'Owner', status: 'On', inApp: true, email: false, whatsapp: false }}
      stats={(rows) => [
        { label: 'Rules', value: rows.length },
        { label: 'Switched on', value: rows.filter((r) => r.status === 'On').length, tone: 'text-emerald-700' },
        { label: 'Using WhatsApp', value: rows.filter((r) => r.whatsapp).length },
        { label: 'Using email', value: rows.filter((r) => r.email).length },
      ]}
      fields={[
        { name: 'event', label: 'When this happens', type: 'text', required: true, full: true },
        { name: 'audience', label: 'Tell', type: 'select', options: AUDIENCE },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
      ]}
      columns={[
        {
          key: 'event',
          header: 'Event',
          render: (r) => <p className="font-bold text-ink-900">{r.event}</p>,
        },
        { key: 'audience', header: 'Goes to', render: (r) => <Badge tone="teal">{r.audience}</Badge> },
        ...CHANNELS.map((c) => ({
          key: c.key,
          header: c.label,
          csv: (r) => (r[c.key] ? 'yes' : 'no'),
          render: (r) => channelCell(r, c.key),
        })),
        {
          key: 'status',
          header: 'Status',
          render: (r) => (
            <Badge tone={r.status === 'On' ? 'green' : 'slate'} dot>
              {r.status}
            </Badge>
          ),
        },
      ]}
      rowActions={(row, app) => [
        {
          label: row.status === 'On' ? 'Turn off' : 'Turn on',
          onClick: () =>
            app.update(
              'notificationRules',
              row.id,
              { status: row.status === 'On' ? 'Off' : 'On' },
              { message: `${row.event} turned ${row.status === 'On' ? 'off' : 'on'}` }
            ),
        },
      ]}
    />
  );
}
