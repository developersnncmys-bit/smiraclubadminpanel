import { useState } from 'react';
import { UserPlus, Mail, Phone, Pencil, Trash2, ShieldCheck, Send } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr } from '../data/mockData.js';

const ROLES = [
  'Owner',
  'Senior Travel Consultant',
  'Travel Consultant',
  'Visa & Documentation',
  'Accounts',
];
const STATUSES = ['Active', 'Invited', 'Disabled'];
const statusTone = { Active: 'green', Invited: 'amber', Disabled: 'slate' };
const digits = (phone) => String(phone).replace(/[^\d]/g, '');
const rate = (m) => (m.enquiries ? Math.round((m.bookings / m.enquiries) * 100) : null);

/**
 * One plain list of who is on the desk and what they have brought in — no
 * charts. The numbers people asked for are columns they can sort through.
 */
export default function Team() {
  const { team, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ROLES },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES },
  ];

  const save = (values) => {
    if (editing) update('team', editing.id, values);
    else create('team', { ...values, enquiries: 0, bookings: 0, revenue: 0 });
  };

  const columns = [
    {
      key: 'name',
      header: 'Member',
      render: (m) => (
        <div className="flex items-center gap-3">
          <Avatar name={m.name} />
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900">{m.name}</p>
            <p className="truncate text-xs text-ink-500">{m.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact',
      render: (m) => (
        <div className="min-w-0">
          <a href={`mailto:${m.email}`} className="block truncate text-ink-700 hover:text-brand-700">
            {m.email}
          </a>
          <a href={`tel:${digits(m.phone)}`} className="block text-xs text-ink-500 hover:text-brand-700">
            {m.phone}
          </a>
        </div>
      ),
    },
    {
      key: 'enquiries',
      header: 'Enquiries',
      render: (m) => <span className="num font-semibold text-ink-800">{m.enquiries || '—'}</span>,
    },
    {
      key: 'bookings',
      header: 'Bookings',
      render: (m) => <span className="num font-semibold text-ink-800">{m.bookings || '—'}</span>,
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (m) => (
        <span className="num font-bold text-brand-700">{m.revenue ? inr(m.revenue) : '—'}</span>
      ),
    },
    {
      key: 'conversion',
      header: 'Conversion',
      csv: (m) => (rate(m) === null ? '' : `${rate(m)}%`),
      render: (m) =>
        rate(m) === null ? (
          <span className="text-ink-400">—</span>
        ) : (
          <span className="num font-bold text-ink-900">{rate(m)}%</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => (
        <Badge tone={statusTone[m.status]} dot>
          {m.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (m) => (
        <div className="flex justify-end">
          <RowMenu
            items={[
              {
                label: 'Edit member',
                icon: Pencil,
                onClick: () => {
                  setEditing(m);
                  setFormOpen(true);
                },
              },
              { label: 'Email', icon: Mail, onClick: () => { window.location.href = `mailto:${m.email}`; } },
              { label: 'Call', icon: Phone, onClick: () => { window.location.href = `tel:${digits(m.phone)}`; } },
              ...(m.status === 'Invited'
                ? [{ label: 'Resend invite', icon: Send, onClick: () => toast(`Invite resent to ${m.email}`) }]
                : []),
              {
                label: m.status === 'Disabled' ? 'Enable access' : 'Disable access',
                icon: ShieldCheck,
                onClick: () =>
                  update('team', m.id, { status: m.status === 'Disabled' ? 'Active' : 'Disabled' }),
              },
              { label: 'Remove', icon: Trash2, danger: true, onClick: () => setConfirm(m) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Team" subtitle={`${team.length} people on the desk`}>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <UserPlus size={16} /> Invite member
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={team}
        selectable={false}
        searchKeys={['name', 'email', 'phone', 'role']}
        searchPlaceholder="Search the team…"
        filters={[
          { key: 'role', label: 'Role', options: ROLES },
          { key: 'status', label: 'Status', options: STATUSES },
        ]}
        exportName="smira-club-team"
        emptyLabel="No team members match this view"
        onRowClick={(m) => {
          setEditing(m);
          setFormOpen(true);
        }}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.name}` : 'Invite team member'}
        subtitle={editing ? editing.id : 'They receive an email invite to join the workspace'}
        fields={fields}
        initial={editing || { role: 'Travel Consultant', status: 'Invited' }}
        submitLabel={editing ? 'Save changes' : 'Send invite'}
        size="md"
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('team', confirm.id)}
        title="Remove team member?"
        message={`${confirm?.name} loses access to this workspace immediately. Their records stay assigned.`}
        confirmLabel="Remove"
      />
    </>
  );
}
