import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2, AlertTriangle, Send, MapPin,
} from 'lucide-react';
import { partnerApi } from '../../lib/partnerApi.js';

/**
 * The five steps of the partner listing, exactly as the client's sheet lays
 * them out — account and property, rooms, amenities, pricing and inventory,
 * ownership and legal — then the agreement and Submit.
 *
 * Every "Save and continue" saves that step to the server, so a hotelier who
 * stops halfway through comes back to what they typed rather than a blank
 * form. The server decides what is required; when Submit is refused, the list
 * of what is missing comes straight from it.
 */

const STEPS = [
  { n: 1, title: 'Account and property' },
  { n: 2, title: 'Rooms' },
  { n: 3, title: 'Amenities' },
  { n: 4, title: 'Pricing and inventory' },
  { n: 5, title: 'Ownership and legal' },
];

const PROPERTY_TYPES = ['Hotel', 'Resort', 'Homestay', 'Villa', 'Camp', 'Lifestyle'];
const ACCOUNT_TYPES = ['Hotel / Property', 'Channel manager'];
const OWNERSHIP = ['Self owned', 'Company owned', 'Family owned', 'Lease', 'Other'];
const MEAL_PLANS = ['EP — Room only', 'CP — Breakfast', 'MAP — Breakfast + Dinner', 'AP — All meals'];

const POPULAR = [
  'Wi-Fi', 'Swimming Pool', 'Parking', 'Restaurant', 'Breakfast', 'Room Service', 'AC', 'TV',
  'Gym', 'Spa', 'Kids Play Area', 'Conference Room', 'Pet Friendly',
];
const FACILITIES = [
  'Garden', 'Beach Access', 'Bar', 'Indoor Games', 'Outdoor Games', 'Bonfire',
  'Airport Transfer', 'Laundry', 'Elevator', 'Power Backup',
];
const RULES = [
  'Valid ID Required', 'Couple Friendly', 'Pets Allowed', 'Smoking', 'Alcohol', 'Visitors',
  'Child Policy', 'Extra Bed Policy', 'Food Policy',
];

const EMPTY_ROOM = {
  name: '', type: '', count: '', size: '', bedType: '', adults: '', children: '',
  maxOccupancy: '', extraBed: false, amenities: '', description: '',
};

/** Numbers leave the form as numbers, and blanks leave as nothing. */
const n = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);

function Field({ label, required, hint, children, wide }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1.5 flex items-baseline gap-1.5 text-xs font-bold text-ink-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-400">{hint}</span>}
    </label>
  );
}

