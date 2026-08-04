import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Plane,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  KeyRound,
  Globe2,
  CalendarCheck,
  Wallet,
} from 'lucide-react';
import { useApp } from '../store/AppStore.jsx';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const highlights = [
  { icon: Globe2, text: 'Enquiries, itineraries and packages in one desk' },
  { icon: CalendarCheck, text: 'Departure tracking with live task reminders' },
  { icon: Wallet, text: 'Invoices, payments and supplier ledgers built in' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, signIn, toast, team, settings } = useApp();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [sentCode, setSentCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const boxRefs = useRef([]);
  const phoneRef = useRef(null);

  const redirectTo = location.state?.from || '/';
  const validPhone = /^[6-9]\d{9}$/.test(phone);
  const code = otp.join('');

  const knownNumbers = useMemo(
    () => team.filter((t) => t.status === 'Active').slice(0, 3),
    [team]
  );

  useEffect(() => {
    phoneRef.current?.focus();
  }, []);

  // Resend cooldown.
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (auth) return <Navigate to={redirectTo} replace />;

  const sendOtp = (e) => {
    e?.preventDefault();
    if (!validPhone) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setError('');
    setBusy(true);
    // Demo OTP: generated client-side and shown on screen instead of an SMS.
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setTimeout(() => {
      setSentCode(generated);
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setSeconds(RESEND_SECONDS);
      setBusy(false);
      toast(`OTP sent to +91 ${phone}`, 'info');
      setTimeout(() => boxRefs.current[0]?.focus(), 60);
    }, 700);
  };

  const verify = (e) => {
    e?.preventDefault();
    if (code.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }
    if (code !== sentCode) {
      setError('That OTP does not match. Please check and try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      boxRefs.current[0]?.focus();
      return;
    }
    setError('');
    setBusy(true);
    setTimeout(() => {
      const session = signIn(phone);
      setBusy(false);
      toast(`Welcome back, ${session.name.split(' ')[0]}`);
      navigate(redirectTo, { replace: true });
    }, 550);
  };

  const setDigit = (index, value) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setOtp((prev) => prev.map((d, i) => (i === index ? '' : d)));
      return;
    }
    setOtp((prev) => {
      const next = [...prev];
      // Handles both single typing and a pasted 6-digit code.
      digits.split('').forEach((d, k) => {
        if (index + k < OTP_LENGTH) next[index + k] = d;
      });
      return next;
    });
    const focusAt = Math.min(index + digits.length, OTP_LENGTH - 1);
    boxRefs.current[focusAt]?.focus();
  };

  const onOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      boxRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) boxRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) boxRefs.current[index + 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-surface-base bg-app-aurora">
      <div className="mx-auto grid min-h-screen max-w-[1180px] items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* Brand panel */}
        <section className="hidden lg:block">
          <div className="flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-ocean text-white shadow-glow">
              <Plane size={21} strokeWidth={2.4} className="-rotate-45" />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
              Smira<span className="text-brand-600"> Club</span>
            </span>
          </div>

          <h1 className="mt-9 max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-ink-900">
            Run every trip, quote and payment from one travel desk.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-600">
            Sign in with the mobile number registered with {settings.agency.name}. We will text you a
            one-time password — no passwords to remember.
          </p>

          <ul className="mt-9 space-y-3.5">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-card">
                  <Icon size={17} strokeWidth={2.2} />
                </span>
                <span className="text-sm font-semibold text-ink-700">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Auth card */}
        <section className="w-full">
          <div className="mb-7 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean text-white shadow-glow">
              <Plane size={19} strokeWidth={2.4} className="-rotate-45" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">
              Smira<span className="text-brand-600"> Club</span>
            </span>
          </div>

          <div className="card mx-auto w-full max-w-[440px] p-7 sm:p-9">
            <span className="chip bg-brand-50 text-brand-700">
              <ShieldCheck size={13} /> Mobile OTP sign-in
            </span>

            {step === 'phone' ? (
              <form onSubmit={sendOtp} noValidate>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
                  Sign in to your panel
                </h2>
                <p className="mt-1.5 text-sm text-ink-500">
                  Enter your registered mobile number to receive a one-time password.
                </p>

                <label className="label mt-7" htmlFor="mobile">
                  Mobile number
                </label>
                <div
                  className={`flex items-center overflow-hidden rounded-xl border bg-white transition focus-within:ring-4 focus-within:ring-brand-500/10 ${
                    error && !validPhone ? 'border-rose-300' : 'border-ink-900/10 focus-within:border-brand-400'
                  }`}
                >
                  <span className="flex items-center gap-2 border-r border-ink-900/10 bg-surface-soft px-3.5 py-3 text-sm font-bold text-ink-700">
                    <Smartphone size={16} className="text-ink-500" /> +91
                  </span>
                  <input
                    id="mobile"
                    ref={phoneRef}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setError('');
                    }}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98200 11223"
                    className="w-full bg-transparent px-3.5 py-3 text-sm font-semibold tracking-wide text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-400"
                  />
                </div>

                {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

                <button type="submit" disabled={busy} className="btn-primary mt-6 w-full py-3">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {busy ? 'Sending OTP…' : 'Send OTP'}
                </button>

                <div className="mt-6 rounded-xl bg-surface-soft p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                    Demo numbers
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {knownNumbers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setPhone(t.phone.replace(/\D/g, '').slice(-10));
                          setError('');
                        }}
                        className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 shadow-card transition hover:text-brand-700"
                      >
                        {t.phone}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-ink-500">
                    Any valid 10-digit number works in this demo.
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={verify} noValidate>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
                  Verify your number
                </h2>
                <p className="mt-1.5 text-sm text-ink-500">
                  We sent a {OTP_LENGTH}-digit code to{' '}
                  <span className="font-bold text-ink-800">+91 {phone}</span>.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setError('');
                      setSentCode('');
                    }}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Change
                  </button>
                </p>

                <div className="mt-7 flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        boxRefs.current[i] = el;
                      }}
                      value={digit}
                      onChange={(e) => {
                        setDigit(i, e.target.value);
                        setError('');
                      }}
                      onKeyDown={(e) => onOtpKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                      inputMode="numeric"
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      maxLength={OTP_LENGTH}
                      aria-label={`OTP digit ${i + 1}`}
                      className={`w-full min-w-0 rounded-xl border bg-white py-3 text-center text-lg font-extrabold text-ink-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 ${
                        error ? 'border-rose-300' : 'border-ink-900/10'
                      }`}
                    />
                  ))}
                </div>

                {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink-500">
                    <KeyRound size={13} className="text-brand-600" /> Demo OTP:{' '}
                    <span className="font-extrabold tracking-widest text-brand-700">{sentCode}</span>
                  </span>
                  {seconds > 0 ? (
                    <span className="font-semibold text-ink-400">Resend in {seconds}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="font-bold text-brand-700 hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={busy || code.length !== OTP_LENGTH}
                  className="btn-primary mt-6 w-full py-3"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  {busy ? 'Verifying…' : 'Verify & continue'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError('');
                    setSentCode('');
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800"
                >
                  <ArrowLeft size={15} /> Use a different number
                </button>
              </form>
            )}
          </div>

          <p className="mx-auto mt-5 max-w-[440px] text-center text-xs leading-relaxed text-ink-400">
            By continuing you agree to the {settings.agency.name} internal usage policy. Trouble
            signing in? Call {settings.agency.phone}.
          </p>
        </section>
      </div>
    </div>
  );
}
