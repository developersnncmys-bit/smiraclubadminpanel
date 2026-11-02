import { useEffect, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Folder } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { parseCsv } from '../../lib/csv.js';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';

/**
 * Importing leads from a spreadsheet.
 *
 * A name and a phone are all a row needs. Every other column is taken as
 * well: the ones Sales & Leads has a place for (email, destination,
 * travellers, budget, travel date, source, status, campaign, label, notes)
 * go there, whatever the sheet calls them, and anything else is written
 * into the lead's notes as "Column: value", so nothing in the file is lost.
 *
 * It used to be a picture of an importer — the button said the import was
 * queued and nothing was ever read from the file.
 */

/** What a sheet might call each field, squashed to letters and digits. */
const FIELDS = [
  { key: 'name', label: 'Name', names: ['name', 'customername', 'clientname', 'fullname', 'leadname', 'customer', 'client', 'contactname'] },
  { key: 'phone', label: 'Phone', names: ['phone', 'phonenumber', 'phoneno', 'mobile', 'mobilenumber', 'mobileno', 'contact', 'contactnumber', 'contactno', 'number', 'whatsapp', 'whatsappnumber', 'cell'] },
  { key: 'email', label: 'Email', names: ['email', 'emailid', 'emailaddress', 'mail'] },
  { key: 'destination', label: 'Destination', names: ['destination', 'travelto', 'trip', 'place'] },
  { key: 'pax', label: 'Travellers', names: ['pax', 'travellers', 'travelers', 'persons', 'people', 'guests', 'noofpersons', 'noofpax'] },
  { key: 'budget', label: 'Budget', names: ['budget', 'amount'] },
  { key: 'travelDate', label: 'Travel date', names: ['traveldate', 'dateoftravel', 'date'] },
  { key: 'source', label: 'Source', names: ['source', 'leadsource'] },
  { key: 'status', label: 'Status', names: ['status', 'stage'] },
  { key: 'campaign', label: 'Campaign', names: ['campaign'] },
  { key: 'label', label: 'Label', names: ['label'] },
  { key: 'notes', label: 'Notes', names: ['notes', 'note', 'remarks', 'remark', 'comments', 'comment'] },
];
const squash = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const tenDigits = (v) => String(v || '').replace(/\D/g, '').slice(-10);

/** Header row → which column feeds which field, and which columns are extra. */
export function mapColumns(header) {
  const map = {};
  const extra = [];
  header.forEach((h, i) => {
    const s = squash(h);
    const field = FIELDS.find((f) => !(f.key in map) && f.names.includes(s));
    if (field) map[field.key] = i;
    else if (h) extra.push({ index: i, header: h });
  });
  return { map, extra };
}

/** One sheet row → one lead, with the extra columns written into its notes. */
export function toLead(cells, { map, extra }) {
  const get = (key) => (key in map ? (cells[map[key]] || '').trim() : '');
  const lead = {};
  FIELDS.forEach((f) => {
    const v = get(f.key);
    if (v) lead[f.key] = v;
  });
  const more = extra
    .map(({ index, header }) => [header, (cells[index] || '').trim()])
    .filter(([, v]) => v)
    .map(([h, v]) => `${h}: ${v}`);
  if (more.length) lead.notes = [lead.notes, ...more].filter(Boolean).join('\n');
  return lead;
}

/** Rows per request: well inside the server's size limit for an ordinary sheet. */
const IMPORT_BATCH = 1000;
/** Requests at once: quick, without crowding the server. */
const IMPORT_PARALLEL = 3;

