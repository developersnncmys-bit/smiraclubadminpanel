import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneCall, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { dialable } from '../lib/phone.js';

/**
 * Call log: every call made from a lead's Call button, newest first.
 *
 * A call is logged on the lead when its Call button is pressed, so this is
 * read straight off the leads — who was called, when and by whom. Tap the
 * phone to call again, or the row to open the lead.
 */
const DAY_MS = 86400000;
const dayLabel = (t) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const d = new Date(t).setHours(0, 0, 0, 0);
  if (d === today) return 'Today';
  if (d === today - DAY_MS) return 'Yesterday';
  return new Date(t).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
};

export default function CallLog() {
  const { enquiries, auth } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mine, setMine] = useState(true);

  const calls = useMemo(() => {
    const out = [];
    enquiries.forEach((l) => {
      (l.activities || []).forEach((a, i) => {
        if (a.kind !== 'call') return;
        const at = new Date(a.at).getTime();
        if (!at) return;
        out.push({ key: `${l.id}-${i}`, lead: l, at, by: a.byName || '—', text: a.text });
      });
    });
    return out.sort((a, b) => b.at - a.at);
  }, [enquiries]);

  const me = String(auth?.name || '').toLowerCase();
  const q = query.trim().toLowerCase();
  const shown = calls
    .filter((c) => !mine || String(c.by).toLowerCase() === me)
    .filter((c) => !q || `${c.lead.name} ${c.lead.phone}`.toLowerCase().includes(q))
    .slice(0, 300);

  let lastDay = '';
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Call log" subtitle={`${shown.length} call(s)${mine ? ' made by you' : ''}`} />

      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Name or number" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-soft p-1">
          {[[true, 'My calls'], [false, 'Everyone']].map(([key, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setMine(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${mine === key ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <PhoneCall size={28} className="mx-auto text-ink-300" />
          <p className="mt-3 font-semibold text-ink-700">No calls yet</p>
          <p className="text-sm text-ink-500">Calls made with a lead&apos;s Call button show up here.</p>
        </div>
      ) : (
        <div className="card divide-y divide-ink-900/[0.06] overflow-hidden">
          {shown.map((c) => {
            const day = dayLabel(c.at);
            const header = day !== lastDay;
            lastDay = day;
            return (
              <div key={c.key}>
                {header && <p className="eyebrow bg-surface-soft/60 px-4 py-1.5">{day}</p>}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => navigate(`/enquiries?lead=${encodeURIComponent(c.lead.id)}`)}
                  >
                    <Avatar name={c.lead.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink-900">{c.lead.name}</span>
                      <span className="block truncate text-xs text-ink-500">
                        {c.lead.phone} · {new Date(c.at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        {!mine && ` · ${String(c.by).split(' ')[0]}`}
                        {c.lead.status && ` · ${c.lead.status}`}
                      </span>
                    </span>
                  </button>
                  {c.lead.phone && (
                    <a
                      href={`tel:${dialable(c.lead.phone)}`}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#34C759] text-white"
                      title="Call again"
                    >
                      <Phone size={19} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
