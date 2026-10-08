import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2, AlertTriangle, Send, MapPin,
} from 'lucide-react';
import { partnerApi } from '../../lib/partnerApi.js';
import { api } from '../../lib/api.js';
import FileField from './FileField.jsx';
import ImagesField from './ImagesField.jsx';
import { checkPartnerForm, flatten, firstBadStep } from '../../lib/partnerForm.js';

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

/*
 * One entry for every service the website sells, in the order it lists
 * them. Two of the website's own names cover two kinds of place each —
 * "Waterpark & Themepark" and "Camping & Adventure" — so those are two
 * entries here, because a partner runs one or the other and the form asks
 * them different things.
 *
 * "Lifestyle" is kept behind the scenes: it is what Luxury Experience used
 * to be called and some partners are still saved under it.
 */
const PROPERTY_TYPES = [
  'Hotel', 'Resort', 'Villa', 'Homestay', 'Free Stay',
  'International Trip', 'Group Departure', 'Package',
  'Restaurant', 'Water Park', 'Theme Park', 'Games Zone', 'Spa & Salon',
  'Luxury Experience', 'Camp', 'Activity',
  'Flight', 'Train & Bus', 'Transport',
];

/**
 * What the form asks a partner, by what kind of place they run.
 *
 * Every type used to get the hotel's form, so a restaurant was asked for
 * its star category, its bed types and whether an extra bed was available,
 * and a spa was asked its check-out time. The fields underneath are the
 * same — a thing you sell, how many of it there are, who it holds and what
 * it costs — so this renames them and hides the ones that mean nothing,
 * rather than inventing a separate form per type.
 *
 * `unit` is what one of their sellable things is called. Everything else
 * is whether a stay-shaped question applies at all.
 */
const STAY = {
  star: true, bed: true, occupancy: true, extraBed: true, meals: true,
  times: 'stay', nightly: true,
};
const VISIT = {
  star: false, bed: false, occupancy: true, extraBed: false, meals: false,
  times: 'open', nightly: false,
};

const PROFILES = {
  Hotel: { ...STAY, unit: 'Room', units: 'Rooms', eg: 'Deluxe Room', egType: 'Deluxe' },
  Resort: { ...STAY, unit: 'Room', units: 'Rooms', eg: 'Garden Villa Room', egType: 'Premium' },
  Homestay: { ...STAY, star: false, unit: 'Room', units: 'Rooms', eg: 'Upstairs bedroom', egType: 'Double' },
  Villa: { ...STAY, star: false, unit: 'Villa', units: 'Villas', eg: '3-bedroom pool villa', egType: 'Pool villa' },
  Camp: { ...STAY, star: false, unit: 'Tent', units: 'Tents', eg: 'Riverside tent', egType: 'Deluxe tent' },

  Restaurant: {
    ...VISIT, unit: 'Table', units: 'Tables', eg: 'Window table for four', egType: 'Four-seater',
    occupancyLabel: 'Seats', priceNote: 'Per cover, in rupees.',
  },
  'Spa & Salon': {
    ...VISIT, unit: 'Treatment', units: 'Treatments', eg: 'Aroma full body massage', egType: '60 minutes',
    occupancyLabel: 'People at once', priceNote: 'Per treatment, in rupees.',
  },
  'Games Zone': {
    ...VISIT, unit: 'Game', units: 'Games', eg: 'Bowling lane', egType: 'Lane',
    occupancyLabel: 'Players', priceNote: 'Per player, in rupees.',
  },
  'Theme Park': {
    ...VISIT, unit: 'Ticket', units: 'Tickets', eg: 'Day pass with water park', egType: 'Day pass',
    occupancyLabel: 'People covered', priceNote: 'Per ticket, in rupees.',
  },
  Activity: {
    ...VISIT, unit: 'Activity', units: 'Activities', eg: 'Sunrise trek', egType: 'Half day',
    occupancyLabel: 'People per slot', priceNote: 'Per person, in rupees.',
  },
  Transport: {
    ...VISIT, unit: 'Vehicle', units: 'Vehicles', eg: 'Innova Crysta', egType: 'SUV',
    occupancyLabel: 'Seats', priceNote: 'Per trip, in rupees.', times: 'none',
  },
  'Luxury Experience': {
    ...VISIT, unit: 'Experience', units: 'Experiences', eg: 'Private yacht evening', egType: 'Evening',
    occupancyLabel: 'Guests', priceNote: 'Per booking, in rupees.',
  },
  // What Luxury Experience used to be called.
  Lifestyle: {
    ...VISIT, unit: 'Experience', units: 'Experiences', eg: 'Private yacht evening', egType: 'Evening',
    occupancyLabel: 'Guests', priceNote: 'Per booking, in rupees.',
  },
  'Free Stay': {
    ...STAY, unit: 'Room', units: 'Rooms', eg: 'Deluxe Room', egType: 'Deluxe',
    priceNote: 'What the room would cost. Members stay free and pay for food.',
  },
  'International Trip': {
    ...VISIT, unit: 'Departure', units: 'Departures', eg: '5 nights Bali, twin sharing', egType: 'Twin sharing',
    occupancyLabel: 'Travellers', priceNote: 'Per person, in rupees.', times: 'none',
  },

  'Water Park': {
    ...VISIT, unit: 'Ticket', units: 'Tickets', eg: 'Day pass with locker', egType: 'Day pass',
    occupancyLabel: 'People covered', priceNote: 'Per ticket, in rupees.',
  },
  Package: {
    ...VISIT, unit: 'Departure', units: 'Departures', eg: '5 nights Kerala, twin sharing', egType: 'Twin sharing',
    occupancyLabel: 'Travellers', priceNote: 'Per person, in rupees.', times: 'none',
  },
  'Group Departure': {
    ...VISIT, unit: 'Departure', units: 'Departures', eg: '12 Nov, 20 seats', egType: 'Fixed departure',
    occupancyLabel: 'Seats', priceNote: 'Per seat, in rupees.', times: 'none',
  },
  Flight: {
    ...VISIT, unit: 'Fare', units: 'Fares', eg: 'Mumbai - Goa, economy', egType: 'Economy',
    occupancyLabel: 'Seats', priceNote: 'Per seat, in rupees.', times: 'none',
  },
  'Train & Bus': {
    ...VISIT, unit: 'Service', units: 'Services', eg: 'Bengaluru - Goa sleeper', egType: 'Sleeper',
    occupancyLabel: 'Seats', priceNote: 'Per seat, in rupees.', times: 'none',
  },
};

