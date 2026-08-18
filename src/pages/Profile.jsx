import { useState } from 'react';
import { Save, ShieldCheck, LogOut, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useApp, phoneDigits } from '../store/AppStore.jsx';

/** Field row shared by the two forms on this page. */
function Field({ label, help, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {help && <p className="mt-1.5 text-xs text-ink-400">{help}</p>}
    </div>
  );
}

/**
 * The signed-in person's own account: their details, the signature that goes
 * on quotations, and what the panel is allowed to interrupt them for.
 */
export default function Profile() {
  const navigate = useNavigate();
  const { auth, team, update, signOut, toast } = useApp();

  // The signed-in phone identifies which team record is "me".
  const me = team.find((t) => phoneDigits(t.phone) === phoneDigits(auth?.phone || '')) || team[0];

  const [form, setForm] = useState({
    name: me?.name || auth?.name || '',
    role: me?.role || auth?.role || '',
    email: me?.email || '',
    phone: me?.phone || auth?.phone || '',
    signature: me?.signature || `${(me?.name || '').split(' ')[0]} · Smira Club Pvt. Ltd.`,
  });
  const [alerts, setAlerts] = useState({
    enquiry: true,
    payment: true,
    departure: true,
    digest: false,
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (!me) return;
    update('team', me.id, form, { message: 'Your profile is saved' });
  };

  const alertLabels = {
    enquiry: 'A new enquiry lands on my desk',
    payment: 'A payment comes in',
    departure: 'A trip I own departs within a week',
    digest: 'A weekly summary of my numbers',
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Your own account details and alerts">
        <button className="btn-primary" onClick={save}>
          <Save size={16} /> Save changes
        </button>
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Details */}
        <section className="card p-6">
          <div className="flex flex-wrap items-center gap-4 border-b border-ink-900/[0.07] pb-5">
            <span className="relative">
              <Avatar name={form.name} size="lg" />
              <button
                onClick={() => toast('Photo upload comes with the file storage work', 'info')}
                title="Change photo"
                className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-ink-900/10 bg-white text-ink-500 shadow-xs hover:text-brand-700"
              >
                <Camera size={12} />
              </button>
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold text-ink-900">{form.name}</p>
              <p className="text-sm text-ink-500">{form.role}</p>
            </div>
            <Badge tone="green" dot className="ml-auto">
              Signed in
            </Badge>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Role">
              <input className="input" value={form.role} onChange={(e) => set('role', e.target.value)} />
            </Field>
            <Field label="Email">
              <input className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Phone" help="This is the number you sign in with.">
              <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Signature on quotations" help="Printed at the end of every proposal you send.">
                <textarea
                  className="input min-h-[80px] resize-y"
                  value={form.signature}
                  onChange={(e) => set('signature', e.target.value)}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Alerts and security */}
        <div className="space-y-5">
          <section className="card p-5">
            <p className="eyebrow">Alerts</p>
            <h2 className="mt-1 font-display text-base font-extrabold text-ink-900">Tell me when</h2>

            <ul className="mt-4 space-y-2">
              {Object.entries(alertLabels).map(([key, label]) => (
                <li key={key}>
                  <button
                    onClick={() => setAlerts((a) => ({ ...a, [key]: !a[key] }))}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-soft"
                  >
                    <span
                      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                        alerts[key] ? 'bg-brand-600' : 'bg-ink-900/15'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                          alerts[key] ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-ink-700">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Security</p>
            <h2 className="mt-1 font-display text-base font-extrabold text-ink-900">Sign-in</h2>

            <p className="mt-3 flex items-center gap-2.5 rounded-xl bg-surface-soft px-3.5 py-3 text-sm text-ink-700">
              <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
              You sign in with a one-time password sent to {form.phone}.
            </p>

            <button
              className="btn-ghost mt-3 w-full justify-center"
              onClick={() => toast('A verification code would be sent to your new number', 'info')}
            >
              Change sign-in number
            </button>
            <button
              className="btn-ghost mt-2 w-full justify-center text-rose-600 hover:text-rose-700"
              onClick={() => {
                signOut();
                navigate('/login', { replace: true });
              }}
            >
              <LogOut size={15} /> Sign out
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