export default function LeadImport({ open, onClose, existing = [], folders = [], folder = null, onNewFolder }) {
  const { create, refresh, toast } = useApp();
  const [file, setFile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  /** How many rows have gone to the server so far. */
  const [done, setDone] = useState(0);
  /** The folder the new leads go into — the one open on the page, to start with. */
  const [into, setInto] = useState('');
  const [newName, setNewName] = useState('');
  useEffect(() => {
    if (open) {
      setInto(folder || '');
      setNewName('');
    }
  }, [open, folder]);
  const NEW = '__new__';
  const target = into === NEW ? newName.trim() : into;
  const withFolder = (rows) => (target ? rows.map((r) => ({ ...r, tags: [...(r.tags || []), target] })) : rows);

  const reset = () => {
    setFile(null);
    setPlan(null);
    setError('');
    setBusy(false);
    setDone(0);
  };
  const close = () => {
    reset();
    onClose();
  };

  const read = async (f) => {
    reset();
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) {
      setError('Choose a .csv file. In Excel: File → Save As → CSV (Comma delimited).');
      return;
    }
    setFile(f);
    const rows = parseCsv(await f.text());
    if (rows.length < 2) {
      setError('That file has no rows under its header.');
      return;
    }
    const columns = mapColumns(rows[0]);
    if (!('name' in columns.map) || !('phone' in columns.map)) {
      setError(
        `The file needs a name column and a phone column. Its columns are: ${rows[0].filter(Boolean).join(', ')}.`
      );
      return;
    }

    // What will happen to each row, worked out before anything is sent.
    const have = new Set(existing.map((l) => tenDigits(l.phone)).filter(Boolean));
    const ready = [];
    const missing = [];
    let duplicates = 0;
    rows.slice(1).forEach((cells, i) => {
      const lead = toLead(cells, columns);
      if (!lead.name || !lead.phone) {
        missing.push({ row: i + 2, name: lead.name || '', reason: !lead.name ? 'No name' : 'No phone' });
        return;
      }
      const key = tenDigits(lead.phone);
      if (key && have.has(key)) {
        duplicates += 1;
        return;
      }
      if (key) have.add(key);
      ready.push(lead);
    });
    setPlan({ total: rows.length - 1, columns, header: rows[0], ready, missing, duplicates });
  };

  const run = async () => {
    if (!plan?.ready.length) return;
    setBusy(true);
    setError('');
    if (into === NEW && !target) {
      setError('Type a name for the new folder, or choose an existing one.');
      setBusy(false);
      return;
    }
    if (into === NEW && onNewFolder) onNewFolder(target);
    try {
      if (isLive) {
        // Any size of file: sent in parts so no single request is too big for
        // the server, a few parts at a time so it goes quickly, and the
        // button shows how far it is. The file was de-duplicated above, so
        // parts running side by side cannot add the same number twice.
        const parts = [];
        for (let at = 0; at < plan.ready.length; at += IMPORT_BATCH) parts.push(withFolder(plan.ready.slice(at, at + IMPORT_BATCH)));
        let added = 0;
        let skipped = 0;
        let sent = 0;
        const codes = [];
        for (let i = 0; i < parts.length; i += IMPORT_PARALLEL) {
          const round = parts.slice(i, i + IMPORT_PARALLEL);
          const results = await Promise.allSettled(round.map((rows) => api.post('/leads/import', { rows })));
          results.forEach((r) => {
            if (r.status !== 'fulfilled') return;
            const d = r.value.data || {};
            added += d.added || 0;
            skipped += d.skipped?.length || 0;
            if (d.first) codes.push(d.first, d.last);
          });
          sent += round.reduce((n, rows) => n + rows.length, 0);
          setDone(sent);
          const failed = results.find((r) => r.status === 'rejected');
          if (failed) {
            // What went in before the failure stays in; say so.
            if (added) refresh();
            throw new Error(
              added
                ? `${added} leads were added, then it stopped: ${failed.reason?.message}. Import the same file again to add the rest — the ones already added are skipped.`
                : failed.reason?.message
            );
          }
        }
        const byNumber = codes.sort((a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')));
        refresh();
        toast(
          `${added} lead${added === 1 ? '' : 's'} added${target ? ` to ${target}` : ''}${byNumber.length ? ` (${byNumber[0]}–${byNumber[byNumber.length - 1]})` : ''}` +
            (skipped ? ` · ${skipped} skipped` : '')
        );
      } else {
        withFolder(plan.ready).forEach((lead) =>
          create('enquiries', { status: 'New', source: 'Calling data', owner: 'Unassigned', ...lead }, { silent: true })
        );
        toast(`${plan.ready.length} leads added`);
      }
      close();
    } catch (err) {
      setError(err.message || 'The import did not go through');
      setBusy(false);
    }
  };

  const mapped = plan
    ? FIELDS.filter((f) => f.key in plan.columns.map).map((f) => ({ label: f.label, from: plan.header[plan.columns.map[f.key]] }))
    : [];

  return (
    <Modal
      open={open}
      onClose={close}
      title="Import leads"
      subtitle="A CSV file: name and phone are required, every other column is kept"
      size="md"
      footer={
        <>
          <button className="btn-line" onClick={close} disabled={busy}>Cancel</button>
          <button className="btn-action" onClick={run} disabled={busy || !plan?.ready.length}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {busy && plan?.ready.length > IMPORT_BATCH
              ? `Importing ${done.toLocaleString('en-IN')} of ${plan.ready.length.toLocaleString('en-IN')}…`
              : plan?.ready.length
                ? `Import ${plan.ready.length.toLocaleString('en-IN')} lead${plan.ready.length === 1 ? '' : 's'}`
                : 'Start import'}
          </button>
        </>
      }
    >
      {/* Which folder the new leads land in. */}
      <div className="mb-4">
        <label className="label flex items-center gap-1.5">
          <Folder size={14} className="text-brand-600" /> Put into folder
        </label>
        <select className="input" value={into} onChange={(e) => setInto(e.target.value)} disabled={busy}>
          <option value="">No folder (only “Imported”)</option>
          {folders.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
          <option value={NEW}>+ New folder…</option>
        </select>
        {into === NEW && (
          <input
            className="input mt-2"
            placeholder="New folder name"
            maxLength={40}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={busy}
          />
        )}
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-900/15 px-6 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
        {file ? <FileSpreadsheet size={26} className="mb-3 text-brand-600" /> : <Upload size={26} className="mb-3 text-ink-400" />}
        <span className="text-sm font-bold text-ink-800">{file ? file.name : 'Click to choose a CSV file'}</span>
        <span className="mt-1 text-xs text-ink-500">
          {file ? 'Click to choose a different file' : 'Required columns: name, phone · any other columns are added automatically'}
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            read(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      {plan && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 px-2 py-2.5">
              <p className="num font-display text-xl font-extrabold text-emerald-700">{plan.ready.length}</p>
              <p className="text-[11px] font-semibold text-emerald-700">to add</p>
            </div>
            <div className="rounded-xl bg-surface-soft px-2 py-2.5">
              <p className="num font-display text-xl font-extrabold text-ink-700">{plan.duplicates}</p>
              <p className="text-[11px] font-semibold text-ink-500">already in leads or repeated</p>
            </div>
            <div className={`rounded-xl px-2 py-2.5 ${plan.missing.length ? 'bg-amber-50' : 'bg-surface-soft'}`}>
              <p className={`num font-display text-xl font-extrabold ${plan.missing.length ? 'text-amber-700' : 'text-ink-700'}`}>
                {plan.missing.length}
              </p>
              <p className={`text-[11px] font-semibold ${plan.missing.length ? 'text-amber-700' : 'text-ink-500'}`}>missing name or phone</p>
            </div>
          </div>

          <div className="rounded-xl border border-ink-900/[0.07] p-3 text-sm">
            <p className="eyebrow mb-2">How the columns are read · {plan.total} rows</p>
            <ul className="space-y-1">
              {mapped.map((m) => (
                <li key={m.label} className="flex items-center gap-2 text-ink-700">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-ink-400">← “{m.from}”</span>
                </li>
              ))}
              {plan.columns.extra.length > 0 && (
                <li className="flex items-start gap-2 text-ink-700">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>
                    <span className="font-semibold">Added to notes</span>{' '}
                    <span className="text-ink-400">← {plan.columns.extra.map((x) => `“${x.header}”`).join(', ')}</span>
                  </span>
                </li>
              )}
            </ul>
          </div>

          {plan.missing.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-bold">Not imported — add a name and phone in the sheet and import again:</p>
              <p className="mt-1">
                {plan.missing.slice(0, 12).map((m) => `row ${m.row}${m.name ? ` (${m.name})` : ''}: ${m.reason.toLowerCase()}`).join(' · ')}
                {plan.missing.length > 12 ? ` · and ${plan.missing.length - 12} more` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
