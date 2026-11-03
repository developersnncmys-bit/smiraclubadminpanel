import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, Lock, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Badge from '../ui/Badge.jsx';
import { useApp } from '../../store/AppStore.jsx';
import { FIXED_STAGES, saveLeadStages, stageTone } from '../../lib/leadStages.js';

/**
 * Move stage → Customize: add, rename, reorder or take out lead stages.
 *
 * Each row remembers the name it started with, so a renamed stage takes
 * its leads along on save. New, Won and Lost cannot be renamed or taken
 * out. A stage that still has leads cannot be taken out either — the
 * server checks that too.
 */
export default function LeadStagesEditor({ open, onClose, stages, leads = [] }) {
  const { toast, pull } = useApp();
  const [rows, setRows] = useState([]);
  const [fresh, setFresh] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setRows(stages.map((s) => ({ name: s, was: s })));
      setFresh('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const counts = useMemo(() => {
    const m = {};
    leads.forEach((l) => { m[l.status] = (m[l.status] || 0) + 1; });
    return m;
  }, [leads]);

  const fixed = (r) => FIXED_STAGES.includes(r.was);
  const names = rows.map((r) => r.name.trim().toLowerCase());
  const problem =
    rows.some((r) => !r.name.trim()) ? 'A stage needs a name' :
    names.some((n, i) => names.indexOf(n) !== i) ? 'Two stages have the same name' : '';

  const edit = (i, name) => setRows((list) => list.map((r, j) => (j === i ? { ...r, name } : r)));
  const move = (i, by) =>
    setRows((list) => {
      const j = i + by;
      // New stays first and Won, Lost stay last.
      if (j < 1 || j > list.length - 3) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const drop = (i) => {
    const r = rows[i];
    if (r.was && counts[r.was]) {
      toast(`"${r.was}" has ${counts[r.was]} lead(s) — move them to another stage first`, 'danger');
      return;
    }
    setRows((list) => list.filter((_, j) => j !== i));
  };
  const add = () => {
    const n = fresh.trim();
    if (!n) return;
    if (names.includes(n.toLowerCase())) {
      toast('That stage is already there', 'danger');
      return;
    }
    // In before Won and Lost.
    setRows((list) => [...list.slice(0, -2), { name: n, was: null }, ...list.slice(-2)]);
    setFresh('');
  };

  const save = async () => {
    if (problem) return;
    setSaving(true);
    try {
      const renames = rows
        .filter((r) => r.was && r.name.trim() !== r.was)
        .map((r) => ({ from: r.was, to: r.name.trim() }));
      const moved = await saveLeadStages(rows.map((r) => r.name.trim()), renames);
      toast(moved ? `Stages saved · ${moved} lead(s) moved to the new names` : 'Stages saved');
      if (moved) pull?.('enquiries');
      onClose();
    } catch (err) {
      toast(err.message || 'Could not save the stages', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Customize stages"
      subtitle="Add, rename or reorder the stages a lead moves through"
      size="md"
      footer={
        <>
          <button className="btn-line" onClick={onClose}>Cancel</button>
          <button className="btn-action" onClick={save} disabled={saving || Boolean(problem)}>
            {saving && <Loader2 size={15} className="animate-spin" />} Save stages
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.was || `new-${i}`} className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-3 py-2">
            <Badge tone={stageTone(r.was || r.name)} dot>{i + 1}</Badge>
            {fixed(r) ? (
              <span className="flex flex-1 items-center gap-1.5 px-1 text-sm font-semibold text-ink-700">
                {r.name} <Lock size={12} className="text-ink-400" />
              </span>
            ) : (
              <input
                className="input flex-1 py-1.5"
                value={r.name}
                maxLength={40}
                onChange={(e) => edit(i, e.target.value)}
              />
            )}
            <span className="w-14 text-right text-xs text-ink-400">{counts[r.was] || 0} leads</span>
            {!fixed(r) && (
              <>
                <button className="btn-line btn-sm px-2" title="Move up" onClick={() => move(i, -1)} disabled={i <= 1}>
                  <ArrowUp size={14} />
                </button>
                <button className="btn-line btn-sm px-2" title="Move down" onClick={() => move(i, 1)} disabled={i >= rows.length - 3}>
                  <ArrowDown size={14} />
                </button>
                <button className="btn-line-danger btn-sm px-2" title="Remove" onClick={() => drop(i)}>
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder="New stage, e.g. Payment pending"
          value={fresh}
          maxLength={40}
          onChange={(e) => setFresh(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn-line" onClick={add} disabled={!fresh.trim()}>
          <Plus size={15} /> Add stage
        </button>
      </div>

      {problem ? (
        <p className="mt-3 text-xs font-semibold text-rose-600">{problem}</p>
      ) : (
        <p className="mt-3 text-xs text-ink-400">
          Renaming a stage moves its leads to the new name. New, Won and Lost are fixed.
        </p>
      )}
    </Modal>
  );
}
