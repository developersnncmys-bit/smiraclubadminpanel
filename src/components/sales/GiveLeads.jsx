import { useMemo, useState } from 'react';
import { UserCheck } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Avatar from '../ui/Avatar.jsx';

/**
 * Give a number of leads to one person in one go: "100 to Akash".
 *
 * Picking a hundred leads by hand, one tick at a time, was the only way.
 * Here the person and the number are chosen, and the leads are taken from
 * the waiting pile — leads nobody has yet, or the list as it is filtered on
 * the page — oldest first unless asked otherwise.
 */
const SIZES = [10, 25, 50, 100, 200];

export default function GiveLeads({ open, onClose, people, all, onScreen, stages, onGive }) {
  const [who, setWho] = useState('');
  const [count, setCount] = useState(100);
  const [from, setFrom] = useState('unassigned'); // 'unassigned' | 'screen'
  const [status, setStatus] = useState('');
  const [order, setOrder] = useState('oldest');

  const pool = useMemo(() => {
    const base = from === 'unassigned'
      ? all.filter((e) => !e.owner || e.owner === 'Unassigned')
      : onScreen.filter((e) => e.owner !== who);
    const list = status ? base.filter((e) => e.status === status) : base;
    const when = (e) => new Date(e.createdAt || 0).getTime();
    return [...list].sort((a, b) => (order === 'oldest' ? when(a) - when(b) : when(b) - when(a)));
  }, [all, onScreen, from, status, order, who]);

  const n = Math.max(0, Math.min(Number(count) || 0, pool.length));
  const give = () => {
    if (!who || !n) return;
    onGive(who, pool.slice(0, n).map((e) => e.id));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Give leads"
      subtitle="A number of leads to one person, in one tap"
      size="md"
      footer={
        <>
          <button type="button" className="btn-line" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-action" disabled={!who || !n} onClick={give}>
            <UserCheck size={16} /> {who && n ? `Give ${n.toLocaleString('en-IN')} lead${n === 1 ? '' : 's'} to ${who.split(' ')[0]}` : 'Give leads'}
          </button>
        </>
      }
    >
      <p className="label">Who gets them</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {people.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setWho(p)}
            className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
              who === p ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-900/10 text-ink-700'
            }`}
          >
            <Avatar name={p} size="sm" />
            <span className="truncate">{p}</span>
          </button>
        ))}
      </div>

      <p className="label mt-4">How many</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setCount(s)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-bold ${Number(count) === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-900/10 bg-white text-ink-700'}`}
          >
            {s}
          </button>
        ))}
        <input
          type="number"
          min="1"
          className="input h-9 w-24 py-0 text-sm"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          aria-label="Number of leads"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="label">From</span>
          <select className="input h-10 py-0 text-sm" value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="unassigned">Leads nobody has</option>
            <option value="screen">The list as filtered</option>
          </select>
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select className="input h-10 py-0 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            {stages.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Which first</span>
          <select className="input h-10 py-0 text-sm" value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="oldest">Oldest first</option>
            <option value="newest">Newest first</option>
          </select>
        </label>
      </div>

      <p className={`mt-4 rounded-xl px-3 py-2.5 text-sm font-semibold ${pool.length ? 'bg-surface-soft text-ink-700' : 'bg-amber-50 text-amber-800'}`}>
        {pool.length
          ? `${pool.length.toLocaleString('en-IN')} lead(s) available. ${who ? `${n.toLocaleString('en-IN')} will go to ${who}.` : 'Pick who gets them.'}`
          : 'No leads match — try "The list as filtered" or another status.'}
        {Number(count) > pool.length && pool.length > 0 && ' (fewer than you asked for are available)'}
      </p>
    </Modal>
  );
}
