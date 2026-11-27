import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, XCircle } from 'lucide-react';
import { api, isLive } from '../../lib/api.js';
import { useApp } from '../../store/AppStore.jsx';

const NUMBER = '919833733477';

/** How every lead's source is captured, the Meta connection, and a link maker for Ref codes. */
export default function LeadSources() {
  const { toast, enquiries } = useApp();
  const [meta, setMeta] = useState(null);
  const [code, setCode] = useState('QR-EXPO');
  const [text, setText] = useState('Hi Smira Club, I would like to know more.');

  useEffect(() => {
    if (isLive) api.get('/meta/status').then((r) => setMeta(r.data)).catch(() => setMeta(null));
  }, []);

  const clean = code.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 30);
  const link = `https://wa.me/${NUMBER}?text=${encodeURIComponent(`${text.trim()} (Ref: ${clean})`)}`;
  const copy = (v) => navigator.clipboard?.writeText(v).then(() => toast('Copied'));

  const counts = {};
  (enquiries || []).forEach((l) => { counts[l.source || 'Other'] = (counts[l.source || 'Other'] || 0) + 1; });
  const metaReady = meta && meta.verifyToken && meta.appSecret && meta.pageToken;

  const rows = [
    ['Facebook / Instagram ad → WhatsApp', 'Facebook Ads / Instagram', 'Meta’s ad details on the first message (ad headline becomes the campaign). If those are missing, Meta’s standard greeting “Can I get more info on this?” still marks it Facebook Ads.'],
    ['Facebook / Instagram lead form', 'Facebook Ads / Instagram', 'Straight from Meta, with the campaign and ad name and every answer — once the Meta connection below is set up.'],
    ['Website WhatsApp button', 'Website', 'The button sends “(Ref: WEB)” in the message.'],
    ['Website enquiry forms', 'Website', 'Filed by the website as it always has.'],
    ['Form messages (“*Response* #10548”)', 'Website', 'The form’s title becomes the campaign; name, email, dates, adults, kids and rooms fill the lead.'],
    ['QR codes, posters, other links', 'Campaign (or by prefix)', 'Make a link below. Codes starting WEB → Website, FB → Facebook Ads, IG → Instagram, GOOGLE → Google Ads, REF → Referral; anything else → Campaign.'],
    ['Somebody who saved the number', 'WhatsApp', 'Nothing says where they came from, so it stays WhatsApp (direct).'],
  ];

  return (
    <div className="space-y-4 xl:col-span-2">
      <section className="rounded-2xl border border-ink-900/[0.07] bg-white p-5">
        <h3 className="font-display text-lg font-extrabold text-ink-900">Where leads come from</h3>
        <p className="mt-1 text-sm text-ink-600">Every new lead is given its real source and campaign automatically. Leads → Lead lists → By source shows them.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs text-ink-500"><th className="py-2 pr-3">They came from</th><th className="py-2 pr-3">Source on the lead</th><th className="py-2">How it is known</th></tr></thead>
            <tbody className="divide-y divide-ink-900/[0.06]">
              {rows.map(([a, b, c]) => (
                <tr key={a}><td className="py-2.5 pr-3 font-semibold text-ink-900">{a}</td><td className="py-2.5 pr-3"><span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{b}</span></td><td className="py-2.5 text-ink-600">{c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {Object.keys(counts).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(counts).sort((x, y) => y[1] - x[1]).map(([s, n]) => (
              <span key={s} className="rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-ink-700">{s} <b className="num">{n}</b></span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-ink-900/[0.07] bg-white p-5">
        <h3 className="font-display text-lg font-extrabold text-ink-900">Facebook &amp; Instagram lead forms (Meta)</h3>
        <ul className="mt-3 space-y-1.5 text-sm">
          {[['Verify word (META_VERIFY_TOKEN)', meta?.verifyToken], ['App secret (META_APP_SECRET)', meta?.appSecret], ['Page token (META_PAGE_TOKEN)', meta?.pageToken]].map(([k, ok]) => (
            <li key={k} className="flex items-center gap-2">
              {ok ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-rose-500" />}
              <span className={ok ? 'text-ink-800' : 'text-ink-500'}>{k}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-600">
          {metaReady ? 'Connected settings are in place. ' : 'Not connected yet. '}
          Webhook address for Meta:
        </p>
        <div className="mt-1 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-soft px-3 py-2 text-xs">{meta?.webhookUrl || 'https://api.smiraclub.com/api/meta/webhook'}</code>
          <button className="btn-line btn-sm" onClick={() => copy(meta?.webhookUrl || 'https://api.smiraclub.com/api/meta/webhook')}><Copy size={13} /> Copy</button>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-900/[0.07] bg-white p-5">
        <h3 className="font-display text-lg font-extrabold text-ink-900">Make a WhatsApp link with a Ref code</h3>
        <p className="mt-1 text-sm text-ink-600">For a QR code, poster, Google ad, YouTube description or an influencer — each code shows as its own campaign.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr]">
          <label className="text-xs font-semibold text-ink-600">Ref code
            <input className="input mt-1 uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="QR-EXPO" />
          </label>
          <label className="text-xs font-semibold text-ink-600">Message they send
            <input className="input mt-1" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-soft px-3 py-2 text-xs">{link}</code>
          <button className="btn-action btn-sm" disabled={!clean} onClick={() => copy(link)}><Copy size={13} /> Copy link</button>
        </div>
      </section>
    </div>
  );
}
