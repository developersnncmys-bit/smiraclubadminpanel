import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Handshake,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from 'lucide-react';
import Brand from '../components/ui/Brand.jsx';
import { partnerApi, getPartnerToken, setPartnerToken, partnerLive } from '../lib/partnerApi.js';

/**
 * Partner sign-in and registration.
 *
 * Its own page rather than a switch on the staff one, because the two lead
 * to different places and a hotelier should never land on a screen full of
 * leads and payroll they were never meant to see.
 *
 * Two doors in, and two ways through each. A code to a phone suits somebody
 * registering from the front desk once; an email and a password suit the
 * person who opens this every morning. Both reach the same account.
 *
 * Registering asks only what identifies the business. The five-step listing
 * — rooms, photographs, rates, paperwork — comes afterwards in the portal,
 * because nobody fills in forty fields before they have an account to lose.
 */

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;
const PASSWORD_MIN = 8;

/** The website, where the terms a partner is accepting actually live. */
const SITE = import.meta.env?.VITE_WEBSITE_URL || 'https://smiraclubwebsite.vercel.app';

/** The categories the desk files a partner under. */
const CATEGORIES = ['Hotel', 'Villa', 'Package', 'Lifestyle', 'Transport', 'Restaurant', 'Activity', 'Spa'];

const HOW_IT_WORKS = [
  { title: 'Register your business', body: 'Name, number and where you are. Two minutes, and the account is yours.' },
  { title: 'Tell us about the property', body: 'Rooms, photographs, rates and paperwork, in five steps you can leave and come back to.' },
  { title: 'We check and approve', body: 'Our partnerships desk reviews it, asks anything it needs to, and puts you live.' },
  { title: 'Take bookings', body: 'Members find you on the Smira website and app. You see every booking here.' },
];

const FAQS = [
  {
    q: 'What does it cost to list?',
    a: 'Nothing to list. Smira earns a commission on confirmed bookings only, agreed with you before you go live.',
  },
  {
    q: 'How long does approval take?',
    a: 'Usually two working days once the five steps are complete and the paperwork is in.',
  },
  {
    q: 'Can I change my rates later?',
    a: 'Yes. Rates, availability and your own short offers are yours to change in the portal at any time.',
  },
  {
    q: 'Do I have to accept every booking?',
    a: 'No. You can pause bookings, block dates, and decline a request you cannot take.',
  },
  {
    q: 'When do I get paid?',
    a: 'After the guest has stayed, on the cycle in your agreement. Every payout is itemised in the portal.',
  },
];

/** A labelled box on the registration form. */
function Field({ label, hint, required, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ink-700">
        {label}
        {required && <span className="text-coral">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>
      )}
    </label>
  );
}

const EMPTY = {
  name: '',
  ownerName: '',
  phone: '',
  email: '',
  category: 'Hotel',
  city: '',
  address: '',
  website: '',
  password: '',
  terms: false,
};

const isEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || '').trim());
const isPhone = (v) => /^[6-9]\d{9}$/.test(String(v || '').replace(/\D/g, ''));

