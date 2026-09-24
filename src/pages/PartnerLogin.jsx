import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, KeyRound, Loader2, Smartphone, Handshake, ShieldCheck, UserPlus } from 'lucide-react';
import Brand from '../components/ui/Brand.jsx';
import { partnerApi, getPartnerToken, setPartnerToken, partnerLive } from '../lib/partnerApi.js';

/**
 * Partner sign-in.
 *
 * Its own page rather than a switch on the staff one, because the two lead to
 * different places and a hotelier should never land on a screen full of leads
 * and payroll they were never meant to see. The shape is the staff sign-in's —
 * number, then code — so anyone who has used one knows the other.
 */

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

/** The partners the live API knows, so a demo has somewhere to start. */
const DEMO_PARTNERS = [
  { phone: '+91 98450 11201', label: 'Ayana Resort & Spa' },
];

const CATEGORIES = ['Hotel', 'Villa', 'Package', 'Lifestyle', 'Transport', 'Restaurant', 'Activity', 'Spa'];

const FIELD = 'w-full rounded-xl border border-ink-900/10 px-3.5 py-2.5 text-sm font-medium text-ink-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100';

/** A labelled box on the registration form. */
function Ask({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

/**
 * Registering, which is a form and not a code.
 *
 * A property is registered by telling us about the property — asking only for
 * a mobile number first told us nothing and made an empty account. The desk
 * gets the application straight away, and the five steps come afterwards,
 * once they sign in with the number they gave here.
 */
function RegisterCard({ form, field, onSubmit, busy, error, applied, onSignIn }) {
  if (applied) {
    return (
      <div className="pt-2">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50">
          <CheckCircle2 size={24} className="text-emerald-600" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
          {form.name} is registered
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Our partnerships desk has your application. Sign in with{' '}
          <span className="font-bold text-ink-800">+91 {form.phone}</span> to fill in your property
          over five short steps — we will text you a code.
        </p>
        <button type="button" onClick={onSignIn} className="btn-action mt-6 w-full py-3">
          <ArrowRight size={16} /> Sign in and continue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
        Register your property
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Tell us about the property. The full listing — rooms, rates, photos and papers — comes
        after, in five short steps.
      </p>

      <div className="mt-6 space-y-3.5">
        <Ask label="Property name" required>
          <input value={form.name} onChange={field('name')} placeholder="Ayana Resort & Spa" className={FIELD} autoFocus />
        </Ask>

        <div className="grid grid-cols-2 gap-3">
          <Ask label="Kind">
            <select value={form.category} onChange={field('category')} className={FIELD}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Ask>
          <Ask label="Rooms or units">
            <input value={form.rooms} onChange={field('rooms')} inputMode="numeric" placeholder="24" className={`num ${FIELD}`} />
          </Ask>
        </div>

        <Ask label="Where it is">
          <input value={form.location} onChange={field('location')} placeholder="Baga, Goa" className={FIELD} />
        </Ask>

        <Ask label="Who we speak to">
          <input value={form.contact} onChange={field('contact')} placeholder="Name of the person in charge" className={FIELD} />
        </Ask>

        <Ask label="Mobile number" required>
          <span className="flex overflow-hidden rounded-xl border border-ink-900/10 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
            <span className="flex items-center gap-1.5 border-r border-ink-900/10 bg-surface-soft px-3 text-sm font-bold text-ink-700">
              <Smartphone size={15} className="text-ink-400" /> +91
            </span>
            <input
              value={form.phone}
              onChange={field('phone')}
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit mobile number"
              className="num min-w-0 flex-1 border-0 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none"
            />
          </span>
          <span className="mt-1 block text-[11px] text-ink-400">
            This is how you will sign in, so use a number you can take a code on.
          </span>
        </Ask>

        <Ask label="Email">
          <input value={form.email} onChange={field('email')} type="email" placeholder="bookings@yourproperty.com" className={FIELD} />
        </Ask>
      </div>

      {error && <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p>}

      <button type="submit" disabled={busy || !partnerLive} className="btn-action mt-5 w-full py-3">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        {busy ? 'Registering…' : 'Register property'}
      </button>

      <p className="mt-4 text-center text-xs text-ink-500">
        Already a partner?{' '}
        <button type="button" onClick={onSignIn} className="font-semibold text-brand-700 hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}

export default function PartnerLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  /** Signing in and registering are asked for separately, never guessed. */
  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [devCode, setDevCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  /** Set when the number is simply not one of ours, so we can offer the way on. */
  const [unknown, setUnknown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const boxes = useRef([]);

  const registering = mode === 'register';

  /** What registering asks for. The five steps come after, once signed in. */
  const [form, setForm] = useState({
    name: '', category: 'Hotel', location: '', contact: '', phone: '', email: '', rooms: '',
  });
  const [applied, setApplied] = useState(false);
  const field = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value }));
    setError('');
  };

  const register = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return setError('Tell us the property name');
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setError('Enter a 10-digit mobile number');
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      return setError('That email does not look right');
    }
    setError('');
    setBusy(true);
    try {
      await partnerApi.apply({
        name: form.name.trim(),
        category: form.category,
        location: form.location.trim(),
        contact: form.contact.trim(),
        phone: `+91 ${form.phone}`,
        whatsapp: `+91 ${form.phone}`,
        email: form.email.trim(),
        rooms: Number(form.rooms) || 0,
      });
      setApplied(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const validPhone = /^[6-9]\d{9}$/.test(phone);
  const code = otp.join('');

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Already signed in as a partner: straight to the portal.
  if (getPartnerToken()) return <Navigate to="/partner" replace />;

  const send = async (e) => {
    e?.preventDefault();
    if (!validPhone) {
      setError('Enter a 10-digit mobile number');
      return;
    }
    setError('');
    setUnknown(false);
    setBusy(true);
    try {
      const res = await partnerApi.requestOtp(phone, mode);
      setName(res.data?.name || '');
      setDevCode(res.data?.devCode || '');
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setSeconds(RESEND_SECONDS);
      setTimeout(() => boxes.current[0]?.focus(), 60);
    } catch (err) {
      setError(err.message);
      // Not one of ours: say so, and put Register right under it.
      setUnknown(!registering && err.status === 404);
    } finally {
      setBusy(false);
    }
  };

  /** Switching doors carries the number across, whichever way it is going. */
  const swap = (to) => {
    if (to === 'register') setForm((f) => ({ ...f, phone: f.phone || phone }));
    else setPhone((p) => p || form.phone);
    setMode(to);
    setStep('phone');
    setError('');
    setUnknown(false);
    setApplied(false);
    setDevCode('');
  };

  const verify = async (e) => {
    e?.preventDefault();
    if (code.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code`);
      return;
    }
    setError('');
    setBusy(true);
    try {
      const res = await partnerApi.verifyOtp(phone, code, mode);
      setPartnerToken(res.token);
      navigate('/partner', { replace: true });
    } catch (err) {
      setError(err.message);
      setOtp(Array(OTP_LENGTH).fill(''));
      boxes.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  const setDigit = (i, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!digits) return;
    e.preventDefault();
    setOtp(Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] || ''));
    boxes.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-surface-soft px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-7 flex justify-center">
          <Brand className="h-12" />
        </div>

        <div className="card p-7 sm:p-9">
          <span className="chip bg-brand-50 text-brand-700">
            <Handshake size={13} /> Partner portal
          </span>

          {registering ? (
            <RegisterCard
              form={form}
              field={field}
              onSubmit={register}
              busy={busy}
              error={error}
              applied={applied}
              onSignIn={() => swap('login')}
            />
          ) : step === 'phone' ? (
            <form onSubmit={send} noValidate>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
                Partner sign in
              </h1>
              <p className="mt-1.5 text-sm text-ink-500">
                Use the mobile number your property is registered with.
              </p>

              <label className="mt-6 block">
                <span className="mb-1.5 block text-xs font-bold text-ink-700">Mobile number</span>
                <span className="flex overflow-hidden rounded-xl border border-ink-900/10 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
                  <span className="flex items-center gap-1.5 border-r border-ink-900/10 bg-surface-soft px-3 text-sm font-bold text-ink-700">
                    <Smartphone size={15} className="text-ink-400" /> +91
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setError('');
                      setUnknown(false);
                    }}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10-digit mobile number"
                    className="num min-w-0 flex-1 border-0 bg-white px-3.5 py-3 text-[15px] font-semibold text-ink-900 outline-none"
                    autoFocus
                  />
                </span>
              </label>

              {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

              {/* Turned away at the sign-in door: the way on, right here. */}
              {unknown && (
                <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3.5">
                  <p className="text-xs font-semibold text-ink-700">
                    New to Smira? Register your property and we will take you through it in five
                    short steps.
                  </p>
                  <button
                    type="button"
                    onClick={() => swap('register')}
                    className="btn-action btn-sm mt-2.5"
                  >
                    <UserPlus size={14} /> Register
                  </button>
                </div>
              )}

              <button type="submit" disabled={busy || !partnerLive} className="btn-action mt-5 w-full py-3">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {busy ? 'Sending code…' : 'Send code'}
              </button>

              <p className="mt-4 text-center text-xs text-ink-500">
                Not registered yet?{' '}
                <button
                  type="button"
                  onClick={() => swap('register')}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Register your property
                </button>
              </p>

              <div className="mt-6 rounded-xl bg-surface-soft p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  Demo partners
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DEMO_PARTNERS.map((p) => (
                    <button
                      key={p.phone}
                      type="button"
                      onClick={() => {
                        setPhone(p.phone.replace(/\D/g, '').slice(-10));
                        setError('');
                      }}
                      className="rounded-lg bg-white px-2.5 py-1.5 text-left text-xs font-semibold text-ink-700 shadow-card transition hover:text-brand-700"
                    >
                      <span className="num block">{p.phone}</span>
                      <span className="block text-[10px] font-medium text-ink-400">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={verify} noValidate>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
                {name ? `Welcome back, ${name}` : 'Enter your code'}
              </h1>
              <p className="mt-1.5 text-sm text-ink-500">
                Sent to <span className="font-bold text-ink-800">+91 {phone}</span>.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError('');
                  }}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Change
                </button>
              </p>

              <div className="mt-6 flex justify-between gap-2" onPaste={onPaste}>
                {otp.map((d, i) => (
                  <input
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    ref={(el) => (boxes.current[i] = el)}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) boxes.current[i - 1]?.focus();
                    }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${i + 1}`}
                    className="num h-12 w-full rounded-xl border border-ink-900/10 text-center text-lg font-extrabold text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                ))}
              </div>

              {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

              <div className="mt-4 flex items-center justify-between text-xs">
                {devCode ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink-500">
                    <KeyRound size={13} className="text-brand-600" />
                    No SMS yet — code:{' '}
                    <span className="font-extrabold tracking-widest text-brand-700">{devCode}</span>
                  </span>
                ) : (
                  <span className="font-semibold text-ink-400">Sent to +91 {phone}</span>
                )}
                {seconds > 0 ? (
                  <span className="font-semibold text-ink-400">Resend in {seconds}s</span>
                ) : (
                  <button type="button" onClick={send} className="font-semibold text-brand-700 hover:underline">
                    Resend code
                  </button>
                )}
              </div>

              <button type="submit" disabled={busy} className="btn-action mt-5 w-full py-3">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {busy ? 'Checking…' : 'Sign in'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Smira staff?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in to the admin panel
          </Link>
        </p>
      </div>
    </div>
  );
}
