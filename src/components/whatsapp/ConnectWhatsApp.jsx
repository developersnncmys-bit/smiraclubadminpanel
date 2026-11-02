import { useCallback, useEffect, useRef, useState } from 'react';
import { QrCode, Smartphone, CheckCircle2, Loader2, Unplug, Send, AlertTriangle, RefreshCw } from 'lucide-react';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';

/**
 * Link the desk's WhatsApp number by scanning a QR code — the same as
 * WhatsApp Web — so messages from the panel go out from that number.
 *
 * The QR comes from OpenWA through the API. While it is on screen it is
 * asked for again every few seconds (WhatsApp changes it about every 20s),
 * and the moment the phone scans it the card turns green.
 */
const STEP_TEXT = {
  not_set_up: 'The WhatsApp gateway is not set up on the server yet.',
  gateway_down: 'The WhatsApp gateway is not running. Start OpenWA, then press Refresh.',
  not_connected: 'No number is linked yet.',
  created: 'Getting ready…',
  initializing: 'Starting WhatsApp… the QR code comes up in a few seconds.',
  qr_ready: 'Scan this code with the desk phone.',
  authenticating: 'Scanned — linking the number…',
  ready: 'Connected',
  disconnected: 'Disconnected. Press Connect to link the number again.',
  action_required: 'WhatsApp needs attention — open WhatsApp on the phone, then Connect again.',
  failed: 'That did not work. Press Connect to try again.',
};

export default function ConnectWhatsApp() {
  const { toast } = useApp();
  const [state, setState] = useState(null);
  const [qr, setQr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState({ phone: '', text: 'Hello from Smira Club 👋' });
  const [sending, setSending] = useState(false);
  const timer = useRef(null);

  const load = useCallback(async () => {
    if (!isLive) return;
    try {
      const r = await api.get('/whatsapp/gateway');
      setState(r.data);
      return r.data;
    } catch (err) {
      setState({ status: 'gateway_down', message: err.message });
      return null;
    }
  }, []);

  // While connecting: ask for the QR (and the status) every 3 seconds.
  const poll = useCallback(async () => {
    try {
      const r = await api.get('/whatsapp/gateway/qr');
      setState(r.data);
      setQr(r.data.qrCode || null);
      if (r.data.connected) {
        toast(`WhatsApp connected${r.data.phone ? ` · +${r.data.phone}` : ''}`);
        setQr(null);
        return;
      }
      if (['failed', 'disconnected', 'action_required'].includes(r.data.status)) return;
    } catch {
      /* keep trying while the card is open */
    }
    timer.current = setTimeout(poll, 3000);
  }, [toast]);

  useEffect(() => {
    load().then((s) => {
      if (s && ['initializing', 'qr_ready', 'authenticating', 'created'].includes(s.status)) poll();
    });
    return () => clearTimeout(timer.current);
  }, [load, poll]);

  const connect = async () => {
    setBusy(true);
    try {
      const r = await api.post('/whatsapp/gateway/connect');
      setState(r.data);
      clearTimeout(timer.current);
      poll();
    } catch (err) {
      toast(err.message || 'Could not start WhatsApp', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm('Unlink this WhatsApp number from Smira? Messages will stop going out until it is linked again.')) return;
    setBusy(true);
    try {
      const r = await api.post('/whatsapp/gateway/disconnect');
      clearTimeout(timer.current);
      setQr(null);
      setState(r.data);
      toast('WhatsApp disconnected');
    } catch (err) {
      toast(err.message || 'Could not disconnect', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setSending(true);
    try {
      await api.post('/whatsapp/gateway/send', test);
      toast(`Message sent to ${test.phone}`);
    } catch (err) {
      toast(err.message || 'That message did not go', 'danger');
    } finally {
      setSending(false);
    }
  };

  if (!isLive) return null;
  const s = state?.status || 'loading';
  const connected = Boolean(state?.connected);
  const waiting = ['created', 'initializing', 'authenticating'].includes(s) || (s === 'qr_ready' && !qr);

  return (
    <div className="card p-5 xl:col-span-2">
      <div className="flex flex-wrap items-start gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-soft text-ink-500'}`}>
          {connected ? <CheckCircle2 size={22} /> : <Smartphone size={22} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-extrabold text-ink-900">
            {connected ? 'WhatsApp connected' : 'Connect your WhatsApp number'}
          </p>
          <p className="text-sm text-ink-600">
            {connected
              ? `Messages from Smira go out from ${state.name ? `${state.name} · ` : ''}+${state.phone || ''}`
              : STEP_TEXT[s] || 'Checking…'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-line btn-sm" onClick={() => load()} disabled={busy} title="Check again">
            <RefreshCw size={14} /> Refresh
          </button>
          {connected ? (
            <button className="btn-line-danger btn-sm" onClick={disconnect} disabled={busy}>
              <Unplug size={14} /> Disconnect
            </button>
          ) : (
            state?.configured !== false && s !== 'gateway_down' && (
              <button className="btn-action" onClick={connect} disabled={busy || s === 'qr_ready' || waiting}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />} Connect · show QR
              </button>
            )
          )}
        </div>
      </div>

      {/* The QR, with how to scan it */}
      {!connected && (qr || waiting) && (
        <div className="mt-5 grid items-center gap-5 sm:grid-cols-[240px_1fr]">
          <div className="grid aspect-square w-full max-w-[240px] place-items-center rounded-2xl border border-ink-900/10 bg-white p-3">
            {qr ? (
              <img src={qr} alt="WhatsApp QR code" className="h-full w-full" />
            ) : (
              <Loader2 size={28} className="animate-spin text-ink-400" />
            )}
          </div>
          <ol className="space-y-2 text-sm text-ink-700">
            <li><b>1.</b> Open <b>WhatsApp</b> on the desk phone.</li>
            <li><b>2.</b> Tap <b>⋮ Menu</b> (Android) or <b>Settings</b> (iPhone) → <b>Linked devices</b>.</li>
            <li><b>3.</b> Tap <b>Link a device</b> and point the phone at this code.</li>
            <li className="text-xs text-ink-500">The code refreshes by itself. Keep this page open until it turns green.</li>
          </ol>
        </div>
      )}

      {state?.message && s === 'gateway_down' && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {state.message}
        </p>
      )}

      {/* Once linked: send one to check it works */}
      {connected && (
        <div className="mt-5 rounded-xl bg-surface-soft/70 p-4">
          <p className="eyebrow mb-2">Send a test message</p>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
            <input className="input" placeholder="Mobile number" value={test.phone} onChange={(e) => setTest({ ...test, phone: e.target.value })} />
            <input className="input" placeholder="Message" value={test.text} onChange={(e) => setTest({ ...test, text: e.target.value })} />
            <button className="btn-action" onClick={sendTest} disabled={sending || !test.phone || !test.text.trim()}>
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