export default function PartnerLogin() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  /** Within signing in: a code to the phone, or an email and a password. */
  const [door, setDoor] = useState('otp');

  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [devCode, setDevCode] = useState('');
  const [name, setName] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});
  /** The code proving the number on the registration form. */
  const [regCode, setRegCode] = useState('');
  const [regSent, setRegSent] = useState(false);
  const [regDevCode, setRegDevCode] = useState('');

  const [error, setError] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const boxes = useRef([]);

  const registering = mode === 'register';
  const validPhone = isPhone(phone);
  const code = otp.join('');

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Already signed in as a partner: straight to the portal.
  if (getPartnerToken()) return <Navigate to="/partner" replace />;

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    setErrors((x) => ({ ...x, [k]: '' }));
  };

  const swapMode = (to) => {
    setMode(to);
    setStep('phone');
    setError('');
    setErrors({});
    setUnknown(false);
    setDevCode('');
  };

  /* -- Signing in by code ------------------------------------------------ */

  const send = async (e) => {
    e?.preventDefault();
    if (!validPhone) return setError('Enter a 10-digit mobile number');

    setError('');
    setUnknown(false);
    setBusy(true);
    try {
      const res = await partnerApi.requestOtp(phone, 'login');
      setName(res.data?.name || '');
      setDevCode(res.data?.devCode || '');
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setSeconds(RESEND_SECONDS);
      setTimeout(() => boxes.current[0]?.focus(), 60);
    } catch (err) {
      setError(err.message);
      // Not one of ours: say so, and put Register right under it.
      setUnknown(err.status === 404);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  const verify = async (e) => {
    e?.preventDefault();
    if (code.length !== OTP_LENGTH) return setError(`Enter the ${OTP_LENGTH}-digit code`);

    setError('');
    setBusy(true);
    try {
      const res = await partnerApi.verifyOtp(phone, code, 'login');
      setPartnerToken(res.token);
      navigate('/partner', { replace: true });
    } catch (err) {
      setError(err.message);
      setOtp(Array(OTP_LENGTH).fill(''));
      boxes.current[0]?.focus();
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  /* -- Signing in with an email and a password --------------------------- */

  const signInWithPassword = async (e) => {
    e?.preventDefault();
    if (!isEmail(email)) return setError('Enter the email the account is under');
    if (!password) return setError('Enter your password');

    setError('');
    setBusy(true);
    try {
      const res = await partnerApi.login(email.trim(), password);
      setPartnerToken(res.token);
      navigate('/partner', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  /* -- Registering -------------------------------------------------------- */

  /** The code that proves the number on the form is theirs. */
  const sendRegCode = async () => {
    if (!isPhone(form.phone)) {
      return setErrors((x) => ({ ...x, phone: 'A 10-digit mobile number' }));
    }
    setError('');
    setBusy(true);
    try {
      const res = await partnerApi.requestOtp(form.phone, 'register');
      setRegDevCode(res.data?.devCode || '');
      setRegSent(true);
      setSeconds(RESEND_SECONDS);
    } catch (err) {
      setErrors((x) => ({ ...x, phone: err.message }));
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  /** Everything the form asks, checked here so the server is the backstop. */
  const check = () => {
    const found = {};
    if (!form.name.trim()) found.name = 'The business needs a name';
    if (!form.ownerName.trim()) found.ownerName = 'Who runs it?';
    if (!isPhone(form.phone)) found.phone = 'A 10-digit mobile number';
    if (!isEmail(form.email)) found.email = 'That email does not look right';
    if (!form.city.trim()) found.city = 'Which city?';
    if (!form.address.trim()) found.address = 'The business address';
    if (form.password.length < PASSWORD_MIN) found.password = `At least ${PASSWORD_MIN} characters`;
    if (!form.terms) found.terms = 'The terms have to be accepted';
    if (!regSent) found.phone = 'Verify the number first';
    else if (regCode.replace(/\D/g, '').length !== OTP_LENGTH) found.code = `The ${OTP_LENGTH}-digit code`;
    return found;
  };

  const registerNow = async (e) => {
    e?.preventDefault();
    const found = check();
    setErrors(found);
    if (Object.keys(found).length) return setError('');

    setError('');
    setBusy(true);
    try {
      const res = await partnerApi.register({
        name: form.name.trim(),
        ownerName: form.ownerName.trim(),
        phone: `+91 ${form.phone.replace(/\D/g, '').slice(-10)}`,
        email: form.email.trim(),
        category: form.category,
        city: form.city.trim(),
        address: form.address.trim(),
        website: form.website.trim(),
        password: form.password,
        termsAccepted: true,
        code: regCode.replace(/\D/g, ''),
      });
      setPartnerToken(res.token);
      navigate('/partner', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  /* -- The code boxes ----------------------------------------------------- */

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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-surface-soft px-4 py-8 sm:px-6 lg:px-10">
      <div className={`mx-auto w-full ${registering ? 'max-w-[980px]' : 'max-w-[440px]'}`}>
        <div className="mb-6 flex justify-center">
          <Brand className="h-11" />
        </div>

        <div className="card p-5 sm:p-6">
          <span className="chip bg-brand-50 text-brand-700">
            <Handshake size={13} /> Partner portal
          </span>

          {/* The two things anybody comes here to do. */}
          <div
            role="tablist"
            aria-label="Sign in or register"
            className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-soft p-1"
          >
            {[
              { key: 'login', label: 'Sign in' },
              { key: 'register', label: 'Register' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={mode === t.key}
                onClick={() => swapMode(t.key)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  mode === t.key ? 'bg-white text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {registering ? (
            /* -- Register ---------------------------------------------- */
            <form onSubmit={registerNow} noValidate className="mt-5">
              <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Register your business</h1>
              <p className="mt-1 text-sm text-ink-500">
                Enough for us to know who you are. The property itself — rooms, photographs, rates — comes
                next, in the portal.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Business name" required error={errors.name}>
                  <input className="input" value={form.name} onChange={set('name')} placeholder="Coral Bay Stays" />
                </Field>
                <Field label="Owner name" required error={errors.ownerName}>
                  <input className="input" value={form.ownerName} onChange={set('ownerName')} placeholder="Full name" />
                </Field>

                <Field label="Business category" required>
                  <select className="input" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Email address" required error={errors.email} hint="You can sign in with this.">
                  <input
                    className="input"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@business.com"
                  />
                </Field>

                {/* The number, and the code that proves it. */}
                <Field label="Mobile number" required error={errors.phone}>
                  <span className="flex gap-2">
                    <span className="flex flex-1 overflow-hidden rounded-xl border border-ink-900/10 focus-within:border-brand-400">
                      <span className="flex items-center gap-1.5 border-r border-ink-900/10 bg-surface-soft px-3 text-sm font-bold text-ink-700">
                        <Smartphone size={15} className="text-ink-400" /> +91
                      </span>
                      <input
                        value={form.phone}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                          setErrors((x) => ({ ...x, phone: '' }));
                          setRegSent(false);
                        }}
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        className="num min-w-0 flex-1 border-0 bg-white px-3 py-2.5 text-sm font-semibold text-ink-900 outline-none"
                      />
                    </span>
                    <button
                      type="button"
                      onClick={sendRegCode}
                      disabled={busy || !partnerLive || (regSent && seconds > 0)}
                      className="btn-line btn-sm shrink-0"
                    >
                      {regSent ? (seconds > 0 ? `${seconds}s` : 'Resend') : 'Verify'}
                    </button>
                  </span>
                </Field>

                <Field
                  label="Verification code"
                  required
                  error={errors.code}
                  hint={regDevCode ? `No SMS yet — code: ${regDevCode}` : 'Sent by SMS once you press Verify.'}
                >
                  <input
                    className="input num tracking-widest"
                    value={regCode}
                    onChange={(e) => {
                      setRegCode(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
                      setErrors((x) => ({ ...x, code: '' }));
                    }}
                    inputMode="numeric"
                    disabled={!regSent}
                    placeholder="000000"
                  />
                </Field>

                <Field label="City" required error={errors.city}>
                  <input className="input" value={form.city} onChange={set('city')} placeholder="Karjat" />
                </Field>
                <Field label="Website or social link" hint="Optional — whichever page you actually keep up.">
                  <input className="input" value={form.website} onChange={set('website')} placeholder="https://" />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Business address" required error={errors.address}>
                    <textarea
                      className="input min-h-[72px]"
                      value={form.address}
                      onChange={set('address')}
                      placeholder="Street, area, landmark, PIN"
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Password"
                    required
                    error={errors.password}
                    hint={`At least ${PASSWORD_MIN} characters. This is how you sign in with your email.`}
                  >
                    <input
                      className="input"
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={set('password')}
                      placeholder="••••••••"
                    />
                  </Field>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-2.5 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={set('terms')}
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                <span>
                  I accept the{' '}
                  <a
                    href={`${SITE}/more/terms`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    partner terms
                  </a>{' '}
                  and the{' '}
                  <a
                    href={`${SITE}/more/privacy`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    privacy policy
                  </a>
                  .
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.terms}</p>}

              {error && <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p>}

              <button type="submit" disabled={busy || !partnerLive} className="btn-action mt-5 w-full py-3">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {busy ? 'Registering…' : 'Register Now'}
              </button>
            </form>
          ) : (
            /* -- Sign in ------------------------------------------------ */
            <div className="mt-5">
              {/* Two ways in: a code to the phone, or an email and a password. */}
              <div className="flex gap-2">
                {[
                  { key: 'otp', label: 'Mobile code', icon: Smartphone },
                  { key: 'password', label: 'Email & password', icon: Lock },
                ].map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    aria-pressed={door === d.key}
                    onClick={() => {
                      setDoor(d.key);
                      setError('');
                      setStep('phone');
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      door === d.key
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-ink-900/10 text-ink-500 hover:text-ink-800'
                    }`}
                  >
                    <d.icon size={14} />
                    {d.label}
                  </button>
                ))}
              </div>

              {door === 'password' ? (
                <form onSubmit={signInWithPassword} noValidate className="mt-4">
                  <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Partner sign in</h1>
                  <p className="mt-1 text-sm text-ink-500">The email and password you registered with.</p>

                  <label className="mt-4 block">
                    <span className="mb-1.5 block text-xs font-bold text-ink-700">Email address</span>
                    <span className="flex overflow-hidden rounded-xl border border-ink-900/10 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
                      <span className="grid w-10 shrink-0 place-items-center border-r border-ink-900/10 bg-surface-soft text-ink-400">
                        <Mail size={15} />
                      </span>
                      <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="you@business.com"
                        className="min-w-0 flex-1 border-0 bg-white px-3 py-3 text-[15px] font-semibold text-ink-900 outline-none"
                      />
                    </span>
                  </label>

                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-xs font-bold text-ink-700">Password</span>
                    <span className="flex overflow-hidden rounded-xl border border-ink-900/10 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
                      <span className="grid w-10 shrink-0 place-items-center border-r border-ink-900/10 bg-surface-soft text-ink-400">
                        <Lock size={15} />
                      </span>
                      <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        className="min-w-0 flex-1 border-0 bg-white px-3 py-3 text-[15px] font-semibold text-ink-900 outline-none"
                      />
                    </span>
                  </label>

                  {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

                  <button type="submit" disabled={busy || !partnerLive} className="btn-action mt-5 w-full py-3">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    {busy ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>
              ) : step === 'phone' ? (
                <form onSubmit={send} noValidate className="mt-4">
                  <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Partner sign in</h1>
                  <p className="mt-1 text-sm text-ink-500">
                    Use the mobile number your business is registered with.
                  </p>

                  <label className="mt-4 block">
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

                  {/* Turned away at the door: the way on, right here. */}
                  {unknown && (
                    <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3.5">
                      <p className="text-xs font-semibold text-ink-700">
                        New to Smira? Register your business — it takes two minutes.
                      </p>
                      <button type="button" onClick={() => swapMode('register')} className="btn-action btn-sm mt-2.5">
                        <UserPlus size={14} /> Register
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={busy || !partnerLive} className="btn-action mt-5 w-full py-3">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    {busy ? 'Sending code…' : 'Send code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={verify} noValidate className="mt-4">
                  <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
                    {name ? `Welcome back, ${name}` : 'Enter your code'}
                  </h1>
                  <p className="mt-1 text-sm text-ink-500">
                    Sent to <span className="font-bold text-ink-800">+91 {phone}</span>.{' '}
                    <button
                      type="button"
                      onClick={() => { setStep('phone'); setError(''); }}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      Change
                    </button>
                  </p>

                  <div className="mt-5 flex justify-between gap-2" onPaste={onPaste}>
                    {otp.map((d, i) => (
                      <input
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        ref={(el) => { boxes.current[i] = el; }}
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
          )}
        </div>

        {/* -- How it works ------------------------------------------------ */}
        <section className="mt-8">
          <h2 className="text-center font-display text-lg font-extrabold text-ink-900">How it works</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((s, i) => (
              <li key={s.title} className="card p-4">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-700">
                  {i + 1}
                </span>
                <p className="mt-2.5 text-sm font-bold text-ink-900">{s.title}</p>
                <p className="mt-1 text-xs leading-snug text-ink-500">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* -- Questions, before they have to ask ------------------------- */}
        <section className="mt-8">
          <h2 className="text-center font-display text-lg font-extrabold text-ink-900">
            Frequently asked questions
          </h2>
          <ul className="mx-auto mt-4 max-w-[640px] space-y-2">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <li key={f.q} className="card overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-bold text-ink-900">{f.q}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-ink-400 transition ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && <p className="px-4 pb-3.5 text-sm leading-relaxed text-ink-600">{f.a}</p>}
                </li>
              );
            })}
          </ul>
        </section>

        {/* -- And a way to reach a person -------------------------------- */}
        <section className="mt-8">
          <h2 className="text-center font-display text-lg font-extrabold text-ink-900">Contact us</h2>
          <p className="mt-1 text-center text-sm text-ink-500">
            Our partnerships desk, 10am to 7pm, Monday to Saturday.
          </p>
          <div className="mx-auto mt-4 grid max-w-[640px] gap-3 sm:grid-cols-3">
            <a href="tel:+919820011223" className="card flex items-center gap-2.5 p-3.5 transition hover:shadow-lift">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Phone size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-ink-400">Call</span>
                <span className="block truncate text-sm font-bold text-ink-900">+91 98200 11223</span>
              </span>
            </a>
            <a
              href="https://wa.me/919820011223"
              target="_blank"
              rel="noreferrer"
              className="card flex items-center gap-2.5 p-3.5 transition hover:shadow-lift"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <MessageCircle size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-ink-400">WhatsApp</span>
                <span className="block truncate text-sm font-bold text-ink-900">Message the desk</span>
              </span>
            </a>
            <a
              href="mailto:partners@smiraclub.com"
              className="card flex items-center gap-2.5 p-3.5 transition hover:shadow-lift"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Mail size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-ink-400">Email</span>
                <span className="block truncate text-sm font-bold text-ink-900">partners@smiraclub.com</span>
              </span>
            </a>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-ink-500">
          Smira staff?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in to the admin panel
          </Link>
        </p>
      </div>
    </div>
  );
}
