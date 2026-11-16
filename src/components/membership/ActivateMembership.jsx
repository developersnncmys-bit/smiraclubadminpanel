import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Crown } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { useApp } from '../../store/AppStore.jsx';
import { api } from '../../lib/api.js';
import { inr } from '../../data/mockData.js';

/**
 * "Payment received → Activate". A membership bought on the website waits as
 * Payment pending: the member pays by UPI (or a link) and the desk checks the
 * money has come in. This records it and activates the membership in one
 * step — the year starts the day it is paid.
 *
 * `membership` is a memberSignups row (from the adapters).
 */
export const balanceOf = (m) => Math.max(0, Number(m?.amount || 0) - Number(m?.paid || 0));
export const awaitingPayment = (m) =>
  Boolean(m) && !['Active', 'Cancelled'].includes(m.status) && m.activation?.stage !== 'Activated';

const MODES = ['UPI', 'Card', 'Netbanking', 'Cash', 'Bank transfer'];

export default function ActivateMembership({ membership, onClose }) {
  const { pull, toast, showSaved } = useApp();
  const m = membership;
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('UPI');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!m) return;
    setAmount(String(balanceOf(m)));
    setMode(MODES.includes(m.paidVia) ? m.paidVia : 'UPI');
    setReference(m.paymentRef || '');
  }, [m]);

  if (!m) return null;
  const due = balanceOf(m);

  const save = async () => {
    if (!m._id) return toast('This membership is not on the server yet', 'danger');
    setBusy(true);
    try {
      const res = await api.post(`/memberships/${m._id}/paid`, {
        amount: amount === '' ? undefined : Number(amount),
        mode,
        reference: reference.trim() || undefined,
      });
      await pull?.('memberSignups');
      pull?.('enquiries');
      showSaved?.('Membership', res.message || 'Saved', m.id);
      onClose?.();
    } catch (err) {
      toast(`Not saved: ${err.message}`, 'danger');
    } finally {
      setBusy(false);
    }
  };

  const willActivate = Number(amount || 0) >= due;

  return (
    <Modal open={Boolean(m)} onClose={onClose} title="Payment received" subtitle={`${m.name} · ${m.id}`} size="sm">
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-3 py-2.5">
          <Crown size={18} className="shrink-0 text-brand-700" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold text-ink-900">{m.plan} membership</p>
            <p className="text-ink-600">
              {inr(m.amount)} · paid {inr(m.paid)} · <b className="text-rose-600">{inr(due)} due</b>
            </p>
          </div>
        </div>

        {(m.paymentRef || m.paidTo) && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            The member says they paid{m.paidTo ? ` to ${m.paidTo}` : ''}
            {m.paymentRef ? <> — UPI reference <b className="num">{m.paymentRef}</b></> : ''}. Check your UPI app or
            bank before activating.
          </p>
        )}

        <label className="block">
          <span className="label">Amount received (₹)</span>
          <input type="number" min="0" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Paid by</span>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
            {MODES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Reference / UTR</span>
          <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. 431234567890" />
        </label>

        <button type="button" className="btn-action w-full justify-center" disabled={busy} onClick={save}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {willActivate ? 'Payment received — Activate' : 'Save part payment'}
        </button>
        <p className="text-center text-xs text-ink-500">
          {willActivate
            ? 'The membership goes Active now and shows on the Members list and on the member’s website account.'
            : 'It activates once the full amount is in.'}
        </p>
      </div>
    </Modal>
  );
}
