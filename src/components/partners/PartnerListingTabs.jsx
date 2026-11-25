import { useState } from 'react';
import { ExternalLink, FileText, ImageOff } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { inr } from '../../data/mockData.js';

/**
 * The partner's own listing — what they filled in on the five-step form —
 * laid out tab by tab on the partner's profile. The tabs used to show a few
 * summary fields that a partner added through the form never had, so they
 * opened empty.
 */

const isWeb = (u) => /^https?:\/\//i.test(String(u || '').trim());
const has = (v) => !(v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length));
const money = (v) => (Number(v) > 0 ? inr(Number(v)) : '');

function Section({ title, children, empty }) {
  return (
    <section className="rounded-xl border border-ink-900/[0.07] bg-white p-4">
      <p className="eyebrow mb-2">{title}</p>
      {children || <p className="text-sm text-ink-400">{empty || 'Not filled in yet.'}</p>}
    </section>
  );
}

/** Label / value rows; rows without a value are left out. */
function Rows({ rows }) {
  const shown = rows.filter(([, v]) => has(v));
  if (!shown.length) return null;
  return (
    <dl>
      {shown.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 border-b border-ink-900/[0.05] py-1.5 text-sm last:border-0">
          <dt className="shrink-0 text-ink-500">{label}</dt>
          <dd className="text-right font-semibold text-ink-900">{Array.isArray(value) ? value.join(', ') : value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Chips({ items }) {
  if (!has(items)) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x) => (
        <span key={x} className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-semibold text-ink-700">{x}</span>
      ))}
    </div>
  );
}

