import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic';
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 24;

/**
 * The photographs of a property, chosen from the machine they are on.
 *
 * They were a textarea: paste one link per line, from Google Drive or
 * Dropbox. Nobody photographs their hotel and then uploads it to Drive to
 * get a link — and a Drive link is usually a viewer page, not an image, so
 * half of what was pasted would never have drawn on the website at all.
 *
 * The value stays a list of addresses, which is what the website reads, so
 * anything pasted in before still works. These just happen to be ours.
 */
export default function ImagesField({ value = [], onChange, upload, label, hint }) {
  const [busy, setBusy] = useState(0);
  const [failed, setFailed] = useState('');
  const box = useRef(null);

  const add = async (files) => {
    const picked = [...files].slice(0, MAX_FILES - value.length);
    if (!picked.length) return;
    setFailed('');

    const tooBig = picked.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      setFailed(`${tooBig.name} is over 5 MB — send a smaller photograph`);
      return;
    }

    setBusy(picked.length);
    const sent = [];
    for (const file of picked) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('That file could not be read'));
          reader.readAsDataURL(file);
        });
        // eslint-disable-next-line no-await-in-loop
        const res = await upload({ file: dataUrl, filename: file.name, label });
        sent.push(res.url);
      } catch (err) {
        setFailed(err?.message || `${file.name} did not upload`);
      }
      setBusy((n) => n - 1);
    }
    if (sent.length) onChange([...value, ...sent]);
    if (box.current) box.current.value = '';
  };

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((src, i) => (
            <li key={src} className="relative">
              <img
                src={src}
                alt={`${label} ${i + 1}`}
                className="h-20 w-28 rounded-lg border border-ink-900/10 object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== src))}
                title="Remove this one"
                className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-ink-900/10 bg-white text-ink-500 shadow-sm transition hover:text-rose-600"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => box.current?.click()}
        disabled={busy > 0 || value.length >= MAX_FILES}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-ink-900/20 px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:border-brand-400 hover:text-brand-700 disabled:opacity-60"
      >
        {busy > 0 ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        {busy > 0 ? `Sending ${busy}…` : value.length ? 'Add more photographs' : 'Choose photographs'}
        <span className="ml-auto text-[11px] font-medium text-ink-400">
          {value.length}/{MAX_FILES} · JPG or PNG, up to 5 MB each
        </span>
      </button>

      <input
        ref={box}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={(e) => add(e.target.files || [])}
        className="hidden"
      />

      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      {failed && <p className="mt-1 text-xs font-semibold text-rose-600">{failed}</p>}
    </div>
  );
}
