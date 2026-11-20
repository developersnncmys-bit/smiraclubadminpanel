import { useCallback, useEffect, useState } from 'react';
import { Smartphone, CheckCircle2, Loader2, Send, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';

/**
 * The desk's WhatsApp number, through AdsEra — the official WhatsApp API.
 *
 * The number is connected inside AdsEra (app.adsera.in), so there is no QR
 * code here: this shows which number messages go out from, and sends a test.
 * A plain message only reaches someone who wrote in the last 24 hours;
 * anybody else needs an approved template, which is why the test can use one.
 */
const STEP_TEXT = {
  not_set_up: 'WhatsApp is not set up on the server yet — the AdsEra keys need adding.',
  gateway_down: 'AdsEra could not be reached. Press Refresh in a moment.',
  not_connected: 'No WhatsApp number is connected in AdsEra yet.',
  disconnected: 'The number is disconnected in AdsEra — reconnect it at app.adsera.in.',
};

export default function ConnectWhatsApp() {
  const { toast } = useApp();
  const [state, setState] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [test, setTest] = useState({ phone: '', text: 'Hello from Smira Club 👋', template: '', vars: {} });
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!isLive) return;
    try {
      const r = await api.get('/whatsapp/gateway');
      setState(r.data);
      if (r.data?.connected) {
        api.get('/whatsapp/gateway/templates').then((t) => setTemplates(t.data || [])).catch(() => {});
      }
    } catch (err) {
      setState({ status: 'gateway_down', message: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chosen = templates.find((t) => t.id === test.template) || null;

  const sendTest = async () => {
    setSending(true);
    try {
      if (chosen) {
        await api.post('/whatsapp/gateway/send-template', { phone: test.phone, template: chosen.id, vars: test.vars });
      } else {
        await api.post('/whatsapp/gateway/send', { phone: test.phone, text: test.text });
      }
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
  const ready = test.phone && (chosen ? chosen.params.every((p) => String(test.vars[p] || '').trim()) : test.text.trim());

  return (
    <div className="card p-5 xl:col-span-2">
      <div className="flex flex-wrap items-start gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-soft text-ink-500'}`}>
          {connected ? <CheckCircle2 size={22} /> : <Smartphone size={22} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-extrabold text-ink-900">
            {connected ? 'WhatsApp connected · official API' : 'WhatsApp'}
          </p>
          <p className="text-sm text-ink-600">
            {connected
              ? `Messages go out from ${state.name ? `${state.name} · ` : ''}+${state.phone || ''} through AdsEra`
              : state
                ? STEP_TEXT[s] || 'Checking…'
                : 'Checking…'}
          </p>
          {connected && (state.quality || state.tier) && (
            <p className="mt-1 text-xs text-ink-500">
              {state.quality ? `Quality: ${state.quality}` : ''}
              {state.quality && state.tier ? ' · ' : ''}
              {state.tier ? `Limit: ${String(state.tier).replace('TIER_', '')} new customers a day` : ''}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-line btn-sm" onClick={() => load()} title="Check again">
            <RefreshCw size={14} /> Refresh
          </button>
          <a className="btn-line btn-sm" href="https://app.adsera.in" target="_blank" rel="noreferrer">
            <ExternalLink size={14} /> Open AdsEra
          </a>
        </div>
      </div>

      {state?.message && s === 'gateway_down' && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {state.message}
        </p>
      )}

      {connected && (
        <div className="mt-5 rounded-xl bg-surface-soft/70 p-4">
          <p className="eyebrow mb-2">Send a test message</p>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <input className="input" placeholder="Mobile number" value={test.phone} onChange={(e) => setTest({ ...test, phone: e.target.value })} />
            <select
              className="input"
              value={test.template}
              onChange={(e) => setTest({ ...test, template: e.target.value, vars: {} })}
            >
              <option value="">Plain message (only if they wrote in the last 24 hours)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>Template: {t.name}</option>
              ))}
            </select>
          </div>

          {chosen ? (
            <div className="mt-2 space-y-2">
              <p className="rounded-lg bg-white px-3 py-2 text-xs text-ink-600">{chosen.body}</p>
              {chosen.params.map((p) => (
                <input
                  key={p}
                  className="input"
                  placeholder={`{{${p}}}`}
                  value={test.vars[p] || ''}
                  onChange={(e) => setTest({ ...test, vars: { ...test.vars, [p]: e.target.value } })}
                />
              ))}
            </div>
          ) : (
            <input className="input mt-2" placeholder="Message" value={test.text} onChange={(e) => setTest({ ...test, text: e.target.value })} />
          )}

          <div className="mt-2 flex justify-end">
            <button className="btn-action" onClick={sendTest} disabled={sending || !ready}>
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
