import { useMemo, useState } from 'react';
import { ChevronDown, Search, Check, Inbox, UserX, Folder, Radio, ListChecks } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { NewFolderField } from './MoveToFolder.jsx';

/**
 * Which leads you are looking at, as one big title — "Ringing (176) ▾" —
 * the way a mobile CRM shows it, with every list a tap away in a sheet:
 * all leads, the unassigned ones, each stage, each source, and each list
 * folder — an imported list, or one made here with New folder.
 *
 * With hundreds of leads the useful question is never "show me all of
 * them", it is "show me the ones in this state"; the stage menu that did
 * this was tucked inside the Pipeline box and could not pick a source or an
 * imported list at all.
 *
 * `pick` is one of: { kind: 'all' } · { kind: 'unassigned' } ·
 * { kind: 'stage', value } · { kind: 'source', value } · { kind: 'tag', value }
 */
export default function LeadListPicker({ leads, stages, current, count, onPick, folders = [], onNewFolder }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const groups = useMemo(() => {
    const tally = (keyOf) => {
      const m = new Map();
      leads.forEach((l) => {
        [].concat(keyOf(l) || []).forEach((k) => {
          if (k) m.set(k, (m.get(k) || 0) + 1);
        });
      });
      return m;
    };
    const byStage = tally((l) => l.status);
    const bySource = tally((l) => l.source);
    const byTag = tally((l) => l.tags);
    // A folder made but not yet filled still shows, at nought.
    folders.forEach((f) => { if (!byTag.has(f)) byTag.set(f, 0); });
    const unassigned = leads.filter((l) => !l.owner || l.owner === 'Unassigned').length;
    return [
      {
        title: '',
        rows: [
          { kind: 'all', label: 'All leads', count: leads.length, icon: Inbox },
          { kind: 'unassigned', label: 'Unassigned', count: unassigned, icon: UserX },
        ],
      },
      // Folders next: they are the lists people make themselves, so they
      // should not sit under a dozen stages.
      {
        title: 'Folders',
        folders: true,
        rows: [...byTag.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ kind: 'tag', value: t, label: t, count: n, icon: Folder })),
      },
      {
        title: 'By stage',
        rows: stages.map((s) => ({ kind: 'stage', value: s, label: s, count: byStage.get(s) || 0, icon: ListChecks })),
      },
      {
        title: 'By source',
        rows: [...bySource.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => ({ kind: 'source', value: s, label: s, count: n, icon: Radio })),
      },
    ].filter((g) => g.rows.length || g.folders);
  }, [leads, stages, folders]);

  const isOn = (r) => r.kind === current.kind && (r.value ?? null) === (current.value ?? null);
  const needle = q.trim().toLowerCase();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-w-0 items-center gap-1.5 rounded-xl py-1 text-left"
        aria-haspopup="dialog"
      >
        <span className="truncate font-display text-xl font-extrabold text-ink-900 sm:text-2xl">{current.label}</span>
        <span className="num shrink-0 font-display text-xl font-extrabold text-brand-700 sm:text-2xl">({count})</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition group-hover:bg-brand-700">
          <ChevronDown size={16} strokeWidth={2.6} />
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setQ(''); }}
        title="Lead lists"
        subtitle="Choose which leads to show"
        size="sm"
      >
        <label className="relative mb-3 block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Find a list…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>

        <div className="space-y-4">
          {groups.map((g) => {
            const rows = g.rows.filter((r) => !needle || r.label.toLowerCase().includes(needle));
            if (!rows.length && !g.folders) return null;
            return (
              <div key={g.title || 'top'}>
                {g.title && <p className="eyebrow mb-1.5">{g.title}</p>}
                {g.folders && onNewFolder && (
                  <div className="mb-2">
                    <NewFolderField folders={[...new Set([...folders, ...g.rows.map((r) => r.value)])]} onCreate={onNewFolder} />
                  </div>
                )}
                <ul className="space-y-1.5">
                  {rows.map((r) => {
                    const on = isOn(r);
                    return (
                      <li key={`${r.kind}-${r.value || r.label}`}>
                        <button
                          type="button"
                          onClick={() => {
                            onPick(r);
                            setOpen(false);
                            setQ('');
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition ${
                            on ? 'bg-brand-50 font-bold text-brand-800 ring-1 ring-brand-200' : 'bg-surface-soft/70 text-ink-800 hover:bg-surface-soft'
                          }`}
                        >
                          <r.icon size={16} className={on ? 'text-brand-600' : 'text-ink-400'} />
                          <span className="min-w-0 flex-1 truncate">
                            {r.label} <span className="num text-ink-500">({r.count})</span>
                          </span>
                          {on && <Check size={16} className="shrink-0 text-brand-600" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
