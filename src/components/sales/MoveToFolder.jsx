import { useState } from 'react';
import { Folder, FolderPlus, FolderMinus, Check } from 'lucide-react';
import Modal from '../ui/Modal.jsx';

/**
 * A name box and a button: makes a folder. Used in the Lead lists sheet and
 * when moving leads, so a folder can be made at the moment it is needed.
 */
export function NewFolderField({ folders, onCreate, cta = 'Add folder' }) {
  const [name, setName] = useState('');
  const n = name.trim();
  const taken = folders.some((f) => f.toLowerCase() === n.toLowerCase());
  const add = () => {
    if (!n || taken) return;
    onCreate(n);
    setName('');
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          className="input min-w-0 flex-1"
          placeholder="New folder name"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-primary shrink-0" disabled={!n || taken} onClick={add}>
          <FolderPlus size={15} /> {cta}
        </button>
      </div>
      {taken && <p className="mt-1 text-xs text-red-600">There is already a folder called {n}.</p>}
    </div>
  );
}

/**
 * Move the chosen leads into a folder — an existing one, or one made here.
 *
 * Opened from a folder, "move" takes them out of that folder as they go
 * into the new one; from anywhere else it just adds them. Out of this folder
 * is offered as its own button for leads filed by mistake.
 */
export default function MoveToFolder({ open, count, folders, from, onCreate, onMove, onRemove, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Move to folder" subtitle={`${count} lead(s) selected`} size="sm">
      <div className="space-y-4">
        <NewFolderField
          folders={folders}
          cta="Create & move"
          onCreate={(n) => {
            onCreate(n);
            onMove(n);
          }}
        />

        {folders.length > 0 && (
          <div>
            <p className="eyebrow mb-1.5">Folders</p>
            <ul className="space-y-1.5">
              {folders.map((f) => {
                const here = f === from;
                return (
                  <li key={f}>
                    <button
                      type="button"
                      disabled={here}
                      onClick={() => onMove(f)}
                      className="flex w-full items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3 text-left text-sm transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60"
                    >
                      <Folder size={16} className="text-brand-600" />
                      <span className="min-w-0 flex-1 truncate font-semibold text-ink-800">{f}</span>
                      {here && (
                        <span className="flex items-center gap-1 text-xs text-ink-500">
                          <Check size={13} /> Here now
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {from && (
          <button type="button" className="btn-line w-full" onClick={onRemove}>
            <FolderMinus size={15} /> Take out of {from}
          </button>
        )}
      </div>
    </Modal>
  );
}