const DEFAULT_PROFILE = { ...STAY, unit: 'Room', units: 'Rooms', eg: 'Deluxe Room', egType: 'Deluxe' };
const profileOf = (type) => PROFILES[type] || DEFAULT_PROFILE;
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

/**
 * What to tick, by what kind of place it is.
 *
 * "Swimming Pool" and "Extra Bed Policy" are not questions for a
 * restaurant, and "Serves Alcohol" is not one for a hotel room. Each
 * family gets its own list; anything already ticked stays ticked even if
 * the partner changes type, so nothing is lost by exploring.
 */
const TICKS = {
  stay: { popular: POPULAR, facilities: FACILITIES, rules: RULES },
  Restaurant: {
    popular: ['Wi-Fi', 'AC', 'Parking', 'Live Music', 'Outdoor Seating', 'Rooftop', 'Private Dining', 'Bar', 'Buffet', 'Home Delivery'],
    facilities: ['Valet Parking', 'Wheelchair Access', 'Baby Chairs', 'Smoking Area', 'Card Payment', 'UPI', 'Party Hall', 'Catering'],
    rules: ['Table Booking Required', 'Couple Friendly', 'Pets Allowed', 'Smoking', 'Alcohol Served', 'Pure Veg', 'Dress Code', 'Outside Food'],
  },
  'Spa & Salon': {
    popular: ['Wi-Fi', 'AC', 'Parking', 'Steam Room', 'Sauna', 'Jacuzzi', 'Couple Rooms', 'Ayurvedic', 'Salon', 'Products Included'],
    facilities: ['Changing Room', 'Lockers', 'Showers', 'Wheelchair Access', 'Card Payment', 'UPI', 'Female Therapists', 'Male Therapists'],
    rules: ['Appointment Required', 'Valid ID Required', 'Couple Friendly', 'Age Limit', 'Cancellation Notice', 'No Outside Products'],
  },
  'Games Zone': {
    popular: ['Wi-Fi', 'AC', 'Parking', 'Arcade', 'Bowling', 'VR Games', 'Pool Table', 'Cafe', 'Party Packages', 'Kids Area'],
    facilities: ['Lockers', 'Wheelchair Access', 'Card Payment', 'UPI', 'Seating Area', 'Birthday Hall', 'First Aid'],
    rules: ['Age Limit', 'Height Limit', 'Adult Supervision', 'Socks Required', 'No Outside Food', 'Prepaid Card'],
  },
  'Theme Park': {
    popular: ['Parking', 'Water Park', 'Dry Rides', 'Kids Zone', 'Food Court', 'Locker Rental', 'Costume Rental', 'Photography'],
    facilities: ['Changing Room', 'Showers', 'Wheelchair Access', 'First Aid', 'Lifeguards', 'ATM', 'Card Payment', 'UPI'],
    rules: ['Height Limit', 'Age Limit', 'Adult Supervision', 'Swimwear Required', 'No Outside Food', 'Valid ID Required'],
  },
  Activity: {
    popular: ['Guide Included', 'Equipment Included', 'Transport Included', 'Refreshments', 'Photos Included', 'Insurance', 'Training'],
    facilities: ['Changing Room', 'Lockers', 'Washrooms', 'Parking', 'First Aid', 'Card Payment', 'UPI'],
    rules: ['Age Limit', 'Weight Limit', 'Fitness Declaration', 'Adult Supervision', 'Weather Dependent', 'Valid ID Required'],
  },
  Transport: {
    popular: ['AC', 'Wi-Fi', 'Driver Included', 'Fuel Included', 'Music System', 'Charging Point', 'Water Bottles', 'GPS Tracked'],
    facilities: ['Luggage Space', 'Child Seat', 'Wheelchair Access', 'First Aid', 'Card Payment', 'UPI', '24x7 Support'],
    rules: ['Valid ID Required', 'Driving Licence Required', 'Smoking', 'Pets Allowed', 'Alcohol', 'Toll and Parking Extra', 'Night Charges'],
  },
  Lifestyle: {
    popular: ['Wi-Fi', 'AC', 'Parking', 'Refreshments', 'Host Included', 'Photography', 'Decoration', 'Music'],
    facilities: ['Washrooms', 'Changing Room', 'Wheelchair Access', 'Card Payment', 'UPI', 'Private Area'],
    rules: ['Advance Booking', 'Valid ID Required', 'Age Limit', 'Cancellation Notice', 'Weather Dependent'],
  },

  'Luxury Experience': {
    popular: ['Wi-Fi', 'AC', 'Parking', 'Refreshments', 'Host Included', 'Photography', 'Decoration', 'Music'],
    facilities: ['Washrooms', 'Changing Room', 'Wheelchair Access', 'Card Payment', 'UPI', 'Private Area'],
    rules: ['Advance Booking', 'Valid ID Required', 'Age Limit', 'Cancellation Notice', 'Weather Dependent'],
  },
  'International Trip': {
    popular: ['Flights Included', 'Hotel Included', 'Breakfast', 'Airport Transfers', 'Sightseeing', 'Tour Manager', 'Visa Assistance', 'Travel Insurance'],
    facilities: ['Hotel Pick-up', 'AC Coach', 'English Speaking Guide', 'Card Payment', 'UPI', 'EMI Available'],
    rules: ['Passport Required', 'Advance Booking', 'Valid Visa', 'Cancellation Notice', 'Minimum Travellers'],
  },
  'Water Park': {
    popular: ['Parking', 'Wave Pool', 'Slides', 'Lazy River', 'Kids Pool', 'Rain Dance', 'Food Court', 'Locker Rental'],
    facilities: ['Changing Room', 'Showers', 'Lifeguards', 'First Aid', 'Wheelchair Access', 'ATM', 'Card Payment', 'UPI'],
    rules: ['Height Limit', 'Swimwear Required', 'Adult Supervision', 'No Outside Food', 'Valid ID Required'],
  },
  Package: {
    popular: ['Flights Included', 'Hotel Included', 'Breakfast', 'Airport Transfers', 'Sightseeing', 'Tour Manager', 'Visa Assistance', 'Travel Insurance'],
    facilities: ['Hotel Pick-up', 'AC Coach', 'English Speaking Guide', 'Card Payment', 'UPI', 'EMI Available'],
    rules: ['Advance Booking', 'Passport Required', 'Valid ID Required', 'Cancellation Notice', 'Minimum Travellers'],
  },
  'Group Departure': {
    popular: ['Fixed Departure', 'Tour Manager', 'Flights Included', 'Hotel Included', 'All Meals', 'Sightseeing', 'Airport Transfers'],
    facilities: ['AC Coach', 'English Speaking Guide', 'Card Payment', 'UPI', 'EMI Available', 'Solo Traveller Friendly'],
    rules: ['Advance Booking', 'Minimum Group Size', 'Age Limit', 'Passport Required', 'Cancellation Notice'],
  },
  Flight: {
    popular: ['Cabin Baggage', 'Check-in Baggage', 'Meal Included', 'Seat Selection', 'Priority Boarding', 'Date Change'],
    facilities: ['Web Check-in', 'Wheelchair Assistance', 'Card Payment', 'UPI', 'EMI Available'],
    rules: ['Valid ID Required', 'Advance Booking', 'Cancellation Notice', 'Name Change Not Allowed'],
  },
  'Train & Bus': {
    popular: ['AC', 'Sleeper', 'Water Bottle', 'Blanket', 'Charging Point', 'Wi-Fi', 'Live Tracking', 'Entertainment'],
    facilities: ['Washroom', 'Boarding Point Pick-up', 'Luggage Space', 'Card Payment', 'UPI'],
    rules: ['Valid ID Required', 'Advance Booking', 'No Smoking', 'Cancellation Notice', 'Reporting Time'],
  },
};
const ticksFor = (type) => TICKS[type] || TICKS.stay;

