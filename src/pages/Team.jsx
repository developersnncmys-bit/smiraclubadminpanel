import { useState } from 'react';
import { UserPlus, Mail, Phone, Pencil, Trash2, ShieldCheck, Send } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { inr, shortInr } from '../data/mockData.js';

const ROLES = [
  'Owner',
  'Senior Travel Consultant',
  'Travel Consultant',
  'Visa & Documentation',
  'Accounts',
];
const barColors = ['#14a58c', '#0ea5e9', '#7c5cff'];

export default function Team() {
  const { team, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const performance = team
    .filter((t) => t.bookings > 0)
    .map((t) => ({ name: t.name.split(' ')[0], enquiries: t.enquiries, bookings: t.bookings, revenue: t.revenue }));

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ROLES },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Invited', 'Disabled'] },
  ];

  const save = (values) => {
    if (editing) update('team', editing.id, values);
    else create('team', { ...values, enquiries: 0, bookings: 0, revenue: 0 });
  };

  return (
    <>
      <PageHeader title="Team" subtitle="Consultants, desks and their contribution">
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

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card title="Revenue by consultant" subtitle="Booked value this quarter" className="xl:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6d7c93', fontWeight: 600 }} dy={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tick={{ fontSize: 12, fill: '#96a2b4' }}
                  tickFormatter={(v) => shortInr(v)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(20,165,140,0.06)' }}
                  formatter={(v) => inr(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(11,21,36,0.06)',
                    boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="revenue" radius={[10, 10, 4, 4]} barSize={54}>
                  {performance.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Conversion leaderboard" subtitle="Enquiries turned into bookings">
          <ul className="space-y-4">
            {performance
              .map((c) => ({ ...c, rate: c.enquiries ? Math.round((c.bookings / c.enquiries) * 100) : 0 }))
              .sort((a, b) => b.rate - a.rate)
              .map((c, i) => (
                <li key={c.name}>
                  <div className="mb-1.5 flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-xs font-extrabold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-bold text-ink-900">{c.name}</span>
                    <span className="text-sm text-ink-500">
                      {c.bookings}/{c.enquiries}
                    </span>
                    <span className="w-10 text-right text-sm font-bold text-brand-700">{c.rate}%</span>
                  </div>
                  <div className="ml-10 h-2 overflow-hidden rounded-full bg-surface-soft">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-ocean"
                      style={{ width: `${Math.min(c.rate * 2, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {team.map((m) => (
          <Card key={m.id} className="card-hover">
            <div className="flex items-start gap-4">
              <Avatar name={m.name} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-ink-900">{m.name}</p>
                    <p className="truncate text-xs font-semibold text-brand-700">{m.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={m.status === 'Active' ? 'green' : m.status === 'Invited' ? 'amber' : 'slate'} dot>
                      {m.status}
                    </Badge>
                    <RowMenu
                      items={[
                        { label: 'Edit member', icon: Pencil, onClick: () => { setEditing(m); setFormOpen(true); } },
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
                </div>

                <div className="mt-3 space-y-1 text-xs text-ink-500">
                  <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 truncate hover:text-brand-700">
                    <Mail size={12} /> {m.email}
                  </a>
                  <a
                    href={`tel:${String(m.phone).replace(/[^\d]/g, '')}`}
                    className="flex items-center gap-1.5 hover:text-brand-700"
                  >
                    <Phone size={12} /> {m.phone}
                  </a>
                </div>
              </div>
            </div>

            {m.bookings > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-900/5 pt-4 text-center">
                <div>
                  <p className="font-display text-lg font-extrabold">{m.enquiries}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Enquiries</p>
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold">{m.bookings}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Bookings</p>
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold text-brand-700">{shortInr(m.revenue)}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Revenue</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

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
