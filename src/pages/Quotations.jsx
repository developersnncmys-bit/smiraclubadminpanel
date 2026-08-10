import { useState } from 'react';
import { Plus, Send, Eye, Download, Pencil, Trash2, CheckCircle2, CalendarPlus, Check } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { quotationTone, inr } from '../data/mockData.js';
import { quotationPdf } from '../lib/pdf.js';

const STATUSES = ['Draft', 'Sent', 'Viewed', 'Accepted', 'Expired'];

export default function Quotations() {
  const { quotations, packages, team, owner, settings, create, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const rows = byOwner(quotations, owner);
  const consultants = team.filter((t) => t.bookings > 0).map((t) => t.name.split(' ')[0]);

  const fields = [
    { name: 'customer', label: 'Customer', type: 'text', required: true },
    { name: 'pkg', label: 'Package / itinerary', type: 'text', required: true },
    { name: 'pax', label: 'Travellers', type: 'number', required: true },
    { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
    { name: 'validTill', label: 'Valid till', type: 'text', placeholder: '31 Aug 2026' },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES },
    { name: 'owner', label: 'Owner', type: 'select', options: consultants },
  ];

  const save = (values) => {
    if (editing) update('quotations', editing.id, values);
    else create('quotations', values);
  };

  const sendQuote = (r) => {
    update('quotations', r.id, { status: 'Sent' }, { silent: true });
    toast(`${r.id} sent to ${r.customer}`);
  };

  const downloadQuote = (r) => {
    quotationPdf(r, settings);
    toast(`${r.id}.pdf downloaded`);
  };

  const convert = (r) => {
    const id = create('bookings', {
      customer: r.customer,
      pkg: r.pkg,
      destination: r.pkg,
      departure: r.validTill,
      nights: 0,
      pax: r.pax,
      amount: r.amount,
      paid: 0,
      status: 'Pending',
      owner: r.owner,
    });
    update('quotations', r.id, { status: 'Accepted' }, { silent: true });
    toast(`Converted to booking ${id}`);
  };

  const columns = [
    { key: 'id', header: 'Quote', render: (r) => <span className="font-bold text-brand-700">{r.id}</span> },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-bold text-ink-900">{r.customer}</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-500">
            {r.pkg}
            {r.source === 'Membership' && (
              <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-700">
                Auto
              </span>
            )}
          </p>
        </div>
      ),
    },
    { key: 'pax', header: 'Pax', render: (r) => <span className="font-semibold">{r.pax}</span> },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-bold text-ink-900">{inr(r.amount)}</span> },
    { key: 'validTill', header: 'Valid till' },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={quotationTone[r.status]} dot>{r.status}</Badge> },
    { key: 'owner', header: 'Owner' },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewing(r)}
            title="Preview"
            className="icon-btn"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => sendQuote(r)}
            title="Send"
            className="icon-btn hover:border-sky-300 hover:text-sky-600"
          >
            <Send size={14} />
          </button>
          <button
            onClick={() => downloadQuote(r)}
            title="Download PDF"
            className="icon-btn"
          >
            <Download size={14} />
          </button>
          <RowMenu
            items={[
              { label: 'Edit', icon: Pencil, onClick: () => { setEditing(r); setFormOpen(true); } },
              { label: 'Mark accepted', icon: CheckCircle2, onClick: () => update('quotations', r.id, { status: 'Accepted' }) },
              { label: 'Convert to booking', icon: CalendarPlus, onClick: () => convert(r) },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Quotations" subtitle="Proposals shared with prospective travellers">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> New quotation
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['id', 'customer', 'pkg']}
        searchPlaceholder="Search quotations…"
        filters={[
          { key: 'status', label: 'Status', options: STATUSES },
          { key: 'owner', label: 'Owner', options: consultants },
        ]}
        exportName="smira-club-quotations"
        emptyLabel="No quotations match this view"
        onRowClick={(r) => setViewing(r)}
        bulkActions={[
          { label: 'Mark sent', icon: Send, onClick: (ids) => ids.forEach((id) => update('quotations', id, { status: 'Sent' }, { silent: true })) },
          { label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) },
        ]}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.id}` : 'New quotation'}
        subtitle={editing ? editing.customer : 'Build a proposal for a customer'}
        fields={fields}
        initial={editing || { status: 'Draft', owner: consultants[0] }}
        submitLabel={editing ? 'Save changes' : 'Create quotation'}
      />

      {/* Preview */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={`Quotation ${viewing?.id || ''}`}
        subtitle={viewing?.customer}
        footer={
          <>
            <button className="btn-ghost" onClick={() => downloadQuote(viewing)}>
              <Download size={16} /> Download PDF
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                sendQuote(viewing);
                setViewing(null);
              }}
            >
              <Send size={16} /> Send to customer
            </button>
          </>
        }
      >
        {viewing && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-ocean p-5 text-white">
              <p className="text-sm font-semibold text-white/80">{settings.agency.name}</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{inr(viewing.amount)}</p>
              <p className="text-sm text-white/80">
                {viewing.pax} travellers · valid till {viewing.validTill}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['Customer', viewing.customer],
                ['Package', viewing.pkg],
                ['Status', viewing.status],
                ['Consultant', viewing.owner],
                ['Per person', inr(Math.round(viewing.amount / (viewing.pax || 1)))],
                ['GSTIN', settings.agency.gstin],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-ink-900/[0.07] bg-surface-soft/60 px-4 py-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{k}</dt>
                  <dd className="mt-0.5 text-sm font-bold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Membership quotes carry the plan features they were raised from */}
            {viewing.inclusions?.length > 0 && (
              <div className="rounded-xl border border-ink-900/[0.07] bg-white p-4">
                <p className="eyebrow mb-2">What's included</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {viewing.inclusions.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                      <Check size={15} className="mt-0.5 shrink-0 text-brand-600" strokeWidth={2.6} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('quotations', confirm)}
        title="Delete quotations?"
        message={`This removes ${confirm?.length || 0} quotation(s).`}
      />
    </>
  );
}