/** A grid of photographs, each opening full size in a new tab. */
function Photos({ urls }) {
  const list = (urls || []).filter(isWeb);
  if (!list.length) return null;
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {list.map((u, i) => (
        <li key={u}>
          <a href={u} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-ink-900/10">
            <img src={u} alt={`Photo ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** One uploaded paper: a thumbnail when it is a picture, a file card when it is a PDF. */
function Paper({ label, url }) {
  const [notImage, setNotImage] = useState(false);
  if (!url) {
    return (
      <li className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-ink-900/15 px-3 py-2.5">
        <span className="text-sm text-ink-600">{label}</span>
        <Badge tone="rose">Missing</Badge>
      </li>
    );
  }
  if (!isWeb(url)) {
    return (
      <li className="rounded-lg border border-ink-900/10 px-3 py-2.5 text-sm">
        <span className="text-ink-600">{label}</span>
        <p className="break-all text-xs text-ink-400">{url} (not a web link)</p>
      </li>
    );
  }
  return (
    <li className="overflow-hidden rounded-lg border border-ink-900/10">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {notImage ? (
          <span className="grid aspect-[4/3] place-items-center bg-surface-soft text-ink-400"><FileText size={28} /></span>
        ) : (
          <img src={url} alt={label} loading="lazy" onError={() => setNotImage(true)} className="aspect-[4/3] w-full bg-surface-soft object-cover" />
        )}
        <span className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-ink-800">
          {label} <ExternalLink size={13} className="shrink-0 text-brand-700" />
        </span>
      </a>
    </li>
  );
}

/* -- The tabs ------------------------------------------------------------ */

export function DetailsTab({ p }) {
  const l = p.listing || {};
  const a = l.account || {};
  const pr = l.property || {};
  const lo = l.location || {};
  const d = l.details || {};
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Section title="Property">
        <Rows rows={[
          ['Type', pr.type || p.category], ['Name', pr.name || p.name], ['Star category', pr.starCategory],
          ['Selling from', pr.bookingStartDate], ['Approval', p.approval], ['Stage', p.stage],
        ]} />
        {pr.description && <p className="mt-2 whitespace-pre-line rounded-lg bg-surface-soft p-2.5 text-sm text-ink-700">{pr.description}</p>}
      </Section>
      <Section title="Contact">
        <Rows rows={[
          ['Owner / account', a.fullName], ['Account type', a.accountType], ['Email', a.email || p.email],
          ['Alternate number', a.alternatePhone], ['Property contact', pr.contactName],
          ['Property phone', pr.contactPhone || p.phone], ['Property email', pr.contactEmail],
        ]} />
      </Section>
      <Section title="Location">
        <Rows rows={[
          ['Address', [lo.line1, lo.line2].filter(Boolean).join(', ')], ['Landmark', lo.landmark],
          ['City', lo.city], ['State', lo.state], ['PIN', lo.pin], ['Country', lo.country],
          ['Coordinates', lo.latitude && lo.longitude ? `${lo.latitude}, ${lo.longitude}` : ''],
        ]} />
        {isWeb(lo.mapsUrl) && (
          <a href={lo.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
            Open in Google Maps <ExternalLink size={13} />
          </a>
        )}
      </Section>
      <Section title="Amenities, facilities and rules">
        {has(l.amenities) || has(l.facilities) || has(l.rules) ? (
          <div className="space-y-3">
            {has(l.amenities) && <div><p className="mb-1 text-xs font-bold text-ink-500">Amenities</p><Chips items={l.amenities} /></div>}
            {has(l.facilities) && <div><p className="mb-1 text-xs font-bold text-ink-500">Facilities</p><Chips items={l.facilities} /></div>}
            {has(l.rules) && <div><p className="mb-1 text-xs font-bold text-ink-500">House rules</p><Chips items={l.rules} /></div>}
          </div>
        ) : null}
      </Section>
      {(has(d.layout) || has(d.bedrooms) || has(d.highlight) || has(d.host?.title)) && (
        <Section title="More about the place">
          <Rows rows={[
            ['Layout', d.layout], ['Bedrooms', d.bedrooms], ['Beds', d.beds], ['Bathrooms', d.baths],
            ['Sleeps', d.sleeps], ['Highlight', d.highlight], ['Host', d.host?.title], ['Host speaks', d.host?.speaks],
          ]} />
        </Section>
      )}
    </div>
  );
}

export function DocumentsTab({ p, actions }) {
  const l = p.listing || {};
  const ow = l.ownership || {};
  const dl = ow.documentLinks || {};
  const b = l.bank || {};
  return (
    <div className="space-y-3">
      <Section title="Uploaded papers">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Paper label="Ownership proof" url={dl.ownershipProof} />
          <Paper label="Lease agreement" url={dl.leaseAgreement} />
          <Paper label="Authorisation" url={dl.authorisation} />
          <Paper label="Bank proof" url={b.proofLink} />
        </ul>
      </Section>
      <div className="grid gap-3 lg:grid-cols-2">
        <Section title="Ownership and tax">
          <Rows rows={[
            ['Ownership', ow.type], ['PAN', ow.pan || p.pan], ['GST', ow.gst || p.gst], ['TAN', ow.tan],
            ['Agreement', l.agreementAccepted ? 'Accepted' : 'Not accepted'],
          ]} />
        </Section>
        <Section title="Payout">
          <Rows rows={[
            ['Account holder', b.holder], ['Bank', [b.bankName, b.branch].filter(Boolean).join(', ')],
            ['Account number', b.accountNumber], ['IFSC', b.ifsc], ['UPI', b.upiId],
            ['Name on UPI', b.upiName], ['Prefers', b.preferred],
          ]} />
        </Section>
      </div>
      {(p.documents || []).length > 0 && (
        <Section title="Checklist">
          <ul className="divide-y divide-ink-900/[0.07]">
            {p.documents.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-2.5 text-sm text-ink-700"><FileText size={14} className="shrink-0 text-ink-400" /> {d.name}</span>
                <span className="flex items-center gap-2">
                  <Badge tone={{ Verified: 'green', Submitted: 'sky', Pending: 'amber', Missing: 'rose', Expired: 'rose' }[d.status] || 'slate'}>{d.status}</Badge>
                  <button className="btn-line btn-sm" onClick={() => actions.requestDocs(p, d.name)}>Request</button>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export function InventoryTab({ p, inFlight }) {
  const l = p.listing || {};
  const inv = l.inventory || {};
  const rooms = l.rooms || [];
  const total = Number(inv.totalRooms) || rooms.reduce((s, r) => s + (Number(r.count) || 0), 0) || p.rooms || 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[['Total', total || '—'], ['Available to sell', has(inv.availableRooms) ? inv.availableRooms : '—'], ['Booked through us', p.bookings], ['Requests in flight', inFlight]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-ink-900/[0.07] bg-white p-3">
            <p className="text-xs text-ink-500">{k}</p>
            <p className="num mt-0.5 text-lg font-extrabold text-ink-900">{v}</p>
          </div>
        ))}
      </div>
      <Section title="Rooms / units" empty="No rooms added.">
        {rooms.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {rooms.map((r, i) => (
              <li key={`${r.name}-${i}`} className="rounded-lg border border-ink-900/[0.07] p-3 text-sm">
                <p className="font-bold text-ink-900">{r.name} <span className="font-semibold text-ink-500">· {r.count || 0}</span></p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {[r.type, r.size, r.bedType, r.adults && `${r.adults} adults`, has(r.children) && `${r.children} children`,
                    r.maxOccupancy && `max ${r.maxOccupancy}`, r.extraBed && 'extra bed possible'].filter(Boolean).join(' · ')}
                </p>
                {r.amenities && <p className="mt-1 text-xs text-ink-600">{r.amenities}</p>}
                {r.description && <p className="mt-1 text-xs text-ink-500">{r.description}</p>}
              </li>
            ))}
          </ul>
        ) : null}
      </Section>
      <Section title="Property photos" empty="No photos yet."><Photos urls={l.photos?.property} /></Section>
      <Section title="Room photos" empty="No photos yet."><Photos urls={l.photos?.rooms} /></Section>
    </div>
  );
}

export function RatesTab({ p }) {
  const l = p.listing || {};
  const pc = l.pricing || {};
  const po = l.policies || {};
  const cal = (l.calendar || []).filter((c) => c.rate || c.closed).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const anyRate = ['standardTariff', 'partnerRate', 'weekdayRate', 'weekendRate'].some((k) => Number(pc[k]) > 0);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <Section title="Rates" empty={p.ratePlan || 'No rates filled in yet.'}>
          {anyRate ? (
            <Rows rows={[
              ['Standard tariff', money(pc.standardTariff)], ['Smira partner rate', money(pc.partnerRate)],
              ['Weekday rate', money(pc.weekdayRate)], ['Weekend rate', money(pc.weekendRate)],
              ['Extra adult', money(pc.extraAdultRate)], ['Child', money(pc.childRate)],
              ['Veg meals (per person/day)', money(pc.vegMealRate)], ['Non-veg meals (per person/day)', money(pc.nonVegMealRate)],
              ['Commission', p.commission ? `${p.commission}%` : ''],
            ]} />
          ) : null}
          {has(pc.mealPlans) && <div className="mt-2"><p className="mb-1 text-xs font-bold text-ink-500">Meal plans</p><Chips items={pc.mealPlans} /></div>}
        </Section>
        <Section title="Policies">
          {Object.values(po).some(has) ? (
            <Rows rows={[
              ['Check-in', po.checkIn], ['Check-out', po.checkOut], ['Free cancellation', po.freeCancellationUntil],
              ['Cancellation charge', po.cancellationCharge], ['No-show', po.noShowPolicy],
            ]} />
          ) : null}
        </Section>
      </div>
      <Section title="Dates with a different rate" empty="None — every night at the standard tariff.">
        {cal.length ? (
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {cal.map((c) => (
              <li key={c.date} className={`rounded-lg px-2.5 py-1.5 text-xs ${c.closed ? 'bg-rose-50 text-rose-700' : 'bg-surface-soft text-ink-700'}`}>
                <span className="num font-bold">{c.date}</span> · {c.closed ? 'Closed' : money(c.rate)}
              </li>
            ))}
          </ul>
        ) : null}
      </Section>
    </div>
  );
}

export function AvailabilityTab({ p, inFlight }) {
  const l = p.listing || {};
  const inv = l.inventory || {};
  const closed = (l.calendar || []).filter((c) => c.closed).map((c) => c.date).sort();
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Section title="Availability">
        <Rows rows={[
          ['Total', inv.totalRooms || p.rooms], ['Available to sell', inv.availableRooms],
          ['Requests in flight', inFlight], ['Selling from', l.property?.bookingStartDate],
        ]} />
      </Section>
      <Section title="Closed and blackout dates" empty="None given.">
        {has(inv.closedDates) || has(inv.blackoutDates) || closed.length ? (
          <Rows rows={[['Closed dates', inv.closedDates], ['Blackout dates', inv.blackoutDates], ['Closed on the calendar', closed]]} />
        ) : null}
      </Section>
      {!Object.keys(l).length && (
        <p className="flex items-center gap-2 text-sm text-ink-400 lg:col-span-2"><ImageOff size={14} /> This partner has not filled in the listing form.</p>
      )}
    </div>
  );
}