function Group({ title, note, children }) {
  return (
    <section className="rounded-2xl border border-ink-900/[0.07] p-4 sm:p-5">
      <h3 className="font-display text-sm font-extrabold text-ink-900">{title}</h3>
      {note && <p className="mt-0.5 text-xs text-ink-500">{note}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Checks({ options, value = [], onChange }) {
  const set = new Set(value);
  return (
    <div className="flex flex-wrap gap-2 sm:col-span-2">
      {options.map((o) => {
        const on = set.has(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => {
              const next = new Set(set);
              if (on) next.delete(o);
              else next.add(o);
              onChange([...next]);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              on ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-ink-900/10 text-ink-600 hover:bg-surface-soft'
            }`}
          >
            {on && <Check size={12} strokeWidth={3} />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Who is filling it in.
 *
 * A partner saves each step to their own record with their own token. The
 * desk fills the same five steps in on a partner's behalf — adding a hotel
 * that phoned in — and saves through the staff API instead. The steps, the
 * fields and the wording are the same either way, which is the point: the
 * desk and the hotelier are looking at one form, not two that drift.
 */
export default function ListingWizard({
  initial = {},
  partner,
  onSubmitted,
  onSaveStep,
  onFinish,
  finishLabel,
}) {
  const [step, setStep] = useState(Math.min(5, Math.max(1, initial.step || 1)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState([]);
  const [saved, setSaved] = useState('');

  // -- The form, seeded from whatever was saved last time -------------------
  const [account, setAccount] = useState({ fullName: '', email: '', alternatePhone: '', accountType: '', ...initial.account });
  const [property, setProperty] = useState({
    type: '', name: '', starCategory: '', contactName: '', contactPhone: '', contactEmail: '',
    bookingStartDate: '', description: '', ...initial.property,
  });
  const [location, setLocation] = useState({
    line1: '', line2: '', landmark: '', city: '', state: '', country: 'India', pin: '',
    latitude: '', longitude: '', mapsUrl: '', ...initial.location,
  });
  const [rooms, setRooms] = useState(
    initial.rooms?.length ? initial.rooms.map((r) => ({ ...EMPTY_ROOM, ...r })) : [{ ...EMPTY_ROOM }]
  );
  const [propertyPhotos, setPropertyPhotos] = useState((initial.photos?.property || []).join('\n'));
  const [roomPhotos, setRoomPhotos] = useState((initial.photos?.rooms || []).join('\n'));
  const [amenities, setAmenities] = useState(initial.amenities || []);
  const [facilities, setFacilities] = useState(initial.facilities || []);
  const [rules, setRules] = useState(initial.rules || []);
  const [pricing, setPricing] = useState({
    standardTariff: '', partnerRate: '', weekdayRate: '', weekendRate: '', extraAdultRate: '', childRate: '',
    mealPlans: [], ...initial.pricing,
  });
  const [inventory, setInventory] = useState({
    totalRooms: '', availableRooms: '', closedDates: '', blackoutDates: '', ...initial.inventory,
  });
  const [policies, setPolicies] = useState({
    checkIn: '', checkOut: '', freeCancellationUntil: '', cancellationCharge: '', noShowPolicy: '', ...initial.policies,
  });
  const [ownership, setOwnership] = useState({
    type: '', pan: '', gst: '', tan: '', ...initial.ownership,
    documentLinks: { ownershipProof: '', leaseAgreement: '', authorisation: '', ...initial.ownership?.documentLinks },
  });
  const [bank, setBank] = useState({
    holder: '', bankName: '', accountNumber: '', ifsc: '', branch: '', proofLink: '', ...initial.bank,
  });
  const [agreed, setAgreed] = useState(Boolean(initial.agreementAccepted));

  const bind = (obj, set) => (key) => ({
    value: obj[key] ?? '',
    onChange: (e) => set({ ...obj, [key]: e.target.value }),
    className: 'input',
  });
  const acc = bind(account, setAccount);
  const prop = bind(property, setProperty);
  const loc = bind(location, setLocation);
  const pri = bind(pricing, setPricing);
  const inv = bind(inventory, setInventory);
  const pol = bind(policies, setPolicies);
  const own = bind(ownership, setOwnership);
  const bnk = bind(bank, setBank);

  const setRoom = (i, key, value) => setRooms(rooms.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  /** Just this step's sections, in the shape the server stores. */
  const bodyFor = (s) => {
    switch (s) {
      case 1:
        return { account, property, location };
      case 2:
        return {
          rooms: rooms
            .filter((r) => r.name || r.count)
            .map((r) => ({
              ...r,
              count: n(r.count),
              adults: n(r.adults),
              children: n(r.children),
              maxOccupancy: n(r.maxOccupancy),
              extraBed: Boolean(r.extraBed),
            })),
          photos: { property: lines(propertyPhotos), rooms: lines(roomPhotos) },
        };
      case 3:
        return { amenities, facilities, rules };
      case 4:
        return {
          pricing: {
            standardTariff: n(pricing.standardTariff),
            partnerRate: n(pricing.partnerRate),
            weekdayRate: n(pricing.weekdayRate),
            weekendRate: n(pricing.weekendRate),
            extraAdultRate: n(pricing.extraAdultRate),
            childRate: n(pricing.childRate),
            mealPlans: pricing.mealPlans || [],
          },
          inventory: {
            ...inventory,
            totalRooms: n(inventory.totalRooms),
            availableRooms: n(inventory.availableRooms),
          },
          policies,
        };
      case 5:
        return { ownership, bank, agreementAccepted: agreed };
      default:
        return {};
    }
  };

  const save = async (s) => {
    setError('');
    setMissing([]);
    setBusy(true);
    try {
      const body = { ...bodyFor(s), step: s };
      if (onSaveStep) await onSaveStep(body, s);
      else await partnerApi.saveListing(body);
      setSaved(`Step ${s} saved`);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (await save(step)) {
      setStep(Math.min(5, step + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submit = async () => {
    if (!(await save(5))) return;
    setBusy(true);
    try {
      // The desk finishes by filing the partner; a hotelier finishes by
      // sending it to the desk for review.
      if (onFinish) await onFinish();
      else {
        const res = await partnerApi.submitListing();
        onSubmitted?.(res.data);
      }
    } catch (err) {
      setError(err.message);
      setMissing(err.details || []);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {partner?.stage === 'Needs changes' && partner.reviewNote && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-900">The Smira desk asked for changes</p>
            <p className="mt-1 whitespace-pre-line text-sm text-amber-800">{partner.reviewNote}</p>
            <p className="mt-2 text-xs text-amber-700">Make the change below and submit again.</p>
          </div>
        </div>
      )}

      {/* -- Which step ----------------------------------------------------- */}
      <div className="card p-4">
        <ol className="grid grid-cols-5 gap-1.5">
          {STEPS.map((s) => (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => setStep(s.n)}
                className={`w-full rounded-xl px-2 py-2 text-left transition ${
                  step === s.n ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-surface-soft'
                }`}
              >
                <span className={`block text-[11px] font-extrabold ${step === s.n ? 'text-brand-700' : 'text-ink-400'}`}>
                  STEP {s.n}
                </span>
                <span className="hidden text-xs font-bold text-ink-800 sm:block">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="card space-y-4 p-4 sm:p-6">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-brand-600">Step {step} of 5</p>
          <h2 className="font-display text-xl font-extrabold text-ink-900">{STEPS[step - 1].title}</h2>
        </div>

        {/* -- Step 1 -------------------------------------------------------- */}
        {step === 1 && (
          <>
            <Group title="Account registration" note={`Signed in with ${partner?.phone || 'your mobile'}. No password — you sign in with a code each time.`}>
              <Field label="Full name" required><input {...acc('fullName')} autoComplete="name" /></Field>
              <Field label="Email address"><input {...acc('email')} type="email" autoComplete="email" /></Field>
              <Field label="Alternate number"><input {...acc('alternatePhone')} inputMode="tel" /></Field>
              <Field label="Account type">
                <select {...acc('accountType')}>
                  <option value="">Select</option>
                  {ACCOUNT_TYPES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </Group>

            <Group title="Property type" note="What type of property are you listing?">
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setProperty({ ...property, type: t })}
                    className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                      property.type === t ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-ink-900/10 text-ink-600 hover:bg-surface-soft'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Group>

            <Group title="Basic property information">
              <Field label="Property name" required><input {...prop('name')} /></Field>
              <Field label="Star category"><input {...prop('starCategory')} placeholder="3 star, 4 star…" /></Field>
              <Field label="Property contact name"><input {...prop('contactName')} /></Field>
              <Field label="Mobile number"><input {...prop('contactPhone')} inputMode="tel" /></Field>
              <Field label="Email"><input {...prop('contactEmail')} type="email" /></Field>
              <Field label="Booking start date"><input {...prop('bookingStartDate')} type="date" /></Field>
              <Field label="Property description" wide>
                <textarea {...prop('description')} rows={3} />
              </Field>
            </Group>

            <Group title="Property location" note="Address verification is mandatory — we check this before you go live.">
              <Field label="Address line 1" required wide><input {...loc('line1')} /></Field>
              <Field label="Address line 2" wide><input {...loc('line2')} /></Field>
              <Field label="Landmark"><input {...loc('landmark')} /></Field>
              <Field label="City" required><input {...loc('city')} /></Field>
              <Field label="State" required><input {...loc('state')} /></Field>
              <Field label="Country"><input {...loc('country')} /></Field>
              <Field label="PIN code" required><input {...loc('pin')} inputMode="numeric" /></Field>
              <Field label="Google Maps location" hint="Paste the share link from Google Maps">
                <span className="relative block">
                  <MapPin size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input {...loc('mapsUrl')} className="input pl-8" />
                </span>
              </Field>
              <Field label="Latitude"><input {...loc('latitude')} inputMode="decimal" /></Field>
              <Field label="Longitude"><input {...loc('longitude')} inputMode="decimal" /></Field>
            </Group>
          </>
        )}

        {/* -- Step 2 -------------------------------------------------------- */}
        {step === 2 && (
          <>
            {rooms.map((r, i) => (
              <section key={i} className="rounded-2xl border border-ink-900/[0.07] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-extrabold text-ink-900">Room category {i + 1}</h3>
                  {rooms.length > 1 && (
                    <button type="button" onClick={() => setRooms(rooms.filter((_, j) => j !== i))} className="icon-btn-danger h-8 w-8" title="Remove">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Room name" required><input className="input" value={r.name} onChange={(e) => setRoom(i, 'name', e.target.value)} placeholder="Deluxe Room" /></Field>
                  <Field label="Room type"><input className="input" value={r.type} onChange={(e) => setRoom(i, 'type', e.target.value)} placeholder="Deluxe" /></Field>
                  <Field label="Number of rooms" required><input className="input" type="number" min="0" value={r.count} onChange={(e) => setRoom(i, 'count', e.target.value)} placeholder="10" /></Field>
                  <Field label="Room size"><input className="input" value={r.size} onChange={(e) => setRoom(i, 'size', e.target.value)} placeholder="320 sq ft" /></Field>
                  <Field label="Bed type"><input className="input" value={r.bedType} onChange={(e) => setRoom(i, 'bedType', e.target.value)} placeholder="1 King Bed" /></Field>
                  <Field label="Number of adults"><input className="input" type="number" min="0" value={r.adults} onChange={(e) => setRoom(i, 'adults', e.target.value)} placeholder="2" /></Field>
                  <Field label="Number of children"><input className="input" type="number" min="0" value={r.children} onChange={(e) => setRoom(i, 'children', e.target.value)} placeholder="1" /></Field>
                  <Field label="Maximum occupancy"><input className="input" type="number" min="0" value={r.maxOccupancy} onChange={(e) => setRoom(i, 'maxOccupancy', e.target.value)} placeholder="3" /></Field>
                  <Field label="Extra bed available">
                    <select className="input" value={r.extraBed ? 'Yes' : 'No'} onChange={(e) => setRoom(i, 'extraBed', e.target.value === 'Yes')}>
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </Field>
                  <Field label="Room amenities" wide><input className="input" value={r.amenities} onChange={(e) => setRoom(i, 'amenities', e.target.value)} placeholder="AC, TV, minibar, balcony" /></Field>
                  <Field label="Room description" wide><textarea className="input" rows={2} value={r.description} onChange={(e) => setRoom(i, 'description', e.target.value)} /></Field>
                </div>
              </section>
            ))}
            <button type="button" onClick={() => setRooms([...rooms, { ...EMPTY_ROOM }])} className="btn-line">
              <Plus size={15} /> Add room category
            </button>

            <Group title="Photos and videos" note="Paste links — Google Drive, Dropbox or your website. One per line.">
              <Field label="Property photos" hint="Exterior, lobby, reception, restaurant, swimming pool, facilities, other areas" wide>
                <textarea className="input" rows={3} value={propertyPhotos} onChange={(e) => setPropertyPhotos(e.target.value)} placeholder="https://…" />
              </Field>
              <Field label="Room photos" hint="Room, bathroom, view, amenities" wide>
                <textarea className="input" rows={3} value={roomPhotos} onChange={(e) => setRoomPhotos(e.target.value)} placeholder="https://…" />
              </Field>
            </Group>
          </>
        )}

        {/* -- Step 3 -------------------------------------------------------- */}
        {step === 3 && (
          <>
            <Group title="Popular amenities"><Checks options={POPULAR} value={amenities} onChange={setAmenities} /></Group>
            <Group title="Property facilities"><Checks options={FACILITIES} value={facilities} onChange={setFacilities} /></Group>
            <Group title="Property rules" note="Tick the ones that apply at your property.">
              <Checks options={RULES} value={rules} onChange={setRules} />
            </Group>
          </>
        )}

        {/* -- Step 4 -------------------------------------------------------- */}
        {step === 4 && (
          <>
            <Group title="Room pricing" note="Per room per night, in rupees.">
              <Field label="Standard tariff"><input {...pri('standardTariff')} type="number" min="0" /></Field>
              <Field label="Smira partner rate" required hint="What Smira pays you"><input {...pri('partnerRate')} type="number" min="0" /></Field>
              <Field label="Weekday rate"><input {...pri('weekdayRate')} type="number" min="0" /></Field>
              <Field label="Weekend rate"><input {...pri('weekendRate')} type="number" min="0" /></Field>
              <Field label="Extra adult rate"><input {...pri('extraAdultRate')} type="number" min="0" /></Field>
              <Field label="Child rate"><input {...pri('childRate')} type="number" min="0" /></Field>
            </Group>

            <Group title="Meal plan">
              <Checks options={MEAL_PLANS} value={pricing.mealPlans} onChange={(v) => setPricing({ ...pricing, mealPlans: v })} />
            </Group>

            <Group title="Inventory and calendar">
              <Field label="Total rooms"><input {...inv('totalRooms')} type="number" min="0" /></Field>
              <Field label="Available rooms"><input {...inv('availableRooms')} type="number" min="0" /></Field>
              <Field label="Closed dates" hint="e.g. 24–26 Dec"><input {...inv('closedDates')} /></Field>
              <Field label="Blackout dates"><input {...inv('blackoutDates')} /></Field>
            </Group>

            <Group title="Policies">
              <Field label="Check-in time"><input {...pol('checkIn')} type="time" /></Field>
              <Field label="Check-out time"><input {...pol('checkOut')} type="time" /></Field>
              <Field label="Free cancellation until" hint="e.g. 48 hours before check-in"><input {...pol('freeCancellationUntil')} /></Field>
              <Field label="Cancellation charge"><input {...pol('cancellationCharge')} placeholder="One night" /></Field>
              <Field label="No-show policy" wide><input {...pol('noShowPolicy')} /></Field>
            </Group>
          </>
        )}

        {/* -- Step 5 -------------------------------------------------------- */}
        {step === 5 && (
          <>
            <Group title="Ownership">
              <Field label="Ownership type" required wide>
                <div className="flex flex-wrap gap-2">
                  {OWNERSHIP.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOwnership({ ...ownership, type: o })}
                      className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                        ownership.type === o ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-ink-900/10 text-ink-600 hover:bg-surface-soft'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </Field>
            </Group>

            <Group title="Documents" note="Paste a link to each document — Google Drive or Dropbox.">
              <Field label="Property registration / ownership proof" wide>
                <input className="input" value={ownership.documentLinks.ownershipProof} onChange={(e) => setOwnership({ ...ownership, documentLinks: { ...ownership.documentLinks, ownershipProof: e.target.value } })} placeholder="https://…" />
              </Field>
              <Field label="Lease agreement" hint="If applicable">
                <input className="input" value={ownership.documentLinks.leaseAgreement} onChange={(e) => setOwnership({ ...ownership, documentLinks: { ...ownership.documentLinks, leaseAgreement: e.target.value } })} placeholder="https://…" />
              </Field>
              <Field label="Relationship / authorisation document" hint="If applicable">
                <input className="input" value={ownership.documentLinks.authorisation} onChange={(e) => setOwnership({ ...ownership, documentLinks: { ...ownership.documentLinks, authorisation: e.target.value } })} placeholder="https://…" />
              </Field>
              <Field label="PAN"><input {...own('pan')} className="input uppercase" /></Field>
              <Field label="GST"><input {...own('gst')} className="input uppercase" /></Field>
              <Field label="TAN" hint="If applicable"><input {...own('tan')} className="input uppercase" /></Field>
            </Group>

            <Group title="Bank details" note="Where Smira settles your payouts.">
              <Field label="Account holder name" required><input {...bnk('holder')} /></Field>
              <Field label="Bank name"><input {...bnk('bankName')} /></Field>
              <Field label="Account number" required><input {...bnk('accountNumber')} inputMode="numeric" autoComplete="off" /></Field>
              <Field label="IFSC" required><input {...bnk('ifsc')} className="input uppercase" /></Field>
              <Field label="Branch"><input {...bnk('branch')} /></Field>
              <Field label="Cancelled cheque / bank proof" hint="Link"><input {...bnk('proofLink')} placeholder="https://…" /></Field>
            </Group>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-900/[0.07] p-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
              />
              <span className="text-sm text-ink-700">
                <span className="font-bold text-ink-900">I accept the Smira Club partner agreement.</span>{' '}
                I confirm the details above are correct and that I am authorised to list this property.
                <span className="text-rose-500"> *</span>
              </span>
            </label>
          </>
        )}

        {/* -- What the server said ----------------------------------------- */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-bold text-rose-700">{error}</p>
            {missing.length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-rose-700">
                {missing.map((m) => <li key={m}>{m}</li>)}
              </ul>
            )}
          </div>
        )}
        {!error && saved && <p className="text-xs font-semibold text-emerald-600">{saved}</p>}

        {/* -- Moving through it -------------------------------------------- */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/[0.07] pt-4">
          <button type="button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || busy} className="btn-line">
            <ArrowLeft size={15} /> Back
          </button>

          {step < 5 ? (
            <button type="button" onClick={next} disabled={busy} className="btn-action">
              {busy ? <Loader2 size={15} className="animate-spin" /> : null}
              Save and continue <ArrowRight size={15} />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={busy || !agreed} className="btn-action">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {finishLabel || (partner?.stage === 'Needs changes' ? 'Submit again' : 'Submit for review')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
