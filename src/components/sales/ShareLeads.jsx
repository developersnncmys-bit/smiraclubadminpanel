import { useEffect, useState } from 'react';
import Avatar from '../ui/Avatar.jsx';

/**
 * Share the picked leads between several team members.
 *
 * Tick who gets leads; the leads are split evenly between them, and each
 * person's number can be changed by hand ("Akash 30, Priya 20"). Leads are
 * dealt out one at a time in turn — first to Akash, the next to Priya, and
 * so on — so nobody gets only the oldest or only the newest of the list.
 */
export default function ShareLeads({ ids, people, onShare }) {
  const [counts, setCounts] = useState({});
  const picked = people.filter((p) => counts[p] !== undefined);
  const total = picked.reduce((s, p) => s + (Number(counts[p]) || 0), 0);

  // Picking or dropping somebody splits the leads evenly again.
  const even = (list) => {
    const base = Math.floor(ids.length / (list.length || 1));
    const extra = ids.length - base * list.length;
    return Object.fromEntries(list.map((p, i) => [p, base + (i < extra ? 1 : 0)]));
  };
  const toggle = (p) => setCounts(even(counts[p] !== undefined ? picked.filter((x) => x !== p) : [...picked, p]));

  useEffect(() => setCounts({}), [ids]);

  const share = () => {
    // Dealt in turn until each has their number.
    const left = Object.fromEntries(picked.map((p) => [p, Number(counts[p]) || 0]));
    const given = Object.fromEntries(picked.map((p) => [p, []]));
    let i = 0;
    for (const id of ids) {
      let tries = 0;
      while (tries < picked.length && left[picked[i % picked.length]] <= 0) {
        i += 1;
        tries += 1;
      }
      if (tries === picked.length) break;
      const p = picked[i % picked.length];
      given[p].push(id);
      left[p] -= 1;
      i += 1;
    }
    onShare(given);
  };

  return (
    <div>
      <p className="mb-2 text-sm text-ink-600">
        Tick the team members. The {ids.length} lead(s) are split evenly — change a number to give someone more or fewer.
      </p>
      <div className="max-h-[50vh] space-y-1.5 overflow-y-auto">
        {people.map((p) => {
          const on = counts[p] !== undefined;
          return (
            <div
              key={p}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${on ? 'border-brand-400 bg-brand-50' : 'border-ink-900/10'}`}
            >
              <label className="flex flex-1 cursor-pointer items-center gap-3">
                <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={on} onChange={() => toggle(p)} />
                <Avatar name={p} size="sm" />
                <span className="font-semibold text-ink-800">{p}</span>
              </label>
              {on && (
                <input
                  type="number"
                  min={0}
                  max={ids.length}
                  className="input h-9 w-20 py-0 text-right"
                  value={counts[p]}
                  onChange={(e) => setCounts({ ...counts, [p]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                  aria-label={`Leads for ${p}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${total > ids.length ? 'text-rose-600' : 'text-ink-600'}`}>
          {total} of {ids.length} given
          {total > ids.length ? ' — that is more than there are' : total < ids.length && picked.length ? ` · ${ids.length - total} stay as they are` : ''}
        </p>
        <button className="btn-action" onClick={share} disabled={!picked.length || !total || total > ids.length}>
          Share leads
        </button>
      </div>
    </div>
  );
}
