import { useState } from 'react';
import { Plus, Copy, Trash2, ExternalLink, FileInput } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';
import { formLists } from '../data/modulesData.js';

const STATUS = ['Live', 'Draft', 'Closed'];
const tone = { Live: 'green', Draft: 'amber', Closed: 'slate' };

/** Website forms and where each response lands. */
export default function Forms() {
  const { forms, auth, create, update, remove, toast } = useApp();
  const [creating, setCreating] = useState(null); // the form being written
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const openNew = () => {
    setEditingId(null);
    setCreating({ name: '', listName: formLists[0], description: '' });
  };
  const openEdit = (row) => {
    setEditingId(row.id);
    setCreating({ name: row.name, listName: row.listName, description: row.description });
  };

  const submit = () => {
    if (!creating.name.trim()) {
      toast('Give the form a name first', 'danger');
      return;
    }
    if (editingId) {
      update('forms', editingId, creating, { message: `${creating.name} saved` });
    } else {
      create('forms', {
        ...creating,
        responses: 0,
        lastResponse: 'never',
        createdBy: auth?.name || 'You',
        createdOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        status: 'Draft',
      });
    }
    setCreating(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Form name',
      render: (r) => (
        <div className="min-w-0 max-w-[260px]">
          <p className="truncate font-bold text-ink-900">{r.name}</p>
          <p className="truncate text-xs text-ink-500">{r.description}</p>
        </div>
      ),
    },
    {
      key: 'lastResponse',
      header: 'Last response',
      render: (r) => (
        <span className={`whitespace-nowrap text-sm ${r.responses ? 'text-ink-700' : 'text-ink-400'}`}>
          {r.lastResponse}
        </span>
      ),
    },
    {
      key: 'responses',
      header: 'Responses',
      render: (r) => (
        <span className="num font-bold text-ink-900">
          {r.responses ? r.responses.toLocaleString('en-IN') : '—'}
        </span>
      ),
    },
    { key: 'listName', header: 'List name', render: (r) => <Badge tone="teal">{r.listName}</Badge> },
    {
      key: 'createdBy',
      header: 'Created by',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.createdBy} size="sm" />
          <span className="truncate text-sm text-ink-700">{r.createdBy}</span>
        </div>
      ),
    },
    {
      key: 'createdOn',
      header: 'Created on',
      render: (r) => <span className="whitespace-nowrap text-ink-600">{r.createdOn}</span>,
    },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={tone[r.status]} dot>{r.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => toast(`Embed code for ${r.name} copied`, 'info')}
            title="Copy embed code"
            className="icon-btn"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() =>
              update(
                'forms',
                r.id,
                { status: r.status === 'Live' ? 'Closed' : 'Live' },
                { message: `${r.name} ${r.status === 'Live' ? 'closed' : 'is live'}` }
              )
            }
            title={r.status === 'Live' ? 'Close form' : 'Publish form'}
            className="icon-btn"
          >
            <ExternalLink size={14} />
          </button>
          <button onClick={() => setConfirm([r.id])} title="Delete form" className="icon-btn-danger">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={`Forms (${forms.length})`} subtitle="Forms on the website and where each response lands">
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> New form
        </button>
      </PageHeader>

      {forms.length === 0 ? (
        <div className="card border-dashed p-16 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <FileInput size={26} />
          </span>
          <h2 className="mt-5 font-display text-xl font-extrabold text-ink-900">
            No forms created yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
            Create your first form to start collecting responses from the website.
          </p>
          <button className="btn-primary mx-auto mt-6" onClick={openNew}>
            <Plus size={16} /> Create first form
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Forms', value: forms.length, hint: `${forms.filter((f) => f.status === 'Live').length} live` },
              { label: 'Responses', value: forms.reduce((s, f) => s + f.responses, 0).toLocaleString('en-IN') },
              { label: 'Lists in use', value: new Set(forms.map((f) => f.listName)).size },
              {
                label: 'Busiest form',
                value: [...forms].sort((a, b) => b.responses - a.responses)[0]?.name || '—',
              },
            ].map((s) => (
              <div key={s.label} className="card px-5 py-4">
                <p className="text-sm font-semibold text-ink-500">{s.label}</p>
                <p className="num mt-1 truncate font-display text-2xl font-extrabold text-ink-900">
                  {s.value}
                </p>
                {s.hint && <p className="mt-0.5 text-xs text-ink-400">{s.hint}</p>}
              </div>
            ))}
          </div>

          <DataTable
            columns={columns}
            rows={forms}
            selectable={false}
            searchKeys={['name', 'description', 'listName', 'createdBy']}
            searchPlaceholder="Search forms…"
            filters={[
              { key: 'status', label: 'Status', options: STATUS },
              { key: 'listName', label: 'List', options: formLists },
            ]}
            exportName="smira-club-forms"
            emptyLabel="No forms match this view"
            onRowClick={openEdit}
          />
        </>
      )}

      {/* Create / edit */}
      <Modal
        open={Boolean(creating)}
        onClose={() => setCreating(null)}
        title={editingId ? 'Edit form' : 'Create new form'}
        subtitle={editingId ? editingId : 'Responses land in the list you choose'}
        size="md"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setCreating(null)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit}>
              {editingId ? 'Save changes' : 'Continue'}
            </button>
          </>
        }
      >
        {creating && (
          <div className="space-y-5">
            <div>
              <label className="label">
                Form name <span className="text-coral">*</span>
              </label>
              <input
                className="input"
                value={creating.name}
                onChange={(e) => setCreating((c) => ({ ...c, name: e.target.value }))}
                placeholder="e.g. Group tour interest"
              />
            </div>

            <div>
              <label className="label">Save form responses to</label>
              <select
                className="input"
                value={creating.listName}
                onChange={(e) => setCreating((c) => ({ ...c, listName: e.target.value }))}
              >
                {formLists.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={creating.description}
                onChange={(e) => setCreating((c) => ({ ...c, description: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('forms', confirm)}
        title="Delete this form?"
        message="It stops accepting responses. Responses already collected stay in their list."
      />
    </>
  );
}
