import { useState } from 'react';
import { Plus, CreditCard, Smartphone, Banknote, Building2, Undo2, Trash2, Download } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { paymentTone, inr } from '../data/mockData.js';
import { downloadText } from '../lib/csv.js';

const MODES = ['UPI', 'Card', 'Cash', 'Bank transfer'];
const modeIcon = { UPI: Smartphone, Card: CreditCard, Cash: Banknote, 'Bank transfer': Building2 };

export default function Payments() {
  const { payments, invoices, settings, recordPayment, update, remove, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fields = [
    { name: 'customer', label: 'Customer', type: 'text', required: true },
    { name: 'invoice', label: 'Against invoice', type: 'select', options: invoices.map((i) => i.id) },
    { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
    { name: 'mode', label: 'Mode', type: 'select', options: MODES },
    { name: 'date', label: 'Date', type: 'text', required: true, placeholder: '04 Aug 2026' },
  ];

  const receipt = (r) => {
    downloadText(
      `${r.id}.txt`,
      [
        settings.agency.name,
        '',
        `RECEIPT ${r.id}`,
        `Customer: ${r.customer}`,
        `Invoice : ${r.invoice}`,
        `Date    : ${r.date}`,
        `Mode    : ${r.mode}`,
        `Amount  : ${inr(r.amount)}`,
        `Status  : ${r.status}`,
      ].join('\n')
    );
    toast(`Receipt ${r.id} downloaded`);
  };

  const columns = [
    { key: 'id', header: 'Receipt', render: (r) => <span className="font-bold text-brand-700">{r.id}</span> },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-bold text-ink-900">{r.customer}</p>
          <p className="text-xs text-ink-500">{r.invoice}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Date' },
    {
      key: 'mode',
      header: 'Mode',
      render: (r) => {
        const Icon = modeIcon[r.mode] || CreditCard;
        return (
          <span className="inline-flex items-center gap-2 font-semibold text-ink-700">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-soft text-ink-500">
              <Icon size={14} />
            </span>
            {r.mode}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => (
        <span className={`font-bold ${r.status === 'Refunded' ? 'text-rose-600' : 'text-emerald-600'}`}>
          {r.status === 'Refunded' ? '-' : '+'}
          {inr(r.amount)}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={paymentTone[r.status]} dot>{r.status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => receipt(r)}
            title="Download receipt"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
          >
            <Download size={14} />
          </button>
          <RowMenu
            items={[
              {
                label: r.status === 'Refunded' ? 'Mark successful' : 'Mark refunded',
                icon: Undo2,
                onClick: () =>
                  update('payments', r.id, { status: r.status === 'Refunded' ? 'Success' : 'Refunded' }),
              },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Payments" subtitle="Every receipt and refund recorded against invoices">
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Record payment
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={payments}
        searchKeys={['id', 'customer', 'invoice', 'mode']}
        searchPlaceholder="Search payments…"
        filters={[
          { key: 'mode', label: 'Mode', options: MODES },
          { key: 'status', label: 'Status', options: ['Success', 'Refunded'] },
        ]}
        exportName="smira-club-payments"
        emptyLabel="No payments match this view"
        bulkActions={[{ label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) }]}
      />

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => recordPayment({ ...values, status: 'Success' })}
        title="Record payment"
        subtitle="Applies the amount to the selected invoice"
        fields={fields}
        initial={{ mode: 'UPI', date: '04 Aug 2026' }}
        submitLabel="Record payment"
        size="md"
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('payments', confirm)}
        title="Delete payments?"
        message={`This removes ${confirm?.length || 0} payment record(s). Invoice balances are not recalculated.`}
      />
    </>
  );
}
