import { useEffect, useRef, useState } from 'react';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';
import WhatsAppIcon from '../ui/WhatsAppIcon.jsx';

const DAY = 24 * 60 * 60 * 1000;
const TEMPLATE_TAG = /^\[Template "([^"]*)"\]\s*/;

/**
 * The lead's WhatsApp, as a chat: their messages on the left, the desk's on
 * the right, each the size of what it says.
 *
 * WhatsApp lets a typed message reach somebody only within 24 hours of their
 * last message. Past that (or before they have ever written) only an
 * approved template goes, so the box below switches to the templates and
 * says why — a typed message there used to look sent and never arrive.
 */
export default function LeadWhatsApp({ lead, thread, logged }) {
  const { update, toast, logActivity } = useApp();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [useTemplate, setUseTemplate] = useState(false);
  const [chosenId, setChosenId] = useState('');
  const [vars, setVars] = useState({});
  const bottom = useRef(null);

  const first = String(lead.name || '').split(' ')[0] || 'them';

  // One list, oldest first: the inbox thread when there is one, else what
  // was logged on the lead. A template the CRM sent and the same message
  // read back from AdsEra show once.
  const raw = thread
    ? (thread.messages || []).map((m) => {
        const tag = String(m.text || '').match(TEMPLATE_TAG);
        return { ...m, text: tag ? m.text.slice(tag[0].length) : m.text, templateName: m.templateName || tag?.[1] };
      })
    : logged.map((a) => ({ from: 'me', text: String(a.text).replace(/^WhatsApp:\s*/, ''), at: a.at, byName: a.who }));
  const messages = raw.filter((m, i) => {
    const next = raw[i + 1];
    return !(next && m.from !== 'them' && next.from !== 'them' && next.text === m.text && (m.templateName || next.templateName));
  });

  const lastIn = thread ? [...(thread.messages || [])].reverse().find((m) => m.from === 'them') : null;
  const lastInAt = lastIn ? new Date(lastIn.atIso || lastIn.at).getTime() : 0;
  const windowOpen = Boolean(lastInAt && Date.now() - lastInAt < DAY);
  const templateMode = useTemplate || !windowOpen;

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  // The approved templates, once, when they are needed.
  useEffect(() => {
    if (!templateMode || templates || !isLive) return;
    api.get('/whatsapp/gateway/templates').then((r) => setTemplates(r.data || [])).catch(() => setTemplates([]));
  }, [templateMode, templates]);

  const chosen = (templates || []).find((t) => t.id === chosenId) || null;
  const filled = chosen
    ? chosen.params.reduce((s, p) => s.split(`{{${p}}}`).join(vars[p] || `{{${p}}}`), chosen.body || chosen.name)
    : '';
  const ready = templateMode ? chosen && chosen.params.every((p) => String(vars[p] || '').trim()) : text.trim();

  const addToThread = (entry) => {
    if (thread) update('conversations', thread.id, { messages: [...(thread.messages || []), entry], lastAt: 'just now' }, { silent: true });
  };

  const send = async () => {
    if (!ready || sending) return;
    setSending(true);
    const body = templateMode ? filled : text.trim();
    try {
      let delivered = true;
      let problem = '';
      if (thread?._id) {
        const r = await api.post(`/whatsapp/conversations/${thread._id}/reply`, templateMode
          ? { text: body, template: chosen.id, templateName: chosen.name, vars }
          : { text: body });
        delivered = r.delivered !== false;
        problem = r.message || '';
      } else if (templateMode) {
        await api.post('/whatsapp/gateway/send-template', { phone: lead.phone, template: chosen.id, vars });
      } else {
        await api.post('/whatsapp/gateway/send', { phone: lead.phone, text: body });
      }
      addToThread({
        from: 'me', text: body, at: 'just now', atIso: new Date().toISOString(),
        templateName: templateMode ? chosen.name : undefined,
        ...(delivered ? {} : { failed: true, error: problem }),
      });
      if (!delivered) throw new Error(problem || 'WhatsApp did not take the message');
      logActivity(lead.id, `WhatsApp${templateMode ? ` (${chosen.name})` : ''}: ${body}`, 'whatsapp');
      toast(`WhatsApp sent to ${lead.name}`);
      setText('');
      setVars({});
    } catch (err) {
      toast(`Not sent: ${err.message || 'try again'}`, 'danger');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto rounded-xl bg-[#EFEAE2] p-3">
        {messages.map((m, i) => {
          const mine = m.from !== 'them';
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`w-fit max-w-[78%] rounded-lg px-2.5 py-1.5 shadow-sm ${
                  m.failed ? 'bg-rose-50 ring-1 ring-rose-200' : mine ? 'rounded-tr-none bg-[#D9FDD3]' : 'rounded-tl-none bg-white'
                }`}
              >
                {m.templateName && (
                  <span className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    <FileText size={10} /> {m.templateName.replace(/_/g, ' ')}
                  </span>
                )}
                <p className="whitespace-pre-wrap break-words text-[13.5px] leading-snug text-ink-900">{m.text}</p>
                <p className="mt-0.5 text-right text-[10.5px] text-ink-400">
                  {mine ? (m.from === 'bot' ? 'Bot' : m.byName || 'Desk') : first} · {m.at}
                </p>
                {m.failed && (
                  <p className="mt-0.5 flex items-start gap-1 text-[11px] font-semibold text-rose-600">
                    <AlertCircle size={12} className="mt-px shrink-0" /> Not delivered{m.error ? ` — ${m.error}` : ''}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="py-10 text-center text-sm text-ink-500">No WhatsApp messages with {lead.name} yet.</p>}
        <div ref={bottom} />
      </div>

      <div className="mt-3 space-y-2">
        {!windowOpen && (
          <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            <AlertCircle size={14} className="mt-px shrink-0" />
            {lastIn
              ? `${first} last wrote more than 24 hours ago. WhatsApp only lets an approved template through until they reply.`
              : `${first} has not written to your WhatsApp yet. WhatsApp only lets an approved template through until they do.`}
          </p>
        )}

        {templateMode ? (
          <div className="space-y-2">
            <select className="input h-10 py-0 text-sm" value={chosenId} onChange={(e) => { setChosenId(e.target.value); setVars({}); }}>
              <option value="">{templates ? 'Pick a template…' : 'Loading templates…'}</option>
              {(templates || []).map((t) => <option key={t.id} value={t.id}>{t.name.replace(/_/g, ' ')}</option>)}
            </select>
            {chosen && (
              <>
                {chosen.params.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {chosen.params.map((p) => (
                      <input
                        key={p}
                        className="input h-10 py-0 text-sm"
                        placeholder={p === '1' || /name/i.test(p) ? `{{${p}}} e.g. ${first}` : `{{${p}}}`}
                        value={vars[p] || ''}
                        onChange={(e) => setVars((v) => ({ ...v, [p]: e.target.value }))}
                      />
                    ))}
                  </div>
                )}
                <p className="whitespace-pre-wrap rounded-lg bg-[#D9FDD3] px-3 py-2 text-xs text-ink-800">{filled}</p>
              </>
            )}
          </div>
        ) : (
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${first}…`}
            className="input min-h-[44px] w-full resize-none"
          />
        )}

        <div className="flex items-center justify-between gap-2">
          {windowOpen ? (
            <button type="button" className="text-xs font-bold text-brand-700 hover:underline" onClick={() => setUseTemplate((u) => !u)}>
              {useTemplate ? 'Type a message instead' : 'Send a template instead'}
            </button>
          ) : <span />}
          <button
            type="button"
            onClick={send}
            disabled={!ready || sending || !lead.phone}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <WhatsAppIcon size={16} />} Send
          </button>
        </div>
      </div>
    </div>
  );
}
