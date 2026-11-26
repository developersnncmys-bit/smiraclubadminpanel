import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';

/**
 * The 6-day WhatsApp follow-up for new leads: which approved template goes
 * on which day and at what time, and a switch to run it. The server does the
 * sending (helpers/followupDrip.js); this only sets it up.
 */
export default function FollowupDrip() {
  const { toast } = useApp();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState('');

  useEffect(() => {
    if (!isLive) return;
    api.get('/automations/followup')
      .then((r) => { setData(r.data); setForm(r.data.config); })
      .catch((e) => setFailed(e.message || 'Could not load'));
    api.get('/whatsapp/gateway/templates').then((r) => setTemplates(r.data || [])).catch(() => setTemplates([]));
  }, []);

  if (failed) return <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 xl:col-span-2">{failed}</p>;
  if (!form) return <p className="flex items-center gap-2 p-4 text-sm text-ink-500 xl:col-span-2"><Loader2 size={16} className="animate-spin" /> Loading…</p>;

  const setDay = (i, patch) => setForm({ ...form, days: form.days.map((d, j) => (j === i ? { ...d, ...patch } : d)) });
  const byName = new Map(templates.map((t) => [t.name, t]));
  const unset = form.days.filter((d) => !d.template).length;

  const save = async (enabled = form.enabled) => {
    setSaving(true);
    try {
      const r = await api.put('/automations/followup', { ...form, enabled });
      setData(r.data);
      setForm(r.data.config);
      toast(enabled ? '6-day follow-up is on for new leads' : '6-day follow-up saved');
    } catch (e) {
      toast(`Not saved: ${e.message || 'try again'}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const c = data?.counts || {};
  return (
    <div className="space-y-4 xl:col-span-2">
      <section className="rounded-2xl border border-ink-900/[0.07] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-extrabold text-ink-900">6-day WhatsApp follow-up</h3>
            <p className="mt-1 max-w-2xl text-sm text-ink-600">
              Every new lead gets one WhatsApp a day for 6 days, automatically. It stops by itself when the lead is
              Won, Lost or Not interested, becomes a customer, has an active membership, or replies <b>STOP</b>.
              Leads already in the CRM and imported leads are not included.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(!form.enabled)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${form.enabled ? 'bg-emerald-600 text-white' : 'bg-ink-900/[0.06] text-ink-700'}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${form.enabled ? 'bg-white' : 'bg-ink-400'}`} />
            {form.enabled ? 'On' : 'Off'} — {form.enabled ? 'tap to switch off' : 'tap to switch on'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[['In progress', c.running], ['Finished all 6 days', c.finished], ['Stopped early', c.stopped], ['Messaged today', c.sentToday]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-surface-soft p-3">
              <p className="text-xs text-ink-500">{k}</p>
              <p className="num text-xl font-extrabold text-ink-900">{v ?? 0}</p>
            </div>
          ))}
        </div>

        {unset > 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            <AlertTriangle size={14} className="mt-px shrink-0" />
            {unset} day(s) have no template yet — those days are skipped. Create the templates in AdsEra; once Meta approves them they appear in the lists below.
          </p>
        )}
      </section>

      <ol className="space-y-3">
        {form.days.map((d, i) => {
          const t = byName.get(d.template);
          return (
            <li key={d.day} className="rounded-2xl border border-ink-900/[0.07] bg-white p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700">D{d.day}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink-900">Day {d.day} · {d.title}</p>
                  <p className="text-xs text-ink-500">
                    {d.day === 1 && !d.at ? 'Goes as soon as the lead comes in (9 AM – 9:30 PM)' : `Goes at ${d.at || '—'} on day ${d.day}`}
                  </p>
                </div>
                <select className="input h-10 w-full py-0 text-sm sm:w-64" value={d.template} onChange={(e) => setDay(i, { template: e.target.value })}>
                  <option value="">No template — skip this day</option>
                  {d.template && !t && <option value={d.template}>{d.template} (not approved yet)</option>}
                  {templates.map((x) => <option key={x.id} value={x.name}>{x.name.replace(/_/g, ' ')}</option>)}
                </select>
                <label className="flex items-center gap-2 text-xs font-semibold text-ink-600">
                  Time
                  <input
                    type="time"
                    className="input h-10 w-32 py-0 text-sm"
                    value={d.at || ''}
                    onChange={(e) => setDay(i, { at: e.target.value })}
                  />
                </label>
              </div>
              {t && (
                <div className="mt-3 rounded-lg bg-[#EFEAE2] p-3">
                  <p className="w-fit max-w-full whitespace-pre-wrap rounded-lg bg-[#D9FDD3] px-3 py-2 text-[13px] text-ink-900 shadow-sm">{t.body}</p>
                  {t.params.some((p) => !/name|^1$/i.test(p)) && (
                    <p className="mt-2 text-xs font-semibold text-amber-800">
                      This template has blanks other than the name ({t.params.filter((p) => !/name|^1$/i.test(p)).join(', ')}) — they will be sent as “-”. Use a template that only asks for the name.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <MessageCircle size={13} /> Each message sent shows in the lead’s activity and WhatsApp chat. Nothing is sent between 9:30 PM and 9 AM.
        </p>
        <button className="btn-action" disabled={saving} onClick={() => save()}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save
        </button>
      </div>
    </div>
  );
}
