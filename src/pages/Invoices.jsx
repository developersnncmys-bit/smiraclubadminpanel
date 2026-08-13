import { useState } from 'react';
import {
  Plus,
  Download,
  Send,
  Pencil,
  Trash2,
  BadgeIndianRupee,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { invoiceTone, inr } from '../data/mockData.js';
import { downloadText } from '../lib/csv.js';

const STATUSES = ['Paid', 'Partial', 'Overdue', 'Draft'];
const MODES = ['UPI', 'Card', 'Cash', 'Bank transfer'];

export default function Invoices() {
  const { invoices, bookings, settings, create, update, remove, recordPayment, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [payFor, setPayFor] = useState(null);

  const billed = invoices.reduce((s, i) => s + i.amount, 0);
  const collected = invoices.reduce((s, i) => s + i.paid, 0);
  const outstanding = billed - collected;
  const collectedPct = billed ? Math.round((collected / billed) * 100) : 0;
  const openCount = invoices.filter((i) => i.amount - i.paid > 0).length;

  const fields = [
    { name: 'customer', label: 'Customer', type: 'text', required: true },
    { name: 'booking', label: 'Booking', type: 'select', options: bookings.map((b) => b.id) },
    { name: 'issued', label: 'Issue date', type: 'text', required: true, placeholder: '04 Aug 2026' },
    { name: 'due', label: 'Due date', type: 'text', required: true, placeholder: '18 Aug 2026' },
    { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
    { name: 'paid', label: 'Already paid (₹)', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES },
  ];

  const save = (values) => {
    if (editing) update('invoices', editing.id, values);
    else create('invoices', values);
  };

  const downloadInvoice = (r) => {
    const text = [
      settings.agency.name,
      settings.agency.address,
      `GSTIN: ${settings.agency.gstin}`,
      '',
      `INVOICE ${r.id}`,
      `Customer : ${r.customer}`,
      `Booking  : ${r.booking}`,
      `Issued   : ${r.issued}`,
      `Due      : ${r.due}`,
      `Amount   : ${inr(r.amount)}`,
      `Paid     : ${inr(r.paid)}`,
      `Balance  : ${inr(r.amount - r.paid)}`,
    ].join('\n');
    downloadText(`${r.id}.txt`, text);
    toast(`${r.id} downloaded`);
  };

  // Bill → received → balance, in that order, so a row reads like a sentence.
  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-bold text-ink-900">{r.customer}</p>
          <p className="truncate text-xs text-ink-500">
            {r.id} · {r.booking}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Bill amount',
      render: (r) => <span className="num font-bold text-ink-900">{inr(r.amount)}</span>,
    },
    {
      key: 'paid',
      header: 'Received',
      render: (r) => (
        <span className="num font-semibold text-emerald-700">{r.paid ? inr(r.paid) : '—'}</span>
      ),
    },
    {
      key: 'balance',
      header: 'Still to pay',
      csv: (r) => r.amount - r.paid,
      render: (r) => {
        const bal = r.amount - r.paid;
        return bal > 0 ? (
          <span className="num font-bold text-orange-600">{inr(bal)}</span>
        ) : (
          <span className="text-sm font-semibold text-emerald-700">Nothing</span>
        );
      },
    },
    {
      key: 'due',
      header: 'Due by',
      render: (r) => (
        <span className={`whitespace-nowrap ${r.status === 'Overdue' ? 'font-bold text-rose-600' : ''}`}>
          {r.due}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={invoiceTone[r.status]} dot>{r.status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          {/* The one thing this page is for, on the row itself */}
          {r.amount - r.paid > 0 && (
            <button onClick={() => setPayFor(r)} className="btn-primary btn-sm whitespace-nowrap">
              <BadgeIndianRupee size={13} /> Record payment
            </button>
          )}
          <button onClick={() => downloadInvoice(r)} title="Download" className="icon-btn">
            <Download size={14} />
          </button>
          <RowMenu
            items={[
              { label: 'Email to customer', icon: Send, onClick: () => toast(`${r.id} emailed to ${r.customer}`) },
              { label: 'Edit invoice', icon: Pencil, onClick: () => { setEditing(r); setFormOpen(true); } },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Invoices" subtitle="What you have billed, and what is still to come in">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Create invoice
        </button>
      </PageHeader>

      {/* The whole page in one sentence, then the same thing as a bar */}
      <div className="card mb-6 p-5">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { label: 'Billed to customers', value: billed, note: `${invoices.length} invoices`, tone: 'text-ink-900' },
            { label: 'Money received', value: collected, note: 'Paid in full or part', tone: 'text-emerald-700' },
            { label: 'Still to collect', value: outstanding, note: `${openCount} invoices open`, tone: 'text-orange-600' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-sm font-semibold text-ink-500">{s.label}</p>
              <p className={`mt-1 font-display text-2xl font-extrabold num ${s.tone}`}>{inr(s.value)}</p>
              <p className="mt-0.5 text-xs text-ink-400">{s.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-ink-900/[0.07] pt-4">
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-soft">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${collectedPct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-ink-600">
            You have received <b>{collectedPct}%</b> of everything you billed.
            {outstanding > 0 && ` ${inr(outstanding)} is still with customers.`}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={invoices}
        searchKeys={['id', 'customer', 'booking']}
        searchPlaceholder="Search invoices…"
        filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
        exportName="smira-club-invoices"
        emptyLabel="No invoices match this view"
        onRowClick={(r) => {
          setEditing(r);
          setFormOpen(true);
        }}
        bulkActions={[
          {
            label: 'Send reminder',
            icon: Send,
            onClick: (ids) => toast(`Reminder sent for ${ids.length} invoice(s)`),
          },
          { label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) },
        ]}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.id}` : 'Create invoice'}
        subtitle={editing ? editing.customer : 'Bill a customer for a booking'}
        fields={fields}
        initial={editing || { status: 'Draft', paid: 0 }}
        submitLabel={editing ? 'Save changes' : 'Create invoice'}
      />

      {/* Record a payment against this invoice */}
      <FormModal
        open={Boolean(payFor)}
        onClose={() => setPayFor(null)}
        onSubmit={(values) =>
          recordPayment({
            customer: payFor.customer,
            invoice: payFor.id,
            date: values.date || '04 Aug 2026',
            mode: values.mode,
            amount: values.amount,
            status: 'Success',
          })
        }
        title={`Record payment · ${payFor?.id || ''}`}
        subtitle={payFor ? `Balance ${inr(payFor.amount - payFor.paid)}` : ''}
        size="md"
        fields={[
          { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
          { name: 'mode', label: 'Mode', type: 'select', options: MODES },
          { name: 'date', label: 'Date', type: 'text', placeholder: '04 Aug 2026' },
        ]}
        initial={{ amount: payFor ? payFor.amount - payFor.paid : 0, mode: 'UPI', date: '04 Aug 2026' }}
        submitLabel="Record payment"
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('invoices', confirm)}
        title="Delete invoices?"
        message={`This removes ${confirm?.length || 0} invoice(s) and their billing history.`}
      />
    </>
  );
}
