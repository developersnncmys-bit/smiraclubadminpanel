import { useState } from 'react';
import {
  Plus,
  Megaphone,
  MousePointerClick,
  UserPlus,
  IndianRupee,
  Play,
  Pause,
  Copy,
  Trash2,
  Pencil,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import Card from '../components/ui/Card.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { campaignTone, inr } from '../data/mockData.js';

const CHANNELS = ['WhatsApp', 'Instagram', 'Email', 'Google Ads'];
const STATUSES = ['Draft', 'Running', 'Paused', 'Completed'];
const channelTone = { WhatsApp: 'green', Instagram: 'rose', Email: 'sky', 'Google Ads': 'violet' };

export default function Campaigns() {
  const { campaigns, create, update, remove, duplicate } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [channel, setChannel] = useState('All');

  const list = campaigns.filter((c) => channel === 'All' || c.channel === channel);
  const leads = campaigns.reduce((s, c) => s + c.leads, 0);
  const spend = campaigns.reduce((s, c) => s + c.spend, 0);
  const clicks = campaigns.reduce((s, c) => s + c.clicked, 0);

  const fields = [
    { name: 'name', label: 'Campaign name', type: 'text', required: true, full: true },
    { name: 'channel', label: 'Channel', type: 'select', options: CHANNELS },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES },
    { name: 'sent', label: 'Audience size', type: 'number', required: true },
    { name: 'opened', label: 'Opened', type: 'number' },
    { name: 'clicked', label: 'Clicked', type: 'number' },
    { name: 'leads', label: 'Leads generated', type: 'number' },
    { name: 'spend', label: 'Spend (₹)', type: 'number' },
  ];

  const save = (values) => {
    if (editing) update('campaigns', editing.id, values);
    else create('campaigns', values);
  };

  return (
    <>
      <PageHeader title="Campaigns" subtitle="Broadcasts and paid campaigns feeding the pipeline">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> New campaign
        </button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Megaphone}
          label="Active campaigns"
          value={campaigns.filter((c) => c.status === 'Running').length}
          skin="brand"
        />
        <StatCard icon={MousePointerClick} label="Clicks" value={clicks.toLocaleString('en-IN')} />
        <StatCard icon={UserPlus} label="Leads generated" value={leads} />
        <StatCard icon={IndianRupee} label="Cost per lead" value={leads ? inr(Math.round(spend / leads)) : '—'} />
      </div>

      <div className="card mb-6 flex flex-wrap items-center gap-2 p-4">
        <span className="mr-1 text-xs font-bold uppercase tracking-wide text-ink-500">Channel</span>
        {['All', ...CHANNELS].map((c) => (
          <button
            key={c}
            onClick={() => setChannel(c)}
            className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
              channel === c
                ? 'bg-ink-900 text-white'
                : 'border border-ink-900/10 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {list.map((c) => {
          const openRate = c.sent ? Math.round((c.opened / c.sent) * 100) : 0;
          const clickRate = c.sent ? Math.round((c.clicked / c.sent) * 100) : 0;
          return (
            <Card key={c.id} className="card-hover">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge tone={channelTone[c.channel]}>{c.channel}</Badge>
                    <Badge tone={campaignTone[c.status]} dot>
                      {c.status}
                    </Badge>
                  </div>
                  <h3 className="truncate text-base font-bold">{c.name}</h3>
                  <p className="text-xs text-ink-500">
                    {c.id} · spend {inr(c.spend)}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-right">
                    <p className="font-display text-2xl font-extrabold text-brand-700">{c.leads}</p>
                    <p className="text-xs font-semibold text-ink-500">leads</p>
                  </div>
                  <RowMenu
                    items={[
                      { label: 'Edit campaign', icon: Pencil, onClick: () => { setEditing(c); setFormOpen(true); } },
                      {
                        label: c.status === 'Running' ? 'Pause' : 'Resume',
                        icon: c.status === 'Running' ? Pause : Play,
                        onClick: () =>
                          update('campaigns', c.id, { status: c.status === 'Running' ? 'Paused' : 'Running' }),
                      },
                      { label: 'Duplicate', icon: Copy, onClick: () => duplicate('campaigns', c.id) },
                      { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm(c) },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Sent', value: c.sent.toLocaleString('en-IN') },
                  { label: 'Opened', value: `${openRate}%` },
                  { label: 'Clicked', value: `${clickRate}%` },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-surface-soft px-3 py-2.5">
                    <p className="font-display text-lg font-extrabold text-ink-900">{m.value}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs font-semibold text-ink-500">
                  <span>Engagement</span>
                  <span>{openRate}% opened</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-ocean"
                    style={{ width: `${openRate}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-ink-900/[0.07] pt-4">
                <button
                  className="btn-soft flex-1 py-2 text-xs"
                  onClick={() =>
                    update('campaigns', c.id, { status: c.status === 'Running' ? 'Paused' : 'Running' })
                  }
                >
                  {c.status === 'Running' ? <Pause size={14} /> : <Play size={14} />}
                  {c.status === 'Running' ? 'Pause' : 'Resume'}
                </button>
                <button className="btn-ghost flex-1 py-2 text-xs" onClick={() => duplicate('campaigns', c.id)}>
                  <Copy size={14} /> Duplicate
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="card p-16 text-center">
          <p className="text-sm font-semibold text-ink-600">No campaigns on this channel</p>
        </div>
      )}

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.name}` : 'New campaign'}
        subtitle={editing ? editing.id : 'Launch a broadcast or paid campaign'}
        fields={fields}
        initial={editing || { channel: 'WhatsApp', status: 'Draft', opened: 0, clicked: 0, leads: 0, spend: 0 }}
        submitLabel={editing ? 'Save changes' : 'Create campaign'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('campaigns', confirm.id)}
        title="Delete campaign?"
        message={`“${confirm?.name}” and its performance history will be removed.`}
      />
    </>
  );
}
