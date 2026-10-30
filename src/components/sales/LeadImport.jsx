import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
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

export default function LeadImport({ open, onClose, existing = [] }) {
  const { create, refresh, toast } = useApp();
  const [file, setFile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setFile(null);
    setPlan(null);
    setError('');
    setBusy(false);
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
    try {
      if (isLive) {
        const res = await api.post('/leads/import', { rows: plan.ready });
        const d = res.data || {};
        refresh();
        toast(
          `${d.added} lead${d.added === 1 ? '' : 's'} added${d.first ? ` (${d.first}–${d.last})` : ''}` +
            (d.skipped?.length ? ` · ${d.skipped.length} skipped` : '')
        );
      } else {
        plan.ready.forEach((lead) =>
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
            {plan?.ready.length ? `Import ${plan.ready.length} lead${plan.ready.length === 1 ? '' : 's'}` : 'Start import'}
          </button>
        </>
      }
    >
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
