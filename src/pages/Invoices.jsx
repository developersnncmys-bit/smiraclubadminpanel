import { useState } from 'react';
import {
  Plus,
  ReceiptIndianRupee,
  Wallet,
  AlertCircle,
  Download,
  Send,
  Pencil,
  Trash2,
  BadgeIndianRupee,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { invoiceTone, inr, shortInr } from '../data/mockData.js';
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

  const columns = [
    { key: 'id', header: 'Invoice', render: (r) => <span className="font-bold text-brand-700">{r.id}</span> },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-bold text-ink-900">{r.customer}</p>
          <p className="text-xs text-ink-500">{r.booking}</p>
        </div>
      ),
    },
    { key: 'issued', header: 'Issued' },
    {
      key: 'due',
      header: 'Due date',
      render: (r) => <span className={r.status === 'Overdue' ? 'font-semibold text-rose-600' : ''}>{r.due}</span>,
    },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-bold text-ink-900">{inr(r.amount)}</span> },
    {
      key: 'balance',
      header: 'Balance',
      csv: (r) => r.amount - r.paid,
      render: (r) => {
        const bal = r.amount - r.paid;
        return (
          <span className={`font-bold ${bal > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
            {bal > 0 ? inr(bal) : '—'}
          </span>
        );
      },
    },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={invoiceTone[r.status]} dot>{r.status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => downloadInvoice(r)}
            title="Download"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => toast(`${r.id} emailed to ${r.customer}`)}
            title="Send"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-sky-400 hover:text-sky-600"
          >
            <Send size={14} />
          </button>
          <RowMenu
            items={[
              { label: 'Record payment', icon: BadgeIndianRupee, onClick: () => setPayFor(r) },
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
      <PageHeader title="Invoices" subtitle="Billing across all confirmed bookings">
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

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={ReceiptIndianRupee} label="Total billed" value={shortInr(billed)} skin="brand" />
        <StatCard icon={Wallet} label="Collected" value={shortInr(collected)} />
        <StatCard icon={AlertCircle} label="Outstanding" value={shortInr(outstanding)} />
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
