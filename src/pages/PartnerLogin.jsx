import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, Loader2, Smartphone, Handshake, ShieldCheck } from 'lucide-react';
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
  { phone: '+91 98450 11202', label: 'Atlantis The Palm' },
  { phone: '+91 98450 11203', label: 'Skyline Transfers' },
];

export default function PartnerLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [devCode, setDevCode] = useState('');
  const [name, setName] = useState('');
  /** A number we have never seen is registering, not signing in. */
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const boxes = useRef([]);

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
    setBusy(true);
    try {
      const res = await partnerApi.requestOtp(phone);
      setName(res.data?.name || '');
      setIsNew(Boolean(res.data?.isNew));
      setDevCode(res.data?.devCode || '');
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setSeconds(RESEND_SECONDS);
      setTimeout(() => boxes.current[0]?.focus(), 60);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
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
      const res = await partnerApi.verifyOtp(phone, code);
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

          {step === 'phone' ? (
            <form onSubmit={send} noValidate>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
                Sign in or register
              </h1>
              <p className="mt-1.5 text-sm text-ink-500">
                Already a partner? Use the mobile number your property is registered with. New to
                Smira? Enter your mobile and we will set up your partner account.
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

              <button type="submit" disabled={busy || !partnerLive} className="btn-action mt-5 w-full py-3">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {busy ? 'Sending code…' : 'Send code'}
              </button>

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
                {isNew ? 'Create your partner account' : name ? `Welcome back, ${name}` : 'Enter your code'}
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
                {busy ? 'Checking…' : isNew ? 'Verify and continue' : 'Sign in'}
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
