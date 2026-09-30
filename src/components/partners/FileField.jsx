import { useRef, useState } from 'react';
import { Check, FileText, Loader2, Paperclip, Trash2 } from 'lucide-react';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/heic';
const MAX_BYTES = 15 * 1024 * 1024;

const readable = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/**
 * A document: chosen from the machine it is on, not pasted as a link.
 *
 * A link meant the paper lived in somebody's Drive — it could be moved,
 * revoked or edited after we had checked it, and a partner without a Drive
 * account could not apply at all. The file is sent to Smira and the field
 * keeps the address it now lives at, which is the same kind of value the
 * field always held, so anything pasted in before still works.
 *
 * `upload` is passed in because the desk and the partner send through
 * different doors with different tokens.
 */
export default function FileField({ value, onChange, upload, label }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState('');
  const box = useRef(null);

  const pick = async (file) => {
    if (!file) return;
    setFailed('');
    if (file.size > MAX_BYTES) {
      setFailed('That file is over 15 MB — send a smaller scan');
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('That file could not be read'));
        reader.readAsDataURL(file);
      });
      const res = await upload({ file: dataUrl, filename: file.name, label });
      onChange(res.url);
    } catch (err) {
      setFailed(err?.message || 'That did not upload');
    } finally {
      setBusy(false);
      if (box.current) box.current.value = '';
    }
  };

  if (value) {
    return (
      <span className="flex items-center gap-2">
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
        >
          <Check size={14} className="shrink-0" />
          <span className="truncate">Attached — open</span>
        </a>
        <button
          type="button"
          onClick={() => onChange('')}
          title="Remove"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-900/10 text-ink-500 transition hover:border-rose-300 hover:text-rose-600"
        >
          <Trash2 size={14} />
        </button>
      </span>
    );
  }

  return (
    <span className="block">
      <button
        type="button"
        onClick={() => box.current?.click()}
        disabled={busy}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-ink-900/20 px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:border-brand-400 hover:text-brand-700 disabled:opacity-60"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
        {busy ? 'Sending…' : 'Choose a file'}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-ink-400">
          <FileText size={12} /> PDF or photo, up to {readable(MAX_BYTES)}
        </span>
      </button>
      <input
        ref={box}
        type="file"
        accept={ACCEPT}
        onChange={(e) => pick(e.target.files?.[0])}
        className="hidden"
      />
      {failed && <span className="mt-1 block text-xs font-semibold text-rose-600">{failed}</span>}
    </span>
  );
}
