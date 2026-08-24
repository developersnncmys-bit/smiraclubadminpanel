import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Plus,
  Upload,
  Pencil,
  Trash2,
  UserCheck,
  Tag,
  Crown,
  LayoutGrid,
  Rows3,
  X,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import LeadDetails from '../components/sales/LeadDetails.jsx';
import SalesOverview from '../components/sales/SalesOverview.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { statusTone, enquiryStatuses, inr } from '../data/mockData.js';
import { downloadCsv } from '../lib/csv.js';
import { findMembership, membershipStanding } from '../lib/membership.js';

const SOURCES = ['Instagram', 'Website', 'Google Ads', 'Referral', 'Walk-in', 'WhatsApp'];
const LABELS = ['Honeymoon', 'Family', 'Luxury', 'Group', 'Adventure', 'Beach', 'Couple', 'Shopping'];

const digits = (phone) => String(phone).replace(/[^\d]/g, '');

export default function Enquiries() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const {
    enquiries,
    bookings,
    team,
    memberSignups,
    memberships,
    owner,
    create,
    update,
    updateMany,
    remove,
    toast,
  } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [assignFor, setAssignFor] = useState(null); // ids awaiting an owner
  const [statusFor, setStatusFor] = useState(null);
  const [viewing, setViewing] = useState(null); // the lead panel
  const [view, setView] = useState('leads'); // 'leads' | 'overview'
  const [stage, setStage] = useState(null); // funnel stage the list is pinned to

  // A ?new=1 deep link opens the create form straight away.
  useEffect(() => {
    if (params.get('new')) {
      setEditing(null);
      setFormOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const rows = byOwner(enquiries, owner);

  /** The plan this lead already holds, if any, and how long it has left. */
  const planOf = (lead) => {
    const found = findMembership(lead, memberSignups, memberships);
    return found ? { ...found, standing: membershipStanding(found.signup) } : null;
  };
  const listRows = stage ? rows.filter((e) => e.status === stage) : rows;

  // The funnel hands the list a stage; the list says so and can drop it.
  const openStage = (status) => {
    setStage(status);
    setView('leads');
  };

  const quickActions = {
    add: () => { setEditing(null); setFormOpen(true); },
    importLeads: () => setImportOpen(true),
    assign: () => {
      const ids = rows.filter((e) => e.owner === 'Unassigned').map((e) => e.id);
      if (!ids.length) return toast('Every lead already has an owner', 'info');
      setAssignFor(ids);
    },
    broadcast: () => toast('WhatsApp blast goes out with the messaging work', 'info'),
    showList: () => { setStage(null); setView('leads'); },
    exportLeads: () =>
      downloadCsv('smira-club-enquiries', rows, [
        { key: 'id', header: 'Enquiry' },
        { key: 'name', header: 'Client' },
        { key: 'phone', header: 'Phone' },
        { key: 'destination', header: 'Destination' },
        { key: 'pax', header: 'Travellers' },
        { key: 'budget', header: 'Budget' },
        { key: 'status', header: 'Status' },
        { key: 'source', header: 'Source' },
        { key: 'owner', header: 'Owner' },
      ]),
  };

  const owners = ['Unassigned', ...team.filter((t) => t.bookings > 0).map((t) => t.name.split(' ')[0])];

  const fields = [
    { name: 'name', label: 'Client name', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+91 ' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'pax', label: 'Travellers', type: 'number', required: true },
    { name: 'travelDate', label: 'Travel date', type: 'text', placeholder: '18 Sep 2026' },
    { name: 'budget', label: 'Budget (₹)', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: enquiryStatuses },
    { name: 'source', label: 'Source', type: 'select', options: SOURCES },
    { name: 'label', label: 'Label', type: 'select', options: LABELS },
    { name: 'owner', label: 'Assign to', type: 'select', options: owners },
  ];

  const saveEnquiry = (values) => {
    if (editing) update('enquiries', editing.id, values);
    else create('enquiries', { ...values, created: '04 Aug 2026' });
  };

  const makeQuote = (row) => {
    const id = create('quotations', {
      customer: row.name,
      pkg: `${row.destination} custom itinerary`,
      pax: row.pax,
      amount: row.budget,
      validTill: '31 Aug 2026',
      status: 'Draft',
      owner: row.owner === 'Unassigned' ? 'Sneha' : row.owner,
    });
    update('enquiries', row.id, { status: 'Quoted' }, { silent: true });
    toast(`Quotation ${id} drafted for ${row.name}`);
    navigate('/quotations');
  };

  const columns = [
    {
      key: 'name',
      header: 'Client',
      csv: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900">{r.name}</p>
            <p className="truncate text-xs text-ink-500">{r.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={statusTone[r.status]} dot>{r.status}</Badge>,
    },
    {
      key: 'destination',
      header: 'Destination',
      render: (r) => (
        <div>
          <p className="font-semibold text-ink-800">{r.destination}</p>
          <p className="text-xs text-ink-500">
            {r.pax} pax · {r.travelDate}
          </p>
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (r) => <span className="font-bold text-ink-900">{inr(r.budget)}</span>,
    },
    { key: 'source', header: 'Source', render: (r) => <span className="text-ink-600">{r.source}</span> },
    {
      key: 'membership',
      header: 'Membership',
      csv: (r) => {
        const m = planOf(r);
        return m ? `${m.signup.plan} till ${m.signup.expiresOn || '—'}` : 'Not a member';
      },
      render: (r) => {
        const m = planOf(r);
        if (!m) return <span className="text-sm text-ink-400">Not a member</span>;
        const tone = m.standing.tone;
        return (
          <div className="min-w-[150px]">
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
              <Crown size={12} className="shrink-0 text-brand-600" />
              {m.signup.plan}
            </p>
            <p
              className={`text-xs font-semibold ${
                tone === 'rose' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : 'text-ink-500'
              }`}
            >
              {m.signup.expiresOn ? `Till ${m.signup.expiresOn} · ${m.standing.headline}` : m.standing.headline}
            </p>
          </div>
        );
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (r) =>
        r.owner === 'Unassigned' ? (
          <button
            onClick={() => setAssignFor([r.id])}
            className="text-xs font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700"
          >
            Unassigned
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar name={r.owner} size="sm" />
            <span className="font-semibold text-ink-700">{r.owner}</span>
          </div>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <a
            href={`tel:${digits(r.phone)}`}
            title="Call"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-emerald-500 hover:text-emerald-600"
          >
            <Phone size={14} strokeWidth={2.3} />
          </a>
          <a
            href={`https://wa.me/${digits(r.phone)}?text=${encodeURIComponent(
              `Hi ${r.name}, thanks for your ${r.destination} enquiry with Smira Club!`
            )}`}
            target="_blank"
            rel="noreferrer"
            title="WhatsApp"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-emerald-500 hover:text-emerald-600"
          >
            <MessageCircle size={14} strokeWidth={2.3} />
          </a>
          <a
            href={`mailto:${r.email}?subject=${encodeURIComponent(`Your ${r.destination} trip`)}`}
            title="Email"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-sky-500 hover:text-sky-600"
          >
            <Mail size={14} strokeWidth={2.3} />
          </a>
          <button
            onClick={() => makeQuote(r)}
            title="Create quotation"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-violet-500 hover:text-violet-600"
          >
            <FileText size={14} strokeWidth={2.3} />
          </button>
          <RowMenu
            items={[
              { label: 'Edit', icon: Pencil, onClick: () => { setEditing(r); setFormOpen(true); } },
              { label: 'Assign owner', icon: UserCheck, onClick: () => setAssignFor([r.id]) },
              { label: 'Change status', icon: Tag, onClick: () => setStatusFor([r.id]) },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
            ]}
          />
        </div>
      ),
    },
  ];


  return (
    <>
      <PageHeader
        title="Sales & Leads"
        subtitle={
          view === 'leads'
            ? `${rows.length} enquiries in your pipeline`
            : "Every sales block on one board"
        }
      >
        <button className="btn-ghost" onClick={() => setImportOpen(true)}>
          <Upload size={16} /> Import
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Add enquiry
        </button>
      </PageHeader>

      {/* Two ways to look at the same leads */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          { key: 'leads', label: 'Leads', icon: Rows3, count: rows.length },
          { key: 'overview', label: 'Sales overview', icon: LayoutGrid },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              view === v.key
                ? 'bg-ink-900 text-white shadow-sm'
                : 'bg-white text-ink-600 ring-1 ring-ink-900/[0.07] hover:text-ink-900'
            }`}
          >
            <v.icon size={15} /> {v.label}
            {v.count != null && (
              <span className={`num ${view === v.key ? 'text-white/60' : 'text-ink-400'}`}>{v.count}</span>
            )}
          </button>
        ))}

        {stage && view === 'leads' && (
          <button className="chip border-brand-600 bg-brand-50 text-brand-700" onClick={() => setStage(null)}>
            Stage: {stage} <X size={13} />
          </button>
        )}
      </div>

      {view === 'overview' && (
        <SalesOverview
          rows={rows}
          bookings={bookings}
          team={team}
          onPickStatus={openStage}
          onOpen={(lead) => setViewing(lead)}
          actions={quickActions}
        />
      )}

      {view === 'leads' && (
      <DataTable
        columns={columns}
        rows={listRows}
        searchKeys={['name', 'phone', 'email', 'destination', 'id']}
        searchPlaceholder="Search by name, phone, email or destination…"
        filters={[
          { key: 'status', label: 'Status', options: enquiryStatuses },
          { key: 'source', label: 'Source', options: SOURCES },
          { key: 'label', label: 'Label', options: LABELS },
          { key: 'owner', label: 'Owner', options: owners },
        ]}
        exportName="smira-club-enquiries"
        emptyLabel="No enquiries match this view"
        onRowClick={(r) => setViewing(r)}
        bulkActions={[
          { label: 'Assign', icon: UserCheck, onClick: (ids) => setAssignFor(ids) },
          { label: 'Change status', icon: Tag, onClick: (ids) => setStatusFor(ids) },
          { label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) },
        ]}
      />
      )}

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={saveEnquiry}
        title={editing ? `Edit ${editing.id}` : 'Add enquiry'}
        subtitle={editing ? editing.name : 'Capture a new travel enquiry'}
        fields={fields}
        initial={editing || { status: 'New', owner: 'Unassigned' }}
        submitLabel={editing ? 'Save changes' : 'Create enquiry'}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('enquiries', confirm)}
        title="Delete enquiries?"
        message={`This removes ${confirm?.length || 0} enquiry record${
          confirm?.length === 1 ? '' : 's'
        } from the pipeline. This cannot be undone.`}
      />

      {/* Assign owner */}
      <Modal
        open={Boolean(assignFor)}
        onClose={() => setAssignFor(null)}
        title="Assign owner"
        subtitle={`${assignFor?.length || 0} enquiry(s) selected`}
        size="sm"
      >
        <div className="space-y-2">
          {owners.map((o) => (
            <button
              key={o}
              onClick={() => {
                updateMany('enquiries', assignFor, { owner: o }, `Assigned to ${o}`);
                setAssignFor(null);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50"
            >
              <Avatar name={o} size="sm" />
              <span className="font-semibold text-ink-800">{o}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Change status */}
      <Modal
        open={Boolean(statusFor)}
        onClose={() => setStatusFor(null)}
        title="Change status"
        subtitle={`${statusFor?.length || 0} enquiry(s) selected`}
        size="sm"
      >
        <div className="space-y-2">
          {enquiryStatuses.map((s) => (
            <button
              key={s}
              onClick={() => {
                updateMany('enquiries', statusFor, { status: s }, `Status set to ${s}`);
                setStatusFor(null);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50"
            >
              <Badge tone={statusTone[s]} dot>{s}</Badge>
            </button>
          ))}
        </div>
      </Modal>

      {/* Import */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import enquiries"
        subtitle="Upload a CSV exported from your old CRM"
        size="md"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setImportOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setImportOpen(false);
                toast('Import queued — we will email you when it finishes', 'info');
              }}
            >
              Start import
            </button>
          </>
        }
      >
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-900/15 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
          <Upload size={26} className="mb-3 text-ink-400" />
          <span className="text-sm font-bold text-ink-800">Click to choose a CSV file</span>
          <span className="mt-1 text-xs text-ink-500">Columns: name, phone, email, destination, pax, budget</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) toast(`${file.name} ready to import`, 'info');
            }}
          />
        </label>
      </Modal>
      <LeadDetails
        lead={viewing && rows.find((r) => r.id === viewing.id)}
        list={rows}
        onClose={() => setViewing(null)}
        onJump={(step) => {
          const i = rows.findIndex((r) => r.id === viewing.id);
          const next = rows[i + step];
          if (next) setViewing(next);
        }}
        onEdit={(lead) => {
          setViewing(null);
          setEditing(lead);
          setFormOpen(true);
        }}
      />

    </>
  );
}
