import { useState } from 'react';
import {
  Building2,
  Bell,
  Plug,
  CreditCard,
  ShieldCheck,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp } from '../store/AppStore.jsx';

const tabs = [
  { key: 'agency', label: 'Agency profile', icon: Building2 },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'billing', label: 'Plan & billing', icon: CreditCard },
  { key: 'security', label: 'Security', icon: ShieldCheck },
];

const integrationCopy = {
  'WhatsApp Business API': 'Send itineraries and payment reminders',
  Razorpay: 'Collect advance and balance payments online',
  'Amadeus GDS': 'Live flight availability and fares',
  'Google Calendar': 'Sync departures and follow-up tasks',
  Tally: 'Push invoices into your accounting books',
};

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-brand-600' : 'bg-ink-900/15'}`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { settings, saveSettings, resetDemo, toast } = useApp();
  const [tab, setTab] = useState('agency');
  const [agency, setAgency] = useState(settings.agency);
  const [resetOpen, setResetOpen] = useState(false);

  const setNotification = (key, value) =>
    saveSettings({ notifications: { ...settings.notifications, [key]: value } });

  const setSecurity = (key, value) =>
    saveSettings({ security: { ...settings.security, [key]: value } });

  const toggleIntegration = (name) => {
    const next = !settings.integrations[name];
    saveSettings({ integrations: { ...settings.integrations, [name]: next } });
    toast(next ? `${name} connected` : `${name} disconnected`, next ? 'success' : 'info');
  };

  const saveAll = () => {
    saveSettings({ agency });
    toast('Settings saved');
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure the workspace for your agency">
        <button className="btn-ghost" onClick={() => setResetOpen(true)}>
          <RotateCcw size={16} /> Reset demo data
        </button>
        <button className="btn-primary" onClick={saveAll}>
          <Save size={16} /> Save changes
        </button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="card h-fit p-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                tab === key ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-surface-soft'
              }`}
            >
              <Icon size={17} strokeWidth={2.2} />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {tab === 'agency' && (
            <Card title="Agency profile" subtitle="Appears on quotations, invoices and vouchers">
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  ['name', 'Agency name'],
                  ['email', 'Contact email'],
                  ['phone', 'Phone'],
                  ['gstin', 'GSTIN'],
                  ['licence', 'IATA / licence no.'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="label" htmlFor={key}>
                      {label}
                    </label>
                    <input
                      id={key}
                      className="input"
                      value={agency[key]}
                      onChange={(e) => setAgency({ ...agency, [key]: e.target.value })}
                    />
                  </div>
                ))}

                <div>
                  <label className="label" htmlFor="currency">
                    Default currency
                  </label>
                  <select
                    id="currency"
                    className="input"
                    value={agency.currency}
                    onChange={(e) => setAgency({ ...agency, currency: e.target.value })}
                  >
                    <option>INR — Indian Rupee</option>
                    <option>USD — US Dollar</option>
                    <option>AED — UAE Dirham</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="label" htmlFor="address">
                    Registered address
                  </label>
                  <textarea
                    id="address"
                    className="input min-h-[92px] resize-y"
                    value={agency.address}
                    onChange={(e) => setAgency({ ...agency, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-ink-900/[0.07] pt-5">
                <button className="btn-ghost" onClick={() => setAgency(settings.agency)}>
                  Discard
                </button>
                <button className="btn-primary" onClick={saveAll}>
                  <Save size={16} /> Save profile
                </button>
              </div>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card title="Notifications" subtitle="Choose what the team gets alerted about">
              <ul className="divide-y divide-ink-900/[0.07]">
                {[
                  ['newEnquiry', 'New enquiry received', 'Ping the assigned consultant instantly'],
                  ['payment', 'Payment received', 'Alert accounts when money lands'],
                  ['departure', 'Departure reminders', '72 hours before every trip starts'],
                  ['digest', 'Daily email digest', 'Morning summary of pipeline and tasks'],
                  ['marketing', 'Campaign performance', 'Weekly rollup of campaign results'],
                ].map(([key, title, desc]) => (
                  <li key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{title}</p>
                      <p className="text-xs text-ink-500">{desc}</p>
                    </div>
                    <Toggle on={settings.notifications[key]} onChange={(v) => setNotification(key, v)} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {tab === 'integrations' && (
            <Card title="Integrations" subtitle="Connect the tools your agency already runs on">
              <ul className="divide-y divide-ink-900/[0.07]">
                {Object.entries(settings.integrations).map(([name, connected]) => (
                  <li key={name} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-soft text-ink-600">
                      <Plug size={18} />
                    </span>
                    <div className="min-w-[180px] flex-1">
                      <p className="text-sm font-bold text-ink-900">{name}</p>
                      <p className="text-xs text-ink-500">{integrationCopy[name]}</p>
                    </div>
                    {connected ? (
                      <div className="flex items-center gap-2">
                        <Badge tone="green" dot>
                          <Check size={12} /> Connected
                        </Badge>
                        <button
                          className="btn-ghost py-2 text-xs"
                          onClick={() => toggleIntegration(name)}
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button className="btn-soft py-2 text-xs" onClick={() => toggleIntegration(name)}>
                        Connect
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {tab === 'billing' && (
            <Card title="Plan & billing" subtitle="Your current subscription">
              <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-ocean p-6 text-white">
                <Badge className="bg-white/20 text-white">Current plan</Badge>
                <p className="mt-3 font-display text-3xl font-extrabold">Growth</p>
                <p className="mt-1 text-sm text-white/80">
                  ₹4,999 / month · 10 consultant seats · unlimited enquiries
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700"
                    onClick={() => toast('Upgrade request sent — our team will call you today', 'info')}
                  >
                    Upgrade to Ultimate
                  </button>
                  <button
                    className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur"
                    onClick={() => toast('Billing history emailed to ' + agency.email, 'info')}
                  >
                    Billing history
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  ['Seats used', '6 / 10'],
                  ['Next invoice', '01 Sep 2026'],
                  ['Storage', '4.2 GB / 25 GB'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-ink-900/[0.07] bg-surface-soft/60 px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{k}</p>
                    <p className="mt-1 font-display text-lg font-extrabold text-ink-900">{v}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'security' && (
            <Card title="Security" subtitle="Protect customer data and payment records">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="pwd-current">
                    Current password
                  </label>
                  <input id="pwd-current" type="password" className="input" placeholder="••••••••••" />
                </div>
                <div>
                  <label className="label" htmlFor="pwd-new">
                    New password
                  </label>
                  <input id="pwd-new" type="password" className="input" placeholder="Enter a new password" />
                </div>
                <div className="sm:col-span-2">
                  <button className="btn-soft" onClick={() => toast('Password updated')}>
                    Update password
                  </button>
                </div>
              </div>

              <ul className="mt-5 divide-y divide-ink-900/[0.07] border-t border-ink-900/[0.07]">
                {[
                  ['twoFactor', 'Two-factor authentication', 'Require an OTP on every new device'],
                  ['restrictExport', 'Restrict export', 'Only owners can export customer lists'],
                  ['sessionTimeout', 'Session timeout', 'Sign out idle sessions after 30 minutes'],
                ].map(([key, title, desc]) => (
                  <li key={key} className="flex items-center gap-4 py-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{title}</p>
                      <p className="text-xs text-ink-500">{desc}</p>
                    </div>
                    <Toggle on={settings.security[key]} onChange={(v) => setSecurity(key, v)} />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetDemo}
        title="Reset demo data?"
        message="Every record you added or edited is discarded and the original demo dataset comes back."
        confirmLabel="Reset everything"
      />
    </>
  );
}
