import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { inr } from '../data/mockData.js';

const STATUS = ['Enquiry', 'Quoted', 'Booked', 'Lost'];
const KINDS = ['Travel credit', 'Gift voucher', 'Cash back'];
const tone = { Enquiry: 'sky', Quoted: 'violet', Booked: 'green', Lost: 'rose' };

/** Who referred whom, and what they have earned for it. */
export default function Rewards() {
  return (
    <RecordsPage
      collection="referrals"
      title="Reward & Refer"
      subtitle="Travellers who bring their friends, and the rewards they have earned"
      addLabel="Log referral"
      searchKeys={['referrer', 'referred']}
      filters={[
        { key: 'status', label: 'Status', options: STATUS },
        { key: 'rewardKind', label: 'Reward', options: KINDS },
      ]}
      initial={{ status: 'Enquiry', rewardKind: 'Travel credit', reward: 5000, paid: false }}
      stats={(rows) => {
        const booked = rows.filter((r) => r.status === 'Booked');
        return [
          { label: 'Referrals', value: rows.length },
          {
            label: 'Turned into trips',
            value: booked.length,
            hint: rows.length ? `${Math.round((booked.length / rows.length) * 100)}% of referrals` : '',
            tone: 'text-emerald-700',
          },
          { label: 'Rewards paid', value: inr(rows.filter((r) => r.paid).reduce((s, r) => s + Number(r.reward || 0), 0)) },
          {
            label: 'Rewards owed',
            value: inr(rows.filter((r) => !r.paid && r.status === 'Booked').reduce((s, r) => s + Number(r.reward || 0), 0)),
            tone: 'text-orange-600',
            hint: 'earned but not given',
          },
        ];
      }}
      fields={[
        { name: 'referrer', label: 'Referred by', type: 'text', required: true },
        { name: 'referred', label: 'New traveller', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS },
        { name: 'rewardKind', label: 'Reward type', type: 'select', options: KINDS },
        { name: 'reward', label: 'Reward value (₹)', type: 'number' },
      ]}
      columns={[
        {
          key: 'referrer',
          header: 'Referred by',
          render: (r) => (
            <div className="flex items-center gap-3">
              <Avatar name={r.referrer} size="sm" />
              <p className="truncate font-bold text-ink-900">{r.referrer}</p>
            </div>
          ),
        },
        {
          key: 'referred',
          header: 'New traveller',
          render: (r) => (
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink-800">{r.referred}</p>
              <p className="truncate text-xs text-ink-500">{r.date}</p>
            </div>
          ),
        },
        { key: 'status', header: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
        { key: 'rewardKind', header: 'Reward', render: (r) => <span className="text-ink-700">{r.rewardKind}</span> },
        {
          key: 'reward',
          header: 'Value',
          render: (r) => <span className="num font-bold text-ink-900">{r.reward ? inr(r.reward) : '—'}</span>,
        },
        {
          key: 'paid',
          header: 'Given',
          csv: (r) => (r.paid ? 'yes' : 'no'),
          render: (r) =>
            r.paid ? (
              <Badge tone="green" dot>
                Given
              </Badge>
            ) : r.status === 'Booked' ? (
              <Badge tone="amber" dot>
                Owed
              </Badge>
            ) : (
              <span className="text-ink-400">—</span>
            ),
        },
      ]}
      rowActions={(row, app) =>
        row.status === 'Booked' && !row.paid
          ? [
              {
                label: 'Mark reward given',
                onClick: () =>
                  app.update('referrals', row.id, { paid: true }, { message: `Reward given to ${row.referrer}` }),
              },
            ]
          : []
      }
    />
  );
}