const EMPTY_ROOM = {
  name: '', type: '', count: '', size: '', bedType: '', adults: '', children: '',
  maxOccupancy: '', extraBed: false, amenities: '', description: '',
};

/** Numbers leave the form as numbers, and blanks leave as nothing. */
const n = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

function Field({ label, required, error, hint, children, wide }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1.5 flex items-baseline gap-1.5 text-xs font-bold text-ink-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {/* What is wrong, under the field it is wrong about. */}
      {error && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{error}</span>}
      {!error && hint && <span className="mt-1 block text-[11px] text-ink-400">{hint}</span>}
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
  /**
   * What is missing, by field.
   *
   * The form marked fields required and then let every one of them
   * through — "the server decides what is required" — so the desk could
   * fill in five steps, press Submit, and be told by the API that
   * something on step one was wrong.
   */
  const [errors, setErrors] = useState({});
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
  /**
   * What this partner is, and so what the rest of the form asks them.
   *
   * Everything below reads these instead of naming rooms and beds outright,
   * which is how a restaurant came to be asked for its star category.
   */
  const kind = profileOf(property.type);

  /**
   * Where a document goes.
   *
   * The desk and the partner reach the same store through different doors
   * — `onSaveStep` is only ever passed when the desk is filling this in on
   * somebody's behalf, so it is also what tells the two apart here.
   */
  const sendFile = async (body) => {
    const res = onSaveStep
      ? await api.post('/uploads', body)
      : await partnerApi.uploadDocument(body);
    return res.data;
  };
  const ticks = ticksFor(property.type);

  const [location, setLocation] = useState({
    line1: '', line2: '', landmark: '', city: '', state: '', country: 'India', pin: '',
    latitude: '', longitude: '', mapsUrl: '', ...initial.location,
  });
  const [rooms, setRooms] = useState(
    initial.rooms?.length ? initial.rooms.map((r) => ({ ...EMPTY_ROOM, ...r })) : [{ ...EMPTY_ROOM }]
  );
  const [propertyPhotos, setPropertyPhotos] = useState(initial.photos?.property || []);
  const [roomPhotos, setRoomPhotos] = useState(initial.photos?.rooms || []);
  const [amenities, setAmenities] = useState(initial.amenities || []);
  const [facilities, setFacilities] = useState(initial.facilities || []);
  const [rules, setRules] = useState(initial.rules || []);

  /**
   * The rest of what the website's detail pages print.
   *
   * The form asked for rooms, rates and a description; the pages show how
   * the place is laid out, who hosts it, what is nearby and what the rules
   * are. A listing filling a third of the page looks like an afterthought
   * beside the hand-written ones, so this asks for the rest.
   */
  const [details, setDetails] = useState(() => ({
    tag: '', rating: '', reviews: '', hours: '',
    layout: '', bedrooms: '', beds: '', baths: '', sleeps: '', extraGuests: '', unitType: '',
    highlight: '', notes: [], freeCancellation: false, taxes: '',
    host: { title: '', speaks: '', blurb: '' },
    nearby: [], spaces: [], included: [], ruleNotes: [], guidelines: [],
    ...initial.details,
    host: { title: '', speaks: '', blurb: '', ...(initial.details?.host || {}) },
  }));
  const det = (key) => ({
    className: 'input',
    value: details[key] ?? '',
    onChange: (e) => setDetails({ ...details, [key]: e.target.value }),
  });
  const host = (key) => ({
    className: 'input',
    value: details.host?.[key] ?? '',
    onChange: (e) => setDetails({ ...details, host: { ...details.host, [key]: e.target.value } }),
  });
  /** A list of rows, edited in place. */
  const rowsOf = (key) => details[key] || [];
  const setRows = (key, rows) => setDetails({ ...details, [key]: rows });
  const setRow = (key, i, patch) =>
    setRows(key, rowsOf(key).map((r, n2) => (n2 === i ? { ...r, ...patch } : r)));
  /** A plain list of lines, one per row. */
  const linesOf = (key) => (details[key] || []).join('\n');
  const setLines = (key, text) =>
    setDetails({ ...details, [key]: String(text).split('\n').map((x) => x.trim()).filter(Boolean) });
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
    holder: '', bankName: '', accountNumber: '', ifsc: '', branch: '', proofLink: '',
    upiId: '', upiName: '', preferred: '', ...initial.bank,
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
          photos: { property: propertyPhotos, rooms: roomPhotos },
        };
      case 3:
        return {
          amenities,
          facilities,
          rules,
          details: {
            ...details,
            bedrooms: n(details.bedrooms),
            baths: n(details.baths),
            rating: n(details.rating),
            reviews: n(details.reviews),
            sleeps: n(details.sleeps),
            extraGuests: n(details.extraGuests),
            taxes: n(details.taxes),
          },
        };
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

  /** Everything this form knows about itself, for the rules to read. */
  const everything = () =>
    checkPartnerForm(
      {
        account, property, location, rooms, propertyPhotos, roomPhotos, amenities,
        facilities, rules, pricing, inventory, policies, ownership, bank, agreed,
      },
      kind,
    );

  const checkStep = (n) => {
    const found = everything()[n] || {};
    setErrors(found);
    if (Object.keys(found).length) setError('Some answers are missing on this step.');
    return Object.keys(found).length === 0;
  };

  const next = async () => {
    // Stop on the step that needs work, rather than at the end.
    if (!checkStep(step)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setError('');
    if (await save(step)) {
      setStep(Math.min(5, step + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submit = async () => {
    const all = everything();
    const bad = firstBadStep(all);
    if (bad !== null) {
      setErrors(flatten(all));
      setError('Some answers are missing — go back and finish them.');
      setStep(bad);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
          <h2 className="font-display text-xl font-extrabold text-ink-900">
            {step === 2 ? kind.units : STEPS[step - 1].title}
          </h2>
        </div>

        {/* -- Step 1 -------------------------------------------------------- */}
        {step === 1 && (
          <>
            <Group title="Account registration" note={`Signed in with ${partner?.phone || 'your mobile'}. No password — you sign in with a code each time.`}>
              {/* What kind of account this is comes first: it decides who
                  is signing up, before anything about the person. */}
              <Field label="Account type" required error={errors.accountType}>
                <select {...acc('accountType')}>
                  <option value="">Select</option>
                  {ACCOUNT_TYPES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Full name" required error={errors.fullName}><input {...acc('fullName')} autoComplete="name" /></Field>
              <Field label="Email address" required error={errors.email}><input {...acc('email')} type="email" autoComplete="email" /></Field>
              <Field label="Alternate number" required error={errors.alternatePhone}><input {...acc('alternatePhone')} inputMode="tel" /></Field>
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
              <Field label="Property name" required error={errors.name}><input {...prop('name')} /></Field>
              {kind.star && (
                <Field label="Star category" required error={errors.starCategory}><input {...prop('starCategory')} placeholder="3 star, 4 star…" /></Field>
              )}
              <Field label="Property contact name" required error={errors.contactName}><input {...prop('contactName')} /></Field>
              <Field label="Mobile number" required error={errors.contactPhone}><input {...prop('contactPhone')} inputMode="tel" /></Field>
              <Field label="Email" required error={errors.contactEmail}><input {...prop('contactEmail')} type="email" /></Field>
              <Field label="Booking start date" required error={errors.bookingStartDate}><input {...prop('bookingStartDate')} type="date" /></Field>
              <Field label="Property description" required error={errors.description} wide>
                <textarea {...prop('description')} rows={3} />
              </Field>
            </Group>

            <Group title="Property location" note="Address verification is mandatory — we check this before you go live.">
              <Field label="Address line 1" required error={errors.line1} wide><input {...loc('line1')} /></Field>
              <Field label="Address line 2" required error={errors.line2} wide><input {...loc('line2')} /></Field>
              <Field label="Landmark" required error={errors.landmark}><input {...loc('landmark')} /></Field>
              <Field label="City" required error={errors.city}><input {...loc('city')} /></Field>
              <Field label="State" required error={errors.state}><input {...loc('state')} /></Field>
              <Field label="Country" required error={errors.country}><input {...loc('country')} /></Field>
              <Field label="PIN code" required error={errors.pin}><input {...loc('pin')} inputMode="numeric" /></Field>
              <Field label="Google Maps location" required error={errors.mapsUrl} hint="Paste the share link from Google Maps">
                <span className="relative block">
                  <MapPin size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input {...loc('mapsUrl')} className="input pl-8" />
                </span>
              </Field>
              <Field label="Latitude" required error={errors.latitude}><input {...loc('latitude')} inputMode="decimal" /></Field>
              <Field label="Longitude" required error={errors.longitude}><input {...loc('longitude')} inputMode="decimal" /></Field>
            </Group>
          </>
        )}

        {/* -- Step 2 -------------------------------------------------------- */}
        {step === 2 && (
          <>
            {rooms.map((r, i) => (
              <section key={i} className="rounded-2xl border border-ink-900/[0.07] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-extrabold text-ink-900">{kind.unit} {i + 1}</h3>
                  {rooms.length > 1 && (
                    <button type="button" onClick={() => setRooms(rooms.filter((_, j) => j !== i))} className="icon-btn-danger h-8 w-8" title="Remove">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label={`${kind.unit} name`} required error={errors[`room-${i}-name`]}><input className="input" value={r.name} onChange={(e) => setRoom(i, 'name', e.target.value)} placeholder={kind.eg} /></Field>
                  <Field label={`${kind.unit} type`} required error={errors[`room-${i}-type`]}><input className="input" value={r.type} onChange={(e) => setRoom(i, 'type', e.target.value)} placeholder={kind.egType} /></Field>
                  <Field label={`How many ${kind.units.toLowerCase()}`} required error={errors[`room-${i}-count`]}><input className="input" type="number" min="0" value={r.count} onChange={(e) => setRoom(i, 'count', e.target.value)} placeholder="10" /></Field>
                  <Field label={kind.nightly ? `${kind.unit} size` : 'Size or duration'} required error={errors[`room-${i}-size`]}><input className="input" value={r.size} onChange={(e) => setRoom(i, 'size', e.target.value)} placeholder={kind.nightly ? '320 sq ft' : '60 minutes'} /></Field>
                  {kind.bed && (
                    <Field label="Bed type" required error={errors[`room-${i}-bedType`]}><input className="input" value={r.bedType} onChange={(e) => setRoom(i, 'bedType', e.target.value)} placeholder="1 King Bed" /></Field>
                  )}
                  <Field label="Number of adults" required error={errors[`room-${i}-adults`]}><input className="input" type="number" min="0" value={r.adults} onChange={(e) => setRoom(i, 'adults', e.target.value)} placeholder="2" /></Field>
                  <Field label="Number of children" required error={errors[`room-${i}-children`]}><input className="input" type="number" min="0" value={r.children} onChange={(e) => setRoom(i, 'children', e.target.value)} placeholder="1" /></Field>
                  <Field label={kind.occupancyLabel || 'Maximum occupancy'} required error={errors[`room-${i}-maxOccupancy`]}><input className="input" type="number" min="0" value={r.maxOccupancy} onChange={(e) => setRoom(i, 'maxOccupancy', e.target.value)} placeholder="3" /></Field>
                  {kind.extraBed && (
                    <Field label="Extra bed available">
                      <select className="input" value={r.extraBed ? 'Yes' : 'No'} onChange={(e) => setRoom(i, 'extraBed', e.target.value === 'Yes')}>
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </Field>
                  )}
                  <Field label={`${kind.unit} amenities`} required error={errors[`room-${i}-amenities`]} wide><input className="input" value={r.amenities} onChange={(e) => setRoom(i, 'amenities', e.target.value)} placeholder="AC, TV, minibar, balcony" /></Field>
                  <Field label={`${kind.unit} description`} required error={errors[`room-${i}-description`]} wide><textarea className="input" rows={2} value={r.description} onChange={(e) => setRoom(i, 'description', e.target.value)} /></Field>
                </div>
              </section>
            ))}
            <button type="button" onClick={() => setRooms([...rooms, { ...EMPTY_ROOM }])} className="btn-line">
              <Plus size={15} /> Add another {kind.unit.toLowerCase()}
            </button>

            {/*
              Photographs, chosen from the machine. They used to be links —
              and nobody photographs their hotel and then uploads it to
              Drive to get one, so in practice this box stayed empty and the
              listing reached the website with no pictures.
            */}
            <Group title="Photographs" note="These are what a member sees first. The first one leads the listing.">
              <Field label="Property photos" required error={errors.propertyPhotos} hint="Exterior, lobby, reception, restaurant, swimming pool, facilities, other areas" wide>
                <ImagesField
                  label="Property photo"
                  value={propertyPhotos}
                  onChange={setPropertyPhotos}
                  upload={sendFile}
                />
              </Field>
              <Field
                label={`${kind.unit} photos`}
                hint={kind.nightly ? 'Room, bathroom, view, amenities' : 'Whatever a member would want to see before booking'}
                wide
              >
                <ImagesField
                  label={`${kind.unit} photo`}
                  value={roomPhotos}
                  onChange={setRoomPhotos}
                  upload={sendFile}
                />
              </Field>
            </Group>
          </>
        )}

        {/* -- Step 3 -------------------------------------------------------- */}
        {step === 3 && (
          <>
            <Group title="Popular amenities"><Checks options={ticks.popular} value={amenities} onChange={setAmenities} /></Group>
            <Group title="Facilities"><Checks options={ticks.facilities} value={facilities} onChange={setFacilities} /></Group>
            <Group title="Rules" note="Tick the ones that apply.">
              <Checks options={ticks.rules} value={rules} onChange={setRules} />
            </Group>

            {/*
              What the website prints beyond the basics. Every field here
              draws a section of the listing page; leave one empty and the
              page simply does without that section.
            */}
            <Group title="How the place reads" note="The line under the name, and the one on the card.">
              <Field label="Service line" hint="Under the name on the card — e.g. Spa & Wellness">
                <input {...det('tag')} placeholder={kind.nightly ? 'Beach Resort' : 'Spa & Wellness'} />
              </Field>
              <Field label="Opening hours" hint="e.g. 10:00 AM - 8:00 PM"><input {...det('hours')} /></Field>
              <Field label="Rating out of 5" hint="The desk's, not the partner's to claim.">
                <input {...det('rating')} type="number" min="0" max="5" step="0.1" />
              </Field>
              <Field label="Number of reviews"><input {...det('reviews')} type="number" min="0" /></Field>
              <Field
                label={kind.nightly ? 'Layout' : 'What a booking is'}
                hint={kind.nightly ? 'e.g. Entire 3-Bedroom Villa' : 'e.g. Table for four, 60-minute treatment'}
              >
                <input {...det('layout')} placeholder={kind.nightly ? 'Entire 3-Bedroom Villa' : 'Table for four'} />
              </Field>
              <Field label="One line that sells it" wide hint="Shown on the card, under the price.">
                <textarea {...det('highlight')} rows={2} placeholder="A private pool, a game room, a sea view and a kitchen of your own." />
              </Field>
              <Field label="Small print on the card" wide hint="One per line — e.g. Breakfast available at extra charges.">
                <textarea className="input" rows={2} value={linesOf('notes')} onChange={(e) => setLines('notes', e.target.value)} />
              </Field>
              <Field label="Taxes and fees (₹)" hint="Shown beside the price, per night.">
                <input {...det('taxes')} type="number" min="0" />
              </Field>
              <Field label="Free cancellation">
                <select
                  className="input"
                  value={details.freeCancellation ? 'Yes' : 'No'}
                  onChange={(e) => setDetails({ ...details, freeCancellation: e.target.value === 'Yes' })}
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </Field>
            </Group>

            {kind.nightly && (
              <Group title="The unit itself" note="The row of figures under the name.">
                <Field label="Bedrooms"><input {...det('bedrooms')} type="number" min="0" /></Field>
                <Field label="Beds" hint="e.g. 3 Double beds"><input {...det('beds')} /></Field>
                <Field label="Bathrooms"><input {...det('baths')} type="number" min="0" /></Field>
                <Field label="Sleeps"><input {...det('sleeps')} type="number" min="0" /></Field>
                <Field label="Extra guests at cost"><input {...det('extraGuests')} type="number" min="0" /></Field>
                <Field label="Unit type" hint="e.g. Single Unit"><input {...det('unitType')} /></Field>
              </Group>
            )}

            <Group title="Who hosts it" note="The Hosted By card.">
              <Field label="Hosted by"><input {...host('title')} placeholder="Hosted By Smira Stays" /></Field>
              <Field label="Languages spoken"><input {...host('speaks')} placeholder="Speaks Hindi, English, Marathi" /></Field>
              <Field label="A word from the host" wide>
                <textarea {...host('blurb')} rows={2} />
              </Field>
            </Group>

            {/* -- What is nearby ------------------------------------- */}
            <Group title="What's nearby" note="Shown under the map, with the distance.">
              <div className="sm:col-span-2">
                {rowsOf('nearby').map((row, i) => (
                  <div key={i} className="mb-2 flex flex-wrap items-center gap-2">
                    <input
                      className="input flex-1"
                      value={row.place || ''}
                      onChange={(e) => setRow('nearby', i, { place: e.target.value })}
                      placeholder="Baga Beach"
                    />
                    <input
                      className="input w-28"
                      value={row.km || ''}
                      onChange={(e) => setRow('nearby', i, { km: e.target.value })}
                      placeholder="1.2 km"
                    />
                    <button
                      type="button"
                      onClick={() => setRows('nearby', rowsOf('nearby').filter((_, n2) => n2 !== i))}
                      className="icon-btn-danger h-9 w-9"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-line btn-sm" onClick={() => setRows('nearby', [...rowsOf('nearby'), { place: '', km: '' }])}>
                  <Plus size={14} /> Add a place
                </button>
              </div>
            </Group>

            {/* -- The layout ----------------------------------------- */}
            {kind.nightly && (
              <Group title="Property layout" note="Each room of the property, with its own photographs.">
                <div className="sm:col-span-2 space-y-3">
                  {rowsOf('spaces').map((row, i) => (
                    <section key={i} className="rounded-2xl border border-ink-900/[0.07] p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold text-ink-900">Space {i + 1}</h4>
                        <button
                          type="button"
                          onClick={() => setRows('spaces', rowsOf('spaces').filter((_, n2) => n2 !== i))}
                          className="icon-btn-danger h-8 w-8"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <Field label="Name"><input className="input" value={row.name || ''} onChange={(e) => setRow('spaces', i, { name: e.target.value })} placeholder="Bedroom 1" /></Field>
                        <Field label="Floor"><input className="input" value={row.floor || ''} onChange={(e) => setRow('spaces', i, { floor: e.target.value })} placeholder="Ground Floor" /></Field>
                        <Field label="Private or shared"><input className="input" value={row.tag || ''} onChange={(e) => setRow('spaces', i, { tag: e.target.value })} placeholder="Private" /></Field>
                        <Field label="What is in it" wide hint="One per line — e.g. 1 double bed, extra mattress available">
                          <textarea
                            className="input"
                            rows={2}
                            value={(row.lines || []).join('\n')}
                            onChange={(e) => setRow('spaces', i, { lines: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })}
                          />
                        </Field>
                        <Field label="Photographs" wide>
                          <ImagesField
                            label={row.name || `Space ${i + 1}`}
                            value={row.images || []}
                            onChange={(images) => setRow('spaces', i, { images })}
                            upload={sendFile}
                          />
                        </Field>
                      </div>
                    </section>
                  ))}
                  <button type="button" className="btn-line btn-sm" onClick={() => setRows('spaces', [...rowsOf('spaces'), { name: '', floor: '', tag: 'Private', images: [], lines: [] }])}>
                    <Plus size={14} /> Add a space
                  </button>
                </div>
              </Group>
            )}

            <Group title="What's included" note="One per line — what the price covers.">
              <Field label="Included" wide>
                <textarea className="input" rows={3} value={linesOf('included')} onChange={(e) => setLines('included', e.target.value)} placeholder={'Breakfast for two\nAirport pickup'} />
              </Field>
            </Group>

            {/* -- The rules and guidelines, in full ------------------- */}
            <Group title="Rules, in full" note="The Property Rules section. A heading and the rule under it.">
              <div className="sm:col-span-2">
                {rowsOf('ruleNotes').map((row, i) => (
                  <div key={i} className="mb-2 flex flex-wrap items-start gap-2">
                    <input className="input w-56" value={row.title || ''} onChange={(e) => setRow('ruleNotes', i, { title: e.target.value })} placeholder="Couple / Bachelor rules" />
                    <input className="input flex-1" value={row.body || ''} onChange={(e) => setRow('ruleNotes', i, { body: e.target.value })} placeholder="Unmarried couples allowed." />
                    <button type="button" onClick={() => setRows('ruleNotes', rowsOf('ruleNotes').filter((_, n2) => n2 !== i))} className="icon-btn-danger h-9 w-9" title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-line btn-sm" onClick={() => setRows('ruleNotes', [...rowsOf('ruleNotes'), { title: '', body: '' }])}>
                  <Plus size={14} /> Add a rule
                </button>
              </div>
            </Group>

            <Group title="Guidelines" note="The Stay Guidelines section — a heading and its lines.">
              <div className="sm:col-span-2">
                {rowsOf('guidelines').map((row, i) => (
                  <div key={i} className="mb-3 rounded-2xl border border-ink-900/[0.07] p-3">
                    <div className="flex items-center gap-2">
                      <input className="input flex-1" value={row.title || ''} onChange={(e) => setRow('guidelines', i, { title: e.target.value })} placeholder="Guest policy" />
                      <button type="button" onClick={() => setRows('guidelines', rowsOf('guidelines').filter((_, n2) => n2 !== i))} className="icon-btn-danger h-9 w-9" title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <textarea
                      className="input mt-2"
                      rows={2}
                      value={(row.lines || []).join('\n')}
                      onChange={(e) => setRow('guidelines', i, { lines: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })}
                      placeholder={'Valid ID is required at check-in.\nChildren must be accompanied by an adult.'}
                    />
                  </div>
                ))}
                <button type="button" className="btn-line btn-sm" onClick={() => setRows('guidelines', [...rowsOf('guidelines'), { title: '', lines: [] }])}>
                  <Plus size={14} /> Add a guideline
                </button>
              </div>
            </Group>
          </>
        )}

        {/* -- Step 4 -------------------------------------------------------- */}
        {step === 4 && (
          <>
            <Group title={`${kind.unit} pricing`} note={kind.priceNote || `Per ${kind.unit.toLowerCase()} per night, in rupees.`}>
              <Field label="Standard tariff" required error={errors.standardTariff}><input {...pri('standardTariff')} type="number" min="0" /></Field>
              <Field label="Smira partner rate" required error={errors.partnerRate} hint="What Smira pays you"><input {...pri('partnerRate')} type="number" min="0" /></Field>
              <Field label="Weekday rate" required error={errors.weekdayRate}><input {...pri('weekdayRate')} type="number" min="0" /></Field>
              <Field label="Weekend rate" required error={errors.weekendRate}><input {...pri('weekendRate')} type="number" min="0" /></Field>
              <Field label={kind.nightly ? 'Extra adult rate' : 'Extra person rate'} required error={errors.extraAdultRate}><input {...pri('extraAdultRate')} type="number" min="0" /></Field>
              <Field label="Child rate" required error={errors.childRate}><input {...pri('childRate')} type="number" min="0" /></Field>
            </Group>

            {kind.meals && (
              <Group title="Meal plan">
                <Checks options={MEAL_PLANS} value={pricing.mealPlans} onChange={(v) => setPricing({ ...pricing, mealPlans: v })} />
              </Group>
            )}

            <Group title="Inventory and calendar">
              <Field label={`Total ${kind.units.toLowerCase()}`}><input {...inv('totalRooms')} type="number" min="0" /></Field>
              <Field label={`Available ${kind.units.toLowerCase()}`} required error={errors.availableRooms}><input {...inv('availableRooms')} type="number" min="0" /></Field>
              <Field label="Closed dates" required error={errors.closedDates} hint="e.g. 24–26 Dec"><input {...inv('closedDates')} /></Field>
              <Field label="Blackout dates" required error={errors.blackoutDates}><input {...inv('blackoutDates')} /></Field>
            </Group>

            <Group title="Policies">
              {kind.times !== 'none' && (
                <>
                  <Field label={kind.times === 'stay' ? 'Check-in time' : 'Opens at'}>
                    <input {...pol('checkIn')} type="time" />
                  </Field>
                  <Field label={kind.times === 'stay' ? 'Check-out time' : 'Closes at'} required error={errors.checkOut}>
                    <input {...pol('checkOut')} type="time" />
                  </Field>
                </>
              )}
              <Field label="Free cancellation until" required error={errors.freeCancellationUntil} hint={kind.times === 'stay' ? 'e.g. 48 hours before check-in' : 'e.g. 24 hours before the booking'}><input {...pol('freeCancellationUntil')} /></Field>
              <Field label="Cancellation charge" required error={errors.cancellationCharge}><input {...pol('cancellationCharge')} placeholder={kind.nightly ? 'One night' : 'Half the booking'} /></Field>
              <Field label="No-show policy" required error={errors.noShowPolicy} wide><input {...pol('noShowPolicy')} /></Field>
            </Group>
          </>
        )}

        {/* -- Step 5 -------------------------------------------------------- */}
        {step === 5 && (
          <>
            <Group title="Ownership">
              <Field label="Ownership type" required error={errors.ownershipType} wide>
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

            <Group title="Documents" note="A scan or a photograph of each — PDF, JPG or PNG.">
              <Field label="Property registration / ownership proof" wide>
                <FileField
                  label="Ownership proof"
                  value={ownership.documentLinks.ownershipProof}
                  upload={sendFile}
                  onChange={(url) => setOwnership({ ...ownership, documentLinks: { ...ownership.documentLinks, ownershipProof: url } })}
                />
              </Field>
              <Field label="Lease agreement" hint="If applicable">
                <FileField
                  label="Lease agreement"
                  value={ownership.documentLinks.leaseAgreement}
                  upload={sendFile}
                  onChange={(url) => setOwnership({ ...ownership, documentLinks: { ...ownership.documentLinks, leaseAgreement: url } })}
                />
              </Field>
              <Field label="Relationship / authorisation document" hint="If applicable">
                <FileField
                  label="Authorisation"
                  value={ownership.documentLinks.authorisation}
                  upload={sendFile}
                  onChange={(url) => setOwnership({ ...ownership, documentLinks: { ...ownership.documentLinks, authorisation: url } })}
                />
              </Field>
              <Field label="PAN" required error={errors.pan}><input {...own('pan')} className="input uppercase" /></Field>
              <Field label="GST" required error={errors.gst}><input {...own('gst')} className="input uppercase" /></Field>
              <Field label="TAN" required error={errors.tan} hint="If applicable"><input {...own('tan')} className="input uppercase" /></Field>
            </Group>

            {/*
              Two ways to be paid, asked as two things. A bank transfer
              needs an account, an IFSC and a proof; a UPI payout needs a
              handle. They were one block, so a partner who only takes UPI
              left four boxes empty and the desk could not tell "not filled
              in" from "does not apply".
            */}
            <Group title="Account information" note="Where Smira settles your payouts by bank transfer.">
              <Field label="Account holder name" required error={errors.holder}><input {...bnk('holder')} /></Field>
              <Field label="Bank name" required error={errors.bankName}><input {...bnk('bankName')} /></Field>
              <Field label="Account number" required error={errors.accountNumber}><input {...bnk('accountNumber')} inputMode="numeric" autoComplete="off" /></Field>
              <Field label="IFSC" required error={errors.ifsc}><input {...bnk('ifsc')} className="input uppercase" /></Field>
              <Field label="Branch" required error={errors.branch}><input {...bnk('branch')} /></Field>
              <Field label="Cancelled cheque / bank proof">
                <FileField
                  label="Bank proof"
                  value={bank.proofLink}
                  upload={sendFile}
                  onChange={(url) => setBank({ ...bank, proofLink: url })}
                />
              </Field>
            </Group>

            <Group title="UPI" note="Quicker for small settlements. Either this or the account above, or both.">
              <Field label="UPI ID" required error={errors.upiId} hint="e.g. yourname@okhdfcbank">
                <input {...bnk('upiId')} autoComplete="off" spellCheck={false} />
              </Field>
              <Field label="Name on the UPI account" required error={errors.upiName}><input {...bnk('upiName')} /></Field>
              <Field label="How you would rather be paid">
                <select {...bnk('preferred')}>
                  <option value="">No preference</option>
                  <option>Bank transfer</option>
                  <option>UPI</option>
                </select>
              </Field>
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
