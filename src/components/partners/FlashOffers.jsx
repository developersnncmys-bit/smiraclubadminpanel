import { useEffect, useState } from 'react';
import { Zap, Timer, Ban, Loader2 } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { api } from '../../lib/api.js';
import { partnerApi } from '../../lib/partnerApi.js';

/**
 * The three calls, by who is making them.
 *
 * The desk names the partner in the path because it is looking at somebody
 * else's listings; the portal does not, because its token already says
 * whose they are. Everything below this line is the same screen.
 */
export const deskFlash = (partnerId) => ({
  list: () => api.get(`/partners/${partnerId}/flash-offers`),
  create: (body) => api.post(`/partners/${partnerId}/flash-offers`, body),
  stop: (id) => api.post(`/partners/${partnerId}/flash-offers/${id}/stop`),
});

export const portalFlash = () => ({
  list: () => partnerApi.flashOffers(),
  create: (body) => partnerApi.createFlashOffer(body),
  stop: (id) => partnerApi.stopFlashOffer(id),
});

/**
 * A partner's flash offers, and the box to raise one.
 *
 * A room still empty at four o'clock is worth less than a discounted room,
 * and the partner is usually the one who spots it. They raise these
 * themselves in the portal; this is the same thing from the desk's side,
 * for the partner who rings up rather than logging in.
 *
 * There is nothing to approve. The only rate it can move is the partner's
 * own, it can only come down, and it stops on the clock they set — so the
 * desk is doing data entry for them, not granting anything.
 */

const HOURS = [
  { value: 4, label: '4 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: 'Today' },
  { value: 48, label: '2 days' },
  { value: 72, label: '3 days' },
];

const TONE = { Running: 'green', Scheduled: 'sky', Ended: 'slate' };

/** "ends in 3h 20m", which is the only thing anybody reads on these. */
function endsIn(when) {
  const ms = new Date(when).getTime() - Date.now();
  if (ms <= 0) return 'ended';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `ends in ${mins}m`;
  const h = Math.floor(mins / 60);
  return `ends in ${h}h ${mins % 60}m`;
}

export default function FlashOffers({ io, live = true, mine = false }) {
  const [rows, setRows] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // The headline is the line the member reads on the card. It is the
  // description rather than the name, because the name is what the desk's
  // Offers list is sorted and searched by and it writes itself.
  const [form, setForm] = useState({ listing: '', percent: 15, hours: 24, description: '' });

  useEffect(() => {
    let dropped = false;
    setLoading(true);
    io.list()
      .then((res) => {
        if (dropped) return;
        setRows(res.data || []);
        setListings(res.listings || []);
      })
      .catch(() => !dropped && setRows([]))
      .finally(() => !dropped && setLoading(false));
    return () => { dropped = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const raise = async () => {
    if (!form.listing) return setError('Which listing is the offer on?');
    setBusy(true);
    setError('');
    try {
      const res = await io.create(form);
      setRows(res.data || []);
      setForm((f) => ({ ...f, description: '' }));
    } catch (err) {
      setError(err?.message || 'That did not go through');
    }
    setBusy(false);
  };

  const stop = async (offer) => {
    setBusy(true);
    try {
      const res = await io.stop(offer._id);
      setRows(res.data || []);
    } catch (err) {
      setError(err?.message || 'That did not stop');
    }
    setBusy(false);
  };

  if (!live) {
    return (
      <p className="rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
        {mine
          ? 'You can run a flash offer once your property is live with us.'
          : 'A partner can run a flash offer once they are live. This one is not yet.'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* -- Raise one --------------------------------------------------- */}
      <div className="rounded-xl border border-ink-900/10 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
          <Zap size={15} className="text-amber-500" /> Raise a flash offer
        </p>
        <p className="mt-1 text-xs text-ink-500">
          {mine
            ? 'Cuts your own rate for a few hours and stops on its own. No approval needed.'
            : 'Cuts this partner\u2019s own rate for a few hours and stops on its own.'}
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="eyebrow">Listing</span>
            <select
              className="input mt-1"
              value={form.listing}
              onChange={(e) => setForm((f) => ({ ...f, listing: e.target.value }))}
            >
              <option value="">Select</option>
              {listings.map((l) => (
                <option key={l.ref || l.id} value={l.ref || l.id}>{l.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="eyebrow">Percent off</span>
            <input
              type="number"
              min={5}
              max={60}
              className="input mt-1"
              value={form.percent}
              onChange={(e) => setForm((f) => ({ ...f, percent: e.target.value }))}
            />
          </label>

          <label className="block">
            <span className="eyebrow">Runs for</span>
            <select
              className="input mt-1"
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: Number(e.target.value) }))}
            >
              {HOURS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="eyebrow">Headline on the card</span>
            <input
              className="input mt-1"
              placeholder="Tonight only"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
        </div>

        {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

        <button className="btn-action btn-sm mt-3" onClick={raise} disabled={busy}>
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />} Put it live
        </button>
      </div>

      {/* -- What is running --------------------------------------------- */}
      {loading ? (
        <p className="text-sm text-ink-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
          No flash offers yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((o) => (
            <li key={o._id} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-900/10 px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <Zap size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-900">{o.name}</p>
                <p className="truncate text-xs text-ink-500">
                  {o.description ? `${o.description} · ` : ''}
                  {o.listing?.name || 'Listing removed'} · {o.percent}% off
                  {o.raisedBy ? ` · raised by ${o.raisedBy.toLowerCase()}` : ''}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-ink-500">
                <Timer size={13} /> {o.status === 'Running' ? endsIn(o.endsOn) : o.status.toLowerCase()}
              </span>
              <Badge tone={TONE[o.status] || 'slate'}>{o.status}</Badge>
              {o.status !== 'Ended' && (
                <button className="btn-line btn-sm" onClick={() => stop(o)} disabled={busy}>
                  <Ban size={13} /> Stop
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
